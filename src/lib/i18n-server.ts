import "server-only";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LANGS, type Lang } from "./content";
import type { LessonText } from "@/components/Lesson";
import type { GuideText } from "@/components/StackGuide";
import type { Messages } from "./i18n";
import { getLook } from "./db";
import { PREFS, type Accent, type Cat, type Theme } from "./prefs";
import { langAlternates, langUrl } from "./site";

export async function getLang(): Promise<Lang> {
  const fromUrl = (await headers()).get("x-lang"); // ?lang=xx, puesto por src/proxy.ts
  if (LANGS.includes(fromUrl as Lang)) return fromUrl as Lang;
  const fromCookie = (await cookies()).get("lang")?.value;
  if (LANGS.includes(fromCookie as Lang)) return fromCookie as Lang;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (LANGS.includes(code as Lang)) return code as Lang;
  }
  return "en";
}

type Tree = { [k: string]: unknown };
const isTree = (v: unknown): v is Tree => typeof v === "object" && v !== null && !Array.isArray(v);
function merge(base: Tree, over: Tree): Tree {
  const out: Tree = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isTree(v) && isTree(base[k]) ? merge(base[k], v) : v;
  return out;
}

// Lo que falte en un idioma cae al inglés y, si tampoco está, al español (el original).
export async function getMessages(lang: Lang): Promise<Messages> {
  const load = async (l: Lang) => ((await import(`../messages/${l}.json`)).default as Tree);
  let m = await load("es");
  if (lang !== "es") m = merge(m, await load("en").catch(() => ({})));
  if (lang !== "es" && lang !== "en") m = merge(m, await load(lang).catch(() => ({})));
  return m as Messages;
}

// Lecciones: si un idioma todavía no tiene una lección, se usa la inglesa y si no, la española (la original).
export async function getLessons(lang: Lang): Promise<Record<string, LessonText>> {
  const load = async (l: Lang) =>
    ((await import(`../lessons/${l}.json`).catch(() => ({ default: {} }))).default as Record<string, LessonText>);
  const chain = lang === "es" ? ["es"] : lang === "en" ? ["es", "en"] : ["es", "en", lang];
  const out: Record<string, LessonText> = {};
  for (const l of chain) Object.assign(out, await load(l as Lang));
  return out;
}

// Guías por stack: el mismo respaldo que las lecciones.
export async function getGuides(lang: Lang): Promise<Record<string, GuideText>> {
  const load = async (l: Lang) =>
    ((await import(`../guides/${l}.json`).catch(() => ({ default: {} }))).default as Record<string, GuideText>);
  const chain = lang === "es" ? ["es"] : lang === "en" ? ["es", "en"] : ["es", "en", lang];
  const out: Record<string, GuideText> = {};
  for (const l of chain) Object.assign(out, await load(l as Lang));
  return out;
}

// Metadata de una página en el idioma de quien la pide. Las privadas (index: false) no van a los buscadores.
export async function pageMetadata(
  path: string,
  pick: (m: Messages) => { title: string; description?: string },
  index = true,
): Promise<Metadata> {
  const lang = await getLang();
  const { title, description } = pick(await getMessages(lang));
  // openGraph de una página pisa entero al del layout: la imagen (src/app/opengraph-image.tsx) va de nuevo acá.
  return {
    title,
    description,
    alternates: { canonical: langUrl(path, lang), languages: langAlternates(path) },
    openGraph: { type: "website", siteName: "Procode", locale: lang, title, description, url: langUrl(path, lang), images: "/opengraph-image" },
    robots: index ? undefined : { index: false },
  };
}

// Apariencia guardada en cookies; lo desconocido vuelve al valor de base. Con sesión, el color y el traje
// salen de la cuenta (tabla looks) y la cookie queda de respaldo.
export async function getPrefs(userId?: string) {
  const jar = await cookies();
  const look = userId ? await getLook(userId) : null;
  const pick = <T extends string>(key: keyof typeof PREFS, fallback: T, saved?: string | null) => {
    const v = saved ?? jar.get(key)?.value;
    return ((PREFS[key] as readonly string[]).includes(v ?? "") ? v : fallback) as T;
  };
  return {
    theme: pick<Theme>("theme", "system"),
    accent: pick<Accent>("accent", "violet"),
    cat: pick<Cat>("cat", "blanca", look?.cat),
    suit: pick<string>("suit", "none", look?.suit),
  };
}
