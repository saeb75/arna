import {
  answerReviewModelSchema,
  decideInWrapup,
  MAX_BEAT_EXCHANGES,
  normalizeUtterance,
  PRACTICE_MIN_MAX_TURNS,
  PRACTICE_MIN_TURNS_BEFORE_GOAL,
  roleplaySpecSchema,
  sessionPositionSchema,
  triageAnswer,
  type AnswerReview,
  type ChromeBundle,
  type CoreBeat,
  type LessonContentV7,
  type LessonCore,
  type LessonPhase,
  type RichText,
  type RoleplaySpec,
  type SceneVariant,
  type SessionPosition,
  type SessionScript,
  type SessionSyncBody,
  type Track,
  type TranscriptTurn,
} from "@glotmate/contracts";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { toFile } from "openai";
import { z } from "zod";
import { db } from "../../db/client.js";
import { languageName, nativeLanguageOf } from "../../lib/language.js";
import {
  lessonCores,
  lessonProgress,
  lessonSceneSets,
  roleplayRevisions,
  sessions,
  transcriptTurns,
  userProfiles,
} from "../../db/schema.js";
import { getChrome } from "../../i18n/index.js";
import { completeJson, completeText } from "../llm/index.js";
import { resolveActiveTts, resolveLanguage, synthesizeRunsToClips, TtsError, type CharAlignment, type TtsRun } from "../tts/index.js";
import { refineRunsForInlineEnglish } from "../tts/inlineEnglish.js";
import { ANSWER_REVIEW_VERSION, buildAnswerReviewPrompt } from "../llm/prompts/answer-review.v1.js";
import { openaiClient } from "../llm/openai.js";
import { resolveLesson, LayerError } from "../lesson/layers.js";
import { extractSessionMemory } from "../memory/extract.js";
import { buildMemoryBlock, MEMORY_RECALL_ENABLED } from "../memory/retrieve.js";
import { renderSessionScript } from "./script.js";
import { isPromptEcho } from "./sttEcho.js";
import { appendToBeatLog, historyFor, runLectureTurn, type BeatLog, type Learner, type TurnLlm } from "./turn/index.js";
import { runConversationTurn } from "./turn/conversation.js";
import { runInterjectionTurn } from "./turn/interjection.js";
import { OPTION_LETTERS, replyRunsSchema } from "./turn/prompt.js";
import { roleplayDebrief, roleplayTurn, type RoleplayDebrief } from "../roleplay/service.js";

export class SessionError extends Error {
  constructor(
    public code:
      | "not_found"
      | "lesson_not_ready"
      | "session_ended"
      | "tts_unavailable"
      | "stt_failed",
    message: string,
  ) {
    super(message);
  }
}

/**
 * Oturumu sahiplik kontrolüyle getirir — v7: oynatılan katman satırlarıyla.
 * `scene` oturumun state'ine pinlenen track'ten seçilir; kullanıcı profili
 * DEĞİL (profil değişse bile açık oturumun sahnesi değişmez).
 */
async function getOwnedSession(userId: string, sessionId: string) {
  const [row] = await db
    .select({
      session: sessions,
      coreRow: lessonCores,
      sceneRow: lessonSceneSets,
      roleplayRevRow: roleplayRevisions,
    })
    .from(sessions)
    .leftJoin(lessonCores, eq(sessions.coreId, lessonCores.id))
    .leftJoin(lessonSceneSets, eq(sessions.sceneSetId, lessonSceneSets.id))
    .leftJoin(roleplayRevisions, eq(sessions.roleplayRevisionId, roleplayRevisions.id))
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1);
  if (!row) return null;

  const state = (row.session.state as SessionState | null) ?? null;
  const core = (row.coreRow?.core as LessonCore | undefined) ?? null;
  const scenes = row.sceneRow?.scenes as Record<string, SceneVariant> | undefined;
  const scene = scenes?.[state?.track ?? "everyday"] ?? null;

  // Roleplay oturumu KESİN revizyona pinli — spec oradan okunur. Şemadan
  // geçmeyen saklı spec servis edilmez (queries.ts'teki son savunmanın aynısı).
  let roleplaySpec: RoleplaySpec | null = null;
  if (row.session.sessionKind === "roleplay" && row.roleplayRevRow) {
    const parsed = roleplaySpecSchema.safeParse(row.roleplayRevRow.spec);
    if (parsed.success) roleplaySpec = parsed.data;
    else console.error(`[roleplay] ${sessionId}: pinli revizyonun spec'i şemadan geçmiyor`);
  }

  return { session: row.session, core, scene, state, roleplaySpec };
}

// ---------------------------------------------------------------------------
// Oturum açma
// ---------------------------------------------------------------------------

export async function openSession(userId: string, catalogLessonId: string) {
  // Sahiplik join'i yok: katalog herkese açık, içerik kullanıcıdan bağımsız.
  // Kullanıcıya ait olan tek şey OTURUM ve İLERLEME — ikisi de aşağıda yazılıyor.
  let resolved;
  try {
    resolved = await resolveLesson(userId, catalogLessonId);
  } catch (err) {
    if (err instanceof LayerError) {
      throw new SessionError("lesson_not_ready", err.message);
    }
    throw err;
  }

  // Aynı dersin önceki açık oturumları TERK EDİLMİŞ sayılır: kapat (ilerlemeye
  // dokunmadan) ki yetim açık oturum birikmesin ve devam araması tek satır bulsun.
  // "Devam et" bu fonksiyona hiç gelmez — istemci resume ucuyla AYNI oturumu sürdürür.
  await db
    .update(sessions)
    .set({ endedAt: new Date() })
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.catalogLessonId, catalogLessonId),
        isNull(sessions.endedAt),
      ),
    );

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      catalogLessonId,
      sessionKind: "lesson",
      coreId: resolved.coreId,
      sceneSetId: resolved.sceneSetId,
      localeId: resolved.localeId,
    })
    .returning();
  const sessionId = session!.id;

  // Ders ancak öğrenci GERÇEKTEN başlattığında "devam ediyor" olur.
  // (İçeriği getirmek veya arka planda önceden üretmek durumu değiştirmez —
  //  aksi halde hiç girilmemiş dersler de "devam ediyor" görünüyordu.)
  // İLERLEME SATIRI BURADA DOĞAR: yokluğu "not_started" demek.
  await db
    .insert(lessonProgress)
    .values({ userId, catalogLessonId, status: "in_progress", sessionCount: 1 })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.catalogLessonId],
      set: {
        sessionCount: sql`${lessonProgress.sessionCount} + 1`,
        updatedAt: new Date(),
      },
    });

  const content = resolved.content;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const displayName = profile?.displayName ?? "there";
  const tutorLanguage = (profile?.tutorLanguage ?? "native") as "native" | "english";

  // Hocanın bu öğrenciye söyleyeceği cümleler burada üretilir: içerik kullanıcıdan
  // bağımsızdır, kişiselleştirme (ad + hafıza + geçen ders) bu adımda girer.
  let memoryBlock: string | null = null;
  try {
    memoryBlock = await buildMemoryBlock(
      userId,
      { topic: content.topic, focus: content.focus, theme: content.theme },
      { excludeSessionId: sessionId },
    );
  } catch (err) {
    console.error(`[memory] blok kurulamadı (session ${sessionId}):`, err);
  }

  const script = await renderSessionScript({
    core: resolved.core,
    chrome: getChrome(content.tutorLanguage === "native" ? content.nativeLanguage : "en"),
    tutorLanguage,
    nativeLanguage: content.nativeLanguage,
    scenarioText: content.practice.scenario,
    displayName,
    cefrLevel: profile?.cefrLevel ?? "A2",
    memoryBlock,
    userId,
    sessionId,
    // Ders adı İNGİLİZCE (katalog başlığı) — kullanıcı kararı 4 Kas 2026
    lessonTitle: content.titleEn,
  });

  await db
    .update(sessions)
    .set({
      state: { memoryBlock, script, track: resolved.track, tutorLanguage } satisfies SessionState,
    })
    .where(eq(sessions.id, sessionId));

  return { sessionId, script, lesson: content };
}

// ---------------------------------------------------------------------------
// Devam (resume) — ders AYNI oturumda kaldığı yerden sürer
// ---------------------------------------------------------------------------

export interface ResumePayload {
  sessionId: string;
  startedAt: string;
  position: SessionPosition;
  script: SessionScript;
  lesson: LessonContentV7;
  transcript: TranscriptTurn[];
}

/**
 * Bu derste sürdürülebilir açık oturum var mı? Varsa istemcinin store'unu
 * doldurmaya yetecek HER ŞEYİ döndürür. Devam yalnız pinli çekirdek/sahne HÂLÂ
 * yayındaki çözümle aynıysa sunulur: permüte tohumu core satır kimliğine bağlı
 * olduğundan içerik birebir aynıdır (beat id'leri ve şık dizilimi dahil).
 * Çekirdek yeniden yayınlandıysa güvenli devam yok → null (tek seçenek "Baştan").
 */
export async function resumeLesson(
  userId: string,
  catalogLessonId: string,
): Promise<{ resume: ResumePayload | null }> {
  const [open] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.catalogLessonId, catalogLessonId),
        isNull(sessions.endedAt),
      ),
    )
    .orderBy(desc(sessions.startedAt))
    .limit(1);
  if (!open) return { resume: null };

  const state = (open.state ?? {}) as SessionState;
  const pos = sessionPositionSchema.safeParse(open.position);
  // Pozisyon hiç sync'lenmemiş (ders karttan öteye gitmemiş) ya da bozuksa
  // sürdürülecek nokta yok — temiz başlangıç daha doğru.
  if (!state.script || !pos.success) return { resume: null };

  let resolved;
  try {
    resolved = await resolveLesson(userId, catalogLessonId);
  } catch {
    return { resume: null };
  }
  if (resolved.coreId !== open.coreId || resolved.sceneSetId !== open.sceneSetId) {
    return { resume: null };
  }

  const rows = await db
    .select()
    .from(transcriptTurns)
    .where(eq(transcriptTurns.sessionId, open.id))
    .orderBy(asc(transcriptTurns.id));

  return {
    resume: {
      sessionId: open.id,
      startedAt: open.startedAt.toISOString(),
      position: pos.data,
      script: state.script,
      lesson: resolved.content,
      transcript: rows.map((r) => ({
        id: r.id,
        role: r.role as "user" | "assistant",
        text: r.text,
        runs: (r.runs as RichText | null) ?? null,
        phase: r.phase,
        source: r.source === "script" || r.source === "failed" ? r.source : "chat",
      })),
    },
  };
}

/**
 * İstemcinin fire-and-forget senkronu: pozisyon imleci + sunucuya ULAŞMAYAN
 * transkript satırları (script replikleri, istemcide çözülen öğrenci girdileri).
 * Pozisyon AYRI kolona yazılır — `state` spread'leriyle yarışmaz.
 */
export async function syncSession(
  userId: string,
  sessionId: string,
  body: SessionSyncBody,
): Promise<{ ok: true }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");
  if (owned.session.endedAt) throw new SessionError("session_ended", "Oturum kapandı");

  if (body.position) {
    await db.update(sessions).set({ position: body.position }).where(eq(sessions.id, sessionId));
  }
  if (body.turns?.length) {
    await db.insert(transcriptTurns).values(
      body.turns.map((t) => ({
        sessionId,
        role: t.role,
        text: t.text,
        runs: t.runs ?? null,
        phase: t.phase,
        source: "script",
      })),
    );
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Chat turu
// ---------------------------------------------------------------------------

// Not: Eskiden model yanıtın sonuna `<<DONE>>` ekliyor, bölümü BİTİRME kararı
// bu işarete bakılarak veriliyordu. Model işareti bazen unutuyor, bazen bozuk
// yazıyordu (o hâlde seslendirmeye de sızıyordu). Akış kontrolü artık yalnızca
// sayaçlardan çıkar (`reachedLimit` / `goalMet`); işaret tamamen kaldırıldı.

/** sessions.state içinde tutulan oturum-ömürlü veriler. */
interface SessionState {
  /** Hafıza bloğu oturum başına BİR KEZ hesaplanır (her turda embed etmemek için). */
  memoryBlock?: string | null;
  /** Hocanın bu oturumda söyleyeceği cümleler (içerikten ayrı, kişiselleştirilmiş). */
  script?: SessionScript;
  /** Oturuma PİNLENEN sahne track'i — profil sonradan değişse bile oturum sabit */
  track?: Track;
  /** Oturuma pinlenen öğretim dili */
  tutorLanguage?: "native" | "english";
  /**
   * Rol yapma ölçümü. `hitTurns` = hedef yapının ÜRETİLDİĞİ tur indeksleri.
   * Sayı değil KÜME tutulur: aktarım hatasında istemci aynı turu tekrar gönderiyor,
   * sayaç olsaydı iki kez artardı. İndeks kümesi tekrar işlemeye karşı bağışık.
   */
  practice?: { hitTurns?: number[] };
  /** O anki lecture adımının diyaloğu — konuşma motoru modele bunu gösterir */
  beatLog?: BeatLog;
}

/** RichText → düz metin (transkript ve prompt bağlamı için). */
function runsToPlain(runs: RichText | undefined): string {
  return (runs ?? []).map((r) => r.text).join(" ");
}

/**
 * Hocanın öğrenciyi tanımasını sağlayan blok — oturum boyunca sabit, state'te cache'lenir.
 * Hafıza katmanı düşerse ders akışı ETKİLENMEZ (null döner, prompt bloğu eklenmez).
 */
async function sessionMemoryBlock(
  sessionId: string,
  userId: string,
  state: SessionState | null,
  lesson: { topic: string; focus: string; theme: string },
): Promise<string | null> {
  // Kapalıyken önbellek de okunmaz: kapatmadan ÖNCE açılmış oturumların state'inde
  // blok duruyor olabilir, onlar da hafızasız devam etsin.
  if (!MEMORY_RECALL_ENABLED) return null;
  if (state && "memoryBlock" in state) return state.memoryBlock ?? null;

  let block: string | null = null;
  try {
    block = await buildMemoryBlock(
      userId,
      { topic: lesson.topic, focus: lesson.focus, theme: lesson.theme },
      { excludeSessionId: sessionId },
    );
  } catch (err) {
    console.error(`[memory] blok kurulamadı (session ${sessionId}):`, err);
    return null; // cache'leme — sonraki turda yeniden denensin
  }

  await db
    .update(sessions)
    .set({ state: { ...(state ?? {}), memoryBlock: block } })
    .where(eq(sessions.id, sessionId));

  return block;
}

/**
 * Öğrencinin KAÇ TURDA hedef yapıyı ürettiği. Turu sayarız, toplam geçişi değil —
 * "did did did" tek bir kullanımdır.
 *
 * Eşleşme KELİME SINIRINA saygı duyar. Düz `includes` kullanılıyordu ve `"do"` hedefi
 * *I **do**n't know*, hatta *win**do**w* içinde sayılıyordu; iki turda `goalMet`
 * tetiklenip sahne konuşmanın ortasında kapanıyordu.
 */
/**
 * Sahnenin gerçek tur tavanı. İçerik daha azını yazsa bile taban uygulanır —
 * eski derslerin hepsinde `maxTurns: 6` yazıyor ve bu bir konuşma pratiği için kısa.
 */
function effectiveMaxTurns(core: LessonCore): number {
  return Math.max(core.practice.maxTurns, PRACTICE_MIN_MAX_TURNS);
}

function countTargetUses(mustUse: string[], userTurns: string[]): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const patterns = mustUse
    .map(norm)
    .filter((t) => t.length > 0)
    // (^|boşluk) hedef (boşluk|son) — kesme işareti kelime karakteri sayılmadığı için
    // "don't" içindeki "do" eşleşmez, "what do you think" içindeki "do" eşleşir.
    .map((t) => new RegExp(`(^| )${escape(t)}( |$)`));

  if (patterns.length === 0) return 0;
  return userTurns.filter((turn) => {
    const said = norm(turn);
    return patterns.some((re) => re.test(said));
  }).length;
}

export interface ChatOptions {
  phase?: LessonPhase;
  /** Lecture fazında hangi beat'teyiz */
  beatId?: string;
  /** Practice fazında kaçıncı tur (0-tabanlı) */
  turnIndex?: number;
  /** Alıştırmada kaçıncı deneme (0-tabanlı) */
  attempt?: number;
  /** Bu adımda bu sözden ÖNCE kaç LLM turu geçti (istemci sayacı) */
  exchanges?: number;
  /**
   * Soru penceresinin İZİN VERİLEN SON turu. İstemci sayaçtan hesaplar; hoca
   * bu turda "başka sorun var mı?" DEMEZ, kapanış yapar. Yoksa Emma soru sorarken
   * akış ilerliyor ve ders kendiyle çelişiyor (canlı görülen hata).
   */
  lastExchange?: boolean;
  /**
   * ARAYA GİRME: öğrenci, hoca cevap BEKLEMEYEN bir şey söylerken (anlatım, geçiş,
   * övgü) söz aldı; istemci sesi durdurdu ve kısa cevaptan sonra dersi kaldığı yerden
   * sürdürecek. Söz hiçbir görevin cevabı DEĞİLDİR (bkz. turn/interjection.ts).
   */
  interjection?: boolean;
  /** Sözü kesildiğinde hocanın ekrandaki son cümlesi (araya girmenin bağlamı) */
  interruptedText?: string;
}

/**
 * Cevap sızıntısının son çaresi: görevi öğrencinin dilindeki yönergeyle yeniden
 * okumak. Eskiden sabit İngilizce "Let's try once more." native modda da okunuyordu.
 */
function retryLineFor(beat: CoreBeat, chrome: ChromeBundle, native: boolean): RichText | undefined {
  if (beat.kind !== "exercise") return undefined;
  const label =
    beat.format === "fill_blank"
      ? chrome.labels.exerciseFillBlank
      : beat.format === "mcq"
        ? chrome.labels.exerciseMcq
        : chrome.labels.exerciseSaySentence;
  return [
    { lang: native ? "l1" : "en", text: label },
    { lang: "en", text: beat.item },
    ...(beat.options ?? []).map((o, i) => ({ lang: "en" as const, text: `${OPTION_LETTERS[i]}) ${o}` })),
  ];
}


/**
 * Sohbet turu (practice / wrapup). `usedTarget`/`evidence` YALNIZCA rol yapmada
 * istenir (prompt orada sorar); diğer fazlarda model bunları atlar.
 */
const chatVerdictSchema = z.object({
  reply: replyRunsSchema,
  usedTarget: z.boolean().optional(),
  /** Öğrencinin BİREBİR sözünden alıntı — kod bunu doğrular, uydurma kanıt sayılmaz */
  evidence: z.string().optional(),
});

/**
 * Lecture adımı turu — konuşma motoru + kalıcılık. Motor saftır (DB'siz, taramayla
 * birebir aynı kod); burada yalnız G/Ç yapılır:
 *  - adımın diyaloğu `sessions.state.beatLog`tan okunur ve tur sonunda eklenir
 *    (model kendi az önce dediğini ve öğrencinin önceki denemelerini GÖRÜR);
 *  - transkripte öğrenci + hoca satırı yazılır.
 * Akış kararı yine istemcide: dönen `beatDone`/`isAttempt`, istemcinin
 * `decideAfterTutorReply`ına girer ve sunucunun modele verdiği talimatla AYNI
 * sonucu verir (contracts `outcomeOfVerdict`).
 */
async function lectureTurn(a: {
  userId: string;
  sessionId: string;
  text: string;
  opts: ChatOptions;
  core: LessonCore;
  beatId: string;
  state: SessionState | null;
  learner: Learner;
  surrenderTokens: readonly string[];
  askedLine: string;
  retryLine?: RichText;
}): Promise<{ text: string; runs: RichText; segmentDone: boolean; beatDone?: boolean; isAttempt?: boolean; windowDone?: boolean }> {
  const history = historyFor(a.state?.beatLog, a.beatId);
  // Sayaçlar istemciden (akışı o yürütür). Eski istemci `exchanges` göndermez:
  // son-tur bayrağından ya da adım kaydındaki öğrenci turlarından türetilir.
  const exchanges =
    a.opts.exchanges ??
    (a.opts.lastExchange ? MAX_BEAT_EXCHANGES - 1 : history.filter((t) => t.role === "student").length);

  const llm: TurnLlm = (req) =>
    completeJson({
      purpose: "chat",
      system: req.system,
      user: req.user,
      schema: req.schema,
      promptVersion: req.promptVersion,
      userId: a.userId,
      sessionId: a.sessionId,
      maxTokens: req.maxTokens,
      temperature: req.temperature,
    });

  const t0 = Date.now();
  const out = await runLectureTurn(
    {
      core: a.core,
      beatId: a.beatId,
      learner: a.learner,
      history,
      studentText: a.text,
      counters: { exchanges, attempt: a.opts.attempt ?? 0 },
      surrenderTokens: a.surrenderTokens,
      askedLine: a.askedLine || undefined,
      lastExchange: a.opts.lastExchange,
      retryLine: a.retryLine,
    },
    llm,
  );
  if (!out) throw new SessionError("not_found", "Adım bulunamadı");
  const latencyMs = Date.now() - t0;
  const plain = runsToPlain(out.reply);

  if (out.task?.repaired) {
    console.warn(`[turn] cevap sızıntısı yakalandı ve onarıldı (${a.sessionId}, ${a.beatId})`);
  }

  const phase = a.opts.phase ?? "lecture";
  await db.insert(transcriptTurns).values([
    { sessionId: a.sessionId, role: "user", text: a.text, phase },
    { sessionId: a.sessionId, role: "assistant", text: plain, runs: out.reply, phase, latencyMs },
  ]);
  // jsonb BİRLEŞTİRME — state'in diğer alanları (script, hitTurns…) ezilmez.
  const beatLog = appendToBeatLog(a.state?.beatLog, a.beatId, a.text, out.reply, out.task?.reAsk ?? false);
  await db
    .update(sessions)
    .set({ state: sql`coalesce(${sessions.state}, '{}'::jsonb) || ${JSON.stringify({ beatLog })}::jsonb` })
    .where(eq(sessions.id, a.sessionId));

  if (out.task) {
    return { text: plain, runs: out.reply, segmentDone: false, beatDone: out.task.beatDone, isAttempt: out.task.isAttempt };
  }
  return out.windowDone !== undefined
    ? { text: plain, runs: out.reply, segmentDone: false, windowDone: out.windowDone }
    : { text: plain, runs: out.reply, segmentDone: false };
}

/**
 * Araya girme turu — öğrenci hoca cevap beklemeyen bir şey söylerken söz aldı.
 * Bağlam sunucunun kendi transkriptinden (son lecture satırları; istemcinin
 * logladığı script satırları dahil); söz hiçbir görevin cevabı sayılmaz, beatLog'a
 * yazılmaz. Akış kararı yok: ders bu cevaptan sonra kaldığı yerden sürer.
 */
async function interjectionTurn(a: {
  userId: string;
  sessionId: string;
  text: string;
  core: LessonCore;
  beatId?: string;
  learner: Learner;
  interruptedText?: string;
}): Promise<{ text: string; runs: RichText; segmentDone: boolean }> {
  const rows = await db
    .select({ role: transcriptTurns.role, text: transcriptTurns.text, source: transcriptTurns.source })
    .from(transcriptTurns)
    .where(and(eq(transcriptTurns.sessionId, a.sessionId), eq(transcriptTurns.phase, "lecture")))
    .orderBy(desc(transcriptTurns.id))
    .limit(8);
  const recent = rows
    .reverse()
    .filter((r) => r.source !== "failed")
    .map((r) => ({ role: r.role === "user" ? ("student" as const) : ("tutor" as const), text: r.text }));

  const llm: TurnLlm = (req) =>
    completeJson({
      purpose: "chat",
      system: req.system,
      user: req.user,
      schema: req.schema,
      promptVersion: req.promptVersion,
      userId: a.userId,
      sessionId: a.sessionId,
      maxTokens: req.maxTokens,
      temperature: req.temperature,
    });

  const t0 = Date.now();
  const out = await runInterjectionTurn(
    {
      core: a.core,
      beatId: a.beatId ?? "",
      learner: a.learner,
      recent,
      studentText: a.text,
      interruptedText: a.interruptedText,
    },
    llm,
  );
  const plain = runsToPlain(out.reply);
  await db.insert(transcriptTurns).values([
    { sessionId: a.sessionId, role: "user", text: a.text, phase: "lecture" },
    { sessionId: a.sessionId, role: "assistant", text: plain, runs: out.reply, phase: "lecture", latencyMs: Date.now() - t0 },
  ]);
  return { text: plain, runs: out.reply, segmentDone: false };
}

type ChatTurnResult = {
  text: string;
  runs?: RichText;
  segmentDone: boolean;
  beatDone?: boolean;
  isAttempt?: boolean;
  windowDone?: boolean;
  /** Roleplay oturumlarında dolu — ders istemcisi bunları yok sayar (geriye uyumlu) */
  progress?: { done: number; total: number };
  newHits?: Array<{ objectiveId: string; evidence: string }>;
};

/**
 * Sohbet turu. Başarısız tur artık KAYDA GEÇER: eskiden sunucu öğrenci ve hoca
 * satırını yalnız LLM başarılı olunca yazıyordu; kredi biten, zaman aşımına düşen
 * her tur iz bırakmadan kayboluyor, "hoca cevap vermedi" anları admin'de görünmüyordu.
 * Öğrencinin sözü `source: "failed"` ile yazılır, hata yine fırlatılır (istemci
 * öğrenciye "alınamadı, tekrar dener misin" der). SessionError'lar (sahiplik,
 * kapalı oturum) iş kuralıdır — kaydedilmez.
 */
export async function chatTurn(userId: string, sessionId: string, text: string, opts: ChatOptions = {}): Promise<ChatTurnResult> {
  try {
    return await chatTurnInner(userId, sessionId, text, opts);
  } catch (err) {
    if (!(err instanceof SessionError)) {
      console.error(`[chat] tur cevaplanamadı (session ${sessionId}):`, err instanceof Error ? err.message : err);
      try {
        await db.insert(transcriptTurns).values({ sessionId, role: "user", text, phase: opts.phase ?? "lecture", source: "failed" });
      } catch {
        /* kayıt da düştüyse (DB) yapılacak bir şey yok — asıl hata yine istemciye gider */
      }
    }
    throw err;
  }
}

async function chatTurnInner(userId: string, sessionId: string, text: string, opts: ChatOptions): Promise<ChatTurnResult> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");
  if (owned.session.endedAt) throw new SessionError("session_ended", "Oturum kapatılmış");

  // ROLEPLAY DALI — burada ayrılır, ders yolu tek satır değişmez. İstemcinin
  // gönderdiği `phase` yok sayılır: oturum kendi türünü biliyor (session_kind).
  // Ölçüm, prompt ve bitirme davranışı roleplay modülünde; segmentDone ORADA
  // her zaman false (sözleşme md. 6 — sohbeti bitiren yalnız buton).
  if (owned.session.sessionKind === "roleplay") {
    if (!owned.roleplaySpec) {
      throw new SessionError("not_found", "Roleplay oturumunun pinli revizyonu okunamadı");
    }
    return roleplayTurn(userId, sessionId, text, owned.roleplaySpec);
  }

  const { core, scene, state } = owned;
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const script = state?.script ?? null;
  const nativeLanguage = nativeLanguageOf(profile);
  const tutorLanguage = state?.tutorLanguage ?? "native";
  const chrome = getChrome(tutorLanguage === "native" ? nativeLanguage : "en");
  const phase = opts.phase ?? "lecture";

  // LECTURE ADIMLARI — konuşma motoru (src/modules/session/turn). İstemciden gelen
  // beatId aktif çekirdekte doğrulanır; yanlış/bayat kimlik genel yola düşer.
  const activeBeat =
    phase === "lecture" && core ? core.lecture.beats.find((b) => b.id === opts.beatId) : undefined;
  const learner: Learner = {
    name: profile?.displayName ?? "Student",
    cefrLevel: profile?.cefrLevel ?? "A2",
    nativeLanguage,
    l1Name: languageName(nativeLanguage),
    tutorLanguage,
  };

  // ARAYA GİRME — öğrenci hoca cevap beklemeyen bir şey söylerken söz aldı. Hangi
  // adımda olunursa olunsun söz hiçbir görevin CEVABI sayılmaz (eskiden sonraki
  // görevin cevabı sanılıyordu); kısa cevap, ders kaldığı yerden sürer.
  if (opts.interjection && phase === "lecture" && core) {
    return await interjectionTurn({
      userId,
      sessionId,
      text,
      core,
      beatId: activeBeat?.id,
      learner,
      interruptedText: opts.interruptedText,
    });
  }

  if (core && activeBeat && (activeBeat.kind === "exercise" || activeBeat.kind === "open_response" || activeBeat.kind === "ask")) {
    return await lectureTurn({
      userId,
      sessionId,
      text,
      opts,
      core,
      beatId: activeBeat.id,
      state,
      learner,
      surrenderTokens: chrome.surrender,
      askedLine: runsToPlain(script?.beats[activeBeat.id]),
      retryLine: retryLineFor(activeBeat, chrome, tutorLanguage === "native" && chrome.language !== "en"),
    });
  }

  const memoryBlock =
    core && scene
      ? await sessionMemoryBlock(sessionId, userId, state, {
          topic: core.topic,
          focus: core.focus,
          theme: scene.scene,
        })
      : null;

  // BAĞLAM YALITIMI — faz dışı geçmiş modele GİTMEZ.
  // Lecture adımları kendi adım diyaloğunu görür (turn/ — beatLog). Fazlar arası
  // geçmiş göndermek modelin eski alıştırmalara dönmesine yol açıyordu (roleplay
  // ortasında "the correct choice is B" bug'ı).
  // Practice ve wrapup çok turlu olduğu için YALNIZCA kendi fazlarının turlarını görür
  // (kapanışta roleplay geçmişi sızarsa hoca karaktere geri dönüyor).
  const priorTurns =
    phase === "practice" || phase === "wrapup"
      ? await db
          .select()
          .from(transcriptTurns)
          .where(
            and(eq(transcriptTurns.sessionId, sessionId), eq(transcriptTurns.phase, phase)),
          )
          .orderBy(asc(transcriptTurns.id))
      : [];

  // BAŞARI ÖLÇÜTÜ — İKİ AŞAMALI, tıpkı alıştırma değerlendirmesi gibi.
  //
  // 1. Kesin eşleşme: bedava ve anlık (aşağıda).
  // 2. Anlamsal emniyet ağı: model bu turun cevabında hedefi görürse KANITLA bildirir
  //    (aynı çağrının şemasında, ek maliyet YOK). Kanıt öğrencinin sözünde gerçekten
  //    geçmiyorsa sayılmaz — uydurma kanıta karşı kod tarafı guard.
  //
  // Model bir turda "kullandı" derse o tur SONRAKİ turun kararında sayılır: sahnenin
  // kapanış cümlesi prompt'ta "artık topla" talimatını görmüş olmalı, yoksa ders
  // ortada kesiliyor. En fazla bir tur gecikme, karşılığında düzgün kapanış.
  const turnIndex = opts.turnIndex ?? 0;
  const priorHits = new Set(state?.practice?.hitTurns ?? []);
  const exactHitNow =
    phase === "practice" && core ? countTargetUses(core.practice.mustUse, [text]) > 0 : false;

  const decisionHits = new Set(priorHits);
  if (exactHitNow) decisionHits.add(turnIndex);

  // Hedef erken tutturulsa BİLE sahne PRACTICE_MIN_TURNS_BEFORE_GOAL turundan önce
  // kapanmaz: hedefi çabuk kullanmak konuşmayı kesmenin gerekçesi değil.
  const goalMet =
    phase === "practice" && core
      ? turnIndex + 1 >= PRACTICE_MIN_TURNS_BEFORE_GOAL &&
        decisionHits.size >= core.practice.minTargetUses
      : false;

  // AKIŞ KONTROLÜ MODELE EMANET EDİLMEZ — sahne yalnızca iki deterministik
  // nedenle biter: tur tavanı doldu ya da hedef yeterince üretildi (goalMet).
  // İkisi de çağrıdan ÖNCE belli → modele "bu cevapla sahne kapanıyor/sürüyor"
  // KESİN söylenir; söz ile akış ayrışamaz.
  const turnCap = core ? effectiveMaxTurns(core) : PRACTICE_MIN_MAX_TURNS;
  const reachedLimit = phase === "practice" && core ? turnIndex + 1 >= turnCap : false;
  const segmentDone = reachedLimit || goalMet;

  const llm: TurnLlm = (req) =>
    completeJson({
      purpose: "chat",
      system: req.system,
      user: req.user,
      schema: req.schema,
      promptVersion: req.promptVersion,
      userId,
      sessionId,
      maxTokens: req.maxTokens,
      temperature: req.temperature,
    });

  const t0 = Date.now();
  const verdict =
    core && scene && (phase === "practice" || phase === "wrapup")
      ? await runConversationTurn(
          {
            phase,
            core,
            scene,
            learner,
            occupation: profile?.occupation ?? null,
            interests: Array.isArray(profile?.interests) ? (profile.interests as string[]) : [],
            memoryBlock,
            history: priorTurns.map((t) => ({ role: t.role as "user" | "assistant", text: t.text })),
            studentText: text,
            turnIndex,
            turnCap,
            closesNow: segmentDone,
            goalMet,
          },
          llm,
        )
      : // Bayat/bilinmeyen adım kimliği ya da çekirdeksiz eski oturum — kısa güvenli cevap
        await llm({
          system: `You are Emma, a warm English teacher in the middle of a lesson. Reply to the student in 1-2 short sentences and keep them on the lesson. Never greet again. Reply as STRICT JSON {"reply":[{"lang":"en","text":"..."}]}.`,
          user: `STUDENT: ${text}`,
          schema: chatVerdictSchema,
          promptVersion: "fallback-chat.v1",
          maxTokens: 200,
          temperature: 0.4,
        });
  const latencyMs = Date.now() - t0;

  const runs = verdict.reply;
  const reply = runsToPlain(runs);

  // --- Anlamsal hedef sayımı: kanıt DOĞRULANIR -------------------------------
  // Model "kullandı" dediğinde alıntıladığı sözün öğrencinin turunda gerçekten
  // geçmesi gerekir. Bu guard iki şeyi birden keser: uydurma kanıtı ve modelin
  // KENDİ cümlesini öğrenciye mal etmesini (sahne boyunca hedefi hoca da söylüyor).
  if (phase === "practice" && core) {
    const said = normalizeUtterance(text);
    const quote = normalizeUtterance(verdict.evidence ?? "");
    const evidenceIsReal = quote.length >= 3 && said.includes(quote);
    const semanticHit = verdict.usedTarget === true && evidenceIsReal;

    if (exactHitNow || semanticHit) {
      const hits = new Set(priorHits);
      hits.add(turnIndex);
      if (hits.size !== priorHits.size) {
        // jsonb BİRLEŞTİRME — state'in diğer alanları ezilmez
        await db
          .update(sessions)
          .set({ state: sql`coalesce(${sessions.state}, '{}'::jsonb) || ${JSON.stringify({ practice: { hitTurns: [...hits] } })}::jsonb` })
          .where(eq(sessions.id, sessionId));
      }
    }
  }

  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: reply, runs, phase, latencyMs },
  ]);

  return { text: reply, runs, segmentDone };
}

// ---------------------------------------------------------------------------
// TTS — sağlayıcı gateway'i (modules/tts), v7: dil etiketli parçalar → klipler
// ---------------------------------------------------------------------------

export interface TtsClip {
  audioBase64: string;
  alignment: CharAlignment | null;
  /** Klibin sağlayıcı dil kodu; çok dilli tek klipte `"multi"` (istemci bu alanı okumaz) */
  lang: string;
}

/**
 * v7 girişi: dil etiketli parçalar. Sağlayıcı çok dilli tek klip üretebiliyorsa
 * (Azure SSML) TÜM parçalar TEK klip; değilse ardışık aynı-dil parçalar
 * birleştirilip dil başına klip (ElevenLabs/Inworld). İstemci klipleri sırayla
 * çalar ve `onEnd`'i son klipten sonra TAM BİR KEZ ateşler.
 *
 * Sağlayıcı ve ses/model `app_settings.tts`'ten gelir (admin panel); burada
 * sağlayıcı adı geçmez. Kapsam dışı ana dil: metin ekranda kalır, o parçalar
 * sessiz — yalnız İngilizce parçalar okunur.
 *
 * Eski `{text}` gövdesi tek İngilizce parça olarak kabul edilir (geçiş uyumu).
 */
export async function tts(
  userId: string,
  sessionId: string,
  runs: Array<{ lang: "en" | "l1"; text: string }>,
): Promise<{ clips: TtsClip[] }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  try {
    const active = await resolveActiveTts();

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    const native = nativeLanguageOf(profile);
    const enCode = await resolveLanguage(active, "en");
    const l1Code = await resolveLanguage(active, native);
    if (l1Code === null && runs.some((r) => r.lang === "l1")) {
      // TTS kapsamı dışı ana dil: metin ekranda kalır, ses atlanır
      console.warn(`[tts] "${native}" ${active.provider.name} kapsamı dışı — L1 parçaları sessiz bırakıldı`);
    }

    // Dili PARÇA ETİKETİNDEN okuyan tek-klip sağlayıcıda (Azure SSML) L1 düzyazının
    // içindeki İngilizce anmalar ("am, is veya are'ı") çekirdek sözlüğüyle kendi `en`
    // parçasına ayrılır → SSML'de doğru dil. Tam cümle okuyan sağlayıcıda (ElevenLabs)
    // gereksiz — dili bağlamdan kendisi çıkarır; dil-başına-klip yolunda da YAPILMAZ.
    const source =
      active.provider.synthesizeRuns && active.provider.languageTags
        ? refineRunsForInlineEnglish(runs, owned.core, getChrome(native))
        : runs;

    const coded: TtsRun[] = [];
    for (const run of source) {
      const code = run.lang === "en" ? enCode : l1Code;
      if (code) coded.push({ languageCode: code, text: run.text });
    }

    return { clips: await synthesizeRunsToClips(active, coded) };
  } catch (err) {
    // Gateway hatası → oturum hata sözlüğü (route 502'ye çevirir); diğerleri olduğu gibi
    if (err instanceof TtsError) throw new SessionError("tts_unavailable", err.message);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// STT — OpenAI gpt-4o-mini-transcribe
// ---------------------------------------------------------------------------

const EXT_BY_MIME: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/m4a": "mp4",
  "audio/x-m4a": "mp4",
  "audio/aac": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

/**
 * OpenAI formatı DOSYA ADINDAN çıkarır; yanlış uzantı = "corrupted or
 * unsupported". İstemci mimetype'ı güvenilmez: RN multipart'ı content-type'ı
 * düşürebiliyor (canlıda ölçüldü — mobil m4a "webm" sayılıp 502 attı). Sıra:
 * mime haritası → yüklenen dosya adının uzantısı → içerik imzası → webm.
 */
function audioExt(mimetype: string, filename: string | undefined, buffer: Buffer): string {
  const byMime = EXT_BY_MIME[mimetype.split(";")[0]!.trim().toLowerCase()];
  if (byMime) return byMime;
  const byName = /\.(webm|mp4|m4a|mp3|wav|ogg)$/i.exec(filename ?? "")?.[1]?.toLowerCase();
  if (byName) return byName === "m4a" ? "mp4" : byName;
  if (buffer.length > 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") return "mp4";
  if (buffer.subarray(0, 4).toString("ascii") === "OggS") return "ogg";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF") return "wav";
  if (buffer.length > 4 && buffer.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  return "webm";
}

export async function stt(
  userId: string,
  sessionId: string,
  buffer: Buffer,
  mimetype: string,
  filename?: string,
): Promise<{ text: string }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  const ext = audioExt(mimetype, filename, buffer);

  // Dil ipucu: kısa konuşmalarda otomatik algılama şaşabiliyor (Türkçe → Çince gibi).
  // Öğrencinin ana dili profilden gelir — hiçbir dile sabitlenmez.
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const l1 = languageName(nativeLanguageOf(profile));
  const prompt = `The speaker is learning English; their native language is ${l1}. They speak English, sometimes ${l1}.`;

  try {
    const result = await openaiClient.audio.transcriptions.create({
      file: await toFile(buffer, `speech.${ext}`, { type: mimetype }),
      model: "gpt-4o-mini-transcribe",
      prompt,
    });
    // Sessiz/kısa kayıtta model ipucunu geri okuyabiliyor — öğrenci sözü DEĞİL, boş say
    // (istemci "seni duyamadım" der; hoca uydurma söze cevap vermez).
    if (isPromptEcho(result.text, prompt)) {
      console.warn(`[stt] ipucu yankısı elendi (session ${sessionId}): ${result.text.slice(0, 80)}`);
      return { text: "" };
    }
    return { text: result.text };
  } catch (err) {
    throw new SessionError(
      "stt_failed",
      `STT hatası (mime=${mimetype}, ad=${filename ?? "-"}, ext=${ext}): ${String(err).slice(0, 200)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Çeviri — sohbet balonlarındaki 文A butonu
// ---------------------------------------------------------------------------

export async function translate(
  userId: string,
  sessionId: string,
  text: string,
): Promise<{ text: string }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const target = languageName(nativeLanguageOf(profile));

  const translated = await completeText({
    purpose: "chat",
    system: `Translate the user's English text into natural, everyday ${target}. Output ONLY the translation — no quotes, no explanation, no English.`,
    messages: [{ role: "user", content: text }],
    promptVersion: "translate.v1",
    userId,
    sessionId,
    maxTokens: 300,
    temperature: 0.2,
  });

  return { text: translated.trim() };
}

// ---------------------------------------------------------------------------
// Cevap incelemesi — ders ekranındaki `?` sheet'i
// ---------------------------------------------------------------------------

/**
 * Öğrencinin TEK bir sözünü genel İngilizce açısından inceler.
 *
 * AKIŞA DOKUNMAZ: `sessions.state` yazmaz, `transcript_turns`'e yazmaz, hiçbir
 * faz/beat sayacını kıpırdatmaz. İstek üzerine çalışan bir AYNADIR — ders içindeki
 * ölçüm (`beatDone`) yalnız ÖĞRETİLEN yapıyı sıkı ölçmeye devam eder.
 *
 * İskelet `translate()` ile aynı: sahiplik → profil → dil → tek çağrı.
 */
export async function reviewAnswer(
  userId: string,
  sessionId: string,
  text: string,
  context?: string,
): Promise<AnswerReview> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  // Katman 1 — istemci de aynı fonksiyonu çağırıyor; bu, ona GÜVENMEYEN ikinci kapı.
  const triaged = triageAnswer(text);
  if (triaged) return { kind: triaged, corrected: "", runs: [], pronunciation: null };

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const nativeLanguage = nativeLanguageOf(profile);
  // Oturum açılırken dondurulan mod tercih edilir; yoksa profil, o da yoksa native.
  const tutorLanguage = owned.state?.tutorLanguage ?? profile?.tutorLanguage ?? "native";
  const explainInNative = tutorLanguage === "native";

  const { system, user } = buildAnswerReviewPrompt({
    nativeLanguage,
    explainInNative,
    text,
    context,
  });

  const verdict = await completeJson({
    purpose: "answer_review",
    system,
    user,
    schema: answerReviewModelSchema,
    promptVersion: ANSWER_REVIEW_VERSION,
    userId,
    sessionId,
    // gpt-5 ailesinde tavan `max_completion_tokens`'a çevrilir ve düşünme
    // token'larını da kapsar — kısa tutulursa gövde boş dönebilir.
    maxTokens: 800,
  });

  const corrected = verdict.corrected.trim();
  const explanation = verdict.explanation.trim();

  // DİL ETİKETİNİ SUNUCU KOYAR — modele bırakılsaydı İngilizce metin `l1`
  // etiketiyle gelip TTS tarafından ana dil sesiyle okunabilirdi.
  const runs: RichText = explanation
    ? [{ lang: explainInNative ? "l1" : "en", text: explanation }]
    : [];

  return {
    // `correct` hükmünde düzeltme gösterilmez: model yine de bir cümle
    // yazdıysa ekranda "düzeltildim" izlenimi bırakmasın diye kodda kesilir.
    kind: verdict.kind,
    corrected: verdict.kind === "correct" ? "" : corrected,
    runs,
    pronunciation: null,
  };
}

// ---------------------------------------------------------------------------
// Oturum bitirme (idempotent)
// ---------------------------------------------------------------------------

export async function endSession(
  userId: string,
  sessionId: string,
  /**
   * abandoned = "Baştan başla" / yarıda bırakma: oturum kapanır, hafıza çıkarımı
   * yine koşar ama ders TAMAMLANMIŞ SAYILMAZ (lesson_progress'e dokunulmaz).
   * Varsayılan completed — mevcut "Dersi Bitir" davranışı birebir korunur.
   */
  outcome: "completed" | "abandoned" = "completed",
): Promise<{ ok: true; turns: number; debrief?: RoleplayDebrief | null }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  const firstClose = !owned.session.endedAt;

  if (firstClose) {
    await db.update(sessions).set({ endedAt: new Date() }).where(eq(sessions.id, sessionId));

    // İlerleme MÜFREDAT YUVASI üzerinden işaretlenir, oynatılan içerik sürümünden
    // değil: içerik yeniden üretilse de "bu dersi bitirdim" bilgisi ayakta kalır.
    if (owned.session.catalogLessonId && outcome === "completed") {
      await db
        .update(lessonProgress)
        .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.catalogLessonId, owned.session.catalogLessonId),
          ),
        );
    }
  }

  const turns = await db
    .select({ id: transcriptTurns.id })
    .from(transcriptTurns)
    .where(eq(transcriptTurns.sessionId, sessionId));

  // Hafıza çıkarımı yanıtı BEKLETMEZ; hata dersi bitirmeyi bozmaz.
  // (Kuyruk yok — tek süreç. Süreç bu arada yeniden başlarsa o oturumun
  //  çıkarımı kaybolur; kabul edilmiş MVP ödünü, pg-boss sonraki fazda.)
  if (firstClose) {
    void extractSessionMemory(sessionId)
      .then((r) => {
        console.log(
          `[memory] ${sessionId}: ${r.status}, +${r.factsAdded} gerçek, ${r.factsSkippedAsDuplicate} tekrar atlandı`,
        );
      })
      .catch((err) => console.error(`[memory] çıkarım başarısız (${sessionId}):`, err));
  }

  // ROLEPLAY DEBRIEF: hedef özeti deterministik (deneme satırından, bedava);
  // koçluk tek LLM çağrısı ve düşerse özet yine döner — "Bitir" asla bloke olmaz.
  // Ders oturumunda alan hiç yok; ders istemcisi değişmeden çalışır.
  if (owned.session.sessionKind === "roleplay" && owned.roleplaySpec) {
    const debrief = await roleplayDebrief(userId, sessionId, owned.roleplaySpec);
    return { ok: true, turns: turns.length, debrief };
  }

  return { ok: true, turns: turns.length };
}
