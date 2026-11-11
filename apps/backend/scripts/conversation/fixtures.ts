import { buildCore } from "../authored/dsl.js";
import { LESSONS as A1_AUTHORED } from "../authored/a1.js";
import { lessonCoreSchema, sceneVariantSchema, type LessonCore, type SceneVariant } from "@glotmate/contracts";

/**
 * Konuşma taraması için GERÇEKÇİ çekirdekler — üretimdeki şemadan geçerler.
 * A1: canlı hatanın dersi (3 Kas 2026 ekran görüntüsü: "hello / my name is / Ana").
 * A2: boşluğa birden fazla fiilin oturduğu, does/do ayrımı ölçen ders.
 */

export const A1_INTRO: LessonCore = lessonCoreSchema.parse({
  coreFormat: 1,
  topic: "Introducing yourself",
  focus: "Saying your name: Hello, my name is ... / I'm ...",
  objectives: ["Greet someone and say your name.", "Ask someone's name politely."],
  communicationGoal: "Introduce yourself to a new person and ask their name.",
  estMinutes: 6,
  tutorNotes: {
    target: "my name is + name, I'm + name, and the question What's your name?",
    correctionStyle: "Recast the full sentence with 'my name is' and let them say it again.",
  },
  summary: "We say 'my name is' or 'I'm' with our name, and ask 'What's your name?'.",
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet the student, name the topic, ask if ready" },
      {
        id: "b2",
        kind: "teach",
        introIntent: "announce a short explanation",
        points: [
          {
            id: "p1",
            formEn: "my name is / I'm",
            claimsEn: [
              "Say 'my name is' and then your name to introduce yourself.",
              "'I'm' plus your name is a shorter, friendly way to say the same thing.",
            ],
            examples: [
              { id: "e1", textEn: "Hello, my name is Ana." },
              { id: "e2", textEn: "Hi, I'm Tom." },
            ],
          },
          {
            id: "p2",
            formEn: "What's your name?",
            claimsEn: ["Ask 'What's your name?' to learn someone's name."],
            examples: [{ id: "e3", textEn: "Nice to meet you. What's your name?" }],
          },
        ],
      },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "announce a few short exercises" },
      {
        id: "b5",
        kind: "exercise",
        format: "mcq",
        item: "How do you ask someone their name?",
        options: ["What's your name?", "How old are you?", "Where are you from?"],
        answerSpec: { kind: "choice", correctIndex: 0 },
        exampleAnswer: "What's your name?",
      },
      {
        id: "b6",
        kind: "exercise",
        format: "fill_blank",
        item: "Hello, my ___ is Tom.",
        answerSpec: { kind: "token", accepted: ["name"] },
        exampleAnswer: "name",
      },
      {
        id: "b7",
        kind: "exercise",
        format: "say_sentence",
        item: "hello / my name is / Ana",
        answerSpec: {
          kind: "utterance",
          accepted: ["Hello, my name is Ana.", "Hello my name is Ana"],
          contractionsAllowed: true,
        },
        exampleAnswer: "Hello, my name is Ana.",
      },
      {
        id: "b8",
        kind: "open_response",
        question: "Introduce yourself to me: say hello and tell me your name.",
        rubric: {
          mustUse: ["my name is", "I'm"],
          criteria: "They greet and give their own name using 'my name is' or 'I'm'.",
        },
        exampleAnswer: "Hello, my name is Saeb.",
        maxAttempts: 2,
      },
    ],
  },
  practice: {
    mustUse: ["my name is", "what's your name"],
    minTargetUses: 2,
    successCriteria: "The student introduces themselves and asks the other person's name.",
    maxTurns: 8,
  },
});

export const A2_DOES: LessonCore = lessonCoreSchema.parse({
  coreFormat: 1,
  topic: "Questions about routines",
  focus: "Present simple questions: Do you ...? / Does he/she ...?",
  objectives: ["Ask a yes/no question about someone's routine.", "Choose do or does correctly."],
  communicationGoal: "Ask a colleague about their daily routine.",
  estMinutes: 7,
  tutorNotes: {
    target: "Do/Does + subject + base verb (no -s on the main verb after does)",
    correctionStyle: "Recast with the base verb and the right auxiliary, briefly say why.",
  },
  summary: "Use Do with I/you/we/they and Does with he/she/it; the main verb stays in its base form.",
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, name the topic, ask if ready" },
      {
        id: "b2",
        kind: "teach",
        introIntent: "announce the explanation",
        points: [
          {
            id: "p1",
            formEn: "Do you + base verb?",
            claimsEn: ["Use 'Do' with I, you, we and they to ask a present simple question."],
            examples: [{ id: "e1", textEn: "Do you work on Saturdays?" }],
          },
          {
            id: "p2",
            formEn: "Does he/she + base verb?",
            claimsEn: [
              "Use 'Does' with he, she and it.",
              "After 'does' the main verb has no -s: 'Does she work?', not 'Does she works?'.",
            ],
            examples: [{ id: "e2", textEn: "Does she start at nine?" }],
          },
        ],
      },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "announce the exercises" },
      {
        id: "b5",
        kind: "exercise",
        format: "fill_blank",
        item: "___ she work on Saturdays?",
        answerSpec: { kind: "token", accepted: ["Does"] },
        exampleAnswer: "Does",
      },
      {
        id: "b6",
        kind: "exercise",
        format: "mcq",
        item: "Which question is correct?",
        options: ["Does he likes coffee?", "Does he like coffee?", "Do he like coffee?"],
        answerSpec: { kind: "choice", correctIndex: 1 },
        exampleAnswer: "Does he like coffee?",
      },
      {
        id: "b7",
        kind: "exercise",
        format: "fill_blank",
        item: "Every evening I ___ in my notebook.",
        answerSpec: { kind: "token", accepted: ["write"] },
        exampleAnswer: "write",
      },
      {
        id: "b8",
        kind: "open_response",
        question: "Ask me one question about my daily routine.",
        rubric: {
          mustUse: ["Do you", "Does"],
          criteria: "A present simple yes/no question with Do/Does and the base verb, about a routine.",
        },
        exampleAnswer: "Do you get up early on weekdays?",
        maxAttempts: 2,
      },
    ],
  },
  practice: {
    mustUse: ["do you", "does she"],
    minTargetUses: 2,
    successCriteria: "The student asks at least two present simple questions about routines.",
    maxTurns: 8,
  },
});

/** A1 rol yapma sahnesi (everyday track) — dersin practice fazı. */
export const A1_SCENE: SceneVariant = sceneVariantSchema.parse({
  persona: { name: "Mia", role: "a friendly new colleague at the office", mood: "cheerful", goal: "get to know the new person on the team" },
  scene: "First morning at a new job. Mia stops by the student's desk to say hi before the team meeting.",
  objective: "Introduce yourself to Mia and ask her name.",
  avatarOpening: "Hi there! I don't think we've met yet. Are you new on the team?",
});

/** A1 rol yapma sahnesi (travel track) — canlıda konu dışına sapan sahne (10 Kas 2026). */
export const A1_SCENE_TRAVEL: SceneVariant = sceneVariantSchema.parse({
  persona: { name: "Marta", role: "another traveller at the gate", mood: "relaxed", goal: "to pass the time before boarding" },
  scene: "You are waiting at an airport gate next to another traveller.",
  objective: "Introduce yourself and start a short friendly conversation.",
  avatarOpening: "Excuse me, is this seat free?",
});

/**
 * Canlıdaki A1 "Hello, I'm…" dersinin GERÇEK çekirdeği (elle yazılan kaynaktan) —
 * rol yapma vakaları dersin gerçek hedefleriyle (my name is / nice to meet you /
 * how are you) sınanır; uydurma hedef sahneyle çelişip yanlış alarm üretiyordu.
 */
export const A1_HELLO: LessonCore = lessonCoreSchema.parse(
  buildCore(A1_AUTHORED.find((a) => a.id === "a1-hello-im")!, {
    focus: "greeting someone and introducing yourself",
    mustUse: ["nice to meet you", "my name is", "how are you"],
  }),
);
