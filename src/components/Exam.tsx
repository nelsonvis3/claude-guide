"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NODES } from "@/lib/content";
import { current, today } from "@/lib/game";
import { useI18n } from "@/lib/i18n";
import { LESSONS } from "@/lib/lessons";
import { useProfile } from "@/lib/useProfile";
import Celebrate, { type Celebration } from "./Celebrate";
import type { User } from "./Header";
import { arrange, Rich, type LessonText } from "./Lesson";
import Mascot from "./Mascot";

export const EXAM_SIZE = 20;
export const EXAM_PASS = 16; // 80 %

type Q = { id: string; i: number };

// Una pregunta de cada lección al azar, y de esas se toman EXAM_SIZE, así el examen recorre toda la ruta.
function draw(): Q[] {
  const pool = NODES.map((n) => ({ id: n.id, i: Math.floor(Math.random() * LESSONS[n.id].answers.length) }));
  for (let k = pool.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [pool[k], pool[j]] = [pool[j], pool[k]];
  }
  return pool.slice(0, EXAM_SIZE);
}

export default function Exam({ lessons, user }: { lessons: Record<string, LessonText>; user: User }) {
  const { t, lang } = useI18n();
  const { profile, setProfile, hydrated } = useProfile(user);
  const [qs, setQs] = useState<Q[]>([]);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [party, setParty] = useState<Celebration | null>(null);
  const [retake, setRetake] = useState(false);
  const passedBefore = profile.done.includes("exam");

  const reset = () => {
    const next = draw();
    setQs(next);
    setPicked(next.map(() => null));
    setChecked(false);
    window.scrollTo({ top: 0 });
  };
  // Al azar solo en el navegador, para que el HTML del servidor no difiera.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(reset, []);

  const score = qs.filter((q, k) => picked[k] === LESSONS[q.id].answers[q.i]).length;
  const passed = checked && score >= EXAM_PASS;

  const check = () => {
    setChecked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (score >= EXAM_PASS && !passedBefore) {
      setProfile((p) => ({ ...p, done: [...p.done, "exam"], days: [...new Set([...p.days, today()])].sort().slice(-400) }));
      setParty({ id: Date.now(), kind: "big", emoji: "🏆", title: t("exam.passedTitle"), sub: t("exam.passedSub") });
    }
  };

  if (!hydrated) return <main id="main" className="min-h-[60vh]" />;

  if (current(profile.done) < NODES.length) {
    return (
      <main id="main" className="mx-auto grid max-w-3xl justify-items-start gap-5 px-4 py-16">
        <Mascot mood="think" size={150} role={profile.role} />
        <h1 className="display text-[2.4rem]">🔒 {t("exam.title")}</h1>
        <p className="max-w-[55ch] text-[1.1rem] text-ink-2">{t("exam.lockedRoute")}</p>
        <Link href="/#ruta" className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink">{t("nav.route")}</Link>
      </main>
    );
  }

  const name = profile.name || t("mascot.anon");
  if (passedBefore && !checked && !retake) {
    const date = new Date(`${profile.days.at(-1) ?? today()}T12:00:00`).toLocaleDateString(lang, { dateStyle: "long" });
    return (
      <main id="main" className="mx-auto grid max-w-3xl gap-6 px-4 py-12 pb-24">
        <section className="grid justify-items-center gap-3 rounded-3xl bg-surface p-8 text-center shadow-soft print:shadow-none">
          <Mascot mood="happy" size={140} role={profile.role} />
          <p className="text-ink-2">{t("exam.certFor")}</p>
          <p className="display text-[2.4rem]">{name}</p>
          <p className="text-[1.1rem]">{t("exam.certText")}</p>
          <p className="display text-[2rem] text-cobalt">Claude Code Pro</p>
          <p className="text-ink-2">{date} · Procode</p>
        </section>
        <div className="flex flex-wrap gap-3 print:hidden">
          <button onClick={() => window.print()} className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink">{t("exam.print")}</button>
          <button onClick={() => { setRetake(true); reset(); }} className="rounded-full bg-surface px-6 py-2.5 font-bold shadow-soft">{t("exam.again")}</button>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-10 pb-24">
      <header className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <Mascot mood={checked ? (passed ? "happy" : "think") : "talk"} size={130} role={profile.role} />
        <div className="min-w-0">
          <h1 className="display text-[2.2rem] sm:text-[2.8rem]">{t("exam.title")}</h1>
          <p className="mt-1 text-ink-2">{t("exam.lead", { n: EXAM_SIZE, pass: EXAM_PASS })}</p>
        </div>
      </header>

      {checked && (
        <div className={`grid justify-items-start gap-3 rounded-2xl p-5 ${passed ? "bg-[var(--glow)]" : "bg-surface shadow-soft"}`}>
          <p className="display text-[1.6rem]">{t("exam.score", { score, total: EXAM_SIZE })}</p>
          <p className="text-ink-2">{passed ? t("exam.passedSub") : t("exam.failed", { pass: EXAM_PASS })}</p>
          {passed ? (
            <button onClick={() => { setRetake(false); setChecked(false); }} className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink">{t("exam.seeCert")}</button>
          ) : (
            <button onClick={reset} className="rounded-full bg-ink px-6 py-2.5 font-bold text-bg">{t("exam.again")}</button>
          )}
        </div>
      )}

      <ol className="grid gap-6">
        {qs.map((q, k) => {
          const quiz = lessons[q.id].quiz[q.i];
          const answer = LESSONS[q.id].answers[q.i];
          const right = picked[k] === answer;
          return (
            <li key={`${q.id}-${q.i}`} className="rounded-3xl bg-surface p-5 shadow-soft">
              <fieldset disabled={checked} className="min-w-0 [overflow-wrap:anywhere]">
                <legend className="font-bold"><Rich text={`${k + 1}. ${quiz.q}`} /></legend>
                <p className="text-[0.85rem] text-ink-2">{t(`nodes.${q.id}.t`)}</p>
                <div className="mt-3 grid gap-2">
                  {arrange(quiz.o, answer).map((o, oi) => {
                    const on = picked[k] === oi;
                    const state = checked && on ? (right ? "border-save bg-save/10" : "border-spend bg-spend/10") : checked && oi === answer ? "border-save" : on ? "border-cobalt bg-[var(--glow)]" : "border-line";
                    return (
                      <label key={o} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 ${state}`}>
                        <input type="radio" name={`e${k}`} checked={on} onChange={() => setPicked((p) => p.map((v, i) => (i === k ? oi : v)))} className="mt-1 accent-[var(--cobalt)]" />
                        <span><Rich text={o} /></span>
                      </label>
                    );
                  })}
                </div>
                {checked && (
                  <p className={`mt-2 text-[0.95rem] ${right ? "text-save" : "text-spend"}`}>
                    <strong>{right ? t("lesson.correct") : t("lesson.wrong")}</strong> <Rich text={quiz.why} />
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {!checked && (
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={check} disabled={picked.some((p) => p === null)} className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink disabled:opacity-40">
            {t("exam.submit")}
          </button>
          {picked.some((p) => p === null) && <span className="text-[0.9rem] text-ink-2">{t("lesson.pickAnswer")}</span>}
        </div>
      )}
      <Celebrate c={party} role={profile.role} onClose={() => setParty(null)} />
    </main>
  );
}
