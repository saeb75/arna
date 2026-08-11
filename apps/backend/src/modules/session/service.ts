import {
  CONTENT_FORMAT,
  decideInWrapup,
  isSurrender,
  PRACTICE_MIN_MAX_TURNS,
  PRACTICE_MIN_TURNS_BEFORE_GOAL,
  type LectureBeat,
  type LessonContent,
  type LessonPhase,
  type SessionScript,
} from "@arna/contracts";
import { and, asc, eq } from "drizzle-orm";
import { toFile } from "openai";
import { z } from "zod";
import { db } from "../../db/client.js";
import { env } from "../../config/env.js";
import { languageName, nativeLanguageOf } from "../../lib/language.js";
import {
  lessons,
  programLessons,
  programs,
  sessions,
  transcriptTurns,
  userProfiles,
} from "../../db/schema.js";
import { completeJson, completeText } from "../llm/index.js";
import { openaiClient } from "../llm/openai.js";
import { buildTutorPrompt } from "../lesson/tutorPrompt.js";
import { extractSessionMemory } from "../memory/extract.js";
import { buildMemoryBlock } from "../memory/retrieve.js";
import { renderSessionScript } from "./script.js";

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

/** Oturumu sahiplik kontrolüyle getirir (ders + plan satırı ile birlikte). */
async function getOwnedSession(userId: string, sessionId: string) {
  const [row] = await db
    .select({ session: sessions, lesson: lessons })
    .from(sessions)
    .leftJoin(lessons, eq(sessions.lessonId, lessons.id))
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------
// Oturum açma
// ---------------------------------------------------------------------------

export async function openSession(userId: string, programLessonId: string) {
  const [owned] = await db
    .select({ pl: programLessons })
    .from(programLessons)
    .innerJoin(programs, eq(programLessons.programId, programs.id))
    .where(and(eq(programLessons.id, programLessonId), eq(programs.userId, userId)))
    .limit(1);
  if (!owned) throw new SessionError("not_found", "Ders bulunamadı");

  const [lessonRow] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.programLessonId, programLessonId), eq(lessons.status, "ready")))
    .limit(1);
  if (!lessonRow) {
    throw new SessionError("lesson_not_ready", "Ders içeriği henüz üretilmemiş — önce GET /v1/lessons/:id çağır");
  }

  // Bayat formatta içerikle oturum AÇILMAZ: script üretimi v6 alanlarını okur,
  // eski satırda anlamsız cümleler çıkardı. GET /v1/lessons/:id bayat satırı
  // otomatik yeniden üretir — istemci oradan geçtiği için normalde buraya düşmez.
  if ((lessonRow.content as { formatVersion?: number } | null)?.formatVersion !== CONTENT_FORMAT) {
    throw new SessionError("lesson_not_ready", "Ders içeriği eski formatta — önce GET /v1/lessons/:id çağır");
  }

  const [session] = await db
    .insert(sessions)
    .values({ userId, lessonId: lessonRow.id })
    .returning();
  const sessionId = session!.id;

  // Ders ancak öğrenci GERÇEKTEN başlattığında "devam ediyor" olur.
  // (İçeriği getirmek veya arka planda önceden üretmek durumu değiştirmez —
  //  aksi halde hiç girilmemiş dersler de "devam ediyor" görünüyordu.)
  if (owned.pl.status === "not_started") {
    await db
      .update(programLessons)
      .set({ status: "in_progress" })
      .where(eq(programLessons.id, programLessonId));
  }

  const content = lessonRow.content as LessonContent | null;
  if (!content) return { sessionId, script: null };

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const displayName = profile?.displayName ?? "there";

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
    content,
    displayName,
    cefrLevel: profile?.cefrLevel ?? "A2",
    nativeLanguage: nativeLanguageOf(profile),
    memoryBlock,
    userId,
    sessionId,
  });

  await db
    .update(sessions)
    .set({ state: { memoryBlock, script } satisfies SessionState })
    .where(eq(sessions.id, sessionId));

  return { sessionId, script };
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
}

/**
 * Hocanın öğrenciyi tanımasını sağlayan blok — oturum boyunca sabit, state'te cache'lenir.
 * Hafıza katmanı düşerse ders akışı ETKİLENMEZ (null döner, prompt bloğu eklenmez).
 */
async function sessionMemoryBlock(
  sessionId: string,
  userId: string,
  state: SessionState | null,
  content: LessonContent,
): Promise<string | null> {
  if (state && "memoryBlock" in state) return state.memoryBlock ?? null;

  let block: string | null = null;
  try {
    block = await buildMemoryBlock(
      userId,
      { topic: content.topic, focus: content.focus, theme: content.theme },
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
function effectiveMaxTurns(content: LessonContent): number {
  return Math.max(content.practice.maxTurns, PRACTICE_MIN_MAX_TURNS);
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

/** O anki beat/faz için hocaya verilen kesin davranış kuralı. */
function momentContext(
  content: LessonContent,
  opts: ChatOptions,
  script: SessionScript | null,
  goalMet = false,
): string {
  // Davranış kuralı — bitiş KARARI değil. Kararı sunucu sayaçla verir.
  const closingRule = `Finish with ONE short closing sentence and ask NO new question.`;

  // KAPANIŞ — ders bitti, hoca rol karakterinden çıktı. Ders buradan SAYAÇLA
  // bitmez; yalnızca öğrenci "Dersi Bitir"e basınca biter.
  if (opts.phase === "wrapup") {
    const taught = content.lecture.beats
      .filter((b) => b.kind === "teach")
      .flatMap((b) => (b.kind === "teach" ? b.points : []))
      .map((p) => `  - ${p.replaceAll("**", "")}`)
      .join("\n");

    return [
      `THE LESSON IS OVER. You are Emma the teacher again — you are NOT ${content.practice.persona.name} or any role-play character. Never speak in character here.`,
      `The student may ask anything about today's lesson (${content.focus}).`,
      `WHAT YOU TAUGHT TODAY (your answer must agree with this, never contradict it):`,
      taught,
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
    const p = content.practice;
    const turnIndex = opts.turnIndex ?? 0;
    // Tavan koddaki tabanla birlikte hesaplanır; prompt'a da AYNI sayı gitmeli,
    // yoksa hoca "son tur" sanıp erken kapatır.
    const turnCap = effectiveMaxTurns(content);
    const isLast = turnIndex + 1 >= turnCap;
    return [
      `ROLE PLAY. You are NOT the teacher right now — you are a character in a scene.`,
      `You are ${p.persona.name} (${p.persona.role}${p.persona.mood ? ", " + p.persona.mood : ""}).`,
      `What you want out of this conversation: ${p.persona.goal}`,
      `Scene: ${p.scenario}`,
      `The student's goal: ${p.userGoal}`,
      `A successful scene looks like: ${p.successCriteria}`,
      `You opened the scene with: "${p.avatarOpening}"`,
      `NEVER refer to exercises, multiple-choice options, "the correct answer", or anything from the earlier lecture — that part of the lesson is over. Stay inside the scene at all times.`,
      `If the student says something short, off-topic or unhelpful, react naturally AS THE CHARACTER (surprised, curious, mildly persistent) and keep the scene going.`,
      `Keep replies short and natural. Gently create openings for the student to use: ${p.mustUse.join(", ")}.`,
      `This is exchange ${turnIndex + 1} of ${turnCap}.`,
      isLast
        ? `This is the LAST exchange — wrap the scene up warmly and praise their use of today's target. ${closingRule}`
        : goalMet
          ? `The student has now used today's target enough times — they succeeded. Wrap the scene up warmly and praise them. ${closingRule}`
          : `If the student has achieved their goal, wrap the scene up. ${closingRule} Otherwise continue the scene with one short reply.`,
    ].join("\n");
  }

  const beat = content.lecture.beats.find((b) => b.id === opts.beatId);

  // Not: `exercise` beat'i buraya DÜŞMEZ — yapısal değerlendirmeye (judgeExercise)
  // yönlendirilir, çünkü "bu bir cevap denemesi miydi?" kararı gerekiyor.

  if (beat?.kind === "ask") {
    // Soru metni içerikte DEĞİL, oturum script'inde — bu öğrenci için üretilmişti
    const asked = script?.beats[beat.id];
    const opener = asked
      ? `You asked the student: "${asked}" — they just replied.`
      : `You just asked the student a short question and they replied.`;

    // "Sorum var mı?" penceresi GERÇEK bir soru-cevap anıdır: burada öğrenciye
    // örnekle açıklama yapılır. (readiness'in katı "sadece onayla" kuralı buraya
    // uygulanınca hoca soruyu geçiştiriyordu.)
    if (beat.purpose === "questions") {
      // Anlatım maddeleri bağlama GİRER: yoksa model dersin kuralıyla çelişen
      // cevaplar verebiliyor ("put 'always' before 'be'" gibi — tam tersi).
      const taught = content.lecture.beats
        .filter((b) => b.kind === "teach")
        .flatMap((b) => (b.kind === "teach" ? b.points : []))
        .map((p) => `  - ${p.replaceAll("**", "")}`)
        .join("\n");

      return [
        opener,
        `THIS IS THE STUDENT'S QUESTION WINDOW — they are allowed to ask about today's target (${content.focus}).`,
        `WHAT YOU JUST TAUGHT THEM (your answer must agree with this, never contradict it):`,
        taught,
        `Answer their question clearly in 1-3 short sentences AND give ONE concrete example sentence that uses the target.`,
        opts.lastExchange
          ? `This is the LAST question you can take. After answering, say warmly that you will move on to some practice questions now. Do NOT ask whether they have another question — the lesson continues right after you.`
          : `Then ask whether they have another question, so they can keep asking.`,
        `HARD RULES:`,
        `- If they said they have a question but did not say what it is yet, just invite them to ask it and stop. Do NOT guess what they want to know.`,
        `- NEVER start an exercise, activity or task — the lesson does that next by itself.`,
        `- Do NOT re-teach the whole topic; answer only what was asked.`,
        `- Stay on ${content.focus}. If they ask about something else, answer in one clause and steer back.`,
      ].join("\n");
    }

    return [
      opener,
      `YOUR ONLY JOB HERE IS TO ACKNOWLEDGE. A scripted teaching message runs IMMEDIATELY after your reply.`,
      `HARD RULES:`,
      `- NEVER ask a question of any kind.`,
      `- NEVER start an exercise, activity or task ("What did you do yesterday?", "Try a sentence" — forbidden).`,
      `- NEVER begin explaining or teaching the topic — the script does that next.`,
      `- Maximum TWO short sentences.`,
      `If the student asked a genuine question about the lesson, answer just that question plainly, then stop.`,
      `If they simply agreed or said they have no questions, reply with at most a few warm words.`,
    ].join("\n");
  }

  return `The student said something during the lesson. Reply in one short sentence and stay on ${content.focus}.`;
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
  `First decide: did the student ENGAGE WITH THE QUESTION at all?`,
  `- isAttempt=true — they tried to answer, however badly. A right answer, a wrong answer, a`,
  `  single letter, a guess, a half sentence, or GIVING UP all count. "I don't know", "no idea",`,
  `  "bilmiyorum", "pass", "skip" are ATTEMPTS — surrendering is an answer and the student`,
  `  deserves to be told the answer once their tries run out.`,
  `- isAttempt=false — they did not engage with the question at all: a greeting ("hey", "hello"),`,
  `  small talk, a remark about something else, or asking you to repeat.`,
  `When isAttempt=false: acknowledge in at most one short clause, correct nothing, NEVER say which`,
  `answer is correct, and ASK THE QUESTION AGAIN. Stay on the lesson.`,
].join("\n");

/** Alıştırma değerlendirmesi — deneme miydi + hocanın kısa yanıtı. */
const exerciseVerdictSchema = z.object({
  isAttempt: z.boolean(),
  reply: z.string().trim().min(1).max(300),
});

/** Açık uçlu cevabın rubrik değerlendirmesi — kabul/ret + kısa geri bildirim. */
const openResponseVerdictSchema = z.object({
  isAttempt: z.boolean(),
  ok: z.boolean(),
  feedback: z.string().trim().min(1).max(300),
});

/**
 * Yanlış (ya da cevap olmayan) alıştırma girdisini değerlendirir.
 * Doğru cevaplar buraya HİÇ gelmez — istemci onları LLM'siz eşleştirir.
 */
async function judgeExercise(
  userId: string,
  sessionId: string,
  text: string,
  beat: Extract<LectureBeat, { kind: "exercise" }>,
  content: LessonContent,
  opts: ChatOptions,
  phase: LessonPhase,
): Promise<{ text: string; segmentDone: boolean; isAttempt: boolean }> {
  const attempt = opts.attempt ?? 0;

  const t0 = Date.now();
  const verdict = await completeJson({
    purpose: "chat",
    system: [
      `You are Emma, a warm English teacher. The student is answering a practice question.`,
      `The question you asked: "${beat.prompt}"`,
      beat.options?.length ? `Options: ${beat.options.join(" / ")}` : "",
      `Accepted answer(s): ${beat.answers.join(" / ")}`,
      `Today's target: ${content.focus}`,
      ``,
      attemptRule,
      // Pes etme deterministik biliniyor — modele SÖYLENİR, yoksa "konu dışı" sanıp
      // "lütfen cevaplamayı dene" diyor ve öğrenci doğru cevabı hiç duymuyor.
      isSurrender(text)
        ? `IMPORTANT: the student has GIVEN UP on this question. That IS an attempt — isAttempt=true.`
        : "",
      ``,
      `If it IS an attempt, it was wrong (correct answers never reach you). Then:`,
      attempt === 0
        ? `Reply in 1-2 short sentences: say "Almost!", remind them of today's target, then ASK THE SAME QUESTION again. Do NOT reveal the answer yet.`
        : `Reply in 1-2 short sentences: kindly give the correct answer in a full sentence and add one word of encouragement. Do NOT ask the question again.`,
      ``,
      `Reply with STRICT JSON: {"isAttempt": <true|false>, "reply": "<1-2 short spoken sentences>"}`,
      `Plain speech only in "reply": no markdown, no emojis, no stage directions.`,
    ]
      .filter(Boolean)
      .join("\n"),
    user: `The student said: "${text}"`,
    schema: exerciseVerdictSchema,
    promptVersion: "exercise-check.v1",
    userId,
    sessionId,
    maxTokens: 200,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - t0;

  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: verdict.reply, phase, latencyMs },
  ]);

  // "Bilmiyorum" modelin insafına bırakılmaz — pes etmek de bir cevaptır.
  return {
    text: verdict.reply,
    segmentDone: false,
    isAttempt: verdict.isAttempt || isSurrender(text),
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
  beat: Extract<LectureBeat, { kind: "open_response" }>,
  content: LessonContent,
  opts: ChatOptions,
  phase: LessonPhase,
): Promise<{ text: string; segmentDone: boolean; beatDone: boolean; isAttempt: boolean }> {
  const attempt = opts.attempt ?? 0;
  const isLastAttempt = attempt + 1 >= beat.maxAttempts;

  const t0 = Date.now();
  const verdict = await completeJson({
    purpose: "chat",
    system: [
      `You are Emma, a warm English teacher marking one spoken answer.`,
      `Task the student was given: "${beat.prompt}"`,
      `They must use: ${beat.rubric.mustUse.join(" / ")}`,
      `Accept the answer when: ${beat.rubric.criteria}`,
      ``,
      `Judge MEANING and STRUCTURE, not perfection. Accept it if they used the target correctly,`,
      `even with small slips elsewhere or a different personal content than you expected.`,
      `Reject only if the target structure is missing or used wrongly.`,
      ``,
      // Pes etme deterministik biliniyor; o durumda modele SORULMAZ, tek yönerge verilir.
      // Yığılmış koşullu talimatlar çelişiyordu: model "konu dışı" dalını seçip görevi
      // yeniden soruyor, öğrenci hakları bitmesine rağmen örnek cevabı hiç duymuyordu.
      ...(isSurrender(text)
        ? [
            `The student has GIVEN UP on this task. Set isAttempt=true and ok=false.`,
            isLastAttempt
              ? `This was their LAST try: warmly GIVE THEM a model answer as a full sentence using the target. Do NOT ask the task again.`
              : `Encourage them in one clause, then ASK THEM TO TRY AGAIN.`,
          ]
        : [
            attemptRule,
            ``,
            `If isAttempt is false, ok MUST be false and the feedback just re-asks the task.`,
            isLastAttempt
              ? `If it IS an attempt and ok is false, this was their LAST try: warmly GIVE THEM a model answer as a full sentence. Do NOT ask the task again.`
              : `If it IS an attempt and ok is false, name what is missing in one clause and ASK THEM TO TRY AGAIN. Do not reveal a full model answer yet.`,
          ]),
      ``,
      `Reply with STRICT JSON: {"isAttempt": <true|false>, "ok": <true|false>, "feedback": "<1-2 short spoken sentences at ${content.focus} level>"}`,
      `If ok is true, praise briefly and do not ask anything.`,
      `Plain speech only: no markdown, no emojis, no quotation marks around the feedback.`,
    ]
      .filter(Boolean)
      .join("\n"),
    user: `The student said: "${text}"`,
    schema: openResponseVerdictSchema,
    promptVersion: "open-response.v1",
    userId,
    sessionId,
    maxTokens: 200,
    temperature: 0.2,
  });
  const latencyMs = Date.now() - t0;

  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: verdict.feedback, phase, latencyMs },
  ]);

  const isAttempt = verdict.isAttempt || isSurrender(text);
  return {
    text: verdict.feedback,
    segmentDone: false,
    // İlerleme KODDA: kabul edildi ya da hak bitti. Cevap denemesi değilse
    // (selamlama, konu dışı) hak YANMAZ — adım kapanmaz, soru yeniden sorulur.
    beatDone: isAttempt ? verdict.ok || isLastAttempt : false,
    isAttempt,
  };
}

export async function chatTurn(
  userId: string,
  sessionId: string,
  text: string,
  opts: ChatOptions = {},
): Promise<{ text: string; segmentDone: boolean; beatDone?: boolean; isAttempt?: boolean }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");
  if (owned.session.endedAt) throw new SessionError("session_ended", "Oturum kapatılmış");

  const content = owned.lesson?.content as LessonContent | null;
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const state = owned.session.state as SessionState | null;
  const script = state?.script ?? null;

  const memoryBlock = content
    ? await sessionMemoryBlock(sessionId, userId, state, content)
    : null;

  const phase = opts.phase ?? "lecture";

  // YAPISAL DEĞERLENDİRME GEREKEN BEAT'LER — düz metin yerine şemayla doğrulanmış
  // karar döner (isAttempt / ok), böylece ilerleme kararı KODDA kalır.
  const activeBeat =
    phase === "lecture" && content
      ? content.lecture.beats.find((b) => b.id === opts.beatId)
      : undefined;

  if (content && activeBeat?.kind === "open_response") {
    return await judgeOpenResponse(userId, sessionId, text, activeBeat, content, opts, phase);
  }
  // Alıştırmaya gelen girdi ya yanlış cevaptır ya da cevap bile değildir
  // (doğru cevaplar istemcide eşleşir, buraya hiç gelmez).
  if (content && activeBeat?.kind === "exercise") {
    return await judgeExercise(userId, sessionId, text, activeBeat, content, opts, phase);
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

  // BAŞARI ÖLÇÜTÜ — deterministik, modele sorulmaz: öğrenci hedef yapıyı kaç turda
  // gerçekten üretti? maxTurns "ne zaman biter"i söyler, bu "başardı mı"yı.
  //
  // Hedef erken tutturulsa BİLE sahne PRACTICE_MIN_TURNS_BEFORE_GOAL turundan önce
  // kapanmaz: hedefi çabuk kullanmak konuşmayı kesmenin gerekçesi değil.
  const goalMet =
    phase === "practice" && content
      ? (opts.turnIndex ?? 0) + 1 >= PRACTICE_MIN_TURNS_BEFORE_GOAL &&
        countTargetUses(content.practice.mustUse, [
          ...priorTurns.filter((t) => t.role === "user").map((t) => t.text),
          text,
        ]) >= content.practice.minTargetUses
      : false;

  const system = content
    ? buildTutorPrompt({
        displayName: profile?.displayName ?? "Student",
        cefrLevel: profile?.cefrLevel ?? "A2",
        nativeLanguage: nativeLanguageOf(profile),
        occupation: profile?.occupation ?? null,
        interests: Array.isArray(profile?.interests) ? (profile.interests as string[]) : [],
        lesson: content,
        activeContext: momentContext(content, opts, script, goalMet),
        memoryBlock,
      })
    : "You are Emma, a warm English teacher. Reply in 1-3 simple sentences.";

  const messages = [
    ...priorTurns.slice(-20).map((t) => ({
      role: t.role as "user" | "assistant",
      content: t.text,
    })),
    { role: "user" as const, content: text },
  ];

  const t0 = Date.now();
  const raw = await completeText({
    purpose: "chat",
    system,
    messages,
    promptVersion: "tutor-chat.v2",
    userId,
    sessionId,
    maxTokens: 220,
  });
  const latencyMs = Date.now() - t0;

  const reply = raw.trim();

  // AKIŞ KONTROLÜ MODELE EMANET EDİLMEZ — yanıtın METNİNE hiç bakılmaz.
  // Sahne yalnızca iki deterministik nedenle biter: tur tavanı doldu ya da
  // öğrenci hedef yapıyı yeterince kez üretti (goalMet, sayılarak hesaplanır).
  const reachedLimit =
    opts.phase === "practice" && content
      ? (opts.turnIndex ?? 0) + 1 >= effectiveMaxTurns(content)
      : false;
  const segmentDone = reachedLimit || goalMet;

  await db.insert(transcriptTurns).values([
    { sessionId, role: "user", text, phase },
    { sessionId, role: "assistant", text: reply, phase, latencyMs },
  ]);

  return { text: reply, segmentDone };
}

// ---------------------------------------------------------------------------
// TTS — ElevenLabs with-timestamps proxy (eski repodaki hattın sunucu hali)
// ---------------------------------------------------------------------------

export async function tts(
  userId: string,
  sessionId: string,
  text: string,
): Promise<{ audioBase64: string; alignment: unknown }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) {
    throw new SessionError("tts_unavailable", "TTS yapılandırılmamış");
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({ text, model_id: "eleven_flash_v2_5" }),
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

  return {
    audioBase64: data.audio_base64,
    alignment: data.normalized_alignment ?? data.alignment ?? null,
  };
}

// ---------------------------------------------------------------------------
// STT — OpenAI gpt-4o-mini-transcribe
// ---------------------------------------------------------------------------

const EXT_BY_MIME: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

export async function stt(
  userId: string,
  sessionId: string,
  buffer: Buffer,
  mimetype: string,
): Promise<{ text: string }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  // OpenAI formatı dosya adından çıkarır — iOS Safari mp4 düzeltmesi (eski repodan)
  const ext = EXT_BY_MIME[mimetype.split(";")[0]!.trim()] ?? "webm";

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
    throw new SessionError("stt_failed", `STT hatası: ${String(err).slice(0, 200)}`);
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
// Oturum bitirme (idempotent)
// ---------------------------------------------------------------------------

export async function endSession(
  userId: string,
  sessionId: string,
): Promise<{ ok: true; turns: number }> {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) throw new SessionError("not_found", "Oturum bulunamadı");

  const firstClose = !owned.session.endedAt;

  if (firstClose) {
    await db.update(sessions).set({ endedAt: new Date() }).where(eq(sessions.id, sessionId));

    if (owned.lesson) {
      await db
        .update(programLessons)
        .set({ status: "completed" })
        .where(eq(programLessons.id, owned.lesson.programLessonId));
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

  return { ok: true, turns: turns.length };
}
