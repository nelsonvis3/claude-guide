"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { login, logout, setLang } from "@/app/actions";
import { LANG_NAMES, LANGS } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export type User = { name: string; image: string | null } | null;

const PROVIDER_NAMES: Record<string, string> = { github: "GitHub", google: "Google" };

export default function Header({ user, providers }: { user: User; providers: string[] }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const pill = "rounded-full px-4 py-1.5 font-bold";
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-full focus:bg-marker focus:px-3 focus:py-1 focus:text-marker-ink">
        {t("nav.skip")}
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="display flex items-center gap-2 text-[1.1rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tilde/icon.png" alt="" className="size-8 rounded-full" />
          {t("meta.title")}
        </Link>
        <nav className="flex gap-1 text-[0.95rem] font-bold text-ink-2">
          <Link href="/#ruta" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.route")}</Link>
          <Link href="/consumo" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.usage")}</Link>
          <Link href="/chuleta" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.guide")}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="lang">{t("nav.lang")}</label>
          <select
            id="lang"
            value={lang}
            disabled={pending}
            onChange={(e) => start(async () => { await setLang(e.target.value); router.refresh(); })}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-[0.9rem]"
          >
            {LANGS.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
          </select>
          {user ? (
            <form action={logout} className="flex items-center gap-2">
              {/* Avatar chico del proveedor: next/image pediría configurar remotePatterns por una imagen de 32px. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.image && <img src={user.image} alt="" className="size-8 rounded-full" />}
              <button className={`${pill} text-ink-2 hover:bg-surface-2`}>{t("nav.logout")}</button>
            </form>
          ) : providers.length > 0 ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} aria-expanded={open} className={`${pill} bg-ink text-bg`}>
                {t("nav.login")}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 grid w-64 gap-2 rounded-2xl bg-surface p-3 shadow-soft">
                  <p className="px-1 text-[0.85rem] text-ink-2">{t("nav.loginWhy")}</p>
                  {providers.map((p) => (
                    <form key={p} action={login.bind(null, p)}>
                      <button className="w-full rounded-xl border border-line px-3 py-2 text-left font-bold hover:bg-surface-2">
                        {t("nav.loginWith", { provider: PROVIDER_NAMES[p] ?? p })}
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
