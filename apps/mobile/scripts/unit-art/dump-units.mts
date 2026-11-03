/**
 * Müfredatın ünitelerini (seviye, sıra, başlık, goal + derslerin themeHint'leri)
 * JSON olarak basar — ünite illüstrasyonu üreticisinin girdisi.
 *
 *   npx tsx apps/mobile/scripts/unit-art/dump-units.mts > /tmp/units.json
 *
 * Kaynak backend'in sabit müfredatıdır (tek doğruluk kaynağı); burada yalnız okunur.
 */
import { CURRICULUM } from "../../../backend/src/curriculum/index.js";

const out: { level: string; index: number; title: string; goal: string; hints: string[] }[] = [];
for (const [level, spec] of Object.entries(CURRICULUM)) {
  if (!spec) continue;
  for (const u of spec.units) {
    const hints = spec.lessons.filter((l) => l.unitIndex === u.index).map((l) => l.themeHint);
    out.push({ level, index: u.index, title: u.title, goal: u.goal, hints });
  }
}
console.log(JSON.stringify(out, null, 1));
