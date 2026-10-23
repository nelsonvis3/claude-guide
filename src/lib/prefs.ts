// Preferencias de apariencia: se guardan en cookies (como el idioma) para pintar la página sin parpadeo.
export const THEMES = ["system", "light", "dark"] as const;
export const ACCENTS = ["violet", "blue", "green", "pink", "orange"] as const;
// Colores y trajes de Tilde: arte de Nelson, capas en public/tilde/<color>[/<traje>] generadas con scripts/tilde.py.
export const CATS = ["blanca", "naranja", "gris", "negra", "crema"] as const;
// Personajes con su nombre (igual en todos los idiomas) y selecciones con su código de país para Intl.DisplayNames.
export const SUIT_GROUPS = {
  anime: {
    goku: "Goku", "goku-super-saiyan": "Goku Super Saiyan", "goku-black-rose": "Goku Black Rosé", vegeta: "Vegeta",
    "vegeta-super-saiyan": "Vegeta Super Saiyan", naruto: "Naruto", "naruto-hokage": "Naruto Hokage", boruto: "Boruto",
    sasuke: "Sasuke", itachi: "Itachi", kakashi: "Kakashi", jiraiya: "Jiraiya", luffy: "Luffy", tanjiro: "Tanjiro",
  },
  movies: {
    "spider-man": "Spider-Man", "iron-man": "Iron Man", "capitan-america": "Captain America", thor: "Thor",
    "doctor-strange": "Doctor Strange", "black-panther": "Black Panther", deadpool: "Deadpool", superman: "Superman",
    batman: "Batman", "neo-matrix": "Neo",
  },
  teams: {
    argentina: "AR", brasil: "BR", uruguay: "UY", chile: "CL", colombia: "CO", mexico: "MX", "estados-unidos": "US",
    espana: "ES", portugal: "PT", francia: "FR", italia: "IT", alemania: "DE", "paises-bajos": "NL", inglaterra: "GB-ENG",
    japon: "JP", "corea-del-sur": "KR",
  },
} as const;
export const SUITS = ["none", ...Object.values(SUIT_GROUPS).flatMap((g) => Object.keys(g))];
export type Theme = (typeof THEMES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Cat = (typeof CATS)[number];
export const PREFS = { theme: THEMES, accent: ACCENTS, cat: CATS, suit: SUITS } as const;
export type PrefKey = keyof typeof PREFS;

export const catDir = (cat: Cat, suit = "none") => `/tilde/${cat}${suit === "none" ? "" : `/${suit}`}`;

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
