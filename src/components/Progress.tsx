"use client";
import { motion } from "motion/react";
import type { Role } from "@/lib/content";
import { level, LEVELS, MAX_XP, STICKERS, type StickerId } from "@/lib/game";
import { useI18n } from "@/lib/i18n";
import Mascot, { Peek } from "./Mascot";

export const STICKER_EMOJI: Record<StickerId, string> = {
  "first-step": "👣", "phase-start": "🌱", "phase-habits": "🧭", "phase-extend": "🧰", "phase-pro": "🏔️",
  "all-done": "🏆", "streak-3": "🔥", "streak-7": "⚡", "streak-30": "🌟", "token-saver": "🪙",
  "model-combo": "🎼", "role-pick": "🎭",
};

// Barrita flotante: nivel, XP y racha. Lleva al álbum de stickers.
export function Hud({ points, streak }: { points: number; streak: number }) {
  const { t } = useI18n();
  const lv = level(points);
  return (
    <a
      href="#logros"
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-surface/95 px-4 py-2 shadow-soft backdrop-blur"
      aria-label={`${t(`game.levels.${lv.id}`)} · ${t("game.xp", { n: points })} · ${t("game.streak", { n: streak })}`}
    >
      <span className="text-[0.85rem] font-bold whitespace-nowrap">{t(`game.levels.${lv.id}`)}</span>
      <span className="h-2 w-20 overflow-hidden rounded-full bg-surface-2 sm:w-28">
        <motion.span className="block h-full rounded-full bg-cobalt" animate={{ width: `${lv.progress * 100}%` }} />
      </span>
      <span className="font-mono text-[0.85rem] whitespace-nowrap">{points} XP</span>
      <span className="text-[0.85rem] whitespace-nowrap" title={t("game.streak", { n: streak })}>🔥 {streak}</span>
    </a>
  );
}

export default function Progress({ points, streak, got, role, remind }: {
  points: number; streak: number; got: StickerId[]; role: Role;
  remind?: { on: boolean; set: (on: boolean) => void }; // solo con sesión: el aviso necesita el correo de la cuenta
}) {
  const { t } = useI18n();
  const lv = level(points);
  const next = LEVELS[lv.index + 1];
  return (
    <section id="logros" className="relative scroll-mt-24">
      <Peek size={92} className="absolute -top-[56px] right-6" />
      <div className="grid gap-6 rounded-3xl bg-surface p-6 shadow-soft sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
        <Mascot mood="happy" size={150} role={role} />
        <div>
          <p className="text-ink-2">{t("game.progressTitle")}</p>
          <h2 className="display text-[2.2rem] sm:text-[2.6rem]">{t(`game.levels.${lv.id}`)}</h2>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={MAX_XP} aria-valuenow={points}>
            <motion.div className="h-full rounded-full bg-cobalt" animate={{ width: `${lv.progress * 100}%` }} />
          </div>
          <p className="mt-2 text-ink-2">
            {t("game.xp", { n: points })} · {next ? t("game.toNext", { n: next.min - points, level: t(`game.levels.${next.id}`) }) : t("game.maxLevel")}
          </p>
          <p className="mt-1 font-bold">{streak > 0 ? `🔥 ${t("game.streak", { n: streak })}` : t("game.streakNone")}</p>
          {remind ? (
            <label className="mt-3 flex cursor-pointer items-start gap-2">
              <input type="checkbox" checked={remind.on} onChange={(e) => remind.set(e.target.checked)} className="mt-1 size-4 accent-[var(--cobalt)]" />
              <span>{t("game.remind")}<span className="block text-[0.85rem] text-ink-2">{t("game.remindNote")}</span></span>
            </label>
          ) : (
            <p className="mt-3 text-[0.9rem] text-ink-2">{t("game.remindLogin")}</p>
          )}
        </div>
      </div>

      <h3 className="display mt-10 text-[1.7rem]">{t("game.stickers")}</h3>
      <p className="mt-1 text-ink-2">{t("game.stickersLead", { got: got.length, total: STICKERS.length })}</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {STICKERS.map((s) => {
          const has = got.includes(s);
          return (
            <li key={s} className={`flex items-center gap-3 rounded-2xl p-3 ${has ? "bg-surface shadow-soft" : "bg-surface-2"}`}>
              <span
                aria-hidden="true"
                className={`grid size-12 shrink-0 place-items-center rounded-full text-[1.6rem] ${has ? "bg-[var(--glow)]" : "bg-surface opacity-50 grayscale"}`}
              >
                {STICKER_EMOJI[s]}
              </span>
              <span className="min-w-0">
                <span className={`block text-[0.95rem] font-bold ${has ? "" : "text-ink-2"}`}>{t(`stickerNames.${s}.t`)}</span>
                <span className="block text-[0.85rem] text-ink-2">{has ? t(`stickerNames.${s}.d`) : t("game.locked")}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
