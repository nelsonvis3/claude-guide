import type { MetadataRoute } from "next";
import { NODES, ROLE_IDS } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// Páginas públicas, lecciones y guías. El idioma va por cookie, así que cada URL es una sola para los 9.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/guia", "/consumo", "/chuleta", "/estudiar", "/prompts", "/examen", "/contacto", "/terminos"];
  return [
    ...pages.map((p) => ({ url: SITE_URL + p, priority: p ? 0.8 : 1 })),
    ...ROLE_IDS.map((r) => ({ url: `${SITE_URL}/guia/${r}`, priority: 0.7 })),
    ...NODES.map((n) => ({ url: `${SITE_URL}/leccion/${n.id}`, priority: 0.6 })),
  ];
}
