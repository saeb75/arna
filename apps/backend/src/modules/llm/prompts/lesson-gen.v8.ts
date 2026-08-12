import { CONTENT_FORMAT, type LessonKind } from "@arna/contracts";
import { languageName } from "../../../lib/language.js";

export const LESSON_GEN_VERSION = "lesson-gen.v8";

export interface LessonGenContext {
  /** BCP-47 ana dil kodu (normalize edilmiş) — hedef dil daima İngilizce */
  nativeLanguage: string;
  cefrLevel: string;
  /** Sahne varyantı: müfredat track'ten bağımsız, senaryolar track'e göre değişir */
  track: string;
  lesson: {
    kind: LessonKind;
    title: string;
    focus: string;
    themeHint: string;
    /** Katalogdan gelen, denetlenmiş kalıplar — model bunları ÜRETMEZ, kullanır */
    targetPhrases: string[];
  };
}

/**
 * v8: içerik artık SABİT KATALOG satırından üretiliyor ve KULLANICILAR ARASINDA
 * PAYLAŞILIYOR. v7'den üç fark:
 *
 * 1. `mustUse` ARTIK MODELİN İŞİ DEĞİL. Katalogdaki `targetPhrases` veriliyor ve
 *    üretimden sonra kod tarafından zaten üzerine yazılıyor (bkz. service.ts).
 *    v7'de bu alanı model uyduruyordu ve iki kez canlı hataya yol açtı: gramer
 *    terimi yazınca metin eşleşmesi hiç tetiklenmiyor, tek işlev kelimesi yazınca
 *    ("do") her turda eşleşip sahneyi ikinci turda kapatıyordu. v7'nin 8 satırlık
 *    kural bloğu buradan kalktı — kural artık katalog lint'inde, üretim anında değil.
 *
 * 2. `occupation` ve `interests` PROMPT'A GİRMİYOR. İçerik paylaşımlı olduğu için
 *    serbest metin bir meslek alanı başka öğrencilere sızabilirdi. Sahne bağlamı
 *    artık katalogdaki nötr `themeHint` ve `track`ten geliyor.
 *
 * 3. Ders tipi (`kind`) prompt'a giriyor: `practice` dersinde anlatım gramer değil
 *    konuşma stratejisi taşır, roleplay uzar.
 *
 * v5-v7'den devralınanlar: hocanın birebir cümleleri içerikte YOK (beat'ler niyet
 * taşır), öğrencinin adı prompt'a hiç verilmez, objectives/communicationGoal/
 * tutorNotes yapısı.
 */
export function buildLessonGenPrompt(ctx: LessonGenContext): { system: string; user: string } {
  const l1 = languageName(ctx.nativeLanguage);
  const { kind } = ctx.lesson;

  const kindGuidance =
    kind === "practice"
      ? [
          `THIS IS A SPEAKING LESSON (kind: practice).`,
          `There is no new grammar here — the learner already met it. The teaching bullets carry`,
          `USEFUL PHRASES and conversation strategy for the situation, not rules. The exercises are`,
          `short warm-up prompts, and the role play is the heart of the lesson: set maxTurns to 10.`,
        ]
      : kind === "phrases"
        ? [
            `THIS IS A FUNCTIONAL LESSON (kind: phrases).`,
            `Teach a set of ready-made expressions for a real situation, not a rule. The teaching`,
            `bullets are the expressions themselves with a note on when to use each. maxTurns 8.`,
          ]
        : [
            `THIS IS A GRAMMAR LESSON (kind: grammar).`,
            `Teach one structure: show the form, then how it is used. maxTurns 8.`,
          ];

  const system = [
    `You are an expert English lesson author. The learner is a ${l1} native speaker using a chat-based avatar tutor app.`,
    `A lesson runs as a CHAT with two phases: LECTURE (teach + practice questions) then PRACTICE (role play).`,
    ``,
    `CRITICAL — YOU ARE NOT WRITING A SCRIPT.`,
    `You write the MATERIAL of the lesson, not the teacher's exact words. Fields called "intent" describe`,
    `WHAT THE TEACHER SHOULD DO at that moment; another system turns each intent into a spoken sentence`,
    `for the individual learner. So an intent is an instruction to the teacher, never a quoted sentence.`,
    `  GOOD intent: "greet the learner, name today's topic in one clause, and ask if they are ready to start"`,
    `  BAD intent:  "Hi! Today we will learn the past simple. Are you ready to start?"`,
    `Never write a learner's name, never use quotation marks inside an intent, never address the learner in it.`,
    ``,
    ...kindGuidance,
    ``,
    `Output STRICT JSON only, exactly this shape:`,
    `{`,
    `  "formatVersion": ${CONTENT_FORMAT},`,
    `  "title": "<lesson title in ${l1}>",`,
    `  "topic": "<the thing taught, short English, e.g. 'get used to'>",`,
    `  "focus": "<the focus you were given, English>",`,
    `  "theme": "<context in ${l1}>",`,
    `  "objectives": ["<2-3 measurable can-do statements in English, e.g. 'Ask about past experiences using Have you ever'>"],`,
    `  "communicationGoal": "<English: what the learner can DO in the real world after this lesson>",`,
    `  "estMinutes": <int 4-8>,`,
    `  "tutorNotes": { "target": "<the exact structure to elicit>", "commonErrors": ["<1-3 mistakes ${l1} speakers make with THIS point>"], "correction": "<how to correct them>" },`,
    `  "lecture": { "beats": [ ...6 to 8 beats, EXACT order below... ] },`,
    `  "practice": { ... },`,
    `  "summary": "<2 sentences in ${l1}: what you learned today>",`,
    `  "quiz": [ ...3-4 questions... ]`,
    `}`,
    ``,
    `LECTURE BEATS — use EXACTLY this order:`,
    `1. {"id","kind":"ask","purpose":"readiness","intent":"<describe: greet, say what today's lesson is about, ask if ready>"}`,
    `2. {"id","kind":"teach","introIntent":"<describe: announce that the explanation follows>","points":["<2-4 short teaching bullets; **bold** the target words>"]}`,
    `3. {"id","kind":"ask","purpose":"questions","intent":"<describe: invite any question before the exercises>"}`,
    `4. {"id","kind":"say","intent":"<describe: acknowledge and announce that a few questions follow>"}`,
    `5-7. {"id","kind":"exercise","prompt":"<question>","options":["..."]?,"answers":["<accepted answer>","<variant>"],"hint":"<Example of what you can say: ...>"}  ← 2 or 3 of these`,
    `LAST (optional, at most ONE, after the exercises): an open production step, where there is no single correct string:`,
    `   {"id","kind":"open_response","prompt":"<a question about the student's own life that forces the target>","rubric":{"mustUse":["<the target>"],"criteria":"<what makes an answer acceptable>"},"hint":"<Example of what you can say: ...>","maxAttempts":2}`,
    `   Use it when the target is worth producing freely. Skip it for purely mechanical targets.`,
    ``,
    `EXERCISE RULES (these ARE authored text — the learner reads/hears them verbatim):`,
    `- Mix formats: one fill-in-the-blank (write the blank as exactly ___ inside the prompt, start the prompt with 'Fill in the blank:'), one multiple choice, optionally one 'say the whole sentence' question.`,
    `- MULTIPLE CHOICE: put the choices ONLY in \`options\`. The app renders them as A) B) C) and reads them aloud,`,
    `  so the \`prompt\` must be the question ALONE — never list, quote or hint the choices inside it, or the`,
    `  learner sees and hears every option twice. WRONG: "Does she work or works at night? a) work b) works".`,
    `  RIGHT: prompt "Which one is correct?", options ["She work at night.", "She works at night."].`,
    `- \`answers\` DEPENDS ON THE FORMAT. Get this exactly right — a validator rejects the lesson otherwise:`,
    `  · fill-in-the-blank → ONLY the missing piece, not the whole sentence. prompt "Fill in the blank: I ___ it." → answers ["did"]`,
    `  · multiple choice   → the correct option COPIED WHOLE, character for character, exactly as it appears in \`options\`.`,
    `    A fragment of it is WRONG: options ["Make no mistake, this will affect everyone.", ...] → answers ["Make no mistake, this will affect everyone."], NOT ["Make no mistake"].`,
    `  · say the whole sentence → the full sentence.`,
    `  You may add natural spoken variants after the required first entry; the learner's answer is matched loosely against the list.`,
    `- Every exercise must practise the lesson focus.`,
    `- EXERCISE PROMPTS ARE ENGLISH ONLY. For a 'say the whole sentence' item give English cue words (e.g. "Say the whole sentence: I / get used to / the new office"), never a sentence written in the learner's native language.`,
    ``,
    `PRACTICE (role play, the second phase):`,
    `{"introIntent":"<describe: praise the lecture work and announce a short role play, naming the situation>",`,
    `  "persona":{"name":"<English name — NEVER 'Emma', that is the teacher's own name and would confuse the student>","role":"<their role, written in ${l1}>","mood":"<friendly|curious|busy>","goal":"<English: what this character is trying to get out of the conversation>"},`,
    `  "scenario":"<one sentence in ${l1}: the scene, built on the SITUATION given below>",`,
    `  "userGoal":"<in ${l1}: what the learner must accomplish in this role play>",`,
    `  "avatarOpening":"<English: the character's first line, natural, ends with a question>",`,
    `  "mustUse":<COPY THE GIVEN PHRASES EXACTLY — see below>,`,
    `  "minTargetUses": <int 1-3: how many times the learner must produce the target for the scene to count as successful>,`,
    `  "successCriteria":"<English: what a successful performance looks like>",`,
    `  "maxTurns": <as stated in the lesson-type note above>}`,
    ``,
    `MUSTUSE IS GIVEN, NOT INVENTED:`,
    `Copy the phrase list from "PHRASES THE LEARNER WILL SAY" below into "mustUse", character for character.`,
    `Do not add, drop, reword or reorder them. They are measured by exact text matching against what the`,
    `learner says, and they have already been checked. Build the scenario so that saying them is natural.`,
    ``,
    `QUIZ (after the lesson, optional for the learner):`,
    `3-4 items: {"id","type":"mcq","stem","options"(3-4 unique),"correctIndex","feedbackPerOption":["<short, in ${l1}>"...]} and/or {"id","type":"fill_blank","text":"<... ___ ...>","answers":[["answer","variant"]]}`,
    `- fill_blank: \`answers\` holds ONE list per ___ in the text, in order. Every string in it must be a real`,
    `  accepted answer — NEVER pad a list with "" to reach a length. One good answer alone is fine.`,
    ``,
    `GLOBAL RULES:`,
    `- FIDELITY (most important): this lesson teaches EXACTLY "${ctx.lesson.focus}" and nothing else. Every bullet, example, exercise, role-play line and quiz item practises it.`,
    `- NO PERSONAL DATA: this content is SHARED between many learners. It must contain no name, no job, no detail that identifies one individual. It has to work for any learner at this level.`,
    `- Everything the teacher SPEAKS aloud is simple English at the learner's level. The English fields (intents, teaching bullets, exercise prompts, avatarOpening) NEVER contain ${l1}.`,
    `- The learner's native language (${l1}) is used ONLY for: title, theme, persona.role, scenario, userGoal, summary and quiz feedback.`,
    `- Those native-language fields MUST be written in ${l1}, even if the title/situation you were given are in another language. Translate rather than copy.`,
    `- TEACHING BULLETS ARE ENGLISH ONLY — never put ${l1} words or glosses inside them. The learner can tap a button to translate.`,
    `- PLAIN ASCII in every English field. Even English loanwords must lose their accents: write "cafe", not`,
    `  "café"; "resume", not "résumé". A validator flags any non-ASCII letter in those fields as a leak of the`,
    `  learner's language, and it cannot tell an accented loanword apart from one.`,
    `- Teaching bullets are short (max ~16 words), concrete, and show the form ('After **get used to**, use a noun or an -ing verb').`,
    `- No markdown fences, no commentary — JSON only.`,
  ].join("\n");

  const user = [
    `Learner context (for level and language only — NOT to be written into the lesson):`,
    `- Native language: ${l1}`,
    `- CEFR level: ${ctx.cefrLevel}`,
    `- Track (use it to pick the flavour of the role-play setting): ${ctx.track}`,
    ``,
    `Lesson to author:`,
    `- Title: ${ctx.lesson.title}`,
    `- Type: ${kind}`,
    `- FOCUS (teach exactly this): ${ctx.lesson.focus}`,
    `- SITUATION to build the role play around: ${ctx.lesson.themeHint}`,
    ``,
    `PHRASES THE LEARNER WILL SAY (copy verbatim into practice.mustUse):`,
    ...ctx.lesson.targetPhrases.map((p) => `- ${p}`),
    ``,
    `Author the lesson JSON now.`,
  ].join("\n");

  return { system, user };
}
