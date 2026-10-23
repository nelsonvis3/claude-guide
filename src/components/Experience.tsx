"use client";
import Link from "next/link";
import { estimate, type Answers } from "@/lib/estimate";
import { streak } from "@/lib/game";
import { useI18n } from "@/lib/i18n";
import { useComplete } from "@/lib/useComplete";
import { DONE, useProfile } from "@/lib/useProfile";
import Bubble from "./Bubble";
import Celebrate from "./Celebrate";
import { ExperiencePicker, FeaturePicker, ModelPicker, RolePicker, TimePicker, UsePicker } from "./Fields";
import type { User } from "./Header";
import Mascot, { type Mood } from "./Mascot";
import Progress, { Hud } from "./Progress";
import Roadmap from "./Roadmap";

export default function Experience({ user }: { user: User }) {
  const { t, usd } = useI18n();
  const { profile, setProfile, step, setStep, cloud } = useProfile(user);
  const { party, closeParty, points, got } = useComplete(profile, setProfile);
  const finished = step === DONE;

  const setAnswers = (p: Partial<Answers>) => setProfile((x) => ({ ...x, answers: { ...x.answers, ...p } }));
  const a = profile.answers;
  const e = estimate(a);
  const name = profile.name || t("mascot.anon");
  const days = streak(profile.days);

  const lines: [string, string?][] = [
    [t("mascot.greet"), t("mascot.greet2")],
    [t("mascot.askName")],
    [t("mascot.askUse", { name })],
    [t("mascot.askRole")],
    [t("mascot.askExp")],
    [t("mascot.askTime")],
    [t("mascot.askModel")],
    [t("mascot.askFeatures")],
    [
      t("mascot.done", { name }),
      t(e.plan === "pro" ? "mascot.reactCheap" : e.plan === "max5" ? "mascot.reactMid" : "mascot.reactHigh"),
    ],
  ];
  const mood: Mood = step === 0 ? "wave" : finished ? (e.plan === "pro" || e.plan === "max5" ? "happy" : "wow") : step === 6 ? "think" : "talk";

  const field = [
    null,
    <input
      key="name"
      autoFocus
      value={profile.name}
      maxLength={40}
      placeholder={t("onboarding.namePlaceholder")}
      onChange={(ev) => setProfile((x) => ({ ...x, name: ev.target.value }))}
      onKeyDown={(ev) => ev.key === "Enter" && setStep(2)}
      className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[1.2rem] outline-none focus:border-cobalt"
      aria-label={t("onboarding.namePlaceholder")}
    />,
    <UsePicker key="use" value={a.use} onChange={(use) => setAnswers({ use })} />,
    <RolePicker key="role" value={profile.role} onChange={(role) => setProfile((x) => ({ ...x, role }))} />,
    <ExperiencePicker key="exp" value={profile.experience} onChange={(experience) => setProfile((x) => ({ ...x, experience }))} />,
    <TimePicker key="time" a={a} onChange={setAnswers} />,
    <ModelPicker key="model" a={a} onChange={setAnswers} />,
    <FeaturePicker key="features" a={a} onChange={setAnswers} />,
  ][step];

  const btn = "rounded-full px-6 py-2.5 font-bold transition-colors";
  return (
    <main id="main">
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute top-10 left-[-10%] size-[520px] rounded-full bg-[var(--glow)] blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:py-16">
          <div className="flex flex-col gap-4">
            <Bubble key={lines[step][0]} text={lines[step][0]} sub={lines[step][1]} />
            <div className="pl-4">
              <Mascot mood={mood} size={step === 0 || finished ? 260 : 190} role={step > 3 ? profile.role : undefined} />
            </div>
          </div>

          <div className="self-center">
            {step === 0 && (
              <div>
                <h1 className="display text-[2.6rem] sm:text-[4rem]">{t("meta.title")}</h1>
                <p className="mt-3 max-w-[48ch] text-[1.2rem] text-ink-2">{t("meta.description")}</p>
                <button onClick={() => setStep(1)} className={`${btn} mt-6 bg-cobalt text-[1.1rem] text-cobalt-ink`}>
                  {t("onboarding.start")}
                </button>
              </div>
            )}

            {step > 0 && !finished && (
              <div className="rounded-3xl bg-surface p-5 shadow-soft sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[0.85rem] text-ink-2">{t("onboarding.step", { n: step, total: DONE - 1 })}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-cobalt transition-[width]" style={{ width: `${(step / (DONE - 1)) * 100}%` }} />
                  </span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pr-1">{field}</div>
                {step >= 2 && (
                  <p className="mt-4 rounded-2xl bg-surface-2 px-4 py-2 text-[0.95rem]">
                    {t("results.month")}: <strong className="font-mono">{usd(e.perMonth.usd)}</strong> · {t(`plans.${e.plan}.t`)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-between gap-2">
                  <button onClick={() => setStep(step - 1)} className={`${btn} text-ink-2 hover:bg-surface-2`}>{t("onboarding.back")}</button>
                  <button onClick={() => setStep(step + 1)} className={`${btn} bg-cobalt text-cobalt-ink`}>
                    {step === DONE - 1 ? t("onboarding.finish") : step === 1 && !profile.name ? t("onboarding.skip") : t("onboarding.next")}
                  </button>
                </div>
              </div>
            )}

            {finished && (
              <div>
                <h1 className="display text-[2.6rem] sm:text-[3.6rem]">{t("nav.route")}</h1>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#ruta" className={`${btn} bg-cobalt text-cobalt-ink`}>{t("onboarding.finish")}</a>
                  <Link href="/consumo" className={`${btn} bg-surface shadow-soft`}>{t("nav.usage")}</Link>
                </div>
                <p className="mt-4 max-w-[48ch] text-[0.95rem] text-ink-2">{user && cloud ? t("nav.savedCloud") : t("nav.savedLocal")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {finished && (
        <>
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-20 px-4 py-12 pb-28">
            <Roadmap profile={profile} />
            <Progress
              points={points}
              streak={days}
              got={got}
              role={profile.role}
              remind={user ? { on: profile.remind, set: (on) => setProfile((x) => ({ ...x, remind: on })) } : undefined}
            />
          </div>
          <Hud points={points} streak={days} />
        </>
      )}
      <Celebrate c={party} role={profile.role} onClose={closeParty} />
    </main>
  );
}
