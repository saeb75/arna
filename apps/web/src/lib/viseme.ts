// Viseme motoru: transkript metnini zaman damgalı ağız şekli dizisine çevirir.
// Tam Oculus viseme seti (15) kullanılır. Süre dağıtımı eşit değildir: sesli
// harfler uzun, patlamalı sessizler kısa tutulur — doğal konuşma böyle davranır.

export type Word = { text: string; start: number; end: number };

/**
 * Altyazı satırı. `words` doluysa zamanlama kelime bazlıdır (ElevenLabs Scribe /
 * forced alignment çıktısı) — bu durumda her kelime kendi gerçek penceresine
 * oturur, kayma cümle boyunca birikmez. Yoksa süre cümleye eşit dağıtılır.
 */
export type Line = {
  text: string;
  speaker?: string;
  timestamp: [number, number];
  words?: Word[];
};

/** t: başlangıç saniyesi, d: süre, v: viseme indeksi */
export type Frame = { t: number; d: number; v: number };

export type Timeline = {
  frames: Frame[];
  intervals: Array<[number, number]>;
  duration: number;
};

// Oculus viseme indeksleri
const SIL = 0;
const PP = 1; // p b m — dudaklar kapalı
const FF = 2; // f v
const TH = 3; // th
const DD = 4; // d t
const KK = 5; // k g sert c
const CH = 6; // ch sh j
const SS = 7; // s z
const NN = 8; // n l
const RR = 9; // r
const AA = 10; // "father / cat"
const EE = 11; // "bed"
const II = 12; // "bit / see"
const OO = 13; // "go"
const UU = 14; // "boot / w"

export const VISEME_MORPHS = [
  "viseme_sil",
  "viseme_PP",
  "viseme_FF",
  "viseme_TH",
  "viseme_DD",
  "viseme_kk",
  "viseme_CH",
  "viseme_SS",
  "viseme_nn",
  "viseme_RR",
  "viseme_aa",
  "viseme_E",
  "viseme_I",
  "viseme_O",
  "viseme_U",
];

/**
 * Morph'un ulaşacağı tepe değeri. Dudak kapanması (PP) güçlü kalır, yoksa
 * "m/b/p" seslerinde dudaklar birleşmez; sesliler biraz kısılmıştır.
 */
export const VISEME_INTENSITY = [0, 0.95, 0.85, 0.78, 0.82, 0.78, 0.8, 0.78, 0.68, 0.68, 0.85, 0.82, 0.8, 0.85, 0.82];

/**
 * Çene açıklığı üst sınırı. Gerçek açıklık bununla sesin o anki enerjisinin
 * çarpımıdır — sessizlikte ağız kapanır, yüksek seste tam açılır. Böylece
 * metinden tahmin edilen zamanlama kayarsa ağız boşa açılmaz.
 *
 * Ağzın ne kadar açıldığını ayarlamak için tek yer burası; sesliler (aa, E, I,
 * O, U) baskın etkiye sahip.
 */
export const VISEME_JAW = [0, 0, 0.04, 0.09, 0.08, 0.11, 0.07, 0.035, 0.07, 0.1, 0.32, 0.19, 0.11, 0.23, 0.13];

/** Dudak yuvarlaklığı (mouthFunnel) */
export const VISEME_ROUND = [0, 0, 0, 0, 0, 0, 0.25, 0, 0, 0.2, 0, 0, 0, 0.5, 0.7];

/** Göreli süre ağırlığı: sesliler uzun, patlamalılar kısa */
const WEIGHT = [1, 0.5, 0.8, 0.8, 0.5, 0.55, 0.85, 0.8, 0.6, 0.65, 1.9, 1.6, 1.5, 1.8, 1.7];

const IS_VOWEL = [false, false, false, false, false, false, false, false, false, false, true, true, true, true, true];

const VOWEL_LETTERS = new Set(["a", "e", "i", "o", "u", "y"]);

// Dört harfli özel durumlar
const QUADS: Record<string, number[]> = { ough: [OO], ould: [UU, DD] };

// Üç harfli
const TRIPLES: Record<string, number[]> = {
  tch: [CH],
  sch: [SS, KK],
  igh: [II],
  ing: [II, NN],
  tio: [CH],
  sio: [CH],
  eau: [OO],
};

// İki harfli — sessiz harf grupları + ikili sesliler
const PAIRS: Record<string, number[]> = {
  th: [TH],
  sh: [CH],
  ch: [CH],
  ph: [FF],
  wh: [UU],
  ck: [KK],
  ng: [NN],
  qu: [KK, UU],
  kn: [NN],
  wr: [RR],
  gn: [NN],
  gh: [], // sessiz
  ee: [II],
  ea: [II],
  oo: [UU],
  ou: [OO],
  ow: [OO],
  oi: [OO, II],
  oy: [OO, II],
  ai: [EE, II],
  ay: [EE, II],
  ei: [II],
  au: [OO],
  aw: [OO],
  ie: [II],
  oa: [OO],
  ue: [UU],
  ui: [UU],
  ar: [AA, RR],
  or: [OO, RR],
  er: [EE, RR],
  ir: [EE, RR],
  ur: [EE, RR],
};

const SINGLES: Record<string, number[]> = {
  a: [AA],
  e: [EE],
  i: [II],
  o: [OO],
  u: [UU],
  y: [II],
  b: [PP],
  p: [PP],
  m: [PP],
  f: [FF],
  v: [FF],
  d: [DD],
  t: [DD],
  k: [KK],
  g: [KK],
  c: [KK],
  q: [KK],
  x: [KK, SS],
  s: [SS],
  z: [SS],
  j: [CH],
  n: [NN],
  l: [NN],
  r: [RR],
  w: [UU],
  h: [], // görsel olarak karşılığı yok
};

function wordToVisemes(input: string): number[] {
  let word = input;
  // sessiz son "e": name, like, welcome (ama movie/she gibi durumlarda korunur)
  if (word.length > 3 && word.endsWith("e") && !VOWEL_LETTERS.has(word[word.length - 2])) {
    word = word.slice(0, -1);
  }
  const out: number[] = [];
  let i = 0;
  while (i < word.length) {
    const quad = QUADS[word.slice(i, i + 4)];
    if (quad) {
      out.push(...quad);
      i += 4;
      continue;
    }
    const tri = TRIPLES[word.slice(i, i + 3)];
    if (tri) {
      out.push(...tri);
      i += 3;
      continue;
    }
    // "ey": kısa kelimelerde ikili sesli (hey, they, grey), uzunlarda tek (money, valley)
    if (word.slice(i, i + 2) === "ey") {
      out.push(...(word.length <= 4 ? [EE, II] : [II]));
      i += 2;
      continue;
    }
    const pair = PAIRS[word.slice(i, i + 2)];
    if (pair) {
      out.push(...pair);
      i += 2;
      continue;
    }
    const ch = word[i];
    // yumuşak c/g: city, general
    if ((ch === "c" || ch === "g") && "eiy".includes(word[i + 1] ?? "")) {
      out.push(ch === "c" ? SS : CH);
      i += 1;
      continue;
    }
    out.push(...(SINGLES[ch] ?? [DD]));
    i += 1;
  }
  return out;
}

type Seg = { v: number; w: number };

/** Ardışık aynı viseme'leri birleştirir (tt, ll gibi çiftler tek ses üretir) */
function pushSeg(segs: Seg[], v: number, w: number) {
  const last = segs[segs.length - 1];
  if (last && last.v === v) {
    last.w = Math.max(last.w, w) * 1.25;
    return;
  }
  segs.push({ v, w });
}

/** Tek kelime — noktalama atılır, duraklama zaten gerçek boşluktan gelir */
function wordToSegments(text: string): Seg[] {
  const segs: Seg[] = [];
  const clean = text.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return segs;
  for (const v of wordToVisemes(clean)) pushSeg(segs, v, WEIGHT[v]);
  return segs;
}

function chunkToSegments(text: string): Seg[] {
  const segs: Seg[] = [];
  // Kelimeleri ve noktalama işaretlerini ayrı token olarak al
  const tokens = text.match(/[a-zA-Z']+|[.!?]+|[,;:—-]/g) ?? [];
  for (const token of tokens) {
    if (/^[a-zA-Z']+$/.test(token)) {
      for (const v of wordToVisemes(token.toLowerCase().replace(/'/g, ""))) {
        pushSeg(segs, v, WEIGHT[v]);
      }
    } else if (/^[.!?]+$/.test(token)) {
      pushSeg(segs, SIL, 1.5); // cümle sonu — ağız kapanır
    } else {
      pushSeg(segs, SIL, 0.7); // virgül — kısa nefes
    }
  }
  return segs;
}

/**
 * Hızlı konuşmada saniyedeki viseme sayısı gerçekçi sınırı aşarsa ağız titrer.
 * Bu durumda en zayıf sessizler atılır; sesliler ve duraklamalar korunur.
 */
function thin(segs: Seg[], duration: number, maxRate = 13): Seg[] {
  if (duration <= 0) return segs;
  let out = segs;
  while (out.length / duration > maxRate) {
    let worst = -1;
    let worstW = Infinity;
    for (let i = 0; i < out.length; i++) {
      const s = out[i];
      if (s.v === SIL || IS_VOWEL[s.v]) continue;
      if (s.w < worstW) {
        worstW = s.w;
        worst = i;
      }
    }
    if (worst < 0) break;
    out = out.filter((_, i) => i !== worst);
  }
  return out;
}

type TimedWord = Word & { speaker?: string };

const SENTENCE_END = /[.!?]$/;
const MAX_LINE_WORDS = 14;
const MAX_LINE_SPAN = 8;

/** ElevenLabs Scribe / forced alignment çıktısı: kelime bazlı zaman damgaları */
function linesFromWords(raw: unknown[]): Line[] {
  const words: TimedWord[] = [];
  for (const item of raw) {
    const w = item as Record<string, unknown>;
    // spacing / audio_event gibi token'lar atlanır; boşluklar zaten kelime
    // bitişi ile sonraki kelimenin başlangıcı arasındaki farktan çıkar
    if (w?.type != null && w.type !== "word") continue;
    const text = typeof w?.text === "string" ? w.text.trim() : "";
    const start = Number(w?.start);
    const end = Number(w?.end);
    if (!text || !Number.isFinite(start) || !Number.isFinite(end)) continue;
    words.push({
      text,
      start,
      end: Math.max(end, start),
      speaker: typeof w.speaker_id === "string" ? w.speaker_id : undefined,
    });
  }
  if (!words.length) throw new Error('"words" dizisinde zamanlı kelime bulunamadı.');
  words.sort((a, b) => a.start - b.start);

  const lines: Line[] = [];
  let cur: TimedWord[] = [];
  const flush = () => {
    if (!cur.length) return;
    lines.push({
      text: cur.map((w) => w.text).join(" "),
      speaker: cur[0].speaker,
      timestamp: [cur[0].start, cur[cur.length - 1].end],
      words: cur.map(({ text, start, end }) => ({ text, start, end })),
    });
    cur = [];
  };

  for (const w of words) {
    const head = cur[0];
    if (head && (w.speaker !== head.speaker || cur.length >= MAX_LINE_WORDS || w.end - head.start > MAX_LINE_SPAN)) {
      flush();
    }
    cur.push(w);
    if (SENTENCE_END.test(w.text)) flush();
  }
  flush();
  return lines;
}

/** Cümle bazlı format: {chunks:[{text, speaker, timestamp:[a,b]}]} */
function linesFromChunks(raw: unknown[]): Line[] {
  const lines: Line[] = [];
  for (const item of raw) {
    const c = item as Line;
    if (typeof c?.text !== "string" || !Array.isArray(c.timestamp) || c.timestamp.length < 2) {
      throw new Error('Her chunk "text" ve [başlangıç, bitiş] formatında "timestamp" içermeli.');
    }
    lines.push({
      text: c.text,
      speaker: c.speaker,
      timestamp: [Number(c.timestamp[0]), Number(c.timestamp[1])],
    });
  }
  lines.sort((a, b) => a.timestamp[0] - b.timestamp[0]);
  return lines;
}

export function parseTranscript(raw: string): Line[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Geçersiz JSON — yapıştırdığın metni kontrol et.");
  }
  const obj = (data ?? {}) as Record<string, unknown>;

  if (Array.isArray(obj.words) && obj.words.length) return linesFromWords(obj.words);

  const chunks = Array.isArray(data) ? data : obj.chunks;
  if (Array.isArray(chunks) && chunks.length) return linesFromChunks(chunks);

  throw new Error('JSON içinde "words" (kelime bazlı) veya "chunks" (cümle bazlı) dizisi bulunamadı.');
}

/** Segmentleri verilen zaman penceresine ağırlıklarına göre yayar */
function emit(segs: Seg[], start: number, span: number, frames: Frame[]) {
  const total = segs.reduce((sum, s) => sum + s.w, 0);
  if (total <= 0) return;
  let t = start;
  for (const seg of segs) {
    const d = (span * seg.w) / total;
    frames.push({ t, d, v: seg.v });
    t += d;
  }
}

const GAP_SIL = 0.09; // bu kadar boşlukta ağız kapanır
const GAP_BREAK = 0.25; // bu kadar boşlukta konuşma aralığı biter, avatar dinlemeye döner

/** speaker verilirse sadece o konuşmacının satırları konuşulur; null => hepsi */
export function buildTimeline(lines: Line[], speaker: string | null): Timeline {
  const frames: Frame[] = [];
  const intervals: Array<[number, number]> = [];
  let duration = 0;

  for (const line of lines) {
    duration = Math.max(duration, line.timestamp[1]);
    if (speaker && line.speaker !== speaker) continue;

    const words = line.words;
    if (words?.length) {
      // Kelime bazlı: her kelime kendi gerçek penceresine oturur, aradaki
      // gerçek boşluklar sessizliğe çevrilir
      let runStart = words[0].start;
      let prevEnd = words[0].start;
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const gap = w.start - prevEnd;
        if (i > 0 && gap > GAP_SIL) frames.push({ t: prevEnd, d: gap, v: SIL });
        if (i > 0 && gap > GAP_BREAK) {
          intervals.push([runStart, prevEnd]);
          runStart = w.start;
        }
        const span = Math.max(w.end - w.start, 0.02);
        emit(thin(wordToSegments(w.text), span, 15), w.start, span, frames);
        prevEnd = w.end;
      }
      intervals.push([runStart, prevEnd]);
      frames.push({ t: prevEnd, d: 0.12, v: SIL });
    } else {
      const [start, end] = line.timestamp;
      const span = end - start;
      if (span <= 0) continue;
      intervals.push([start, end]);
      emit(thin(chunkToSegments(line.text), span), start, span, frames);
      frames.push({ t: end, d: 0.12, v: SIL });
    }
  }

  // Konuşmacılar üst üste binerse sıra bozulabilir; arama ve tarama sıralı olmalı
  frames.sort((a, b) => a.t - b.t);
  intervals.sort((a, b) => a[0] - b[0]);

  return { frames, intervals, duration };
}

/** t anındaki frame indeksi (yoksa -1) */
export function indexAt(frames: Frame[], t: number): number {
  if (!frames.length || t < frames[0].t) return -1;
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function isSpeaking(intervals: Array<[number, number]>, t: number): boolean {
  for (const [s, e] of intervals) {
    if (t >= s && t <= e) return true;
    if (s > t) break;
  }
  return false;
}
