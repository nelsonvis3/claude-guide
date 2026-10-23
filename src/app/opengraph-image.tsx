import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagen para redes: Tilde entera (public/tilde/full.png, de scripts/tilde.py) y el nombre. En inglés: la fuente
// por defecto de next/og no tiene japonés, chino ni coreano.
export const alt = "Procode: learn Claude Code from zero to pro, free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const tilde = await readFile(join(process.cwd(), "public/tilde/full.png"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 48, padding: "0 80px", background: "#f6f4fa" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 440, height: 440, borderRadius: 999, background: "#966c9d" }}>
          <img alt="" src={`data:image/png;base64,${tilde.toString("base64")}`} width={330} height={384} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          <div style={{ fontSize: 96, fontWeight: 800, color: "#1d1830" }}>Procode</div>
          <div style={{ fontSize: 44, color: "#4b4366", lineHeight: 1.2 }}>Learn Claude Code from zero to pro</div>
          <div style={{ fontSize: 30, color: "#7449c9" }}>Free · 48 lessons · 9 languages</div>
        </div>
      </div>
    ),
    size,
  );
}
