import { z } from "zod";
import { richTextSchema } from "./lessonLayers.js";
import { roleplayDebriefSchema } from "./roleplay.js";

// ============================================================================
// Oturum uçlarının CEVAP zarfları — /sessions/:id/chat · /tts · /end
//
// İstek şemaları backend `session/routes.ts`'te; cevaplar burada ki istemciler
// (mobil roleplay ekranı ilk tüketici) `as` cast yerine doğrulasın.
// ============================================================================

export const chatResponseSchema = z.object({
  text: z.string(),
  runs: richTextSchema.optional(),
  segmentDone: z.boolean(),
  beatDone: z.boolean().optional(),
  isAttempt: z.boolean().optional(),
  /** Yalnız ders soru penceresi: öğrencinin sorusu kalmadı (yapısal) → pencere kapanır */
  windowDone: z.boolean().optional(),
  /** Yalnız roleplay: hedef ilerlemesi */
  progress: z.object({ done: z.number().int(), total: z.number().int() }).optional(),
  /** Yalnız roleplay: bu turda kabul edilen yeni tikler */
  newHits: z.array(z.object({ objectiveId: z.string(), evidence: z.string() })).optional(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;

export const ttsClipSchema = z.object({
  audioBase64: z.string(),
  alignment: z
    .object({
      characters: z.array(z.string()),
      character_start_times_seconds: z.array(z.number()),
      character_end_times_seconds: z.array(z.number()),
    })
    .nullable(),
  lang: z.string(),
});

export const ttsResponseSchema = z.object({ clips: z.array(ttsClipSchema) });
export type TtsResponse = z.infer<typeof ttsResponseSchema>;

export const endSessionResponseSchema = z.object({
  ok: z.literal(true),
  turns: z.number().int(),
  debrief: roleplayDebriefSchema.nullable().optional(),
});
export type EndSessionResponse = z.infer<typeof endSessionResponseSchema>;

/**
 * `POST /v1/sessions/:id/tts/stream` cevabı — akıtmalı ses bileti. `path` API kökünden
 * göreli, TEK kullanımlık değil ama kısa ömürlü (~2 dk) ve tahmin edilemez: oynatıcı
 * (expo-audio / AVPlayer) aynı adresi birden çok kez isteyebilir, JWT adrese GİRMEZ.
 * Sunucu üretimi bilet kesilirken başlatır; adres mp3'ü üretim sürdükçe akıtır.
 * 409 `stream_unsupported` → istemci tam klip yoluna (`/tts`) düşer.
 */
export const ttsStreamTicketSchema = z.object({
  path: z.string().min(1),
});
export type TtsStreamTicket = z.infer<typeof ttsStreamTicketSchema>;
