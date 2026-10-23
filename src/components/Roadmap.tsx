"use client";
import Link from "next/link";
import { useState } from "react";
import { NODES, PHASES, type Node } from "@/lib/content";
import { current } from "@/lib/game";
import { Peek } from "./Mascot";
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
      className="shrink-0 rounded-full border border-current/30 px-3 py-0.5 text-[0.85rem] font-bold"
    >
      {ok ? t("route.copied") : t("route.copy")}
    </button>
  );
}

export function Code({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-[#1d1830] px-4 py-3 text-[#f1edf8]">
      <pre className="flex-1 overflow-x-auto font-mono text-[0.9rem] leading-relaxed whitespace-pre-wrap break-words">{text}</pre>
      <CopyButton text={text} />
    </div>
  );
}

function Stop({ node, n, profile }: { node: Node; n: number; profile: Profile }) {
  const { t } = useI18n();
  const done = profile.done.includes(node.id);
  const forYou = node.uses?.includes(profile.answers.use);
  const inEstimate = node.feature && profile.answers.features.includes(node.feature);
  return (
    <li className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pb-5">
      <span
        aria-hidden="true"
        className={`relative z-10 grid size-10 place-items-center rounded-full border-2 font-mono font-bold ${
          done ? "border-cobalt bg-cobalt text-cobalt-ink" : "border-cobalt bg-surface"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <article className={`min-w-0 rounded-2xl p-5 [overflow-wrap:anywhere] ${done ? "bg-surface/60" : "bg-surface shadow-soft"}`}>
        <h4 className="min-w-0 text-[1.2rem] font-bold [overflow-wrap:anywhere]">{t(`nodes.${node.id}.t`)}</h4>
        {(forYou || inEstimate) && (
          <p className="mt-1 flex flex-wrap gap-1.5 text-[0.85rem] font-bold">
            {forYou && <span className="rounded-full bg-marker px-2 text-marker-ink">{t("route.forYou")}</span>}
            {inEstimate && <span className="rounded-full bg-[var(--glow)] px-2 text-cobalt">{t("route.inEstimate")}</span>}
          </p>
        )}
        <p className="mt-2 max-w-[68ch] text-ink-2">{t(`nodes.${node.id}.d`)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/leccion/${node.id}`}
            className={`rounded-full px-5 py-2 font-bold ${done ? "bg-surface-2 text-ink" : "bg-cobalt text-cobalt-ink"}`}
          >
            {done ? t("lesson.review") : t("lesson.start")}
          </Link>
          {done ? (
            <span className="font-bold text-save">✓ {t("route.done")}</span>
          ) : (
            <span className="text-[0.9rem] text-ink-2">{t("lesson.passToMark")}</span>
          )}
        </div>
      </article>
    </li>
  );
}

export default function Roadmap({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const now = current(profile.done);
  // Se abre el tramo del paso en curso.
  const start = NODES[now]?.phase;
  const total = NODES.length;
  const doneCount = NODES.filter((n) => profile.done.includes(n.id)).length;
  return (
    <section id="ruta" className="relative scroll-mt-20">
      <Peek size={92} className="absolute -top-[56px] right-6" />
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
            className={`group rounded-3xl p-3 sm:p-5 ${phase === start ? "bg-[var(--glow)]" : "border border-line"}`}
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
                <Stop key={node.id} node={node} n={NODES.indexOf(node) + 1} profile={profile} />
              ))}
            </ol>
          </details>
        ))}
        <div className={`flex flex-wrap items-center gap-4 rounded-3xl p-5 ${now === total ? "bg-[var(--glow)]" : "border border-line opacity-70"}`}>
          <span aria-hidden="true" className="text-[2rem]">{profile.done.includes("exam") ? "🏆" : now === total ? "🎓" : "🔒"}</span>
          <div className="min-w-0 flex-1">
            <h3 className="display text-[1.7rem]">{t("exam.title")}</h3>
            <p className="text-ink-2">{now === total ? t("exam.ready") : t("exam.lockedRoute")}</p>
          </div>
          {now === total && (
            <Link href="/examen" className="rounded-full bg-cobalt px-5 py-2 font-bold text-cobalt-ink">
              {profile.done.includes("exam") ? t("exam.seeCert") : t("exam.start")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
