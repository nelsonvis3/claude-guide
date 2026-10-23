import { NextResponse, type NextRequest } from "next/server";
import { LANGS, type Lang } from "./lib/content";

// ?lang=xx (los links hreflang y el sitemap) fija el idioma: viaja a getLang como header y queda en la cookie,
// así cada idioma tiene su propia URL para los buscadores.
export function proxy(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang");
  if (!LANGS.includes(lang as Lang)) return NextResponse.next();
  const headers = new Headers(req.headers);
  headers.set("x-lang", lang!);
  const res = NextResponse.next({ request: { headers } });
  res.cookies.set("lang", lang!, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });
  return res;
}

export const config = { matcher: ["/((?!api|_next|tilde|.*\\..*).*)"] };
