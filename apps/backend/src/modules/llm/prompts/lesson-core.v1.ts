import { CORE_FORMAT, type LessonKind } from "@arna/contracts";

export const LESSON_CORE_VERSION = "lesson-core.v1";

export interface LessonCoreGenContext {
  cefrLevel: string;
  kind: LessonKind;
  focus: string;
  themeHint: string;
  /** Katalogdan — model üretmez, sahne kurgusuna bağlam olarak verilir */
  targetPhrases: string[];
}

/**
 * ÇEKİRDEK üretimi — v8'den üç köklü fark:
 *
 * 1. DİL YOK. Çekirdek %100 İngilizce; ana dil kavramı bu prompt'a hiç girmez.
 *    Ana dilde anlatım ayrı katmanda (lesson-locale) üretilir.
 * 2. TRACK YOK. Rol yapma sahnesi ayrı katmanda (lesson-scenes) üretilir;
 *    çekirdek yalnızca ölçüm spec'ini taşır.
 * 3. `title` VERİLMEZ. v8'de başlık prompt'a girip specHash'e girmiyordu —
 *    başlık düzeltmesi önbelleği sessizce bayat bırakıyordu. Kanonik başlık
 *    katalogdan gelir; üretim yalnızca focus/themeHint'ten sürülür.
 *
 * Öğretim `claimsEn` olarak yapılandırılır: dersin İDDİALARI. 371 çekirdeğin
 * insan incelemesi bu iddiaları okur; dil paketleri bunları anlatır ama
 * yeni iddia EKLEYEMEZ. Pedagojinin denetim yüzeyi budur.
 */
export function buildLessonCorePrompt(ctx: LessonCoreGenContext): { system: string; user: string } {
  const kindGuidance =
    ctx.kind === "practice"
      ? [
          `THIS IS A SPEAKING LESSON (kind: practice). No new grammar — the learner already met it.`,
          `Teaching claims carry USEFUL PHRASES and conversation strategy, not rules. Exercises are short warm-ups. maxTurns: 10.`,
        ]
      : ctx.kind === "phrases"
        ? [
            `THIS IS A FUNCTIONAL LESSON (kind: phrases). Teach ready-made expressions for a real situation.`,
            `Teaching claims name each expression and when to use it. maxTurns: 8.`,
          ]
        : [
            `THIS IS A GRAMMAR LESSON (kind: grammar). Teach one structure: form, then use. maxTurns: 8.`,
          ];

  const system = [
    `You are an expert English lesson author writing the LANGUAGE-NEUTRAL PEDAGOGICAL CORE of a lesson.`,
    `Everything you write is ENGLISH. A separate system explains your material in the learner's own language,`,
    `and another builds the role-play scene — so you write NO translations, NO scene, NO teacher small talk.`,
    ``,
    ...kindGuidance,
    ``,
    `CRITICAL — TEACHING CLAIMS, NOT PROSE.`,
    `Teaching happens through CLAIMS: short, verifiable statements of what is true about the target.`,
    `  GOOD claim: "Add -s to most verbs after he, she or it."`,
    `  GOOD claim: "Use doesn't + base verb for negatives, never doesn't + verb-s."`,
    `  BAD claim:  "The present simple is very useful and important." (not a claim — filler)`,
    `Every claim must be TRUE, precise, and at the learner's level. These claims are what human reviewers`,
    `check, and what every language edition of the lesson is built from. An incorrect claim gets taught`,
    `to thousands of learners in fifty languages — accuracy beats coverage.`,
    ``,
    `Output STRICT JSON only, exactly this shape:`,
    `{`,
    `  "coreFormat": ${CORE_FORMAT},`,
    `  "topic": "<the thing taught, short, e.g. 'third person -s'>",`,
    `  "focus": "<the focus you were given, verbatim>",`,
    `  "objectives": ["<2-3 measurable can-do statements>"],`,
    `  "communicationGoal": "<what the learner can DO in the real world after this lesson>",`,
    `  "estMinutes": <int 4-8>,`,
    `  "tutorNotes": { "target": "<the exact structure/phrases to elicit>", "correctionStyle": "<one sentence: how to correct errors on THIS target>" },`,
    `  "summary": "<2 short sentences: what this lesson taught>",`,
    `  "lecture": { "beats": [ ...EXACT order below... ] },`,
    `  "practice": { "mustUse": ${JSON.stringify(ctx.targetPhrases)}, "minTargetUses": <1-3>, "successCriteria": "<what success looks like>", "maxTurns": <as stated above> },`,
    `  "quiz": [ ...3-4 items... ]`,
    `}`,
    ``,
    `LECTURE BEATS — use EXACTLY this order:`,
    `1. {"id":"b1","kind":"ask","purpose":"readiness","intent":"<greet, name today's topic, ask if ready>"}`,
    `2. {"id":"b2","kind":"teach","introIntent":"<announce the explanation>","points":[`,
    `     {"id":"p1","formEn":"<the form/phrase itself, as spoken: 'all of a sudden', '-s after he/she/it'>","claimsEn":["<1-3 claims>"],"examples":[{"id":"p1e1","textEn":"<full example sentence>"},{"id":"p1e2","textEn":"<another>"}]},`,
    `     ...1 to 3 points total...`,
    `   ]}`,
    `   formEn is what the language editions NAME when they explain the point — keep it short and exact.`,
    `3. {"id":"b3","kind":"ask","purpose":"questions","intent":"<invite any question before the exercises>"}`,
    `4. {"id":"b4","kind":"say","intent":"<acknowledge and announce a few practice questions>"}`,
    `5-7. two or three exercise beats (rules below)`,
    `LAST (optional, at most ONE): {"id":"b8","kind":"open_response","question":"<question about the learner's own life that forces the target>","rubric":{"mustUse":["<the target>"],"criteria":"<what makes an answer acceptable>"},"exampleAnswer":"<one acceptable answer>","maxAttempts":2}`,
    ``,
    `EXERCISE BEATS — the learner reads/hears \`item\` verbatim; write NO instruction text (the app adds it):`,
    `- fill_blank: {"id","kind":"exercise","format":"fill_blank","item":"<sentence with the gap written as exactly ___>","answerSpec":{"kind":"token","accepted":["<the missing piece>","<natural variant>"]},"exampleAnswer":"<the missing piece>"}`,
    `- mcq: {"id","kind":"exercise","format":"mcq","item":"<the question sentence alone — NEVER list the choices inside it>","options":["<full option>","<full option>","<full option>"],"answerSpec":{"kind":"choice","correctIndex":<0-based>},"exampleAnswer":"<the correct option COPIED WHOLE>"}`,
    `- say_sentence: {"id","kind":"exercise","format":"say_sentence","item":"<cue words, e.g. 'I / work / at night'>","answerSpec":{"kind":"utterance","accepted":["<the full sentence>","<contracted variant>"],"contractionsAllowed":true},"exampleAnswer":"<the full sentence>"}`,
    `- Mix formats: one fill_blank, one mcq, optionally one say_sentence. Every exercise practises the focus.`,
    ``,
    `QUIZ (after the lesson): 3-4 items:`,
    `{"id","type":"mcq","stem","options"(3-4 unique),"correctIndex"} and/or {"id","type":"fill_blank","text":"<... ___ ...>","answers":[["answer","variant"]]}`,
    `No feedback text — the language layer writes it.`,
    ``,
    `GLOBAL RULES:`,
    `- FIDELITY (most important): this lesson teaches EXACTLY "${ctx.focus}" and nothing else.`,
    `- practice.mustUse is GIVEN above — copy it verbatim, do not invent phrases.`,
    `- NO PERSONAL DATA, no learner names — this core is shared by every learner at this level.`,
    `- PLAIN ASCII everywhere. Even loanwords lose accents: "cafe", not "café".`,
    `- Simple English at the learner's level in everything the learner sees (items, examples, question).`,
    `- Intent fields describe what the teacher DOES, never quoted sentences, never a learner's name.`,
    `- No markdown, no commentary — JSON only.`,
  ].join("\n");

  const user = [
    `Lesson to author:`,
    `- CEFR level: ${ctx.cefrLevel}`,
    `- Type: ${ctx.kind}`,
    `- FOCUS (teach exactly this): ${ctx.focus}`,
    `- Situation hint (context flavour only): ${ctx.themeHint}`,
    `- Phrases the learner must produce in the role play (mustUse, given): ${ctx.targetPhrases.join(" · ")}`,
    ``,
    `Author the core JSON now.`,
  ].join("\n");

  return { system, user };
}
