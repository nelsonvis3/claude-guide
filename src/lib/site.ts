// Dominio público para metadata, sitemap y robots: SITE_URL si está; si no, el de producción que da Vercel.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = process.env.SITE_URL ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
