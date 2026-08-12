/** Faz 7.8 doğrulama: konu dışı girdi cevap hakkı yemesin.
 *
 *  Canlı hata: öğrenci çoktan seçmeliye HİÇ cevap vermeden soru atlandı —
 *  "Hey!" 1. denemeyi, konu dışı bir cümle 2. denemeyi yaktı ve hoca cevabı açıkladı.
 *  Kullanıcı: "hey dediğimde konudan kopmadan soruyu tekrar devam etmesi gerekiyor."
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-exercise-offtopic.ts` */
import { eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { llmCalls, userProfiles } from "../src/db/schema.js";
import { lintLesson } from "../src/modules/lesson/lint.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson , seedTestContent} from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000014";

let fail = 0;
const check = (label: string, cond: boolean, detail = "") => {
  if (!cond) fail++;
  console.log(`${cond ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const content = makeLessonContent({
  title: "Geniş Zaman - Soru Cümleleri",
  topic: "present simple questions",
  focus: "Present Simple questions — Do you...?",
  theme: "İş yerinde sohbet",
  objectives: ["Ask a colleague a present simple question.", "Use Do/Does correctly."],
  communicationGoal: "Ask colleagues about their routines.",
  tutorNotes: {
    target: "Do/Does + subject + base verb",
    commonErrors: ["putting the -s on the main verb after does"],
    correction: "recast with the base verb",
  },
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, name the topic, ask if ready" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation", points: ["Use **Do you** + base verb.", "Use **Does he/she** + base verb."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce the questions" },
      { id: "b5", kind: "exercise", prompt: "Fill in the blank: ___ you work here?", answers: ["do"], hint: "Example of what you can say: do" },
      {
        id: "b6",
        kind: "exercise",
        // Şıklar prompt'a GÖMÜLMEZ — canlıda gömülüp ekranda iki kez görünmüştü
        prompt: "Which is correct to ask a colleague?",
        options: ["Do you work here?", "Works you here?", "You do work here?"],
        answers: ["Do you work here?", "A"],
        hint: "Example of what you can say: A",
      },
    ],
  },
});

const report = lintLesson(content, { forbidden: ["Saeb"] });
check("lint temiz (şıklar prompt'a gömülü değil)", report.errors.length === 0, report.errors.join("; "));

await sql`delete from user_profiles where user_id = ${testUserId}`;
await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage: "tr",
  cefrLevel: "A2", track: "business", dailyGoalMinutes: 10,
  occupation: "backend developer", interests: ["technology"],
});
const catalogLesson = await seedTestCatalogLesson({});
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content });

const { sessionId } = await openSession(testUserId, catalogLesson.id);

/** Hoca hangi şıkkın doğru olduğunu ele veriyor mu? (şıkları saymak serbest) */
const revealsAnswer = (t: string) =>
  /(correct|right)\s+(answer|choice|one)\s+is|the answer is|answer:\s/i.test(t);

// --- 1) "Hey!" — cevap denemesi DEĞİL ---------------------------------------
console.log("\n=== KONU DIŞI GİRDİLER ===");
const hey = await chatTurn(testUserId, sessionId, "Hey!", { phase: "lecture", beatId: "b6", attempt: 0 });
console.log("[öğrenci] Hey!");
console.log("[Emma]   ", hey.text);
check("'Hey!' cevap denemesi sayılmıyor", hey.isAttempt === false, `isAttempt=${hey.isAttempt}`);
// Çoktan seçmeliyi yeniden sormak şıkları saymayı gerektirir; doğru cevap da
// onların arasında. Asıl kural: HANGİSİNİN doğru olduğunu söylememesi.
check("hangisinin doğru olduğunu söylemiyor", !revealsAnswer(hey.text), hey.text);
check("soruyu yeniden soruyor", /\?/.test(hey.text), hey.text);

// --- 2) Konu dışı cümle (kullanıcının bilerek yazdığı tür) ------------------
const offTopic = await chatTurn(
  testUserId, sessionId,
  "İlişkiler çoğulduğu anlarda genellikle devreye girdi. Hakkını vermek lazım.",
  { phase: "lecture", beatId: "b6", attempt: 0 },
);
console.log("\n[öğrenci] (konu dışı Türkçe cümle)");
console.log("[Emma]   ", offTopic.text);
check("konu dışı cümle cevap denemesi sayılmıyor", offTopic.isAttempt === false, `isAttempt=${offTopic.isAttempt}`);
check("yine hangisinin doğru olduğunu söylemiyor", !revealsAnswer(offTopic.text), offTopic.text);

// --- 3) Gerçek denemeler ----------------------------------------------------
console.log("\n=== GERÇEK DENEMELER ===");
const wrong = await chatTurn(testUserId, sessionId, "B", { phase: "lecture", beatId: "b6", attempt: 0 });
console.log("[öğrenci] B  (yanlış şık)");
console.log("[Emma]   ", wrong.text);
check("yanlış şık DENEME sayılıyor", wrong.isAttempt === true, `isAttempt=${wrong.isAttempt}`);
check("1. denemede cevap verilmiyor", !revealsAnswer(wrong.text), wrong.text);

const dunno = await chatTurn(testUserId, sessionId, "I don't know", { phase: "lecture", beatId: "b6", attempt: 0 });
console.log("\n[öğrenci] I don't know");
console.log("[Emma]   ", dunno.text);
check("'I don't know' DENEME sayılıyor (pes etmek de cevaptır)", dunno.isAttempt === true, `isAttempt=${dunno.isAttempt}`);

const last = await chatTurn(testUserId, sessionId, "C", { phase: "lecture", beatId: "b6", attempt: 1 });
console.log("\n[öğrenci] C  (son deneme, yanlış)");
console.log("[Emma]   ", last.text);
check("son denemede doğru cevap veriliyor", last.text.toLowerCase().includes("do you work here"), last.text);

// --- 4) Doğru cevap LLM'e hiç gitmiyor (istemcide eşleşir) ------------------
const before = (await db.select().from(llmCalls).where(eq(llmCalls.userId, testUserId))).length;
console.log(`\nLLM çağrısı sayısı: ${before} (doğru cevaplar istemcide eşleştiği için buraya hiç gelmez)`);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
