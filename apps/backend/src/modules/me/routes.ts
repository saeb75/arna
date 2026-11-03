import { profilePatchSchema } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { userProfiles } from "../../db/schema.js";
import { getEntitlement } from "../billing/entitlements.js";
import { getQuota, safeTimezone } from "../billing/quota.js";
import { getCurriculumForUser } from "../curriculum/queries.js";
import { deleteAccount, getProfile, getStats } from "./service.js";

const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;

/**
 * /v1/me — öğrencinin kendi hesabı. İstemci kapısı `GET /me`'ye bakar:
 * `profile: null` → onboarding; misafirse "İlerlemeni kaydet" kartı.
 */
export default async function meRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: app.requireAuth }, async (request) => {
    const [profile, { entitlement }] = await Promise.all([
      getProfile(request.userId),
      getEntitlement(request.userId),
    ]);
    const quota = await getQuota(request.userId, entitlement.isPro, profile?.timezone);
    return {
      userId: request.userId,
      email: request.userEmail,
      isAnonymous: request.isAnonymous,
      profile,
      entitlement,
      quota,
    };
  });

  /**
   * Profil güncelleme (eskiden curriculum/routes.ts'teydi; alanlar genişledi).
   * Cevap MÜFREDAT görünümü — seviye değişince istemci yolu aynı cevaptan
   * yeniden kurar. İlerlemeye DOKUNMAZ: ilerleme katalog kimliğine bağlı.
   */
  app.patch("/me/profile", { preHandler: app.requireAuth }, async (request, reply) => {
    const parsed = profilePatchSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.issues });
    }
    const p = parsed.data;
    const updated = await db
      .update(userProfiles)
      .set({
        ...(p.displayName !== undefined ? { displayName: p.displayName } : {}),
        ...(p.cefrLevel !== undefined ? { cefrLevel: p.cefrLevel } : {}),
        ...(p.track !== undefined ? { track: p.track } : {}),
        ...(p.tutorLanguage !== undefined ? { tutorLanguage: p.tutorLanguage } : {}),
        ...(p.dailyGoalMinutes !== undefined ? { dailyGoalMinutes: p.dailyGoalMinutes } : {}),
        ...(p.interests !== undefined ? { interests: p.interests } : {}),
        ...(p.occupation !== undefined ? { occupation: p.occupation } : {}),
        ...(p.timezone !== undefined ? { timezone: safeTimezone(p.timezone) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, request.userId))
      .returning({ userId: userProfiles.userId });

    if (updated.length === 0) return reply.code(404).send({ error: "no_profile" });
    return await getCurriculumForUser(request.userId);
  });

  app.get("/me/stats", { preHandler: app.requireAuth }, async (request) => {
    const q = z.object({ tz: z.string().max(64).optional() }).safeParse(request.query ?? {});
    return await getStats(request.userId, q.success ? q.data.tz : undefined);
  });

  /**
   * Hesabı ve tüm kişisel veriyi siler. Mağaza aboneliği Apple'da sürer —
   * istemci onay diyaloğunda bunu söyler; iptal kullanıcının elindedir.
   */
  app.delete(
    "/me",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 5, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request) => {
      await deleteAccount(request.userId);
      return { ok: true };
    },
  );
}
