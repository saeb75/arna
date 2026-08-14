import { z } from "zod";

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
export const CHECKPOINT_ITEM_COUNT = 8;
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

export const checkpointItemSchema = z.discriminatedUnion("kind", [
  checkpointMcqSchema,
  checkpointGapSchema,
  checkpointOrderSchema,
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
export type CheckpointAnswer = { kind: "choice"; index: number } | { kind: "order"; tokens: string[] };

/** Kelime karşılaştırması — noktalama ve büyük/küçük harf yok sayılır. */
function normToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9']/g, "")
    .trim();
}

/**
 * DEĞERLENDİRME — saf, deterministik, LLM'siz. Web ve mobil aynısını kullanır.
 * Tek doğru cevap ilkesi burada yaşar: sonuç ya doğru ya yanlış, yorum yok.
 */
export function gradeCheckpointItem(item: CheckpointItem, answer: CheckpointAnswer): boolean {
  if (item.kind === "order") {
    if (answer.kind !== "order") return false;
    const said = answer.tokens.map(normToken).filter(Boolean);
    const want = item.answer.map(normToken).filter(Boolean);
    return said.length === want.length && said.every((t, i) => t === want[i]);
  }
  if (answer.kind !== "choice") return false;
  return answer.index === item.correctIndex;
}
