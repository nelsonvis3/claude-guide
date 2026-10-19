"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export type Bar = { id: string; label: string; value: number; highlight?: boolean };

function Table({ rows, head }: { rows: [string, string][]; head: [string, string] }) {
  const { t } = useI18n();
  return (
    <details className="mt-3 text-[0.95rem]">
      <summary className="cursor-pointer text-ink-2 underline underline-offset-4">{t("charts.table")}</summary>
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-line text-left">
            <th className="py-1 font-bold">{head[0]}</th>
            <th className="py-1 text-right font-bold">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-b border-line">
              <td className="py-1">{a}</td>
              <td className="py-1 text-right font-mono">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

// Barras horizontales de una sola serie: la elegida en tono fuerte, el resto en tono suave.
export function BarChart({ bars, reference, head }: { bars: Bar[]; reference?: number; head: [string, string] }) {
  const { usd } = useI18n();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...bars.map((b) => b.value), 0.01);
  return (
    <figure>
      <ul className="grid gap-3">
        {bars.map((b) => {
          const ratio = reference ? b.value / reference : null;
          return (
            <li
              key={b.id}
              tabIndex={0}
              onMouseEnter={() => setHover(b.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(b.id)}
              onBlur={() => setHover(null)}
              className="grid grid-cols-1 gap-1 rounded-lg outline-offset-4 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:items-center sm:gap-3"
            >
              <span className={b.highlight ? "font-bold" : "text-ink-2"}>{b.label}</span>
              <span className="relative flex items-center gap-2">
                <span
                  className="h-7 rounded-r-[4px] transition-[width] duration-500"
                  style={{
                    width: `max(4px, calc((100% - 6.5rem) * ${b.value / max}))`,
                    background: b.highlight ? "var(--bar-strong)" : "var(--bar-muted)",
                  }}
                />
                <span className="font-mono text-[0.95rem] whitespace-nowrap">{usd(b.value)}</span>
                {hover === b.id && ratio !== null && (
                  <span role="status" className="absolute -top-9 left-0 z-10 rounded-lg border-2 border-ink bg-surface px-2 py-0.5 text-[0.9rem] whitespace-nowrap shadow-[3px_3px_0_var(--ink)]">
                    {b.label}: {usd(b.value)} · ×{ratio.toFixed(ratio < 1 ? 2 : 1)}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <Table head={head} rows={bars.map((b) => [b.label, usd(b.value)])} />
    </figure>
  );
}

export type Part = { id: string; label: string; tokens: number; usd: number; color: string };

// Dos barras apiladas con las mismas partes: proporción de tokens contra proporción de plata.
export function StackChart({ parts, rowLabels, head }: { parts: Part[]; rowLabels: [string, string]; head: [string, string] }) {
  const { usd, tokens } = useI18n();
  const [hover, setHover] = useState<string | null>(null);
  const totals = { tokens: parts.reduce((s, p) => s + p.tokens, 0) || 1, usd: parts.reduce((s, p) => s + p.usd, 0) || 1 };
  const pct = (v: number, k: "tokens" | "usd") => `${Math.round((v / totals[k]) * 100)}%`;
  return (
    <figure>
      <div className="grid gap-3">
        {(["tokens", "usd"] as const).map((k, row) => (
          <div key={k} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-3">
            <span className="font-bold">{rowLabels[row]}</span>
            <div className="flex h-10 w-full gap-[2px] overflow-hidden rounded-[4px]">
              {parts.map((p) => (
                <span
                  key={p.id}
                  tabIndex={0}
                  aria-label={`${rowLabels[row]} · ${p.label}: ${pct(p[k], k)}`}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                  className="grid h-full place-items-center overflow-hidden font-mono text-[0.85rem] font-bold text-[#10232a] transition-[width,opacity] duration-500"
                  style={{ width: `${(p[k] / totals[k]) * 100}%`, background: p.color, opacity: hover && hover !== p.id ? 0.45 : 1 }}
                >
                  {p[k] / totals[k] > 0.12 ? pct(p[k], k) : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {parts.map((p) => (
          <li key={p.id} className={`flex items-center gap-2 ${hover === p.id ? "font-bold" : ""}`}>
            <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px]" style={{ background: p.color }} />
            <span className="flex-1">{p.label}</span>
            <span className="font-mono text-[0.95rem]">{tokens(p.tokens)} · {usd(p.usd)}</span>
          </li>
        ))}
      </ul>
      <Table head={head} rows={parts.map((p) => [p.label, `${tokens(p.tokens)} · ${usd(p.usd)}`])} />
    </figure>
  );
}
