import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { chatTurn, endSession, openSession, SessionError, stt, translate, tts } from "./service.js";

const sessionParams = z.object({ sessionId: z.string().uuid() });
const lessonParams = z.object({ programLessonId: z.string().uuid() });
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
const ttsBody = z.object({ text: z.string().trim().min(1).max(500) });

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
    "/lessons/:programLessonId/sessions",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 20, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = lessonParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return reply.code(201).send(await openSession(request.userId, params.data.programLessonId));
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
      const body = ttsBody.safeParse(request.body); // aynı şekil: { text }
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
        return await tts(request.userId, params.data.sessionId, body.data.text);
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
