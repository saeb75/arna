/** Faz 7.3 doğrulama: açık uçlu cevap rubrikle değerlendirilir.
 *  `answers[]` ile ölçülemeyen ("kendi cümleni kur") adımlar için.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-open-response.ts` */
import { db, sql } from "../src/db/client.js";
import { userProfiles } from "../src/db/schema.js";
import { lintLesson } from "../src/modules/lesson/lint.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson , seedTestContent} from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000011";

const check = (label: string, ok: boolean, detail = "") =>
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);

const content = makeLessonContent({
  title: "Deneyimlerden Bahsetme",
  topic: "present perfect for experience",
  focus: "Present Perfect — Have you ever...?",
  theme: "İş deneyimlerini anlatma",
  objectives: ["Ask about experiences with Have you ever.", "Answer with I have / I have never."],
  communicationGoal: "Talk about work experiences without saying when they happened.",
  tutorNotes: {
    target: "Present Perfect for experience (have/has + past participle)",
    commonErrors: ["using the past simple with 'ever'"],
    correction: "recast with have/has + past participle",
  },
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, say today is about talking about experiences, ask if ready" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation of the present perfect for experience", points: ["Use **have/has + past participle** for experiences.", "Do not say when it happened."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
      { id: "b5", kind: "exercise", prompt: "Fill in the blank: I have ___ (work) with a remote team.", answers: ["worked"], hint: "Example of what you can say: worked" },
      // Şıklar prompt'a GÖMÜLMEZ — istemci onları A) B) diye ekler ve seslendirir
      { id: "b6", kind: "exercise", prompt: "Which is correct?", options: ["Have you ever worked remotely?", "Did you ever worked remotely?"], answers: ["Have you ever worked remotely?", "A"], hint: "Example of what you can say: A" },
      {
        id: "b7",
        kind: "open_response",
        prompt: "Now tell me about yourself: have you ever worked with a team in another country?",
        rubric: {
          // rubric.mustUse AYRI bir alan: yalnızca model okur, metin eşleşmesi yok.
          // Burada gramer tarifi doğru olan; lint kuralı practice.mustUse'a özgü.
          mustUse: ["have / has + past participle"],
          criteria: "The answer is about the student's own experience and uses the present perfect correctly, in any form (I have..., I have never..., No, but I have...).",
        },
        hint: "Example of what you can say: Yes, I have worked with a team in Germany.",
        maxAttempts: 2,
      },
    ],
  },
});

await sql`delete from user_profiles where user_id = ${testUserId}`;

await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage: "tr",
  cefrLevel: "B1", track: "work", dailyGoalMinutes: 10,
  occupation: "backend developer", interests: ["technology"],
});
const catalogLesson = await seedTestCatalogLesson({});
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content });

const report = lintLesson(content, { forbidden: ["Saeb"] });
check("lint temiz", report.errors.length === 0, report.errors.join("; "));

const { sessionId } = await openSession(testUserId, catalogLesson.id);

// 1) Beklenenden FARKLI ama doğru bir cevap — kabul edilmeli
//    (v5'te `answers[]` eşleşmesi bunu yanlış sayardı)
const a1 = await chatTurn(testUserId, sessionId, "No, but I have worked with clients in Germany.", {
  phase: "lecture", beatId: "b7", attempt: 0,
});
console.log("\n[öğrenci] No, but I have worked with clients in Germany.");
console.log("[Emma]", a1.text);
check("beklenmedik ama doğru cevap KABUL edildi", a1.beatDone === true, `beatDone=${a1.beatDone}`);

// 2) Hedef yapıyı kullanmayan cevap — reddedilip tekrar sorulmalı
const { sessionId: s2 } = await openSession(testUserId, catalogLesson.id);
const b1 = await chatTurn(testUserId, s2, "Yes, last year I worked with a team in Berlin.", {
  phase: "lecture", beatId: "b7", attempt: 0,
});
console.log("\n[öğrenci] Yes, last year I worked with a team in Berlin.  (past simple — hedef değil)");
console.log("[Emma]", b1.text);
check("hedef yapı yoksa REDDEDİLDİ", b1.beatDone === false, `beatDone=${b1.beatDone}`);

// 3) Son deneme: yanlış olsa bile akış TIKANMAZ (karar kodda, modelde değil)
const b2 = await chatTurn(testUserId, s2, "I don't know.", {
  phase: "lecture", beatId: "b7", attempt: 1,
});
console.log("\n[öğrenci] I don't know.  (son deneme)");
console.log("[Emma]", b2.text);
check("son denemeden sonra adım kapanıyor (akış tıkanmıyor)", b2.beatDone === true, `beatDone=${b2.beatDone}`);
check("son denemede hoca doğrusunu söylüyor, tekrar sormuyor", !/\?\s*$/.test(b2.text.trim()), b2.text);

// ---------------------------------------------------------------------------
// 4) CANLI HATA: rubric.mustUse BİREBİR şart sanılıyordu
//
// Ders 3. tekil -s öğretiyor, rubric örnekleri "she works / he lives". Öğrenci
// "my brother has a lot of work at home" dedi — bu hedefin ta kendisi (has = -s),
// ama reddedildi ve üstüne "'He works' demelisin" diye YANLIŞ düzeltme verildi.
// Örnekler artık kontrol listesi değil, hedefin örneği olarak sunuluyor.
// ---------------------------------------------------------------------------
console.log("\n=== HEDEFİ KENDİ SÖZLERİYLE KULLANAN CEVAP ===");
const thirdPerson = makeLessonContent({
  title: "Test",
  topic: "present simple third person -s",
  focus: "present simple: third person -s",
  theme: "Test",
  objectives: ["Add -s after he, she and it.", "Describe what someone does."],
  communicationGoal: "Say what someone in your family does every day.",
  tutorNotes: {
    target: "present simple with -s after he, she and it",
    commonErrors: ["forgetting the -s"],
    correction: "recast with the -s form",
  },
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, name the topic, ask if ready" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation", points: ["Add **-s** after he, she and it."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce the questions" },
      { id: "b5", kind: "exercise", prompt: "Fill in the blank: She ___ in a hospital.", answers: ["works"], hint: "Example: works" },
      { id: "b6", kind: "exercise", prompt: "Fill in the blank: He ___ near the office.", answers: ["lives"], hint: "Example: lives" },
      {
        id: "b7",
        kind: "open_response",
        prompt: "Describe what someone in your family does every day. Use he or she.",
        // Gerçek A1 dersindeki gibi BİREBİR kalıplar — hata tam buradan çıkmıştı
        rubric: { mustUse: ["she works", "he lives"], criteria: "The answer describes a routine using the -s form after he, she or it." },
        hint: "Example of what you can say: She works in a hospital.",
        maxAttempts: 2,
      },
    ],
  },
});
const lesson3 = await seedTestCatalogLesson({ level: "A1", slot: 6 });
await seedTestContent({ userId: testUserId, catalogLessonId: lesson3.id, content: thirdPerson });
const { sessionId: s3 } = await openSession(testUserId, lesson3.id);

const c1 = await chatTurn(testUserId, s3, "my brother has a lot of work at home", {
  phase: "lecture", beatId: "b7", attempt: 0,
});
console.log("\n[öğrenci] my brother has a lot of work at home  (hedef: 3. tekil -s)");
console.log("[Emma]", c1.text);
check("hedefi farklı özne/fiille kullanan cevap KABUL edildi", c1.beatDone === true, `beatDone=${c1.beatDone}`);

const { sessionId: s4 } = await openSession(testUserId, lesson3.id);
const c2 = await chatTurn(testUserId, s4, "I like pizza very much", { phase: "lecture", beatId: "b7", attempt: 0 });
console.log("\n[öğrenci] I like pizza very much  (hedef yapı YOK)");
console.log("[Emma]", c2.text);
check("hedefi hiç kullanmayan cevap REDDEDİLDİ", c2.beatDone === false, `beatDone=${c2.beatDone}`);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log("\ntemizlendi.");
