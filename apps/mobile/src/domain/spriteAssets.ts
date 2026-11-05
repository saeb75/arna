// ÜRETİLMİŞ — elle düzenleme: scripts/sprite-avatars/build.py yeniden üretir.
// Native 2.5D avatar görselleri (paketlenmiş: OTA ile gider) + türetilmiş göz çerçevesi kutuları.
import type { AvatarId } from "@glotmate/contracts";

export interface SpriteAssetSet {
  base: number;
  atlas: number;
  /** göz beyazı, scleraRect kutusuna kırpılmış */
  eyesOpen: number;
  eyes: Record<"L" | "R", { iris: number; shadow: number; frame: number; /** [x, y, w, h] tuval pikseli */ frameRect: [number, number, number, number] }>;
}

export const SPRITE_ASSETS: Partial<Record<AvatarId, SpriteAssetSet>> = {
  raven: {
    base: require("../../assets/avatars/raven/portrait_base.jpg"),
    atlas: require("../../assets/avatars/raven/mouth_morph_atlas.webp"),
    eyesOpen: require("../../assets/avatars/raven/eyes_open.png"),
    eyes: {
      L: { iris: require("../../assets/avatars/raven/iris_L.png"), shadow: require("../../assets/avatars/raven/lidshadow_L.png"), frame: require("../../assets/avatars/raven/eyeframe_L.png"), frameRect: [324, 295, 95, 72] },
      R: { iris: require("../../assets/avatars/raven/iris_R.png"), shadow: require("../../assets/avatars/raven/lidshadow_R.png"), frame: require("../../assets/avatars/raven/eyeframe_R.png"), frameRect: [497, 290, 86, 82] },
    },
  },
  kai: {
    base: require("../../assets/avatars/kai/portrait_base.jpg"),
    atlas: require("../../assets/avatars/kai/mouth_atlas.webp"),
    eyesOpen: require("../../assets/avatars/kai/eyes_open.png"),
    eyes: {
      L: { iris: require("../../assets/avatars/kai/iris_L.png"), shadow: require("../../assets/avatars/kai/lidshadow_L.png"), frame: require("../../assets/avatars/kai/eyeframe_L.png"), frameRect: [398, 286, 89, 69] },
      R: { iris: require("../../assets/avatars/kai/iris_R.png"), shadow: require("../../assets/avatars/kai/lidshadow_R.png"), frame: require("../../assets/avatars/kai/eyeframe_R.png"), frameRect: [555, 285, 88, 69] },
    },
  },
  lena: {
    base: require("../../assets/avatars/lena/portrait_base.jpg"),
    atlas: require("../../assets/avatars/lena/mouth_atlas.webp"),
    eyesOpen: require("../../assets/avatars/lena/eyes_open.png"),
    eyes: {
      L: { iris: require("../../assets/avatars/lena/iris_L.png"), shadow: require("../../assets/avatars/lena/lidshadow_L.png"), frame: require("../../assets/avatars/lena/eyeframe_L.png"), frameRect: [381, 310, 110, 75] },
      R: { iris: require("../../assets/avatars/lena/iris_R.png"), shadow: require("../../assets/avatars/lena/lidshadow_R.png"), frame: require("../../assets/avatars/lena/eyeframe_R.png"), frameRect: [557, 308, 104, 75] },
    },
  },
  theo: {
    base: require("../../assets/avatars/theo/portrait_base.jpg"),
    atlas: require("../../assets/avatars/theo/mouth_atlas.webp"),
    eyesOpen: require("../../assets/avatars/theo/eyes_open.png"),
    eyes: {
      L: { iris: require("../../assets/avatars/theo/iris_L.png"), shadow: require("../../assets/avatars/theo/lidshadow_L.png"), frame: require("../../assets/avatars/theo/eyeframe_L.png"), frameRect: [395, 284, 98, 67] },
      R: { iris: require("../../assets/avatars/theo/iris_R.png"), shadow: require("../../assets/avatars/theo/lidshadow_R.png"), frame: require("../../assets/avatars/theo/eyeframe_R.png"), frameRect: [548, 286, 95, 67] },
    },
  },
};
