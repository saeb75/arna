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
 * KIVRIMLI YOL (11 Kas 2026, kullanıcı kararı — dalga + ünite kapakları emekli):
 * yol her ünitede AYNI kalıbı tekrar eder, kendi kafasına göre yön değiştirmez.
 * Sıra 0 ortada TEK düğüm, yol sağa akar → sağ kenarda yarım daire → sıra 1'de
 * sağ + sol ÇİFT düğüm, yol sola akar → sol kenarda yarım daire → sıra 2 yine
 * ortada tek düğüm… Çift sıralar sağa, tek sıralar sola akar. Ünite testi her
 * zaman kendi sırasında, ortada, BÜYÜK düğümdür ve ünitenin yolu orada biter.
 *
 * Yarım daire iki sıraya bölünür: üst çeyreği çıkan sıranın, alt çeyreği giren
 * sıranın içinde çizilir. Bu yüzden her sırada yol çizgisi tepeden `ROAD_R`
 * aşağıdadır ve çıkışı olan sıranın yüksekliği tam `2 * ROAD_R`'dir.
 */
export const ROAD_R = 80;
/** Ders sırası: yol çizgisi ortada, yarım daire tam sığar */
export const TRACK_H = 2 * ROAD_R;
/** Test sırası: büyük düğüm + iki satır etiket; çıkışı olmadığı için daha uzun olabilir */
export const TEST_TRACK_H = 224;
/** Ders düğümü renkleri sırayla döner (`path-1…6` token'ları) */
export const PATH_TINTS = 6;

/** Yolun tek durağı — ders ya da ünite testi */
export type PathStop =
  | {
      kind: "lesson";
      key: string;
      lesson: CurriculumLesson;
      state: NodeState;
      /** Ünitedeki sıra (0'dan) — kartta "Ders 3 / 6" */
      indexInUnit: number;
      unitSize: number;
      /** Renk sırası, 0…PATH_TINTS-1 */
      tint: number;
    }
  | {
      kind: "test";
      key: string;
      level: CefrLevel;
      unitIndex: number;
      unitTitle: string;
      state: NodeState;
    };

export interface TrackRow {
  kind: "track";
  key: string;
  /** Duraklar YOLDAKİ sırayla (sola akan çift sırada önce sağdaki) */
  stops: PathStop[];
  /** 1: sağa akar, -1: sola akar */
  dir: 1 | -1;
  /** Ünitenin ilk sırası değilse yukarıdan yarım daireyle girer */
  hasEntry: boolean;
  /** Test sırası değilse aşağıya yarım daireyle çıkar */
  hasExit: boolean;
  /** Çıkış parçası boyalı mı: sonraki sıranın ilk durağına varıldı mı */
  exitReached: boolean;
  /** Ünite testinin sırası */
  test: boolean;
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
  | TrackRow;

/** Satır yükseklikleri SABİT — FlatList `getItemLayout` bunlarla ölçüm yapmadan kaydırır. */
export const LEVEL_ROW_H = 96;
/** Ünite başlığı: ayraç + başlık + `goal` (görsel YOK) */
export const UNIT_ROW_H = 124;

export function rowHeight(row: PathRow): number {
  if (row.kind === "level") return LEVEL_ROW_H;
  if (row.kind === "unit") return UNIT_ROW_H;
  return row.test ? TEST_TRACK_H : TRACK_H;
}

/** Yol bu durağa vardı mı (bitmiş, kaldığın ders ya da sırası gelmiş test) — yolu boyar */
export function reached(stop: PathStop): boolean {
  return stop.state !== "upcoming";
}

/**
 * Bir ünitenin durakları → sıralar. Dersler 1, 2, 1, 2… paketlenir; test her
 * zaman ayrı ve son sıradır. Yön sıra numarasından gelir — kalıp hiç bozulmaz.
 */
export function packUnit(unitKey: string, lessons: PathStop[], test: PathStop): TrackRow[] {
  const groups: PathStop[][] = [];
  let i = 0;
  while (i < lessons.length) {
    const size = groups.length % 2 === 0 ? 1 : 2;
    groups.push(lessons.slice(i, i + size));
    i += size;
  }
  groups.push([test]);
  return groups.map((stops, r) => {
    const next = groups[r + 1];
    const isTest = r === groups.length - 1;
    return {
      kind: "track",
      key: `${unitKey}-r${r}`,
      stops,
      dir: r % 2 === 0 ? 1 : -1,
      hasEntry: r > 0,
      hasExit: !isTest,
      exitReached: next ? reached(next[0]!) : false,
      test: isTest,
    };
  });
}

/** Düğümün ekrandaki yeri — açılan kart onun altında (yer yoksa üstünde) durur */
export interface NodeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TrackGeometry {
  /** Durakların yatay merkezleri — `stops` ile aynı sırada */
  xs: number[];
  /** Yolun tamamı (SVG path) */
  road: string;
  /** Varılmış parçalar */
  done: string;
  /** Çift sırada iki etiket çakışmasın: etiket genişliği */
  labelWidth: number;
}

/**
 * Sıranın geometrisi — SAF: ekran genişliği girer, düğüm konumları ve yol çıkar.
 * Yatay koşu merkezden `run` kadar uzanır, yarım daire ROAD_R yarıçapla kenara
 * taşar; dar ekranda koşu kısalır ki daire ekrandan taşmasın.
 */
export function trackGeometry(row: TrackRow, width: number): TrackGeometry {
  const R = ROAD_R;
  const cx = width / 2;
  const run = Math.max(40, Math.min(100, cx - R - 14));
  const d = run - 20;
  const pair = row.stops.length === 2;
  const xs = pair ? (row.dir === -1 ? [cx + d, cx - d] : [cx - d, cx + d]) : [cx];
  const last = xs[xs.length - 1]!;
  const pieces: { d: string; done: boolean }[] = [];

  if (row.hasEntry) {
    // Üstteki sıranın yarım dairesinin alt çeyreği: sağa akan sıra soldan, sola akan sağdan girer
    const edge = row.dir === 1 ? cx - run : cx + run;
    const from = row.dir === 1 ? edge - R : edge + R;
    const sweep = row.dir === 1 ? 0 : 1;
    pieces.push({ d: `M${from},0 A${R},${R} 0 0 ${sweep} ${edge},${R} H${xs[0]}`, done: reached(row.stops[0]!) });
  }
  for (let i = 1; i < xs.length; i++) {
    pieces.push({ d: `M${xs[i - 1]},${R} H${xs[i]}`, done: reached(row.stops[i]!) });
  }
  if (row.hasExit) {
    // Alttaki sıraya inen yarım dairenin üst çeyreği
    const edge = row.dir === 1 ? cx + run : cx - run;
    const to = row.dir === 1 ? edge + R : edge - R;
    const sweep = row.dir === 1 ? 1 : 0;
    pieces.push({ d: `M${last},${R} H${edge} A${R},${R} 0 0 ${sweep} ${to},${2 * R}`, done: row.exitReached });
  }

  return {
    xs,
    road: pieces.map((p) => p.d).join(" "),
    done: pieces
      .filter((p) => p.done)
      .map((p) => p.d)
      .join(" "),
    labelWidth: Math.min(136, 2 * d - 16),
  };
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

/** Seviye başlığı + ünite başlıkları + yol sıraları — A1→C2 tek düz liste. */
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
      const lessons = unit.lessons.map<PathStop>((lesson, i) => ({
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
        indexInUnit: i,
        unitSize: unit.lessons.length,
        tint: i % PATH_TINTS,
      }));

      // Ünitenin kapanış düğümü. ASLA "current" olmaz: test ilerlemenin önünde durmaz.
      // Onay "test geçildi" demek (alt seviyelerde "geçilmiş müfredat" stili hariç).
      const allLessonsDone = unit.lessons.every((l) => l.status === "completed");
      const test: PathStop = {
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
      };

      const unitKey = `${lvl.level}-u${unit.index}`;
      const done = forceDone ? unit.lessons.length : unit.lessons.filter((l) => l.status === "completed").length;
      const header: PathRow = {
        kind: "unit",
        key: unitKey,
        level: lvl.level,
        unitIndex: unit.index,
        title: unit.title,
        goal: unit.goal,
        done,
        total: unit.lessons.length,
      };
      return [header, ...packUnit(unitKey, lessons, test)];
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
 * günceller, yol sıraları miras alır.
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
 * Açılışta hangi satıra kaydırılacak: kaldığı dersin sırasının BİR ÜSTÜ (bağlam
 * kaybolmasın); current yoksa profil seviyesinin başlığı.
 * "Ne olursa olsun uygulama girdiğinde olduğu seviyede gelecek" — çıpa profil.
 */
export function initialRowIndex(rows: PathRow[], profileLevel: CefrLevel): number {
  const i = rows.findIndex((r) => r.kind === "track" && r.stops.some((s) => s.state === "current"));
  if (i >= 0) return Math.max(0, i - 1);
  const header = rows.findIndex((r) => r.kind === "level" && r.level === profileLevel);
  return header < 0 ? 0 : header;
}
