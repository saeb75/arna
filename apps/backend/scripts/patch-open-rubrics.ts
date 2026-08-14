/**
 * AÇIK UÇLU ADIMIN RUBRİĞİNİ YAYINLI ÇEKİRDEKLERDE DÜZELTİR. LLM ÇAĞRISI YOK.
 *
 *   set -a; source .env; set +a; npx tsx scripts/patch-open-rubrics.ts [--dry]
 *
 * NEDEN AYRI BİR SCRIPT: `author-cores --replace-published` yayınlı satırı
 * güncellerken o çekirdeğin DİL PAKETLERİNİ SİLER — haklı olarak, çünkü paketler
 * çekirdeğin iddialarını anlatır ve iddia değişince yalan söylerler. Ama burada
 * değişen alanlar `open_response`ın `question`/`rubric`/`exampleAnswer`'ı ve
 * `lessonLocalePackSchema` bu alanların HİÇBİRİNİ taşımıyor (title, theme,
 * summary, teachPoints, scenes, quizFeedback). Yani 247 paketi silip yeniden
 * ürettirmek saf israf olurdu.
 *
 * A1 değerleri BURADA SABİTLENMEZ: repo tek kaynak kalsın diye `authored/a1.ts`
 * okunur. B1'in repo kaynağı yok, o yüzden tek düzeltmesi sabit + `expect()`
 * sürüklenme koruması (emsal: patch-b1-review.ts).
 */
import { and, eq } from "drizzle-orm";
import type { LessonCore } from "@arna/contracts";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores } from "../src/db/schema.js";
import { buildCore } from "./authored/dsl.js";
import { LESSONS as A1 } from "./authored/a1.js";

const dry = process.argv.includes("--dry");
let patched = 0;
let skipped = 0;

type OpenBeat = Extract<LessonCore["lecture"]["beats"][number], { kind: "open_response" }>;
const openOf = (core: LessonCore) => core.lecture.beats.find((b) => b.kind === "open_response") as OpenBeat | undefined;

/**
 * Anahtar sırasından bağımsız karşılaştırma. ŞART: Postgres `jsonb` anahtarları
 * uzunluğa göre yeniden sıralıyor (`quiz,focus,topic,...` diye geri geliyor),
 * yani düz `JSON.stringify` DB'den okunan her çekirdeği "değişmiş" sayar.
 */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, canonical((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}
const canon = (v: unknown) => JSON.stringify(canonical(v));

/** Yalnız open_response beat'ini değiştirir; çekirdeğin geri kalanına dokunmaz. */
function withOpen(core: LessonCore, next: OpenBeat): LessonCore {
  return {
    ...core,
    lecture: { ...core.lecture, beats: core.lecture.beats.map((b) => (b.kind === "open_response" ? next : b)) },
  };
}

async function publishedRow(catalogLessonId: string) {
  const [row] = await db
    .select({ id: lessonCores.id, core: lessonCores.core, specHash: lessonCores.specHash })
    .from(lessonCores)
    .where(and(eq(lessonCores.catalogLessonId, catalogLessonId), eq(lessonCores.status, "published")))
    .limit(1);
  return row ?? null;
}

async function write(rowId: string, core: LessonCore, label: string) {
  // Kuru koşu da ne DEĞİŞECEĞİNİ yazar — sessiz bir kuru koşu işe yaramaz.
  console.log(`   ${dry ? "·" : "✍"} ${label}`);
  if (dry) return;
  await db
    .update(lessonCores)
    // status'a DOKUNULMUYOR: satır 'published' kalır, paketleri bağlı kalır.
    .set({ core, updatedAt: new Date() })
    .where(eq(lessonCores.id, rowId));
}

// --- A1: repo kaynağı otorite ------------------------------------------------
console.log("\n=== A1 (kaynak: scripts/authored/a1.ts) ===");
const catalog = await db
  .select({ id: catalogLessons.id, focus: catalogLessons.focus, targetPhrases: catalogLessons.targetPhrases })
  .from(catalogLessons)
  .where(eq(catalogLessons.level, "A1"));
const byId = new Map(catalog.map((c) => [c.id, c]));

for (const authored of A1) {
  if (!authored.open) continue;
  const cat = byId.get(authored.id);
  const row = await publishedRow(authored.id);
  if (!cat || !row?.core) continue;

  const want = openOf(buildCore(authored, { focus: cat.focus, mustUse: cat.targetPhrases as string[] }));
  const have = openOf(row.core as LessonCore);
  if (!want || !have) continue;

  const same =
    want.question === have.question &&
    want.exampleAnswer === have.exampleAnswer &&
    canon(want.rubric) === canon(have.rubric);
  if (same) continue;

  // SÜRÜKLENME KORUMASI: open_response dışında bir fark varsa bu script'in işi
  // değildir — daha geniş bir içerik değişikliği demektir ve author-cores'tan
  // (yani yeniden inceleme + yayın + paket tazeleme kapısından) geçmelidir.
  const strip = (c: LessonCore) => canon(withOpen(c, { ...openOf(c)!, question: "", exampleAnswer: "", rubric: { mustUse: [], criteria: "" } }));
  const rebuilt = buildCore(authored, { focus: cat.focus, mustUse: cat.targetPhrases as string[] });
  if (strip(rebuilt) !== strip(row.core as LessonCore)) {
    console.log(`   ⏭ ${authored.id}: çekirdeğin BAŞKA yerleri de değişmiş — author-cores'a bırakıldı`);
    skipped++;
    continue;
  }

  await write(row.id, withOpen(row.core as LessonCore, want), `${authored.id}: ${JSON.stringify(have.rubric.mustUse)} → ${JSON.stringify(want.rubric.mustUse)}`);
  patched++;
}

// --- B1: repo kaynağı yok, tek düzeltme sabit + koruma -----------------------
console.log("\n=== B1 (repo kaynağı yok — sabit yama) ===");
{
  const id = "b1-we-would-spend-summers-there";
  const row = await publishedRow(id);
  const have = row?.core ? openOf(row.core as LessonCore) : undefined;
  if (!row || !have) {
    console.log(`   ⏭ ${id}: yayınlı çekirdek/açık uçlu adım yok`);
  } else if (have.exampleAnswer !== "Every summer we'd visit the beach.") {
    // Beklenen metin yoksa içerik başkası tarafından değiştirilmiştir — körlemesine yazma.
    console.log(`   ⏭ ${id}: beklenen örnek bulunamadı ("${have.exampleAnswer}") — atlandı`);
    skipped++;
  } else {
    const next: OpenBeat = {
      ...have,
      // Kalıp zaten oradaydı ama kısaltma ("we'd") onu görünmez kılıyordu.
      // Açık yazım öğrenciye 'would' kalıbını gösteriyor.
      exampleAnswer: "Every summer we would visit the beach and we would stay for a week.",
    };
    await write(row.id, withOpen(row.core as LessonCore, next), `${id}: örnek açık yazıma çevrildi`);
    patched++;
  }
}

console.log(`\n${dry ? "[KURU KOŞU] " : ""}${patched} çekirdek yamalandı · ${skipped} atlandı`);
console.log("Dil paketlerine ve yayın durumuna DOKUNULMADI.\n");
await sql.end();
