import { cefrLevelSchema, trackSchema, tutorLanguageSchema } from "@arna/contracts";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { userProfiles } from "../../db/schema.js";
import { CurriculumError, getCurriculumForUser } from "./queries.js";

/**
 * Seviye/track değişimi. Eskiden `POST /programs/regenerate` idi ve planı LLM'e
 * yeniden ürettiriyordu; sabit katalogda "yeniden üretmek" diye bir şey yok.
 * Bu uç yalnızca profili günceller — İLERLEMEYE DOKUNMAZ, çünkü ilerleme katalog
 * kimliğine bağlı. "Tamamladığın dersler kaybolmaz" sözü artık yapısal olarak doğru.
 */
const patchSchema = z.object({
  cefrLevel: cefrLevelSchema.optional(),
  track: trackSchema.optional(),
  tutorLanguage: tutorLanguageSchema.optional(),
});

export default async function curriculumRoutes(app: FastifyInstance) {
  app.get("/curriculum/current", { preHandler: app.requireAuth }, async (request, reply) => {
    try {
      return await getCurriculumForUser(request.userId);
    } catch (err) {
      if (err instanceof CurriculumError) return reply.code(404).send({ error: err.code });
      throw err;
    }
  });

  app.patch("/me/profile", { preHandler: app.requireAuth }, async (request, reply) => {
    const parsed = patchSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.issues });
    }
    if (
      parsed.data.cefrLevel === undefined &&
      parsed.data.track === undefined &&
      parsed.data.tutorLanguage === undefined
    ) {
      return reply.code(400).send({ error: "invalid_input", issues: [] });
    }

    const updated = await db
      .update(userProfiles)
      .set({
        ...(parsed.data.cefrLevel ? { cefrLevel: parsed.data.cefrLevel } : {}),
        ...(parsed.data.track ? { track: parsed.data.track } : {}),
        ...(parsed.data.tutorLanguage ? { tutorLanguage: parsed.data.tutorLanguage } : {}),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, request.userId))
      .returning({ userId: userProfiles.userId });

    if (updated.length === 0) return reply.code(404).send({ error: "no_profile" });

    return await getCurriculumForUser(request.userId);
  });
}
