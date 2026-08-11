import { programPlanSchema, type OnboardingInput, type ProgramResponse } from "@arna/contracts";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { programLessons, programs, userProfiles } from "../../db/schema.js";
import { completeJson } from "../llm/index.js";
import { buildPlanGenPrompt, PLAN_GEN_VERSION } from "../llm/prompts/plan-gen.v3.js";

/** Profili yazar, aktif programları arşivler, düz konu yolunu üretip kaydeder. */
export async function createProgramForUser(
  userId: string,
  input: OnboardingInput,
): Promise<ProgramResponse> {
  await db
    .insert(userProfiles)
    .values({
      userId,
      displayName: input.displayName,
      nativeLanguage: input.nativeLanguage,
      cefrLevel: input.cefrLevel,
      track: input.track,
      dailyGoalMinutes: input.dailyGoalMinutes,
      occupation: input.occupation,
      interests: input.interests,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        displayName: input.displayName,
        cefrLevel: input.cefrLevel,
        track: input.track,
        dailyGoalMinutes: input.dailyGoalMinutes,
        occupation: input.occupation,
        interests: input.interests,
        updatedAt: new Date(),
      },
    });

  const { system, user } = buildPlanGenPrompt(input);
  const plan = await completeJson({
    purpose: "plan_gen",
    system,
    user,
    schema: programPlanSchema,
    promptVersion: PLAN_GEN_VERSION,
    userId,
  });

  const rows: (typeof programLessons.$inferInsert)[] = plan.lessons.map((l, i) => ({
    programId: "", // transaksiyon içinde doldurulur
    position: i + 1,
    title: l.title,
    focus: l.focus,
    theme: l.theme,
  }));

  const [program] = await db.transaction(async (tx) => {
    await tx
      .update(programs)
      .set({ status: "archived" })
      .where(and(eq(programs.userId, userId), inArray(programs.status, ["ready", "generating"])));

    const inserted = await tx
      .insert(programs)
      .values({
        userId,
        track: input.track,
        level: input.cefrLevel,
        status: "ready",
        generatedByModel: "gpt-4.1",
        promptVersion: PLAN_GEN_VERSION,
      })
      .returning();

    const prog = inserted[0]!;
    await tx.insert(programLessons).values(rows.map((r) => ({ ...r, programId: prog.id })));
    return inserted;
  });

  const saved = await db
    .select()
    .from(programLessons)
    .where(eq(programLessons.programId, program!.id))
    .orderBy(programLessons.position);

  return {
    id: program!.id,
    level: input.cefrLevel,
    track: input.track,
    status: "ready",
    lessons: saved.map((r) => ({
      id: r.id,
      position: r.position,
      title: r.title,
      focus: r.focus,
      theme: r.theme,
      status: r.status as "not_started" | "in_progress" | "completed",
    })),
  };
}
