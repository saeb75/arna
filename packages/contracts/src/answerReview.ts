/**
 * CEVAP İNCELEME — öğrencinin kendi cümlesini "genel İngilizce" açısından ölçen
 * istek-üzerine katman. Ders ekranında kullanıcı balonunun yanındaki `?` ikonu
 * bunu açar.
 *
 * KALICI İLKE — BU ÇIKTI AKIŞ KARARI DEĞİLDİR. `decideOnStudentInput` /
 * `decideAfterTutorReply` bu tipi görmez ve görmemelidir: ders içindeki ölçüm
 * yalnız ÖĞRETİLEN hedef yapıyı sıkı ölçer (`beatDone` guard'ı), buradaki inceleme
 * ise genel İngilizceye bakar. İkisi birleşirse "genel İngilizcen zayıf" diye
 * alıştırma hakkı yakan bir sistem çıkar. Sheet bir AYNADIR, kapı değil.
 *
 * Modül contracts'ta durur çünkü mobil istemci de aynı ön elemeyi kullanacak.
 */
import { z } from "zod";
import { ACK_EN, SURRENDER_EN, normalizeShort } from "./lessonFlow.js";
import { textRunSchema } from "./lessonLayers.js";

// ---------------------------------------------------------------------------
// Hüküm tipleri
// ---------------------------------------------------------------------------

/**
 * `error` ile `unnatural` KASTEN ayrıdır: gerçek gramer hatası ile üslup önerisi
 * aynı rozeti taşırsa, hatasız cümle kuran öğrenci de "düzeltildim" sanır.
 * `too_short` yalnız istemci tarafında doğar — `?` ikonu hiç gösterilmez.
 */
export const answerReviewKindSchema = z.enum([
  "correct",
  "error",
  "unnatural",
  "other_language",
  "too_short",
]);
export type AnswerReviewKind = z.infer<typeof answerReviewKindSchema>;

// ---------------------------------------------------------------------------
// LLM çıktısı — KASTEN DAR
// ---------------------------------------------------------------------------

/**
 * Modelden istenen şema. Dil etiketi (`lang: "en" | "l1"`) BURADA YOKTUR ve
 * olmayacak: etiketi modele bırakırsak İngilizce cümle `l1` etiketiyle gelebilir
 * ve TTS onu ana dil sesiyle okur. Etiketi sunucu koyar — `lesson_locales`
 * şemasında zaten uygulanan ilkenin aynısı.
 *
 * `too_short` burada yok: o karar deterministik, modele sorulmaz.
 */
export const answerReviewModelSchema = z.object({
  kind: z.enum(["correct", "error", "unnatural", "other_language"]),
  /** Öğrencinin söylemesi gereken İngilizce cümle. `correct`'te boş dize. */
  corrected: z.string().default(""),
  /** Tek kısa paragraf, hedef dilde (native modda ana dil, değilse İngilizce). */
  explanation: z.string().default(""),
});
export type AnswerReviewModelOutput = z.infer<typeof answerReviewModelSchema>;

// ---------------------------------------------------------------------------
// İstemcinin tükettiği biçim
// ---------------------------------------------------------------------------

export const answerReviewSchema = z.object({
  kind: answerReviewKindSchema,
  /** Öğretilen İngilizce karşılık — `correct` ve `too_short`'ta boş dize. */
  corrected: z.string(),
  /** Açıklama, dil etiketli parçalar hâlinde. Deterministik yolda boş dizi. */
  runs: z.array(textRunSchema),
  /**
   * FAZ 2 için ayrılmış alan (Azure Pronunciation Assessment). Faz 1'de DAİMA
   * `null`. Adı şimdiden sözleşmede duruyor ki telaffuz geldiğinde istemci
   * sheet'i yeniden yazılmasın — yalnız bu alan dolmaya başlasın.
   */
  pronunciation: z.null(),
});
export type AnswerReview = z.infer<typeof answerReviewSchema>;

// ---------------------------------------------------------------------------
// Katman 1 — deterministik ön eleme (LLM YOK)
// ---------------------------------------------------------------------------

/**
 * Kısayol YALNIZ basit İNGİLİZCE ifadeler için. Ana dildeki onaylar ("evet",
 * "tamam") bilerek dışarıda: kısayolu ana dile açmak, her yeni dilde bu özellik
 * adına bakım demek olurdu — ürün kararı, o yüzden onlar LLM'e gidip
 * `other_language` olarak döner.
 *
 * Kaynak listeler `lessonFlow`'dan gelir (ACK_EN + SURRENDER_EN): hedef dil herkes
 * için İngilizce olduğundan bu ifadeler her ana dilde geçerlidir.
 *
 * `classifyAck` KULLANILMAZ — o kelime-sınırı içerme eşleştirmesi yapar ve
 * "no thanks I good" gibi hatalı bir cümleyi `no` sanıp doğru damgalayabilirdi.
 * Burada yalnız TAM eşleşme kabul edilir.
 */
const TRIVIAL_EN: readonly string[] = [
  ...ACK_EN.yes,
  ...ACK_EN.no,
  ...ACK_EN.proceed,
  ...SURRENDER_EN,
].map(normalizeShort);

/** `null` = karar yok, LLM'e gitmeli. */
export type AnswerTriage = Extract<AnswerReviewKind, "correct" | "too_short"> | null;

/**
 * Hem istemci hem sunucu çağırır: istemci gereksiz isteği hiç göndermez, sunucu
 * da güvenmediği istemciye karşı aynı kapıyı tutar (bedava çağrı LLM'e sızmasın).
 */
export function triageAnswer(text: string): AnswerTriage {
  const t = normalizeShort(text);
  // Harf/rakam kalmadıysa ("...", "!!") ya da tek karakterse inceleyecek bir şey yok
  if (t.length < 2) return "too_short";
  if (TRIVIAL_EN.includes(t)) return "correct";
  return null;
}
