/**
 * Katalog ısıtma — ders içeriğini KULLANICILAR GELMEDEN üretir.
 *
 *   set -a; source .env; set +a; npx tsx scripts/warm-catalog.ts --lang tr --track conversation [--level A1] [--limit 5] [--dry-run]
 *
 * NEDEN: içerik tembel üretiliyor, yani bir dersi ilk açan kişi ~14 sn (en kötü
 * 44 sn) bekliyor; sonraki herkes ~50 ms'de açıyor. Sabit müfredatta ders listesi
 * önceden belli olduğu için o "ilk kişi" bedelini kimse ödemek zorunda değil.
 *
 * Gerçek istek yolunu kullanır (`getOrGenerateLesson`): aynı claim koruması, aynı
 * lint, aynı retry. Zaten üretilmiş satırları atlar, yani yarıda kesilirse
 * kaldığı yerden devam eder.
 *
 * Isıtıcı, hedef (dil, track) için geçici bir profil açar — üretim anahtarını
 * profilden okuyan tek bir kod yolu olsun diye. Sonunda siler.
 */
import { and, eq, inArray } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonContents, userProfiles } from "../src/db/schema.js";
import { normalizeNativeLanguage } from "../src/lib/language.js";
import { getOrGenerateLesson } from "../src/modules/lesson/service.js";

const args = process.argv.slice(2);
const valueOf = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const lang = normalizeNativeLanguage(valueOf("--lang") ?? "tr");
const track = valueOf("--track") ?? "conversation";
const level = valueOf("--level");
const limit = Number(valueOf("--limit") ?? 0);
const dryRun = args.includes("--dry-run");
/** Aynı anda kaç üretim — sağlayıcı oran sınırına takılmamak için düşük tut. */
const CONCURRENCY = Number(valueOf("--concurrency") ?? 3);

const WARMER_ID = "00000000-0000-4000-8000-0000000000ff";

const filters = [eq(catalogLessons.status, "active")];
if (level) filters.push(eq(catalogLessons.level, level));

const lessons = await db
  .select({ id: catalogLessons.id, level: catalogLessons.level, title: catalogLessons.title, specHash: catalogLessons.specHash })
  .from(catalogLessons)
  .where(and(...filters))
  .orderBy(catalogLessons.level, catalogLessons.position);

// Zaten hazır olanları ele — script yeniden çalıştırılabilir olsun
const ready = await db
  .select({ id: lessonContents.catalogLessonId, specHash: lessonContents.specHash })
  .from(lessonContents)
  .where(
    and(
      eq(lessonContents.nativeLanguage, lang),
      eq(lessonContents.track, track),
      eq(lessonContents.status, "ready"),
      inArray(lessonContents.catalogLessonId, lessons.map((l) => l.id)),
    ),
  );
const readyKeys = new Set(ready.map((r) => `${r.id}::${r.specHash}`));

// DİKKAT: "zaten hazır" sayısı --limit UYGULANMADAN önce hesaplanır. Sonra
// hesaplanırsa `lessons.length - todo.length` katalogun ısınmamış kısmını da
// "hazır" sayıp ne kadar iş kaldığını olduğundan küçük gösterir.
const missing = lessons.filter((l) => !readyKeys.has(`${l.id}::${l.specHash}`));
const todo = limit > 0 ? missing.slice(0, limit) : missing;

const AVG_USD = 0.0137;
console.log(
  `\nKATALOG ISITMA — dil=${lang} track=${track}${level ? ` seviye=${level}` : ""}\n` +
    `  ${lessons.length} ders · ${lessons.length - missing.length} hazır · ${missing.length} eksik` +
    (limit > 0 ? ` · bu koşuda ${todo.length}` : "") +
    `\n  tahmini: ~$${(todo.length * AVG_USD).toFixed(2)} · ~${Math.ceil((todo.length * 14) / CONCURRENCY / 60)} dk\n`,
);

if (dryRun || todo.length === 0) {
  if (todo.length === 0) console.log("Yapılacak iş yok.\n");
  await sql.end();
  process.exit(0);
}

// Geçici ısıtıcı profili: üretim anahtarı profilden okunuyor, ayrı bir kod yolu açmıyoruz
await db
  .insert(userProfiles)
  .values({
    userId: WARMER_ID,
    displayName: "Warmer",
    nativeLanguage: lang,
    cefrLevel: level ?? "A1",
    track,
    dailyGoalMinutes: 10,
    interests: [],
  })
  .onConflictDoUpdate({
    target: userProfiles.userId,
    set: { nativeLanguage: lang, track, updatedAt: new Date() },
  });

let done = 0;
let failed = 0;
const t0 = Date.now();

async function worker(queue: typeof todo) {
  for (;;) {
    const lesson = queue.shift();
    if (!lesson) return;
    const label = `${lesson.level}/${lesson.id}`;
    try {
      await getOrGenerateLesson(WARMER_ID, lesson.id);
      done++;
      console.log(`  ✅ ${label}  (${done + failed}/${todo.length})`);
    } catch (err) {
      failed++;
      console.log(`  ❌ ${label} — ${String(err).slice(0, 120)}`);
    }
  }
}

const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

const mins = ((Date.now() - t0) / 60000).toFixed(1);
console.log(
  `\n  ${done} üretildi · ${failed} başarısız · ${mins} dk\n` +
    `  Bu dersleri açan hiçbir kullanıcı artık beklemeyecek.\n`,
);

await db.delete(userProfiles).where(eq(userProfiles.userId, WARMER_ID));
await sql.end();
