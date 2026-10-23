"use client";
import { useCallback, useRef, useState } from "react";
import type { Celebration } from "@/components/Celebrate";
import { STICKER_EMOJI } from "@/components/Progress";
import { NODES, PHASES } from "./content";
import { level, passedTests, phaseDone, stickers, SUPPORT_EVERY, today, xp, XP_PER_STEP } from "./game";
import { useI18n } from "./i18n";
import type { Profile } from "./profile";

const game = (p: Profile) => ({ points: xp(p.done), got: stickers({ done: p.done, days: p.days, roleChosen: true }) });
type Big = { emoji: string; title: string; sub: string };

// Marca una prueba como aprobada (un paso o una guía), suma el día a la racha y decide qué celebrar.
// `big` es el festejo propio de una guía; cada SUPPORT_EVERY pruebas, después del festejo, sale el aviso de apoyo.
export function useComplete(profile: Profile, setProfile: (fn: (p: Profile) => Profile) => void) {
  const { t } = useI18n();
  const [party, setParty] = useState<Celebration | null>(null);
  const supportNext = useRef(false);

  const complete = (id: string, custom?: Big) => {
    if (profile.done.includes(id)) return;
    const next: Profile = { ...profile, done: [...profile.done, id], days: [...new Set([...profile.days, today()])].sort().slice(-400) };
    setProfile(() => next);
    const before = game(profile);
    const after = game(next);
    const n = Date.now();
    const phase = PHASES.find((p) => phaseDone(next.done, p) && !phaseDone(profile.done, p));
    const sticker = after.got.find((s) => !before.got.includes(s));
    const support = passedTests(next.done) % SUPPORT_EVERY === 0;
    let big: Big | null = custom ?? null;
    if (level(after.points).index > level(before.points).index) {
      const lv = t(`game.levels.${level(after.points).id}`);
      big = { emoji: "⭐", title: t("game.levelUp", { level: lv }), sub: t("game.levelUpSub") };
    } else if (sticker) {
      const title = phase ? t("game.phaseDone", { phase: t(`phases.${phase}.t`) }) : t("game.newSticker");
      big = { emoji: STICKER_EMOJI[sticker], title, sub: t(`stickerNames.${sticker}.t`) };
    }
    if (big) {
      setParty({ id: n, kind: "big", ...big });
      supportNext.current = support;
    } else if (support) {
      setParty({ id: n, kind: "support" });
    } else {
      setParty({ id: n, kind: "step", xp: XP_PER_STEP[NODES.find((x) => x.id === id)!.phase] });
    }
  };
  const closeParty = useCallback(() => {
    if (supportNext.current) {
      supportNext.current = false;
      setParty({ id: Date.now(), kind: "support" });
    } else setParty(null);
  }, []);
  return { complete, party, closeParty, points: xp(profile.done), got: game(profile).got };
}
