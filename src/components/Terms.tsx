"use client";
import { useI18n } from "@/lib/i18n";

export default function Terms() {
  const { t, list } = useI18n();
  return (
    <main id="main" className="mx-auto grid max-w-3xl gap-4 px-4 py-12 pb-24">
      <h1 className="display text-[2.4rem]">{t("terms.title")}</h1>
      <p className="text-ink-2">{t("terms.updated")}</p>
      <div className="grid max-w-[65ch] gap-4 text-[1.05rem] leading-relaxed">
        {list("terms.body").map((p) => <p key={p}>{p}</p>)}
        <p>{t("terms.mail")}</p>
        <p>{t("nav.unofficial")}</p>
      </div>
      <a href="https://code.claude.com/docs" target="_blank" rel="noreferrer" className="font-bold text-cobalt underline underline-offset-4">
        {t("nav.docs")}
      </a>
    </main>
  );
}
