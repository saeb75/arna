import {
  CHECKPOINT_FORMAT,
  CHECKPOINT_ITEM_COUNT,
  ORDER_MAX_WORDS,
  ORDER_MIN_WORDS,
  type Checkpoint,
  type CheckpointItem,
  type LessonCore,
  type LessonLocalePack,
} from "@arna/contracts";
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

type Pool = { mcq: CheckpointItem[]; gap: CheckpointItem[]; order: CheckpointItem[] };

/** Cümleyi kutucuklara böler; noktalama son kelimeye yapışık kalır. */
function tokenize(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

/**
 * Sıralama maddesine UYGUN cümle mi?
 *
 * Testte görüldü: "Me too! I live there as well." gibi İKİ cümlelik örnekler
 * kutucuklara bölününce iki ayrı cümle birbirine karışıyor ve madde tek doğru
 * cevaplı olmaktan çıkıyor (öğrenci hangi sırayı kuracağını bilemez). Cümle
 * sonu noktalaması yalnızca EN SONDA olabilir.
 */
function isSingleSentence(sentence: string): boolean {
  const trimmed = sentence.trim();
  return !/[.!?]["']?\s+\S/.test(trimmed);
}

/**
 * Çeldiricileri doğru cevabın büyük/küçük harf desenine uydur.
 *
 * Testte görüldü: şıklar "about | isn't | am not | Is" gelmişti. Boşluk cümle
 * başındaysa doğru cevap büyük harfle başlar, ünitenin ortasından toplanan
 * çeldiriciler küçük harfle — öğrenci anlamı hiç bilmeden harften bilebilir.
 */
function matchCase(sample: string, word: string): string {
  const startsUpper = /^[A-Z]/.test(sample);
  if (startsUpper) return word.charAt(0).toUpperCase() + word.slice(1);
  return word.charAt(0).toLowerCase() + word.slice(1);
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
 * Şıkları karıştırır ve doğru şıkkın yeni indeksini döndürür; `order[i]` yeni
 * i. şıkkın eski indeksidir (şıkla hizalı dizileri taşımak için).
 *
 * Burada RASTGELE, `resolveLesson`daki gibi tohumlu değil: test her istekte
 * yeniden derleniyor ve `correctIndex` istemciye gidiyor, yani senkron tutulacak
 * ikinci bir okuyucu yok. Tekrar girişte aynı madde farklı dizilimle gelir.
 */
function shuffleChoices(
  options: readonly string[],
  correctIndex: number,
): { options: string[]; correctIndex: number; order: number[] } {
  const order = shuffle(options.map((_, i) => i));
  return { options: order.map((i) => options[i]!), correctIndex: order.indexOf(correctIndex), order };
}

/** Karıştırılmış dizi özgün sırayla aynı çıkarsa madde anlamsız olur. */
function shuffleUntilDifferent(tokens: string[]): string[] {
  if (tokens.length < 2) return tokens;
  for (let i = 0; i < 8; i++) {
    const s = shuffle(tokens);
    if (s.some((t, idx) => t !== tokens[idx])) return s;
  }
  return [...tokens].reverse();
}

/**
 * Ünitedeki tüm derslerden madde havuzu. `gap` çeldiricileri ÜNİTE genelinden
 * toplanır: aynı bloğun başka derslerinden gelen şıklar doğal ayırt etme pratiği
 * yaratır ("since" mi "for" mu, "do" mu "does" mi).
 */
function buildPool(
  lessons: Array<{ lessonId: string; core: LessonCore }>,
  packs: Map<string, LessonLocalePack>,
): Pool {
  const pool: Pool = { mcq: [], gap: [], order: [] };
  const gapAnswers = new Set<string>();

  // Önce tüm boşluk cevaplarını topla — çeldirici havuzu
  for (const { core } of lessons) {
    for (const q of core.quiz ?? []) {
      if (q.type === "fill_blank") for (const alts of q.answers) if (alts[0]) gapAnswers.add(alts[0]);
    }
    for (const b of core.lecture.beats) {
      if (b.kind === "exercise" && b.format === "fill_blank" && b.answerSpec.kind === "token") {
        if (b.answerSpec.accepted[0]) gapAnswers.add(b.answerSpec.accepted[0]);
      }
    }
  }

  for (const { lessonId, core } of lessons) {
    const pack = packs.get(lessonId);

    const pushGap = (id: string, prompt: string, correct: string) => {
      // Çeldiriciler: aynı ünitenin başka cevapları, doğru cevapla çakışmayanlar.
      // Harf deseni doğru cevaba uydurulur — yoksa büyük harf ipucu verir.
      const others = shuffle(
        [...gapAnswers]
          .filter((a) => a.toLowerCase() !== correct.toLowerCase())
          .map((a) => matchCase(correct, a)),
      )
        .filter((a, i, arr) => arr.indexOf(a) === i && a.toLowerCase() !== correct.toLowerCase())
        .slice(0, 3);
      if (others.length < 1) return;
      const options = shuffle([correct, ...others]);
      pool.gap.push({
        kind: "gap",
        id,
        lessonId,
        prompt,
        options,
        correctIndex: options.indexOf(correct),
      });
    };

    const pushOrder = (id: string, sentence: string) => {
      if (!isSingleSentence(sentence)) return;
      const tokens = tokenize(sentence);
      if (tokens.length < ORDER_MIN_WORDS || tokens.length > ORDER_MAX_WORDS) return;
      pool.order.push({ kind: "order", id, lessonId, tokens: shuffleUntilDifferent(tokens), answer: tokens });
    };

    for (const q of core.quiz ?? []) {
      if (q.type === "mcq") {
        // Şıklar karıştırılır: yazılan içerikte doğru şık neredeyse her zaman ilk
        // sıradaydı. Dil paketindeki geri bildirim ŞIK HİZASINDA indeksli, o yüzden
        // aynı permütasyonla taşınır — yoksa yanlış şıkkın açıklaması gösterilirdi.
        const p = shuffleChoices(q.options, q.correctIndex);
        const fb = pack?.quizFeedback?.[q.id];
        pool.mcq.push({
          kind: "mcq",
          id: `${lessonId}:q:${q.id}`,
          lessonId,
          prompt: q.stem,
          options: p.options,
          correctIndex: p.correctIndex,
          optionFeedback: fb ? p.order.map((i) => fb[i] ?? "") : undefined,
        });
      } else {
        const correct = q.answers[0]?.[0];
        if (correct) pushGap(`${lessonId}:q:${q.id}`, q.text, correct);
      }
    }

    for (const b of core.lecture.beats) {
      if (b.kind === "teach") {
        for (const p of b.points) for (const ex of p.examples) pushOrder(`${lessonId}:ex:${ex.id}`, ex.textEn);
        continue;
      }
      if (b.kind !== "exercise") continue;
      if (b.format === "mcq" && b.options?.length && b.answerSpec.kind === "choice") {
        const p = shuffleChoices(b.options, b.answerSpec.correctIndex);
        pool.mcq.push({
          kind: "mcq",
          id: `${lessonId}:b:${b.id}`,
          lessonId,
          prompt: b.item,
          options: p.options,
          correctIndex: p.correctIndex,
        });
      } else if (b.format === "fill_blank" && b.answerSpec.kind === "token") {
        const correct = b.answerSpec.accepted[0];
        if (correct) pushGap(`${lessonId}:b:${b.id}`, b.item, correct);
      } else if (b.format === "say_sentence" && b.answerSpec.kind === "utterance") {
        const first = b.answerSpec.accepted[0];
        if (first) pushOrder(`${lessonId}:b:${b.id}`, first);
      }
    }
  }

  return pool;
}

/** Tip dağılımını koruyarak örnekle; bir tip yetmezse diğerlerinden tamamla. */
function sample(pool: Pool, total: number): CheckpointItem[] {
  const want: Array<[keyof Pool, number]> = [
    ["mcq", Math.round(total * 0.375)], // 8'de 3
    ["gap", Math.round(total * 0.25)], //  8'de 2
    ["order", total - Math.round(total * 0.375) - Math.round(total * 0.25)], // kalan
  ];

  const picked: CheckpointItem[] = [];
  const leftovers: CheckpointItem[] = [];
  for (const [kind, n] of want) {
    const shuffled = shuffle(pool[kind]);
    picked.push(...shuffled.slice(0, n));
    leftovers.push(...shuffled.slice(n));
  }
  // Bir tip az geldiyse boşluğu diğer tiplerden doldur
  if (picked.length < total) picked.push(...shuffle(leftovers).slice(0, total - picked.length));
  return shuffle(picked).slice(0, total);
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
