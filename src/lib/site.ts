import { LANGS } from "./content";

// Dominio público para metadata, sitemap y robots: SITE_URL si está; si no, el de producción que da Vercel.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = process.env.SITE_URL ?? (vercel ? `https://${vercel}` : "http://localhost:3000");

// Una URL por idioma (?lang=xx, ver src/proxy.ts) para hreflang; sin parámetro es la versión por defecto.
export const langUrl = (path: string, lang: string) => `${path}?lang=${lang}`;
export const langAlternates = (path: string) => ({
  ...Object.fromEntries(LANGS.map((l) => [l, langUrl(path, l)])),
  "x-default": path,
});
