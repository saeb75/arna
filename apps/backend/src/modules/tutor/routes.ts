import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { tutorIdSchema } from "@glotmate/contracts";
import { resolveLanguage, resolveTutorTts, synthesizeRunsToClips, TtsError } from "../tts/index.js";
import { listActiveTutors, listTutorRecords, toPublicTutor } from "./registry.js";

const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;
const params = z.object({ id: tutorIdSchema });

/** Tanıtım cümlesi — İngilizce (hedef dil), her ana dilde aynı; ses önbelleği öğretmen başına bir kez üretir */
export function sampleLine(name: string): string {
  return `Hi, I'm ${name}. Let's practise speaking English together!`;
}

/**
 * ÖĞRETMEN SEÇİMİ — onboarding ve ayarlar ekranı. İstemci yalnız ad/avatar/cinsiyet
 * görür; ses ayrıntısı (sağlayıcı, ses kimliği) sunucuda kalır. Seçim `PATCH /me/profile`
 * (`tutorId`) ya da onboarding gövdesiyle yazılır.
 */
export default async function tutorRoutes(app: FastifyInstance) {
  app.get("/tutors", { preHandler: app.requireAuth }, async () => {
    const { tutors, defaultId } = await listActiveTutors();
    return { tutors: tutors.map(toPublicTutor), defaultId };
  });

  /** Sesini dinle — seçmeden önce. Tam klip (base64 mp3), ses önbelleğinden. */
  app.post(
    "/tutors/:id/sample",
    { preHandler: app.requireAuth, config: { rateLimit: { max: 60, timeWindow: "1 hour", keyGenerator: byUser } } },
    async (request, reply) => {
      const p = params.safeParse(request.params);
      if (!p.success) return reply.code(400).send({ error: "invalid_params" });
      const tutor = (await listTutorRecords()).find((t) => t.id === p.data.id && t.status === "active");
      if (!tutor) return reply.code(404).send({ error: "not_found" });
      try {
        const active = await resolveTutorTts(tutor.voice);
        const en = await resolveLanguage(active, "en");
        if (!en) return reply.code(502).send({ error: "tts_unavailable" });
        return { clips: await synthesizeRunsToClips(active, [{ languageCode: en, text: sampleLine(tutor.name) }]) };
      } catch (err) {
        if (err instanceof TtsError) return reply.code(502).send({ error: "tts_unavailable" });
        throw err;
      }
    },
  );
}
