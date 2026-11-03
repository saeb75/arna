/**
 * `assets/units/*.jpg` → `src/domain/unitArt.ts` (statik require haritası).
 * Metro yalnız statik `require` çözer; dosya listesi değişince bu betik yeniden koşar:
 *
 *   node apps/mobile/scripts/unit-art/write-map.mjs
 */
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, "..", "..", "assets", "units");
const target = join(here, "..", "..", "src", "domain", "unitArt.ts");

const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
const keys = readdirSync(assets)
  .filter((f) => /^[A-C][12]-\d+\.jpg$/.test(f))
  .map((f) => f.replace(/\.jpg$/, ""))
  .sort((a, b) => {
    const [la, ia] = a.split("-");
    const [lb, ib] = b.split("-");
    return order.indexOf(la) - order.indexOf(lb) || Number(ia) - Number(ib);
  });

const lines = keys.map((k) => `  "${k}": require("../../assets/units/${k}.jpg"),`).join("\n");
writeFileSync(
  target,
  `import type { ImageSourcePropType } from "react-native";

/**
 * Ünite illüstrasyonları (soft 3D) — ÜRETİLMİŞ dosya, elle düzenlenmez:
 * \`node apps/mobile/scripts/unit-art/write-map.mjs\`. Anahtar \`<seviye>-<ünite sırası>\`.
 * Görseller \`scripts/unit-art/generate.py\` ile Gemini'den üretildi.
 */
const UNIT_ART: Record<string, ImageSourcePropType> = {
${lines}
};

/** Ünitenin kapak görseli; yoksa null (kart gradyan yedeğine döner). */
export function unitArt(level: string, unitIndex: number): ImageSourcePropType | null {
  return UNIT_ART[\`\${level}-\${unitIndex}\`] ?? null;
}
`,
);
console.log(`unitArt.ts: ${keys.length} görsel`);
