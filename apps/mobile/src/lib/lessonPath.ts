import {
  CEFR_LEVELS,
  type CefrLevel,
  type CurriculumLesson,
  type CurriculumResponse,
  type UnitCheckpointSummary,
} from "@glotmate/contracts";

/**
 * Ders yolu — SAF dönüşüm: müfredat yanıtı → ekranda çizilecek satır listesi.
 *
 * Ekranda mantık birikmesin diye burada yaşar: API yok, state yok, React yok.
 * Kural (kök CLAUDE.md): ünite testi bir KAPI DEĞİL AYNADIR — hiçbir dersi
 * kilitlemez, bu yüzden "locked" diye bir durum YOK. Başlanmamış her ders
 * tıklanabilir; `upcoming` yalnızca görsel bir sönüklüktür.
 *
 * TÜM SEVİYELER TEK YOLDA (ürün kararı): A1→C2 tek kaydırılabilir liste,
 * seviye kartlarıyla bölünmüş. Sınıflandırma çıpası PROFİL seviyesidir
 * (`curriculum.level`) ve gezinmeyle DEĞİŞMEZ:
 *  · profilin ALTI  → "geçilmiş müfredat": tüm düğümler completed stilinde
 *    (gerçek ilerlemeden bağımsız — kullanıcı kararı); yine girilebilir.
 *  · profilin KENDİSİ → gerçek durum + "current" (kaldığı ders).
 *  · profilin ÜSTÜ  → gerçek durum (çoğu upcoming; dersler MVP kuralıyla açık).
 *
 * KIVRIMLI YOL: seviye = bir yol. Düğümler ekranda sağa-sola salınan bir
 * S-eğrisi üzerinde durur (`pos.lane`: -1 sol, 0 orta, 1 sağ); ardışık iki
 * düğüm arası tek bir eğri parçasıdır. İlerleme eğride okunur — parça, ÜSTÜNDEKİ
 * düğüm tamamlanmışsa dolu mor (`done`), değilse noktalı gri (`todo`). Ünite
 * kilometre taşı da yolun üstündedir (yol ünite geçişinde kopmaz), yalnız
 * seviye kartı böler (`none`; `pos.prev/next` null).
 */

/**
 * `ready` yalnız ünite testine ait: dersler bitmiş, sınav açık ve bekliyor.
 * `current`ten ayrıdır — biri "şu an buradasın", öteki "burası seni bekliyor".
 */
export type NodeState = "completed" | "current" | "ready" | "upcoming";

/** Seviye başlığının üç hâli — profil seviyesine göre */
export type LevelState = "completed" | "active" | "upcoming";

/** Eğri parçası: mor (üstündeki düğüm tamam), noktalı gri, ya da yok (seviye sınırı) */
export type LineState = "done" | "todo" | "none";
export interface SpineLine {
  above: LineState;
  below: LineState;
}

/** Düğümün yol üstündeki yeri: kendi şeridi + komşularının şeridi (eğri iki ucu bilmeli) */
export interface PathPos {
  lane: number;
  prev: number | null;
  next: number | null;
}

/** Şerit döngüsü — orta, sağ, orta, sol: yumuşak bir sinüs */
const LANES = [0, 1, 0, -1];

export interface RowTotals {
  lessons: number;
  completed: number;
}

export type PathRow =
  | { kind: "level"; key: string; level: CefrLevel; label: string; state: LevelState; totals: RowTotals }
  | {
      kind: "unit";
      key: string;
      unitIndex: number;
      title: string;
      /** Can-do cümlesi — ünite bitince öğrencinin yapabildiği şey (kanonik İngilizce) */
      goal: string;
      done: number;
      total: number;
      line: SpineLine;
      pos: PathPos;
    }
  | { kind: "lesson"; key: string; lesson: CurriculumLesson; state: NodeState; line: SpineLine; pos: PathPos }
  | {
      kind: "test";
      key: string;
      level: CefrLevel;
      unitIndex: number;
      unitTitle: string;
      state: NodeState;
      checkpoint: UnitCheckpointSummary | null;
      line: SpineLine;
      pos: PathPos;
    };

/** Satır yükseklikleri SABİT — FlatList `getItemLayout` bunlarla ölçüm yapmadan kaydırır. */
export const LEVEL_ROW_H = 132;
/** Ünite ve düğüm satırları AYNI yükseklikte ve düğüm merkezi aynı `NODE_CY`'de:
 *  eğri geometrisi böylece tek tip — her satır komşusunu ±NODE_ROW_H'de bilir. */
export const NODE_ROW_H = 132;
export const UNIT_ROW_H = NODE_ROW_H;
/** Düğüm merkezinin satır içindeki dikey konumu; altında başlık için yer kalır */
export const NODE_CY = 48;

export function rowHeight(row: PathRow): number {
  if (row.kind === "level") return LEVEL_ROW_H;
  return row.kind === "unit" ? UNIT_ROW_H : NODE_ROW_H;
}

/** Profil seviyesinin dilimi — odak ve "kaldığı ders" YALNIZ burada aranır. */
function ownLevel(curriculum: CurriculumResponse) {
  return curriculum.levels.find((l) => l.level === curriculum.level) ?? null;
}

/**
 * Kaldığı yer: PROFİL seviyesinde önce yarım kalmış ders, yoksa `position`
 * sırasına göre ilk başlanmamış ders. (position seviye İÇİ tekildir — arama
 * bilerek tek seviyenin bucket'ında yapılır, tüm listede position çakışır.)
 * Profil seviyesi bittiyse null — hiçbir düğüm "current" olmaz.
 */
export function currentLesson(curriculum: CurriculumResponse): CurriculumLesson | null {
  const own = ownLevel(curriculum);
  if (!own) return null;
  const all = own.units.flatMap((u) => u.lessons).sort((a, b) => a.position - b.position);
  return all.find((l) => l.status === "in_progress") ?? all.find((l) => l.status !== "completed") ?? null;
}

/** "Devam et" kartı için: kaldığı ders + ait olduğu ünitenin başlığı. */
export function currentPlacement(
  curriculum: CurriculumResponse,
): { lesson: CurriculumLesson; unitTitle: string } | null {
  const lesson = currentLesson(curriculum);
  if (!lesson) return null;
  const unit = ownLevel(curriculum)?.units.find((u) => u.index === lesson.unitIndex);
  return { lesson, unitTitle: unit?.title ?? "" };
}

/**
 * Seviye içindeki satırlara eğri parçalarını ve şeritleri işler. Renk kuralı tek:
 * parça, ÜSTÜNDEKİ düğüm tamamsa `done`. Ünite kilometre taşı düğüm sayılmaz:
 * üst parçası önceki düğümü izler, alt parçası altındaki düğümün üst parçasını
 * AYNALAR. Seviyenin ilk düğümünün üstünde düğüm yoktur; giriş parçası kendi
 * durumunu alır. Seviyenin ilk satırında üst, son satırında alt parça yoktur.
 *
 * Şeritler LANES döngüsüyle dağıtılır; kilometre taşı, kartına yer açmak için
 * hep kenarda durur ve bir sonraki düğümün TERS tarafını seçer (yol her ünite
 * geçişinde ekranı çaprazlar — aynı şeritte dik iniş olmaz).
 */
function threadSpine(rows: PathRow[]): PathRow[] {
  let prevDone: boolean | null = null; // null → seviyede henüz düğüm görülmedi
  const out: PathRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const last = i === rows.length - 1;
    if (row.kind === "level") {
      out.push(row);
      continue;
    }
    if (row.kind === "unit") {
      const above: LineState = prevDone === null ? "none" : prevDone ? "done" : "todo";
      out.push({ ...row, line: { above, below: "todo" } }); // below ikinci geçişte aynalanır
      continue;
    }
    const done = row.state === "completed";
    const above: LineState = prevDone === null ? (done ? "done" : "todo") : prevDone ? "done" : "todo";
    const below: LineState = last ? "none" : done ? "done" : "todo";
    out.push({ ...row, line: { above, below } });
    prevDone = done;
  }

  // Şeritler: düğümler döngüden; kilometre taşı hep kenarda, önceki düğümün TERS
  // tarafında (kenardan geliyorsa) ve sonraki ders aynı şeride düşmez — yol her
  // ünite geçişinde ekranı çaprazlar, dik iniş olmaz.
  const lanes: number[] = [];
  let k = 0;
  let prevLane: number | null = null;
  for (let i = 0; i < out.length; i++) {
    const row = out[i]!;
    if (row.kind === "level") {
      lanes.push(0);
      prevLane = null;
      continue;
    }
    let lane: number;
    if (row.kind === "unit") {
      lane = prevLane === 1 ? -1 : prevLane === -1 ? 1 : LANES[(k + 1) % LANES.length] === -1 ? 1 : -1;
      k++;
      if (LANES[k % LANES.length] === lane) k++; // sonraki düğüm aynı şeritte olmasın
    } else {
      lane = LANES[k % LANES.length]!;
      k++;
    }
    lanes.push(lane);
    prevLane = lane;
  }

  return out.map((row, i) => {
    if (row.kind === "level") return row;
    const prevRow = out[i - 1];
    const nextRow = out[i + 1];
    const pos: PathPos = {
      lane: lanes[i]!,
      prev: prevRow && prevRow.kind !== "level" ? lanes[i - 1]! : null,
      next: nextRow && nextRow.kind !== "level" ? lanes[i + 1]! : null,
    };
    if (row.kind !== "unit") return { ...row, pos };
    // Kilometre taşının alt parçası = altındaki düğümün üst parçası
    const below: LineState = nextRow && nextRow.kind !== "level" ? nextRow.line.above : "none";
    return { ...row, pos, line: { ...row.line, below } };
  });
}

/** Seviye kartı + ünite başlıkları + ders/test düğümleri — A1→C2 tek düz liste. */
export function buildPathRows(curriculum: CurriculumResponse): PathRow[] {
  const currentId = currentLesson(curriculum)?.id ?? null;
  const profileIdx = CEFR_LEVELS.indexOf(curriculum.level);

  return curriculum.levels.flatMap<PathRow>((lvl) => {
    const idx = CEFR_LEVELS.indexOf(lvl.level);
    const cls: LevelState = idx < profileIdx ? "completed" : idx === profileIdx ? "active" : "upcoming";
    // Alt seviyede HER düğüm completed stilinde — "geçilmiş müfredat" hissi
    // (gerçek lesson_progress'ten bağımsız; düğümler dokunulabilir kalır).
    const forceDone = cls === "completed";

    const unitRows = lvl.units.flatMap<PathRow>((unit) => {
      const lessons = unit.lessons.map<PathRow>((lesson) => ({
        kind: "lesson",
        key: lesson.id, // katalog id'si global tekil (seviye slug'ın içinde)
        lesson,
        state: forceDone
          ? "completed"
          : lesson.status === "completed"
            ? "completed"
            : lesson.id === currentId
              ? "current"
              : "upcoming",
        line: { above: "none", below: "none" }, // threadSpine doldurur
        pos: { lane: 0, prev: null, next: null },
      }));

      // Ünitenin kapanış düğümü. ASLA "current" olmaz: test ilerlemenin önünde durmaz.
      // Yeşil onay "test geçildi" demek (alt seviyelerde "geçilmiş müfredat" stili hariç).
      const doneCount = unit.lessons.filter((l) => l.status === "completed").length;
      const allLessonsDone = doneCount === unit.lessons.length;
      const test: PathRow = {
        kind: "test",
        key: `test-${lvl.level}-${unit.index}`, // unitIndex seviyeler arası çakışır — önek şart
        level: lvl.level,
        unitIndex: unit.index,
        unitTitle: unit.title,
        state: forceDone
          ? "completed"
          : unit.checkpoint?.passed
            ? "completed"
            : allLessonsDone
              ? "ready"
              : "upcoming",
        checkpoint: unit.checkpoint,
        line: { above: "none", below: "none" },
        pos: { lane: 0, prev: null, next: null },
      };

      const header: PathRow = {
        kind: "unit",
        key: `${lvl.level}-u${unit.index}`,
        unitIndex: unit.index,
        title: unit.title,
        goal: unit.goal,
        done: forceDone ? unit.lessons.length : doneCount,
        total: unit.lessons.length,
        line: { above: "none", below: "none" },
        pos: { lane: 0, prev: null, next: null },
      };

      return [header, ...lessons, test];
    });

    const levelRow: PathRow = {
      kind: "level",
      key: `lv-${lvl.level}`,
      level: lvl.level,
      label: lvl.label,
      state: cls,
      // Geçilmiş müfredatta çubuk dolu — düğümlerin completed stiliyle tutarlı
      totals: forceDone ? { lessons: lvl.totals.lessons, completed: lvl.totals.lessons } : lvl.totals,
    };

    return [levelRow, ...threadSpine(unitRows)];
  });
}

/** Başlık kartının kaydırmayı izlerken gösterdiği bağlam */
export interface PathContext {
  level: CefrLevel;
  label: string;
  unitTitle: string;
  /** Ünitedeki tamamlanan/toplam ders — ünite dışındayken (seviye satırı) null */
  progress: { done: number; total: number } | null;
}

/**
 * Her satır için o anda geçerli seviye/ünite bağlamı — başlık kartı kaydırma
 * ofsetinden bulunan satırın bağlamını gösterir. Seviye satırı bağlamı yeniler
 * (ünite adı boşalır: henüz üniteye girilmedi), ünite satırı ünite adını ve
 * ilerlemesini günceller, ders/test satırları miras alır.
 */
export function rowContexts(rows: PathRow[]): PathContext[] {
  const out: PathContext[] = [];
  let ctx: PathContext = { level: "A1", label: "", unitTitle: "", progress: null };
  for (const row of rows) {
    if (row.kind === "level") ctx = { level: row.level, label: row.label, unitTitle: "", progress: null };
    else if (row.kind === "unit") ctx = { ...ctx, unitTitle: row.title, progress: { done: row.done, total: row.total } };
    out.push(ctx);
  }
  return out;
}

/** `offset <= y` olan SON satır — ikili arama (offsets artan sıralı). */
export function indexAtOffset(offsets: number[], y: number): number {
  let lo = 0;
  let hi = offsets.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid]! <= y) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
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

/**
 * Açılışta hangi satıra kaydırılacak: kaldığı düğümün BİR ÜSTÜ (bağlam
 * kaybolmasın); current yoksa profil seviyesinin kartı.
 * "Ne olursa olsun uygulama girdiğinde olduğu seviyede gelecek" — çıpa profil.
 */
export function initialRowIndex(rows: PathRow[], profileLevel: CefrLevel): number {
  const i = rows.findIndex((r) => r.kind === "lesson" && r.state === "current");
  if (i >= 0) return Math.max(0, i - 1);
  const header = rows.findIndex((r) => r.kind === "level" && r.level === profileLevel);
  return header < 0 ? 0 : header;
}
