// Ders devam (resume) sözleşmesi — pozisyon anlık görüntüsü + sync/resume uçları.
//
// İLKE: Devam AYNI oturumda sürer. `state.practice.hitTurns` ve LLM sohbet
// bağlamı sessionId'ye bağlıdır; yeni oturum açmak bunları sessizce sıfırlar.
// Pozisyon, istemcinin her geçişte fire-and-forget sync'lediği son bilinen
// noktadır: sync kaybolursa devam en kötü bir-iki adım GERİDEN başlar, asla
// ileriden başlamaz (güvenli yön).
import { z } from "zod";
import { richTextSchema } from "./lessonLayers.js";

/** Akış makinesine keyfi bir noktadan yeniden girmek için gereken asgari tuple. */
export const sessionPositionSchema = z.object({
  phase: z.enum(["lecture", "practice", "wrapup"]),
  /** Lecture'da aktif beat — id çekirdek revizyonuna bağlı, index yedek çözümleyici */
  beatId: z.string().max(40).nullable(),
  beatIndex: z.number().int().min(0).max(50),
  awaiting: z.enum(["ask", "exercise", "open_response", "practice", "wrapup"]).nullable(),
  /** Mevcut beat'te harcanan LLM turu (MAX_BEAT_EXCHANGES bütçesi) */
  beatExchanges: z.number().int().min(0).max(20),
  /** Soru davet penceresi sayacı (MAX_QUESTION_INVITES) */
  invites: z.number().int().min(0).max(10),
  /** Mevcut alıştırmadaki 0 tabanlı deneme — cevap açıklama kararını sürer */
  attempt: z.number().int().min(0).max(5),
  /** Practice'te 0 tabanlı tur — sunucu hitTurns ve tur tavanını bununla anahtarlar */
  practiceTurn: z.number().int().min(0).max(30),
  /** Kozmetik: övgü rotasyonu kaldığı yerden sürsün */
  praiseIndex: z.number().int().min(0).max(20),
});
export type SessionPosition = z.infer<typeof sessionPositionSchema>;

/** Devam görünümünde ve admin panelde kullanılan transkript satırı */
export const transcriptTurnSchema = z.object({
  id: z.number().int(),
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  runs: richTextSchema.nullable(),
  phase: z.string().nullable(),
  /** chat = sunucu LLM yolu · script = istemcinin logladığı script/deterministik satır */
  source: z.enum(["chat", "script"]),
});
export type TranscriptTurn = z.infer<typeof transcriptTurnSchema>;

/** POST /v1/sessions/:id/sync gövdesi — her iki alan da opsiyonel, en az biri dolu */
export const sessionSyncBodySchema = z
  .object({
    position: sessionPositionSchema.optional(),
    /** Yalnız sunucuya ULAŞMAYAN satırlar: script replikleri + istemcide çözülen girdiler */
    turns: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          text: z.string().min(1).max(2000),
          runs: richTextSchema.nullable().optional(),
          phase: z.enum(["lecture", "practice", "wrapup"]),
        }),
      )
      .max(20)
      .optional(),
  })
  .refine((b) => b.position !== undefined || (b.turns?.length ?? 0) > 0, {
    message: "position veya turns gerekli",
  });
export type SessionSyncBody = z.infer<typeof sessionSyncBodySchema>;
