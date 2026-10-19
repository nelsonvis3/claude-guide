"use client";
import { useEffect, useRef, useState } from "react";
import { solves, type Terminal as Spec } from "@/lib/lessons";
import { useI18n } from "@/lib/i18n";

type Line = { kind: "in" | "out" | "err" | "ok"; text: string };

// Mini terminal de Claude Code: escribís el comando (o apretás el atajo) y responde como lo haría Claude Code.
export default function Terminal({ spec, task, hint, solved, onSolve }: {
  spec: Spec; task: string; hint: string; solved: boolean; onSolve: () => void;
}) {
  const { t } = useI18n();
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: "✻ Claude Code" }]);
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Baja el historial de la terminal, sin mover la página.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = (input: { text?: string; key?: string }, shown: string) => {
    if (busy) return;
    if (solves(spec, input)) {
      setBusy(true);
      setLines((l) => [...l, { kind: "in", text: shown }]);
      spec.output.forEach((out, i) =>
        setTimeout(() => {
          setLines((l) => [...l, { kind: "out", text: out }]);
          if (i === spec.output.length - 1) {
            setLines((l) => [...l, { kind: "ok", text: t("lesson.termOk") }]);
            setBusy(false);
            onSolve();
          }
        }, 260 * (i + 1)),
      );
    } else {
      setLines((l) => [...l, { kind: "in", text: shown }, { kind: "err", text: t("lesson.termWrong") }]);
    }
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const combo = e.key === "Tab" && e.shiftKey ? "shift+tab" : e.key === "Escape" ? "escape" : (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" ? "ctrl+v" : null;
    // Los atajos de la consigna se capturan; el resto se comporta como siempre (Tab sigue moviendo el foco).
    if (combo && spec.key === combo) {
      e.preventDefault();
      run({ key: combo }, combo === "escape" ? "Esc" : combo === "shift+tab" ? "Shift+Tab" : "Ctrl+V");
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (text.trim()) run({ text }, text);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-[#1d1830] text-[#f1edf8] shadow-soft">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[0.85rem] text-white/60">claude</span>
      </div>
      <div className="px-4 pt-3 text-[0.95rem]">
        <p className="text-[#c9b6ef]">{task}</p>
        {showHint ? (
          <p className="mt-1 text-white/60">💡 {hint}</p>
        ) : (
          <button onClick={() => setShowHint(true)} className="mt-1 text-[0.9rem] text-white/60 underline underline-offset-4">
            {t("lesson.termHint")}
          </button>
        )}
      </div>
      <div ref={logRef} aria-live="polite" className="max-h-64 overflow-y-auto px-4 py-3 font-mono text-[0.9rem] leading-relaxed">
        {lines.map((l, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${
              l.kind === "in" ? "text-white" : l.kind === "err" ? "text-[#ff9b8f]" : l.kind === "ok" ? "font-bold text-[#7ee2a8]" : "text-white/70"
            }`}
          >
            {l.kind === "in" ? `› ${l.text}` : l.text}
          </p>
        ))}
      </div>
      <label className="flex items-center gap-2 border-t border-white/10 px-4 py-3 font-mono">
        <span aria-hidden="true" className="text-[#c9b6ef]">›</span>
        <span className="sr-only">{task}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
          placeholder={solved ? t("lesson.termDone") : t("lesson.termPlaceholder")}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
        />
      </label>
    </div>
  );
}
