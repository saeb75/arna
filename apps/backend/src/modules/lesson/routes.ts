import { catalogLessonIdSchema } from "@glotmate/contracts";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { LayerError, resolveLesson, warmNextLocale } from "./layers.js";

const paramsSchema = z.object({ catalogLessonId: catalogLessonIdSchema });

export default async function lessonRoutes(app: FastifyInstance) {
  app.get(
    "/lessons/:catalogLessonId",
    {
      preHandler: app.requireAuth,
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 hour",
          keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip,
        },
      },
    },
    async (request, reply) => {
      const parsed = paramsSchema.safeParse(request.params);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_input", issues: parsed.error.issues });
      }

      try {
        const resolved = await resolveLesson(request.userId, parsed.data.catalogLessonId);
        // Algılanan hız: sıradaki dersin DİL PAKETİNİ arka planda ısıt.
        // Çekirdek/sahne asla burada üretilmez — onlar yayın hattının işi.
        void warmNextLocale(request.userId, parsed.data.catalogLessonId);
        return { lessonId: resolved.localeId ?? resolved.coreId, lesson: resolved.content };
      } catch (err) {
        if (err instanceof LayerError) {
          // core/scene yayınlanmamışsa bu bir DAĞITIM eksiğidir, kullanıcı hatası değil
          const status =
            err.code === "not_found" ? 404 : err.code === "locale_in_progress" ? 409 : 503;
          return reply.code(status).send({ error: err.code });
        }
        throw err;
      }
    },
  );
}
