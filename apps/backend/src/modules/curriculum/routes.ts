import { catalogLessonIdSchema, cefrLevelSchema, trackSchema, tutorLanguageSchema } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { unitCheckpoints, userProfiles } from "../../db/schema.js";
import { nativeLanguageOf } from "../../lib/language.js";
import { buildCheckpoint, CheckpointError } from "./checkpoint.js";
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

  // --- Ünite sonu testi -----------------------------------------------------
  // Test SAKLANMAZ, her istekte yayınlı çekirdeklerden yeniden derlenir (farklı
  // örneklem). Değerlendirme istemcide `gradeCheckpointItem` ile yapılır —
  // deterministik ve LLM'siz; sunucu yalnızca sonucu kaydeder.
  const checkpointParams = z.object({
    level: cefrLevelSchema,
    unitIndex: z.coerce.number().int().min(1).max(99),
  });

  app.get("/checkpoints/:level/:unitIndex", { preHandler: app.requireAuth }, async (request, reply) => {
    const params = checkpointParams.safeParse(request.params);
    if (!params.success) return reply.code(400).send({ error: "invalid_params" });

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, request.userId))
      .limit(1);
    if (!profile) return reply.code(404).send({ error: "no_profile" });

    try {
      return await buildCheckpoint({
        level: params.data.level,
        unitIndex: params.data.unitIndex,
        nativeLanguage: nativeLanguageOf(profile),
        tutorLanguage: (profile.tutorLanguage ?? "native") as "native" | "english",
      });
    } catch (err) {
      if (err instanceof CheckpointError) {
        // Ünite yayınlanmamışsa test YOKTUR — sessizce boş dönmek yerine açıkça söyle
        return reply.code(err.code === "unit_not_found" ? 404 : 409).send({ error: err.code });
      }
      throw err;
    }
  });

  const resultBody = z.object({
    score: z.number().int().min(0),
    total: z.number().int().min(1),
    weakLessonIds: z.array(catalogLessonIdSchema).max(20).default([]),
  });

  app.post("/checkpoints/:level/:unitIndex", { preHandler: app.requireAuth }, async (request, reply) => {
    const params = checkpointParams.safeParse(request.params);
    const body = resultBody.safeParse(request.body);
    if (!params.success || !body.success) return reply.code(400).send({ error: "invalid_input" });
    if (body.data.score > body.data.total) return reply.code(400).send({ error: "invalid_input" });

    const [row] = await db
      .insert(unitCheckpoints)
      .values({
        userId: request.userId,
        level: params.data.level,
        unitIndex: params.data.unitIndex,
        score: body.data.score,
        total: body.data.total,
        weakLessonIds: body.data.weakLessonIds,
      })
      .returning({ id: unitCheckpoints.id, createdAt: unitCheckpoints.createdAt });

    return { saved: true, id: row!.id, takenAt: row!.createdAt };
  });
}
