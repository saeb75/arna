import { lookupWordSchema, mistakeKindSchema } from "@glotmate/contracts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { TranslateError } from "../translate/index.js";
import {
  deleteWord,
  dismissMistake,
  listMistakes,
  listWords,
  lookupWord,
  NotebookError,
  saveWord,
} from "./service.js";

const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;

/**
 * /v1/me/mistakes — incelemelerden derlenen hata listesi ("bunu ben söylemedim" ile düşer)
 * /v1/words/lookup — dokunulan kelimenin anlamı (kalıcı önbellekli çeviri)
 * /v1/me/words — kaydedilen kelimeler
 */
export default async function notebookRoutes(app: FastifyInstance) {
  app.get("/me/mistakes", { preHandler: app.requireAuth }, async (request, reply) => {
    const q = z
      .object({
        kind: mistakeKindSchema.optional(),
        before: z.string().datetime().optional(),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      })
      .safeParse(request.query);
    if (!q.success) return reply.code(400).send({ error: "invalid_input" });
    return listMistakes(request.userId, q.data);
  });

  app.delete("/me/mistakes/:id", { preHandler: app.requireAuth }, async (request, reply) => {
    const p = z.object({ id: z.string().uuid() }).safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_input" });
    const ok = await dismissMistake(request.userId, p.data.id);
    return ok ? { ok: true } : reply.code(404).send({ error: "not_found" });
  });

  app.post(
    "/words/lookup",
    { preHandler: app.requireAuth, config: { rateLimit: { max: 600, timeWindow: "1 hour", keyGenerator: byUser } } },
    async (request, reply) => {
      const body = z
        .object({ word: lookupWordSchema, sentence: z.string().trim().max(300).optional() })
        .safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await lookupWord(request.userId, body.data.word, body.data.sentence || undefined);
      } catch (err) {
        if (err instanceof TranslateError) return reply.code(502).send({ error: "translate_unavailable" });
        throw err;
      }
    },
  );

  app.get("/me/words", { preHandler: app.requireAuth }, async (request) => ({
    items: await listWords(request.userId),
  }));

  app.post(
    "/me/words",
    { preHandler: app.requireAuth, config: { rateLimit: { max: 300, timeWindow: "1 hour", keyGenerator: byUser } } },
    async (request, reply) => {
      const body = z
        .object({ word: lookupWordSchema, sentence: z.string().trim().max(300).optional() })
        .safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await saveWord(request.userId, body.data.word, body.data.sentence || null);
      } catch (err) {
        if (err instanceof NotebookError) return reply.code(409).send({ error: err.code });
        if (err instanceof TranslateError) return reply.code(502).send({ error: "translate_unavailable" });
        throw err;
      }
    },
  );

  app.delete("/me/words/:word", { preHandler: app.requireAuth }, async (request, reply) => {
    const p = z.object({ word: lookupWordSchema }).safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_input" });
    await deleteWord(request.userId, p.data.word);
    return { ok: true };
  });
}
