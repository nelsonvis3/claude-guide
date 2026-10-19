"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { buildPrompt, PROMPT_KINDS, PROMPT_RULES, type PromptKind, type PromptRule } from "@/lib/prompt";
import { Peek } from "./Mascot";
import { Code } from "./Roadmap";

export default function PromptMaker() {
  const { t, list, m } = useI18n();
  const [idea, setIdea] = useState("");
  const [kind, setKind] = useState<PromptKind>("build");
  const [context, setContext] = useState("");
  const [done, setDone] = useState("");
  const [rules, setRules] = useState<PromptRule[]>(["small", "ask"]);
  const prompt = buildPrompt({ idea, kind, context, done, rules }, m.prompt.out, m.prompt.rules);
  const toggle = (r: PromptRule) => setRules((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : PROMPT_RULES.filter((x) => x === r || rs.includes(x))));

  const field = "w-full rounded-2xl border border-line bg-surface px-4 py-3 font-normal outline-none focus:border-cobalt";
  const chip = (on: boolean) => `rounded-full border-2 px-4 py-1.5 font-bold ${on ? "border-cobalt bg-[var(--glow)]" : "border-line hover:bg-surface-2"}`;
  return (
    <main id="main" className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-12">
      <div className="relative">
        <Peek size={110} className="absolute -top-[30px] right-0 hidden sm:block" />
        <h1 className="display text-[2.6rem] sm:text-[3.6rem]">{t("prompt.title")}</h1>
        <p className="mt-3 max-w-[60ch] text-[1.15rem] text-ink-2">{t("prompt.lead")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={(e) => e.preventDefault()} className="grid content-start gap-5 rounded-3xl bg-surface p-5 shadow-soft sm:p-7">
          <label className="grid gap-1 font-bold">
            {t("prompt.idea")}
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={4} placeholder={t("prompt.ideaHint")} className={field} />
          </label>
          <fieldset>
            <legend className="font-bold">{t("prompt.kind")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROMPT_KINDS.map((k) => (
                <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>
                  {t(`prompt.kinds.${k}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1 font-bold">
            {t("prompt.context")}
            <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={2} placeholder={t("prompt.contextHint")} className={field} />
          </label>
          <label className="grid gap-1 font-bold">
            {t("prompt.done")}
            <input value={done} onChange={(e) => setDone(e.target.value)} placeholder={t("prompt.doneHint")} className={field} />
          </label>
          <fieldset>
            <legend className="font-bold">{t("prompt.rulesTitle")}</legend>
            <div className="mt-2 grid gap-2">
              {PROMPT_RULES.map((r) => (
                <label key={r} className="flex items-start gap-3">
                  <input type="checkbox" checked={rules.includes(r)} onChange={() => toggle(r)} className="mt-1 size-4 accent-[var(--cobalt)]" />
                  {t(`prompt.rules.${r}`)}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        <section className="grid content-start gap-4">
          <h2 className="display text-[1.8rem]">{t("prompt.result")}</h2>
          {prompt ? <Code text={prompt} /> : <p className="rounded-3xl bg-surface p-5 text-ink-2 shadow-soft">{t("prompt.empty")}</p>}
          <div className="rounded-3xl bg-[var(--glow)] p-5">
            <h3 className="text-[1.15rem] font-bold">{t("prompt.tipsTitle")}</h3>
            <ul className="mt-2 grid gap-2">
              {list("prompt.tips").map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-cobalt" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
