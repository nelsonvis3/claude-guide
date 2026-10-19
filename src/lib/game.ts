// El juego se calcula a partir de los pasos completados y los días con actividad: no se guarda aparte,
// así nunca se desincroniza entre el navegador y la cuenta.
import { NODES, PHASES, type Phase } from "./content.ts";

export const XP_PER_STEP: Record<Phase, number> = { start: 10, habits: 20, extend: 30, pro: 50 };
export const PHASE_BONUS = 50;

export const LEVELS = [
  { id: "kitten", min: 0 },
  { id: "curious", min: 60 },
  { id: "hunter", min: 250 },
  { id: "explorer", min: 700 },
  { id: "master", min: 1300 },
] as const;
export type LevelId = (typeof LEVELS)[number]["id"];

export const STICKERS = [
  "first-step", "phase-start", "phase-habits", "phase-extend", "phase-pro", "all-done",
  "streak-3", "streak-7", "streak-30", "token-saver", "model-combo", "role-pick",
] as const;
export type StickerId = (typeof STICKERS)[number];

const known = new Set(NODES.map((n) => n.id));
const valid = (done: string[]) => done.filter((id) => known.has(id));

// Paso en curso: el primero sin dominar. La ruta se hace en orden, así que todo lo posterior queda bloqueado.
export const current = (done: string[]) => {
  const i = NODES.findIndex((n) => !done.includes(n.id));
  return i === -1 ? NODES.length : i;
};
export const unlocked = (done: string[], id: string) => NODES.findIndex((n) => n.id === id) <= current(done);

export function phaseDone(done: string[], phase: Phase) {
  const ids = NODES.filter((n) => n.phase === phase).map((n) => n.id);
  return ids.every((id) => done.includes(id));
}

export function xp(done: string[]) {
  const steps = valid(done).reduce((sum, id) => sum + XP_PER_STEP[NODES.find((n) => n.id === id)!.phase], 0);
  return steps + PHASES.filter((p) => phaseDone(done, p)).length * PHASE_BONUS;
}

export const MAX_XP = NODES.reduce((s, n) => s + XP_PER_STEP[n.phase], 0) + PHASES.length * PHASE_BONUS;

export function level(points: number) {
  const i = LEVELS.findLastIndex((l) => points >= l.min);
  const next = LEVELS[i + 1];
  return {
    id: LEVELS[i].id,
    index: i,
    min: LEVELS[i].min,
    next: next?.min ?? null,
    progress: next ? (points - LEVELS[i].min) / (next.min - LEVELS[i].min) : 1,
  };
}

const dayMs = 86_400_000;
const toDay = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / dayMs);
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Días seguidos con actividad, contando hasta hoy (o ayer, para no perder la racha antes de que termine el día).
export function streak(days: string[], now = today()) {
  const set = new Set(days.map(toDay));
  let d = toDay(now);
  if (!set.has(d)) d -= 1;
  let n = 0;
  while (set.has(d)) {
    n++;
    d--;
  }
  return n;
}

export function bestStreak(days: string[]) {
  const sorted = [...new Set(days.map(toDay))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  sorted.forEach((d, i) => {
    run = i > 0 && d === sorted[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

export function stickers(p: { done: string[]; days: string[]; roleChosen: boolean }): StickerId[] {
  const done = valid(p.done);
  const best = bestStreak(p.days);
  const has = (...ids: string[]) => ids.every((id) => done.includes(id));
  const got: Record<StickerId, boolean> = {
    "first-step": done.length > 0,
    "phase-start": phaseDone(done, "start"),
    "phase-habits": phaseDone(done, "habits"),
    "phase-extend": phaseDone(done, "extend"),
    "phase-pro": phaseDone(done, "pro"),
    "all-done": done.length === NODES.length,
    "streak-3": best >= 3,
    "streak-7": best >= 7,
    "streak-30": best >= 30,
    "token-saver": has("context", "usage", "skilldoctor"),
    "model-combo": has("advisor", "subagentModel"),
    "role-pick": p.roleChosen,
  };
  return STICKERS.filter((s) => got[s]);
}
