import {
  answerReviewModelSchema,
  decideInWrapup,
  isSurrender,
  normalizeUtterance,
  PRACTICE_MIN_MAX_TURNS,
  PRACTICE_MIN_TURNS_BEFORE_GOAL,
  roleplaySpecSchema,
  spokenRunsSchema,
  triageAnswer,
  type AnswerReview,
  type CoreBeat,
  type LessonContentV7,
  type LessonCore,
  type LessonPhase,
  type RichText,
  type RoleplaySpec,
  type SceneVariant,
  type SessionScript,
  type Track,
} from "@arna/contracts";
import { and, asc, eq, sql } from "drizzle-orm";
import { toFile } from "openai";
import { z } from "zod";
import { db } from "../../db/client.js";
import { env } from "../../config/env.js";
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
import { ANSWER_REVIEW_VERSION, buildAnswerReviewPrompt } from "../llm/prompts/answer-review.v1.js";
import { openaiClient } from "../llm/openai.js";
import { resolveLesson, LayerError } from "../lesson/layers.js";
import { buildTutorPrompt } from "../lesson/tutorPrompt.js";
import { extractSessionMemory } from "../memory/extract.js";
import { buildMemoryBlock } from "../memory/retrieve.js";
import { renderSessionScript } from "./script.js";
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

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      catalogLessonId,
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
  /**
   * Soru penceresinin İZİN VERİLEN SON turu. İstemci sayaçtan hesaplar; hoca
   * bu turda "başka sorun var mı?" DEMEZ, kapanış yapar. Yoksa Emma soru sorarken
   * akış ilerliyor ve ders kendiyle çelişiyor (canlı görülen hata).
   */
  lastExchange?: boolean;
}

/** Anlatılanların özeti — cevaplar bununla çelişemez (form + iddialar). */
function taughtLines(core: LessonCore): string {
  return core.lecture.beats
    .filter((b) => b.kind === "teach")
    .flatMap((b) => (b.kind === "teach" ? b.points : []))
    .map((p) => `  - ${p.formEn}: ${p.claimsEn.join(" · ")}`)
    .join("\n");
}

/** O anki beat/faz için hocaya verilen kesin davranış kuralı. */
function momentContext(
  core: LessonCore,
  scene: SceneVariant,
  opts: ChatOptions,
  script: SessionScript | null,
  goalMet = false,
): string {
  // Davranış kuralı — bitiş KARARI değil. Kararı sunucu sayaçla verir.
  const closingRule = `Finish with ONE short closing sentence and ask NO new question.`;

  // KAPANIŞ — ders bitti, hoca rol karakterinden çıktı. Ders buradan SAYAÇLA
  // bitmez; yalnızca öğrenci "Dersi Bitir"e basınca biter.
  if (opts.phase === "wrapup") {
    return [
      `THE LESSON IS OVER. You are Emma the teacher again — you are NOT ${scene.persona.name} or any role-play character. Never speak in character here.`,
      `The student may ask anything about today's lesson (${core.focus}).`,
      `WHAT YOU TAUGHT TODAY (your answer must agree with this, never contradict it):`,
      taughtLines(core),
      `LANGUAGE OF THIS MOMENT: your normal language policy applies (explain in the student's language in native mode). English examples stay English, as their own "en" runs.`,
      `Answer their question in 1-3 short sentences, with ONE concrete example if it helps.`,
      `Then ask whether there is anything else they would like to ask.`,
      `HARD RULES:`,
      `- NEVER start a new exercise, activity or role play. The lesson is finished.`,
      `- Do NOT re-teach the whole topic; answer only what was asked.`,
      `- If they ask about something unrelated, answer in one clause and gently bring it back to today's lesson.`,
      `- Never tell them to press a button or mention the app's interface.`,
    ].join("\n");
  }

  if (opts.phase === "practice") {
    const p = core.practice;
    const turnIndex = opts.turnIndex ?? 0;
    // Tavan koddaki tabanla birlikte hesaplanır; prompt'a da AYNI sayı gitmeli,
    // yoksa hoca "son tur" sanıp erken kapatır.
    const turnCap = effectiveMaxTurns(core);
    const isLast = turnIndex + 1 >= turnCap;
    return [
      `ROLE PLAY. You are NOT the teacher right now — you are a character in a scene.`,
      `You are ${scene.persona.name} (${scene.persona.role}${scene.persona.mood ? ", " + scene.persona.mood : ""}).`,
      `What you want out of this conversation: ${scene.persona.goal}`,
      `Scene: ${scene.scene}`,
      `The student's goal: ${scene.objective}`,
      `A successful scene looks like: ${p.successCriteria}`,
      `You opened the scene with: "${scene.avatarOpening}"`,
      `LANGUAGE OF THIS MOMENT: ENGLISH ONLY — the role play IS the practice. All runs are "en", whatever the tutor-language mode is.`,
      `NEVER refer to exercises, multiple-choice options, "the correct answer", or anything from the earlier lecture — that part of the lesson is over. Stay inside the scene at all times.`,
      `If the student says something short, off-topic or unhelpful, react naturally AS THE CHARACTER (surprised, curious, mildly persistent) and keep the scene going.`,
      `Keep replies short and natural. Gently create openings for the student to use: ${p.mustUse.join(", ")}.`,
      `This is exchange ${turnIndex + 1} of ${turnCap}.`,
      ``,
      `ALSO REPORT, in the same JSON: did the STUDENT'S LAST MESSAGE use today's target?`,
      `- "usedTarget": true only if THEIR last message used ${p.mustUse.join(" / ")} or expressed`,
      `  the same structure in their own words. Their own wording counts; a different topic does not.`,
      `- "evidence": copy their exact words that show it, word for word from THEIR message.`,
      `  If nothing shows it, use "" and set usedTarget to false.`,
      `NEVER count your own lines, and never invent evidence — a quote that is not in their`,
      `message is discarded and the turn scores nothing. When unsure, answer false.`,
      isLast
        ? `This is the LAST exchange — wrap the scene up warmly and praise their use of today's target. ${closingRule}`
        : goalMet
          ? `The student has now used today's target enough times — they succeeded. Wrap the scene up warmly and praise them. ${closingRule}`
          : `If the student has achieved their goal, wrap the scene up. ${closingRule} Otherwise continue the scene with one short reply.`,
    ].join("\n");
  }

  const beat = core.lecture.beats.find((b) => b.id === opts.beatId);

  // Not: `exercise` beat'i buraya DÜŞMEZ — yapısal değerlendirmeye (judgeExercise)
  // yönlendirilir, çünkü "bu bir cevap denemesi miydi?" kararı gerekiyor.

  if (beat?.kind === "ask") {
    // Soru metni içerikte DEĞİL, oturum script'inde — bu öğrenci için üretilmişti
    const asked = runsToPlain(script?.beats[beat.id]);
    const opener = asked
      ? `You asked the student: "${asked}" — they just replied.`
      : `You just asked the student a short question and they replied.`;

    // "Sorum var mı?" penceresi GERÇEK bir soru-cevap anıdır: burada öğrenciye
    // örnekle açıklama yapılır. (readiness'in katı "sadece onayla" kuralı buraya
    // uygulanınca hoca soruyu geçiştiriyordu.)
    if (beat.purpose === "questions") {
      // Anlatılan iddialar bağlama GİRER: yoksa model dersin kuralıyla çelişen
      // cevaplar verebiliyor ("put 'always' before 'be'" gibi — tam tersi).
      return [
        opener,
        `THIS IS THE STUDENT'S QUESTION WINDOW — they are allowed to ask about today's target (${core.focus}).`,
        `WHAT YOU JUST TAUGHT THEM (your answer must agree with this, never contradict it):`,
        taughtLines(core),
        `LANGUAGE OF THIS MOMENT: your normal language policy applies — in native mode explain in the student's language ("l1" runs) EVEN IF they wrote in English; example sentences stay English as their own "en" runs.`,
        // Örnek şartı KOŞULLU: canlıda "yok, yeterli" diyen öğrenciye bile örnek
        // cümle dayatılıyordu ("alıştırmalara geçelim" derken örnek verdi).
        `If they ASKED something: answer it clearly in 1-3 short sentences AND give ONE concrete example sentence that uses the target.`,
        `If they said they are done / have no more questions: reply with a few warm words ONLY — no example, no new explanation.`,
        opts.lastExchange
          ? `This is the LAST question you can take. After answering, say warmly that you will move on to some practice questions now. Do NOT ask whether they have another question — the lesson continues right after you.`
          : `If you answered a question, end by asking whether they have another one. If they said they are done, end with the same short check ("anything else?") in their language — nothing more.`,
        `HARD RULES:`,
        `- If they said they have a question but did not say what it is yet, just invite them to ask it and stop. Do NOT guess what they want to know.`,
        `- NEVER start an exercise, activity or task — the lesson does that next by itself.`,
        `- Do NOT re-teach the whole topic; answer only what was asked.`,
        `- Stay on ${core.focus}. If they ask about something else, answer in one clause and steer back.`,
      ].join("\n");
    }

    return [
      opener,
      `YOUR ONLY JOB HERE IS TO ACKNOWLEDGE. A scripted teaching message runs IMMEDIATELY after your reply.`,
      // Canlı hata: öğrenci "yes" yazınca model İngilizce'ye kaydı — dil kuralı
      // her moment bağlamında AÇIKÇA tekrarlanır (wrapup/practice'te zaten vardı).
      `LANGUAGE OF THIS MOMENT: your normal language policy applies — in native mode reply in the student's language ("l1" runs), EVEN IF they replied in English.`,
      `HARD RULES:`,
      `- NEVER ask a question of any kind.`,
      `- NEVER start an exercise, activity or task ("What did you do yesterday?", "Try a sentence" — forbidden).`,
      `- NEVER begin explaining or teaching the topic — the script does that next.`,
      `- Maximum TWO short sentences.`,
      `If the student asked a genuine question about the lesson, answer just that question plainly, then stop.`,
      `If they simply agreed or said they have no questions, reply with at most a few warm words.`,
    ].join("\n");
  }

  return `The student said something during the lesson. Reply in one short sentence and stay on ${core.focus}.`;
}

/**
 * "Öğrencinin sözü bir CEVAP DENEMESİ miydi?" — akış kararının girdisi.
 *
 * Selamlama, konu dışı laf, "tekrar eder misin" gibi girdiler yanlış cevap DEĞİLDİR
 * ve deneme hakkı yakmamalıdır. Canlıda "Hey!" + konu dışı bir cümle iki denemeyi de
 * yakıp soruyu atlatmıştı. Karar yapısaldır (şemayla doğrulanmış boolean), düzyazıdan
 * çıkarılmaz.
 */
const attemptRule = [
  `First decide: did the student TRY TO ANSWER, or were they talking about something else?`,
  `- isAttempt=true — anything aimed at the question, however bad. A right answer, a wrong answer,`,
  `  a single letter, a guess, a half sentence, GIBBERISH or random letters typed into the answer`,
  `  box ("erf", "kloi", "asdf"), or GIVING UP. "I don't know", "no idea", "bilmiyorum", "pass",`,
  `  "skip" are ATTEMPTS — surrendering is an answer and the student deserves to be told the`,
  `  answer once their tries run out. Nonsense is still an ANSWER, just a poor one; it is not a`,
  `  change of subject. (Whether it is RIGHT is a separate decision, made below.)`,
  `- isAttempt=false — ONLY when they clearly engaged with something else instead of the question:`,
  `  a greeting ("hey", "hello"), small talk, a remark about another topic, or asking you to`,
  `  repeat or explain. If in doubt, choose true.`,
  `Your words must match your flag: if you set isAttempt=false, do NOT say they tried to answer.`,
  `When isAttempt=false: acknowledge in at most one short clause, correct nothing, NEVER say which`,
  `answer is correct, and ASK THE QUESTION AGAIN. Stay on the lesson.`,
].join("\n");

/**
 * Yanıt PARÇALARI: native modda geri bildirim L1, düzeltilen İngilizce cümle
 * ayrı "en" parçası. Akış kararları bu metne yine BAKMAZ.
 *
 * `spokenRunsSchema` süslü parantezli metni reddeder: selamlamada modelin yapıyı
 * metnin içine yazdığı canlı hata (73 oturumun 24'ü) buradan da geçebilirdi.
 * Ölçümde bu üç uçta sızıntı çıkmadı ama sınıf aynı, koruma da aynı.
 */
const replyRunsSchema = spokenRunsSchema.max(6);

/**
 * Alıştırma değerlendirmesi — deneme miydi + ASLINDA doğru muydu + hocanın yanıtı.
 *
 * `ok`: LLM emniyet ağı. Deterministik eşleyicinin ıskaladığı cevap yine de doğru
 * olabilir (yazım sürçmesi "schoool", kabul listesinde unutulan geçerli varyant,
 * MCQ'da "the first one"). Karar yapısal boolean'dır; ilerleme kodda verilir.
 */
const exerciseVerdictSchema = z.object({
  isAttempt: z.boolean(),
  ok: z.boolean(),
  reply: replyRunsSchema,
});

/**
 * Sohbet turu. `usedTarget`/`evidence` YALNIZCA rol yapmada istenir (prompt orada
 * sorar); diğer fazlarda model bunları atlar, bu yüzden opsiyoneller.
 */
const chatVerdictSchema = z.object({
  reply: replyRunsSchema,
  usedTarget: z.boolean().optional(),
  /** Öğrencinin BİREBİR sözünden alıntı — kod bunu doğrular, uydurma kanıt sayılmaz */
  evidence: z.string().optional(),
});

/** Açık uçlu cevabın rubrik değerlendirmesi — kabul/ret + kısa geri bildirim. */
const openResponseVerdictSchema = z.object({
  isAttempt: z.boolean(),
  ok: z.boolean(),
  feedback: replyRunsSchema,
});

/** Modelin dil kuralı — judge prompt'larına ortak eklenen blok. */
function judgeLanguageRule(tutorLanguage: "native" | "english", l1Name: string): string {
  return tutorLanguage === "native"
    ? `LANGUAGE: give feedback in warm, natural ${l1Name} ("l1" runs). The correct/model ENGLISH sentence goes in its OWN "en" run. Never say "you are wrong".`
    : `LANGUAGE: simple spoken English only — all runs use "en".`;
}

/**
 * Deterministik eşleyicinin TUTTURAMADIĞI alıştırma girdisini değerlendirir.
 * Birebir eşleşen doğrular buraya HİÇ gelmez — istemci onları LLM'siz kutlar.
 * Buraya düşen cevap yine de doğru olabilir (yazım sürçmesi, listede olmayan
 * geçerli varyant) — judge yapısal `ok` ile karar verir, akış kodda ilerler.
 */
async function judgeExercise(
  userId: string,
  sessionId: string,
  text: string,
  beat: Extract<CoreBeat, { kind: "exercise" }>,
  ctx: JudgeContext,
  opts: ChatOptions,
  phase: LessonPhase,
): Promise<{ text: string; runs: RichText; segmentDone: boolean; beatDone: boolean; isAttempt: boolean }> {
  const attempt = opts.attempt ?? 0;
  const accepted =
    beat.answerSpec.kind === "choice"
      ? [beat.options?.[beat.answerSpec.correctIndex] ?? beat.exampleAnswer]
      : beat.answerSpec.accepted;
  const surrendered = isSurrender(text, ctx.surrenderTokens);

  const t0 = Date.now();
  const verdict = await completeJson({
    purpose: "chat",
    system: [
      `You are Emma, a warm English teacher. The student is answering a practice question.`,
      `The question item: "${beat.item}"`,
      // Şıklar HARFLİ verilir ve doğru şıkkın harfi AÇIKÇA söylenir: canlıda model
      // harfi kendi eşleştirmeye çalışıp yanlış şıkkı "doğru" diye ilan etti.
      ...(beat.options?.length
        ? [
            `Options: ${beat.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("  ")}`,
            beat.answerSpec.kind === "choice"
              ? `The correct option is ${String.fromCharCode(65 + beat.answerSpec.correctIndex)}. Never call any other letter correct.`
              : "",
          ]
        : []),
      `Example answer(s) the author wrote down: ${accepted.join(" / ")}`,
      `Today's target: ${ctx.core.focus}`,
      `What the lesson is measuring: ${ctx.core.tutorNotes.target}`,
      ``,
      judgeLanguageRule(ctx.tutorLanguage, ctx.l1Name),
      ``,
      attemptRule,
      // Pes etme deterministik biliniyor — modele SÖYLENİR, yoksa "konu dışı" sanıp
      // "lütfen cevaplamayı dene" diyor ve öğrenci doğru cevabı hiç duymuyor.
      surrendered
        ? `IMPORTANT: the student has GIVEN UP on this question. That IS an attempt — isAttempt=true, ok=false.`
        : "",
      // Tavana gelindiğinde "konu dışı girdiye cevabı söyleme" kuralı geçersizdir:
      // beat kapanıyor, öğrenci cevabı öğrenmeden gitmemeli.
      opts.lastExchange
        ? `THIS BEAT IS ENDING after your reply, whatever they wrote. Even if isAttempt=false, give them the correct answer once, warmly, and do not ask again.`
        : "",
      ``,
      `If it IS an attempt, decide "ok" in TWO STEPS.`,
      ``,
      `STEP 1 — repair obvious typing slips before you judge anything. If the letters are one or`,
      `two characters away from a word that would fit, it is a typing slip: "Doo" is "Do",`,
      `"schoool" is "school", "teh" is "the". Casing, punctuation and contractions are noise too.`,
      `Judge the REPAIRED answer; you may still show the correct spelling kindly.`,
      `Letters that resemble no fitting word at all ("erf", "kloi", "asdf") are NOT slips — repair`,
      `nothing and judge them as the wrong answer they are.`,
      ``,
      `STEP 2 — judge the repaired answer against WHAT THIS LESSON TEACHES, not against the list.`,
      `The example answers above are what one author happened to write down; many blanks take`,
      `several different words.`,
      `ok=true when the answer fits the sentence naturally and uses the target correctly, even`,
      `  with a different word than the examples ("draw" where the list says "write").`,
      `ok=false when the answer breaks the taught target (wrong tense, form or agreement, such as`,
      `  "studies" after I where the lesson teaches the plain verb), when it does not fit the`,
      `  sentence, or when the exercise is about ONE specific expression and they used another.`,
      `For multiple-choice, naming the correct option in other words ("the first one") is ok=true.`,
      ``,
      `If ok=true: praise in ONE short sentence. If they misspelled, you may gently show the`,
      `correct written form in its own "en" run. Do NOT ask the question again.`,
      `If ok=false:`,
      // CANLI HATA: öğrenci üç kez anlamsız cevap yazdı, model üçünü de "deneme değil"
      // saydı, tur tavanı dolunca ders doğru cevabı HİÇ söylemeden geçti. Beat'ten
      // çıkarken cevap her hâlükârda verilir — bayrağı istemci hesaplar.
      opts.lastExchange || attempt >= 1
        ? `This is the LAST time you can respond on this question. Kindly GIVE the correct answer in a full ENGLISH sentence (its own "en" run), whatever they wrote, and add one word of encouragement. Do NOT ask the question again.`
        : `Reply in 1-2 short sentences: encourage, remind them of today's target, then ASK THE SAME QUESTION again. Do NOT reveal the answer yet. Do not repeat your previous wording word for word — say it a different way.`,
      ``,
      `Reply with STRICT JSON: {"isAttempt": <true|false>, "ok": <true|false>, "reply": [{"lang":"l1"|"en","text":"..."}]}`,
      `Plain speech only: no markdown, no emojis, no stage directions.`,
    ]
      .filter(Boolean)
      .join("\n"),
    user: `The student said: "${text}"`,
    schema: exerciseVerdictSchema,
    promptVersion: "exercise-check.v4",
    userId,
    sessionId,
    maxTokens: 250,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - t0;

  const plain = runsToPlain(verdict.reply);
  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: plain, phase, latencyMs },
  ]);

  // "Bilmiyorum" modelin insafına bırakılmaz — pes etmek de bir cevaptır.
  // `ok` guard'ı kodda: deneme değilse ya da pes ettiyse doğru SAYILAMAZ,
  // prompt ne derse desin (prompta güvenilmez, karar yapısal kalır).
  return {
    text: plain,
    runs: verdict.reply,
    segmentDone: false,
    beatDone: verdict.ok && verdict.isAttempt && !surrendered,
    isAttempt: verdict.isAttempt || surrendered,
  };
}

/**
 * "Say the whole sentence" türü adımlar: doğru cevap tek bir dize değildir, o yüzden
 * modelden YAPILANDIRILMIŞ bir karar alınır. İlerleme kararı yine kodda: `ok` ya da
 * deneme hakkı bitti → beatDone. Model akışı yönetmez, yalnızca değerlendirir.
 */
async function judgeOpenResponse(
  userId: string,
  sessionId: string,
  text: string,
  beat: Extract<CoreBeat, { kind: "open_response" }>,
  ctx: JudgeContext,
  opts: ChatOptions,
  phase: LessonPhase,
): Promise<{ text: string; runs: RichText; segmentDone: boolean; beatDone: boolean; isAttempt: boolean }> {
  const attempt = opts.attempt ?? 0;
  const isLastAttempt = attempt + 1 >= beat.maxAttempts;
  const surrendered = isSurrender(text, ctx.surrenderTokens);

  const t0 = Date.now();
  const verdict = await completeJson({
    purpose: "chat",
    system: [
      `You are Emma, a warm English teacher marking one spoken answer.`,
      `Task the student was given: "${beat.question}"`,
      `What the lesson is measuring: ${ctx.core.tutorNotes.target}`,
      `Example phrases that show the target: ${beat.rubric.mustUse.join(" / ")}`,
      `Accept the answer when: ${beat.rubric.criteria}`,
      ``,
      judgeLanguageRule(ctx.tutorLanguage, ctx.l1Name),
      ``,
      // CANLI HATA: bu satır "They must use: she works / he lives" diyordu ve model
      // BİREBİR arıyordu. "my brother has a lot of work at home" 3. tekil -s'in ta
      // kendisiydi, reddedildi; üstüne "'He works' demelisin" diye yanlış düzeltme
      // verildi. Alıştırma judge'ında düzeltilen "kabul listesi = beyaz liste"
      // hatasının aynısı.
      `THE EXAMPLE PHRASES ARE EXAMPLES, NOT A CHECKLIST. The student does not have to`,
      `repeat them. Judge whether their answer USES THE TARGET the lesson measures — with`,
      `their own subject, verb and content. "My brother has a lot of work" shows third`,
      `person -s just as well as "she works" does.`,
      `Judge MEANING and STRUCTURE, not perfection. Accept it if they used the target`,
      `correctly, even with small slips elsewhere (a wrong plural, a missing article) —`,
      `you may mention such a slip kindly in your feedback, but it does NOT make ok false.`,
      `Reject only when the target structure is absent or actually used wrongly.`,
      ``,
      // Pes etme deterministik biliniyor; o durumda modele SORULMAZ, tek yönerge verilir.
      // Yığılmış koşullu talimatlar çelişiyordu: model "konu dışı" dalını seçip görevi
      // yeniden soruyor, öğrenci hakları bitmesine rağmen örnek cevabı hiç duymuyordu.
      ...(surrendered
        ? [
            `The student has GIVEN UP on this task. Set isAttempt=true and ok=false.`,
            isLastAttempt
              ? `This was their LAST try: warmly GIVE THEM a model answer as a full ENGLISH sentence (own "en" run). Do NOT ask the task again.`
              : `Encourage them in one clause, then ASK THEM TO TRY AGAIN.`,
          ]
        : [
            attemptRule,
            ``,
            `If isAttempt is false, ok MUST be false and the feedback just re-asks the task.`,
            isLastAttempt
              ? `If it IS an attempt and ok is false, this was their LAST try: warmly GIVE THEM a model answer as a full ENGLISH sentence (own "en" run). Do NOT ask the task again.`
              : `If it IS an attempt and ok is false, name what is missing in one clause and ASK THEM TO TRY AGAIN. Do not reveal a full model answer yet.`,
          ]),
      ``,
      `Reply with STRICT JSON: {"isAttempt": <true|false>, "ok": <true|false>, "feedback": [{"lang":"l1"|"en","text":"..."}]}`,
      `If ok is true, praise briefly and do not ask anything.`,
      `Plain speech only: no markdown, no emojis, no quotation marks around the feedback.`,
    ]
      .filter(Boolean)
      .join("\n"),
    user: `The student said: "${text}"`,
    schema: openResponseVerdictSchema,
    promptVersion: "open-response.v3",
    userId,
    sessionId,
    maxTokens: 250,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - t0;

  const plain = runsToPlain(verdict.feedback);
  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: plain, phase, latencyMs },
  ]);

  const isAttempt = verdict.isAttempt || surrendered;
  return {
    text: plain,
    runs: verdict.feedback,
    segmentDone: false,
    // İlerleme KODDA: kabul edildi ya da hak bitti. Cevap denemesi değilse
    // (selamlama, konu dışı) hak YANMAZ — adım kapanmaz, soru yeniden sorulur.
    beatDone: isAttempt ? verdict.ok || isLastAttempt : false,
    isAttempt,
  };
}

/** Judge'lara giden oturum bağlamı — dil politikası + pes kümesi. */
interface JudgeContext {
  core: LessonCore;
  tutorLanguage: "native" | "english";
  l1Name: string;
  surrenderTokens: readonly string[];
}

export async function chatTurn(
  userId: string,
  sessionId: string,
  text: string,
  opts: ChatOptions = {},
): Promise<{
  text: string;
  runs?: RichText;
  segmentDone: boolean;
  beatDone?: boolean;
  isAttempt?: boolean;
  /** Roleplay oturumlarında dolu — ders istemcisi bunları yok sayar (geriye uyumlu) */
  progress?: { done: number; total: number };
  newHits?: Array<{ objectiveId: string; evidence: string }>;
}> {
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
  const judgeCtx: JudgeContext | null = core
    ? {
        core,
        tutorLanguage,
        l1Name: languageName(nativeLanguage),
        surrenderTokens: chrome.surrender,
      }
    : null;

  const memoryBlock =
    core && scene
      ? await sessionMemoryBlock(sessionId, userId, state, {
          topic: core.topic,
          focus: core.focus,
          theme: scene.scene,
        })
      : null;

  const phase = opts.phase ?? "lecture";

  // Minimal oturum koruması: istemciden gelen beatId aktif çekirdekte doğrulanır
  // (yanlış/bayat kimlik sessizce genel sohbet dalına düşer, akış kilitlenmez).
  // YAPISAL DEĞERLENDİRME GEREKEN BEAT'LER — düz metin yerine şemayla doğrulanmış
  // karar döner (isAttempt / ok), böylece ilerleme kararı KODDA kalır.
  const activeBeat =
    phase === "lecture" && core ? core.lecture.beats.find((b) => b.id === opts.beatId) : undefined;

  if (judgeCtx && activeBeat?.kind === "open_response") {
    return await judgeOpenResponse(userId, sessionId, text, activeBeat, judgeCtx, opts, phase);
  }
  // Alıştırmaya gelen girdi ya yanlış cevaptır ya da cevap bile değildir
  // (doğru cevaplar istemcide eşleşir, buraya hiç gelmez).
  if (judgeCtx && activeBeat?.kind === "exercise") {
    return await judgeExercise(userId, sessionId, text, activeBeat, judgeCtx, opts, phase);
  }

  // BAĞLAM YALITIMI — faz dışı geçmiş modele GİTMEZ.
  // Lecture beat'lerinde (ask/exercise) gereken her şey momentContext'te: soru,
  // beklenen cevap, deneme sayısı. Geçmiş göndermek modelin eski alıştırmalara
  // dönmesine yol açıyordu (roleplay ortasında "the correct choice is B" bug'ı).
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

  const system =
    core && scene
      ? buildTutorPrompt({
          displayName: profile?.displayName ?? "Student",
          cefrLevel: profile?.cefrLevel ?? "A2",
          nativeLanguage,
          tutorLanguage,
          occupation: profile?.occupation ?? null,
          interests: Array.isArray(profile?.interests) ? (profile.interests as string[]) : [],
          core,
          scene,
          activeContext: momentContext(core, scene, opts, script, goalMet),
          memoryBlock,
        })
      : `You are Emma, a warm English teacher. Reply as STRICT JSON {"reply":[{"lang":"en","text":"..."}]} with 1-3 simple sentences.`;

  const messages = [
    ...priorTurns.slice(-20).map((t) => ({
      role: t.role as "user" | "assistant",
      content: t.text,
    })),
    { role: "user" as const, content: text },
  ];

  const t0 = Date.now();
  const verdict = await completeJson({
    purpose: "chat",
    system,
    user: messages.map((m) => `${m.role === "user" ? "STUDENT" : "YOU"}: ${m.content}`).join("\n"),
    schema: chatVerdictSchema,
    promptVersion: "tutor-chat.v4",
    userId,
    sessionId,
    maxTokens: 260,
    temperature: 0.6,
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
        await db
          .update(sessions)
          .set({ state: { ...(state ?? {}), practice: { hitTurns: [...hits] } } })
          .where(eq(sessions.id, sessionId));
      }
    }
  }

  // AKIŞ KONTROLÜ MODELE EMANET EDİLMEZ — yanıtın METNİNE hiç bakılmaz.
  // Sahne yalnızca iki deterministik nedenle biter: tur tavanı doldu ya da
  // öğrenci hedef yapıyı yeterince kez üretti (goalMet, sayılarak hesaplanır).
  const reachedLimit =
    opts.phase === "practice" && core
      ? (opts.turnIndex ?? 0) + 1 >= effectiveMaxTurns(core)
      : false;
  const segmentDone = reachedLimit || goalMet;

  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: reply, phase, latencyMs },
  ]);

  return { text: reply, runs, segmentDone };
}

// ---------------------------------------------------------------------------
// TTS — ElevenLabs with-timestamps proxy, v7: dil etiketli parçalar → klipler
// ---------------------------------------------------------------------------

/**
 * ElevenLabs flash v2.5 ISO-639-1 kapsaması (~32 dil). Kapsam dışı bir ana dil
 * gelirse `null` döner: çağıran L1 parçalarını SESSİZ bırakır (metin ekranda),
 * yalnız İngilizce parçaları okur — anlaşılmaz telaffuz üretmekten iyidir.
 */
const TTS_LANG: Record<string, string> = {
  en: "en", tr: "tr", ar: "ar", "zh-hans": "zh", "zh-hant": "zh", es: "es", de: "de",
  fr: "fr", it: "it", "pt-br": "pt", "pt-pt": "pt", pl: "pl", hi: "hi", ja: "ja",
  ko: "ko", nl: "nl", ru: "ru", sv: "sv", id: "id", fil: "fil", uk: "uk", el: "el",
  cs: "cs", fi: "fi", ro: "ro", da: "da", bg: "bg", ms: "ms", sk: "sk", hr: "hr",
  ta: "ta", vi: "vi", no: "no", hu: "hu",
};
export function ttsLanguage(normalized: string): string | null {
  return TTS_LANG[normalized] ?? null;
}

/**
 * SES ÖNBELLEĞİ (süreç içi, LRU'suz basit): anahtar (metin, dil, ses, model).
 * İngilizce çekirdek klipleri TÜM dillerin öğrencilerinde birebir aynı — en
 * büyük kazanç orada. R2'ye taşıma CLAUDE.md'de planlı; bu, onun öncülü.
 */
const audioCache = new Map<string, { audioBase64: string; alignment: unknown }>();
const AUDIO_CACHE_MAX = 500;

function audioCacheKey(text: string, lang: string): string {
  return `${env.ELEVENLABS_VOICE_ID}|eleven_flash_v2_5|${lang}|${text}`;
}

async function synthesizeClip(
  text: string,
  languageCode: string,
): Promise<{ audioBase64: string; alignment: unknown }> {
  const key = audioCacheKey(text, languageCode);
  const cached = audioCache.get(key);
  if (cached) return cached;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({ text, model_id: "eleven_flash_v2_5", language_code: languageCode }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new SessionError("tts_unavailable", `ElevenLabs hata: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    audio_base64: string;
    alignment?: unknown;
    normalized_alignment?: unknown;
  };
  const clip = {
    audioBase64: data.audio_base64,
    alignment: data.normalized_alignment ?? data.alignment ?? null,
  };

  if (audioCache.size >= AUDIO_CACHE_MAX) {
    const first = audioCache.keys().next().value;
    if (first) audioCache.delete(first);
  }
  audioCache.set(key, clip);
  return clip;
}

export interface TtsClip {
  audioBase64: string;
  alignment: unknown;
  /** İstemcinin viseme zaman çizelgesini kaydırması için: bu klipten ÖNCEKİ toplam metin */
  lang: string;
}

/**
 * v7 girişi: dil etiketli parçalar. Ardışık aynı-dil parçalar TEK klipte
 * birleştirilir (daha az istek, daha doğal prosodi); istemci klipleri sırayla
 * çalar ve `onEnd`'i son klipten sonra TAM BİR KEZ ateşler.
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
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) {
    throw new SessionError("tts_unavailable", "TTS yapılandırılmamış");
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const native = nativeLanguageOf(profile);
  const l1Code = ttsLanguage(native);

  // Ardışık aynı-dil parçaları grupla
  const groups: Array<{ lang: string | null; text: string }> = [];
  for (const run of runs) {
    const code = run.lang === "en" ? "en" : l1Code;
    const prev = groups[groups.length - 1];
    if (prev && prev.lang === code) prev.text += ` ${run.text}`;
    else groups.push({ lang: code, text: run.text });
  }

  const clips: TtsClip[] = [];
  for (const g of groups) {
    if (g.lang === null) {
      // TTS kapsamı dışı ana dil: metin ekranda kalır, ses atlanır
      console.warn(`[tts] "${native}" kapsam dışı — L1 parçası sessiz bırakıldı`);
      continue;
    }
    const clip = await synthesizeClip(g.text.slice(0, 600), g.lang);
    clips.push({ ...clip, lang: g.lang });
  }

  return { clips };
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

  try {
    const result = await openaiClient.audio.transcriptions.create({
      file: await toFile(buffer, `speech.${ext}`, { type: mimetype }),
      model: "gpt-4o-mini-transcribe",
      prompt: `The speaker is learning English; their native language is ${l1}. They speak English, sometimes ${l1}.`,
    });
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
): Promise<{ ok: true; turns: number; debrief?: RoleplayDebrief | null }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  const firstClose = !owned.session.endedAt;

  if (firstClose) {
    await db.update(sessions).set({ endedAt: new Date() }).where(eq(sessions.id, sessionId));

    // İlerleme MÜFREDAT YUVASI üzerinden işaretlenir, oynatılan içerik sürümünden
    // değil: içerik yeniden üretilse de "bu dersi bitirdim" bilgisi ayakta kalır.
    if (owned.session.catalogLessonId) {
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
