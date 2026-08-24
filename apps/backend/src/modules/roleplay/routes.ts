import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { resolvePlayedLevel, type CefrLevel } from "@arna/contracts";
import { db } from "../../db/client.js";
import { userProfiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { getPublishedRoleplay, listPublishedRoleplays } from "./queries.js";
import { openRoleplaySession, RoleplayError } from "./service.js";

const slugParams = z.object({ slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/) });
const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;

function sendError(reply: { code: (n: number) => { send: (b: unknown) => unknown } }, err: unknown) {
  if (err instanceof RoleplayError) {
    const status = err.code === "not_found" ? 404 : err.code === "no_profile" ? 404 : 409;
    return reply.code(status).send({ error: err.code });
  }
  throw err;
}

export default async function roleplayRoutes(app: FastifyInstance) {
  /**
   * Yayınlı liste. Her satırda `willPlayAt`: kullanıcının seviyesinde mi oynanır,
   * yoksa `supportedFrom`'a mı yükseltilir — liste ekranı "B1 zorluğunda oynanır"
   * notunu buradan basar. Karar SUNUCUDA (saf fonksiyon), istemci hesaplamaz.
   */
  app.get("/roleplays", { preHandler: app.requireAuth }, async (request, reply) => {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, request.userId))
      .limit(1);
    if (!profile) return reply.code(404).send({ error: "no_profile" });
    const userLevel = profile.cefrLevel as CefrLevel;

    const rows = await listPublishedRoleplays();
    return {
      roleplays: rows.map((r) => {
        const decision = resolvePlayedLevel(r.spec, userLevel);
        return {
          slug: r.slug,
          title: r.spec.title,
          category: r.category,
          scene: r.spec.scene,
          personaName: r.spec.persona.name,
          recommendedFrom: r.recommendedFrom,
          objectiveCount: decision.objectives.length,
          willPlayAt: decision.level,
          raised: decision.raised,
        };
      }),
    };
  });

  /**
   * Brief ÖNİZLEME — oturum AÇMADAN. Bilinçli ayrım: her bakışta oturum açılsaydı
   * hiç oynanmamış deneme satırları doğar ve ileride altın veri setinin paydasını
   * kirletirdi. Oturum yalnız "Başla"ya basılınca açılır (aşağıdaki POST).
   */
  app.get("/roleplays/:slug", { preHandler: app.requireAuth }, async (request, reply) => {
    const params = slugParams.safeParse(request.params);
    if (!params.success) return reply.code(400).send({ error: "invalid_params" });

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, request.userId))
      .limit(1);
    if (!profile) return reply.code(404).send({ error: "no_profile" });

    const rp = await getPublishedRoleplay(params.data.slug);
    if (!rp) return reply.code(404).send({ error: "not_found" });

    const decision = resolvePlayedLevel(rp.spec, profile.cefrLevel as CefrLevel);
    return {
      slug: rp.slug,
      title: rp.spec.title,
      category: rp.category,
      persona: rp.spec.persona,
      scene: rp.spec.scene,
      playedLevel: decision.level,
      raised: decision.raised,
      objectives: decision.objectives.map((o) => ({ id: o.id, label: o.label })),
    };
  });

  /**
   * Oturum açma — "Başla" butonunun ucu. LLM çağrısı YOK (açılış spec'ten,
   * selamlama üretimi yok), o yüzden hızlı.
   */
  app.post(
    "/roleplays/:slug/sessions",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 30, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = slugParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_params" });
      try {
        return await openRoleplaySession(request.userId, params.data.slug);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );
}
