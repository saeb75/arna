/** Rol yapma başarı ölçümü: kesin eşleşme + anlamsal emniyet ağı.
 *
 *  Canlı açık (ikinci görüş, Ağu 2026): sayaç YALNIZCA regex kesin eşleşmesiydi.
 *  Hedef "I'm twenty five" iken öğrenci "I'm thirty-two years old" derse doğru
 *  konuşmasına rağmen sahne başarısız sayılıyordu. Artık aynı sohbet çağrısı
 *  yapısal `usedTarget` + `evidence` döndürüyor; kanıt öğrencinin sözünde
 *  geçmiyorsa sayılmıyor (uydurma kanıt ve hocanın kendi cümlesi elenir).
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-practice-goal.ts` */
import { eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { sessions, userProfiles } from "../src/db/schema.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson, seedTestContent } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000021";

let fail = 0;
const check = (label: string, cond: boolean, detail = "") => {
  if (!cond) fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const content = makeLessonContent({
  title: "Test",
  topic: "talking about how long you have lived somewhere",
  focus: "present perfect with for and since",
  theme: "Test",
  objectives: ["Say how long you have lived somewhere.", "Ask someone the same."],
  communicationGoal: "Say how long you have done something.",
  tutorNotes: { target: "present perfect with for and since", commonErrors: ["using present simple"], correction: "recast" },
  practice: {
    introIntent: "praise and announce a short role play",
    persona: { name: "Sophie", role: "komşun", goal: "get to know the new neighbour" },
    scenario: "Sahne",
    userGoal: "Hedef",
    avatarOpening: "Hi! I don't think we've met. Are you new in the building?",
    // Hedef SABİT bir süre dayatıyor — öğrenci başka bir süre söylerse kesin
    // eşleşme tutmaz; ölçümün anlamsal ayağı tam da bunun için var.
    mustUse: ["I've lived here", "for three years"],
    minTargetUses: 2,
    successCriteria: "The learner says how long they have lived somewhere.",
    maxTurns: 8,
  },
});

await sql`delete from user_profiles where user_id = ${testUserId}`;
await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Test", nativeLanguage: "tr",
  cefrLevel: "A2", track: "everyday", dailyGoalMinutes: 10, interests: ["technology"],
});
const lesson = await seedTestCatalogLesson({ level: "A2", slot: 5 });
await seedTestContent({ userId: testUserId, catalogLessonId: lesson.id, content });
const { sessionId } = await openSession(testUserId, lesson.id);

const hitTurns = async (): Promise<number[]> => {
  const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return ((row?.state as { practice?: { hitTurns?: number[] } } | null)?.practice?.hitTurns ?? []).sort();
};

console.log("\n=== ROL YAPMA HEDEF SAYIMI ===");

// Tur 0: konu dışı — hedef yok
await chatTurn(testUserId, sessionId, "Hello! Nice weather today.", { phase: "practice", turnIndex: 0 });
check("konu dışı tur sayılmıyor", (await hitTurns()).length === 0, JSON.stringify(await hitTurns()));

// Tur 1: hedefi KENDİ SÖZLERİYLE söylüyor — kesin eşleşme TUTMAZ ("for three years" değil)
const r1 = await chatTurn(testUserId, sessionId, "I have lived in this building for about six years now.", {
  phase: "practice", turnIndex: 1,
});
console.log("[öğrenci] I have lived in this building for about six years now.");
console.log("[Emma]   ", r1.text);
check("kendi sözleriyle hedef → ANLAMSAL olarak sayıldı", (await hitTurns()).includes(1), JSON.stringify(await hitTurns()));

// Tur 2: kesin eşleşme yolu hâlâ çalışıyor
await chatTurn(testUserId, sessionId, "I've lived here since I was a child.", { phase: "practice", turnIndex: 2 });
check("kesin eşleşme yolu çalışıyor", (await hitTurns()).includes(2), JSON.stringify(await hitTurns()));

// Tur 3: yine konu dışı — sayı ARTMAMALI
const before = (await hitTurns()).length;
await chatTurn(testUserId, sessionId, "Sorry, what was your name again?", { phase: "practice", turnIndex: 3 });
check("konu dışı tur sayıyı artırmıyor", (await hitTurns()).length === before, JSON.stringify(await hitTurns()));

// Tur 4: taban tur sayısı doldu + 2 hedef var → sahne kapanmalı
const r4 = await chatTurn(testUserId, sessionId, "I've lived here for a long time, actually.", {
  phase: "practice", turnIndex: 4,
});
check("hedef tutturuldu ve taban aşıldı → sahne kapanıyor", r4.segmentDone === true, `segmentDone=${r4.segmentDone}`);

// Aynı turu TEKRAR göndermek (aktarım hatası senaryosu) sayıyı bozmamalı
const beforeRetry = (await hitTurns()).length;
await chatTurn(testUserId, sessionId, "I've lived here for a long time, actually.", {
  phase: "practice", turnIndex: 4,
});
check("aynı tur iki kez işlenirse sayı artmıyor", (await hitTurns()).length === beforeRetry, JSON.stringify(await hitTurns()));

console.log(`\nsayılan turlar: ${JSON.stringify(await hitTurns())}`);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
