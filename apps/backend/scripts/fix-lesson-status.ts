/** Tek seferlik onarım: hiç oturumu olmadığı halde "in_progress" görünen dersleri
 *  "not_started"a çeker. (Bug: ders içeriğini getirmek/ön-üretmek durumu değiştiriyordu.)
 *  Tamamlanmış derslere DOKUNMAZ.
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/fix-lesson-status.ts` */
import { sql } from "../src/db/client.js";

const rows = await sql`
  UPDATE program_lessons pl
  SET status = 'not_started'
  WHERE pl.status = 'in_progress'
    AND NOT EXISTS (
      SELECT 1
      FROM lessons l
      JOIN sessions s ON s.lesson_id = l.id
      WHERE l.program_lesson_id = pl.id
    )
  RETURNING pl.position, pl.title`;

if (rows.length === 0) {
  console.log("Düzeltilecek kayıt yok ✅");
} else {
  console.log(`${rows.length} ders "not_started"a geri alındı:`);
  for (const r of rows) console.log(`  ${r.position}. ${r.title}`);
}
await sql.end();
