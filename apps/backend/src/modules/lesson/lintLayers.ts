import { TRACKS, type LessonCore, type LessonLocalePack, type SceneSet } from "@arna/contracts";
import { isEnglishText, lintMustUse, type LintReport } from "./lint.js";

/**
 * v7 katman lint'leri — LLM'siz, deterministik, bedava.
 *
 * Katman ayrımı lint'i de netleştirir: ASCII denetimi ÇEKİRDEKTE artık sezgi
 * değil DEĞİŞMEZDİR (çekirdekte ana dil alanı yoktur), dil paketinde ise
 * ANLAMSIZDIR (Rusça da, Arapça da ASCII değildir — Endonezce ise ASCII'dir;
 * testin iki yönü de yanlış çalışır). Dil paketinde yapı denetlenir, karakter değil.
 */

export interface LayerLintContext {
  /** İçerikte geçmemesi gereken kullanıcıya özel değerler (gizlilik) */
  forbidden: string[];
}

function walkStrings(value: unknown, path: string, out: Array<[string, string]>): void {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walkStrings(v, path ? `${path}.${k}` : k, out);
  }
}

function scanForbidden(blob: string, forbidden: string[], errors: string[], layer: string): void {
  const haystack = blob.toLowerCase();
  for (const value of forbidden) {
    const needle = value.trim().toLowerCase();
    if (needle.length >= 3 && haystack.includes(needle)) {
      errors.push(`${layer}: kullanıcıya özel değer ("${value}") sızmış — içerik paylaşımlı`);
    }
  }
}

// ---------------------------------------------------------------------------
// ÇEKİRDEK
// ---------------------------------------------------------------------------

export function lintCore(core: LessonCore, ctx: LayerLintContext): LintReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ASCII DEĞİŞMEZİ: çekirdekte ana dil alanı yok → tek bir non-ASCII harf sızıntıdır
  const strings: Array<[string, string]> = [];
  walkStrings(core, "", strings);
  for (const [path, value] of strings) {
    if (!isEnglishText(value)) {
      errors.push(`core.${path}: İngilizce (ASCII) olmalı — "${value.slice(0, 60)}"`);
    }
  }

  const beats = core.lecture.beats;
  const ids = beats.map((b) => b.id);
  if (new Set(ids).size !== ids.length) errors.push("Beat id'leri benzersiz değil");

  // Yapısal sıra: readiness ask → teach → questions ask → say → exercises
  const first = beats[0];
  if (!first || first.kind !== "ask" || first.purpose !== "readiness") {
    errors.push("İlk beat kind:'ask' purpose:'readiness' olmalı");
  }
  if (!beats.some((b) => b.kind === "ask" && b.purpose === "questions")) {
    errors.push("purpose:'questions' olan bir 'ask' beat'i olmalı");
  }
  const teachBeats = beats.filter((b) => b.kind === "teach");
  if (teachBeats.length === 0) errors.push("'teach' beat'i zorunlu");

  // Öğretim noktaları: iddialar + örnek kimlikleri (dil paketinin referans hedefleri)
  const exampleIds = new Set<string>();
  const pointIds = new Set<string>();
  for (const t of teachBeats) {
    if (t.kind !== "teach") continue;
    for (const p of t.points) {
      if (pointIds.has(p.id)) errors.push(`teach point id "${p.id}" tekrar ediyor`);
      pointIds.add(p.id);
      for (const ex of p.examples) {
        if (exampleIds.has(ex.id)) errors.push(`örnek id "${ex.id}" tekrar ediyor`);
        exampleIds.add(ex.id);
        // Örnek TAM cümle olmalı — iddiaların kanıtı ekranda o
        if (ex.textEn.trim().split(/\s+/).length < 3) {
          warnings.push(`örnek "${ex.id}" çok kısa: "${ex.textEn}"`);
        }
      }
      // "Filler iddia" sezgisi: iddia bir şey SÖYLEMELİ
      for (const c of p.claimsEn) {
        if (/\b(very useful|important|great|fun)\b/i.test(c)) {
          warnings.push(`point "${p.id}": iddia dolgu gibi görünüyor — "${c.slice(0, 60)}"`);
        }
      }
      // formEn dil paketlerinin ADIYLA anacağı şey — tarif değil, kalıbın kendisi
      if (p.formEn.trim().split(/\s+/).length > 8) {
        warnings.push(`point "${p.id}": formEn uzun görünüyor (kalıbın kendisi olmalı) — "${p.formEn}"`);
      }
    }
  }

  // Alıştırmalar — format bazlı yapı kuralları
  const exercises = beats.filter((b) => b.kind === "exercise");
  if (exercises.length < 2) errors.push("En az 2 alıştırma olmalı");
  if (exercises.length > 3) warnings.push(`${exercises.length} alıştırma — 2-3 bekleniyordu`);

  for (const ex of exercises) {
    if (ex.kind !== "exercise") continue;
    const where = `exercise '${ex.id}'`;

    if (ex.format === "fill_blank") {
      const blanks = (ex.item.match(/___/g) ?? []).length;
      if (blanks !== 1) errors.push(`${where}: fill_blank tam olarak BİR ___ içermeli (${blanks} var)`);
      if (ex.answerSpec.kind !== "token") errors.push(`${where}: fill_blank answerSpec.kind 'token' olmalı`);
      if (ex.options?.length) errors.push(`${where}: fill_blank şık taşımaz`);
    }

    if (ex.format === "mcq") {
      if (!ex.options || ex.options.length < 2) {
        errors.push(`${where}: mcq için options zorunlu`);
      } else {
        if (ex.answerSpec.kind !== "choice") errors.push(`${where}: mcq answerSpec.kind 'choice' olmalı`);
        else if (ex.answerSpec.correctIndex >= ex.options.length) {
          errors.push(`${where}: correctIndex şık aralığının dışında`);
        } else if (ex.exampleAnswer.trim() !== ex.options[ex.answerSpec.correctIndex]!.trim()) {
          errors.push(`${where}: exampleAnswer doğru şıkkın BİREBİR kopyası olmalı`);
        }
        const norm = (s: string) => s.trim().toLowerCase();
        if (new Set(ex.options.map(norm)).size !== ex.options.length) {
          errors.push(`${where}: şıklar benzersiz olmalı`);
        }
        // Şıklar soru metnine gömülemez (ekranda/seste iki kez çıkar)
        const inlined = ex.options.filter((o) => ex.item.includes(o));
        if (inlined.length > 0) {
          errors.push(`${where}: şıklar item metnine gömülmüş (${inlined.length}) — soru item'da, şıklar YALNIZCA options'ta`);
        }
      }
    }

    if (ex.format === "say_sentence" && ex.answerSpec.kind !== "utterance") {
      errors.push(`${where}: say_sentence answerSpec.kind 'utterance' olmalı`);
    }
  }

  const openResponses = beats.filter((b) => b.kind === "open_response");
  if (openResponses.length > 1) errors.push("En fazla 1 open_response olmalı");
  for (const o of openResponses) {
    if (o.kind !== "open_response") continue;
    if (!o.rubric.criteria.trim()) errors.push(`open_response '${o.id}': rubric.criteria boş`);
  }

  // Alıştırmalar anlatımdan sonra
  const teachIdx = beats.findIndex((b) => b.kind === "teach");
  const firstExIdx = beats.findIndex((b) => b.kind === "exercise");
  if (teachIdx !== -1 && firstExIdx !== -1 && firstExIdx < teachIdx) {
    errors.push("Alıştırmalar teach beat'inden sonra gelmeli");
  }

  // Ölçüm spec'i — mustUse katalogdan kodla yazılır ama yine de denetlenir
  for (const m of core.practice.mustUse) lintMustUse(m, errors);
  if (core.practice.minTargetUses > core.practice.maxTurns) {
    errors.push("minTargetUses maxTurns'ten büyük olamaz");
  }

  // Quiz tutarlılığı
  for (const q of core.quiz ?? []) {
    if (q.type === "fill_blank") {
      const blanks = (q.text.match(/___/g) ?? []).length;
      if (blanks !== q.answers.length) errors.push(`quiz '${q.id}': ${blanks} boşluk, ${q.answers.length} cevap`);
    }
  }

  scanForbidden(JSON.stringify(core), ctx.forbidden, errors, "core");
  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// SAHNE SETİ
// ---------------------------------------------------------------------------

export function lintScenes(set: SceneSet, ctx: LayerLintContext): LintReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 5 track'in TAMAMI — eksik track o bağlamı seçen herkesin dersini kilitler
  for (const track of TRACKS) {
    const s = set.scenes[track];
    if (!s) {
      errors.push(`"${track}" sahnesi eksik`);
      continue;
    }
    const where = `scene '${track}'`;
    const strings: Array<[string, string]> = [];
    walkStrings(s, "", strings);
    for (const [path, value] of strings) {
      if (!isEnglishText(value)) errors.push(`${where}.${path}: İngilizce (ASCII) olmalı`);
    }
    if (!/\?\s*$/.test(s.avatarOpening.trim())) {
      errors.push(`${where}: avatarOpening soruyla bitmeli — turu öğrenciye devrediyor`);
    }
    if (s.persona.name.trim().toLowerCase() === "emma") {
      errors.push(`${where}: persona 'Emma' olamaz — hocanın adı`);
    }
  }
  const extra = Object.keys(set.scenes).filter((k) => !(TRACKS as readonly string[]).includes(k));
  if (extra.length) errors.push(`Bilinmeyen track anahtarları: ${extra.join(", ")}`);

  // Beş sahnede aynı persona adı — tembel üretim sinyali
  const names = TRACKS.map((t) => set.scenes[t]?.persona.name).filter(Boolean);
  if (new Set(names).size === 1 && names.length === TRACKS.length) {
    warnings.push("Beş sahnenin persona adı aynı — çeşitlilik bekleniyordu");
  }

  scanForbidden(JSON.stringify(set), ctx.forbidden, errors, "scenes");
  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// DİL PAKETİ — yapı denetlenir, karakter DEĞİL (ASCII burada anlamsız)
// ---------------------------------------------------------------------------

/**
 * "Model İngilizce mi cevapladı?" — tek sağlam negatif test (İngilizce'nin sabit
 * bir cevap kümesi var; "Türkçe mi" diye sormak 100 cevap kümesi isterdi).
 *
 * İKİ koşul birden aranır (dikey dilim dersinden):
 * 1. Latin harf payı yüksek — Arapça/Çince metinde meşru İngilizce gramer
 *    terimleri ("he", "it") tek başına stopword oranını şişiriyordu çünkü
 *    payda yalnızca Latin token'lardı. Metnin kendisi Latin değilse İngilizce olamaz.
 * 2. Stopword oranı yüksek — Latin yazılı ama İngilizce olmayan diller
 *    (Endonezce, Türkçe) "the/and/is" kullanmaz.
 */
const EN_STOPWORDS = new Set([
  "the", "and", "is", "are", "you", "to", "of", "for", "with", "that", "this", "it", "in", "we", "use",
]);
function looksEnglish(text: string): { english: boolean; detail: string } {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < 40) return { english: false, detail: "kısa" };
  const latin = letters.filter((c) => /[a-z]/i.test(c)).length;
  const latinShare = latin / letters.length;

  const latinTokens = text.toLowerCase().split(/[^a-z']+/).filter(Boolean);
  const hits = latinTokens.filter((t) => EN_STOPWORDS.has(t)).length;
  const stopRatio = latinTokens.length >= 8 ? hits / latinTokens.length : 0;

  return {
    english: latinShare > 0.6 && stopRatio > 0.15,
    detail: `latin %${(latinShare * 100).toFixed(0)}, stopword %${(stopRatio * 100).toFixed(0)}`,
  };
}

export function lintLocale(
  pack: LessonLocalePack,
  core: LessonCore,
  ctx: LayerLintContext & { language: string },
): LintReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Çekirdekteki referans hedefleri: örnek kimlikleri + nokta kimlikleri (formEn)
  const pointIds = new Set<string>();
  const exampleIdsByPoint = new Map<string, string[]>();
  const allRefIds = new Set<string>();
  for (const b of core.lecture.beats) {
    if (b.kind !== "teach") continue;
    for (const p of b.points) {
      pointIds.add(p.id);
      allRefIds.add(p.id); // formEn referansı
      exampleIdsByPoint.set(p.id, p.examples.map((e) => e.id));
      for (const e of p.examples) allRefIds.add(e.id);
    }
  }

  // 1. KAPSAMA: her öğretim noktasına açıklama, fazladan anahtar yok
  for (const id of pointIds) {
    if (!pack.teachPoints[id]) errors.push(`teachPoints["${id}"] eksik — her nokta anlatılmalı`);
  }
  for (const id of Object.keys(pack.teachPoints)) {
    if (!pointIds.has(id)) errors.push(`teachPoints["${id}"] çekirdekte yok — uydurma anahtar`);
  }

  // 2. REFERANS BÜTÜNLÜĞÜ: her core_ref çekirdekte var; her noktanın en az bir örneğine atıf var
  for (const [pid, tp] of Object.entries(pack.teachPoints)) {
    const refs = tp.runs.filter((r) => r.kind === "core_ref").map((r) => (r.kind === "core_ref" ? r.refId : ""));
    for (const refId of refs) {
      if (!allRefIds.has(refId)) errors.push(`teachPoints["${pid}"]: core_ref "${refId}" çekirdekte yok`);
    }
    const own = exampleIdsByPoint.get(pid) ?? [];
    if (own.length && !refs.some((r) => own.includes(r))) {
      errors.push(`teachPoints["${pid}"]: noktanın hiçbir örneğine atıf yok — örneksiz anlatım`);
    }
    if (!tp.runs.some((r) => r.kind === "l1")) {
      errors.push(`teachPoints["${pid}"]: hiç ana-dil metni yok`);
    }
    // Yer tutucu sözdizimi yasak: parantezli metin ekranda görünür ve SESLİ okunur
    // (dikey dilim yakaladı: model "{...}" yazıp referansı metne gömmeye çalışıyor)
    for (const r of tp.runs) {
      if (r.kind === "l1" && /[{}[\]]/.test(r.text)) {
        errors.push(`teachPoints["${pid}"]: ana-dil metninde parantez/yer tutucu var — referans yalnızca ayrı dizi öğesi olabilir: "${r.text.slice(0, 50)}"`);
      }
    }
  }

  // 3. SAHNE KAPSAMA: 5 track'in tarifi
  for (const track of TRACKS) {
    if (!pack.scenes[track]) errors.push(`scenes["${track}"] eksik`);
  }

  // 4. QUIZ HİZASI: feedback uzunluğu şık sayısına eşit — kaymış feedback yanlış öğretir
  for (const q of core.quiz ?? []) {
    if (q.type !== "mcq") continue;
    const fb = pack.quizFeedback?.[q.id];
    if (fb && fb.length !== q.options.length) {
      errors.push(`quizFeedback["${q.id}"]: ${fb.length} geri bildirim, ${q.options.length} şık — hizasız`);
    }
  }

  // 5. İNGİLİZCE MALZEME, REFERANS MEKANİZMASI OLAN YERDE AYNEN YAZILMAZ.
  //
  //    Kapsam bilinçli olarak YALNIZ teachPoints.runs: orada core_ref var ve
  //    kopya gerçekten çift render eder (referans İngilizce'yi zaten basar).
  //    Düz metin alanlarında (title/theme/summary/scenes/quizFeedback) referans
  //    mekanizması YOKTUR ve kalıbı anmak meşru pedagojidir — "Bu derste
  //    'I want to' kalıbını öğrendin" cümlesi başka türlü yazılamaz. Eski kural
  //    tüm paketi tarıyordu ve kalıp-derslerinde (I want to, look it up) üretimi
  //    İMKÂNSIZ kılıyordu: 25/136 paket bu yüzden düştü, sızıntıların tamamı
  //    summary'deydi (alan bazlı teşhisle ölçüldü, Ağu 2026).
  //
  //    Koruma YALNIZ ÖRNEK CÜMLELER içindir, mustUse kalıpları DEĞİL: kalıbın
  //    ref hedefi formEn'dir ve formEn meta-gösterim taşıyabilir ("I wish I +
  //    past simple") — cümle ortasında ref, alıntıdan KÖTÜ render eder. Kalıp
  //    dersleri ("getting used to", "by the time") 3 retry turunda da bu yüzden
  //    düştü; kısa kalıbı anlatım içinde anmak her alanda serbest bırakıldı.
  //    Örnek cümlelerin ref'i ise temizdir (textEn birebir) ve kopya gerçekten
  //    çift gösterir — koruma onlarda sürüyor.
  const l1Blob = JSON.stringify(pack).toLowerCase();
  const protectedTexts: string[] = core.lecture.beats.flatMap((b) =>
    b.kind === "teach" ? b.points.flatMap((p) => p.examples.map((e) => e.textEn)) : [],
  );
  const refFields: Array<[string, string]> = Object.entries(pack.teachPoints).flatMap(([pid, tp]) =>
    tp.runs.flatMap((r, i): Array<[string, string]> => (r.kind === "l1" ? [[`teachPoints["${pid}"].runs[${i}]`, r.text]] : [])),
  );
  for (const t of protectedTexts) {
    const needle = t.trim().toLowerCase();
    if (needle.split(/\s+/).length < 3) continue;
    for (const [field, value] of refFields) {
      if (value.toLowerCase().includes(needle)) {
        errors.push(`${field}: korunan İngilizce metin aynen yazılmış: "${t.slice(0, 50)}" — core_ref kullanılmalıydı`);
      }
    }
  }

  // 6. "İngilizce mi cevapladı?" — Latin payı + stopword oranı birlikte
  if (ctx.language !== "en") {
    const l1Texts = [
      pack.title, pack.theme, pack.summary,
      ...Object.values(pack.teachPoints).flatMap((tp) => tp.runs.filter((r) => r.kind === "l1").map((r) => (r.kind === "l1" ? r.text : ""))),
      ...Object.values(pack.scenes).flatMap((s) => [s.scenario, s.userGoal, s.personaRole]),
    ].join(" ");
    const verdict = looksEnglish(l1Texts);
    if (verdict.english) {
      errors.push(`Ana-dil metinleri İngilizce görünüyor (${verdict.detail}) — model hedef dilde yazmamış`);
    }
  }

  // 7. Hijyen: markdown kalıntısı sesli okunur
  if (/\*\*/.test(l1Blob)) errors.push("Pakette ** kalıntısı var — vurgu TextRun.emphasis ile yapılır");

  scanForbidden(JSON.stringify(pack), ctx.forbidden, errors, "locale");
  return { errors, warnings };
}
