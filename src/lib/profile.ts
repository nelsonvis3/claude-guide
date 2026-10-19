import { ROLE_IDS, type Role } from "./content";
import type { Answers, Effort, FeatureId, ModelId, UseId } from "./estimate";

export type Experience = "new" | "some" | "daily";
// days: fechas (AAAA-MM-DD) en que completó algún paso; de ahí sale la racha.
// remind: aceptó que le avisemos por correo si pasa 2 días sin entrar (solo con cuenta).
export type Profile = { name: string; experience: Experience; role: Role; answers: Answers; done: string[]; days: string[]; remind: boolean };

export const DEFAULT_ANSWERS: Answers = {
  use: "fullstack", hoursPerDay: 4, daysPerWeek: 5, model: "sonnet", effort: "medium",
  features: [], subagentModel: "inherit", advisorModel: "opus",
};

const USES: UseId[] = ["learn", "fixes", "fullstack", "refactor", "automation", "content"];
const MODELS: ModelId[] = ["haiku", "sonnet", "opus", "fable"];
const EFFORTS: Effort[] = ["low", "medium", "high", "xhigh", "max"];
const FEATURES: FeatureId[] = ["plan", "clear", "skills", "mcp", "hooks", "codeintel", "subagents", "advisor", "loop", "teams", "ultracode", "fast"];
const EXPERIENCES: Experience[] = ["new", "some", "daily"];

const oneOf = <T,>(list: readonly T[], v: unknown, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);
const int = (v: unknown, min: number, max: number, fallback: number) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? (v as number) : fallback;

// Valida lo que se lee de localStorage: descarta lo desconocido en vez de fallar.
export function parseProfile(x: unknown): Profile | null {
  if (typeof x !== "object" || x === null) return null;
  const p = x as Record<string, unknown>;
  const a = (typeof p.answers === "object" && p.answers !== null ? p.answers : {}) as Record<string, unknown>;
  const d = DEFAULT_ANSWERS;
  return {
    name: typeof p.name === "string" ? p.name.trim().slice(0, 40) : "",
    experience: oneOf(EXPERIENCES, p.experience, "new"),
    role: oneOf(ROLE_IDS, p.role, "fullstack"),
    answers: {
      use: oneOf(USES, a.use, d.use),
      hoursPerDay: int(a.hoursPerDay, 1, 12, d.hoursPerDay),
      daysPerWeek: int(a.daysPerWeek, 1, 7, d.daysPerWeek),
      model: oneOf(MODELS, a.model, d.model),
      effort: oneOf(EFFORTS, a.effort, d.effort),
      features: Array.isArray(a.features) ? [...new Set(a.features.filter((f) => FEATURES.includes(f)))] : [],
      subagentModel: oneOf(["inherit", "haiku", "sonnet"] as const, a.subagentModel, d.subagentModel),
      advisorModel: oneOf(["opus", "fable"] as const, a.advisorModel, d.advisorModel),
    },
    done: Array.isArray(p.done)
      ? [...new Set(p.done.filter((s): s is string => typeof s === "string" && s.length <= 40))].slice(0, 100)
      : [],
    days: Array.isArray(p.days)
      ? [...new Set(p.days.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort().slice(-400)
      : [],
    remind: p.remind === true,
  };
}
