"use client";
import { AVATAR_PRESETS, catDir } from "@/lib/prefs";

// Foto de perfil: avatar prearmado ("preset:<id>"), imagen subida o de la cuenta, o Tilde por defecto.
export default function Avatar({ src, size = 32 }: { src: string | null; size?: number }) {
  const preset = src?.startsWith("preset:") ? AVATAR_PRESETS.find((p) => `preset:${p.id}` === src) : null;
  const p = preset ?? (src ? null : AVATAR_PRESETS[0]);
  if (p) {
    const w = size * 1.4;
    return (
      <span aria-hidden="true" className="relative inline-block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, background: p.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${catDir(p.cat)}/head.webp`} alt="" className="absolute max-w-none" style={{ width: w, left: size / 2 - w * 0.48, top: size * 0.08 - w * 0.06 }} />
      </span>
    );
  }
  // Imagen subida (data URL) o del proveedor: chica, no vale la pena next/image con remotePatterns.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src!} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
}
