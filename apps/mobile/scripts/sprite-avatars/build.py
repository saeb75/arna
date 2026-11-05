"""
NATIVE 2.5D AVATAR VARLIKLARI — apps/web/public/avatars/<id>/ → apps/mobile/assets/avatars/<id>/
+ src/domain/spriteAssets.ts (require haritası + türetilmiş katman kutuları).

Neden türetme var: web gözü 2D canvas'ta kurar (göz beyazı + iris, açıklık maskesiyle
`destination-in` kırpılır). Native'de maske katmanı yok (yeni native paket = OTA'sız build),
bu yüzden kırpma GÖRSELE gömülür: her göz için "çerçeve" = portre + göz beyazı birleşimi,
açıklık maskesinin olduğu yer oyulmuş. Sıra: portre → göz beyazı → iris (kayar) → çerçeve
→ kapak gölgesi. İris açıklıktan görünür, dışına taşan kısmını çerçeve örter — web'in
`destination-in` sonucuyla piksel düzeyinde aynı.

    python3 -I apps/mobile/scripts/sprite-avatars/build.py   (repo kökünden)

Ölçüler @glotmate/contracts/avatar rigs.ts ile aynı olmalı (scleraRect burada da okunur).
"""
import json
import re
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
WEB = ROOT / "apps/web/public/avatars"
OUT = ROOT / "apps/mobile/assets/avatars"
MAP = ROOT / "apps/mobile/src/domain/spriteAssets.ts"
RIG_DATA = ROOT / "packages/contracts/src/avatar/rigData.ts"
RIGS = ROOT / "packages/contracts/src/avatar/rigs.ts"
# İris kayma payı (tuval pikseli): bakış ±5 px × gazeScale, + kenar yumuşatma
MARGIN = 8
LAYER_FILES = ["layer_bg.jpg", "layer_neck.webp", "layer_head.webp", "layer_body.webp"]

rig_data = RIG_DATA.read_text()
rigs_src = RIGS.read_text()


def const(name: str):
    m = re.search(rf"export const {name} = (\{{.*?\}})(?: as const)?;\n", rig_data)
    return json.loads(m.group(1))


def sclera_rect(rid: str):
    block = rigs_src[rigs_src.index(f'id: "{rid}"'):]
    m = re.search(r"scleraRect: \[(\d+), (\d+), (\d+), (\d+)\]", block)
    return [int(v) for v in m.groups()]


def atlas_file(rid: str) -> str:
    block = rigs_src[rigs_src.index(f'id: "{rid}"'):]
    return re.search(r'file: "([^"]+)"', block).group(1)


entries = []
for rid in ["raven", "kai", "lena", "theo"]:
    src, dst = WEB / rid, OUT / rid
    dst.mkdir(parents=True, exist_ok=True)
    eyes = const(f"{rid.upper()}_EYES")
    atlas = atlas_file(rid)
    base = Image.open(src / "portrait_base.jpg").convert("RGBA")
    sclera = Image.open(src / "eyes_sclera.png").convert("RGBA")
    W, H = base.size

    # 1) taban + atlas aynen (mobilde jpg/webp doğrudan çözülür)
    shutil.copy(src / "portrait_base.jpg", dst / "portrait_base.jpg")
    shutil.copy(src / atlas, dst / atlas)

    # 2) göz beyazı: yalnız saydam olmayan kutu (1024² yerine ~300×110)
    sx, sy, sw, sh = sclera_rect(rid)
    sclera.crop((sx, sy, sx + sw, sy + sh)).save(dst / "eyes_open.png", optimize=True)

    # 3) göz başına iris + kapak gölgesi + çerçeve
    composite = Image.alpha_composite(base, sclera)
    frames = {}
    for side in ["L", "R"]:
        shutil.copy(src / f"iris_{side}.png", dst / f"iris_{side}.png")
        shutil.copy(src / f"lidshadow_{side}.png", dst / f"lidshadow_{side}.png")
        ax, ay, aw, ah = eyes[side]["aperture"]
        ix, iy, iw, ih = eyes[side]["iris"]
        fx0 = max(0, min(ax, ix) - MARGIN)
        fy0 = max(0, min(ay, iy) - MARGIN)
        fx1 = min(W, max(ax + aw, ix + iw) + MARGIN)
        fy1 = min(H, max(ay + ah, iy + ih) + MARGIN)
        frame = np.asarray(composite.crop((fx0, fy0, fx1, fy1))).copy()
        ap = np.asarray(Image.open(src / f"aperture_{side}.png").convert("RGBA"))[..., 3].astype(np.float32) / 255
        alpha = np.ones(frame.shape[:2], np.float32)
        oy, ox = ay - fy0, ax - fx0
        alpha[oy:oy + ap.shape[0], ox:ox + ap.shape[1]] = 1 - ap
        frame[..., 3] = np.round(alpha * 255).astype(np.uint8)
        Image.fromarray(frame).save(dst / f"eyeframe_{side}.png", optimize=True)
        frames[side] = [fx0, fy0, fx1 - fx0, fy1 - fy0]
    # 4) katmanlı beden (varsa): arka plan + boyun altlığı + baş + gövde — aynen
    layered = all((src / f).exists() for f in LAYER_FILES)
    if layered:
        for f in LAYER_FILES:
            shutil.copy(src / f, dst / f)
    entries.append((rid, atlas, frames, layered))

lines = [
    "// ÜRETİLMİŞ — elle düzenleme: scripts/sprite-avatars/build.py yeniden üretir.",
    "// Native 2.5D avatar görselleri (paketlenmiş: OTA ile gider) + türetilmiş göz çerçevesi kutuları.",
    'import type { AvatarId } from "@glotmate/contracts";',
    "",
    "export interface SpriteAssetSet {",
    "  base: number;",
    "  atlas: number;",
    "  /** göz beyazı, scleraRect kutusuna kırpılmış */",
    "  eyesOpen: number;",
    "  eyes: Record<\"L\" | \"R\", { iris: number; shadow: number; frame: number; /** [x, y, w, h] tuval pikseli */ frameRect: [number, number, number, number] }>;",
    "  /** katmanlı beden (rig.layers kutularıyla) — yoksa portre bütün salınır */",
    "  layers?: { bg: number; neck: number; head: number; body: number };",
    "}",
    "",
    "export const SPRITE_ASSETS: Partial<Record<AvatarId, SpriteAssetSet>> = {",
]
for rid, atlas, frames, layered in entries:
    p = f"../../assets/avatars/{rid}"
    lines += [
        f"  {rid}: {{",
        f'    base: require("{p}/portrait_base.jpg"),',
        f'    atlas: require("{p}/{atlas}"),',
        f'    eyesOpen: require("{p}/eyes_open.png"),',
        "    eyes: {",
    ]
    for side in ["L", "R"]:
        lines.append(
            f'      {side}: {{ iris: require("{p}/iris_{side}.png"), shadow: require("{p}/lidshadow_{side}.png"), '
            f'frame: require("{p}/eyeframe_{side}.png"), frameRect: {json.dumps(frames[side])} }},'
        )
    lines.append("    },")
    if layered:
        lines.append(
            f'    layers: {{ bg: require("{p}/layer_bg.jpg"), neck: require("{p}/layer_neck.webp"), '
            f'head: require("{p}/layer_head.webp"), body: require("{p}/layer_body.webp") }},'
        )
    lines.append("  },")
lines += ["};", ""]
MAP.write_text("\n".join(lines))
print("ok:", ", ".join(e[0] + (" (katmanlı)" if e[3] else "") for e in entries))
