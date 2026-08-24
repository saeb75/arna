/**
 * TEK SEFERLİK ONARIM — selamlamaya sızmış yapı etiketlerini şablonla değiştirir.
 *
 *   npx tsx scripts/repair-session-scripts.ts [--dry-run]
 *
 * Sızıntının sebebi prompt'tu (bkz. `session/script.ts`): modele İngilizce terimi
 * "cümlenin içine dokuyarak" yazması söylendiği için model etiketi METNE yazdı.
 * 73 oturumun 24'ünde, 22 farklı varyantla. Prompt ve şema düzeltildi; bu script
 * ZATEN YAZILMIŞ olanları temizler.
 *
 * ONARIM = ŞABLONA DÖNMEK, regex'le kurtarmaya çalışmak DEĞİL. Varyantların bir
 * kısmında terimin nerede bittiği belirsiz ("{'lang':'en'} present simple third
 * person -s ile ilgili" — üç kelime mi beş mi?). Şablon deterministik ve doğru
 * bölünmüş; LLM selamlaması düşseydi zaten o gelecekti.
 *
 * Transkript, hafıza ve ilerheme DOKUNULMAZ — yalnız script'in ilgili beat'i.
 * İdempotent: ikinci koşuda 0 satır bulur.
 */
import { eq } from "drizzle-orm";
import type { LessonCore, RichText, SessionScript } from "@arna/contracts";
import { db } from "../src/db/client.js";
import { catalogLessons, lessonCores, sessions, userProfiles } from "../src/db/schema.js";
import { getChrome } from "../src/i18n/index.js";
import { nativeLanguageOf } from "../src/lib/language.js";
import { templateGreeting } from "../src/modules/session/script.js";

const DRY = process.argv.includes("--dry-run");

const dirty = (runs: unknown): boolean =>
  Array.isArray(runs) && runs.some((r) => r && typeof (r as RichText[number]).text === "string" && /[{}]/.test((r as RichText[number]).text));

const rows = await db
  .select({
    id: sessions.id,
    userId: sessions.userId,
    state: sessions.state,
    core: lessonCores.core,
    // v7 ÖNCESİ oturumlarda `core_id` boş. Konu adı için katalog başlığına
    // düşülür: kanonik İngilizce, her oturumda var, ve dersin adı zaten o.
    catalogTitle: catalogLessons.title,
  })
  .from(sessions)
  .leftJoin(lessonCores, eq(sessions.coreId, lessonCores.id))
  .leftJoin(catalogLessons, eq(sessions.catalogLessonId, catalogLessons.id));

let touched = 0;
let skipped = 0;

for (const row of rows) {
  const state = row.state as { script?: SessionScript; tutorLanguage?: "native" | "english" } | null;
  const script = state?.script;
  if (!script?.beats) continue;

  const bad = Object.entries(script.beats).filter(([, runs]) => dirty(runs));
  if (bad.length === 0) continue;

  const topic = (row.core as LessonCore | null)?.topic ?? row.catalogTitle;
  if (!topic) { skipped++; console.log(`  ⚠ ${row.id}: konu adı bulunamadı, atlandı`); continue; }

  const [profile] = await db
    .select({ displayName: userProfiles.displayName, nativeLanguage: userProfiles.nativeLanguage })
    .from(userProfiles)
    .where(eq(userProfiles.userId, row.userId))
    .limit(1);

  const tutorLanguage = state?.tutorLanguage ?? "native";
  const chrome = getChrome(tutorLanguage === "native" ? nativeLanguageOf(profile?.nativeLanguage) : "en");
  const fresh = templateGreeting({
    chrome,
    tutorLanguage,
    topic,
    displayName: profile?.displayName ?? "there",
  });

  for (const [beatId] of bad) script.beats[beatId] = fresh;

  console.log(`  ${DRY ? "○" : "✔"} ${row.id}: ${bad.map(([id]) => id).join(", ")} → şablon`);
  if (!DRY) {
    await db.update(sessions).set({ state: { ...state, script } }).where(eq(sessions.id, row.id));
  }
  touched++;
}

console.log(`\n${DRY ? "[KURU KOŞU] " : ""}${touched} oturum onarıldı · ${skipped} atlandı · ${rows.length} tarandı`);
process.exit(0);
