import { z } from "zod";
import { gradeDrill, type DrillAnswer } from "./drillGrade.js";
import { drillItemSchema, type DrillItem } from "./drills.js";
import { normToken } from "./tokens.js";

export { normToken };

/**
 * ÜNİTE SONU TESTİ — ölçüm katmanı.
 *
 * Derste (sohbet) cevaplar serbest metindir, bu yüzden LLM hoşgörüsü şarttır:
 * kabul listesinde olmayan doğru cevap, yazım sürçmesi, kendi sözleriyle ifade.
 * ÖLÇÜM anında ise belirsizlik İSTENMEZ. Bu yüzden test maddelerinin tamamı
 * TEK DOĞRU CEVAPLIDIR ve değerlendirme tamamen koddadır — LLM çağrısı yok,
 * maliyet yok, anlık geri bildirim, haksız ret yok.
 *
 * Maddeler yeni yazılmaz: yayınlanmış çekirdeklerden TÜRETİLİR (quiz maddeleri,
 * alıştırmalar ve öğretim örnek cümleleri). Bkz. backend `checkpoint.ts`.
 */

export const CHECKPOINT_FORMAT = 1;

/** Kaç madde sorulur (havuz çok daha büyük; her girişte farklı örneklem). */
export const CHECKPOINT_ITEM_COUNT = 10;
/** `order` maddesine uygun cümle uzunluğu — kutucuklar ekrana sığmalı, kolay olmamalı */
export const ORDER_MIN_WORDS = 4;
export const ORDER_MAX_WORDS = 9;

const nonEmpty = z.string().trim().min(1);

/** Çoktan seçmeli — doğru cevap şık indeksidir. */
export const checkpointMcqSchema = z.object({
  id: nonEmpty,
  kind: z.literal("mcq"),
  /** Hangi dersten geldi — sonuç ekranında "tekrar et" bağlantısı için */
  lessonId: nonEmpty,
  prompt: nonEmpty,
  options: z.array(nonEmpty).min(2).max(4),
  correctIndex: z.number().int().min(0),
  /** Dil paketinden gelen şık geri bildirimi (varsa) — ana dilde */
  optionFeedback: z.array(z.string()).optional(),
});

/**
 * Boşluk doldurma — KELİME BANKASIYLA. Serbest yazım bilerek kullanılmaz:
 * yazım/eşanlam belirsizliği tam da testte istemediğimiz şey.
 */
export const checkpointGapSchema = z.object({
  id: nonEmpty,
  kind: z.literal("gap"),
  lessonId: nonEmpty,
  /** İçinde ___ geçen cümle */
  prompt: nonEmpty,
  /** Doğru cevap + çeldiriciler, karışık sırada */
  options: z.array(nonEmpty).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

/** Cümle sıralama — kelime kutucukları; doğru cevap özgün kelime dizisi. */
export const checkpointOrderSchema = z.object({
  id: nonEmpty,
  kind: z.literal("order"),
  lessonId: nonEmpty,
  /** Karıştırılmış kutucuklar */
  tokens: z.array(nonEmpty).min(ORDER_MIN_WORDS).max(ORDER_MAX_WORDS),
  /** Özgün cümlenin kelimeleri (sırayla) */
  answer: z.array(nonEmpty).min(ORDER_MIN_WORDS).max(ORDER_MAX_WORDS),
});

/**
 * OYUN MADDESİ (10 Kas 2026, kullanıcı kararı): test de ders gibi oynanır — ünitenin
 * derslerindeki oyunlaştırılmış alıştırma türleri (eşleştir, dinle, hatalı kelime,
 * sohbeti tamamla…) karışık gelir. Sunucu artık YALNIZ bu türü üretir; eski
 * mcq/gap/order şemada geçiş uyumu için durur (`checkpointDrillOf` dönüştürür).
 */
export const checkpointDrillSchema = z.object({
  id: nonEmpty,
  kind: z.literal("drill"),
  lessonId: nonEmpty,
  drill: drillItemSchema,
  /** Dil paketinden şık geri bildirimi (yalnız quiz kaynaklı maddelerde) — ana dilde */
  optionFeedback: z.array(z.string()).optional(),
});

export const checkpointItemSchema = z.discriminatedUnion("kind", [
  checkpointMcqSchema,
  checkpointGapSchema,
  checkpointOrderSchema,
  checkpointDrillSchema,
]);
export type CheckpointItem = z.infer<typeof checkpointItemSchema>;

export const checkpointSchema = z.object({
  checkpointFormat: z.literal(CHECKPOINT_FORMAT),
  level: nonEmpty,
  unitIndex: z.number().int().min(1),
  /** Ünite başlığı ve hedefi — testin kapağı (ana dilde değil, katalog İngilizcesi) */
  unitTitle: nonEmpty,
  unitGoal: nonEmpty,
  /** Ekranda gösterilecek yönergeler — chrome'dan, ana dilde */
  labels: z.object({ mcq: nonEmpty, gap: nonEmpty, order: nonEmpty }),
  items: z.array(checkpointItemSchema).min(1),
});
export type Checkpoint = z.infer<typeof checkpointSchema>;

/**
 * Öğrencinin cevabı. mcq/gap için seçilen şık indeksi, order için dizilen kelimeler.
 */
export type CheckpointAnswer =
  | { kind: "choice"; index: number }
  | { kind: "order"; tokens: string[] }
  | { kind: "drill"; answer: DrillAnswer };


/**
 * DEĞERLENDİRME — saf, deterministik, LLM'siz. Web ve mobil aynısını kullanır.
 * Tek doğru cevap ilkesi burada yaşar: sonuç ya doğru ya yanlış, yorum yok.
 */
export function gradeCheckpointItem(item: CheckpointItem, answer: CheckpointAnswer): boolean {
  if (item.kind === "drill") return answer.kind === "drill" && gradeDrill(item.drill, answer.answer);
  if (item.kind === "order") {
    if (answer.kind !== "order") return false;
    const said = answer.tokens.map(normToken).filter(Boolean);
    const want = item.answer.map(normToken).filter(Boolean);
    return said.length === want.length && said.every((t, i) => t === want[i]);
  }
  if (answer.kind !== "choice") return false;
  return answer.index === item.correctIndex;
}

// ---------------------------------------------------------------------------
// CAN ve GEÇME — testin sınav yanı
// ---------------------------------------------------------------------------

/** Her yanlış bir can yakar; canlar bitince test orada düşer. */
export const CHECKPOINT_LIVES = 3;

/** Ekranda gösterilen kalan can — ayrı sayaç TUTULMAZ, yanlış sayısından türer. */
export function livesLeft(wrongCount: number): number {
  return Math.max(0, CHECKPOINT_LIVES - wrongCount);
}

/**
 * GEÇMEK = canları tüketmeden bitirmek. Ayrı bir yüzde eşiği YOKTUR: eşik zaten
 * canların içinde (3 can = en fazla 2 yanlış). İki kural yan yana yaşasaydı er
 * ya da geç çelişirlerdi — canları tüketmeden bitirip yine de "kaldın" diyen bir
 * ekran çıkardı.
 *
 * Saf ve paylaşımlı: rozet kararı istemcide ve sunucuda AYNI fonksiyondan çıkar.
 * Canlar bitip test yarıda kaldığında da doğru çalışır — cevaplanmamış maddeler
 * yanlış sayılır, çünkü `total` madde sayısıdır, cevaplanan sayısı değil.
 */
export function checkpointPassed(score: number, total: number): boolean {
  return total - score < CHECKPOINT_LIVES;
}

/**
 * Her test maddesini OYUN MADDESİNE çevirir — istemci tek oyun arayüzüyle oynar.
 * Eski türler: mcq → durum, gap → boşluk, order → kelimeleri sırala.
 */
export function checkpointDrillOf(item: CheckpointItem): DrillItem {
  switch (item.kind) {
    case "drill":
      return item.drill;
    case "mcq":
      return { id: item.id, pointRef: "mix", type: "situation", context: item.prompt, options: item.options, correctIndex: item.correctIndex };
    case "gap":
      return { id: item.id, pointRef: "mix", type: "fill_choice", sentence: item.prompt, options: item.options, correctIndex: item.correctIndex };
    case "order":
      return { id: item.id, pointRef: "mix", type: "arrange", answer: item.answer.join(" "), extraTiles: [], alsoAccept: [] };
  }
}

/**
 * Web dev yüzeyi için ters yön: oyun maddesini eski üç türden birine indirger
 * (eşleştir, hatalı kelime, konuşma gibi karşılığı olmayanlar null → atlanır).
 */
export function legacyCheckpointItemOf(item: CheckpointItem): Exclude<CheckpointItem, { kind: "drill" }> | null {
  if (item.kind !== "drill") return item;
  const d = item.drill;
  const base = { id: item.id, lessonId: item.lessonId };
  switch (d.type) {
    case "fill_choice":
      return { ...base, kind: "gap", prompt: d.sentence, options: d.options, correctIndex: d.correctIndex };
    case "situation":
      return { ...base, kind: "mcq", prompt: d.context, options: d.options, correctIndex: d.correctIndex, optionFeedback: item.optionFeedback };
    case "complete_chat":
      return { ...base, kind: "mcq", prompt: d.lines.map((l) => l.text ?? "___").join(" / "), options: d.options, correctIndex: d.correctIndex };
    case "arrange": {
      const answer = d.answer.split(/\s+/);
      return answer.length >= ORDER_MIN_WORDS && answer.length <= ORDER_MAX_WORDS ? { ...base, kind: "order", tokens: [...answer].reverse(), answer } : null;
    }
    default:
      return null;
  }
}
