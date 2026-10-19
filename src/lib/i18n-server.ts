import "server-only";
import { cookies, headers } from "next/headers";
import { LANGS, type Lang } from "./content";
import type { LessonText } from "@/components/Lesson";
import type { Messages } from "./i18n";
import { PREFS, type Accent, type Cat, type Theme } from "./prefs";

export async function getLang(): Promise<Lang> {
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

// Apariencia guardada en cookies; lo desconocido vuelve al valor de base.
export async function getPrefs() {
  const jar = await cookies();
  const pick = <T extends string>(key: keyof typeof PREFS, fallback: T) => {
    const v = jar.get(key)?.value;
    return ((PREFS[key] as readonly string[]).includes(v ?? "") ? v : fallback) as T;
  };
  return { theme: pick<Theme>("theme", "system"), accent: pick<Accent>("accent", "violet"), cat: pick<Cat>("cat", "blanca") };
}
