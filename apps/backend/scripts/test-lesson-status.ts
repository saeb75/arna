/** Faz 6.4 doğrulama: ders durumu YALNIZCA gerçekten başlatılınca değişmeli.
 *  içerik getir → not_started · oturum aç → in_progress · bitir → completed
 *  Ön-üretilen ders ise HİÇ etkilenmemeli.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-lesson-status.ts` */
import { eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessons, programLessons, programs, userProfiles } from "../src/db/schema.js";
import { getOrGenerateLesson, pregenerateNext } from "../src/modules/lesson/service.js";
import { endSession, openSession } from "../src/modules/session/service.js";
import { makeLessonContent } from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000008";

const content = makeLessonContent();

await db.insert(userProfiles).values({
  userId: testUserId, displayName: "Saeb", nativeLanguage: "tr",
  cefrLevel: "A2", track: "business", dailyGoalMinutes: 10, interests: ["technology"],
});
const [program] = await db.insert(programs)
  .values({ userId: testUserId, track: "business", level: "A2", status: "ready" }).returning();
const [l1] = await db.insert(programLessons)
  .values({ programId: program!.id, position: 1, title: "Ders 1", focus: "f1", theme: "t1" }).returning();
const [l2] = await db.insert(programLessons)
  .values({ programId: program!.id, position: 2, title: "Ders 2", focus: "f2", theme: "t2" }).returning();
// İçerikleri elle koy — LLM üretimi olmadan durum akışını test ediyoruz
await db.insert(lessons).values([
  { programLessonId: l1!.id, userId: testUserId, status: "ready", content },
  { programLessonId: l2!.id, userId: testUserId, status: "ready", content },
]);

const statusOf = async (id: string) => {
  const [r] = await db.select().from(programLessons).where(eq(programLessons.id, id));
  return r!.status;
};

console.log("başlangıç       :", await statusOf(l1!.id), "/", await statusOf(l2!.id));

// 1) İçeriği getir — durum DEĞİŞMEMELİ
await getOrGenerateLesson(testUserId, l1!.id);
const afterFetch = await statusOf(l1!.id);
console.log("içerik getirildi:", afterFetch, afterFetch === "not_started" ? "✅" : "❌ değişmemeliydi");

// 2) Ön-üretim — sıradaki ders ETKİLENMEMELİ
await pregenerateNext(testUserId, l1!.id);
const afterPregen = await statusOf(l2!.id);
console.log("ön-üretim sonrası ders 2:", afterPregen, afterPregen === "not_started" ? "✅" : "❌ etkilenmemeliydi");

// 3) Oturum aç — ŞİMDİ in_progress olmalı
const { sessionId } = await openSession(testUserId, l1!.id);
const afterOpen = await statusOf(l1!.id);
console.log("oturum açıldı   :", afterOpen, afterOpen === "in_progress" ? "✅" : "❌");

// 4) Bitir — completed
await endSession(testUserId, sessionId);
const afterEnd = await statusOf(l1!.id);
console.log("ders bitirildi  :", afterEnd, afterEnd === "completed" ? "✅" : "❌");
console.log("ders 2 hâlâ     :", await statusOf(l2!.id));

await sql`delete from programs where user_id = ${testUserId}`;
await sql`delete from user_profiles where user_id = ${testUserId}`;
await sql.end();
