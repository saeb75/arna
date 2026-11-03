import { CEFR_LEVELS, type CefrLevel, type CurriculumLesson, type CurriculumResponse } from "@glotmate/contracts";

/**
 * Ders yolu — SAF dönüşüm: müfredat yanıtı → ekranda çizilecek satır listesi.
 *
 * Ekranda mantık birikmesin diye burada yaşar: API yok, state yok, React yok.
 * Kural (kök CLAUDE.md): ünite testi bir KAPI DEĞİL AYNADIR — hiçbir dersi
 * kilitlemez, bu yüzden "locked" diye bir durum YOK. Başlanmamış her ders
 * tıklanabilir; `upcoming` yalnızca görsel bir sönüklüktür.
 *
 * TÜM SEVİYELER TEK YOLDA (ürün kararı): A1→C2 tek kaydırılabilir liste,
 * seviye başlıklarıyla bölünmüş. Sınıflandırma çıpası PROFİL seviyesidir
 * (`curriculum.level`) ve gezinmeyle DEĞİŞMEZ:
 *  · profilin ALTI  → "geçilmiş müfredat": başlık ✓, tüm düğümler completed
 *    stilinde (gerçek ilerlemeden bağımsız — kullanıcı kararı); yine girilebilir.
 *  · profilin KENDİSİ → gerçek durum + "current" (kaldığı ders).
 *  · profilin ÜSTÜ  → gerçek durum (çoğu upcoming; dersler MVP kuralıyla açık).
 */

/**
 * `ready` yalnız ünite testine ait: dersler bitmiş, sınav açık ve bekliyor.
 * `current`ten ayrıdır — biri "şu an buradasın", öteki "burası seni bekliyor".
 */
export type NodeState = "completed" | "current" | "ready" | "upcoming";

/** Seviye başlığının üç hâli — profil seviyesine göre */
export type LevelState = "completed" | "active" | "upcoming";

/**
 * YUMUŞAK DALGA (3 Kas 2026, kullanıcı kararı — keskin zikzak emekli; düğüm
 * yapısı Duolingo'ya benzer, renkler bizim): düğümler ünite içi sıralarına göre
 * bir sinüs üstünde durur. `step` ünitedeki sıradır (0'dan, test dahil); yatay
 * kayma `waveX(step)`. Etiket YOK — dokununca düğümün altında kart açılır.
 */
export const WAVE_AMPLITUDE = 72;
const WAVE_PERIOD = 8;

export function waveX(step: number): number {
  return Math.round(WAVE_AMPLITUDE * Math.sin((2 * Math.PI * step) / WAVE_PERIOD) * 10) / 10;
}

export type PathRow =
  | { kind: "level"; key: string; level: CefrLevel; label: string; state: LevelState }
  | {
      kind: "unit";
      key: string;
      level: CefrLevel;
      unitIndex: number;
      title: string;
      goal: string;
      done: number;
      total: number;
    }
  | {
      kind: "lesson";
      key: string;
      lesson: CurriculumLesson;
      state: NodeState;
      step: number;
      /** Ünitedeki ders sayısı — kartta "Ders 3 / 6" */
      unitSize: number;
    }
  | {
      kind: "test";
      key: string;
      level: CefrLevel;
      unitIndex: number;
      unitTitle: string;
      state: NodeState;
      step: number;
    };

/** Satır yükseklikleri SABİT — FlatList `getItemLayout` bunlarla ölçüm yapmadan kaydırır. */
export const LEVEL_ROW_H = 96;
/** Ünite kartı: illüstrasyon + üstünde başlık/`goal` + ilerleme (kart 184 + boşluklar) */
export const UNIT_ROW_H = 232;
/** Düğüm (72 yüz + 8 dudak) + boşluk */
export const NODE_ROW_H = 104;
/** Kaldığın dersin üstündeki "BAŞLA" balonu için ek yükseklik */
export const CURRENT_EXTRA_H = 48;

export function rowHeight(row: PathRow): number {
  if (row.kind === "level") return LEVEL_ROW_H;
  if (row.kind === "unit") return UNIT_ROW_H;
  return row.state === "current" ? NODE_ROW_H + CURRENT_EXTRA_H : NODE_ROW_H;
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

/** Seviye başlığı + ünite pilleri + ders/test düğümleri — A1→C2 tek düz liste. */
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
      const lessons = unit.lessons.map<PathRow>((lesson, i) => ({
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
        step: i,
        unitSize: unit.lessons.length,
      }));

      // Ünitenin kapanış düğümü. ASLA "current" olmaz: test ilerlemenin önünde durmaz.
      // Yeşil onay "test geçildi" demek (alt seviyelerde "geçilmiş müfredat" stili hariç).
      const allLessonsDone = unit.lessons.every((l) => l.status === "completed");
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
        step: unit.lessons.length,
      };

      const done = forceDone ? unit.lessons.length : unit.lessons.filter((l) => l.status === "completed").length;
      const header: PathRow = {
        kind: "unit",
        key: `${lvl.level}-u${unit.index}`,
        level: lvl.level,
        unitIndex: unit.index,
        title: unit.title,
        goal: unit.goal,
        done,
        total: unit.lessons.length,
      };
      return [header, ...lessons, test];
    });

    return [
      { kind: "level", key: `lv-${lvl.level}`, level: lvl.level, label: lvl.label, state: cls },
      ...unitRows,
    ];
  });
}

/** Başlık kartının kaydırmayı izlerken gösterdiği bağlam */
export interface PathContext {
  level: CefrLevel;
  label: string;
  unitTitle: string;
}

/**
 * Her satır için o anda geçerli seviye/ünite bağlamı — başlık kartı kaydırma
 * ofsetinden bulunan satırın bağlamını gösterir. Seviye satırı bağlamı yeniler
 * (ünite adı boşalır: henüz üniteye girilmedi), ünite satırı ünite adını
 * günceller, ders/test satırları miras alır.
 */
export function rowContexts(rows: PathRow[]): PathContext[] {
  const out: PathContext[] = [];
  let ctx: PathContext = { level: "A1", label: "", unitTitle: "" };
  for (const row of rows) {
    if (row.kind === "level") ctx = { level: row.level, label: row.label, unitTitle: "" };
    else if (row.kind === "unit") ctx = { ...ctx, unitTitle: row.title };
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
 * Açılışta hangi satıra kaydırılacak: kaldığı düğümün BİR ÜSTÜ (ünite pili
 * görünsün, bağlam kaybolmasın); current yoksa profil seviyesinin başlığı.
 * "Ne olursa olsun uygulama girdiğinde olduğu seviyede gelecek" — çıpa profil.
 */
export function initialRowIndex(rows: PathRow[], profileLevel: CefrLevel): number {
  const i = rows.findIndex((r) => r.kind === "lesson" && r.state === "current");
  if (i >= 0) return Math.max(0, i - 1);
  const header = rows.findIndex((r) => r.kind === "level" && r.level === profileLevel);
  return header < 0 ? 0 : header;
}
