import {
  AVATAR_IDS,
  AVATAR_LABELS,
  AVATAR_SYSTEM_OF,
  avatarSettingsSchema,
  adminCoreBodySchema,
  adminOverviewQuerySchema,
  adminPageQuerySchema,
  adminProGrantBodySchema,
  adminRoleplayCreateBodySchema,
  adminRoleplaySpecBodySchema,
  adminSessionsQuerySchema,
  adminTtsPreviewBodySchema,
  adminTutorBodySchema,
  adminTutorCreateBodySchema,
  tutorIdSchema,
  catalogLessonIdSchema,
  ttsSettingsSchema,
} from "@glotmate/contracts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { buildTtsSettingsResponse, previewTts, TtsError, updateTtsSettings } from "../tts/index.js";
import { getAvatarSettings, saveAvatarSettings } from "../avatar/settings.js";
import { AdminError, getAdminLessonDetail, getAdminLessonMatrix } from "./queries.js";
import {
  getAdminUserDetail,
  getAdminUserMemories,
  getAdminUsers,
  getAdminUserSessions,
  setUserProGrant,
} from "./users.js";
import { getAdminOverview } from "./overview.js";
import {
  createRoleplay,
  discardDraft,
  duplicateAsDraft,
  getAdminRoleplayDetail,
  getRoleplayAttempts,
  lintSpec,
  listAdminRoleplays,
  publishDraft,
  RoleplayAdminError,
  saveDraft,
  setRoleplayStatus,
} from "./roleplays.js";
import { getAdminSessionDetail, getAdminSessions } from "./sessions.js";
import { createTutor, listAdminTutors, TutorAdminError, updateTutor } from "./tutors.js";
import { sampleLine } from "../tutor/routes.js";
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

function sendRoleplayError(reply: FastifyReply, err: unknown) {
  if (err instanceof AdminError) return reply.code(404).send({ error: err.code });
  if (err instanceof RoleplayAdminError) {
    const status = err.code === "lint_failed" ? 422 : err.code === "not_found" ? 404 : 409;
    return reply.code(status).send({ error: err.code, ...(err.report ? { report: err.report } : {}) });
  }
  throw err;
}

const roleplayParams = z.object({ id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/) });
const userParams = z.object({ id: z.string().uuid() });

function sendTutorError(reply: FastifyReply, err: unknown) {
  if (err instanceof TutorAdminError) {
    const status = err.code === "not_found" ? 404 : err.code === "exists" ? 409 : 400;
    return reply.code(status).send({ error: err.code, message: err.message });
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

  // --- Overview (maliyet panosu) ---------------------------------------------
  app.get("/admin/overview", { preHandler: app.requireAdmin }, async (request, reply) => {
    const q = adminOverviewQuerySchema.safeParse(request.query ?? {});
    if (!q.success) return reply.code(400).send({ error: "invalid_params" });
    return await getAdminOverview(q.data.days);
  });

  // --- Roleplay yönetimi -----------------------------------------------------
  app.get("/admin/roleplays", { preHandler: app.requireAdmin }, async () => {
    return await listAdminRoleplays();
  });

  // Kuru koşu: şema (400) + kapı raporu — yazmaz. Editör her değişiklikte çağırır.
  app.post("/admin/roleplays/lint", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = adminRoleplaySpecBodySchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "invalid_input", issues: body.error.issues });
    return { report: lintSpec(body.data.spec) };
  });

  app.post("/admin/roleplays", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = adminRoleplayCreateBodySchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "invalid_input", issues: body.error.issues });
    try {
      return reply.code(201).send(await createRoleplay(body.data.id, body.data.spec));
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.get("/admin/roleplays/:id", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await getAdminRoleplayDetail(p.data.id);
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.put("/admin/roleplays/:id/draft", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.safeParse(request.params);
    const body = adminRoleplaySpecBodySchema.safeParse(request.body);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    if (!body.success) return reply.code(400).send({ error: "invalid_input", issues: body.error.issues });
    try {
      return await saveDraft(p.data.id, body.data.spec);
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.delete("/admin/roleplays/:id/draft", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await discardDraft(p.data.id);
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.post("/admin/roleplays/:id/draft/publish", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await publishDraft(p.data.id);
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.post("/admin/roleplays/:id/revisions/:revisionId/duplicate", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.extend({ revisionId: z.string().uuid() }).safeParse(request.params);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    try {
      return await duplicateAsDraft(p.data.id, p.data.revisionId);
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.post("/admin/roleplays/:id/status", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.safeParse(request.params);
    const body = z.object({ status: z.enum(["active", "retired"]) }).safeParse(request.body);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    if (!body.success) return reply.code(400).send({ error: "invalid_input" });
    try {
      return await setRoleplayStatus(p.data.id, body.data.status);
    } catch (err) {
      return sendRoleplayError(reply, err);
    }
  });

  app.get("/admin/roleplays/:id/attempts", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = roleplayParams.safeParse(request.params);
    const q = adminPageQuerySchema.safeParse(request.query ?? {});
    if (!p.success || !q.success) return reply.code(400).send({ error: "invalid_params" });
    return await getRoleplayAttempts(p.data.id, q.data);
  });

  // --- Kullanıcılar ------------------------------------------------------------
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

  app.get("/admin/users/:id/sessions", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = userParams.safeParse(request.params);
    const q = adminPageQuerySchema.safeParse(request.query ?? {});
    if (!p.success || !q.success) return reply.code(400).send({ error: "invalid_params" });
    return await getAdminUserSessions(p.data.id, q.data);
  });

  app.get("/admin/users/:id/memories", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = userParams.safeParse(request.params);
    const q = adminPageQuerySchema.safeParse(request.query ?? {});
    if (!p.success || !q.success) return reply.code(400).send({ error: "invalid_params" });
    return await getAdminUserMemories(p.data.id, q.data);
  });

  // Ücretsiz Pro tanıma/geri alma — mağaza aboneliğine dokunmaz
  app.post("/admin/users/:id/pro", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = userParams.safeParse(request.params);
    const body = adminProGrantBodySchema.safeParse(request.body);
    if (!p.success) return reply.code(400).send({ error: "invalid_params" });
    if (!body.success) return reply.code(400).send({ error: "invalid_input" });
    try {
      return await setUserProGrant(p.data.id, body.data);
    } catch (err) {
      return sendActionError(reply, err);
    }
  });

  // --- Oturumlar (salt okunur; bug avı) --------------------------------------
  app.get("/admin/sessions", { preHandler: app.requireAdmin }, async (request, reply) => {
    const q = adminSessionsQuerySchema.safeParse(request.query ?? {});
    if (!q.success) return reply.code(400).send({ error: "invalid_params", issues: q.error.issues });
    return await getAdminSessions(q.data);
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

  // --- Ayarlar: Avatar (tts deseninin aynası; kayıt listesi koddan gelir) ------
  app.get("/admin/settings/avatar", { preHandler: app.requireAdmin }, async () => {
    const stored = await getAvatarSettings();
    return {
      settings: stored.settings,
      avatars: AVATAR_IDS.map((id) => ({ id, label: AVATAR_LABELS[id], system: AVATAR_SYSTEM_OF[id] })),
      updatedAt: stored.updatedAt,
    };
  });

  app.put("/admin/settings/avatar", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = avatarSettingsSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "invalid_input" });
    const stored = await saveAvatarSettings(body.data, request.userId ?? null);
    return {
      settings: stored.settings,
      avatars: AVATAR_IDS.map((id) => ({ id, label: AVATAR_LABELS[id], system: AVATAR_SYSTEM_OF[id] })),
      updatedAt: stored.updatedAt,
    };
  });

  // --- Öğretmenler (yüz + ses + ad; kullanıcı onboarding/ayarlarda seçer) --------
  app.get("/admin/tutors", { preHandler: app.requireAdmin }, async () => {
    return await listAdminTutors();
  });

  app.post("/admin/tutors", { preHandler: app.requireAdmin }, async (request, reply) => {
    const body = adminTutorCreateBodySchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "invalid_input", issues: body.error.issues });
    try {
      return await createTutor(body.data, request.userId ?? null);
    } catch (err) {
      return sendTutorError(reply, err);
    }
  });

  app.put("/admin/tutors/:id", { preHandler: app.requireAdmin }, async (request, reply) => {
    const p = z.object({ id: tutorIdSchema }).safeParse(request.params);
    const body = adminTutorBodySchema.safeParse(request.body);
    if (!p.success || !body.success) {
      return reply.code(400).send({ error: "invalid_input", issues: body.success ? [] : body.error.issues });
    }
    try {
      return await updateTutor(p.data.id, body.data, request.userId ?? null);
    } catch (err) {
      return sendTutorError(reply, err);
    }
  });

  /** Öğretmenin tanıtım cümlesi — panel sesi önizlerken kullanıcının duyacağı cümleyi bilsin */
  app.get("/admin/tutors/sample-line", { preHandler: app.requireAdmin }, async (request) => {
    const q = z.object({ name: z.string().trim().min(1).max(24) }).safeParse(request.query ?? {});
    return { text: sampleLine(q.success ? q.data.name : "Emma") };
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
