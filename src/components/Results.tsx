"use client";
import { TOKEN_SAVERS, type Role } from "@/lib/content";
import { compareModels, compareStrategies, estimate, type Answers } from "@/lib/estimate";
import { useI18n } from "@/lib/i18n";
import { BarChart, StackChart } from "./Charts";
import { FeaturePicker, ModelPicker, TimePicker, UsePicker } from "./Fields";
import { Code } from "./Roadmap";
import { RecList, RoleRecs } from "./Recs";

// Los textos marcan código con `backticks`.
function Rich({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 ? <code key={i} className="rounded bg-surface-2 px-1 font-mono text-[0.92em]">{part}</code> : part,
  );
}

function Section({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border-2 border-line bg-surface p-5 sm:p-7">
      <h3 className="display text-[1.6rem] sm:text-[1.9rem]">{title}</h3>
      {lead && <p className="mt-2 max-w-[65ch] text-ink-2">{lead}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Adjust({ a, onChange }: { a: Answers; onChange: (p: Partial<Answers>) => void }) {
  return (
    <div className="grid gap-6">
      <UsePicker compact value={a.use} onChange={(use) => onChange({ use })} />
      <TimePicker a={a} onChange={onChange} />
      <ModelPicker compact a={a} onChange={onChange} />
      <FeaturePicker compact a={a} onChange={onChange} />
    </div>
  );
}

export default function Results({ a, onChange, role, onRole }: {
  a: Answers; onChange: (p: Partial<Answers>) => void; role: Role; onRole: (r: Role) => void;
}) {
  const { t, list, usd, tokens } = useI18n();
  const e = estimate(a);
  const models = compareModels(a);
  const strategies = compareStrategies(a);
  const sonnet = models.find((x) => x.model === "sonnet")!.usd;
  const cost = t("charts.cost");

  const stat = (label: string, v: { usd: number; tokens: number }, big?: boolean) => (
    <div className={`rounded-2xl p-4 ${big ? "bg-cobalt text-cobalt-ink" : "bg-surface-2"}`}>
      <p className="font-bold">{label}</p>
      <p className="display mt-1 text-[clamp(1.7rem,2.6vw,2.4rem)] break-words">{usd(v.usd)}</p>
      <p className={big ? "opacity-85" : "text-ink-2"}>{t("results.tokens", { n: tokens(v.tokens) })}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
        <Section title={t("results.title")} lead={t("results.lead")}>
          <div className="grid gap-3 sm:grid-cols-3">
            {stat(t("results.day"), e.perDay)}
            {stat(t("results.week"), e.perWeek)}
            {stat(t("results.month"), e.perMonth, true)}
          </div>
          <div className="mt-5 rounded-2xl border-[3px] border-marker p-4">
            <p className="font-bold">{t("results.planTitle")}</p>
            <p className="display mt-1 text-[1.5rem]">{t(`plans.${e.plan}.t`)}</p>
            <p className="mt-1">{t(`plans.${e.plan}.d`)}</p>
            <p className="mt-2 text-[0.95rem] text-ink-2">{t("results.planNote")}</p>
          </div>
          <p className="mt-4 text-[0.95rem] text-ink-2">{t("results.disclaimer")}</p>
        </Section>

        <details className="rounded-3xl border-2 border-line bg-surface p-5 lg:hidden">
          <summary className="display cursor-pointer text-[1.4rem]">{t("results.adjust")}</summary>
          <div className="mt-4"><Adjust a={a} onChange={onChange} /></div>
        </details>

        <Section title={t("charts.modelsTitle")} lead={t("charts.modelsLead")}>
          <BarChart
            head={[t("charts.model"), cost]}
            reference={sonnet}
            bars={models.map((x) => ({
              id: x.model,
              label: x.model === a.model ? `${t(`models.${x.model}.t`)} (${t("charts.selected")})` : t(`models.${x.model}.t`),
              value: x.usd,
              highlight: x.model === a.model,
            }))}
          />
        </Section>

        <Section title={t("charts.strategiesTitle")} lead={t("charts.strategiesLead")}>
          <BarChart
            head={[t("charts.model"), cost]}
            reference={strategies[0].usd}
            bars={strategies.map((s) => ({ id: s.id, label: t(`charts.strategies.${s.id}`), value: s.usd, highlight: s.id === "trio" }))}
          />
          <p className="mt-5 max-w-[65ch]"><Rich text={t("charts.trioNote")} /></p>
          <div className="mt-2"><Code text={"CLAUDE_CODE_SUBAGENT_MODEL=haiku claude --model sonnet --advisor opus"} /></div>
          <p className="mt-3 max-w-[65ch] text-[0.95rem] text-ink-2">{t("charts.trioWhy")}</p>
        </Section>

        <Section title={t("charts.breakdownTitle")} lead={t("charts.breakdownLead")}>
          <StackChart
            head={[t("charts.breakdownTitle"), `${t("charts.rowTokens")} · ${t("charts.rowUsd")}`]}
            rowLabels={[t("charts.rowTokens"), t("charts.rowUsd")]}
            parts={(["cacheRead", "cacheWrite", "input", "output"] as const).map((k, i) => ({
              id: k,
              label: t(`charts.parts.${k}`),
              tokens: e.breakdownTokens[k],
              usd: e.breakdownUsd[k],
              color: `var(--s${i + 1})`,
            }))}
          />
        </Section>

        <Section title={t("recs.title")} lead={t("recs.lead")}>
          <RoleRecs role={role} onRole={onRole} />
        </Section>

        <Section title={t("recs.saversTitle")} lead={t("recs.saversLead")}>
          <RecList keys={TOKEN_SAVERS} />
        </Section>

        <Section title={t("anatomy.title")}>
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-bold text-spend">{t("anatomy.bad")}</p>
              <p className="mt-1 rounded-xl border-2 border-dashed border-line px-3 py-2 font-mono text-[0.95rem]">{t("anatomy.badPrompt")}</p>
            </div>
            <div>
              <p className="font-bold text-save">{t("anatomy.good")}</p>
              <p className="mt-1 rounded-xl border-2 border-line px-3 py-2 font-mono text-[0.95rem] leading-loose">
                {list("anatomy.goodParts").map((part, i) => (
                  <span key={i} className="underline decoration-[3px] underline-offset-[6px]" style={{ textDecorationColor: `var(--s${i + 1})` }}>
                    {part}{" "}
                  </span>
                ))}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.95rem]">
                {(["symptom", "where", "verify", "constraint"] as const).map((k, i) => (
                  <li key={k} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="h-[3px] w-4" style={{ background: `var(--s${i + 1})` }} />
                    {t(`anatomy.parts.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 max-w-[65ch] text-ink-2">{t("anatomy.why")}</p>
        </Section>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
          {(["save", "max"] as const).map((k) => (
            <Section key={k} title={t(`tips.${k}Title`)}>
              <ul className="grid gap-2">
                {list(`tips.${k}`).map((tip) => (
                  <li key={tip} className="flex gap-2 [overflow-wrap:anywhere]">
                    <span aria-hidden="true" className={`mt-2.5 size-2 shrink-0 rounded-full ${k === "save" ? "bg-save" : "bg-cobalt"}`} />
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>
      </div>

      <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border-2 border-line bg-surface p-5 lg:block">
        <h3 className="display mb-4 text-[1.4rem]">{t("results.adjust")}</h3>
        <Adjust a={a} onChange={onChange} />
      </aside>
    </div>
  );
}
