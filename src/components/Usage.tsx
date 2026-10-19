"use client";
import Link from "next/link";
import { estimate, type Answers } from "@/lib/estimate";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/useProfile";
import type { User } from "./Header";
import Mascot from "./Mascot";
import Results from "./Results";

// Sección aparte del consumo estimado: usa las mismas respuestas del perfil que la ruta.
export default function Usage({ user }: { user: User }) {
  const { t, usd } = useI18n();
  const { profile, setProfile, hydrated } = useProfile(user);
  const a = profile.answers;
  const e = estimate(a);
  const setAnswers = (p: Partial<Answers>) => setProfile((x) => ({ ...x, answers: { ...x.answers, ...p } }));
  return (
    <main id="main" className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-10 pb-24">
      <header className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <Mascot mood={e.plan === "pro" || e.plan === "max5" ? "happy" : "wow"} size={150} role={hydrated ? profile.role : undefined} />
        <div className="min-w-0">
          <h1 className="display text-[2.4rem] sm:text-[3.2rem]">{t("results.title")}</h1>
          <p className="mt-1 text-[1.2rem]">
            {t("results.month")}: <strong className="font-mono">{usd(e.perMonth.usd)}</strong> · {t(`plans.${e.plan}.t`)}
          </p>
          <Link href="/#ruta" className="mt-3 inline-block font-bold text-cobalt underline underline-offset-4">{t("nav.route")}</Link>
        </div>
      </header>
      <Results a={a} onChange={setAnswers} role={profile.role} onRole={(role) => setProfile((x) => ({ ...x, role }))} />
    </main>
  );
}
