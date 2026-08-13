/** Faz 6.1/6.2 doğrulama: Lecture akışı (ask/exercise bağlamları), practice tur sınırı,
 *  çeviri hedefi ve dil bağımsızlığı. Elle yazılmış ders içeriğiyle çalışır (üretim yok).
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-lecture-flow.ts`
 *  Ortam değişkeni ile ana dili değiştir:  NATIVE=es npx tsx scripts/test-lecture-flow.ts
 */
import { db, sql } from "../src/db/client.js";
import { userProfiles } from "../src/db/schema.js";
import { chatTurn, openSession, translate } from "../src/modules/session/service.js";
import { lintLesson } from "../src/modules/lesson/lint.js";
import { makeLessonContent, seedTestCatalogLesson, seedTestContent } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000006";
const nativeLanguage = process.env.NATIVE ?? "tr";

/** v6: beat'ler NİYET taşır, hocanın cümleleri oturum script'inde üretilir */
const lesson = makeLessonContent({
  title: "Geçmiş Zaman I",
  topic: "past simple (regular verbs)",
  focus: "Past Simple — regular verbs (-ed)",
  theme: "Dünkü işleri anlatma",
  objectives: ["Describe finished actions using regular past simple verbs.", "Form the -ed past of regular verbs."],
  communicationGoal: "Tell a colleague what you did yesterday.",
  tutorNotes: {
    target: "regular past simple (-ed)",
    commonErrors: ["using the present form after a past time marker (I go yesterday)"],
    correction: "recast with the -ed form",
  },
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, say today is about talking about finished past actions, ask if ready" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation of regular past verbs", points: ["Add **-ed** to regular verbs: work becomes worked.", "Use it for finished actions in the past."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
      { id: "b5", kind: "exercise", prompt: "Fill in the blank: Yesterday, I ___ (finish) the report.", answers: ["finished"], hint: "Yesterday, I finished the report." },
      { id: "b6", kind: "exercise", prompt: "Which is correct?", options: ["I worked late.", "I work late yesterday."], answers: ["I worked late.", "A"], hint: "Example of what you can say: A" },
    ],
  },
  practice: {
    introIntent: "praise the lecture work and announce a short role play at a morning meeting",
    persona: { name: "Mark", role: "takım lideri", mood: "friendly", goal: "find out what the student worked on yesterday" },
    scenario: "Sabah toplantısında dün yaptıklarını anlatıyorsun",
    userGoal: "Dün bitirdiğin işleri geçmiş zamanla anlat",
    avatarOpening: "Morning! So, what did you work on yesterday?",
    mustUse: ["I finished", "I worked on", "I started"],
    // Tur tavanı 4; hedef 2 kullanımda karşılanmalı → sahne tavana GELMEDEN kapanmalı
    minTargetUses: 2,
    successCriteria: "The student reports at least two finished tasks using -ed verbs.",
    maxTurns: 4,
  },
  summary: "Bugün düzenli fiillerle geçmiş zamanı öğrendin.",
});

await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage,
  cefrLevel: "A2", track: "work", dailyGoalMinutes: 10,
  occupation: "developer", interests: ["technology"],
});
const catalogLesson = await seedTestCatalogLesson({});
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content: lesson });

console.log(`ana dil: ${nativeLanguage}\n`);

// 0) Lint — dil-bağımsız ASCII kuralı
const report = lintLesson(lesson, { forbidden: ["Saeb"] });
console.log("LINT hata:", report.errors.length ? report.errors : "yok ✅");
console.log("LINT uyarı:", report.warnings.length ? report.warnings : "yok");

const { sessionId } = await openSession(testUserId, catalogLesson.id);

// 1) ask beat'ine GERÇEK soru → kısa cevap, yeni soru sormamalı
const q = await chatTurn(testUserId, sessionId, "What does 'finished' mean?", {
  phase: "lecture", beatId: "b3",
});
console.log("\n[ask] öğrenci: What does 'finished' mean?");
console.log("      Emma:", q.text);
console.log("      soruyla mı bitiyor:", /\?\s*$/.test(q.text) ? "EVET → istemci bekler" : "hayır → akış ilerler");

// 2) exercise'a YANLIŞ cevap → düzeltip yeniden sormalı
const wrong = await chatTurn(testUserId, sessionId, "I finish it", {
  phase: "lecture", beatId: "b5", attempt: 0,
});
console.log("\n[exercise] öğrenci (yanlış): I finish it");
console.log("      Emma:", wrong.text);

// 3) BAŞARI ÖLÇÜTÜ (deterministik, modele sorulmaz): hedef yapı minTargetUses (2)
//    kez üretilince sahne, tur tavanına (4) gelmeden kapanmalı.
const p1 = await chatTurn(testUserId, sessionId, "I worked on the login page.", { phase: "practice", turnIndex: 0 });
console.log("\n[tur 1 · 1 hedef kullanımı] segmentDone:", p1.segmentDone, !p1.segmentDone ? "✅" : "❌ erken kapandı");
const p2 = await chatTurn(testUserId, sessionId, "I also finished the tests.", { phase: "practice", turnIndex: 1 });
console.log("[tur 2 · 2 hedef kullanımı] segmentDone:", p2.segmentDone, !p2.segmentDone ? "✅ hedef tuttu ama sahne KESİLMİYOR" : "❌ konuşmanın ortasında kapandı");
const p4 = await chatTurn(testUserId, sessionId, "I started the new module too.", { phase: "practice", turnIndex: 3 });
console.log("[tur 4 · hedef karşılandı] segmentDone:", p4.segmentDone, p4.segmentDone ? "✅ doğal noktada kapandı" : "❌");

// 4) Çeviri — kullanıcının ANA DİLİNE
const tr = await translate(testUserId, sessionId, "Yesterday I finished the report.");
console.log(`\n[çeviri → ${nativeLanguage}]:`, tr.text);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql.end();
