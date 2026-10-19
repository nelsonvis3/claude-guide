"use client";
import { useCallback, useState } from "react";
import type { Celebration } from "@/components/Celebrate";
import { STICKER_EMOJI } from "@/components/Progress";
import { NODES, PHASES } from "./content";
import { level, phaseDone, stickers, today, xp, XP_PER_STEP } from "./game";
import { useI18n } from "./i18n";
import type { Profile } from "./profile";

const game = (p: Profile) => ({ points: xp(p.done), got: stickers({ done: p.done, days: p.days, roleChosen: true }) });

// Marca un paso como dominado, suma el día a la racha y decide qué celebrar.
export function useComplete(profile: Profile, setProfile: (fn: (p: Profile) => Profile) => void) {
  const { t } = useI18n();
  const [party, setParty] = useState<Celebration | null>(null);

  const complete = (id: string) => {
    if (profile.done.includes(id)) return;
    const next: Profile = { ...profile, done: [...profile.done, id], days: [...new Set([...profile.days, today()])].sort().slice(-400) };
    setProfile(() => next);
    const before = game(profile);
    const after = game(next);
    const n = Date.now();
    const phase = PHASES.find((p) => phaseDone(next.done, p) && !phaseDone(profile.done, p));
    const sticker = after.got.find((s) => !before.got.includes(s));
    if (level(after.points).index > level(before.points).index) {
      const lv = t(`game.levels.${level(after.points).id}`);
      setParty({ id: n, kind: "big", emoji: "⭐", title: t("game.levelUp", { level: lv }), sub: t("game.levelUpSub") });
    } else if (sticker) {
      const title = phase ? t("game.phaseDone", { phase: t(`phases.${phase}.t`) }) : t("game.newSticker");
      setParty({ id: n, kind: "big", emoji: STICKER_EMOJI[sticker], title, sub: t(`stickerNames.${sticker}.t`) });
    } else {
      setParty({ id: n, kind: "step", xp: XP_PER_STEP[NODES.find((x) => x.id === id)!.phase] });
    }
  };
  const closeParty = useCallback(() => setParty(null), []);
  return { complete, party, closeParty, points: xp(profile.done), got: game(profile).got };
}
