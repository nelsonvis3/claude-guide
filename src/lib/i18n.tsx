"use client";
import { createContext, useContext, type ReactNode } from "react";
import type es from "../messages/es.json";
import type { Lang } from "./content";

export type Messages = typeof es;
const Ctx = createContext<{ lang: Lang; m: Messages } | null>(null);

export function I18nProvider({ lang, messages, children }: { lang: Lang; messages: Messages; children: ReactNode }) {
  return <Ctx.Provider value={{ lang, m: messages }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n fuera de I18nProvider");
  const get = (key: string): unknown =>
    key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], ctx.m);
  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = get(key);
    if (typeof s !== "string") return key;
    for (const [k, v] of Object.entries(vars ?? {})) s = (s as string).replaceAll(`{${k}}`, String(v));
    return s as string;
  };
  const list = (key: string) => (Array.isArray(get(key)) ? (get(key) as string[]) : []);
  const money = (digits: number) =>
    new Intl.NumberFormat(ctx.lang, { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });
  const usd = (n: number) => money(n >= 100 ? 0 : 2).format(n);
  const tokens = (n: number) =>
    new Intl.NumberFormat(ctx.lang, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  return { lang: ctx.lang, m: ctx.m, t, list, usd, tokens };
}
