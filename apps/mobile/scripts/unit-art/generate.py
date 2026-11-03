"""Ünite illüstrasyonları — Gemini 3 Pro Image ile SOFT 3D kapak görselleri.

Her ünite için bir 16:9 sahne üretir, 960 px genişliğe küçültüp JPEG olarak
`apps/mobile/assets/units/<seviye>-<sıra>.jpg` yazar. Tutarlılık için ilk görsel
(STİL ÇAPASI, varsayılan A1-1) sonraki her isteğe referans olarak eklenir.

  npx tsx apps/mobile/scripts/unit-art/dump-units.mts > /tmp/units.json
  GEMINI_API_KEY=... python3 -I apps/mobile/scripts/unit-art/generate.py /tmp/units.json [A1-1 A1-2 ...]

Var olan dosya ATLANIR (yeniden üretmek için dosyayı sil). Ardından
`node apps/mobile/scripts/unit-art/write-map.mjs` require haritasını yeniler.
Anahtar yalnız ortamdan okunur, hiçbir çıktıya yazılmaz.
"""
import base64
import json
import os
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

MODEL = "gemini-3-pro-image"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(HERE, "..", "..", "assets", "units"))
ANCHOR = "A1-1"

STYLE = """
Soft 3D illustration in a warm, premium children's-film style: smooth rounded shapes, matte clay-like
materials, gentle subsurface skin, soft global illumination with a warm rim light, shallow depth of field.
Friendly ADULT characters (young adults to middle-aged) with diverse looks and simple expressive faces,
stylised proportions (slightly larger heads), never photoreal.
Palette: warm cream, peach, terracotta and ember orange (#f07a34, #e5484a) accents, muted sage green,
soft warm browns; avoid saturated blue and purple. Background: a softly blurred, simple warm environment
that fits the scene, light and airy, lots of breathing room. Composition: wide 16:9, ONE clear moment,
main subject slightly right of centre so a title can sit on the left, nothing important at the edges.
ABSOLUTELY NO text, letters, numbers, signs with writing, logos, UI elements, borders or watermarks.
"""


def brief(unit: dict) -> str:
    hints = "; ".join(unit["hints"][:4])
    return (
        f'Unit theme of an English course: "{unit["title"]}". Learners will be able to: {unit["goal"]}.\n'
        f"Situations from its lessons: {hints}.\n"
        "Depict ONE warm, instantly readable everyday moment that captures this theme for an adult learner."
    )


def request(unit: dict, key: str, anchor_b64: str | None) -> bytes:
    parts: list[dict] = [{"text": STYLE + "\n" + brief(unit)}]
    if anchor_b64:
        parts.append(
            {
                "text": "Match EXACTLY the rendering style, lighting, palette and character design language "
                "of this reference image, but draw a completely different scene:"
            }
        )
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": anchor_b64}})
    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"},
        },
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    raise RuntimeError(f"no image in response: {json.dumps(data)[:300]}")


def save(raw: bytes, path: str) -> None:
    """960 px genişlik, JPEG — paket boyutu için (ham çıktı ~1 MB)."""
    with tempfile.NamedTemporaryFile(suffix=".img", delete=False) as tmp:
        tmp.write(raw)
    try:
        subprocess.run(
            ["sips", "-Z", "960", "-s", "format", "jpeg", "-s", "formatOptions", "80", tmp.name, "--out", path],
            check=True,
            capture_output=True,
        )
    finally:
        os.unlink(tmp.name)


def generate(unit: dict, key: str, anchor_b64: str | None) -> str:
    name = f'{unit["level"]}-{unit["index"]}'
    path = os.path.join(OUT_DIR, f"{name}.jpg")
    if os.path.exists(path):
        return f"{name}: skip (exists)"
    for attempt in range(3):
        try:
            save(request(unit, key, anchor_b64), path)
            return f"{name}: ok"
        except (urllib.error.URLError, RuntimeError, TimeoutError) as e:
            err = e.read()[:200] if isinstance(e, urllib.error.HTTPError) else str(e)[:200]
            last = f"{name}: attempt {attempt + 1} failed: {err!r}"
    return last


def main() -> None:
    units = json.load(open(sys.argv[1]))
    wanted = set(sys.argv[2:])
    key = os.environ["GEMINI_API_KEY"]
    os.makedirs(OUT_DIR, exist_ok=True)

    by_name = {f'{u["level"]}-{u["index"]}': u for u in units}
    anchor_path = os.path.join(OUT_DIR, f"{ANCHOR}.jpg")
    if not os.path.exists(anchor_path):
        print(generate(by_name[ANCHOR], key, None), flush=True)
    anchor_b64 = base64.b64encode(open(anchor_path, "rb").read()).decode()

    todo = [u for n, u in by_name.items() if n != ANCHOR and (not wanted or n in wanted)]
    with ThreadPoolExecutor(max_workers=6) as pool:
        for line in pool.map(lambda u: generate(u, key, anchor_b64), todo):
            print(line, flush=True)


if __name__ == "__main__":
    main()
