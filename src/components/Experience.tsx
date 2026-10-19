"use client";
import { useEffect, useState } from "react";
import { estimate, type Answers } from "@/lib/estimate";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_ANSWERS, parseProfile, type Profile } from "@/lib/profile";
import Bubble from "./Bubble";
import { ExperiencePicker, FeaturePicker, ModelPicker, RolePicker, TimePicker, UsePicker } from "./Fields";
import Mascot, { type Mood } from "./Mascot";
import Results from "./Results";
import Roadmap from "./Roadmap";
import Topo from "./Topo";

const KEY = "ccr:profile";
const STEP_KEY = "ccr:step";
const DONE = 8;
const EMPTY: Profile = { name: "", experience: "new", role: "fullstack", answers: DEFAULT_ANSWERS, done: [] };

function readLocal(): { profile: Profile; step: number } | null {
  try {
    const p = parseProfile(JSON.parse(localStorage.getItem(KEY) ?? "null"));
    return p ? { profile: p, step: Number(localStorage.getItem(STEP_KEY)) || 0 } : null;
  } catch {
    return null;
  }
}

export default function Experience() {
  const { t, usd } = useI18n();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [step, setStep] = useState(0);
  // El perfil vive solo en este navegador. Estado (no ref): el guardado nunca corre con el perfil vacío del primer render.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const local = readLocal();
    if (local) {
      // localStorage solo existe en el navegador: hidratar después de montar evita el desfasaje con el SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(local.profile);
      setStep(local.step);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      localStorage.setItem(STEP_KEY, String(step));
    } catch {}
  }, [profile, step, hydrated]);

  const setAnswers = (p: Partial<Answers>) => setProfile((x) => ({ ...x, answers: { ...x.answers, ...p } }));
  const a = profile.answers;
  const e = estimate(a);
  const name = profile.name || t("mascot.anon");

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
  const mood: Mood = step === 0 ? "wave" : step === DONE ? (e.plan === "pro" || e.plan === "max5" ? "happy" : "wow") : step === 6 ? "think" : "talk";

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
      className="w-full rounded-2xl border-2 border-ink bg-surface px-4 py-3 text-[1.2rem]"
      aria-label={t("onboarding.namePlaceholder")}
    />,
    <UsePicker key="use" value={a.use} onChange={(use) => setAnswers({ use })} />,
    <RolePicker key="role" value={profile.role} onChange={(role) => setProfile((x) => ({ ...x, role }))} />,
    <ExperiencePicker key="exp" value={profile.experience} onChange={(experience) => setProfile((x) => ({ ...x, experience }))} />,
    <TimePicker key="time" a={a} onChange={setAnswers} />,
    <ModelPicker key="model" a={a} onChange={setAnswers} />,
    <FeaturePicker key="features" a={a} onChange={setAnswers} />,
  ][step];

  const btn = "rounded-xl px-5 py-2.5 font-bold";
  return (
    <main id="main">
      <section className="relative overflow-hidden border-b-2 border-line">
        <Topo />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:py-16">
          <div className="flex flex-col gap-4">
            <Bubble key={lines[step][0]} text={lines[step][0]} sub={lines[step][1]} />
            <div className="pl-4"><Mascot mood={mood} size={step === 0 || step === DONE ? 260 : 190} /></div>
          </div>

          <div className="self-center">
            {step === 0 && (
              <div>
                <h1 className="display text-[2.6rem] sm:text-[4rem]">{t("meta.title")}</h1>
                <p className="mt-3 max-w-[48ch] text-[1.2rem] text-ink-2">{t("meta.description")}</p>
                <button onClick={() => setStep(1)} className={`${btn} mt-6 bg-cobalt text-[1.15rem] text-cobalt-ink`}>
                  {t("onboarding.start")}
                </button>
              </div>
            )}

            {step > 0 && step < DONE && (
              <div className="rounded-3xl border-[3px] border-ink bg-surface p-5 shadow-[8px_8px_0_var(--ink)] sm:p-6">
                <p className="mb-3 font-mono text-[0.9rem] text-ink-2">{t("onboarding.step", { n: step, total: DONE - 1 })}</p>
                <div className="max-h-[60vh] overflow-y-auto pr-1">{field}</div>
                {step >= 2 && (
                  <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 text-[0.95rem]">
                    {t("results.month")}: <strong className="font-mono">{usd(e.perMonth.usd)}</strong> · {t(`plans.${e.plan}.t`)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-between gap-2">
                  <button onClick={() => setStep(step - 1)} className={`${btn} border-2 border-line`}>{t("onboarding.back")}</button>
                  <button onClick={() => setStep(step + 1)} className={`${btn} bg-cobalt text-cobalt-ink`}>
                    {step === DONE - 1 ? t("onboarding.finish") : step === 1 && !profile.name ? t("onboarding.skip") : t("onboarding.next")}
                  </button>
                </div>
              </div>
            )}

            {step === DONE && (
              <div>
                <p className="font-bold">{t("results.month")}</p>
                <p className="display text-[3.4rem] sm:text-[4.5rem]">{usd(e.perMonth.usd)}</p>
                <p className="text-[1.2rem]">{t(`plans.${e.plan}.t`)}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#ruta" className={`${btn} bg-cobalt text-cobalt-ink`}>{t("nav.route")}</a>
                  <button onClick={() => setStep(1)} className={`${btn} border-2 border-ink`}>{t("onboarding.restart")}</button>
                </div>
                <p className="mt-4 max-w-[48ch] text-[0.95rem] text-ink-2">{t("nav.savedLocal")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {step === DONE && (
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-16 px-4 py-12">
          <Results a={a} onChange={setAnswers} role={profile.role} onRole={(role) => setProfile((x) => ({ ...x, role }))} />
          <Roadmap
            profile={profile}
            onToggle={(id) =>
              setProfile((x) => ({ ...x, done: x.done.includes(id) ? x.done.filter((d) => d !== id) : [...x.done, id] }))
            }
          />
        </div>
      )}
    </main>
  );
}
