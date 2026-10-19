"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// Globo de diálogo que "tipea" el texto. El texto completo está siempre disponible para lectores de pantalla.
export default function Bubble({ text, sub }: { text: string; sub?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  // El padre le pone key={text}: cada texto nuevo monta un globo nuevo y arranca de cero.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setShown((n) => (n >= text.length ? (clearInterval(id), n) : n + 2)), 18);
    return () => clearInterval(id);
  }, [text, reduce]);

  const visible = reduce ? text : text.slice(0, shown);
  return (
    <div
      className="relative rounded-3xl bg-surface px-5 py-4 shadow-soft"
      onClick={() => setShown(text.length)}
    >
      <span aria-hidden="true" className="absolute -bottom-2 left-12 h-5 w-5 rotate-45 rounded-[4px] bg-surface" />
      <p className="sr-only" aria-live="polite">{text} {sub}</p>
      <p aria-hidden="true" className="relative text-[1.3rem] leading-snug font-semibold">
        {visible}
        <span className="invisible">{text.slice(visible.length)}</span>
      </p>
      {sub && <p aria-hidden="true" className="relative mt-2 text-ink-2">{sub}</p>}
    </div>
  );
}
