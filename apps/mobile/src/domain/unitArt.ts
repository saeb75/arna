import type { ImageSourcePropType } from "react-native";

/**
 * Ünite illüstrasyonları (soft 3D) — ÜRETİLMİŞ dosya, elle düzenlenmez:
 * `node apps/mobile/scripts/unit-art/write-map.mjs`. Anahtar `<seviye>-<ünite sırası>`.
 * Görseller `scripts/unit-art/generate.py` ile Gemini'den üretildi.
 */
const UNIT_ART: Record<string, ImageSourcePropType> = {
  "A1-1": require("../../assets/units/A1-1.jpg"),
  "A1-2": require("../../assets/units/A1-2.jpg"),
  "A1-3": require("../../assets/units/A1-3.jpg"),
  "A1-4": require("../../assets/units/A1-4.jpg"),
  "A1-5": require("../../assets/units/A1-5.jpg"),
  "A1-6": require("../../assets/units/A1-6.jpg"),
  "A1-7": require("../../assets/units/A1-7.jpg"),
  "A1-8": require("../../assets/units/A1-8.jpg"),
  "A2-1": require("../../assets/units/A2-1.jpg"),
  "A2-2": require("../../assets/units/A2-2.jpg"),
  "A2-3": require("../../assets/units/A2-3.jpg"),
  "A2-4": require("../../assets/units/A2-4.jpg"),
  "A2-5": require("../../assets/units/A2-5.jpg"),
  "A2-6": require("../../assets/units/A2-6.jpg"),
  "A2-7": require("../../assets/units/A2-7.jpg"),
  "A2-8": require("../../assets/units/A2-8.jpg"),
  "A2-9": require("../../assets/units/A2-9.jpg"),
  "B1-1": require("../../assets/units/B1-1.jpg"),
  "B1-2": require("../../assets/units/B1-2.jpg"),
  "B1-3": require("../../assets/units/B1-3.jpg"),
  "B1-4": require("../../assets/units/B1-4.jpg"),
  "B1-5": require("../../assets/units/B1-5.jpg"),
  "B1-6": require("../../assets/units/B1-6.jpg"),
  "B1-7": require("../../assets/units/B1-7.jpg"),
  "B1-8": require("../../assets/units/B1-8.jpg"),
  "B1-9": require("../../assets/units/B1-9.jpg"),
  "B1-10": require("../../assets/units/B1-10.jpg"),
  "B1-11": require("../../assets/units/B1-11.jpg"),
  "B2-1": require("../../assets/units/B2-1.jpg"),
  "B2-2": require("../../assets/units/B2-2.jpg"),
  "B2-3": require("../../assets/units/B2-3.jpg"),
  "B2-4": require("../../assets/units/B2-4.jpg"),
  "B2-5": require("../../assets/units/B2-5.jpg"),
  "B2-6": require("../../assets/units/B2-6.jpg"),
  "B2-7": require("../../assets/units/B2-7.jpg"),
  "B2-8": require("../../assets/units/B2-8.jpg"),
  "B2-9": require("../../assets/units/B2-9.jpg"),
  "B2-10": require("../../assets/units/B2-10.jpg"),
  "B2-11": require("../../assets/units/B2-11.jpg"),
  "C1-1": require("../../assets/units/C1-1.jpg"),
  "C1-2": require("../../assets/units/C1-2.jpg"),
  "C1-3": require("../../assets/units/C1-3.jpg"),
  "C1-4": require("../../assets/units/C1-4.jpg"),
  "C1-5": require("../../assets/units/C1-5.jpg"),
  "C1-6": require("../../assets/units/C1-6.jpg"),
  "C1-7": require("../../assets/units/C1-7.jpg"),
  "C1-8": require("../../assets/units/C1-8.jpg"),
  "C1-9": require("../../assets/units/C1-9.jpg"),
  "C1-10": require("../../assets/units/C1-10.jpg"),
  "C2-1": require("../../assets/units/C2-1.jpg"),
  "C2-2": require("../../assets/units/C2-2.jpg"),
  "C2-3": require("../../assets/units/C2-3.jpg"),
  "C2-4": require("../../assets/units/C2-4.jpg"),
  "C2-5": require("../../assets/units/C2-5.jpg"),
  "C2-6": require("../../assets/units/C2-6.jpg"),
  "C2-7": require("../../assets/units/C2-7.jpg"),
  "C2-8": require("../../assets/units/C2-8.jpg"),
  "C2-9": require("../../assets/units/C2-9.jpg"),
};

/** Ünitenin kapak görseli; yoksa null (kart gradyan yedeğine döner). */
export function unitArt(level: string, unitIndex: number): ImageSourcePropType | null {
  return UNIT_ART[`${level}-${unitIndex}`] ?? null;
}
