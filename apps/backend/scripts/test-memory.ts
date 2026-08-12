/** Faz 7.1 doğrulama: hoca öğrenciyi HATIRLIYOR mu?
 *  ders bitir → çıkarım → gerçekler + süreklilik kancası → sonraki derste prompt'a giriyor mu
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-memory.ts`
 *  Gerçek LLM + embedding çağrısı yapar (~$0.001). */
import type { LessonContent } from "@arna/contracts";
import { and, cosineDistance, desc, eq, isNotNull, sql as dsql } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonProgress, llmCalls, memories, sessionSummaries, sessions, transcriptTurns, userProfiles } from "../src/db/schema.js";
import { embed } from "../src/modules/llm/index.js";
import { DEDUP_SIMILARITY } from "../src/modules/memory/extract.js";
import { buildTutorPrompt } from "../src/modules/lesson/tutorPrompt.js";
import { extractSessionMemory } from "../src/modules/memory/extract.js";
import { buildMemoryBlock } from "../src/modules/memory/retrieve.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson, seedTestContent } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000009";

const check = (label: string, ok: boolean, detail = "") =>
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);

const lessonContent = (title: string, topic: string, focus: string, theme: string): LessonContent =>
  makeLessonContent({ title, topic, focus, theme });

// --- kurulum ----------------------------------------------------------------

await sql`delete from memories where user_id = ${testUserId}`;
await sql`delete from sessions where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;

await db.insert(userProfiles).values({
  userId: testUserId,
  displayName: "Saeb",
  nativeLanguage: "tr",
  cefrLevel: "A2",
  track: "business",
  dailyGoalMinutes: 10,
  occupation: "backend developer",
  interests: ["technology", "sports"],
});


const pl1 = await seedTestCatalogLesson({});
const pl2 = await seedTestCatalogLesson({ slot: 2 });

const l1 = await seedTestContent({
  userId: testUserId,
  catalogLessonId: pl1.id,
  content: lessonContent("Geçmiş Zaman I", "past simple", "Past Simple (regular verbs)", "İş"),
});
await db
  .insert(lessonProgress)
  .values({ userId: testUserId, catalogLessonId: pl1.id, status: "completed" })
  .onConflictDoNothing();

// Oturum PAYLAŞIMLI içerik satırını ve müfredat yuvasını birlikte taşır: hafıza
// çıkarımı içeriğe, ilerleme ise yuvaya bakıyor.
const [session] = await db
  .insert(sessions)
  .values({ userId: testUserId, contentId: l1.id, catalogLessonId: pl1.id, endedAt: new Date() })
  .returning();

// Gerçekçi transkript: kişisel bilgi + dilbilgisi hatası + roleplay kurgusu
await db.insert(transcriptTurns).values([
  { sessionId: session!.id, role: "user", text: "Yes I am ready. I work as a backend developer at a fintech startup in Istanbul.", phase: "lecture" },
  { sessionId: session!.id, role: "assistant", text: "Nice! Let's start.", phase: "lecture" },
  { sessionId: session!.id, role: "user", text: "Yesterday I go to the office and I finish the payment service.", phase: "lecture" },
  { sessionId: session!.id, role: "assistant", text: "Almost! We say: yesterday I went to the office and I finished the payment service.", phase: "lecture" },
  { sessionId: session!.id, role: "user", text: "I have two cats. At the weekend I usually go hiking with my brother.", phase: "practice" },
  { sessionId: session!.id, role: "assistant", text: "That sounds lovely!", phase: "practice" },
  { sessionId: session!.id, role: "user", text: "I want to pass an English job interview next spring, that is why I am learning.", phase: "practice" },
]);

// --- 1. çıkarım -------------------------------------------------------------

console.log("\n— 1. çıkarım —");
const first = await extractSessionMemory(session!.id);
console.log("sonuç:", first);

const facts = await db
  .select()
  .from(memories)
  .where(eq(memories.userId, testUserId))
  .orderBy(desc(memories.createdAt));

console.log("\nçıkarılan gerçekler:");
for (const f of facts) console.log(`  [${f.kind}] ${f.text}`);

check("gerçek çıkarıldı", facts.length >= 2, `${facts.length} adet`);
check(
  "her gerçeğin embedding'i var",
  facts.every((f) => Array.isArray(f.embedding) && f.embedding.length === 1536),
);
check(
  "dilbilgisi performansı gerçek olarak kaydedilmemiş",
  !facts.some((f) => /past simple|grammar|tense|verb form|mistake/i.test(f.text)),
  facts.filter((f) => /past simple|grammar|tense|verb form|mistake/i.test(f.text)).map((f) => f.text).join(" | "),
);

const [summary] = await db
  .select()
  .from(sessionSummaries)
  .where(eq(sessionSummaries.sessionId, session!.id));
console.log("\nözet:", summary?.summary);
console.log("kanca:", summary?.continuityHook);
console.log("hatalar:", JSON.stringify(summary?.errorsObserved));
check("oturum özeti yazıldı", !!summary?.summary);
check("süreklilik kancası dolu", !!summary?.continuityHook);
check("dil hataları errors_observed'a gitti", Array.isArray(summary?.errorsObserved) && (summary!.errorsObserved as string[]).length > 0);

// --- 2. çıkarım (dedup) -----------------------------------------------------

console.log("\n— 2. çıkarım (aynı oturum, tekrar) —");
const second = await extractSessionMemory(session!.id);
console.log("sonuç:", second);
const afterSecond = await db.select({ id: memories.id }).from(memories).where(eq(memories.userId, testUserId));
check(
  "tekrar çalıştırınca yeni gerçek eklenmedi",
  afterSecond.length === facts.length,
  `önce ${facts.length}, sonra ${afterSecond.length}`,
);

// --- vektör dedup güvenlik ağı ----------------------------------------------
// 2. çıkarımda model "ALREADY KNOWN" listesine uyduğu için vektör yolu hiç
// tetiklenmedi. Riskli olan kısım SQL tarafı (operatör/indeks), onu doğrudan sınıyoruz.

console.log("\n— vektör benzerliği (dedup güvenlik ağı) —");
const known = facts.find((f) => /developer/i.test(f.text))?.text ?? facts[0]!.text;
const [identicalVec, paraphraseVec, unrelatedVec] = await embed([
  known,
  "Is employed as a back-end engineer at a fintech company in Istanbul.",
  "Is learning to play the guitar and practises every evening.",
]);

const nearestTo = async (vector: number[]) => {
  const similarity = dsql<number>`1 - (${cosineDistance(memories.embedding, vector)})`;
  const [row] = await db
    .select({ text: memories.text, similarity })
    .from(memories)
    .where(and(eq(memories.userId, testUserId), isNotNull(memories.embedding)))
    .orderBy(desc(similarity))
    .limit(1);
  return row!;
};

const identicalHit = await nearestTo(identicalVec!);
const paraphraseHit = await nearestTo(paraphraseVec!);
const unrelatedHit = await nearestTo(unrelatedVec!);
console.log(`  aynı metin      → ${Number(identicalHit.similarity).toFixed(4)} :: ${identicalHit.text}`);
console.log(`  başka sözcükler → ${Number(paraphraseHit.similarity).toFixed(4)} :: ${paraphraseHit.text}`);
console.log(`  alakasız gerçek → ${Number(unrelatedHit.similarity).toFixed(4)} :: ${unrelatedHit.text}`);

check("en yakın komşu doğru satır", identicalHit.text === known);
check(
  "aynı gerçek eşiği aşıyor (elenir)",
  Number(identicalHit.similarity) >= DEDUP_SIMILARITY,
  Number(identicalHit.similarity).toFixed(4),
);
check(
  "farklı sözcüklerle aynı gerçek de eleniyor",
  Number(paraphraseHit.similarity) >= DEDUP_SIMILARITY,
  Number(paraphraseHit.similarity).toFixed(4),
);
check(
  "gerçekten yeni bir bilgi eşiğin ALTINDA (yutulmuyor)",
  Number(unrelatedHit.similarity) < DEDUP_SIMILARITY,
  Number(unrelatedHit.similarity).toFixed(4),
);

// --- geri getirme: SONRAKİ ders ---------------------------------------------

console.log("\n— sonraki dersin hafıza bloğu —");
const nextLesson = lessonContent("Hafta Sonu Planları", "weekend plans", "Present Continuous for future", "Sosyal");
const block = await buildMemoryBlock(testUserId, {
  topic: nextLesson.topic,
  focus: nextLesson.focus,
  theme: nextLesson.theme,
});
console.log(block);
check("hafıza bloğu üretildi", !!block);
check("önceki ders anılıyor", !!block?.includes("Previous lesson"));
check("blok ≤700 karakter", (block?.length ?? 0) <= 700, `${block?.length ?? 0} karakter`);

const system = buildTutorPrompt({
  displayName: "Saeb",
  cefrLevel: "A2",
  nativeLanguage: "tr",
  occupation: "backend developer",
  interests: ["technology", "sports"],
  lesson: nextLesson,
  memoryBlock: block,
});
check("prompt'ta <student_memory> bloğu var", system.includes("<student_memory>"));
check("prompt'ta meslek var", system.includes("backend developer"));
check("prompt'ta ilgi alanları var", system.includes("technology"));

// --- CANLI ders turu: hafıza gerçekten hocaya ulaşıyor mu? -------------------
// buildTutorPrompt'u elle çağırmak yetmez — asıl soru chatTurn yolunun bloğu
// kurup prompt'a koyup koymadığı (Faz 7 öncesi memoryBlock hiç doldurulmuyordu).

console.log("\n— canlı ders turu (2. ders) —");
// 2. dersin paylaşımlı içeriği: openSession üretim tetiklemez, hazır satır ister
await seedTestContent({
  userId: testUserId,
  catalogLessonId: pl2.id,
  content: lessonContent("Hafta Sonu Planları", "weekend plans", "Present Continuous for future", "Sosyal"),
});
const { sessionId: liveSessionId } = await openSession(testUserId, pl2.id);
const reply = await chatTurn(testUserId, liveSessionId, "Hi Emma, I am ready.", {
  phase: "lecture",
  beatId: "b3",
});
console.log("Emma:", reply.text);

const [liveSession] = await db.select().from(sessions).where(eq(sessions.id, liveSessionId));
const liveState = liveSession?.state as { memoryBlock?: string | null } | null;
check("oturum state'inde hafıza bloğu cache'lendi", typeof liveState?.memoryBlock === "string");
check(
  "canlı turun prompt'una giren blok gerçeği içeriyor",
  !!liveState?.memoryBlock?.includes("backend developer"),
  liveState?.memoryBlock?.split("\n")[0] ?? "(boş)",
);

const callsBefore = (await db.select().from(llmCalls).where(eq(llmCalls.userId, testUserId))).length;
await chatTurn(testUserId, liveSessionId, "No questions.", { phase: "lecture", beatId: "b3" });
const callsAfter = (await db.select().from(llmCalls).where(eq(llmCalls.userId, testUserId))).length;
check(
  "ikinci turda yeniden embed edilmedi (cache çalışıyor)",
  callsAfter - callsBefore === 1,
  `${callsAfter - callsBefore} çağrı (yalnızca chat olmalı)`,
);

// --- maliyet ----------------------------------------------------------------

const calls = await db.select().from(llmCalls).where(eq(llmCalls.userId, testUserId));
const byPurpose = new Map<string, { n: number; usd: number }>();
for (const c of calls) {
  const e = byPurpose.get(c.purpose) ?? { n: 0, usd: 0 };
  e.n++;
  e.usd += Number(c.costUsd ?? 0);
  byPurpose.set(c.purpose, e);
}
console.log("\nLLM çağrıları:");
for (const [p, e] of byPurpose) console.log(`  ${p}: ${e.n} çağrı, $${e.usd.toFixed(6)}`);
check("memory_extract loglandı", byPurpose.has("memory_extract"));
check("embedding loglandı", byPurpose.has("embedding"));

// --- temizlik ---------------------------------------------------------------

await sql`delete from memories where user_id = ${testUserId}`;
await sql`delete from sessions where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log("\ntemizlendi.");
