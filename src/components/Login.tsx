"use client";
import { useActionState, useState } from "react";
import { login, loginWithPassword, register } from "@/app/actions";
import type { FormState } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import Mascot from "./Mascot";

const NAMES: Record<string, string> = { github: "GitHub", google: "Google", discord: "Discord", gitlab: "GitLab" };
const ICONS: Record<string, string> = { github: "🐙", google: "🔎", discord: "🎮", gitlab: "🦊" };

export default function Login({ providers, password, error }: { providers: string[]; password: boolean; error: boolean }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginAction, loggingIn] = useActionState<FormState, FormData>(loginWithPassword, { status: "idle" });
  const [regState, regAction, registering] = useActionState<FormState, FormData>(register, { status: "idle" });
  const state = mode === "login" ? loginState : regState;
  const field = "w-full rounded-2xl border border-line bg-surface px-4 py-3 font-normal outline-none focus:border-cobalt";
  const label = "grid gap-1 font-bold";
  return (
    <main id="main" className="mx-auto grid max-w-md grid-cols-[minmax(0,1fr)] gap-6 px-4 py-12 pb-24">
      <header className="grid justify-items-center gap-3 text-center">
        <Mascot mood="wave" size={120} />
        <h1 className="display text-[2.2rem]">{mode === "login" ? t("account.loginTitle") : t("account.registerTitle")}</h1>
        <p className="text-ink-2">{t("nav.loginWhy")}</p>
      </header>

      {error && <p role="alert" className="rounded-2xl bg-spend/10 px-4 py-3 font-bold text-spend">{t("account.oauthError")}</p>}

      {providers.length > 0 && (
        <div className="grid gap-2">
          {providers.map((p) => (
            <form key={p} action={login.bind(null, p)}>
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 font-bold shadow-soft hover:bg-surface-2">
                <span aria-hidden="true">{ICONS[p]}</span> {t("nav.loginWith", { provider: NAMES[p] ?? p })}
              </button>
            </form>
          ))}
        </div>
      )}

      {password && (
        <>
          {providers.length > 0 && (
            <p className="flex items-center gap-3 text-[0.9rem] text-ink-2 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
              {t("account.orEmail")}
            </p>
          )}
          <form key={mode} action={mode === "login" ? loginAction : regAction} className="grid gap-4 rounded-3xl bg-surface p-5 shadow-soft sm:p-6">
            {mode === "register" && (
              <label className={label}>
                {t("account.name")}
                <input name="name" required maxLength={60} autoComplete="name" className={field} />
              </label>
            )}
            <label className={label}>
              {t("account.email")}
              <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
            </label>
            <label className={label}>
              {t("account.password")}
              <input
                name="password"
                type="password"
                required
                minLength={mode === "register" ? 8 : undefined}
                maxLength={200}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={field}
              />
              {mode === "register" && <span className="text-[0.85rem] font-normal text-ink-2">{t("account.passwordRule")}</span>}
            </label>
            {state.status !== "idle" && state.status !== "ok" && (
              <p role="alert" className="font-bold text-spend">{t(`account.errors.${state.status}`)}</p>
            )}
            <button disabled={loggingIn || registering} className="rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink disabled:opacity-50">
              {mode === "login" ? t("nav.login") : t("account.createAccount")}
            </button>
          </form>
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-bold text-cobalt underline underline-offset-4">
            {mode === "login" ? t("account.noAccount") : t("account.haveAccount")}
          </button>
        </>
      )}
    </main>
  );
}
