/** Test script'lerinin paylaştığı v6 ders içeriği kalıbı.
 *  Tek yerde durur ki format değişince dört script tek tek elden geçmesin.
 *  DİKKAT: içerikte öğrenci adı YOKTUR — ders kullanıcıdan bağımsızdır. */
import { CONTENT_FORMAT, CORE_FORMAT, SCENE_FORMAT, TRACKS, type LessonContent, type LessonCore } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client.js";
import {
  catalogLessons,
  catalogUnits,
  lessonCores,
  lessonProgress,
  lessonSceneSets,
  sessions,
  userProfiles,
} from "../src/db/schema.js";
import { LESSON_CORE_VERSION } from "../src/modules/llm/prompts/lesson-core.v1.js";
import { LESSON_SCENES_VERSION } from "../src/modules/llm/prompts/lesson-scenes.v1.js";

export function makeLessonContent(over: Partial<LessonContent> = {}): LessonContent {
  return {
    formatVersion: CONTENT_FORMAT,
    title: "Test Dersi",
    topic: "test topic",
    focus: "Test focus",
    theme: "Test",
    objectives: ["Use the target structure in a short sentence.", "Recognise the target structure."],
    communicationGoal: "Talk about the topic using the target structure.",
    estMinutes: 5,
    tutorNotes: {
      target: "the target structure",
      commonErrors: ["dropping the auxiliary"],
      correction: "recast the sentence correctly",
    },
    lecture: {
      beats: [
        { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, name the topic, ask if ready to start" },
        {
          id: "b2",
          kind: "teach",
          introIntent: "announce that the explanation follows",
          points: ["Point one.", "Point two."],
        },
        { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
        { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
        {
          id: "b5",
          kind: "exercise",
          prompt: "Fill in the blank: I ___ it.",
          answers: ["did"],
          hint: "Example of what you can say: did",
        },
        {
          id: "b6",
          kind: "exercise",
          // Şıklar prompt'a GÖMÜLMEZ — istemci A) B) diye ekler ve seslendirir
          prompt: "Which is correct?",
          options: ["I did it.", "I do it yesterday."],
          answers: ["I did it.", "A"],
          hint: "Example of what you can say: A",
        },
      ],
    },
    practice: {
      introIntent: "praise the lecture work and announce a short role play",
      persona: { name: "Ann", role: "arkadaşın", goal: "find out what the student did" },
      scenario: "Sahne",
      userGoal: "Hedef",
      avatarOpening: "Hi there!",
      // Öğrencinin BİREBİR söyleyeceği parça olmalı — tek kelime ("did") artık
      // reddediliyor: her cümlede geçip sahneyi erken kapatıyordu.
      mustUse: ["I did it", "yesterday I did"],
      minTargetUses: 2,
      successCriteria: "The student uses the target structure naturally at least twice.",
      maxTurns: 4,
    },
    summary: "Özet.",
    ...over,
  };
}

// ---------------------------------------------------------------------------
// Katalog + paylaşımlı içerik fixture'ı
//
// Müfredat artık sabit katalogdan geliyor; test script'leri eskiden `programs` +
// `program_lessons` + `lessons` üçlüsünü elle basıyordu. O üçlü yerine tek bir
// katalog satırı ve ona bağlı PAYLAŞIMLI bir içerik satırı yeter.
// ---------------------------------------------------------------------------

const TEST_UNIT_ID = "zz-test-u01";
const TEST_LESSON_ID = "zz-test-lesson";
export const TEST_SPEC_HASH = "testhash0001";

/**
 * Testler için gerçek katalogla çakışmayan ("zz-") bir ders satırı açar.
 * `slot` verilirse birden fazla test dersi açılabilir (ör. ilerleme testleri).
 */
export async function seedTestCatalogLesson(over: { level?: string; kind?: string; slot?: number } = {}) {
  const level = over.level ?? "A2";
  const slot = over.slot ?? 1;
  const lessonId = slot === 1 ? TEST_LESSON_ID : `${TEST_LESSON_ID}-${slot}`;

  await db
    .insert(catalogUnits)
    .values({
      id: TEST_UNIT_ID,
      level,
      unitIndex: 99,
      title: "Test Unit",
      goal: "Verify the lesson flow end to end",
    })
    .onConflictDoUpdate({ target: catalogUnits.id, set: { level, updatedAt: new Date() } });

  const [row] = await db
    .insert(catalogLessons)
    .values({
      id: lessonId,
      unitId: TEST_UNIT_ID,
      level,
      position: 990 + slot,
      unitIndex: 99,
      kind: over.kind ?? "grammar",
      title: `Test Lesson ${slot}`,
      focus: "Test focus",
      themeHint: "a short test scene",
      targetPhrases: ["I did it", "yesterday I did"],
      specHash: TEST_SPEC_HASH,
    })
    .onConflictDoUpdate({
      target: catalogLessons.id,
      // status geri "active" yazılır: seed-curriculum katalogda olmayan zz- satırlarını
      // emekliye ayırıyor; test bir sonraki koşuda dersini yeniden canlandırabilmeli.
      set: { level, unitId: TEST_UNIT_ID, specHash: TEST_SPEC_HASH, status: "active", updatedAt: new Date() },
    })
    .returning();

  return row!;
}

/** v6 fixture içeriğini v7 çekirdeğe çevirir — eski script'ler değişmeden çalışsın diye. */
function contentToCore(content: LessonContent): LessonCore {
  let pointSeq = 0;
  const beats: LessonCore["lecture"]["beats"] = content.lecture.beats.map((b) => {
    switch (b.kind) {
      case "say":
        return { id: b.id, kind: "say", intent: b.intent };
      case "ask":
        return { id: b.id, kind: "ask", purpose: b.purpose, intent: b.intent };
      case "teach":
        return {
          id: b.id,
          kind: "teach",
          introIntent: b.introIntent,
          points: [
            {
              id: `p${++pointSeq}`,
              formEn: content.topic,
              claimsEn: b.points.map((p) => p.replaceAll("**", "")),
              examples: [{ id: `p${pointSeq}e1`, textEn: `Example: ${content.topic}.` }],
            },
          ],
        };
      case "exercise": {
        const isFill = b.prompt.includes("___");
        const item = b.prompt.replace(/^Fill in the blank:\s*/i, "");
        return {
          id: b.id,
          kind: "exercise",
          format: b.options?.length ? "mcq" : isFill ? "fill_blank" : "say_sentence",
          item,
          options: b.options,
          answerSpec: b.options?.length
            ? { kind: "choice", correctIndex: Math.max(0, b.options.findIndex((o) => b.answers.includes(o))) }
            : isFill
              ? { kind: "token", accepted: b.answers }
              : { kind: "utterance", accepted: b.answers, contractionsAllowed: true },
          exampleAnswer: b.answers[0]!,
        };
      }
      case "open_response":
        return {
          id: b.id,
          kind: "open_response",
          question: b.prompt,
          rubric: b.rubric,
          exampleAnswer: b.hint.replace(/^Example of what you can say:\s*/i, ""),
          maxAttempts: b.maxAttempts,
        };
    }
  });

  return {
    coreFormat: CORE_FORMAT,
    topic: content.topic,
    focus: content.focus,
    objectives: content.objectives,
    communicationGoal: content.communicationGoal,
    estMinutes: content.estMinutes,
    tutorNotes: { target: content.tutorNotes.target, correctionStyle: content.tutorNotes.correction },
    summary: "You practised the target structure.",
    lecture: { beats },
    practice: {
      mustUse: content.practice.mustUse,
      minTargetUses: content.practice.minTargetUses,
      successCriteria: content.practice.successCriteria,
      maxTurns: content.practice.maxTurns,
    },
  };
}

/**
 * v7: katalog dersine YAYINLANMIŞ çekirdek + sahne seti bağlar (v6 fixture
 * içeriğinden türetilir). Eski script'ler imza değişmeden çalışır. Profiller
 * testlerde İngilizce moddadır (aşağıda) — dil paketi gerekmez, LLM'e gidilmez.
 */
export async function seedTestContent(opts: {
  userId: string;
  catalogLessonId: string;
  content: LessonContent;
}) {
  const core = contentToCore(opts.content);

  const coreValues = {
    catalogLessonId: opts.catalogLessonId,
    coreFormat: CORE_FORMAT,
    promptVersion: LESSON_CORE_VERSION,
    specHash: TEST_SPEC_HASH,
    status: "published" as const,
    core,
  };
  const [coreRow] = await db
    .insert(lessonCores)
    .values(coreValues)
    .onConflictDoUpdate({
      target: [lessonCores.catalogLessonId, lessonCores.coreFormat, lessonCores.promptVersion, lessonCores.specHash],
      set: { status: "published", core, updatedAt: new Date() },
    })
    .returning();

  const p6 = opts.content.practice;
  const variant = {
    persona: { name: p6.persona.name, role: "a friendly acquaintance", goal: p6.persona.goal },
    scene: "A short everyday conversation to practise the target.",
    objective: "Use the target structure naturally in conversation.",
    avatarOpening: p6.avatarOpening.endsWith("?") ? p6.avatarOpening : `${p6.avatarOpening} How are you today?`,
  };
  const scenes = Object.fromEntries(TRACKS.map((t) => [t, variant]));
  const [sceneRow] = await db
    .insert(lessonSceneSets)
    .values({
      coreId: coreRow!.id,
      sceneFormat: SCENE_FORMAT,
      promptVersion: LESSON_SCENES_VERSION,
      status: "published",
      scenes,
    })
    .onConflictDoUpdate({
      target: [lessonSceneSets.coreId, lessonSceneSets.sceneFormat, lessonSceneSets.promptVersion],
      set: { status: "published", scenes, updatedAt: new Date() },
    })
    .returning();

  return { id: coreRow!.id, coreId: coreRow!.id, sceneSetId: sceneRow!.id };
}

/** Test kullanıcısının profilini kurar (katalog sorguları profile bakar). */
export async function seedTestProfile(opts: {
  userId: string;
  displayName?: string;
  nativeLanguage?: string;
  cefrLevel?: string;
  track?: string;
  tutorLanguage?: "native" | "english";
}) {
  const values = {
    userId: opts.userId,
    displayName: opts.displayName ?? "Saeb",
    nativeLanguage: opts.nativeLanguage ?? "tr",
    cefrLevel: opts.cefrLevel ?? "A2",
    track: opts.track ?? "work",
    // Testler İngilizce modda koşar: dil paketi gerekmez → beklenmedik LLM çağrısı yok.
    // Native mod davranışını slice-e2e.ts sınıyor.
    tutorLanguage: opts.tutorLanguage ?? "english",
    dailyGoalMinutes: 10,
    interests: ["technology"],
  };
  await db
    .insert(userProfiles)
    .values(values)
    .onConflictDoUpdate({ target: userProfiles.userId, set: { ...values, updatedAt: new Date() } });
}

/** v2 script değerleri RichText — eski string temelli testler için düzleştirici. */
export function runsText(runs: Array<{ lang: string; text: string }> | "" | undefined | null): string {
  return Array.isArray(runs) ? runs.map((r) => r.text).join(" ") : "";
}

/** Oturum/ilerleme artıklarını siler; katalog satırı paylaşımlı olduğu için KALIR. */
export async function cleanupTestUser(userId: string) {
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
}
