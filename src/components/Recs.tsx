"use client";
import { resolve, ROLE_IDS, ROLES, type Role } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { Code } from "./Roadmap";

// Etiqueta de origen: ayuda a distinguir lo oficial de lo de la comunidad.
const SOURCE: Record<string, string> = {
  commands: "src.builtin", plugins: "src.official", askills: "src.anthropicSkills", kw: "src.knowledgeWork", community: "src.community",
};

export function RecCard({ k }: { k: string }) {
  const { t, tokens } = useI18n();
  const r = resolve(k);
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-2xl border-2 border-line bg-surface p-4 [overflow-wrap:anywhere]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        {r.url ? (
          <a href={r.url} target="_blank" rel="noreferrer" className="font-mono font-bold text-cobalt underline underline-offset-4">{r.id}</a>
        ) : (
          <code className="font-mono font-bold">{r.ns === "commands" ? `/${r.id}` : r.id}</code>
        )}
        <span className="text-[0.85rem] text-ink-2">
          {t(`recs.${SOURCE[r.ns]}`)}
          {r.stars ? ` · ★ ${tokens(r.stars)}` : ""}
        </span>
      </div>
      <p className="text-ink-2">{t(`${r.ns}.${r.id}`)}</p>
      {r.install && r.ns !== "commands" && <Code text={r.install} />}
    </li>
  );
}

export function RecList({ keys }: { keys: readonly string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {keys.map((k) => <RecCard key={k} k={k} />)}
    </ul>
  );
}

export function RoleChips({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const { t } = useI18n();
  return (
    <div role="radiogroup" aria-label={t("recs.pickRole")} className="flex flex-wrap gap-2">
      {ROLE_IDS.map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={value === r}
          onClick={() => onChange(r)}
          className={`rounded-full border-2 px-3 py-1 font-bold ${value === r ? "border-cobalt bg-cobalt text-cobalt-ink" : "border-line hover:border-ink"}`}
        >
          {t(`roles.${r}.t`)}
        </button>
      ))}
    </div>
  );
}

export function RoleRecs({ role, onRole }: { role: Role; onRole: (r: Role) => void }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4">
      <RoleChips value={role} onChange={onRole} />
      <p className="max-w-[65ch] text-ink-2">{t(`roles.${role}.d`)}</p>
      <RecList keys={ROLES[role]} />
    </div>
  );
}
