import type { CurriculumResponse, OnboardingInput } from "@arna/contracts";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { programs, userProfiles } from "../../db/schema.js";
import { normalizeNativeLanguage } from "../../lib/language.js";
import { getCurriculumForUser } from "../curriculum/queries.js";

/**
 * Profili yazar ve kullanıcının seviyesini işaretler, sonra SABİT katalog
 * görünümünü döner.
 *
 * LLM ÇAĞRISI YOK. Eskiden burada `plan-gen` ile kullanıcıya özel 28-36 satırlık
 * bir ders planı üretiliyor ve istek içinde 20-60 sn bekleniyordu. Müfredat artık
 * repo'da versiyonlanan sabit katalog; onboarding milisaniyeler sürüyor.
 */
export async function createProgramForUser(
  userId: string,
  input: OnboardingInput,
): Promise<CurriculumResponse> {
  const nativeLanguage = normalizeNativeLanguage(input.nativeLanguage);

  await db
    .insert(userProfiles)
    .values({
      userId,
      displayName: input.displayName,
      nativeLanguage,
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
        // nativeLanguage eskiden burada YOKTU: mevcut kullanıcı yeniden onboard
        // olduğunda ana dili sessizce eski değerinde kalıyordu.
        nativeLanguage,
        cefrLevel: input.cefrLevel,
        track: input.track,
        dailyGoalMinutes: input.dailyGoalMinutes,
        occupation: input.occupation,
        interests: input.interests,
        updatedAt: new Date(),
      },
    });

  // `programs` artık ders satırı taşımıyor; kullanıcının hangi seviye/track'te
  // olduğunun kaydı. İlerleme buna değil, katalog kimliğine bağlı olduğu için
  // yeni program satırı açmak ilerlemeyi ETKİLEMEZ.
  await db.transaction(async (tx) => {
    await tx
      .update(programs)
      .set({ status: "archived" })
      .where(and(eq(programs.userId, userId), inArray(programs.status, ["ready", "generating"])));

    await tx.insert(programs).values({
      userId,
      track: input.track,
      level: input.cefrLevel,
      status: "ready",
    });
  });

  return await getCurriculumForUser(userId);
}
