"use client";
import Link from "next/link";
import { BOOKS, GRIT_TIPS, LEARN_TIPS } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { Peek } from "./Mascot";

const SECTIONS = ["learn", "grit", "books"] as const;

function Tips({ ns, ids }: { ns: string; ids: string[] }) {
  const { t } = useI18n();
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ids.map((id) => (
        <li key={id} className="rounded-3xl bg-surface p-5 shadow-soft">
          <h3 className="text-[1.15rem] font-bold">{t(`study.${ns}.${id}.title`)}</h3>
          <p className="mt-1 text-ink-2">{t(`study.${ns}.${id}.body`)}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Study() {
  const { t } = useI18n();
  const h2 = "display text-[1.8rem] sm:text-[2.2rem] scroll-mt-20";
  return (
    <main id="main" className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-12">
      <div className="relative">
        <Peek size={110} className="absolute -top-[30px] right-0 hidden sm:block" />
        <h1 className="display text-[2.6rem] sm:text-[3.6rem]">{t("study.title")}</h1>
        <p className="mt-3 max-w-[60ch] text-[1.15rem] text-ink-2">{t("study.lead")}</p>
        <Link href="/#ruta" className="mt-4 inline-block font-bold text-cobalt underline underline-offset-4">{t("guide.back")}</Link>
        <nav aria-label={t("guide.jump")} className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s} href={`#${s}`} className="rounded-full bg-surface px-4 py-1.5 font-bold shadow-soft hover:bg-cobalt hover:text-cobalt-ink">
              {t(`study.${s}Title`)}
            </a>
          ))}
        </nav>
      </div>

      <section>
        <h2 id="learn" className={h2}>{t("study.learnTitle")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("study.learnLead")}</p>
        <Tips ns="learn" ids={LEARN_TIPS} />
      </section>

      <section>
        <h2 id="grit" className={h2}>{t("study.gritTitle")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("study.gritLead")}</p>
        <Tips ns="grit" ids={GRIT_TIPS} />
      </section>

      <section>
        <h2 id="books" className={h2}>{t("study.booksTitle")}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-2">{t("study.booksLead")}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {BOOKS.map((b) => (
            <li key={b.id} className="flex gap-4 rounded-3xl bg-surface p-5 shadow-soft">
              <span aria-hidden="true" className="text-[1.8rem] leading-none">📘</span>
              <div className="min-w-0">
                <h3 className="text-[1.15rem] font-bold"><cite className="not-italic">{b.title}</cite></h3>
                <p className="text-[0.95rem] text-ink-2">{b.author} · {b.year}</p>
                <p className="mt-2">{t(`study.books.${b.id}`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-end gap-3">
        <Peek size={92} />
        <p className="mb-4 max-w-[50ch] rounded-2xl rounded-bl-sm bg-surface px-4 py-3 font-bold shadow-soft">{t("study.tilde")}</p>
      </div>
    </main>
  );
}
