import { catalogLessonIdSchema } from "@arna/contracts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { chatTurn, endSession, openSession, SessionError, stt, translate, tts } from "./service.js";

const sessionParams = z.object({ sessionId: z.string().uuid() });
const lessonParams = z.object({ catalogLessonId: catalogLessonIdSchema });
const chatBody = z.object({
  text: z.string().trim().min(1).max(1000),
  phase: z.enum(["lecture", "practice", "wrapup"]).optional(),
  /** Lecture fazında aktif beat */
  beatId: z.string().max(40).optional(),
  /** Practice fazında kaçıncı tur (0-tabanlı) — kapanış kararı için */
  turnIndex: z.number().int().min(0).max(20).optional(),
  /** Alıştırmada kaçıncı deneme (0-tabanlı) */
  attempt: z.number().int().min(0).max(5).optional(),
  /** Soru penceresinin son turu — hoca kapanış yapar, yeni soru davet etmez */
  lastExchange: z.boolean().optional(),
});
/**
 * v7: dil etiketli parçalar; toplam uzunluk tavanı parça BAŞINA değil TOPLAMDA.
 * Eski `{text}` gövdesi tek İngilizce parça sayılır (geçiş uyumu).
 *
 * Tavanlar ANLATIM bölümüne göre boyutlandı: teach beat'i tek speak çağrısında
 * gider ve 4 nokta × (açıklama parçaları + örnekler) 30+ parça / ~3000 karakter
 * edebilir. Eski 12 parça / 900 karakter tavanı canlıda tam da bu bölümü
 * sessizce susturdu (400 invalid_input; diğer bölümler kısa olduğundan konuştu).
 * Kötüye kullanımın asıl bekçileri rate limit + günlük maliyet bütçesi.
 */
const ttsBody = z
  .union([
    z.object({
      runs: z
        .array(z.object({ lang: z.enum(["en", "l1"]), text: z.string().trim().min(1) }))
        .min(1)
        .max(48),
    }),
    z.object({ text: z.string().trim().min(1) }),
  ])
  .refine(
    (b) => ("runs" in b ? b.runs.reduce((n, r) => n + r.text.length, 0) : b.text.length) <= 4000,
    { message: "toplam metin 4000 karakteri aşamaz" },
  );

const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;

function sendError(reply: { code: (n: number) => { send: (b: unknown) => unknown } }, err: unknown) {
  if (err instanceof SessionError) {
    const status =
      err.code === "not_found"
        ? 404
        : err.code === "session_ended"
          ? 409
          : err.code === "lesson_not_ready"
            ? 409
            : 502;
    return reply.code(status).send({ error: err.code });
  }
  throw err;
}

export default async function sessionRoutes(app: FastifyInstance) {
  app.post(
    "/lessons/:catalogLessonId/sessions",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 20, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = lessonParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return reply.code(201).send(await openSession(request.userId, params.data.catalogLessonId));
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/chat",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      const body = chatBody.safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        return await chatTurn(request.userId, params.data.sessionId, body.data.text, {
          phase: body.data.phase ?? "lecture",
          beatId: body.data.beatId,
          turnIndex: body.data.turnIndex ?? 0,
          attempt: body.data.attempt ?? 0,
          lastExchange: body.data.lastExchange ?? false,
        });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/translate",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      // translate düz metin alır (balon çevirisi) — tts'in runs gövdesinden ayrıldı
      const body = z.object({ text: z.string().trim().min(1).max(900) }).safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        return await translate(request.userId, params.data.sessionId, body.data.text);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/tts",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      const body = ttsBody.safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        const runs = "runs" in body.data ? body.data.runs : [{ lang: "en" as const, text: body.data.text }];
        return await tts(request.userId, params.data.sessionId, runs);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/stt",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });

      const file = await request.file();
      if (!file) return reply.code(400).send({ error: "no_file" });
      const buffer = await file.toBuffer();
      if (buffer.length < 1000) return reply.code(400).send({ error: "audio_too_short" });

      try {
        return await stt(request.userId, params.data.sessionId, buffer, file.mimetype);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/end",
    { preHandler: app.requireAuth },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await endSession(request.userId, params.data.sessionId);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );
}
