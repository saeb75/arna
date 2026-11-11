import { TranslateError } from "../translate/index.js";
import { catalogLessonIdSchema, hasWordContent, sessionSyncBodySchema } from "@glotmate/contracts";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  chatTurn,
  endSession,
  openSession,
  resumeLesson,
  reviewAnswer,
  SessionError,
  stt,
  syncSession,
  translate,
  tts,
  ttsEnglish,
  ttsEnglishStreamTicket,
  ttsStreamTicket,
} from "./service.js";
import { getStreamTicket, mouthTrack, pipeStreamTicket } from "../tts/index.js";

const sessionParams = z.object({ sessionId: z.string().uuid() });
const lessonParams = z.object({ catalogLessonId: catalogLessonIdSchema });
const chatBody = z.object({
  // Yalnız noktalama (",,", "?!") cevap da selam da değildir — modele gitmez.
  // İstemciler zaten göndermez; bu, başka istemcilere karşı ikinci kapı.
  text: z.string().trim().min(1).max(1000).refine(hasWordContent),
  phase: z.enum(["lecture", "practice", "wrapup"]).optional(),
  /** Lecture fazında aktif beat */
  beatId: z.string().max(40).optional(),
  /** Practice fazında kaçıncı tur (0-tabanlı) — kapanış kararı için */
  turnIndex: z.number().int().min(0).max(20).optional(),
  /** Alıştırmada kaçıncı deneme (0-tabanlı) */
  attempt: z.number().int().min(0).max(5).optional(),
  /** Bu adımda bu sözden ÖNCE geçen LLM turu (istemci sayacı) — hocanın sözü akışla aynı sonuçtan türer */
  exchanges: z.number().int().min(0).max(20).optional(),
  /** Soru penceresinin son turu — hoca kapanış yapar, yeni soru davet etmez */
  lastExchange: z.boolean().optional(),
  /** Öğrenci hoca cevap beklemeyen bir şey söylerken söz aldı (araya girme) */
  interjection: z.boolean().optional(),
  /** Sözü kesildiğinde hocanın ekrandaki son cümlesi — yalnız bağlam */
  interruptedText: z.string().max(2000).optional(),
});
/**
 * v7: dil etiketli parçalar; toplam uzunluk tavanı parça BAŞINA değil TOPLAMDA.
 * Eski `{text}` gövdesi tek İngilizce parça sayılır (geçiş uyumu).
 *
 * Tavanlar ANLATIM bölümüne göre boyutlandı: teach beat'i tek speak çağrısında
 * gider ve 4 nokta × (açıklama parçaları + örnekler) 30+ parça / ~3000 karakter
 * edebilir. Eski 12 parça / 900 karakter tavanı canlıda tam da bu bölümü
 * sessizce susturdu (400 invalid_input; diğer bölümler kısa olduğundan konuştu).
 * Kötüye kullanımın asıl bekçileri rate limit + günlük maliyet bütçesi.
 */
const ttsBody = z
  .union([
    z.object({
      runs: z
        .array(z.object({ lang: z.enum(["en", "l1"]), text: z.string().trim().min(1) }))
        .min(1)
        .max(48),
    }),
    z.object({ text: z.string().trim().min(1) }),
  ])
  .refine(
    (b) => ("runs" in b ? b.runs.reduce((n, r) => n + r.text.length, 0) : b.text.length) <= 4000,
    { message: "toplam metin 4000 karakteri aşamaz" },
  );

const byUser = (req: FastifyRequest) => (req as { userId?: string }).userId ?? req.ip;

function sendError(reply: { code: (n: number) => { send: (b: unknown) => unknown } }, err: unknown) {
  if (err instanceof SessionError) {
    const status =
      err.code === "not_found"
        ? 404
        : err.code === "session_ended"
          ? 409
          : err.code === "lesson_not_ready" || err.code === "stream_unsupported"
            ? 409
            : 502;
    return reply.code(status).send({ error: err.code });
  }
  if (err instanceof TranslateError) return reply.code(502).send({ error: "translate_unavailable" });
  throw err;
}

export default async function sessionRoutes(app: FastifyInstance) {
  app.post(
    "/lessons/:catalogLessonId/sessions",
    {
      preHandler: app.requireAuth,
      // Kota yok (5 Kas 2026) — tavan yalnız kötüye kullanım freni; selamlama LLM'i oturum başına bir kez
      config: { rateLimit: { max: 60, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = lessonParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return reply.code(201).send(await openSession(request.userId, params.data.catalogLessonId));
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // Devam sorgusu: bu derste sürdürülebilir açık oturum var mı?
  // Yoksa/güvenli değilse { resume: null } — istemci temiz başlangıç kartı gösterir.
  app.get(
    "/lessons/:catalogLessonId/resume",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = lessonParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await resumeLesson(request.userId, params.data.catalogLessonId);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // Fire-and-forget istemci senkronu: pozisyon imleci + script/deterministik
  // transkript satırları. İstemci hatayı sessizce yutar — ders asla bloke olmaz.
  app.post(
    "/sessions/:sessionId/sync",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 600, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      const body = sessionSyncBodySchema.safeParse(request.body);
      if (!params.success || !body.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await syncSession(request.userId, params.data.sessionId, body.data);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/chat",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      const body = chatBody.safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        return await chatTurn(request.userId, params.data.sessionId, body.data.text, {
          phase: body.data.phase ?? "lecture",
          beatId: body.data.beatId,
          turnIndex: body.data.turnIndex ?? 0,
          attempt: body.data.attempt ?? 0,
          exchanges: body.data.exchanges,
          lastExchange: body.data.lastExchange ?? false,
          interjection: body.data.interjection ?? false,
          interruptedText: body.data.interruptedText,
        });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/translate",
    {
      preHandler: app.requireAuth,
      // Oyun bloğunda dokun-çevir de bu uçtan geçer; sonuçlar önbellekli olduğu için tavan geniş
      config: { rateLimit: { max: 300, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      // translate düz metin alır (balon çevirisi) — tts'in runs gövdesinden ayrıldı
      const body = z.object({ text: z.string().trim().min(1).max(900) }).safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        return await translate(request.userId, params.data.sessionId, body.data.text);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/review",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      // `context` = bir önceki hoca mesajı; cevap PARÇASI ("twenty five") haksız
      // yere hata sayılmasın diye prompt'a bağlam olarak girer, karar girdisi değildir.
      const body = z
        .object({
          text: z.string().trim().min(1).max(900),
          context: z.string().trim().max(900).optional(),
        })
        .safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        return await reviewAnswer(
          request.userId,
          params.data.sessionId,
          body.data.text,
          body.data.context,
        );
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/tts",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      const body = ttsBody.safeParse(request.body);
      if (!params.success || !body.success) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        // Eski `{text}` gövdesi İNGİLİZCE sayılır (geçiş uyumu; web/mobil artık kullanmıyor).
        // Ana dil metni bu yoldan gelirse İngilizce aksanla okunur — yeni kod daima `runs` yollar.
        const runs = "runs" in body.data ? body.data.runs : [{ lang: "en" as const, text: body.data.text }];
        return await tts(request.userId, params.data.sessionId, runs);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // AKIŞLI SES — bilet (auth'lu) + mp3 akışı (bilet kimliği yetkidir, JWT adrese girmez).
  // Ders başına ~40-60 konuşma: saatlik tavan tam klip ucuyla aynı ölçekte.
  app.post(
    "/sessions/:sessionId/tts/stream",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 300, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      const body = ttsBody.safeParse(request.body);
      if (!params.success || !body.success || !("runs" in body.data)) {
        return reply.code(400).send({ error: "invalid_input" });
      }
      try {
        return await ttsStreamTicket(request.userId, params.data.sessionId, body.data.runs);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // OTURUMSUZ İNGİLİZCE SES — ünite testinin dinleme maddeleri. İstemci ders yoluyla AYNI
  // gövdeyi (`runs`) yollar; yalnız İngilizce okunur, toplam en fazla 300 karakter.
  const englishTtsBody = z.object({
    runs: z.array(z.object({ lang: z.enum(["en", "l1"]), text: z.string().min(1) })).min(1).max(4),
  });
  const englishText = (runs: Array<{ text: string }>) => runs.map((r) => r.text).join(" ").trim();

  app.post(
    "/tts",
    { preHandler: app.requireAuth, config: { rateLimit: { max: 300, timeWindow: "1 hour", keyGenerator: byUser } } },
    async (request, reply) => {
      const body = englishTtsBody.safeParse(request.body);
      const text = body.success ? englishText(body.data.runs) : "";
      if (!text || text.length > 300) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await ttsEnglish(request.userId, text);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/tts/stream",
    { preHandler: app.requireAuth, config: { rateLimit: { max: 300, timeWindow: "1 hour", keyGenerator: byUser } } },
    async (request, reply) => {
      const body = englishTtsBody.safeParse(request.body);
      const text = body.success ? englishText(body.data.runs) : "";
      if (!text || text.length > 300) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await ttsEnglishStreamTicket(request.userId, text);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.get(
    "/tts/stream/:ticket",
    { config: { rateLimit: { max: 600, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const ticket = z.object({ ticket: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/) }).safeParse(request.params);
      const t = ticket.success ? getStreamTicket(ticket.data.ticket) : null;
      if (!t) return reply.code(404).send({ error: "not_found" });
      reply.hijack(); // ham akış: Fastify serileştirme/sıkıştırma araya girmesin
      pipeStreamTicket(t, reply.raw);
    },
  );

  // AĞIZ İZİ — akış çalarken istemci birkaç yüz ms'de bir yoklar (oynatıcı uzak adreste ses
  // örneği vermediği için avatarın ağzı bu seviyelerle sürülür). Bilet kimliği yetkidir.
  // Konuşma başına ~10-15 yoklama (üretim gerçek zamandan hızlı, `done` gelince durur).
  app.get(
    "/tts/stream/:ticket/mouth",
    { config: { rateLimit: { max: 6000, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const ticket = z.object({ ticket: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/) }).safeParse(request.params);
      const q = z.object({ from: z.coerce.number().int().min(0).max(1_000_000).default(0) }).safeParse(request.query);
      const t = ticket.success ? getStreamTicket(ticket.data.ticket) : null;
      if (!t || !q.success) return reply.code(404).send({ error: "not_found" });
      return mouthTrack(t, q.data.from);
    },
  );

  app.post(
    "/sessions/:sessionId/stt",
    {
      preHandler: app.requireAuth,
      config: { rateLimit: { max: 120, timeWindow: "1 hour", keyGenerator: byUser } },
    },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      if (!params.success) return reply.code(400).send({ error: "invalid_input" });

      const file = await request.file();
      if (!file) return reply.code(400).send({ error: "no_file" });
      const buffer = await file.toBuffer();
      if (buffer.length < 1000) return reply.code(400).send({ error: "audio_too_short" });

      try {
        return await stt(request.userId, params.data.sessionId, buffer, file.mimetype, file.filename);
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.post(
    "/sessions/:sessionId/end",
    { preHandler: app.requireAuth },
    async (request, reply) => {
      const params = sessionParams.safeParse(request.params);
      // outcome=abandoned: "Baştan başla" / yarıda bırakma — ders TAMAMLANMAZ
      const body = z
        .object({ outcome: z.enum(["completed", "abandoned"]).optional() })
        .safeParse(request.body ?? {});
      if (!params.success || !body.success) return reply.code(400).send({ error: "invalid_input" });
      try {
        return await endSession(request.userId, params.data.sessionId, body.data.outcome ?? "completed");
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );
}
