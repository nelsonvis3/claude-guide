"use client";
import { FEATURES, MODELS, ROLE_IDS, USES, type Role } from "@/lib/content";
import type { Answers, Effort, FeatureId } from "@/lib/estimate";
import { useI18n } from "@/lib/i18n";
import type { Experience } from "@/lib/profile";

type Set<T> = (v: T) => void;

function Choice({ selected, onClick, title, desc, compact }: {
  selected: boolean; onClick: () => void; title: string; desc?: string; compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-2xl border text-left transition-colors ${compact ? "px-3 py-2" : "px-4 py-3"} ${
        selected ? "border-cobalt bg-cobalt text-cobalt-ink" : "border-line bg-surface hover:border-cobalt"
      }`}
    >
      <span className="block font-bold">{title}</span>
      {desc && !compact && <span className={`block text-[0.95rem] ${selected ? "opacity-90" : "text-ink-2"}`}>{desc}</span>}
    </button>
  );
}

export function UsePicker({ value, onChange, compact }: { value: Answers["use"]; onChange: Set<Answers["use"]>; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
      {USES.map((u) => (
        <Choice key={u} compact={compact} selected={value === u} onClick={() => onChange(u)} title={t(`uses.${u}.t`)} desc={t(`uses.${u}.d`)} />
      ))}
    </div>
  );
}

export function RolePicker({ value, onChange }: { value: Role; onChange: Set<Role> }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ROLE_IDS.map((r) => (
        <Choice key={r} compact selected={value === r} onClick={() => onChange(r)} title={t(`roles.${r}.t`)} />
      ))}
    </div>
  );
}

export function ExperiencePicker({ value, onChange }: { value: Experience; onChange: Set<Experience> }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2">
      {(["new", "some", "daily"] as const).map((x) => (
        <Choice key={x} selected={value === x} onClick={() => onChange(x)} title={t(`experience.${x}.t`)} desc={t(`experience.${x}.d`)} />
      ))}
    </div>
  );
}

export function TimePicker({ a, onChange }: { a: Answers; onChange: Set<Partial<Answers>> }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-5">
      <label className="grid gap-1">
        <span className="flex justify-between font-bold">
          {t("onboarding.hours")} <output className="font-mono">{t("onboarding.hoursValue", { n: a.hoursPerDay })}</output>
        </span>
        <input type="range" min={1} max={12} value={a.hoursPerDay} onChange={(e) => onChange({ hoursPerDay: +e.target.value })} />
      </label>
      <label className="grid gap-1">
        <span className="flex justify-between font-bold">
          {t("onboarding.days")} <output className="font-mono">{t("onboarding.daysValue", { n: a.daysPerWeek })}</output>
        </span>
        <input type="range" min={1} max={7} value={a.daysPerWeek} onChange={(e) => onChange({ daysPerWeek: +e.target.value })} />
      </label>
    </div>
  );
}

const EFFORTS: Effort[] = ["low", "medium", "high", "xhigh", "max"];

export function ModelPicker({ a, onChange, compact }: { a: Answers; onChange: Set<Partial<Answers>>; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        {MODELS.map((m) => (
          <Choice key={m} compact={compact} selected={a.model === m} onClick={() => onChange({ model: m })} title={t(`models.${m}.t`)} desc={t(`models.${m}.d`)} />
        ))}
      </div>
      <fieldset>
        <legend className="font-bold">{t("onboarding.effort")}</legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {EFFORTS.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={a.effort === e}
              onClick={() => onChange({ effort: e })}
              className={`rounded-full border px-3 py-1 text-[0.95rem] ${a.effort === e ? "border-cobalt bg-cobalt text-cobalt-ink" : "border-line hover:border-cobalt"}`}
            >
              {t(`effortLevels.${e}`)}
            </button>
          ))}
        </div>
        {!compact && <p className="mt-2 text-[0.95rem] text-ink-2">{t("onboarding.effortHint")}</p>}
      </fieldset>
    </div>
  );
}

export function FeaturePicker({ a, onChange, compact }: { a: Answers; onChange: Set<Partial<Answers>>; compact?: boolean }) {
  const { t } = useI18n();
  const toggle = (f: FeatureId) =>
    onChange({ features: a.features.includes(f) ? a.features.filter((x) => x !== f) : [...a.features, f] });
  const select = "rounded-full border border-line bg-surface px-3 py-1";
  return (
    <div className="grid gap-3">
      <ul className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        {FEATURES.map(({ id, kind }) => {
          const on = a.features.includes(id);
          return (
            <li key={id}>
              <label className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-2 ${on ? "border-cobalt bg-surface" : "border-line bg-surface/60 hover:border-cobalt"}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(id)} className="mt-1.5 size-4 accent-[var(--cobalt)]" />
                <span>
                  <span className="flex items-center gap-2 font-bold">
                    <span aria-hidden="true" className={`size-2.5 rounded-full ${kind === "save" ? "bg-save" : "bg-spend"}`} />
                    {t(`features.${id}.t`)}
                  </span>
                  {!compact && <span className="block text-[0.95rem] text-ink-2">{t(`features.${id}.d`)}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {a.features.includes("subagents") && (
        <label className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold">{t("onboarding.subagentModel")}</span>
          <select className={select} value={a.subagentModel} onChange={(e) => onChange({ subagentModel: e.target.value as Answers["subagentModel"] })}>
            <option value="inherit">{t("onboarding.inherit")}</option>
            <option value="haiku">{t("models.haiku.t")}</option>
            <option value="sonnet">{t("models.sonnet.t")}</option>
          </select>
        </label>
      )}
      {a.features.includes("advisor") && (
        <label className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold">{t("onboarding.advisorModel")}</span>
          <select className={select} value={a.advisorModel} onChange={(e) => onChange({ advisorModel: e.target.value as Answers["advisorModel"] })}>
            <option value="opus">{t("models.opus.t")}</option>
            <option value="fable">{t("models.fable.t")}</option>
          </select>
        </label>
      )}
    </div>
  );
}
