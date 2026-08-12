/** Test script'lerinin paylaştığı v6 ders içeriği kalıbı.
 *  Tek yerde durur ki format değişince dört script tek tek elden geçmesin.
 *  DİKKAT: içerikte öğrenci adı YOKTUR — ders kullanıcıdan bağımsızdır. */
import { CONTENT_FORMAT, type LessonContent } from "@arna/contracts";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client.js";
import {
  catalogLessons,
  catalogUnits,
  lessonContents,
  lessonProgress,
  sessions,
  userProfiles,
} from "../src/db/schema.js";
import { normalizeNativeLanguage } from "../src/lib/language.js";
import { LESSON_GEN_VERSION } from "../src/modules/llm/prompts/lesson-gen.v8.js";

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
      set: { level, unitId: TEST_UNIT_ID, specHash: TEST_SPEC_HASH, updatedAt: new Date() },
    })
    .returning();

  return row!;
}

/**
 * Katalog dersine PAYLAŞIMLI hazır içerik bağlar. Anahtar KULLANICININ
 * PROFİLİNDEN türetilir — servis de aynı şekilde arıyor, elle track/dil yazmak
 * sessiz bir "önbellek ıskası"na yol açardı. Anahtarın altı alanı da yazılır:
 * biri boş kalırsa unique index NULL'ları farklı sayar ve eşzamanlı üretim
 * koruması sessizce çöker.
 */
export async function seedTestContent(opts: {
  userId: string;
  catalogLessonId: string;
  content: LessonContent;
}) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, opts.userId))
    .limit(1);
  if (!profile) throw new Error("seedTestContent: önce seedTestProfile çağır");

  const values = {
    catalogLessonId: opts.catalogLessonId,
    nativeLanguage: normalizeNativeLanguage(profile.nativeLanguage),
    track: profile.track,
    formatVersion: CONTENT_FORMAT,
    promptVersion: LESSON_GEN_VERSION,
    specHash: TEST_SPEC_HASH,
    status: "ready" as const,
    content: opts.content,
  };

  const [row] = await db
    .insert(lessonContents)
    .values(values)
    .onConflictDoUpdate({
      target: [
        lessonContents.catalogLessonId,
        lessonContents.nativeLanguage,
        lessonContents.track,
        lessonContents.formatVersion,
        lessonContents.promptVersion,
        lessonContents.specHash,
      ],
      set: { status: "ready", content: opts.content, updatedAt: new Date() },
    })
    .returning();

  return row!;
}

/** Test kullanıcısının profilini kurar (katalog sorguları profile bakar). */
export async function seedTestProfile(opts: {
  userId: string;
  displayName?: string;
  nativeLanguage?: string;
  cefrLevel?: string;
  track?: string;
}) {
  const values = {
    userId: opts.userId,
    displayName: opts.displayName ?? "Saeb",
    nativeLanguage: opts.nativeLanguage ?? "tr",
    cefrLevel: opts.cefrLevel ?? "A2",
    track: opts.track ?? "business",
    dailyGoalMinutes: 10,
    interests: ["technology"],
  };
  await db
    .insert(userProfiles)
    .values(values)
    .onConflictDoUpdate({ target: userProfiles.userId, set: { ...values, updatedAt: new Date() } });
}

/** Oturum/ilerleme artıklarını siler; katalog satırı paylaşımlı olduğu için KALIR. */
export async function cleanupTestUser(userId: string) {
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
}
