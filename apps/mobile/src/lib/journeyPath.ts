import type { CefrLevel, CurriculumResponse } from "@glotmate/contracts";
import { buildPathRows, LEVEL_ROW_H, UNIT_ROW_H, type LevelState, type PathStop } from "./lessonPath";

/**
 * YOLCULUK GÖRÜNÜMÜ (13 Kas 2026, DENEME — kullanıcı referans görselden örnek istedi;
 * beğenilmezse kıvrımlı yola dönülür, o kod dokunulmadan duruyor).
 *
 * SAF dönüşüm: `buildPathRows`un durumları (completed/current/ready/upcoming, alt
 * seviyede "geçilmiş müfredat") AYNEN kullanılır — yalnız çizim değişir: her satırda
 * TEK durak (düğüm + hap kart), iki sütun arasında zikzak, ünite içinde düğümleri
 * yumuşak S eğrisiyle bağlayan yol. Kaldığın ünitenin başlığı yerine büyük başlık
 * bölümü (hero) durur ve ekran oraya açılır.
 */

// Ölçüler referans görselden (küçük, sade; ekrana ~7 durak sığar): düğüm 46, kart 50, satır 72
export const JOURNEY_STOP_H = 72;
export const JOURNEY_TEST_H = 72;
export const JOURNEY_HERO_H = 304;
/** Düğümün yatay konumu — ekran genişliğinin oranı (sol / sağ sütun) */
export const JOURNEY_COLS = [0.2, 0.45] as const;
/** Hap kartın sağ kenarı — ekran genişliğinin oranı (sütun başına) */
export const JOURNEY_CARD_RIGHT = [0.66, 0.92] as const;
/** Yolun U dönüşü — soldaki düğümden sol kenara, sağdakinden sağa (ekran oranı) */
const TURN_X = [0.07, 0.8] as const;

export type JourneyRow =
  | { kind: "level"; key: string; level: CefrLevel; label: string; state: LevelState }
  | { kind: "unit"; key: string; unitIndex: number; title: string; goal: string; done: number; total: number }
  | { kind: "hero"; key: string; level: CefrLevel; levelLabel: string; unitIndex: number; title: string; goal: string }
  | {
      kind: "stop";
      key: string;
      stop: PathStop;
      level: CefrLevel;
      col: 0 | 1;
      /** Üstteki / alttaki durağın sütunu — ünitenin ilk/son durağında null (yol orada başlar/biter) */
      prevCol: 0 | 1 | null;
      nextCol: 0 | 1 | null;
      /** Bu duraktan alttakine giden yol boyalı mı (alttaki durağa varıldı) */
      exitDone: boolean;
    };

const reachedStop = (s: PathStop) => s.state !== "upcoming";

export function journeyRowHeight(row: JourneyRow): number {
  switch (row.kind) {
    case "level":
      return LEVEL_ROW_H;
    case "unit":
      return UNIT_ROW_H;
    case "hero":
      return JOURNEY_HERO_H;
    case "stop":
      return row.stop.kind === "test" ? JOURNEY_TEST_H : JOURNEY_STOP_H;
  }
}

export function buildJourneyRows(curriculum: CurriculumResponse): JourneyRow[] {
  const out: JourneyRow[] = [];
  let level: CefrLevel = curriculum.level;
  let levelLabel = curriculum.label;
  // Bir ünitenin durakları toplanır, ünite bitince satırlara dökülür (komşu sütun bilgisi için)
  let pending: PathStop[] = [];

  const flush = () => {
    pending.forEach((stop, i) => {
      const col = (i % 2) as 0 | 1;
      const prev = pending[i - 1];
      const next = pending[i + 1];
      out.push({
        kind: "stop",
        key: stop.key,
        stop,
        level,
        col,
        prevCol: prev ? (((i - 1) % 2) as 0 | 1) : null,
        nextCol: next ? (((i + 1) % 2) as 0 | 1) : null,
        exitDone: next ? reachedStop(next) : false,
      });
    });
    pending = [];
  };

  for (const row of buildPathRows(curriculum)) {
    if (row.kind === "track") {
      pending.push(...row.stops);
      continue;
    }
    flush();
    if (row.kind === "level") {
      level = row.level;
      levelLabel = row.label;
      out.push(row);
    } else {
      out.push({ kind: "unit", key: row.key, unitIndex: row.unitIndex, title: row.title, goal: row.goal, done: row.done, total: row.total });
    }
  }
  flush();

  // Hero: kaldığın dersin ünitesi; yoksa profil seviyesinin ilk ünitesi. Ünite başlığının YERİNİ alır.
  let heroAt = -1;
  const cur = out.findIndex((r) => r.kind === "stop" && r.stop.state === "current");
  if (cur >= 0) {
    for (let i = cur; i >= 0; i--) if (out[i]!.kind === "unit") { heroAt = i; break; }
  } else {
    const lv = out.findIndex((r) => r.kind === "level" && r.level === curriculum.level);
    heroAt = out.findIndex((r, i) => i > lv && r.kind === "unit");
  }
  const unit = out[heroAt];
  if (unit?.kind === "unit") {
    // Ünitenin seviyesi: yukarıdaki en yakın seviye başlığı
    let lv: Extract<JourneyRow, { kind: "level" }> | null = null;
    for (let i = heroAt; i >= 0; i--) {
      const r = out[i]!;
      if (r.kind === "level") { lv = r; break; }
    }
    out[heroAt] = {
      kind: "hero",
      key: `hero-${unit.key}`,
      level: lv?.level ?? level,
      levelLabel: lv?.label ?? levelLabel,
      unitIndex: unit.unitIndex,
      title: unit.title,
      goal: unit.goal,
    };
  }
  return out;
}

export function journeyOffsets(rows: JourneyRow[]): number[] {
  const offsets: number[] = [];
  let acc = 0;
  for (const r of rows) {
    offsets.push(acc);
    acc += journeyRowHeight(r);
  }
  return offsets;
}

export function journeyHeroIndex(rows: JourneyRow[]): number {
  return Math.max(0, rows.findIndex((r) => r.kind === "hero"));
}

/**
 * Bu düğümden ALTTAKİ düğüme giden yol (SVG `d`), satırın kendi kutusunda — YILANKAVİ
 * (referans): soldaki düğümden yol SOLA çıkar, kenarda U dönüşüyle aşağı kıvrılıp
 * sağdaki düğüme soldan girer; sağdaki düğümden SAĞA çıkar (kartın arkasından), sağda
 * dönüp soldaki düğüme girer. Yatay kısımlar kartların arkasında kalır, dönüşler kartlar
 * arasında görünür. Bağlantıyı TEK satır çizer, çizim satırın altına taşar (sonraki
 * satır üstüne biner). Satır sınırında ikiye bölmek denendi: basamak yapıyordu.
 */
export function journeyLink(
  row: Extract<JourneyRow, { kind: "stop" }>,
  width: number,
  height: number,
  nextHeight: number,
): string | null {
  if (row.nextCol === null) return null;
  const x0 = width * JOURNEY_COLS[row.col];
  const y0 = height / 2;
  const x1 = width * JOURNEY_COLS[row.nextCol];
  const y1 = height + nextHeight / 2;
  const r = (y1 - y0) / 2;
  const turn = width * TURN_X[row.col];
  const f = (n: number) => n.toFixed(1);
  // Sol düğüm: sola git, saat yönü TERSİNE iki çeyrek; sağ düğüm: sağa git, saat yönünde
  const left = row.col === 0;
  const sweep = left ? 0 : 1;
  const edge = left ? turn + r : turn - r;
  return [
    `M ${f(x0)} ${f(y0)}`,
    `L ${f(edge)} ${f(y0)}`,
    `A ${f(r)} ${f(r)} 0 0 ${sweep} ${f(turn)} ${f(y0 + r)}`,
    `A ${f(r)} ${f(r)} 0 0 ${sweep} ${f(edge)} ${f(y1)}`,
    `L ${f(x1)} ${f(y1)}`,
  ].join(" ");
}
