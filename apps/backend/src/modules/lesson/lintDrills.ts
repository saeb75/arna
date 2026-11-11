import {
  DRILL_MIX_REF,
  drillAnswerTiles,
  sentenceTiles,
  type CoreDrillsBeat,
  type DrillItem,
} from "@glotmate/contracts";

/**
 * OYUN BLOĞU LINT'İ — deterministik, LLM'siz.
 *
 * İki katman: (1) tür bazlı YAPI (tek ___, şık aralığı, kart sayısı…) — şemanın
 * ifade edemediği ama yanlışı oyunu bozan kurallar; (2) PEDAGOJİK KAPSAM — bu
 * yapının var olma sebebi. Eski formatta must/should dersinde should'un hiç
 * alıştırması yoktu ve bunu hiçbir şey görmüyordu; artık her öğretim maddesi
 * sayılır, çok kalıplı derste karışık set zorunludur.
 *
 * Lint'in YAKALAYAMADIĞI: çeldiricinin "o da olur" olması (must/should). O yazım
 * kuralıdır (dsl.ts) ve review-dump'ta insan gözüyle denetlenir.
 */

export type LessonKind = "grammar" | "phrases" | "practice";

/** Ders tipine göre madde sayısı aralığı — gramer en çok tekrar ister */
export const DRILL_COUNT_RANGE: Record<LessonKind, readonly [number, number]> = {
  grammar: [10, 16],
  phrases: [8, 14],
  practice: [4, 8],
};
/** Her öğretim maddesine en az kaç madde */
export const DRILLS_PER_POINT_MIN = 3;
/** Birden çok öğretim maddesi varsa en az kaç karışık madde */
export const DRILL_MIX_MIN = 2;
/** Blokta en az kaç farklı tür */
export const DRILL_TYPES_MIN = 4;
/** Aynı tür art arda en fazla */
export const DRILL_SAME_TYPE_RUN_MAX = 2;

const ARRANGE_MIN_WORDS = 3;

/** Takvim kelimeleri (İngilizce içerik — ana dile özgü değil): konuşma kartı özel isim uyarısından muaf */
const CALENDAR_WORD =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)s?$/;
/** Yaygın dil adları — büyük harfle başlar ama STT standart yazar (yanlış alarm olmasın) */
const LANGUAGE_WORD = /^(English|Spanish|French|German|Italian|Chinese|Japanese|Arabic|Russian|Portuguese|Turkish)$/;
const ARRANGE_MAX_WORDS = 10;

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

function hasUniqueOptions(options: string[]): boolean {
  return new Set(options.map(norm)).size === options.length;
}

/** Tek cümle mi — ortadaki . ! ? bölünme işaretidir (kısaltma "Mr." istisna sayılmaz: kart cümlesi kısa olmalı) */
function isSingleSentence(s: string): boolean {
  return !/[.!?]\s+\S/.test(s.trim());
}

function lintItem(d: DrillItem, errors: string[], warnings: string[]): void {
  const where = `drill '${d.id}' (${d.type})`;
  if ("options" in d) {
    if (!hasUniqueOptions(d.options)) errors.push(`${where}: şıklar benzersiz olmalı`);
  }

  switch (d.type) {
    case "fill_choice": {
      const blanks = (d.sentence.match(/___/g) ?? []).length;
      if (blanks !== 1) errors.push(`${where}: tam BİR ___ olmalı (${blanks} var)`);
      if (d.options.some((o) => o.includes("___"))) errors.push(`${where}: şıkta ___ olamaz`);
      break;
    }
    case "arrange":
    case "listen_arrange": {
      const text = d.type === "arrange" ? d.answer : d.audio;
      const n = drillAnswerTiles(d).length;
      if (n < ARRANGE_MIN_WORDS || n > ARRANGE_MAX_WORDS) {
        errors.push(`${where}: ${ARRANGE_MIN_WORDS}-${ARRANGE_MAX_WORDS} kelime olmalı (${n})`);
      }
      // İki cümle kartlara bölününce tek doğru dizi kalmaz (checkpoint'teki ders)
      if (!isSingleSentence(text)) errors.push(`${where}: TEK cümle olmalı — "${text}"`);
      const tiles = new Set(drillAnswerTiles(d).map((t) => (sentenceTiles(t)[0] ?? t).toLowerCase()));
      for (const x of d.extraTiles) {
        if (sentenceTiles(x).length !== 1) errors.push(`${where}: çeldirici kart tek kelime olmalı — "${x}"`);
        if (tiles.has(sentenceTiles(x)[0]?.toLowerCase() ?? "")) {
          errors.push(`${where}: çeldirici kart "${x}" doğru cümlede zaten var`);
        }
      }
      break;
    }
    case "find_error": {
      const words = d.sentence.split(" ");
      const wrong = sentenceTiles(words[d.wrongIndex] ?? "")[0] ?? "";
      if (!wrong) errors.push(`${where}: wrongIndex bir kelimeyi göstermiyor`);
      if (norm(wrong) === norm(d.fix)) errors.push(`${where}: fix yanlış kelimeyle aynı`);
      const same = words.filter((w) => norm(sentenceTiles(w)[0] ?? "") === norm(wrong)).length;
      if (same > 1) errors.push(`${where}: yanlış kelime "${wrong}" cümlede birden çok kez geçiyor`);
      break;
    }
    case "complete_chat": {
      const blanks = d.lines.filter((l) => l.text === null);
      if (blanks.length !== 1) errors.push(`${where}: tam BİR boş satır olmalı (${blanks.length})`);
      else if (blanks[0]!.who !== "you") errors.push(`${where}: boş satır öğrencinin (you) olmalı`);
      break;
    }
    case "match": {
      if (!hasUniqueOptions(d.pairs.map((p) => p.left))) errors.push(`${where}: sol taraf benzersiz olmalı`);
      if (!hasUniqueOptions(d.pairs.map((p) => p.right))) errors.push(`${where}: sağ taraf benzersiz olmalı`);
      break;
    }
    case "listen_choose": {
      if (norm(d.options[d.correctIndex] ?? "") !== norm(d.audio)) {
        errors.push(`${where}: doğru şık duyulan cümlenin birebir aynısı olmalı`);
      }
      break;
    }
    case "speak": {
      if (!isSingleSentence(d.sentence)) warnings.push(`${where}: konuşma kartı tek cümle olmalı`);
      // Cümle başı ve "I" dışındaki büyük harfli kelime büyük ihtimalle özel isimdir:
      // STT "Ana"yı "Anna" yazar ve öğrenci doğru söylediği hâlde reddedilir.
      // Gün ve ay adları büyük harfle başlar ama STT onları sorunsuz yazar — istisna
      const names = sentenceTiles(d.sentence)
        .slice(1)
        .filter((w) => /^[A-Z]/.test(w) && !/^I('|$)/.test(w) && !CALENDAR_WORD.test(w) && !LANGUAGE_WORD.test(w));
      if (names.length) warnings.push(`${where}: özel isim içeriyor (${names.join(", ")}) — STT yanlış yazabilir`);
      break;
    }
    case "situation":
      break;
  }
}

/**
 * `pointIds`: çekirdeğin öğretim maddesi kimlikleri. `kind` yoksa (admin ekranı,
 * LLM üretimi) sayı aralığı denetlenmez — kapsam ve yapı yine denetlenir.
 */
export function lintDrills(
  beat: CoreDrillsBeat,
  pointIds: ReadonlySet<string>,
  kind: LessonKind | undefined,
  errors: string[],
  warnings: string[],
): void {
  const items = beat.items;
  const ids = items.map((d) => String(d.id));
  if (new Set(ids).size !== ids.length) errors.push("drill id'leri benzersiz değil");

  for (const d of items) lintItem(d, errors, warnings);

  // Kapsam — öğretim maddesi başına sayı + karışık set
  const counts = new Map<string, number>();
  for (const d of items) {
    if (d.pointRef !== DRILL_MIX_REF && !pointIds.has(d.pointRef)) {
      errors.push(`drill '${d.id}': pointRef "${d.pointRef}" bir öğretim maddesi değil`);
    }
    counts.set(d.pointRef, (counts.get(d.pointRef) ?? 0) + 1);
  }
  for (const p of pointIds) {
    const n = counts.get(p) ?? 0;
    if (n < DRILLS_PER_POINT_MIN) {
      errors.push(`öğretim maddesi "${p}": ${n} drill — en az ${DRILLS_PER_POINT_MIN} olmalı`);
    }
  }
  if (pointIds.size >= 2 && (counts.get(DRILL_MIX_REF) ?? 0) < DRILL_MIX_MIN) {
    errors.push(`${pointIds.size} öğretim maddesi var — en az ${DRILL_MIX_MIN} karışık (mix) drill olmalı`);
  }

  // Sayı — ders tipine göre. Üst sınır kapsam kuralının gerektirdiği en az sayının
  // ALTINA düşmez: 3 öğretim maddeli practice dersi 3×3+2 = 11 maddeye ihtiyaç duyar,
  // sabit 8 tavanı lint'i geçilemez kılıyordu (A2 Ü6–7 yazımında görüldü).
  if (kind) {
    const [min, baseMax] = DRILL_COUNT_RANGE[kind];
    const coverageMin = pointIds.size * DRILLS_PER_POINT_MIN + (pointIds.size >= 2 ? DRILL_MIX_MIN : 0);
    const max = Math.max(baseMax, coverageMin);
    if (items.length < min || items.length > max) {
      errors.push(`${kind} dersi: ${items.length} drill — ${min}-${max} bekleniyor`);
    }
  }

  // Çeşitlilik — oyun hissi + konuşma ayrımımız (konuşma kartı ve dinleme zorunlu)
  const types = new Set(items.map((d) => d.type));
  if (types.size < DRILL_TYPES_MIN) errors.push(`${types.size} farklı tür — en az ${DRILL_TYPES_MIN} olmalı`);
  if (!types.has("speak")) errors.push("en az bir konuşma kartı (speak) olmalı");
  if (!types.has("listen_choose") && !types.has("listen_arrange")) errors.push("en az bir dinleme maddesi olmalı");
  let run = 1;
  for (let i = 1; i < items.length; i++) {
    run = items[i]!.type === items[i - 1]!.type ? run + 1 : 1;
    if (run > DRILL_SAME_TYPE_RUN_MAX) {
      errors.push(`drill '${items[i]!.id}': aynı tür (${items[i]!.type}) art arda ${run}. kez`);
    }
  }

  // Karışık set SONDA: önce madde madde, sonra ayırt etme
  const firstMix = items.findIndex((d) => d.pointRef === DRILL_MIX_REF);
  if (firstMix !== -1 && items.slice(firstMix).some((d) => d.pointRef !== DRILL_MIX_REF)) {
    warnings.push("karışık (mix) drill'ler bloğun sonunda toplanmalı");
  }
}
