"use server";
import { cookies } from "next/headers";
import { LANGS, type Lang } from "@/lib/content";

export async function setLang(lang: string) {
  if (!LANGS.includes(lang as Lang)) return;
  (await cookies()).set("lang", lang, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });
}
