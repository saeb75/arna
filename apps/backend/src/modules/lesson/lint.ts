import type { LessonContent } from "@arna/contracts";

export interface LintReport {
  errors: string[];
  warnings: string[];
}

export interface LintContext {
  /**
   * İÇERİKTE GEÇMEMESİ gereken kullanıcıya özel değerler (ad, meslek…).
   * İçerik artık kullanıcılar ARASINDA PAYLAŞILIYOR, yani buradaki bir sızıntı
   * tek kullanıcıyı değil o dersi açan herkesi ilgilendirir. Değerler yalnızca
   * yakalamak için veriliyor; üretime hiçbiri girmiyor.
   */
  forbidden: string[];
}

/**
 * `mustUse` girdileri öğrencinin AĞZINDAN ÇIKACAK kalıplar olmalı — gramer tarifi değil.
 *
 * Bu alan başarıyı METİN EŞLEŞMESİYLE ölçüyor. Tarif yazılınca ("Present Simple for
 * habits") hiç eşleşmiyor, ölçüm ölü kalıyor; kırıntı yazılınca ("do") her turda
 * eşleşip sahneyi erken kesiyordu. Dersin ne öğrettiğinin TARİFİ `tutorNotes.target`
 * ve `successCriteria`'da duruyor — burada yeri yok.
 */
const GRAMMAR_JARGON =
  /\b(simple|passive|participle|tense|verbs?|nouns?|adjectives?|adverbs?|structures?|forms?|clause|gerund|infinitive|conditional|modal|plural|singular)\b/i;

export function lintMustUse(entry: string, errors: string[]): void {
  const value = entry.trim();
  const words = value.split(/\s+/).length;

  // Tek kelime neredeyse her zaman bir işlev kelimesidir ("do", "was", "did") ve
  // her cümlede geçtiği için sahneyi iki turda kapatıyordu. En az iki kelime iste:
  // "I have never", "next week", "would you mind".
  if (words < 2) {
    errors.push(
      `practice.mustUse "${value}": tek kelime — neredeyse her cümlede geçer ve sahneyi erken kapatır. En az iki kelimelik bir kalıp yaz ("I have never")`,
    );
  }
  // "a formal greeting", "the past form" → söylenecek kalıp değil, TARİF.
  if (/^(a|an|the)\s/i.test(value)) {
    errors.push(
      `practice.mustUse "${value}": tanımlıkla başlıyor — bu bir tarif. Öğrencinin söyleyeceği kalıbı yaz`,
    );
  }
  // Not: "-ing ile başlayanı reddet" kuralı DENENDİ ve KALDIRILDI. "getting used to
  // working" gibi tamamen meşru parçaları da eliyordu ve üretimi komple düşürüyordu.
  // Maliyetler asimetrik: yanlış ret dersi üretilemez yapar, yanlış kabul ise artık
  // yalnızca sahnenin doğal uzunluğunda bitmesine yol açar (goalMet tetiklenmez).
  if (words > 5) {
    errors.push(`practice.mustUse "${value}": ${words} kelime — öğrencinin söyleyeceği KISA kalıp olmalı (en fazla 5)`);
  }
  if (GRAMMAR_JARGON.test(value)) {
    errors.push(
      `practice.mustUse "${value}": gramer terimi içeriyor — öğrencinin birebir söyleyeceği kalıbı yaz ("I think", "have you ever"). Tarif tutorNotes.target'a ait`,
    );
  }
  if (/[(/]|e\.g\./i.test(value)) {
    errors.push(`practice.mustUse "${value}": liste/örnek/parantez içeremez — tek bir söylenecek kalıp olmalı`);
  }
}

/** Niyet alanı bir talimattır, replik değil: tırnaklı cümle dayatması yakalanır. */
function lintIntent(label: string, intent: string, errors: string[]): void {
  if (!isEnglishText(intent)) {
    errors.push(`${label}: niyet İngilizce olmalı — "${intent.slice(0, 60)}"`);
  }
  if (/["“”]/.test(intent)) {
    errors.push(
      `${label}: niyet alanı hocanın söyleyeceği cümleyi TIRNAK İÇİNDE dayatamaz — ne yapılacağını tarif et`,
    );
  }
  if (intent.length > 180) {
    errors.push(`${label}: niyet çok uzun (${intent.length} karakter, en fazla 180)`);
  }
}

/**
 * Emma'nın SESLİ okuduğu metin İngilizce olmalı — hangi ana dil olursa olsun.
 * DİL-BAĞIMSIZ sezgi: İngilizce ASCII'dir. Aksanlı harf, Kiril, Arap, CJK vb.
 * karakter görünce ana dil sızmış demektir. (Tipografik tırnak/tire hoş görülür.)
 */
export function isEnglishText(s: string): boolean {
  const normalized = s.replace(/[’‘“”–—…]/g, "'");
  return !/[^\x00-\x7F]/.test(normalized);
}

/** Deterministik ders doğrulaması — LLM'siz, bedava. Hatalar onarım retry'ına beslenir. */
export function lintLesson(content: LessonContent, ctx: LintContext): LintReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const beats = content.lecture.beats;

  // Beat id'leri benzersiz
  const ids = beats.map((b) => b.id);
  if (new Set(ids).size !== ids.length) errors.push("Beat id'leri benzersiz değil");

  // KULLANICI VERİSİ SIZINTISI — en kritik kural, artık bir GİZLİLİK denetimi.
  // İçerik kullanıcılar arasında paylaşıldığı için buraya sızan bir ad ya da
  // meslek, dersi açan HERKESE servis edilir. (Çok kısa değerlerde yanlış pozitif
  // riski olduğu için 3 karakterden kısa olanlar aranmaz — çağıran taraf eler.)
  const haystack = JSON.stringify(content).toLowerCase();
  for (const value of ctx.forbidden) {
    const needle = value.trim().toLowerCase();
    if (needle.length >= 3 && haystack.includes(needle)) {
      errors.push(
        `Ders içeriğinde kullanıcıya özel bir değer ("${value}") geçiyor — içerik PAYLAŞIMLI, kişisel veri oturum script'inde eklenir`,
      );
    }
  }

  // Niyet alanları: talimat mı, replik mi?
  for (const b of beats) {
    if (b.kind === "say" || b.kind === "ask") lintIntent(`${b.kind} '${b.id}'`, b.intent, errors);
    if (b.kind === "teach") lintIntent(`teach '${b.id}'`, b.introIntent, errors);
  }
  lintIntent("practice.introIntent", content.practice.introIntent, errors);

  // 1. beat: selamlama + hazır mısın
  const first = beats[0];
  if (!first || first.kind !== "ask" || first.purpose !== "readiness") {
    errors.push("İlk beat kind:'ask', purpose:'readiness' olmalı (selamlama + konu ilanı + hazır mısın)");
  }
  if (!beats.some((b) => b.kind === "ask" && b.purpose === "questions")) {
    errors.push("Anlatımdan sonra purpose:'questions' olan bir 'ask' beat'i olmalı");
  }

  // Pedagojik sözleşme alanları
  if (content.objectives.length < 2) errors.push("En az 2 ölçülebilir hedef (objectives) gerekli");
  for (const o of content.objectives) {
    if (!isEnglishText(o)) errors.push(`objective İngilizce olmalı: "${o.slice(0, 60)}"`);
  }
  if (!isEnglishText(content.communicationGoal)) {
    errors.push("communicationGoal İngilizce olmalı");
  }
  if (!isEnglishText(content.tutorNotes.target)) errors.push("tutorNotes.target İngilizce olmalı");

  // Anlatım beat'i zorunlu — ve maddeler SAF İNGİLİZCE olmalı (Emma sesli okuyor)
  const teachBeats = beats.filter((b) => b.kind === "teach");
  if (teachBeats.length === 0) {
    errors.push("Lecture'da 'teach' (madde madde anlatım) beat'i zorunlu");
  }
  for (const t of teachBeats) {
    if (t.kind !== "teach") continue;
    for (const p of t.points) {
      if (!isEnglishText(p)) {
        errors.push(
          `teach '${t.id}': anlatım maddeleri saf İngilizce olmalı — ana dil sızmış: "${p.slice(0, 60)}"`,
        );
        break;
      }
    }
  }

  // İki 'ask' beklenir: hazır mısın + sormak istediğin var mı
  const askCount = beats.filter((b) => b.kind === "ask").length;
  if (askCount < 2) {
    errors.push("Lecture'da 2 'ask' beat'i olmalı (hazır mısın / sormak istediğin bir şey var mı)");
  }

  // Alıştırmalar
  const exercises = beats.filter((b) => b.kind === "exercise");
  if (exercises.length < 2) errors.push("Lecture'da en az 2 'exercise' beat'i olmalı");
  if (exercises.length > 3) warnings.push(`${exercises.length} alıştırma var — 2-3 bekleniyordu`);

  for (const ex of exercises) {
    if (ex.kind !== "exercise") continue;
    // Emma soruyu sesli okuyor → soru metni İngilizce olmalı (dil-bağımsız kontrol)
    if (!isEnglishText(ex.prompt)) {
      errors.push(
        `exercise '${ex.id}': soru metni İngilizce olmalı (Emma sesli okuyor) — "${ex.prompt.slice(0, 60)}"`,
      );
    }
    const isFillBlank = /fill in the blank/i.test(ex.prompt) || ex.prompt.includes("___");
    if (isFillBlank && !ex.prompt.includes("___")) {
      errors.push(`exercise '${ex.id}': boşluk doldurma sorusunda boşluk tam olarak ___ olmalı`);
    }
    if (ex.options && ex.options.length) {
      // Çoktan seçmelide cevap şıklardan biriyle eşleşmeli
      const norm = (s: string) => s.trim().toLowerCase();
      const optionSet = new Set(ex.options.map(norm));
      if (!ex.answers.some((a) => optionSet.has(norm(a)))) {
        errors.push(`exercise '${ex.id}': cevap şıklardan biriyle eşleşmiyor`);
      }
      if (new Set(ex.options.map(norm)).size !== ex.options.length) {
        errors.push(`exercise '${ex.id}': şıklar benzersiz olmalı`);
      }
      // ŞIKLAR TEK KAYNAKTAN: prompt'a da gömülürse ekranda İKİ KEZ görünüyor
      // (istemci `options`'ı ayrıca A) B) C) diye ekliyor).
      const inlined = ex.options.filter((o) => ex.prompt.includes(o));
      if (inlined.length > 0) {
        errors.push(
          `exercise '${ex.id}': şıklar prompt metnine de gömülmüş (${inlined.length}/${ex.options.length}) — soru prompt'ta, şıklar YALNIZCA options'ta olmalı`,
        );
      }
    }
  }

  // Açık uçlu üretim adımı: en fazla 1 tane, ve rubriği dolu olmalı
  const openResponses = beats.filter((b) => b.kind === "open_response");
  if (openResponses.length > 1) {
    errors.push(`${openResponses.length} 'open_response' var — en fazla 1 olmalı (her biri bir LLM çağrısı)`);
  }
  for (const o of openResponses) {
    if (o.kind !== "open_response") continue;
    if (!isEnglishText(o.prompt)) errors.push(`open_response '${o.id}': soru metni İngilizce olmalı`);
    if (!o.rubric.criteria.trim()) errors.push(`open_response '${o.id}': rubric.criteria boş`);
  }

  // Beat sırası: alıştırmalar anlatımdan SONRA gelmeli
  const teachIdx = beats.findIndex((b) => b.kind === "teach");
  const firstExIdx = beats.findIndex((b) => b.kind === "exercise");
  if (teachIdx !== -1 && firstExIdx !== -1 && firstExIdx < teachIdx) {
    errors.push("Alıştırmalar anlatım (teach) beat'inden sonra gelmeli");
  }

  // Practice fazı
  const p = content.practice;
  if (!p.mustUse.length) errors.push("practice.mustUse boş — derste öğretilenler yazılmalı");
  for (const m of p.mustUse) lintMustUse(m, errors);
  if (p.avatarOpening.trim().length < 5) errors.push("practice.avatarOpening çok kısa");
  if (!p.persona.goal.trim()) errors.push("practice.persona.goal boş — karakterin sahnedeki amacı gerekli");
  if (p.persona.name.trim().toLowerCase() === "emma") {
    errors.push("practice.persona.name 'Emma' olamaz — hocanın adı; öğrenci kiminle konuştuğunu şaşırır");
  }
  if (!p.successCriteria.trim()) errors.push("practice.successCriteria boş — 'başardı mı' ölçütü gerekli");
  if (p.minTargetUses > p.maxTurns) {
    errors.push(`practice.minTargetUses (${p.minTargetUses}) maxTurns'ten (${p.maxTurns}) büyük olamaz`);
  }

  // Quiz (varsa) tutarlılığı
  if (content.quiz) {
    for (const q of content.quiz) {
      if (q.type === "fill_blank") {
        const blanks = (q.text.match(/___/g) ?? []).length;
        if (blanks !== q.answers.length) {
          errors.push(`quiz fill_blank '${q.id}': ${blanks} boşluk, ${q.answers.length} cevap`);
        }
      }
    }
  } else {
    warnings.push("quiz alanı üretilmemiş (ders-sonu isteğe bağlı test eksik)");
  }

  // Hoca'nın SESLİ okuduğu AUTHORED metinler İngilizce olmalı (dil-bağımsız ASCII kontrolü).
  // Niyet alanları yukarıda ayrıca denetlendi; buradaki liste ekranda/seste birebir çıkan metin.
  const spoken = [
    ...teachBeats.flatMap((b) => (b.kind === "teach" ? b.points : [])),
    ...exercises.map((b) => (b.kind === "exercise" ? b.prompt : "")),
    p.avatarOpening,
  ].join(" ");
  if (!isEnglishText(spoken.replace(/\*\*/g, ""))) {
    warnings.push("Hocanın sesli okuduğu metinlerde İngilizce dışı karakter var");
  }

  return { errors, warnings };
}
