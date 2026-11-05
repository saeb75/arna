// 2.5D SPRITE RIG'LERİ (web) — ölçüler @glotmate/contracts/avatar'da (mobil native çizici
// de aynılarını okur); burada yalnız görsellerin WEB adresi eklenir: /avatars/<id>/<dosya>.
// Çizim: components/SpriteAvatar (WebGL yüz ağı esnetme).
import type { AvatarId } from "@glotmate/contracts";
import {
  SPRITE_FILES,
  SPRITE_RIG_GEOMETRY,
  type MouthAtlasGeometry,
  type SpriteRigGeometry,
} from "@glotmate/contracts/avatar";

export { VISEME_TO_MOUTH, type MouthShape } from "@glotmate/contracts/avatar";

export interface MouthAtlas extends MouthAtlasGeometry {
  src: string;
}

export interface SpriteEye {
  /** tam iris diski ve tuvaldeki kutusu [x, y, w, h] */
  iris: string;
  irisRect: number[];
  /** göz açıklığı maskesi (alfa) ve kapak gölgesi — ikisi de aynı kutuda */
  aperture: string;
  shadow: string;
  apertureRect: number[];
}

export interface SpriteRig extends Omit<SpriteRigGeometry, "eyes" | "mouth"> {
  base: string;
  /** açık göz katmanı, iris yerine göz beyazı (kapak/kirpik aynen) */
  sclera: string;
  eyes: SpriteEye[];
  mouth: MouthAtlas;
}

function withUrls(g: SpriteRigGeometry): SpriteRig {
  const dir = `/avatars/${g.id}`;
  return {
    ...g,
    base: `${dir}/${SPRITE_FILES.base}`,
    sclera: `${dir}/${SPRITE_FILES.sclera}`,
    eyes: g.eyes.map((e) => ({
      iris: `${dir}/${SPRITE_FILES.iris(e.side)}`,
      irisRect: e.irisRect,
      aperture: `${dir}/${SPRITE_FILES.aperture(e.side)}`,
      shadow: `${dir}/${SPRITE_FILES.shadow(e.side)}`,
      apertureRect: e.apertureRect,
    })),
    mouth: { ...g.mouth, src: `${dir}/${g.mouth.file}` },
  };
}

export const SPRITE_RIGS: Partial<Record<AvatarId, SpriteRig>> = Object.fromEntries(
  Object.entries(SPRITE_RIG_GEOMETRY).map(([id, g]) => [id, withUrls(g)]),
);
