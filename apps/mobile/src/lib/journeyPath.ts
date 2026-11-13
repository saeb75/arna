import type { CefrLevel, CurriculumResponse } from "@glotmate/contracts";
import { buildPathRows, LEVEL_ROW_H, UNIT_ROW_H, type LevelState, type PathStop } from "./lessonPath";

/**
 * YOLCULUK GÖRÜNÜMÜ (13 Kas 2026, DENEME — kullanıcı referans görselden örnek istedi;
 * beğenilmezse kıvrımlı yola dönülür, o kod dokunulmadan duruyor).
 *
 * SAF dönüşüm: `buildPathRows`un durumları (completed/current/ready/upcoming, alt
 * seviyede "geçilmiş müfredat") AYNEN kullanılır — yalnız çizim değişir: her satırda
 * TEK durak (düğüm + hap kart), iki sütun arasında zikzak, ünite içinde düğümleri
 * yılankavi yolla bağlanır. Büyük başlık bölümü (hero) ekranın ÜSTÜNDE SABİTTİR (liste
 * satırı değil — 13 Kas 2026, kullanıcı: "yukarıdaki alan sabit olacak"); başlığı HEP kaldığın
 * dersin ünitesidir, kaydırmayla değişmez (`journeyContexts[journeyStartIndex]`).
 */

// Ölçüler referans görselden (küçük, sade; ekrana ~7 durak sığar): düğüm 46, kart 50, satır 72
export const JOURNEY_STOP_H = 72;
export const JOURNEY_TEST_H = 72;
export const JOURNEY_HERO_H = 316;
/** Düğümün yatay konumu — ekran genişliğinin oranı (sol / sağ sütun) */
export const JOURNEY_COLS = [0.2, 0.45] as const;
/** Hap kartın sağ kenarı — ekran genişliğinin oranı (sütun başına) */
export const JOURNEY_CARD_RIGHT = [0.66, 0.92] as const;
/** Yolun U dönüşü — soldaki düğümden sol kenara, sağdakinden sağa (ekran oranı) */
const TURN_X = [0.07, 0.8] as const;

export type JourneyRow =
  | { kind: "level"; key: string; level: CefrLevel; label: string; state: LevelState }
  | { kind: "unit"; key: string; unitIndex: number; title: string; goal: string; done: number; total: number }
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
    case "stop":
      return row.stop.kind === "test" ? JOURNEY_TEST_H : JOURNEY_STOP_H;
  }
}

export function buildJourneyRows(curriculum: CurriculumResponse): JourneyRow[] {
  const out: JourneyRow[] = [];
  let level: CefrLevel = curriculum.level;
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
      out.push(row);
    } else {
      out.push({ kind: "unit", key: row.key, unitIndex: row.unitIndex, title: row.title, goal: row.goal, done: row.done, total: row.total });
    }
  }
  flush();

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

/**
 * Açılışta listenin tepesine gelecek satır: kaldığın dersin ünitesinin İLK DURAĞI (ünite
 * başlığı sabit başlık bölümünde zaten yazıyor — satır tekrar görünmesin); kaldığın ders
 * yoksa profil seviyesinin ilk ünitesi.
 */
export function journeyStartIndex(rows: JourneyRow[], profileLevel: CefrLevel): number {
  const cur = rows.findIndex((r) => r.kind === "stop" && r.stop.state === "current");
  if (cur >= 0) {
    for (let i = cur; i >= 0; i--) if (rows[i]!.kind === "unit") return Math.min(i + 1, rows.length - 1);
    return cur;
  }
  const lv = rows.findIndex((r) => r.kind === "level" && r.level === profileLevel);
  const unit = rows.findIndex((r, i) => i > lv && r.kind === "unit");
  return unit >= 0 ? Math.min(unit + 1, rows.length - 1) : Math.max(0, lv);
}

/** Sabit başlık bölümünün gösterdiği ünite */
export interface JourneyContext {
  level: CefrLevel;
  levelLabel: string;
  title: string;
  goal: string;
}

/**
 * Her satırın ünitesi (başlık kaldığın yerinkini okur): satırın ait olduğu ünite; seviye başlığında
 * (henüz üniteye girilmedi) o seviyenin ilk ünitesi. Ardışık satırlar AYNI nesneyi paylaşır
 * (kaydırırken gereksiz yeniden çizim olmasın).
 */
export function journeyContexts(rows: JourneyRow[]): JourneyContext[] {
  const out: JourneyContext[] = new Array(rows.length);
  let level: CefrLevel = "A1";
  let levelLabel = "";
  let ctx: JourneyContext | null = null;
  rows.forEach((r, i) => {
    if (r.kind === "level") {
      level = r.level;
      levelLabel = r.label;
      const next = rows.slice(i + 1).find((x) => x.kind === "unit");
      ctx = next?.kind === "unit" ? { level, levelLabel, title: next.title, goal: next.goal } : ctx;
    } else if (r.kind === "unit") {
      ctx = { level, levelLabel, title: r.title, goal: r.goal };
    }
    out[i] = ctx ?? { level, levelLabel, title: "", goal: "" };
  });
  // Seviye başlığı ile ilk ünitesi aynı bağlamı paylaşsın
  for (let i = 0; i < rows.length - 1; i++) {
    const a = out[i]!;
    const b = out[i + 1]!;
    if (a !== b && a.title === b.title && a.level === b.level) out[i + 1] = a;
  }
  return out;
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
