"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { REPO_URL, type Role } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import Mascot, { PLAY_PERIOD } from "./Mascot";

export type Celebration =
  | { id: number; kind: "step"; xp: number }
  | { id: number; kind: "big"; emoji: string; title: string; sub: string }
  | { id: number; kind: "support" };

const COLORS = ["#7449c9", "#ffb547", "#1baf7a", "#2a78d6", "#eb6834", "#e87ba4"];

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[2px]"
          style={{ left: `${(i * 97) % 100}%`, background: COLORS[i % COLORS.length] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "105vh", rotate: (i % 2 ? 1 : -1) * 540, opacity: [1, 1, 0.8] }}
          transition={{ duration: 2.2 + (i % 5) * 0.25, delay: (i % 7) * 0.08, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function Celebrate({ c, role, onClose }: { c: Celebration | null; role: Role; onClose: () => void }) {
  const { t, list } = useI18n();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!c) return;
    if (c.kind === "step") {
      const id = setTimeout(onClose, 2600);
      return () => clearTimeout(id);
    }
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [c, onClose]);

  const cheers = list("game.cheers");
  const dialog = "fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm";
  const card = "relative grid w-full max-w-sm justify-items-center gap-3 rounded-3xl bg-surface p-6 text-center shadow-soft";
  return (
    <AnimatePresence>
      {c?.kind === "step" && (
        <motion.div
          key={c.id}
          role="status"
          className="fixed right-4 bottom-4 z-50 flex items-end gap-2"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
        >
          <div className="mb-10 rounded-2xl bg-surface px-4 py-2 shadow-soft">
            <p className="font-bold">{cheers[c.id % cheers.length]}</p>
            <p className="font-mono text-cobalt">{t("game.plusXp", { n: c.xp })}</p>
          </div>
          <Mascot mood="happy" size={110} role={role} bounce={c.id} />
        </motion.div>
      )}
      {c?.kind === "big" && (
        <motion.div
          key={c.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebrate-title"
          className={dialog}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {!reduce && <Confetti />}
          <motion.div
            className={card}
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Mascot mood="happy" size={170} role={role} bounce={c.id} />
            <span aria-hidden="true" className="text-[2.6rem] leading-none">{c.emoji}</span>
            <h2 id="celebrate-title" className="display text-[1.7rem]">{c.title}</h2>
            <p className="text-ink-2">{c.sub}</p>
            <button ref={closeRef} onClick={onClose} className="mt-2 rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink">
              {t("game.continue")}
            </button>
          </motion.div>
        </motion.div>
      )}
      {c?.kind === "support" && (
        <motion.div
          key={c.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-title"
          className={dialog}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={card}
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="support-title" className="display text-[1.6rem]">{t("support.title")}</h2>
            <p>{t("support.text")}</p>
            <div className="relative pb-4">
              <Mascot mood="play" size={160} backdrop={false} />
              {/* El ratoncito corre de lado a lado y Tilde lo sigue con la cabeza, al mismo ritmo. */}
              <motion.span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 -ml-4 text-[1.9rem] leading-none"
                animate={reduce ? undefined : { x: [-70, 70, -70], y: [0, -8, 0, -8, 0] }}
                transition={{ duration: PLAY_PERIOD, repeat: Infinity, ease: "easeInOut" }}
              >
                🐭
              </motion.span>
            </div>
            <p className="text-[0.95rem] text-ink-2">{t("support.sub")}</p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink"
            >
              ⭐ {t("support.star")}
            </a>
            <button ref={closeRef} onClick={onClose} className="w-full rounded-full px-6 py-2.5 font-bold text-ink-2 hover:bg-surface-2">
              {t("support.keep")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
