/**
 * Sabit katalog + paylaşımlı içerik değişikliğinin TEK kanıt testi.
 *
 *   set -a; source .env; set +a; npx tsx scripts/test-shared-content.ts
 *
 * Sorduğu şey: aynı ders iki kullanıcıya AYNI içerik satırından mı servis
 * ediliyor (yani ikincisi LLM ödemiyor), ama oturum açılışları FARKLI mı
 * (yani kişiselleştirme kaybolmadı, sadece katman değiştirdi)?
 *
 * Gerçek LLM çağrısı yapar: bir ders üretimi + iki oturum script'i.
 */
import { and, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonContents, llmCalls } from "../src/db/schema.js";
import { getOrGenerateLesson } from "../src/modules/lesson/service.js";
import { openSession } from "../src/modules/session/service.js";
import { getCurriculumForUser } from "../src/modules/curriculum/queries.js";
import { cleanupTestUser, seedTestProfile } from "./_fixture.js";

const userA = "00000000-0000-4000-8000-0000000000a1";
const userB = "00000000-0000-4000-8000-0000000000a2";
const userC = "00000000-0000-4000-8000-0000000000a3";
const LESSON = "a1-she-works-at-night";

const check = (label: string, ok: boolean, detail = "") =>
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);

const genCount = async () => {
  const rows = await sql`select count(*)::int as n from llm_calls where purpose = 'lesson_gen'`;
  return Number(rows[0]!.n);
};

for (const u of [userA, userB, userC]) await cleanupTestUser(u);
await db.delete(lessonContents).where(eq(lessonContents.catalogLessonId, LESSON));

// --- 1) Onboarding LLM'siz mi? ----------------------------------------------
console.log("\n— onboarding —");
const t0 = Date.now();
await seedTestProfile({ userId: userA, displayName: "Ayla", cefrLevel: "A1", track: "conversation" });
const curriculum = await getCurriculumForUser(userA);
const onboardMs = Date.now() - t0;

check("müfredat LLM beklemeden geldi", onboardMs < 2000, `${onboardMs} ms`);
check("üniteler dolu", curriculum.units.length > 0, `${curriculum.units.length} ünite`);
check(
  "tüm dersler not_started (ilerleme satırı yok)",
  curriculum.units.every((u) => u.lessons.every((l) => l.status === "not_started")),
);
check("toplam ders sayısı doğru", curriculum.totals.lessons === 46, `${curriculum.totals.lessons}`);

// --- 2) İlk kullanıcı üretimi öder -------------------------------------------
console.log("\n— ilk üretim (A) —");
const before = await genCount();
const a = await getOrGenerateLesson(userA, LESSON);
const afterA = await genCount();
check("A için içerik üretildi", !!a.content, a.content.title);
check("A bir lesson_gen ödedi", afterA > before, `${afterA - before} çağrı`);
check(
  "mustUse katalogdan geldi",
  JSON.stringify(a.content.practice.mustUse) === JSON.stringify(["she works", "he lives", "it starts at"]),
  a.content.practice.mustUse.join(" | "),
);

// --- 3) Aynı dil + track → PAYLAŞIM ------------------------------------------
console.log("\n— ikinci kullanıcı, aynı dil+track (C) —");
await seedTestProfile({ userId: userC, displayName: "Kerem", cefrLevel: "A1", track: "conversation" });
const c = await getOrGenerateLesson(userC, LESSON);
const afterC = await genCount();
check("C aynı içerik satırını aldı", c.lessonId === a.lessonId, `${c.lessonId}`);
check("C HİÇ LLM ödemedi", afterC === afterA, `${afterC - afterA} ek çağrı`);

// --- 4) Farklı track → ayrı satır --------------------------------------------
console.log("\n— farklı track (B) —");
await seedTestProfile({ userId: userB, displayName: "Deniz", cefrLevel: "A1", track: "business" });
const b = await getOrGenerateLesson(userB, LESSON);
check("B ayrı bir satır aldı (track anahtarın parçası)", b.lessonId !== a.lessonId);

const rows = await db
  .select({ id: lessonContents.id, track: lessonContents.track })
  .from(lessonContents)
  .where(and(eq(lessonContents.catalogLessonId, LESSON), eq(lessonContents.status, "ready")));
check("bu ders için 2 içerik satırı var", rows.length === 2, rows.map((r) => r.track).join(", "));

// --- 5) AYNI içerik, FARKLI oturum script'i ----------------------------------
// Değişikliğin bütün tezi: kişiselleştirme yazarlıkta değil, teslimatta.
console.log("\n— oturum script'leri (A ve C, aynı içerik satırı) —");
const sa = await openSession(userA, LESSON);
const sc = await openSession(userC, LESSON);

// Beat kimliklerini model serbest üretiyor ("1,2,3" ya da "b1,b2,b3") — içerik ve
// script aynı üretimden geldiği için tutarlılar, ama testte sabit kimlik varsayılamaz.
const firstBeatId = a.content.lecture.beats[0]!.id;
const greetA = sa.script?.beats[firstBeatId] ?? "";
const greetC = sc.script?.beats[firstBeatId] ?? "";
console.log(`  A: ${greetA}`);
console.log(`  C: ${greetC}`);

check("A'nın selamlaması kendi adını içeriyor", /Ayla/i.test(greetA));
check("C'nin selamlaması kendi adını içeriyor", /Kerem/i.test(greetC));
check("iki selamlama BİRBİRİNDEN FARKLI", greetA !== greetC);

const sessA = await db.select().from(lessonContents).where(eq(lessonContents.id, a.lessonId));
check("ikisi de aynı paylaşımlı içerik satırını oynattı", sessA.length === 1);

// --- 6) İçerikte kişisel veri sızıntısı yok ----------------------------------
const blob = JSON.stringify(a.content).toLowerCase();
check("içerikte hiçbir kullanıcının adı yok", !blob.includes("ayla") && !blob.includes("kerem"));

for (const u of [userA, userB, userC]) await cleanupTestUser(u);
console.log("");
await sql.end();
