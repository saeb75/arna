import { adminCoreBodySchema, adminTtsPreviewBodySchema, catalogLessonIdSchema, ttsSettingsSchema } from "@glotmate/contracts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { buildTtsSettingsResponse, previewTts, TtsError, updateTtsSettings } from "../tts/index.js";
import { AdminError, getAdminLessonDetail, getAdminLessonMatrix } from "./queries.js";
import { getAdminUserDetail, getAdminUsers } from "./users.js";
import { getAdminSessionDetail, getAdminSessions } from "./sessions.js";
import {
  AdminActionError,
  generateLocale,
  publishLesson,
  regenerateCore,
  regenerateScenes,
  saveCore,
} from "./service.js";

/**
 * ADMİN UÇLARI — yalnız `app_metadata.role === "admin"` (plugins/auth.ts →
 * `requireAdmin`). Panel (apps/admin) dışında tüketicisi yok; kullanıcı
 * istemcileri bu uçları bilmez.
 *
 * Dersler: matris (salt okunur) + detay + katman aksiyonları. Mutasyonların TAMAMI
 * detail döner. LLM tetikleyen uçlar senkron (~10–60 sn) ve kullanıcı başına sıkı
 * limitli — toplu iş istemcide orkestre edilir (kuyruk yok).
 *
 * Ayarlar: `app_settings` anahtar/değer; ilk anahtar `tts` (aktif sağlayıcı +
 * ses/model). API anahtarları .env'de kalır, hiçbir uç onları döndürmez.
 */
const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;
const perUser = (max: number) => ({ rateLimit: { max, timeWindow: "1 minute", keyGenerator: byUser } });

const params = z.object({ id: catalogLessonIdSchema });
const localeParams = params.extend({ language: z.string().min(2).max(12) });

function sendActionError(reply: FastifyReply, err: unknown) {
  if (err instanceof AdminError) return reply.code(404).send({ error: err.code });
  if (err instanceof AdminActionError) {
    const status =
      err.code === "lint_failed" ? 422 : err.code === "layer_not_ready" || err.code === "locale_in_progress" ? 409 : 502;
    return reply.code(status).send({ error: err.code, ...(err.report ? { report: err.report } : {}) });
  }
  throw err;
}

function sendTtsError(reply: FastifyReply, err: unknown) {
  if (err instanceof TtsError) {
    return reply.code(err.code === "provider_not_configured" ? 400 : 502).send({ error: err.code, message: err.message });
  }
  throw err;
}

export default async function adminRoutes(app: FastifyInstance) {
  // --- Dersler --------------------------------------------------------------
  app.get("/admin/lessons", { preHandler: app.requireAdmin }, async () => {
    return await getAdminLessonMatrix();
  });

  app.get("/admin/lessons/:id", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = params.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await getAdminLessonDetail(p.data.id);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  app.post("/admin/lessons/:id/core/regenerate", { preHandler: app.requireAdmin, config: perUser(10) }, async (request, reply) => {
    const p = params.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await regenerateCore(p.data.id);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  app.post("/admin/lessons/:id/scenes/regenerate", { preHandler: app.requireAdmin, config: perUser(10) }, async (request, reply) => {
    const p = params.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await regenerateScenes(p.data.id);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  // Kuru koşu: şema (400) + lint (422) — yazmaz
  app.post("/admin/lessons/:id/core/lint", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = params.safeParse(request.params);
    const body = adminCoreBodySchema.safeParse(request.body);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    if (!body.success) return reply.code(400).send({ error: "invalid_input", issues: body.error.issues });
    try {
      const { report } = await saveCore(p.data.id, body.data.core, { dry: true });
      return { report };
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  app.put("/admin/lessons/:id/core", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = params.safeParse(request.params);
    const body = adminCoreBodySchema.safeParse(request.body);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    if (!body.success) return reply.code(400).send({ error: "invalid_input", issues: body.error.issues });
    try {
      const { detail } = await saveCore(p.data.id, body.data.core, { dry: false });
      return detail;
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  app.post("/admin/lessons/:id/locales/:language", { preHandler: app.requireAdmin, config: perUser(30) }, async (request, reply) => {
    const p = localeParams.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    const force = (request.query as { force?: string }).force === "1";
    try {
      return await generateLocale(p.data.id, p.data.language, { force });
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  app.post("/admin/lessons/:id/publish", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = params.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await publishLesson(p.data.id);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  // --- Kullanıcılar (salt okunur) ---------------------------------------------
  app.get("/admin/users", { preHandler: app.requireAdmin }, async () => {
    return await getAdminUsers();
  });

  app.get("/admin/users/:id", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = z.object({ id: z.string().uuid() }).safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await getAdminUserDetail(p.data.id);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  // --- Oturumlar (salt okunur; bug avı) --------------------------------------
  app.get("/admin/sessions", { preHandler: app.requireAdmin }, async (request, reply) => {
    const q = z.object({ limit: z.coerce.number().int().min(1).max(1000).default(200) }).safeParse(request.query ?? {});
    if (!q.success) return reply.code(400).send({ error: "invalid_params" });
    return await getAdminSessions({ limit: q.data.limit });
  });

  app.get("/admin/sessions/:id", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = z.object({ id: z.string().uuid() }).safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await getAdminSessionDetail(p.data.id);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  // --- Ayarlar: TTS -----------------------------------------------------------
  app.get("/admin/settings/tts", { preHandler: app.requireAdmin }, async () => {
    return await buildTtsSettingsResponse();
  });

  app.put("/admin/settings/tts", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = ttsSettingsSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "invalid_input" });
    try {
      return await updateTtsSettings(body.data, request.userId ?? null);
    } catch (err) {
      return sendTtsError(reply, err);
    }
  });

  // Kaydetmeden dinleme — gerçek sağlayıcı çağrısı, önbellek yok; kötüye kullanım için düşük tavan
  app.post(
    "/admin/settings/tts/preview",
    {
      preHandler: app.requireAdmin,
      config: { rateLimit: { max: 30, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const body = adminTtsPreviewBodySchema.safeParse(request.body);
      if (!body.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await previewTts(body.data);
      } catch (err) {
        return sendTtsError(reply, err);
      }
    },
  );
}
