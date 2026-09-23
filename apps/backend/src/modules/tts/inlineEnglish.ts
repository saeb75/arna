import type { LessonCore, TextRun } from "@glotmate/contracts";
import { EN_STOPWORDS } from "../lesson/lintLayers.js";

/**
 * SATIR İÇİ İNGİLİZCE — L1 düzyazının içinde geçen İngilizce sözcük/ifadeleri
 * kendi `en` parçasına ayırır ki tek-klip sağlayıcı (Azure SSML) onları
 * İngilizce okusun: "am, is veya are'ı" → am · is · are İngilizce, gerisi L1.
 *
 * NEDEN BURADA: dil paketi şeması modele İngilizce metin alanı vermez (kasıtlı,
 * CLAUDE.md), gramer terimi anmaları ("am / is / are", "do/does") kaçınılmaz
 * olarak L1 metnin içinde kalır. İçerikte düzeltmek 395 ders × dil paketi
 * yeniden üretimi demek; burası sıfır maliyetli, deterministik, dilden bağımsız.
 *
 * SÖZLÜK DERSİN ÇEKİRDEĞİNDEN gelir (formEn, örnekler, mustUse, şıklar, cevaplar):
 * yalnız dersin ÖĞRETTİĞİ İngilizce aranır — genel İngilizce sözlük yok, ana dile
 * özgü kural yok. Latin harfli olmayan ana dilde (Arapça, Rusça) aday token zaten
 * çıkmaz. Bilinen sınır: ana dilde İngilizce biçimle eş yazılan sözcük (Almanca
 * "am") dersin biçimiyse İngilizce okunur — kabul edilen ödün, bugünkü "hepsi
 * yanlış" durumundan iyi; kalıcı çözüm paket üretiminde etiketleme (ayrı faz).
 *
 * KURALLAR:
 *  1. Tırnaklı span (' " “ ‘): içi Latin harfli ve sözcüklerinin ≥ yarısı sözlükte
 *     ise tamamı `en` ('Yes, I am', 'Yes, I'm'). Tırnak işaretleri L1'de kalır.
 *  2. İfade: sözlükteki ifadeler en uzundan kısaya, kelime sınırlı, harf duyarsız.
 *  3. Tek sözcük: yalnız sözlükte TEK BAŞINA geçen biçimler (formEn alt biçimleri,
 *     mustUse, tek kelimelik cevap/şık). Örnek cümlelerin tek tek sözcükleri
 *     yalnız tırnak kararında kullanılır — "on", "it" gibi çakışmaları sınırlar.
 *  4. Ek/apostrof: "are'ı" → `en:"are"` + `l1:"'ı"` (sınır harf/rakam dışı karakter).
 *  Parçaların birleşimi orijinal metne BİREBİR eşittir (boşluk/noktalama korunur).
 */
export interface EnglishLexicon {
  /** Tek başına eşleşebilen ifadeler (küçük harf, iç boşluk tek) */
  phrases: string[];
  /** Tırnak kararı + kapalı-sınıf/komşuluk kuralları için sözcük kümesi (küçük harf) */
  words: Set<string>;
  /**
   * ANA DİL sözcük örneği — chrome paketinin tüm metin yapraklarından (etiketler,
   * ACK/pes kümeleri, script şablonları). Dil-bağımsız çakışma koruması: Almanca
   * chrome "am", Hollandaca "we/is" içerir → o dillerde bu tokenlar tek başına
   * İngilizce sayılmaz. Kodda dile özgü tek satır yok.
   */
  l1Words: Set<string>;
}

/**
 * İngilizce KAPALI SINIF: zamir, be/do/have biçimleri, yardımcılar, artikel, işaret/iyelik.
 * Tek başına anıldıklarında (LLM cevabı: "Am, I ile kullanılır; is, he, she ve it ile")
 * İngilizce okunmalı. Yalnız dersin sözlüğünde (`words`) GEÇEN ve ana dil sözcüğü
 * OLMAYAN üyeler işaretlenir — genel İngilizce sözlük değil, dersin andığı sözcükler.
 */
const CLOSED_CLASS = new Set([
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their", "this", "that", "these", "those",
  "a", "an", "the", "am", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "have", "has", "had", "will", "would", "shall", "should",
  "can", "could", "may", "might", "must", "not",
]);

/** Chrome paketinin tüm string yapraklarını gez (labels, ack, surrender, script …) */
function collectStrings(node: unknown, out: string[]): void {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) for (const x of node) collectStrings(x, out);
  else if (node && typeof node === "object") for (const v of Object.values(node as Record<string, unknown>)) collectStrings(v, out);
}

const LETTER = /[\p{L}\p{N}]/u;

/** İngilizce klitik kısaltmaları: gövde + 'm/'re/'s/'ve/'ll/'d/'t — kelime sınırlı, harf duyarsız */
const CONTRACTION =
  /(?<![\p{L}\p{N}])(?:i|you|he|she|it|we|they|that|there|here|who|what|where|how|let|don|doesn|didn|isn|aren|wasn|weren|can|won|couldn|wouldn|shouldn|haven|hasn|hadn|mustn|needn)['’](?:m|re|s|ve|ll|d|t)(?![\p{L}\p{N}])/giu;

function normalizePhrase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[\s.,!?;:"“”()\-–—]+|[\s.,!?;:"“”()\-–—]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsOf(s: string): string[] {
  // Birleşik işaretler atılır: JS `toLowerCase("İ")` iki kod noktası ("i" + U+0307) verir,
  // bölme o noktadan kırılıp sahte "i" sözcüğü üretiyordu (Türkçe chrome "İşte" → "i" + "şte").
  return normalizePhrase(s)
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .split(/[^\p{L}\p{N}']+/u)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length >= 2 || w === "i" || w === "a");
}

export function buildEnglishLexicon(core: LessonCore, chrome?: unknown): EnglishLexicon {
  const phrases = new Set<string>();
  const words = new Set<string>(EN_STOPWORDS);
  const l1Words = new Set<string>();
  if (chrome) {
    const leaves: string[] = [];
    collectStrings(chrome, leaves);
    // `{name}` gibi şablon yer tutucuları sözcük değil
    for (const leaf of leaves) for (const w of wordsOf(leaf.replace(/\{\w+\}/g, " "))) l1Words.add(w);
  }

  const addPhrase = (s: string | undefined) => {
    if (!s) return;
    const n = normalizePhrase(s);
    if (n && !/_{2,}/.test(n)) phrases.add(n);
    for (const w of wordsOf(s)) words.add(w);
  };
  const addWordsOnly = (s: string | undefined) => {
    for (const w of wordsOf(s ?? "")) words.add(w);
  };

  for (const beat of core.lecture.beats) {
    if (beat.kind === "teach") {
      for (const p of beat.points) {
        addPhrase(p.formEn);
        // "am / is / are", "do/does", "-s after he/she/it" → alt biçimler tek başına anılır
        for (const part of p.formEn.split(/\s*[/,]\s*|\s+or\s+/i)) addPhrase(part);
        for (const ex of p.examples) addPhrase(ex.textEn);
        for (const c of p.claimsEn) addWordsOnly(c);
      }
    } else if (beat.kind === "exercise") {
      addPhrase(beat.item);
      addPhrase(beat.exampleAnswer);
      for (const o of beat.options ?? []) addPhrase(o);
    } else if (beat.kind === "open_response") {
      addWordsOnly(beat.question);
      for (const m of beat.rubric.mustUse) addPhrase(m);
    }
  }
  for (const m of core.practice.mustUse) addPhrase(m);
  for (const q of core.quiz ?? []) {
    if (q.type === "mcq") {
      addWordsOnly(q.stem);
      for (const o of q.options) addPhrase(o);
    } else {
      addWordsOnly(q.text);
      for (const group of q.answers) for (const a of group) addPhrase(a);
    }
  }

  // En uzun önce: "yes, i am" "i am"dan önce denenir
  return { phrases: [...phrases].sort((a, b) => b.length - a.length), words, l1Words };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** İfade → harf-duyarsız, kelime sınırlı, apostrof türü ve boşluk sayısı toleranslı regex parçası */
function phrasePattern(p: string): string {
  return escapeRegex(p).replace(/'/g, "['’]").replace(/ /g, "\\s+");
}

interface Span {
  start: number;
  end: number;
}

/** Tırnaklı span'lar: açılış tırnağı harf öncesi olmayan, kapanış tırnağı harf sonrası olmayan */
function quotedSpans(text: string, lex: EnglishLexicon): Span[] {
  const spans: Span[] = [];
  const re = /(^|[^\p{L}\p{N}])(['"“‘])(?=\p{L})/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const open = m.index + m[1]!.length;
    const q = m[2]!;
    const closer = q === "“" ? "”" : q === "‘" ? "’" : q;
    // kapanış: aynı tırnak, ardından harf/rakam GELMEYEN (I'm içindeki apostrof kapatmaz)
    let close = -1;
    for (let i = open + 1; i < text.length && i - open < 200; i++) {
      if (text[i] === closer && !(i + 1 < text.length && LETTER.test(text[i + 1]!))) {
        close = i;
        break;
      }
      if (text[i] === "\n") break;
    }
    if (close === -1) continue;
    const inner = text.slice(open + 1, close);
    const letters = inner.match(/\p{L}/gu) ?? [];
    if (letters.length === 0 || letters.some((c) => !/[a-z]/i.test(c))) continue; // Latin dışı → İngilizce değil
    const ws = wordsOf(inner);
    if (ws.length === 0) continue;
    const hits = ws.filter((w) => lex.words.has(w)).length;
    if (hits * 2 >= ws.length) spans.push({ start: open + 1, end: close });
    re.lastIndex = close + 1;
  }
  return spans;
}

/** Tek bir L1 metnini `l1`/`en` alt parçalara böler; birleşimi metne birebir eşittir */
export function splitInlineEnglish(text: string, lex: EnglishLexicon): TextRun[] {
  if (!/[a-z]/i.test(text)) return [{ lang: "l1", text }];

  const spans: Span[] = quotedSpans(text, lex);
  const overlaps = (s: number, e: number) => spans.some((x) => s < x.end && e > x.start);

  if (lex.phrases.length > 0) {
    const re = new RegExp(
      `(?<![\\p{L}\\p{N}])(?:${lex.phrases.map(phrasePattern).join("|")})(?![\\p{L}\\p{N}])`,
      "giu",
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const s = m.index;
      const e = s + m[0].length;
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      // Tek sözcüklü ifade ana dilde de sözcükse (Almanca "am") işaretlenmez; çok sözcüklü ifade her zaman İngilizce
      if (!/\s/.test(m[0]) && lex.l1Words.has(m[0].toLowerCase())) continue;
      if (!overlaps(s, e)) spans.push({ start: s, end: e });
    }
  }
  // Kısaltmalar sözlükten bağımsız: "you're", "he's", "it's" dersin örneklerinde
  // tek başına geçmese de İngilizce'dir (klitik gövde+ek kümesi ana dile özgü
  // değil; Türkçe "'da/'ı" ekleri ve Fransızca "c'est" elizyonu bu kalıba düşmez).
  let c: RegExpExecArray | null;
  CONTRACTION.lastIndex = 0;
  while ((c = CONTRACTION.exec(text)) !== null) {
    const s = c.index;
    const e = s + c[0].length;
    if (!overlaps(s, e)) spans.push({ start: s, end: e });
  }
  // Kapalı sınıf tek sözcükler: dersin sözlüğünde geçen, ana dil sözcüğü olmayan
  // zamir/be/yardımcı anmaları ("Am, I ile kullanılır; is, he, she ve it ile").
  const candidate = (w: string) => {
    const k = w.toLowerCase();
    return lex.words.has(k) && !lex.l1Words.has(k);
  };
  const TOKEN = /(?<![\p{L}\p{N}])[a-zA-Z]+(?![\p{L}\p{N}])/gu;
  let t: RegExpExecArray | null;
  while ((t = TOKEN.exec(text)) !== null) {
    const w = t[0];
    if (!CLOSED_CLASS.has(w.toLowerCase()) || !candidate(w)) continue;
    const s = t.index;
    const e = s + w.length;
    if (!overlaps(s, e)) spans.push({ start: s, end: e });
  }
  if (spans.length === 0) return [{ lang: "l1", text }];

  // Komşuluk genişletmesi: işaretli bir span'a yalnız noktalama/boşlukla (≤3 karakter,
  // harf yok) komşu, sözlükte geçen ve ana dil sözcüğü olmayan tokenlar da İngilizce
  // ("is, he, she" zinciri). Yeni eklenenlerden yeniden genişler.
  const glue = (gap: string) => gap.length <= 3 && !/[\p{L}\p{N}'’"“”‘]/u.test(gap);
  let grew = true;
  while (grew) {
    grew = false;
    TOKEN.lastIndex = 0;
    while ((t = TOKEN.exec(text)) !== null) {
      const w = t[0];
      const s = t.index;
      const e = s + w.length;
      if (overlaps(s, e) || !candidate(w)) continue;
      const touches = spans.some((x) => (x.end <= s && glue(text.slice(x.end, s))) || (e <= x.start && glue(text.slice(e, x.start))));
      if (touches) {
        spans.push({ start: s, end: e });
        grew = true;
      }
    }
  }

  spans.sort((a, b) => a.start - b.start);
  // Yalnız noktalama/boşlukla ayrılan bitişik span'lar TEK span: "I'm, you're, he's"
  // tek <lang> bloğu → doğal İngilizce liste prosodisi, 7 yerine 1 etiket (fatura).
  const merged: Span[] = [];
  for (const sp of spans) {
    const prev = merged[merged.length - 1];
    const gap = prev ? text.slice(prev.end, sp.start) : "";
    if (prev && gap.length <= 4 && !/[\p{L}\p{N}'’"“”‘]/u.test(gap)) prev.end = sp.end;
    else merged.push({ ...sp });
  }
  const out: TextRun[] = [];
  let cursor = 0;
  for (const sp of merged) {
    if (sp.start > cursor) out.push({ lang: "l1", text: text.slice(cursor, sp.start) });
    out.push({ lang: "en", text: text.slice(sp.start, sp.end) });
    cursor = sp.end;
  }
  if (cursor < text.length) out.push({ lang: "l1", text: text.slice(cursor) });
  return out;
}

/**
 * Speak çağrısının parçalarını çekirdek sözlüğüyle inceltir. `en` parçalar
 * olduğu gibi kalır; `core` yoksa (rol yapma oturumu — zaten İngilizce) dokunulmaz.
 * Yalnız tek-klip sağlayıcıda çağrılmalı: dil-başına-klip yolunda mikro klipler
 * ("am", ", ", "is") prosodiyi parçalar ve istek sayısını katlar.
 */
export function refineRunsForInlineEnglish<T extends { lang: "en" | "l1"; text: string }>(
  runs: T[],
  core: LessonCore | null | undefined,
  /** Ana dilin chrome paketi — L1 sözcük örneği (çakışma koruması); yoksa koruma boş */
  chrome?: unknown,
): Array<TextRun | T> {
  if (!core) return runs;
  const lex = buildEnglishLexicon(core, chrome);
  const out: Array<TextRun | T> = [];
  for (const r of runs) {
    if (r.lang !== "l1") {
      out.push(r);
      continue;
    }
    for (const part of splitInlineEnglish(r.text, lex)) out.push(part);
  }
  return out;
}
