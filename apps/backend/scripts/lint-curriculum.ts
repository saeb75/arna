/**
 * Katalog lint'i — LLM'siz, DB'siz, anlık. `test-flow-rules.ts` ile aynı ruhta:
 * pedagojik sözleşmenin birim testi.
 *
 *   npx tsx scripts/lint-curriculum.ts
 *
 * Seed'den ÖNCE koşar ve hata varsa seed'i engeller. En kritik denetimi
 * `targetPhrases` üzerinde: bu alan `practice.mustUse`'a geçtiği için ders
 * akışını ölçen metin eşleşmesini besliyor. CLAUDE.md'de kayıtlı iki canlı hata
 * (gramer terimi yazılması → ölçüm hiç tetiklenmiyor, tek işlev kelimesi
 * yazılması → sahne ikinci turda kapanıyor) buradan geçmeyen bir satırla
 * yeniden doğar. Kural gövdesi kopyalanmaz, `lesson/lint.ts` yeniden kullanılır.
 */
import type { CefrLevel } from "@arna/contracts";
import {
  AUTHORED_LEVELS,
  CURRICULUM,
  curriculumLevelSchema,
  lessonId,
  specHash,
  unitId,
  type CurriculumLevel,
} from "../src/curriculum/index.js";
import { isEnglishText, lintMustUse } from "../src/modules/lesson/lint.js";

/** Art arda kaç gramer dersine izin var — üstü uyarı üretir. */
const MAX_GRAMMAR_RUN = 4;

const errors: string[] = [];
const warnings: string[] = [];

function err(where: string, message: string): void {
  errors.push(`${where}: ${message}`);
}
function warn(where: string, message: string): void {
  warnings.push(`${where}: ${message}`);
}

function lintLevel(level: CefrLevel, data: CurriculumLevel): void {
  const parsed = curriculumLevelSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      err(`${level} şema`, `${issue.path.join(".")} — ${issue.message}`);
    }
    return;
  }

  const { units, lessons } = parsed.data;

  // --- Üniteler -------------------------------------------------------------
  const unitIndexes = units.map((u) => u.index);
  if (new Set(unitIndexes).size !== unitIndexes.length) {
    err(`${level} üniteler`, "ünite index'leri benzersiz değil");
  }
  unitIndexes.forEach((idx, i) => {
    if (idx !== i + 1) err(`${level} üniteler`, `ünite index'leri 1'den kesintisiz gitmeli (${idx} beklenen ${i + 1})`);
  });
  for (const u of units) {
    if (!isEnglishText(u.title)) err(`${level} ünite ${u.index}`, `başlık İngilizce olmalı: "${u.title}"`);
    if (!isEnglishText(u.goal)) err(`${level} ünite ${u.index}`, `hedef İngilizce olmalı: "${u.goal}"`);
  }

  // --- Ders sırası ----------------------------------------------------------
  lessons.forEach((l, i) => {
    if (l.position !== i + 1) {
      err(`${level} ders ${l.position}`, `sıra kesintisiz olmalı — dizide ${i + 1}. satır ama position=${l.position}`);
    }
  });

  // --- Kimlik / başlık / focus benzersizliği --------------------------------
  const seenIds = new Map<string, number>();
  const seenFocus = new Map<string, number>();
  for (const l of lessons) {
    const id = lessonId(level, l);
    const prevId = seenIds.get(id);
    if (prevId !== undefined) {
      err(`${level} ders ${l.position}`, `kimlik "${id}" ${prevId}. dersle çakışıyor — başlıklar benzersiz olmalı`);
    }
    seenIds.set(id, l.position);

    const focusKey = l.focus.trim().toLowerCase();
    const prevFocus = seenFocus.get(focusKey);
    if (prevFocus !== undefined) {
      err(`${level} ders ${l.position}`, `focus ${prevFocus}. dersle birebir aynı — tekrar eden ders`);
    }
    seenFocus.set(focusKey, l.position);
  }

  // --- Satır bazlı denetim --------------------------------------------------
  const unitLessonCount = new Map<number, number>();
  for (const l of lessons) {
    const where = `${level} ders ${l.position} ("${l.title}")`;

    if (!units.some((u) => u.index === l.unitIndex)) {
      err(where, `unitIndex ${l.unitIndex} diye bir ünite yok`);
    }
    unitLessonCount.set(l.unitIndex, (unitLessonCount.get(l.unitIndex) ?? 0) + 1);

    // Katalog kanonik İngilizce — ana dil sızarsa katalog tek dile çivilenir
    for (const [field, value] of [
      ["title", l.title],
      ["focus", l.focus],
      ["themeHint", l.themeHint],
    ] as const) {
      if (!isEnglishText(value)) err(where, `${field} İngilizce olmalı (ASCII): "${value}"`);
    }

    // ASIL DENETİM: mustUse'u besleyen kalıplar
    const phraseErrors: string[] = [];
    for (const phrase of l.targetPhrases) {
      lintMustUse(phrase, phraseErrors);
      if (!isEnglishText(phrase)) phraseErrors.push(`targetPhrase "${phrase}": İngilizce olmalı`);
    }
    for (const e of phraseErrors) err(where, e);

    if (new Set(l.targetPhrases.map((p) => p.toLowerCase())).size !== l.targetPhrases.length) {
      err(where, "targetPhrases içinde tekrar var");
    }
  }

  for (const u of units) {
    const count = unitLessonCount.get(u.index) ?? 0;
    if (count === 0) err(`${level} ünite ${u.index}`, "hiç dersi yok");
    else if (count < 3) warn(`${level} ünite ${u.index}`, `yalnızca ${count} ders — üniteler en az 3 ders taşımalı`);
  }

  // --- Ritim: art arda çok fazla gramer dersi -------------------------------
  // Konuşma uygulamasında uzun gramer serisi öğrenciyi konuşturmadan yoruyor.
  // Tavan 4; 5. üst üste gramer dersinde uyarır.
  let run = 0;
  for (const l of lessons) {
    run = l.kind === "grammar" ? run + 1 : 0;
    if (run === MAX_GRAMMAR_RUN + 1) {
      warn(
        `${level} ders ${l.position}`,
        `art arda ${MAX_GRAMMAR_RUN + 1} gramer dersi — araya işlevsel/serbest ders girmeli`,
      );
    }
  }

  // --- Özet -----------------------------------------------------------------
  const counts = { grammar: 0, phrases: 0, practice: 0 };
  for (const l of lessons) counts[l.kind]++;
  const total = lessons.length;
  const pct = (n: number) => Math.round((n / total) * 100);
  console.log(
    `  ${level} (${parsed.data.label}): ${total} ders · ${units.length} ünite · ` +
      `grammar ${counts.grammar} (%${pct(counts.grammar)}) · ` +
      `phrases ${counts.phrases} (%${pct(counts.phrases)}) · ` +
      `practice ${counts.practice} (%${pct(counts.practice)})`,
  );
}

console.log("\nKATALOG LINT\n");

let totalLessons = 0;
for (const level of AUTHORED_LEVELS) {
  const data = CURRICULUM[level];
  if (!data) continue;
  totalLessons += data.lessons.length;
  lintLevel(level, data);
}

// Kimlik çakışması seviyeler arası da olmamalı (kimlik seviye önekli ama override edilebiliyor)
const globalIds = new Map<string, string>();
for (const level of AUTHORED_LEVELS) {
  const data = CURRICULUM[level];
  if (!data) continue;
  for (const l of data.lessons) {
    const id = lessonId(level, l);
    const prev = globalIds.get(id);
    if (prev) err("katalog", `kimlik "${id}" iki seviyede birden: ${prev} ve ${level}/${l.position}`);
    globalIds.set(id, `${level}/${l.position}`);
  }
}

// Örnek hash + kimlik çıktısı — seed'in ne yazacağını gözle doğrulamak için
const sample = CURRICULUM.A1?.lessons[18];
if (sample) {
  console.log(
    `\n  örnek satır → id="${lessonId("A1", sample)}" specHash=${specHash("A1", sample)} unit=${unitId("A1", sample.unitIndex)}`,
  );
}

console.log(`\n  TOPLAM: ${totalLessons} ders, ${globalIds.size} benzersiz kimlik\n`);

if (warnings.length) {
  console.log(`UYARI (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`HATA (${errors.length}):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log("");
  process.exit(1);
}

console.log("✓ Katalog temiz.\n");
