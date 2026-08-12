/**
 * Üretilmiş PAYLAŞIMLI ders içeriğini geçersizler.
 *
 *   set -a; source .env; set +a; npx tsx scripts/invalidate-content.ts [--lesson <id>] [--lang tr] [--all]
 *
 * Neden gerekli: içerik artık kullanıcılar arasında paylaşılıyor. Lint'ten geçen
 * ama pedagojik olarak kötü bir ders, o anahtardaki HERKESE servis edilir.
 * `specHash` katalog düzenlemesini otomatik geçersizler, ama prompt metni
 * değiştiğinde ya da tek bir kötü satır fark edildiğinde elle müdahale gerekir.
 *
 * Satırlar SİLİNMEZ, `status='retired'` olur: oturumlar `content_id` ile onlara
 * bakıyor, silmek geçmişi koparırdı. Bir sonraki istek yeni satır üretir.
 */
import { and, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonContents } from "../src/db/schema.js";
import { normalizeNativeLanguage } from "../src/lib/language.js";

const args = process.argv.slice(2);
const valueOf = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const lesson = valueOf("--lesson");
const lang = valueOf("--lang");
const all = args.includes("--all");

if (!lesson && !lang && !all) {
  console.error(
    "Hiçbir filtre verilmedi. En az biri gerekli: --lesson <id> · --lang <kod> · --all\n" +
      "(Filtresiz koşup tüm katalogun içeriğini yanlışlıkla çöpe atmayı engellemek için.)",
  );
  process.exit(1);
}

const filters = [eq(lessonContents.status, "ready")];
if (lesson) filters.push(eq(lessonContents.catalogLessonId, lesson));
if (lang) filters.push(eq(lessonContents.nativeLanguage, normalizeNativeLanguage(lang)));

const retired = await db
  .update(lessonContents)
  .set({ status: "retired", updatedAt: new Date() })
  .where(and(...filters))
  .returning({ id: lessonContents.id, lesson: lessonContents.catalogLessonId, lang: lessonContents.nativeLanguage, track: lessonContents.track });

for (const r of retired) console.log(`  - ${r.lesson} [${r.lang}/${r.track}]`);
console.log(`\n${retired.length} içerik satırı emekliye ayrıldı; ilk istekte yeniden üretilecek.\n`);

await sql.end();
