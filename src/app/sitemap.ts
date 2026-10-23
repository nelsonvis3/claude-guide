import type { MetadataRoute } from "next";
import { NODES, ROLE_IDS } from "@/lib/content";
import { langAlternates, SITE_URL } from "@/lib/site";

// Páginas públicas, lecciones y guías, cada una con sus 9 idiomas (?lang=xx) como alternativas.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/guia", "/consumo", "/chuleta", "/estudiar", "/prompts", "/examen", "/contacto", "/terminos"];
  const entry = (path: string, priority: number) => ({
    url: SITE_URL + path,
    priority,
    alternates: { languages: Object.fromEntries(Object.entries(langAlternates(path)).map(([l, u]) => [l, SITE_URL + u])) },
  });
  return [
    ...pages.map((p) => entry(p, p === "/" ? 1 : 0.8)),
    ...ROLE_IDS.map((r) => entry(`/guia/${r}`, 0.7)),
    ...NODES.map((n) => entry(`/leccion/${n.id}`, 0.6)),
  ];
}
