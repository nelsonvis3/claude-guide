"use client";
import { useState } from "react";
import { NODES, PHASES, START_PHASE, type Node } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import type { Profile } from "@/lib/profile";

export function CopyButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          setOk(false);
        }
      }}
      className="shrink-0 rounded-md border-2 border-current px-2 py-0.5 text-[0.85rem] font-bold"
    >
      {ok ? t("route.copied") : t("route.copy")}
    </button>
  );
}

export function Code({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-ink px-3 py-2 text-bg">
      <pre className="flex-1 overflow-x-auto font-mono text-[0.9rem] leading-relaxed whitespace-pre-wrap break-words">{text}</pre>
      <CopyButton text={text} />
    </div>
  );
}

function Stop({ node, n, profile, onToggle }: { node: Node; n: number; profile: Profile; onToggle: () => void }) {
  const { t, m } = useI18n();
  const done = profile.done.includes(node.id);
  const forYou = node.uses?.includes(profile.answers.use);
  const inEstimate = node.feature && profile.answers.features.includes(node.feature);
  const prompt = (m.nodes as Record<string, { p?: string }>)[node.id]?.p;
  return (
    <li className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pb-6">
      <span
        aria-hidden="true"
        className={`relative z-10 grid size-10 place-items-center rounded-full border-[3px] font-mono font-bold ${
          done ? "border-cobalt bg-cobalt text-cobalt-ink" : "border-ink bg-surface"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <article className={`min-w-0 rounded-2xl border-2 p-4 [overflow-wrap:anywhere] ${done ? "border-line bg-surface/50" : "border-line bg-surface"}`}>
        <header className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="min-w-0 text-[1.2rem] font-bold [overflow-wrap:anywhere]">{t(`nodes.${node.id}.t`)}</h4>
          <label className="flex cursor-pointer items-center gap-2 text-[0.95rem]">
            <input type="checkbox" checked={done} onChange={onToggle} className="size-4 accent-[var(--cobalt)]" />
            {t("route.done")}
          </label>
        </header>
        {(forYou || inEstimate) && (
          <p className="mt-1 flex flex-wrap gap-1.5 text-[0.85rem] font-bold">
            {forYou && <span className="rounded-full bg-marker px-2 text-marker-ink">{t("route.forYou")}</span>}
            {inEstimate && <span className="rounded-full border-2 border-cobalt px-2 text-cobalt">{t("route.inEstimate")}</span>}
          </p>
        )}
        <p className="mt-2 max-w-[68ch] text-ink-2">{t(`nodes.${node.id}.d`)}</p>
        {node.code && <div className="mt-3"><Code text={node.code} /></div>}
        {prompt && (
          <div className="mt-3">
            <p className="text-[0.9rem] font-bold">{t("route.tryIt")}</p>
            <div className="mt-1 flex items-start gap-2 rounded-xl border-2 border-dashed border-line px-3 py-2">
              <p className="flex-1 text-[0.95rem]">{prompt}</p>
              <CopyButton text={prompt} />
            </div>
          </div>
        )}
        <a href={node.doc} target="_blank" rel="noreferrer" className="mt-3 inline-block font-bold text-cobalt underline underline-offset-4">
          {t("route.doc")}
        </a>
      </article>
    </li>
  );
}

export default function Roadmap({ profile, onToggle }: { profile: Profile; onToggle: (id: string) => void }) {
  const { t } = useI18n();
  const start = START_PHASE[profile.experience];
  const total = NODES.length;
  const doneCount = NODES.filter((n) => profile.done.includes(n.id)).length;
  return (
    <section id="ruta" className="scroll-mt-20">
      <h2 className="display text-[2.4rem] sm:text-[3rem]">{t("route.title")}</h2>
      <p className="mt-2 max-w-[60ch] text-ink-2">{t("route.lead")}</p>
      <div className="mt-4 max-w-md">
        <p className="font-bold">{t("route.progress", { done: doneCount, total })}</p>
        <div className="mt-1 h-3 rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount}>
          <div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${(doneCount / total) * 100}%` }} />
        </div>
      </div>
      <div className="mt-8 grid gap-4">
        {PHASES.map((phase) => (
          <details
            key={phase}
            open={phase === start}
            className={`group rounded-3xl p-3 sm:p-5 ${phase === start ? "border-[3px] border-marker" : "border-2 border-line"}`}
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1">
              <span aria-hidden="true" className="font-mono transition-transform group-open:rotate-90">▸</span>
              <h3 className="display text-[1.7rem]">{t(`phases.${phase}.t`)}</h3>
              <span className="text-ink-2">{t(`phases.${phase}.d`)}</span>
              {phase === start && (
                <span className="rounded-full bg-marker px-3 py-0.5 text-[0.9rem] font-bold text-marker-ink">{t("route.startHere")}</span>
              )}
            </summary>
            <ol className="relative mt-5 before:absolute before:top-2 before:bottom-6 before:left-[1.2rem] before:border-l-[3px] before:border-dashed before:border-line">
              {NODES.filter((x) => x.phase === phase).map((node) => (
                <Stop key={node.id} node={node} n={NODES.indexOf(node) + 1} profile={profile} onToggle={() => onToggle(node.id)} />
              ))}
            </ol>
          </details>
        ))}
      </div>
    </section>
  );
}
