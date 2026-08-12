/** Faz 6.3 doğrulama: lecture alıştırması → practice roleplay geçişinde bağlam sızıntısı
 *  olmamalı. Bug: roleplay ortasında Emma eski çoktan-seçmeliyi cevaplıyordu.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-phase-isolation.ts` */
import { asc, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { transcriptTurns, userProfiles } from "../src/db/schema.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson, seedTestContent } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000007";

const lesson = makeLessonContent({
  title: "Kibar İstekler",
  topic: "polite requests",
  focus: "Polite requests — Would you mind + -ing / Could you…",
  theme: "Müşteriden ek bilgi isteme",
  objectives: ["Make a polite request using Would you mind + -ing.", "Soften a request with Could you."],
  communicationGoal: "Ask a colleague or client for something politely.",
  tutorNotes: {
    target: "Would you mind + -ing / Could you + base verb",
    commonErrors: ["using the bare imperative"],
    correction: "recast the request in the polite form",
  },
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, say today is about polite requests, ask if ready" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation of polite request forms", points: ["Use **Would you mind** + -ing for a polite request.", "Use **Could you** + base verb for a simple polite request."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
      { id: "b5", kind: "exercise", prompt: "Which is more polite? A) Give me the details. B) Would you mind sharing the details?", options: ["Give me the details.", "Would you mind sharing the details?"], answers: ["Would you mind sharing the details?", "B"], hint: "Example of what you can say: B" },
      { id: "b6", kind: "exercise", prompt: "Fill in the blank: ___ you send me the report?", answers: ["Could", "Would"], hint: "Example of what you can say: Could" },
    ],
  },
  practice: {
    introIntent: "praise the lecture work and announce a role play where the student needs more information from a client",
    persona: { name: "Client", role: "müşterin", mood: "busy", goal: "move the project forward quickly" },
    scenario: "Bir müşteriyle proje taslağı hakkında konuşuyorsun",
    userGoal: "Müşteriden kibarca ek bilgi iste",
    avatarOpening: "Hi! I sent you the first draft of the project. Do you have any questions?",
    mustUse: ["Would you mind", "Could you"],
    minTargetUses: 2,
    successCriteria: "The student makes at least two polite requests using the target forms.",
    maxTurns: 4,
  },
  summary: "Bugün kibar istek kalıplarını öğrendin.",
});

await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage: "tr",
  cefrLevel: "A2", track: "business", dailyGoalMinutes: 10,
  occupation: "developer", interests: ["technology"],
});
const catalogLesson = await seedTestCatalogLesson({});
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content: lesson });

const { sessionId } = await openSession(testUserId, catalogLesson.id);

// 1) LECTURE: alıştırmaya yanlış cevap → geçmişe "correct choice / B)" dili girer
const w1 = await chatTurn(testUserId, sessionId, "Give me the details", { phase: "lecture", beatId: "b5", attempt: 0 });
console.log("[lecture/exercise yanlış] Emma:", w1.text);
const w2 = await chatTurn(testUserId, sessionId, "I don't know", { phase: "lecture", beatId: "b5", attempt: 1 });
console.log("[lecture/exercise 2. yanlış] Emma:", w2.text);

// 2) PRACTICE: kullanıcı "no" der — Emma SAHNEDE kalmalı, alıştırmaya dönmemeli
const p1 = await chatTurn(testUserId, sessionId, "no", { phase: "practice", turnIndex: 0 });
console.log("\n[practice] öğrenci: no");
console.log("[practice] Emma:", p1.text);

const leak = /correct (choice|answer)|option [ABC]\b|\b[ABC]\)/i.test(p1.text);
console.log("\nSIZINTI KONTROLÜ:", leak ? "❌ alıştırma diline döndü" : "✅ sahnede kaldı");

// 3) transcript_turns faz etiketleri
const turns = await db.select().from(transcriptTurns)
  .where(eq(transcriptTurns.sessionId, sessionId)).orderBy(asc(transcriptTurns.id));
const counts = turns.reduce<Record<string, number>>((a, t) => {
  const k = t.phase ?? "(boş)";
  a[k] = (a[k] ?? 0) + 1;
  return a;
}, {});
console.log("transcript faz etiketleri:", counts);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql.end();
