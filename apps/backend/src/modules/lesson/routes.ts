import { catalogLessonIdSchema } from "@arna/contracts";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getOrGenerateLesson, LessonError, pregenerateNext } from "./service.js";

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
        const result = await getOrGenerateLesson(request.userId, parsed.data.catalogLessonId);
        // Algılanan hız: sıradaki dersi arka planda üret (beklenmez, hata yutulur)
        void pregenerateNext(request.userId, parsed.data.catalogLessonId);
        return {
          lessonId: result.lessonId,
          lesson: result.content,
          warnings: result.report.warnings,
        };
      } catch (err) {
        if (err instanceof LessonError) {
          const status =
            err.code === "not_found" ? 404 : err.code === "in_progress_elsewhere" ? 409 : 500;
          return reply.code(status).send({ error: err.code });
        }
        throw err;
      }
    },
  );
}
