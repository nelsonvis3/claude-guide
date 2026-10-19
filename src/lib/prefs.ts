// Preferencias de apariencia: se guardan en cookies (como el idioma) para pintar la página sin parpadeo.
export const THEMES = ["system", "light", "dark"] as const;
export const ACCENTS = ["violet", "blue", "green", "pink", "orange"] as const;
// Variantes de Tilde generadas con scripts/recolor.py. "blanca" es el dibujo original.
export const CATS = ["blanca", "naranja", "gris", "negra", "crema"] as const;
export type Theme = (typeof THEMES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Cat = (typeof CATS)[number];
export const PREFS = { theme: THEMES, accent: ACCENTS, cat: CATS } as const;
export type PrefKey = keyof typeof PREFS;

export const catDir = (cat: Cat) => (cat === "blanca" ? "/tilde" : `/tilde/${cat}`);

// Avatares prearmados: la cara de Tilde en cada color, sobre un fondo.
export const AVATAR_PRESETS = [
  { id: "lila", cat: "blanca", bg: "#966c9d" },
  { id: "menta", cat: "naranja", bg: "#7cc4a8" },
  { id: "cielo", cat: "gris", bg: "#7fb0e6" },
  { id: "ambar", cat: "negra", bg: "#f2b45a" },
  { id: "rosa", cat: "crema", bg: "#e89ab8" },
  { id: "noche", cat: "blanca", bg: "#2f2a45" },
] as const satisfies readonly { id: string; cat: Cat; bg: string }[];

export const MAX_AVATAR = 80_000; // caracteres del data URL: una imagen de 160 px en webp ocupa mucho menos

// Lo que se acepta como foto: un preset conocido o un data URL de imagen chico.
export function validAvatar(v: string) {
  if (v.startsWith("preset:")) return AVATAR_PRESETS.some((p) => `preset:${p.id}` === v);
  return v.length <= MAX_AVATAR && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(v);
}
