import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "GlotMate: Learn English by speaking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The link preview: the brand gradient, the app icon and the promise. */
export default async function OpengraphImage() {
  const icon = await readFile(join(process.cwd(), "src/assets/icon.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "white",
          backgroundImage: "linear-gradient(120deg, #f07a34, #e5484a)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img
            src={iconSrc}
            width={96}
            height={96}
            alt=""
            style={{ borderRadius: 26, border: "3px solid rgba(255,255,255,0.35)" }}
          />
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1 }}>GlotMate</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            Learn English by speaking
          </div>
          <div style={{ fontSize: 36, opacity: 0.92 }}>
            An AI tutor, lessons at your level, real-life role plays
          </div>
        </div>
      </div>
    ),
    size,
  );
}
