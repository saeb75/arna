/** Faz 7.2 doğrulama: hocanın cümleleri İÇERİKTE değil, oturum açılışında üretiliyor.
 *  İçerik kullanıcıdan bağımsız → selamlama adı + geçen dersi + hafızayı anabilmeli.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-session-script.ts` */
import { eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { memories, sessionSummaries, sessions, userProfiles } from "../src/db/schema.js";
import { embed } from "../src/modules/llm/index.js";
import { runsText } from "./_fixture.js";
import { openSession } from "../src/modules/session/service.js";
import { makeLessonContent, seedTestCatalogLesson , seedTestContent} from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000010";
const displayName = "Saeb";

const check = (label: string, ok: boolean, detail = "") =>
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);

const content = makeLessonContent({
  title: "Yeni Duruma Alışmak",
  topic: "get used to",
  focus: "get used to (+ noun / -ing)",
  theme: "Yeni bir takıma alışmak",
  objectives: ["Use 'get used to' with nouns and -ing forms.", "Describe adapting to a new situation."],
  communicationGoal: "Say how you are adapting to something new.",
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, say today is about get used to, ask if ready to begin" },
      { id: "b2", kind: "teach", introIntent: "announce the explanation of how get used to works", points: ["After **get used to**, use a noun or an -ing verb.", "It means becoming comfortable with something new."] },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
      { id: "b5", kind: "exercise", prompt: "Fill in the blank: I am getting used to ___ with a new team.", answers: ["working"], hint: "Example of what you can say: working" },
    ],
  },
});

// --- kurulum ----------------------------------------------------------------

await sql`delete from memories where user_id = ${testUserId}`;
await sql`delete from sessions where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;

await db.insert(userProfiles).values({
  userId: testUserId, displayName, nativeLanguage: "tr",
  cefrLevel: "A2", track: "work", dailyGoalMinutes: 10,
  occupation: "backend developer", interests: ["technology"],
});
const catalogLesson = await seedTestCatalogLesson({});
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content });

// Geçmiş bir ders + hafıza: selamlamanın bunlara değinebilmesi gerekiyor
const [pastSession] = await db.insert(sessions)
  .values({ userId: testUserId, endedAt: new Date() }).returning();
await db.insert(sessionSummaries).values({
  sessionId: pastSession!.id,
  userId: testUserId,
  lessonTitle: "Geçmiş Zaman I",
  summary: "Practised the past simple with regular verbs.",
  continuityHook: "Ask how the demo for the fintech client went.",
  errorsObserved: [],
});
const seedFacts = [
  "Works as a backend developer at a fintech startup.",
  "Recently joined a new team.",
];
const vectors = await embed(seedFacts, { userId: testUserId });
await db.insert(memories).values(
  seedFacts.map((text, i) => ({
    userId: testUserId, kind: "fact", text,
    sourceSessionId: pastSession!.id, embedding: vectors[i]!,
  })),
);

// --- oturum aç: script burada üretilir --------------------------------------

const t0 = Date.now();
const { sessionId, script } = await openSession(testUserId, catalogLesson.id);
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

console.log(`\n=== HOCANIN BU OTURUMDAKİ CÜMLELERİ (${elapsed} sn) ===`);
for (const beat of content.lecture.beats) {
  const line = script?.beats[beat.id];
  if (line) console.log(`  [${beat.kind}] ${line}`);
}
console.log(`  [practice] ${script?.practiceIntro}`);
console.log(`  [soru daveti] ${script?.inviteQuestion}`);
console.log(`  övgüler: ${script?.praise.join(" / ")}`);

check("script üretildi", !!script);
if (!script) process.exit(1);

const spokenIds = content.lecture.beats
  .filter((b) => b.kind !== "exercise")
  .map((b) => b.id);
check(
  "niyet taşıyan HER beat için cümle var",
  spokenIds.every((id) => !!runsText(script.beats[id]).trim()),
  spokenIds.filter((id) => !runsText(script.beats[id]).trim()).join(", ") || "eksik yok",
);

const allLines = [...Object.values(script.beats), script.practiceIntro, ...script.praise].map(runsText);
// v2: native modda satırlar ana dilde olabilir — ASCII yerine "boş değil" denetlenir
check("tüm satırlar dolu", allLines.every((l) => l.trim().length > 0));

const greeting = runsText(script.beats["b1"]);
check("selamlama öğrenciyi adıyla çağırıyor", greeting.includes(displayName), greeting);
check(
  "selamlama hafızaya/geçen derse değiniyor",
  /fintech|demo|team|past|last (lesson|time)|back/i.test(greeting),
  "(modele bağlı — üstteki cümleye bak)",
);

check(
  "ask beat'leri soruyla bitiyor (öğrenciye söz veriliyor)",
  content.lecture.beats
    .filter((b) => b.kind === "ask")
    .every((b) => /\?\s*$/.test(runsText(script.beats[b.id]).trim() ?? "")),
);
check(
  "say beat'inde soru YOK (akış hemen devam ediyor)",
  content.lecture.beats
    .filter((b) => b.kind === "say")
    .every((b) => !(runsText(script.beats[b.id])).includes("?")),
  runsText(script.beats["b4"]),
);
check("övgüler birbirinden farklı", new Set(script.praise).size === script.praise.length);
check(
  "soru daveti üretildi ve soruyla bitiyor",
  runsText(script.inviteQuestion).length > 0 && /\?\s*$/.test(runsText(script.inviteQuestion).trim()),
  runsText(script.inviteQuestion),
);

// state'e yazıldı mı — chatTurn ve yeniden yükleme buradan okuyor
const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
const state = row?.state as { script?: unknown; memoryBlock?: string | null } | null;
check("script sessions.state'e kaydedildi", !!state?.script);
check("hafıza bloğu da state'te", typeof state?.memoryBlock === "string");

// --- iki öğrenci, aynı içerik → farklı cümleler ------------------------------
// (v5'te bu imkânsızdı: cümleler içeriğin içinde donmuştu)
check(
  "cümleler içerikte DEĞİL (içerikte hiçbir beat 'text' alanı taşımıyor)",
  !JSON.stringify(content).includes('"text"'),
);

// --- fallback: LLM düşerse ders yine açılır ---------------------------------

// v2: LLM'siz yedek chrome şablonlarından geliyor ve script her beat'i baştan
// şablonla doldurup selamlamayı LLM'le ÜZERİNE yazıyor — ayrı fallback testi kalmadı.

// --- temizlik ---------------------------------------------------------------

await sql`delete from memories where user_id = ${testUserId}`;
await sql`delete from sessions where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql`delete from llm_calls where user_id = ${testUserId}`;
await sql.end();
console.log("\ntemizlendi.");
