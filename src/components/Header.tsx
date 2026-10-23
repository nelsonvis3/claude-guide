"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { logout, setLang } from "@/app/actions";
import { LANG_NAMES, LANGS } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import Avatar from "./Avatar";

// provider: "github", "google", "discord", "gitlab" o "credentials" (email y contraseña).
export type User = { name: string; image: string | null; provider: string } | null;

function UserMenu({ user }: { user: NonNullable<User> }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Se cierra al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  const item = "block w-full rounded-xl px-3 py-2 text-left font-bold hover:bg-surface-2";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" aria-label={t("account.menu")} className="flex items-center gap-2 rounded-full p-0.5 pr-3 hover:bg-surface-2">
        <Avatar src={user.image} size={32} />
        <span className="hidden max-w-[10ch] truncate text-[0.95rem] font-bold sm:inline">{user.name}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 grid w-56 gap-1 rounded-2xl bg-surface p-2 shadow-soft">
          <p className="truncate px-3 py-1 text-[0.85rem] text-ink-2">{user.name}</p>
          <Link role="menuitem" href="/ajustes" onClick={() => setOpen(false)} className={item}>⚙️ {t("account.settings")}</Link>
          <Link role="menuitem" href="/#ruta" onClick={() => setOpen(false)} className={item}>🧭 {t("nav.route")}</Link>
          <Link role="menuitem" href="/#logros" onClick={() => setOpen(false)} className={item}>🏆 {t("account.achievements")}</Link>
          <form action={logout}>
            <button role="menuitem" className={`${item} text-ink-2`}>↩ {t("nav.logout")}</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Header({ user, canLogin }: { user: User; canLogin: boolean }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
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
        {/* En celular no entran todos: el menú se desliza de costado en vez de sumar otro renglón al header fijo. */}
        <nav className="flex max-w-full gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] text-[0.95rem] font-bold text-ink-2">
          <Link href="/#ruta" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.route")}</Link>
          <Link href="/guia" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("stackGuide.nav")}</Link>
          <Link href="/consumo" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.usage")}</Link>
          <Link href="/chuleta" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.guide")}</Link>
          <Link href="/estudiar" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.study")}</Link>
          <Link href="/prompts" className="rounded-full px-3 py-1 hover:bg-surface-2 hover:text-ink">{t("nav.prompt")}</Link>
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
            <UserMenu user={user} />
          ) : canLogin ? (
            <Link href="/entrar" className="rounded-full bg-ink px-4 py-1.5 font-bold text-bg">{t("nav.login")}</Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
