/**
 * İNCELEME DÖKÜMÜ — insan onayının okuduğu yüzey.
 *
 *   set -a; source .env; set +a; npx tsx scripts/review-dump.ts --level B1
 *
 * /tmp/review-<level>.md üretir: ders başına iddialar + örnekler + alıştırmalar
 * + cevaplar + 5 sahne yan yana. Pedagojinin TAMAMI bu dökümde — dil paketleri
 * bu iddiaları yalnızca anlatır, değiştiremez. Onaydan sonra:
 *   npx tsx scripts/publish-level.ts --level B1
 */
import { writeFileSync } from "node:fs";
import { and, asc, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonSceneSets } from "../src/db/schema.js";
import type { LessonCore, SceneVariant } from "@arna/contracts";

const level = process.argv[process.argv.indexOf("--level") + 1];
if (!level || level.startsWith("--")) {
  console.error("--level zorunlu");
  process.exit(1);
}

const rows = await db
  .select({ cat: catalogLessons, core: lessonCores })
  .from(catalogLessons)
  .innerJoin(lessonCores, eq(lessonCores.catalogLessonId, catalogLessons.id))
  .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")))
  .orderBy(asc(catalogLessons.position));

const lines: string[] = [
  `# ${level} inceleme dökümü — ${rows.length} ders`,
  ``,
  `Okurken sorulacak tek soru: **bu iddialar doğru mu ve bu seviyeye uygun mu?**`,
  `Dil paketleri bu iddiaları anlatır ama DEĞİŞTİREMEZ — burada onaylanan şey,`,
  `50 dilde öğretilecek pedagojinin tamamıdır.`,
  ``,
];

for (const { cat, core: coreRow } of rows) {
  if (!coreRow.core) continue;
  const core = coreRow.core as LessonCore;
  lines.push(`---`, ``, `## ${cat.position}. ${cat.title}  \`${cat.id}\` (${cat.kind}, ${coreRow.status})`);
  lines.push(`**Focus:** ${core.focus}`);
  lines.push(``);

  for (const b of core.lecture.beats) {
    if (b.kind === "teach") {
      for (const p of b.points) {
        lines.push(`**${p.formEn}**`);
        for (const c of p.claimsEn) lines.push(`- ${c}`);
        for (const ex of p.examples) lines.push(`  - _${ex.textEn}_`);
      }
      lines.push(``);
    }
    if (b.kind === "exercise") {
      const answer =
        b.answerSpec.kind === "choice"
          ? `→ ${b.options?.[b.answerSpec.correctIndex]}`
          : `→ ${b.answerSpec.accepted.join(" / ")}`;
      lines.push(`- [${b.format}] ${b.item}${b.options ? ` (${b.options.join(" | ")})` : ""} ${answer}`);
    }
    if (b.kind === "open_response") {
      lines.push(`- [open] ${b.question} → örnek: ${b.exampleAnswer}`);
    }
  }

  const [sceneRow] = await db
    .select()
    .from(lessonSceneSets)
    .where(eq(lessonSceneSets.coreId, coreRow.id))
    .limit(1);
  if (sceneRow?.scenes) {
    lines.push(``, `**Sahneler** (mustUse: ${core.practice.mustUse.join(" · ")}):`);
    for (const [track, s] of Object.entries(sceneRow.scenes as Record<string, SceneVariant>)) {
      lines.push(`- ${track}: ${s.persona.name} — ${s.scene} _"${s.avatarOpening}"_`);
    }
  }
  lines.push(``);
}

const out = `/tmp/review-${level.toLowerCase()}.md`;
writeFileSync(out, lines.join("\n"));
console.log(`${out} yazıldı — ${rows.length} ders. Onaydan sonra: npx tsx scripts/publish-level.ts --level ${level}`);
await sql.end();
