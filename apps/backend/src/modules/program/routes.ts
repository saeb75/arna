import { cefrLevelSchema, trackSchema, onboardingInputSchema } from "@arna/contracts";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { programLessons, programs, userProfiles } from "../../db/schema.js";
import { createProgramForUser } from "../onboarding/service.js";

const regenerateSchema = z.object({
  cefrLevel: cefrLevelSchema.optional(),
  track: trackSchema.optional(),
});

export default async function programRoutes(app: FastifyInstance) {
  app.get("/programs/current", { preHandler: app.requireAuth }, async (request, reply) => {
    const [program] = await db
      .select()
      .from(programs)
      .where(and(eq(programs.userId, request.userId), inArray(programs.status, ["ready", "generating"])))
      .orderBy(desc(programs.createdAt))
      .limit(1);

    if (!program) return reply.code(404).send({ error: "no_program" });

    const rows = await db
      .select()
      .from(programLessons)
      .where(eq(programLessons.programId, program.id))
      .orderBy(programLessons.position);

    return {
      id: program.id,
      level: program.level,
      track: program.track,
      status: program.status,
      lessons: rows.map((r) => ({
        id: r.id,
        position: r.position,
        title: r.title,
        focus: r.focus,
        theme: r.theme,
        status: r.status,
      })),
    };
  });

  app.post(
    "/programs/regenerate",
    {
      preHandler: app.requireAuth,
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 hour",
          keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip,
        },
      },
    },
    async (request, reply) => {
      const parsed = regenerateSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_input", issues: parsed.error.issues });
      }

      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, request.userId))
        .limit(1);
      if (!profile) return reply.code(404).send({ error: "no_profile" });

      // Profil + istenen değişikliklerden onboarding girdisini yeniden kur
      const input = onboardingInputSchema.parse({
        displayName: profile.displayName,
        dailyGoalMinutes: profile.dailyGoalMinutes,
        track: parsed.data.track ?? profile.track,
        cefrLevel: parsed.data.cefrLevel ?? profile.cefrLevel,
        interests: profile.interests,
        occupation: profile.occupation ?? undefined,
        // Okunmazsa Zod default'u ("tr") sessizce uygulanır ve kullanıcının
        // ana dili yeniden üretimde kaybolur
        nativeLanguage: profile.nativeLanguage,
      });

      const program = await createProgramForUser(request.userId, input);
      return reply.code(201).send(program);
    },
  );
}
