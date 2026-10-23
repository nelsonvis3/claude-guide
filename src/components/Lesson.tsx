"use client";
import Link from "next/link";
import { useState } from "react";
import { NODES } from "@/lib/content";
import { XP_PER_STEP } from "@/lib/game";
import { useI18n } from "@/lib/i18n";
import { LESSONS } from "@/lib/lessons";
import { useComplete } from "@/lib/useComplete";
import { useProfile } from "@/lib/useProfile";
import Bubble from "./Bubble";
import Celebrate from "./Celebrate";
import type { User } from "./Header";
import Mascot from "./Mascot";
import { Code, CopyButton } from "./Roadmap";
import Terminal from "./Terminal";

export type LessonText = {
  body: string[];
  points: string[];
  task: string;
  hint: string;
  quiz: { q: string; o: string[]; why: string }[]; // en o, la opción correcta va primera
};

// Los textos marcan código con `backticks`.
export function Rich({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 ? <code key={i} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.92em]">{part}</code> : part,
  );
}

// La correcta viene primera en los textos; se muestra en la posición que fija lessons.ts.
export function arrange(options: string[], pos: number) {
  const rest = options.slice(1);
  rest.splice(pos, 0, options[0]);
  return rest;
}

export default function Lesson({ id, text, user }: { id: string; text: LessonText; user: User }) {
  const { t, m } = useI18n();
  const { profile, setProfile, hydrated } = useProfile(user);
  const { complete, party, closeParty } = useComplete(profile, setProfile);
  const index = NODES.findIndex((n) => n.id === id);
  const node = NODES[index];
  const next = NODES[index + 1];
  const prev = NODES[index - 1];
  const data = LESSONS[id];
  const already = profile.done.includes(id);
  const [termSolved, setTermSolved] = useState(false);
  const [picked, setPicked] = useState<(number | null)[]>(() => text.quiz.map(() => null));
  const [checked, setChecked] = useState(false);
  const prompt = (m.nodes as Record<string, { p?: string }>)[id]?.p;
  const unlocked = termSolved || already;
  const allRight = checked && picked.every((p, i) => p === data.answers[i]);
  const passed = already || allRight;

  const check = () => {
    setChecked(true);
    if (picked.every((p, i) => p === data.answers[i])) complete(id);
  };
  const retry = () => {
    setPicked((p) => p.map((v, i) => (v === data.answers[i] ? v : null)));
    setChecked(false);
  };

  const card = "rounded-3xl bg-surface p-5 shadow-soft sm:p-7";
  return (
    <main id="main" className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[0.95rem]">
        <Link href="/#ruta" className="font-bold text-cobalt">← {t("lesson.back")}</Link>
        <span className="text-ink-2">
          {t(`phases.${node.phase}.t`)} · {t("lesson.stepOf", { n: index + 1, total: NODES.length })} · +{XP_PER_STEP[node.phase]} XP
        </span>
      </div>

      <header className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <Mascot mood={passed ? "happy" : "talk"} size={130} role={hydrated ? profile.role : undefined} />
        <div className="min-w-0">
          <h1 className="display text-[2.2rem] sm:text-[2.8rem]">{t(`nodes.${id}.t`)}</h1>
          {already && <p className="mt-1 font-bold text-save">✓ {t("lesson.mastered")}</p>}
        </div>
      </header>

      <Bubble key={text.body[0]} text={text.body[0].replaceAll("`", "")} />

      <section className={card}>
        <div className="grid max-w-[65ch] gap-4 text-[1.05rem] leading-relaxed">
          {text.body.slice(1).map((p) => <p key={p}><Rich text={p} /></p>)}
        </div>
        <h2 className="mt-6 text-[1.2rem] font-bold">{t("lesson.keyPoints")}</h2>
        <ul className="mt-2 grid gap-2">
          {text.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-cobalt" />
              <span><Rich text={p} /></span>
            </li>
          ))}
        </ul>
        {node.code && <div className="mt-6"><Code text={node.code} /></div>}
        {prompt && (
          <div className="mt-4">
            <p className="text-[0.9rem] font-bold">{t("route.tryIt")}</p>
            <div className="mt-1 flex items-start gap-2 rounded-2xl bg-surface-2 px-4 py-3">
              <p className="flex-1 text-[0.95rem]">{prompt}</p>
              <CopyButton text={prompt} />
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="display text-[1.6rem]">{t("lesson.practice")}</h2>
        <div className="mt-3">
          <Terminal spec={data.terminal} task={text.task} hint={text.hint} solved={termSolved} onSolve={() => setTermSolved(true)} />
        </div>
      </section>

      <section className={`${card} ${unlocked ? "" : "opacity-60"}`}>
        <h2 className="display text-[1.6rem]">{t("lesson.quiz")}</h2>
        {!unlocked && <p className="mt-1 text-ink-2">🔒 {t("lesson.quizLocked")}</p>}
        <ol className="mt-4 grid gap-6">
          {text.quiz.map((q, qi) => {
            const options = arrange(q.o, data.answers[qi]);
            const right = picked[qi] === data.answers[qi];
            return (
              <li key={q.q}>
                <fieldset disabled={!unlocked || (checked && right) || passed} className="min-w-0 [overflow-wrap:anywhere]">
                  <legend className="font-bold"><Rich text={`${qi + 1}. ${q.q}`} /></legend>
                  <div className="mt-2 grid gap-2">
                    {options.map((o, oi) => {
                      const on = picked[qi] === oi;
                      const state = checked && on ? (right ? "border-save bg-save/10" : "border-spend bg-spend/10") : on ? "border-cobalt bg-[var(--glow)]" : "border-line";
                      return (
                        <label key={o} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${state}`}>
                          <input
                            type="radio"
                            name={`q${qi}`}
                            checked={on}
                            onChange={() => { setPicked((p) => p.map((v, i) => (i === qi ? oi : v))); setChecked(false); }}
                            className="mt-1 accent-[var(--cobalt)]"
                          />
                          <span><Rich text={o} /></span>
                        </label>
                      );
                    })}
                  </div>
                  {(checked || passed) && (picked[qi] !== null || passed) && (
                    <p className={`mt-2 text-[0.95rem] ${right || passed ? "text-save" : "text-spend"}`}>
                      <strong>{right || passed ? t("lesson.correct") : t("lesson.wrong")}</strong> <Rich text={q.why} />
                    </p>
                  )}
                </fieldset>
              </li>
            );
          })}
        </ol>

        {passed ? (
          <div className="mt-6 grid justify-items-start gap-3 rounded-2xl bg-[var(--glow)] p-5">
            <p className="display text-[1.4rem]">🎉 {t("lesson.allRight")}</p>
            <p className="text-ink-2">{t("lesson.allRightSub", { title: t(`nodes.${id}.t`) })}</p>
            {next ? (
              <Link href={`/leccion/${next.id}`} className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink">
                {t("lesson.next")} →
              </Link>
            ) : (
              <Link href="/#logros" className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink">{t("lesson.finishRoute")}</Link>
            )}
          </div>
        ) : checked ? (
          <button onClick={retry} className="mt-6 rounded-full bg-ink px-6 py-2.5 font-bold text-bg">{t("lesson.retry")}</button>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={check}
              disabled={!unlocked || picked.some((p) => p === null)}
              className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink disabled:opacity-40"
            >
              {t("lesson.check")}
            </button>
            {unlocked && picked.some((p) => p === null) && <span className="text-[0.9rem] text-ink-2">{t("lesson.pickAnswer")}</span>}
          </div>
        )}
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-3 text-[0.95rem]">
        {prev ? <Link href={`/leccion/${prev.id}`} className="font-bold text-ink-2 hover:text-ink">← {t(`nodes.${prev.id}.t`)}</Link> : <span />}
        <a href={node.doc} target="_blank" rel="noreferrer" className="text-ink-2 underline underline-offset-4">{t("lesson.source")}</a>
        {next ? <Link href={`/leccion/${next.id}`} className="font-bold text-ink-2 hover:text-ink">{t(`nodes.${next.id}.t`)} →</Link> : <span />}
      </nav>

      <Celebrate c={party} role={profile.role} onClose={closeParty} />
    </main>
  );
}
