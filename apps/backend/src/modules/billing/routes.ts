import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { env } from "../../config/env.js";
import { getEntitlement, writeStoreState } from "./entitlements.js";
import { getQuota } from "./quota.js";

const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;

/** RevenueCat webhook olayı — yalnız kullandığımız alanlar */
const webhookSchema = z.object({
  event: z.object({
    type: z.string(),
    app_user_id: z.string(),
    original_app_user_id: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    entitlement_ids: z.array(z.string()).nullable().optional(),
    product_id: z.string().optional(),
    expiration_at_ms: z.number().nullable().optional(),
  }),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Sabit zamanlı karşılaştırma — sır başlığı zamanlama ile tahmin edilemesin */
function secretMatches(header: string | undefined): boolean {
  const secret = env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const candidates = [header, header.replace(/^Bearer\s+/i, "")];
  return candidates.some((c) => {
    const a = Buffer.from(c);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/** Etkinliğin dokunduğu Supabase kullanıcı kimlikleri ($RCAnonymousID'ler elenir) */
function userIdsOf(ev: z.infer<typeof webhookSchema>["event"]): string[] {
  const ids = [ev.app_user_id, ev.original_app_user_id, ...(ev.aliases ?? [])].filter(
    (x): x is string => !!x && UUID.test(x),
  );
  return [...new Set(ids)];
}

export default async function billingRoutes(app: FastifyInstance) {
  /**
   * Satın alma / geri yükleme sonrası ZORLA doğrulama — istemci mağaza
   * işleminden hemen sonra çağırır, kota göstergesi aynı karede açılır.
   */
  app.post(
    "/me/entitlement/refresh",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 30, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request) => {
      const { entitlement } = await getEntitlement(request.userId, { force: true });
      const quota = await getQuota(request.userId, entitlement.isPro);
      return { entitlement, quota };
    },
  );

  /**
   * RevenueCat webhook. Anahtar varsa olay yalnız TETİKTİR — durum REST'ten
   * yeniden okunur (olay sırası/kopyası sorun olmaz). Anahtar yoksa olayın
   * kendisinden türetilir. Sır tanımlı değilse uç kapalıdır (404).
   */
  app.post("/webhooks/revenuecat", async (request, reply) => {
    if (!env.REVENUECAT_WEBHOOK_SECRET) return reply.code(404).send({ error: "not_found" });
    if (!secretMatches(request.headers.authorization)) return reply.code(401).send({ error: "unauthorized" });

    const parsed = webhookSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });
    const ev = parsed.data.event;
    const ids = userIdsOf(ev);

    for (const userId of ids) {
      if (env.REVENUECAT_SECRET_KEY) {
        await getEntitlement(userId, { force: true });
        continue;
      }
      if (ev.entitlement_ids && !ev.entitlement_ids.includes(env.REVENUECAT_ENTITLEMENT_ID)) continue;
      const expiresAt = ev.expiration_at_ms ? new Date(ev.expiration_at_ms) : null;
      const ended = ev.type === "EXPIRATION" || ev.type === "REFUND" || ev.type === "SUBSCRIPTION_PAUSED";
      await writeStoreState(userId, {
        active: !ended && (expiresAt === null || expiresAt.getTime() > Date.now()),
        productId: ev.product_id ?? null,
        expiresAt,
      });
    }
    return { ok: true, users: ids.length };
  });
}
