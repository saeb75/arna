import type { CefrLevel, CurriculumLesson, CurriculumResponse } from "@arna/contracts";

/**
 * Ders yolu — SAF dönüşüm: müfredat yanıtı → ekranda çizilecek satır listesi.
 *
 * Ekranda mantık birikmesin diye burada yaşar: API yok, state yok, React yok.
 * Kural (kök CLAUDE.md): ünite testi bir KAPI DEĞİL AYNADIR — hiçbir dersi
 * kilitlemez, bu yüzden "locked" diye bir durum YOK. Başlanmamış her ders
 * tıklanabilir; `upcoming` yalnızca görsel bir sönüklüktür.
 */

/**
 * `ready` yalnız ünite testine ait: dersler bitmiş, sınav açık ve bekliyor.
 * `current`ten ayrıdır — biri "şu an buradasın", öteki "burası seni bekliyor".
 */
export type NodeState = "completed" | "current" | "ready" | "upcoming";

/** Zikzak: ünite içi sıraya göre yatay kayma — fotoğraftan ölçüldü (merkez, sol, merkez, sağ) */
export type NodeSide = -1 | 0 | 1;
const SIDES: NodeSide[] = [0, -1, 0, 1];

export type PathRow =
  | { kind: "unit"; key: string; title: string }
  | { kind: "lesson"; key: string; lesson: CurriculumLesson; state: NodeState; side: NodeSide }
  | {
      kind: "test";
      key: string;
      level: CefrLevel;
      unitIndex: number;
      unitTitle: string;
      state: NodeState;
      side: NodeSide;
    };

/** Satır yükseklikleri SABİT — FlatList `getItemLayout` bunlarla ölçüm yapmadan kaydırır. */
export const UNIT_ROW_H = 72;
export const NODE_ROW_H = 154;

export function rowHeight(row: PathRow): number {
  return row.kind === "unit" ? UNIT_ROW_H : NODE_ROW_H;
}

/**
 * Kaldığı yer: önce yarım kalmış ders, yoksa `position` sırasına göre ilk
 * başlanmamış ders. Hepsi bittiyse null — o zaman hiçbir düğüm "current" olmaz.
 */
export function currentLesson(curriculum: CurriculumResponse): CurriculumLesson | null {
  const all = curriculum.units.flatMap((u) => u.lessons).sort((a, b) => a.position - b.position);
  return all.find((l) => l.status === "in_progress") ?? all.find((l) => l.status !== "completed") ?? null;
}

/** "Devam et" kartı için: kaldığı ders + ait olduğu ünitenin başlığı. */
export function currentPlacement(
  curriculum: CurriculumResponse,
): { lesson: CurriculumLesson; unitTitle: string } | null {
  const lesson = currentLesson(curriculum);
  if (!lesson) return null;
  const unit = curriculum.units.find((u) => u.index === lesson.unitIndex);
  return { lesson, unitTitle: unit?.title ?? "" };
}

/** Ünite pili + ders düğümleri + ünite testi düğümü — tek düz liste. */
export function buildPathRows(curriculum: CurriculumResponse): PathRow[] {
  const currentId = currentLesson(curriculum)?.id ?? null;

  return curriculum.units.flatMap<PathRow>((unit) => {
    const lessons = unit.lessons.map<PathRow>((lesson, i) => ({
      kind: "lesson",
      key: lesson.id,
      lesson,
      state: lesson.status === "completed" ? "completed" : lesson.id === currentId ? "current" : "upcoming",
      side: SIDES[i % SIDES.length]!,
    }));

    // Ünitenin kapanış düğümü. ASLA "current" olmaz: test ilerlemenin önünde durmaz.
    //
    // Yeşil onay artık "dersler bitti" DEĞİL, "test geçildi" demek — rozetin
    // anlamı sınavın kendisinden gelmeli, yoksa hiç girilmemiş bir test
    // tamamlanmış görünürdü. Derslerin bitmesi yalnız sınavı AÇAR.
    const allLessonsDone = unit.lessons.every((l) => l.status === "completed");
    const test: PathRow = {
      kind: "test",
      key: `test-${unit.index}`,
      level: curriculum.level,
      unitIndex: unit.index,
      unitTitle: unit.title,
      state: unit.checkpoint?.passed ? "completed" : allLessonsDone ? "ready" : "upcoming",
      side: SIDES[unit.lessons.length % SIDES.length]!,
    };

    return [{ kind: "unit", key: `u${unit.index}`, title: unit.title }, ...lessons, test];
  });
}

/**
 * Her satırın listedeki dikey konumu (kümülatif). FlatList `getItemLayout`
 * bunu ölçüm beklemeden kullanır — kaldığı düğüme açılışta kaydırabilmenin şartı.
 */
export function rowOffsets(rows: PathRow[]): number[] {
  const offsets: number[] = [];
  let acc = 0;
  for (const row of rows) {
    offsets.push(acc);
    acc += rowHeight(row);
  }
  return offsets;
}

/** Açılışta hangi satıra kaydırılacak — kaldığı düğüm, yoksa en baş. */
export function initialRowIndex(rows: PathRow[]): number {
  const i = rows.findIndex((r) => r.kind === "lesson" && r.state === "current");
  return i < 0 ? 0 : i;
}
