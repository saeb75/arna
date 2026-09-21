/**
 * Admin ders matrisi — gerçek DB'ye karşı derler, contracts şemasından geçirir,
 * seviye başına özet basar. LLM yok, yazma yok.
 *   set -a; source .env; set +a; npx tsx scripts/test-admin-matrix.ts
 */
import { adminLessonsResponseSchema } from "@glotmate/contracts";
import { sql } from "../src/db/client.js";
import { getAdminLessonMatrix } from "../src/modules/admin/queries.js";

const t0 = Date.now();
const raw = await getAdminLessonMatrix();
const parsed = adminLessonsResponseSchema.parse(raw); // şemadan geçmeyen matris panelde de düşerdi
console.log(`${parsed.lessons.length} ders, ${Date.now() - t0} ms\n`);

const byLevel = new Map<string, { n: number; core: number; scene: number; loc: number; stale: number }>();
for (const l of parsed.lessons) {
  const s = byLevel.get(l.level) ?? { n: 0, core: 0, scene: 0, loc: 0, stale: 0 };
  s.n++;
  if (l.core?.status === "published") s.core++;
  if (l.sceneSet?.status === "published") s.scene++;
  s.loc += l.locales.length;
  s.stale += l.locales.filter((x) => x.stale).length;
  byLevel.set(l.level, s);
}
console.table(Object.fromEntries(byLevel));
if (parsed.lessons.some((l) => l.id.startsWith("zz-"))) throw new Error("fixture sızdı");
await sql.end();
