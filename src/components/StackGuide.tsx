"use client";
import Link from "next/link";
import { useState } from "react";
import { ROLE_IDS, ROLES, type Role } from "@/lib/content";
import { GUIDE_PASS, GUIDES, stackId } from "@/lib/guides";
import { useI18n } from "@/lib/i18n";
import { useComplete } from "@/lib/useComplete";
import { useProfile } from "@/lib/useProfile";
import Bubble from "./Bubble";
import Celebrate from "./Celebrate";
import type { User } from "./Header";
import { arrange, Rich } from "./Lesson";
import Mascot, { ROLE_PROP } from "./Mascot";
import { RecList } from "./Recs";
import { Code } from "./Roadmap";

export type GuideText = {
  lead: string;
  steps: { t: string; d: string }[];
  quiz: { q: string; o: string[]; why: string }[]; // en o, la opción correcta va primera
};

const card = "rounded-3xl bg-surface p-5 shadow-soft sm:p-7";

// /guia: las guías de todos los roles, con la del rol elegido primero.
export function GuideIndex({ user }: { user: User }) {
  const { t } = useI18n();
  const { profile, hydrated } = useProfile(user);
  const roles = hydrated ? [profile.role, ...ROLE_IDS.filter((r) => r !== profile.role)] : ROLE_IDS;
  return (
    <main id="main" className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-12 pb-24">
      <header className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <Mascot mood="wave" size={140} />
        <div className="min-w-0">
          <h1 className="display text-[2.6rem] sm:text-[3.4rem]">{t("stackGuide.title")}</h1>
          <p className="mt-2 max-w-[60ch] text-[1.1rem] text-ink-2">{t("stackGuide.lead")}</p>
        </div>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r, i) => (
          <li key={r}>
            <Link href={`/guia/${r}`} className={`flex h-full gap-4 ${card} !p-5 hover:outline-2 hover:outline-cobalt ${hydrated && i === 0 ? "outline-2 outline-cobalt" : ""}`}>
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-2 text-[1.5rem]">{ROLE_PROP[r]}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <strong className="text-[1.15rem]">{t(`roles.${r}.t`)}</strong>
                  {hydrated && i === 0 && <span className="text-[0.85rem] font-bold text-cobalt">{t("stackGuide.yours")}</span>}
                </span>
                <span className="mt-1 block text-[0.95rem] text-ink-2">{t(`roles.${r}.d`)}</span>
                {profile.done.includes(stackId(r)) && <span className="mt-2 block text-[0.9rem] font-bold text-save">{t("stackGuide.done")}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

// /guia/<rol>: pasos con su comando, herramientas recomendadas y la prueba de lo básico al final.
export default function StackGuide({ role, text, user }: { role: Role; text: GuideText; user: User }) {
  const { t } = useI18n();
  const { profile, setProfile } = useProfile(user);
  const { complete, party, closeParty } = useComplete(profile, setProfile);
  const data = GUIDES[role];
  const name = t(`roles.${role}.t`);
  const [picked, setPicked] = useState<(number | null)[]>(() => text.quiz.map(() => null));
  const [checked, setChecked] = useState(false);
  const already = profile.done.includes(stackId(role));
  const score = picked.filter((p, i) => p === data.answers[i]).length;
  const passed = checked && score >= GUIDE_PASS;

  const check = () => {
    setChecked(true);
    if (score >= GUIDE_PASS) {
      complete(stackId(role), { emoji: "🎓", title: t("stackGuide.passed", { role: name }), sub: t("stackGuide.passedSub") });
    }
  };
  const retry = () => {
    setPicked((p) => p.map((v, i) => (v === data.answers[i] ? v : null)));
    setChecked(false);
  };

  return (
    <main id="main" className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 pb-24">
      <Link href="/guia" className="font-bold text-cobalt">← {t("stackGuide.other")}</Link>

      <header className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <Mascot mood={passed || already ? "happy" : "talk"} size={130} role={role} />
        <div className="min-w-0">
          <h1 className="display text-[2.2rem] sm:text-[2.8rem]">{t("stackGuide.pageTitle", { role: name })}</h1>
          {already && <p className="mt-1 font-bold text-save">{t("stackGuide.done")}</p>}
        </div>
      </header>

      <Bubble key={role} text={text.lead.replaceAll("`", "")} />

      <section>
        <h2 className="display text-[1.6rem]">{t("stackGuide.steps")}</h2>
        <ol className="mt-4 grid gap-4">
          {text.steps.map((s, i) => (
            <li key={s.t} className={`${card} grid grid-cols-[auto_minmax(0,1fr)] gap-4`}>
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-cobalt font-bold text-cobalt-ink">{i + 1}</span>
              <div className="grid gap-2">
                <h3 className="text-[1.15rem] font-bold">{s.t}</h3>
                <p className="leading-relaxed text-ink-2"><Rich text={s.d} /></p>
                {data.code[i] && <Code text={data.code[i]!} />}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="display text-[1.6rem]">{t("stackGuide.tools")}</h2>
        <div className="mt-4"><RecList keys={ROLES[role]} /></div>
      </section>

      <section className={card}>
        <h2 className="display text-[1.6rem]">{t("stackGuide.quiz")}</h2>
        <p className="mt-1 text-ink-2">{t("stackGuide.quizLead", { n: text.quiz.length, pass: GUIDE_PASS })}</p>
        <ol className="mt-4 grid gap-6">
          {text.quiz.map((q, qi) => {
            const answer = data.answers[qi];
            const right = picked[qi] === answer;
            return (
              <li key={q.q}>
                <fieldset disabled={passed} className="min-w-0 [overflow-wrap:anywhere]">
                  <legend className="font-bold"><Rich text={`${qi + 1}. ${q.q}`} /></legend>
                  <div className="mt-2 grid gap-2">
                    {arrange(q.o, answer).map((o, oi) => {
                      const on = picked[qi] === oi;
                      const state = checked && on ? (right ? "border-save bg-save/10" : "border-spend bg-spend/10") : on ? "border-cobalt bg-[var(--glow)]" : "border-line";
                      return (
                        <label key={o} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${state}`}>
                          <input
                            type="radio"
                            name={`g${qi}`}
                            checked={on}
                            onChange={() => { setPicked((p) => p.map((v, i) => (i === qi ? oi : v))); setChecked(false); }}
                            className="mt-1 accent-[var(--cobalt)]"
                          />
                          <span><Rich text={o} /></span>
                        </label>
                      );
                    })}
                  </div>
                  {checked && picked[qi] !== null && (
                    <p className={`mt-2 text-[0.95rem] ${right ? "text-save" : "text-spend"}`}>
                      <strong>{right ? t("lesson.correct") : t("lesson.wrong")}</strong> <Rich text={q.why} />
                    </p>
                  )}
                </fieldset>
              </li>
            );
          })}
        </ol>

        {checked ? (
          <div className={`mt-6 grid justify-items-start gap-3 rounded-2xl p-5 ${passed ? "bg-[var(--glow)]" : "bg-surface-2"}`}>
            <p className="display text-[1.4rem]">{t("stackGuide.score", { score, total: text.quiz.length })}</p>
            {passed ? (
              <p className="text-ink-2">🎉 {t("stackGuide.passed", { role: name })}</p>
            ) : (
              <>
                <p className="text-ink-2">{t("stackGuide.failed", { pass: GUIDE_PASS })}</p>
                <button onClick={retry} className="rounded-full bg-ink px-6 py-2.5 font-bold text-bg">{t("lesson.retry")}</button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={check}
              disabled={picked.some((p) => p === null)}
              className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink disabled:opacity-40"
            >
              {t("lesson.check")}
            </button>
            {picked.some((p) => p === null) && <span className="text-[0.9rem] text-ink-2">{t("lesson.pickAnswer")}</span>}
          </div>
        )}
      </section>

      <Celebrate c={party} role={role} onClose={closeParty} />
    </main>
  );
}
