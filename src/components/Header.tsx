"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLang } from "@/app/actions";
import { LANG_NAMES, LANGS } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-marker focus:px-3 focus:py-1 focus:text-marker-ink">
        {t("nav.skip")}
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="display flex items-center gap-1.5 text-[1.2rem]">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-cobalt text-[1.3rem] text-marker">~</span>
          {t("meta.title")}
        </Link>
        <nav className="flex gap-4 font-bold">
          <Link href="/#ruta" className="underline-offset-4 hover:underline">{t("nav.route")}</Link>
          <Link href="/chuleta" className="underline-offset-4 hover:underline">{t("nav.guide")}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="sr-only" htmlFor="lang">{t("nav.lang")}</label>
          <select
            id="lang"
            value={lang}
            disabled={pending}
            onChange={(e) => start(async () => { await setLang(e.target.value); router.refresh(); })}
            className="rounded-lg border-2 border-line bg-surface px-2 py-1"
          >
            {LANGS.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
}
