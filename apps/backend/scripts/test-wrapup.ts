/** Faz 7.7 doğrulama: hoca güdümlü kapanış.
 *
 *  İstenen: practice bitince Emma rol karakterinden ÇIKAR, dersi özetler ve
 *  "sormak istediğin bir şey var mı?" der. Ders KENDİLİĞİNDEN bitmez — tek çıkış
 *  "Dersi Bitir" butonudur.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-wrapup.ts` */
import { db, sql } from "../src/db/client.js";
import { lessons, programLessons, programs, userProfiles } from "../src/db/schema.js";
import { fallbackScript } from "../src/modules/session/script.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000013";

let fail = 0;
const check = (label: string, cond: boolean, detail = "") => {
  if (!cond) fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const content = makeLessonContent({
  title: "Deneyimlerden Bahsetme",
  topic: "present perfect for experience",
  focus: "Present Perfect — Have you ever...?",
  theme: "İş deneyimleri",
  objectives: ["Ask about experiences with Have you ever.", "Answer with I have never."],
  communicationGoal: "Talk about work experiences without saying when.",
  tutorNotes: {
    target: "have/has + past participle",
    commonErrors: ["using the past simple with 'ever'"],
    correction: "recast with have/has + past participle",
  },
  practice: {
    introIntent: "praise the lecture work and announce a short role play",
    persona: { name: "Daniel", role: "iş arkadaşın", mood: "curious", goal: "learn about the student's experience" },
    scenario: "Yeni bir iş arkadaşıyla tanışıyorsun",
    userGoal: "Deneyimlerini anlat",
    avatarOpening: "Hi! Have you ever worked on an international project?",
    mustUse: ["have you ever", "I have never", "I've worked"],
    minTargetUses: 2,
    successCriteria: "The student asks and answers about experience using the present perfect.",
    maxTurns: 8,
  },
});

await sql`delete from programs where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;

await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage: "tr",
  cefrLevel: "B1", track: "business", dailyGoalMinutes: 10,
  occupation: "backend developer", interests: ["technology"],
});
const [program] = await db.insert(programs)
  .values({ userId: testUserId, track: "business", level: "B1", status: "ready" }).returning();
const [pl] = await db.insert(programLessons)
  .values({ programId: program!.id, position: 1, title: content.title, focus: content.focus, theme: content.theme }).returning();
await db.insert(lessons)
  .values({ programLessonId: pl!.id, userId: testUserId, status: "ready", content });

const { sessionId, script } = await openSession(testUserId, pl!.id);

// --- 1) Kapanış cümleleri üretildi mi? --------------------------------------

console.log("\n=== KAPANIŞ CÜMLELERİ ===");
console.log(`  [kapanış] ${script?.wrapup}`);
console.log(`  [veda]    ${script?.farewell}`);

check("kapanış cümlesi üretildi", !!script?.wrapup);
check(
  "kapanış soruyla bitiyor (öğrenci cevap verebilsin)",
  /\?\s*$/.test((script?.wrapup ?? "").trim()),
  script?.wrapup,
);
// Not: "dersin bittiğini söylüyor mu" ANAHTAR KELİMEYLE denetlenmiyor. Denendi ve
// kırıldı: Emma "That was a wonderful lesson!" dediğinde liste yakalamadı, oysa
// cümle tam olarak bunu söylüyordu. Modelin düzyazısını kelime arayarak sınamak,
// akış kontrolünde ayıkladığımız kırılganlığın aynısı — o iş prompt'un sorumluluğu.
// Burada YAPISAL ve kararlı olan sınanır.
check(
  "kapanış rol karakterine dönmüyor",
  !(script?.wrapup ?? "").includes(content.practice.persona.name),
  script?.wrapup,
);
check(
  "kapanış makul uzunlukta (2-3 cümle)",
  (script?.wrapup ?? "").length >= 40 && (script?.wrapup ?? "").length <= 260,
  `${(script?.wrapup ?? "").length} karakter`,
);
check("veda cümlesi üretildi", !!script?.farewell);
check(
  "vedada soru YOK (ders zaten bitmiyor, buton bekliyor)",
  !(script?.farewell ?? "").includes("?"),
  script?.farewell,
);

// --- 2) Sahne bitmeden ders bitmiyor: practice erken kapanmamalı ------------

console.log("\n=== SAHNE UZUNLUĞU ===");
const p1 = await chatTurn(testUserId, sessionId, "Yes, I have worked on a project in Germany.", {
  phase: "practice", turnIndex: 0,
});
const p2 = await chatTurn(testUserId, sessionId, "Have you ever worked abroad?", {
  phase: "practice", turnIndex: 1,
});
check("1. turda hedef geçse de sahne kapanmıyor", !p1.segmentDone, `segmentDone=${p1.segmentDone}`);
check("2. turda hedef 2 kez geçse de kapanmıyor", !p2.segmentDone, `segmentDone=${p2.segmentDone}`);
const p4 = await chatTurn(testUserId, sessionId, "I have never lived in another country.", {
  phase: "practice", turnIndex: 3,
});
check("4. turda hedef karşılandı → sahne kapanıyor", p4.segmentDone, `segmentDone=${p4.segmentDone}`);

// --- 3) Kapanış turu: hoca KARAKTERDEN ÇIKMIŞ olmalı ------------------------

console.log("\n=== KAPANIŞ TURU ===");
const w1 = await chatTurn(testUserId, sessionId, "Why can't I say 'I have seen him yesterday'?", {
  phase: "wrapup",
});
console.log("[öğrenci] Why can't I say 'I have seen him yesterday'?");
console.log("[Emma]   ", w1.text);

check("soru cevaplandı", w1.text.length > 0);
check(
  "hoca rol karakterine DÖNMÜYOR (persona adı geçmiyor)",
  !w1.text.includes("Daniel"),
  w1.text,
);
check(
  "başka sorusu var mı diye soruyor (sohbet devam eder)",
  /\?\s*$/.test(w1.text.trim()),
  w1.text,
);
check("kapanış turu dersi BİTİRMİYOR", !w1.segmentDone, `segmentDone=${w1.segmentDone}`);

const w2 = await chatTurn(testUserId, sessionId, "What about 'ever'?", { phase: "wrapup" });
console.log("\n[öğrenci] What about 'ever'?");
console.log("[Emma]   ", w2.text);
check("ikinci soru da cevaplanıyor (tavan yok)", w2.text.length > 0);
check("ikinci turda da ders bitmiyor", !w2.segmentDone, `segmentDone=${w2.segmentDone}`);

// --- 4) Yedek script de kapanışı kapsıyor -----------------------------------

const fb = fallbackScript(content, "Saeb");
check("yedek script'te kapanış var", !!fb.wrapup && fb.wrapup.includes("Saeb"));
check("yedek script'te veda var", !!fb.farewell && !fb.farewell.includes("?"));

await sql`delete from programs where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
