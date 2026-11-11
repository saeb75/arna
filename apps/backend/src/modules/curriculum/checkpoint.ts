import {
  CHECKPOINT_FORMAT,
  CHECKPOINT_ITEM_COUNT,
  ORDER_MAX_WORDS,
  ORDER_MIN_WORDS,
  type Checkpoint,
  type CheckpointItem,
  type DrillItem,
  type LessonCore,
  type LessonLocalePack,
} from "@glotmate/contracts";
import { and, asc, type Column, eq, like, not } from "drizzle-orm";
import { db } from "../../db/client.js";
import { catalogLessons, catalogUnits, lessonCores, lessonLocales } from "../../db/schema.js";
import { getChrome } from "../../i18n/index.js";

/**
 * ÜNİTE SONU TESTİ DERLEYİCİSİ — LLM YOK, yeni içerik YOK.
 *
 * Maddeler o ünitenin YAYINLANMIŞ çekirdeklerinden türetilir. Üç kaynak:
 *   quiz maddeleri · alıştırmalar · öğretim örnek cümleleri
 * Hepsi tek doğru cevaplıdır, dolayısıyla değerlendirme koddadır.
 *
 * NEDEN DERSTEN GÜNLER SONRA: dersin hemen ardından sorulan soru kısa süreli
 * belleği ölçer. Ünite sonunda, altı dersin maddesi KARIŞIK gelince öğrenci
 * yapıları birbirinden ayırt etmek zorunda kalır — konuşmada gereken beceri budur.
 */

export class CheckpointError extends Error {
  constructor(public code: "unit_not_found" | "not_enough_items") {
    super(code);
  }
}

/** Yayınlanmamış ders teste GİRMEZ — yayın kapısı burada da geçerli. */
/**
 * Test fixture'ları (`zz-%`) SERVİS EDİLMEZ. Bu koruma `curriculum/queries.ts`'e
 * eklenmişti ama BURAYA eklenmemişti: rota `unitIndex`'i 99'a kadar kabul ediyor
 * ve fixture birimi tam 99'da duruyor, yani fixture testi kimliği doğrulanmış bir
 * kullanıcıya servis edilebiliyordu. Fixture'lar her koşuda kendilerini yeniden
 * aktif ettiği için koruma SERVİS tarafında olmak zorunda.
 */
const notFixture = (col: Column) => not(like(col, "zz-%"));

async function publishedCoresOfUnit(level: string, unitIndex: number) {
  const rows = await db
    .select({ lessonId: catalogLessons.id, kind: catalogLessons.kind, core: lessonCores.core, coreId: lessonCores.id })
    .from(catalogLessons)
    .innerJoin(
      lessonCores,
      and(
        eq(lessonCores.catalogLessonId, catalogLessons.id),
        eq(lessonCores.specHash, catalogLessons.specHash),
        eq(lessonCores.status, "published"),
      ),
    )
    .where(
      and(
        eq(catalogLessons.level, level),
        eq(catalogLessons.unitIndex, unitIndex),
        eq(catalogLessons.status, "active"),
        notFixture(catalogLessons.id),
      ),
    )
    .orderBy(asc(catalogLessons.position));
  return rows.map((r) => ({ ...r, core: r.core as LessonCore }));
}

type PoolItem = Extract<CheckpointItem, { kind: "drill" }>;

/**
 * Tek cümle mi? İki cümlelik örnek ("Me too! I live there as well.") kartlara
 * bölününce iki cümle birbirine karışır ve madde tek doğru cevaplı olmaktan çıkar.
 */
function isSingleSentence(sentence: string): boolean {
  return !/[.!?]["']?\s+\S/.test(sentence.trim());
}

/**
 * Çeldiricileri doğru cevabın büyük/küçük harf desenine uydur — yoksa öğrenci anlamı
 * bilmeden harften bilebilir ("about | isn't | am not | Is").
 */
function matchCase(sample: string, word: string): string {
  return /^[A-Z]/.test(sample) ? word.charAt(0).toUpperCase() + word.slice(1) : word.charAt(0).toLowerCase() + word.slice(1);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Şıkları RASTGELE karıştırır (dersteki gibi tohumlu değil: test her istekte yeniden
 * derlenir ve `correctIndex` istemciye gider — senkron tutulacak ikinci okuyucu yok).
 * `order[i]` = yeni i. şıkkın eski indeksi (şıkla hizalı geri bildirimi taşımak için).
 */
function shuffleChoices(options: readonly string[], correctIndex: number) {
  const order = shuffle(options.map((_, i) => i));
  return { options: order.map((i) => options[i]!), correctIndex: order.indexOf(correctIndex), order };
}

function shuffledDrill(d: DrillItem): DrillItem {
  if (!("options" in d)) return d;
  const p = shuffleChoices(d.options, d.correctIndex);
  return { ...d, options: p.options, correctIndex: p.correctIndex };
}

const arrangeable = (sentence: string) => {
  const n = sentence.trim().split(/\s+/).length;
  return isSingleSentence(sentence) && n >= ORDER_MIN_WORDS && n <= ORDER_MAX_WORDS;
};

/**
 * Ünitedeki tüm derslerden OYUN MADDESİ havuzu (10 Kas 2026): test de ders gibi
 * oynanır. Kaynaklar:
 *  · yeni formatta dersin oyun bloğu — konuşma kartı HARİÇ (ölçümde STT riski yok);
 *  · quiz maddeleri (derste görülmemiş — geri getirme ölçer): mcq → durum; boşluk → şıklı boşluk YALNIZ eski formatta;
 *  · eski formattaki dersler: alıştırmalar ve öğretim örnekleri dönüştürülür.
 * Boşluk çeldiricileri ÜNİTE genelinden toplanır ("since" mi "for" mu).
 */
function buildPool(lessons: Array<{ lessonId: string; core: LessonCore }>, packs: Map<string, LessonLocalePack>): PoolItem[] {
  const pool: PoolItem[] = [];
  const gapAnswers = new Set<string>();
  for (const { core } of lessons) {
    for (const q of core.quiz ?? []) if (q.type === "fill_blank") for (const alts of q.answers) if (alts[0]) gapAnswers.add(alts[0]);
    for (const b of core.lecture.beats) {
      if (b.kind === "exercise" && b.format === "fill_blank" && b.answerSpec.kind === "token" && b.answerSpec.accepted[0]) {
        gapAnswers.add(b.answerSpec.accepted[0]);
      }
      if (b.kind === "drills") for (const d of b.items) if (d.type === "fill_choice") gapAnswers.add(d.options[d.correctIndex]!);
    }
  }

  for (const { lessonId, core } of lessons) {
    const pack = packs.get(lessonId);
    const push = (id: string, drill: DrillItem, optionFeedback?: string[]) =>
      pool.push({ kind: "drill", id, lessonId, drill, ...(optionFeedback ? { optionFeedback } : {}) });

    const pushGap = (id: string, sentence: string, accepted: string[]) => {
      const correct = accepted[0];
      if (!correct || (sentence.match(/___/g) ?? []).length !== 1) return;
      const ok = new Set(accepted.map((a) => a.toLowerCase()));
      const others = shuffle([...gapAnswers].filter((a) => !ok.has(a.toLowerCase())).map((a) => matchCase(correct, a)))
        .filter((a, i, arr) => arr.indexOf(a) === i)
        .slice(0, 3);
      if (others.length < 1) return;
      const options = shuffle([correct, ...others]);
      push(id, { id, pointRef: "mix", type: "fill_choice", sentence, options, correctIndex: options.indexOf(correct) });
    };
    const pushArrange = (id: string, sentence: string) => {
      if (arrangeable(sentence)) push(id, { id, pointRef: "mix", type: "arrange", answer: sentence, extraTiles: [], alsoAccept: [] });
    };

    const hasDrills = core.lecture.beats.some((b) => b.kind === "drills");
    // Quiz — derste gösterilmez; dil paketindeki şık geri bildirimi aynı permütasyonla taşınır.
    // Yeni formatta quiz BOŞLUĞU teste girmez: çeldiricisi ünite genelinden toplanır ve başka
    // dersin doğru cevabı bu cümlede de doğru olabiliyor ("which"/"that", "would"/"used to") —
    // tek doğru cevap garantisi yalnız yazılmış şıklarda var (oyun bloğu + quiz mcq).
    for (const q of core.quiz ?? []) {
      const id = `${lessonId}:q:${q.id}`;
      if (q.type === "mcq") {
        const p = shuffleChoices(q.options, q.correctIndex);
        const fb = pack?.quizFeedback?.[q.id];
        push(id, { id, pointRef: "mix", type: "situation", context: q.stem, options: p.options, correctIndex: p.correctIndex }, fb ? p.order.map((i) => fb[i] ?? "") : undefined);
      } else if (!hasDrills && q.answers.length === 1 && q.answers[0]) {
        pushGap(id, q.text, q.answers[0]);
      }
    }

    for (const b of core.lecture.beats) {
      if (b.kind === "drills") {
        for (const d of b.items) {
          if (d.type === "speak") continue; // ölçümde STT'ye bağlı ret olmasın
          push(`${lessonId}:d:${d.id}`, shuffledDrill({ ...d, id: `${lessonId}:d:${d.id}` }));
        }
        continue;
      }
      if (hasDrills) continue;
      // Eski format — alıştırmalar ve öğretim örnekleri oyun maddesine dönüştürülür
      if (b.kind === "teach") {
        for (const p of b.points) for (const ex of p.examples) pushArrange(`${lessonId}:ex:${ex.id}`, ex.textEn);
        continue;
      }
      if (b.kind !== "exercise") continue;
      const id = `${lessonId}:b:${b.id}`;
      if (b.format === "mcq" && b.options?.length && b.answerSpec.kind === "choice") {
        const p = shuffleChoices(b.options, b.answerSpec.correctIndex);
        push(id, { id, pointRef: "mix", type: "situation", context: b.item, options: p.options, correctIndex: p.correctIndex });
      } else if (b.format === "fill_blank" && b.answerSpec.kind === "token" && b.answerSpec.accepted[0]) {
        pushGap(id, b.item, b.answerSpec.accepted);
      } else if (b.format === "say_sentence" && b.answerSpec.kind === "utterance" && b.answerSpec.accepted[0]) {
        pushArrange(id, b.answerSpec.accepted[0]);
      }
    }
  }
  return pool;
}

/**
 * ÇEŞİTLİLİKLE örnekle: her adımda en az kullanılmış TÜRDEN ve en az temsil edilen
 * DERSTEN madde seçilir (eşitlikte rastgele) — test bir türün ya da bir dersin
 * tekrarına dönmesin, ünitenin karması olsun.
 */
function sample(pool: PoolItem[], total: number): PoolItem[] {
  const rest = shuffle(pool);
  const picked: PoolItem[] = [];
  const byType = new Map<string, number>();
  const byLesson = new Map<string, number>();
  while (picked.length < total && rest.length) {
    let best = 0;
    let bestScore = -Infinity;
    rest.forEach((it, i) => {
      const score = -2 * (byType.get(it.drill.type) ?? 0) - (byLesson.get(it.lessonId) ?? 0);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    const [it] = rest.splice(best, 1);
    picked.push(it!);
    byType.set(it!.drill.type, (byType.get(it!.drill.type) ?? 0) + 1);
    byLesson.set(it!.lessonId, (byLesson.get(it!.lessonId) ?? 0) + 1);
  }
  return shuffle(picked);
}

export async function buildCheckpoint(opts: {
  level: string;
  unitIndex: number;
  nativeLanguage: string;
  tutorLanguage: "native" | "english";
}): Promise<Checkpoint> {
  const [unit] = await db
    .select()
    .from(catalogUnits)
    .where(
      and(
        eq(catalogUnits.level, opts.level),
        eq(catalogUnits.unitIndex, opts.unitIndex),
        eq(catalogUnits.status, "active"),
        notFixture(catalogUnits.id),
      ),
    )
    .limit(1);
  if (!unit) throw new CheckpointError("unit_not_found");

  const lessons = await publishedCoresOfUnit(opts.level, opts.unitIndex);
  if (lessons.length === 0) throw new CheckpointError("not_enough_items");

  // Şık geri bildirimleri ana dilde: dil paketleri varsa kullanılır, yoksa madde
  // yine çalışır (geri bildirim boş kalır) — test LLM'e ve pakete BAĞIMLI DEĞİL.
  const packs = new Map<string, LessonLocalePack>();
  if (opts.tutorLanguage === "native") {
    const rows = await db
      .select({ coreId: lessonLocales.coreId, pack: lessonLocales.pack })
      .from(lessonLocales)
      .where(and(eq(lessonLocales.language, opts.nativeLanguage), eq(lessonLocales.status, "ready")));
    const byCore = new Map(rows.map((r) => [r.coreId, r.pack as LessonLocalePack]));
    for (const l of lessons) {
      const p = byCore.get(l.coreId);
      if (p) packs.set(l.lessonId, p);
    }
  }

  const pool = buildPool(lessons, packs);
  const items = sample(pool, CHECKPOINT_ITEM_COUNT);
  if (items.length === 0) throw new CheckpointError("not_enough_items");

  const chrome = getChrome(opts.tutorLanguage === "native" ? opts.nativeLanguage : "en");
  return {
    checkpointFormat: CHECKPOINT_FORMAT,
    level: opts.level,
    unitIndex: opts.unitIndex,
    unitTitle: unit.title,
    unitGoal: unit.goal,
    labels: chrome.labels.checkpoint,
    items,
  };
}
