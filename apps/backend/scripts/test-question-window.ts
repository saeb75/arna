/** Faz 7.5 doğrulama: "Sorun var mı?" penceresi.
 *
 *  Yakalanan hata: Emma "Do you have any questions...?" sordu, öğrenci "yes" dedi,
 *  uygulama hiç beklemeden alıştırmalara atladı. "Hazır mısın?" ile "Sorun var mı?"
 *  sorularında AYNI kelime TERS anlama geliyor — onay kısayolu bunu ayırt etmiyordu.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-question-window.ts` */
import { decideAfterTutorReply } from "@glotmate/contracts";
import { eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { llmCalls, userProfiles } from "../src/db/schema.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson , seedTestContent, runsText } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000012";

const check = (label: string, ok: boolean, detail = "") =>
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);

// ---------------------------------------------------------------------------
// 1) SINIFLANDIRMA — istemcideki ackKind() ile birebir aynı mantık.
//    Karar tablosunun kendisi scripts/test-flow-rules.ts'te (saf, LLM'siz);
//    burada yalnızca kelime sınıflandırması + gerçek bir LLM turunun İÇERİĞİ sınanır.
// ---------------------------------------------------------------------------

const ACK_YES = new Set([
  "yes", "yeah", "yep", "yup", "i do", "i have", "a question", "one question",
  "evet", "var", "sorum var", "bir sorum var", "tabii", "aynen",
]);
const ACK_NO = new Set([
  "no", "nope", "nah", "no thanks", "no thank you", "nothing", "none", "not really",
  "im good", "i'm good", "all good", "all clear",
  "hayir", "hayır", "yok", "yoktur", "sorum yok", "gerek yok", "anladim", "anladım",
]);
const ACK_PROCEED = new Set([
  "ok", "okay", "sure", "ready", "im ready", "i am ready", "lets go", "let's go",
  "lets start", "let's start", "all right", "alright", "go ahead", "continue",
  "tamam", "tamamdir", "tamamdır", "hazirim", "hazırım", "olur", "peki",
  "baslayalim", "başlayalım", "devam", "devam edelim",
]);

function ackKind(text: string): "yes" | "no" | "proceed" | null {
  const t = text.toLowerCase().replace(/[^a-zçğıöşü' ]/gi, " ").replace(/\s+/g, " ").trim();
  if (!t || t.split(" ").length > 4) return null;
  if (ACK_NO.has(t)) return "no";
  if (ACK_YES.has(t)) return "yes";
  if (ACK_PROCEED.has(t)) return "proceed";
  return null;
}

/** İstemcideki karar tablosu — burada saf fonksiyon olarak doğrulanır. */
function decide(purpose: "readiness" | "questions", text: string): "advance" | "invite" | "llm" {
  const ack = ackKind(text);
  if (purpose === "questions" && ack === "yes") return "invite";
  if (ack) return "advance";
  return "llm";
}

console.log("— sınıflandırma —");
const cases: Array<[("readiness" | "questions"), string, "advance" | "invite" | "llm"]> = [
  ["questions", "yes", "invite"],        // ← BUG buydu: eskiden "advance"
  ["questions", "evet", "invite"],
  ["questions", "var", "invite"],
  ["questions", "no", "advance"],
  ["questions", "hayır", "advance"],
  ["questions", "sorum yok", "advance"],
  ["questions", "tamam", "advance"],
  ["questions", "Where do I put always with be?", "llm"],
  ["readiness", "yes", "advance"],       // ← regresyon: burada değişmemeli
  ["readiness", "evet", "advance"],
  ["readiness", "hazırım", "advance"],
  ["readiness", "no", "advance"],
  ["readiness", "What is an adverb?", "llm"],
];
let classOk = true;
for (const [purpose, text, want] of cases) {
  const got = decide(purpose, text);
  if (got !== want) {
    classOk = false;
    console.log(`   ❌ [${purpose}] "${text}" → ${got}, beklenen ${want}`);
  }
}
check(`${cases.length} sınıflandırma vakası`, classOk);

// ---------------------------------------------------------------------------
// 2) SUNUCU — "questions" bağlamı gerçek soruya örnekle cevap veriyor mu?
// ---------------------------------------------------------------------------

const content = makeLessonContent({
  title: "Sıklık Zarfları",
  topic: "adverbs of frequency",
  focus: "Adverbs of frequency — always / usually / never",
  theme: "İş rutinini anlatma",
  objectives: ["Place adverbs of frequency correctly.", "Describe a work routine."],
  communicationGoal: "Describe how often you do things at work.",
  tutorNotes: {
    target: "adverbs of frequency before the main verb, after 'be'",
    commonErrors: ["placing the adverb after the main verb"],
    correction: "recast with the adverb in the right position",
  },
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, say today is about adverbs of frequency, ask if ready" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation of adverb placement", points: ["Put adverbs of frequency before the main verb: I **always** check my email.", "With 'be', put the adverb after: She is **usually** on time."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
      { id: "b5", kind: "exercise", prompt: "Fill in the blank: I ___ attend the weekly team meeting.", answers: ["always", "usually"], hint: "Example of what you can say: always" },
      { id: "b6", kind: "exercise", prompt: "Which is correct?", options: ["She is never late.", "She never is late."], answers: ["She is never late.", "A"], hint: "Example of what you can say: A" },
    ],
  },
});

await sql`delete from user_profiles where user_id = ${testUserId}`;

await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage: "tr",
  cefrLevel: "A2", track: "work", dailyGoalMinutes: 10,
  occupation: "backend developer", interests: ["technology"],
});
const catalogLesson = await seedTestCatalogLesson({});
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content });

const { sessionId, script } = await openSession(testUserId, catalogLesson.id);

console.log("\n— oturum script'i —");
console.log(`  [b3 sorusu]  ${script?.beats["b3"]}`);
console.log(`  [davet]      ${script?.inviteQuestion}`);
check("inviteQuestion üretildi", !!script?.inviteQuestion);
check(
  "davet soruyla bitiyor (öğrenciye söz veriliyor)",
  /\?\s*$/.test(runsText(script?.inviteQuestion).trim()),
  runsText(script?.inviteQuestion),
);
check(
  "davet konuyu yeniden anlatmıyor (kısa)",
  (script?.inviteQuestion ?? "").length <= 90,
  `${(script?.inviteQuestion ?? "").length} karakter`,
);

// Gerçek soru → örnekli cevap + devam davetiyesi
const before = (await db.select().from(llmCalls).where(eq(llmCalls.userId, testUserId))).length;
const answer = await chatTurn(testUserId, sessionId, "Where do I put 'always' with 'be'?", {
  phase: "lecture", beatId: "b3",
});
console.log("\n[öğrenci] Where do I put 'always' with 'be'?");
console.log("[Emma]   ", answer.text);
check("soru cevaplandı", answer.text.length > 0);
check(
  "cevapta somut bir örnek cümle var",
  /for example|you can say|e\.g\.|["“]/i.test(answer.text) &&
    /\b(always|usually|never|often|sometimes)\b/i.test(answer.text),
  "(örnek işareti + hedef zarf aranıyor)",
);
// Model dersin kuralıyla ÇELİŞMEMELİ: 'be' ile zarf SONRA gelir.
// (Anlatım maddeleri bağlama eklenmeden önce "before the verb 'be'" diyordu.)
check(
  "cevap dersin kuralıyla çelişmiyor ('be' ile zarf sonra)",
  !/before\s+(the\s+)?(verb\s+)?["']?(be|is|am|are)\b/i.test(answer.text),
  answer.text,
);
// Akış kararı artık cevabın METNİNDEN çıkarılmıyor — noktalamaya bakan assert
// KALDIRILDI (o beklenti canlı hatanın kendisiydi: Emma "!" ile bitirince ders kaçtı).
// Kararı doğrudan saf makineye soruyoruz: cevap ne olursa olsun BEKLEMELİ.
const afterAnswer = decideAfterTutorReply(content.lecture.beats[2]!, {
  exchanges: 1,
  attempt: 0,
  beatDone: false,
});
check(
  "cevaptan sonra akış BEKLİYOR (metinden bağımsız)",
  afterAnswer.kind === "wait",
  JSON.stringify(afterAnswer),
);

// SON TUR: hoca "başka sorun var mı?" DEMEMELİ — akış zaten ilerleyecek.
// (Canlı hata: Emma soru soruyor, uygulama duymazdan gelip alıştırmalara atlıyordu.)
const closing = await chatTurn(testUserId, sessionId, "And what about 'never'?", {
  phase: "lecture", beatId: "b3", lastExchange: true,
});
console.log("\n[son tur] Emma:", closing.text);
check(
  "son turda yeni soru sormuyor (akışla çelişmiyor)",
  !/\?\s*$/.test(closing.text.trim()),
  closing.text,
);
check(
  "son turda alıştırmalara geçeceğini söylüyor",
  /practice|question|exercise|move on|next/i.test(closing.text),
  closing.text,
);

// readiness beat'i regresyon: hâlâ soru SORMAMALI
const ready = await chatTurn(testUserId, sessionId, "What is an adverb?", {
  phase: "lecture", beatId: "b1",
});
console.log("\n[readiness beat'inde soru] Emma:", ready.text);
check(
  "readiness beat'i hâlâ soru sormuyor (akış hemen ilerleyecek)",
  !/\?\s*$/.test(ready.text.trim()),
  ready.text,
);

const after = (await db.select().from(llmCalls).where(eq(llmCalls.userId, testUserId))).length;
check("yalnızca gerçek mesajlar LLM'e gitti", after - before === 3, `${after - before} çağrı`);

await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log("\ntemizlendi.");
