import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { ExprAtlasGeometry } from "@glotmate/contracts/avatar";
import { SpriteTile } from "./SpriteTile";

export interface PatchTile {
  col: SharedValue<number>;
  row: SharedValue<number>;
  opacity: SharedValue<number>;
}

/**
 * İFADE YAMASI — SpriteAvatar'ın kaş / göz kapağı / gülümseme katmanı: atlasın iki karesi
 * (alt opak, üst karışım) yamanın tuvaldeki kutusunda üst üste. Hangi kare, hangi opaklık:
 * contracts `exprFrames` — burada yalnız çizim. Kareler tek satırdır (expr_atlas.py).
 */
export function SpritePatch({ geometry, source, a, b }: { geometry: ExprAtlasGeometry; source: number; a: PatchTile; b: PatchTile }) {
  const [x0, y0] = geometry.roi as [number, number];
  const [tw, th] = geometry.tileSize as [number, number];
  const tile = { source, tileW: tw, tileH: th, atlasW: tw * geometry.axis.length, atlasH: th };
  return (
    // Kutu rig verisinden gelen ÇALIŞMA ZAMANI değeri — gerekçeli inline stil
    <View className="absolute overflow-hidden" style={{ left: x0, top: y0, width: tw, height: th }} pointerEvents="none">
      <SpriteTile {...tile} {...a} />
      <SpriteTile {...tile} {...b} />
    </View>
  );
}
