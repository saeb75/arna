/** Faz 6.4 doğrulama: ders durumu YALNIZCA gerçekten başlatılınca değişmeli.
 *  içerik getir → not_started · oturum aç → in_progress · bitir → completed
 *  Ön-üretilen ders ise HİÇ etkilenmemeli.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-lesson-status.ts` */
import { and, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonProgress } from "../src/db/schema.js";
import { getOrGenerateLesson, pregenerateNext } from "../src/modules/lesson/service.js";
import { endSession, openSession } from "../src/modules/session/service.js";
import {
  cleanupTestUser,
  makeLessonContent,
  seedTestCatalogLesson,
  seedTestContent,
  seedTestProfile,
} from "./_fixture.js";

const testUserId = "00000000-0000-4000-8000-000000000008";

const content = makeLessonContent();

await cleanupTestUser(testUserId);
await seedTestProfile({ userId: testUserId });

const catalogLesson = await seedTestCatalogLesson({});
const catalogLesson2 = await seedTestCatalogLesson({ slot: 2 });
// İçerikleri elle koy — LLM üretimi olmadan durum akışını test ediyoruz
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson.id, content });
await seedTestContent({ userId: testUserId, catalogLessonId: catalogLesson2.id, content });

/**
 * İlerleme tablosu SEYREK: satırın yokluğu "not_started" demek. Eskiden her
 * kullanıcı için tüm plan satırları kopyalandığından durum kolonu hep vardı.
 */
const statusOf = async (id: string) => {
  const [r] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, testUserId), eq(lessonProgress.catalogLessonId, id)));
  return r?.status ?? "not_started";
};

console.log("başlangıç       :", await statusOf(catalogLesson.id), "/", await statusOf(catalogLesson2.id));

// 1) İçeriği getir — durum DEĞİŞMEMELİ
await getOrGenerateLesson(testUserId, catalogLesson.id);
const afterFetch = await statusOf(catalogLesson.id);
console.log("içerik getirildi:", afterFetch, afterFetch === "not_started" ? "✅" : "❌ değişmemeliydi");

// 2) Ön-üretim — sıradaki ders ETKİLENMEMELİ
await pregenerateNext(testUserId, catalogLesson.id);
const afterPregen = await statusOf(catalogLesson2.id);
console.log("ön-üretim sonrası ders 2:", afterPregen, afterPregen === "not_started" ? "✅" : "❌ etkilenmemeliydi");

// 3) Oturum aç — ŞİMDİ in_progress olmalı
const { sessionId } = await openSession(testUserId, catalogLesson.id);
const afterOpen = await statusOf(catalogLesson.id);
console.log("oturum açıldı   :", afterOpen, afterOpen === "in_progress" ? "✅" : "❌");

// 4) Bitir — completed
await endSession(testUserId, sessionId);
const afterEnd = await statusOf(catalogLesson.id);
console.log("ders bitirildi  :", afterEnd, afterEnd === "completed" ? "✅" : "❌");
console.log("ders 2 hâlâ     :", await statusOf(catalogLesson2.id));

await cleanupTestUser(testUserId);
await sql.end();
