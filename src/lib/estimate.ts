// Estimador de tokens y costo de Claude Code. Sin imports: lo corre `node --test` directo.
// Precios: platform.claude.com/docs/en/about-claude/pricing (consultado 2026-10-18).
// Calibración: code.claude.com/docs/en/costs dice ~US$13 por dev y día activo (90% < US$30).

export type ModelId = "haiku" | "sonnet" | "opus" | "fable";
export type UseId = "learn" | "fixes" | "fullstack" | "refactor" | "automation" | "content";
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";
export type FeatureId =
  | "plan" | "clear" | "skills" | "mcp" | "hooks" | "codeintel"
  | "subagents" | "advisor" | "loop" | "teams" | "ultracode" | "fast";

export type Answers = {
  use: UseId;
  hoursPerDay: number;
  daysPerWeek: number;
  model: ModelId;
  effort: Effort;
  features: FeatureId[];
  subagentModel: "inherit" | "haiku" | "sonnet";
  advisorModel: "opus" | "fable";
};

// US$ por millón de tokens: entrada, escritura de caché (5 min), lectura de caché, salida.
type Price = { input: number; cacheWrite: number; cacheRead: number; output: number };
export const PRICES: Record<ModelId, Price> = {
  // shortcut: Haiku 5.5 cobra más arriba de 100K tokens de prompt; promediamos los dos tramos
  // porque en Claude Code la mitad de los pedidos suele superar ese tamaño. Ajustar si hay datos reales.
  haiku: { input: 0.3, cacheWrite: 0.375, cacheRead: 0.03, output: 1.5 },
  sonnet: { input: 2, cacheWrite: 2.5, cacheRead: 0.1, output: 10 },
  opus: { input: 4, cacheWrite: 5, cacheRead: 0.2, output: 20 },
  fable: { input: 10, cacheWrite: 12.5, cacheRead: 0.25, output: 50 },
};
// Fast mode de Opus 5.5: US$8 / US$40 por MTok, el doble del precio normal.
const FAST_MULTIPLIER = 2;

// Tokens de una hora activa típica (estimación propia): casi todo es relectura de caché,
// porque Claude Code reenvía la conversación entera en cada pedido.
type Tokens = { input: number; cacheWrite: number; cacheRead: number; output: number };
const HOUR: Tokens = { input: 20_000, cacheWrite: 300_000, cacheRead: 4_000_000, output: 60_000 };

export const USE_INTENSITY: Record<UseId, number> = {
  learn: 0.5, fixes: 0.8, fullstack: 1, refactor: 1.5, automation: 1.2, content: 0.6,
};
// El razonamiento se cobra como salida; más esfuerzo = más tokens de salida.
export const EFFORT_OUTPUT: Record<Effort, number> = {
  low: 0.6, medium: 1, high: 1.5, xhigh: 2.2, max: 3,
};

// Efecto de cada función sobre el volumen total (1 = sin cambio). Estimaciones propias
// basadas en lo que describe la doc; los números exactos dependen de cada proyecto.
const FEATURE_FACTOR: Partial<Record<FeatureId, number>> = {
  plan: 0.9,       // menos retrabajo (doc: "preventing expensive re-work")
  clear: 0.8,      // contexto viejo se paga en cada mensaje
  skills: 1.02,    // solo las descripciones viven en contexto
  mcp: 1.08,       // nombres diferidos; pesan los resultados de las herramientas
  hooks: 0.92,     // filtrar salidas largas (doc: de decenas de miles a cientos de tokens)
  codeintel: 0.93, // menos lecturas de archivos
  ultracode: 1.6,  // workflows dinámicos lanzan muchos subagentes
};
const SUBAGENT_SHARE = 0.25; // parte extra del trabajo que hacen los subagentes
const TEAMS_SHARE = 0.2;     // parte del tiempo con agent teams activos
const TEAMS_FACTOR = 7;      // doc: ~7x tokens con teammates en plan mode
const ADVISOR_CALLS_PER_HOUR = 2;
const ADVISOR_READ = 100_000; // el asesor lee la conversación entera, sin caché (doc)
const ADVISOR_OUT = 2_000;
const LOOP_RUNS_PER_HOUR = 6; // /loop cada 10 minutos
const LOOP_RUN: Tokens = { input: 0, cacheWrite: 0, cacheRead: 120_000, output: 2_000 };

export type Breakdown = Tokens;
export type Estimate = {
  perDay: { tokens: number; usd: number };
  perWeek: { tokens: number; usd: number };
  perMonth: { tokens: number; usd: number };
  breakdownUsd: Breakdown; // costo diario por tipo de token
  breakdownTokens: Breakdown; // tokens diarios por tipo
  plan: "pro" | "max5" | "max20" | "max20plus";
};

const scale = (t: Tokens, k: number): Tokens => ({
  input: t.input * k, cacheWrite: t.cacheWrite * k, cacheRead: t.cacheRead * k, output: t.output * k,
});
const add = (a: Tokens, b: Tokens): Tokens => ({
  input: a.input + b.input, cacheWrite: a.cacheWrite + b.cacheWrite,
  cacheRead: a.cacheRead + b.cacheRead, output: a.output + b.output,
});
const sum = (t: Tokens) => t.input + t.cacheWrite + t.cacheRead + t.output;
const usd = (t: Tokens, p: Price, k = 1): Breakdown => ({
  input: (t.input / 1e6) * p.input * k,
  cacheWrite: (t.cacheWrite / 1e6) * p.cacheWrite * k,
  cacheRead: (t.cacheRead / 1e6) * p.cacheRead * k,
  output: (t.output / 1e6) * p.output * k,
});

export function estimate(a: Answers): Estimate {
  const has = (f: FeatureId) => a.features.includes(f);
  let factor = USE_INTENSITY[a.use];
  for (const f of a.features) factor *= FEATURE_FACTOR[f] ?? 1;
  if (has("teams")) factor *= 1 + (TEAMS_FACTOR - 1) * TEAMS_SHARE;

  const hour = { ...HOUR, output: HOUR.output * EFFORT_OUTPUT[a.effort] };
  const main = scale(hour, factor * a.hoursPerDay);
  const priceMul = has("fast") && a.model === "opus" ? FAST_MULTIPLIER : 1;
  let cost = usd(main, PRICES[a.model], priceMul);
  let tokens = main;

  if (has("subagents")) {
    const sub = scale(main, SUBAGENT_SHARE);
    const subModel = a.subagentModel === "inherit" ? a.model : a.subagentModel;
    cost = add(cost, usd(sub, PRICES[subModel]));
    tokens = add(tokens, sub);
  }
  if (has("advisor")) {
    const calls = ADVISOR_CALLS_PER_HOUR * a.hoursPerDay;
    const adv: Tokens = { input: ADVISOR_READ * calls, cacheWrite: 0, cacheRead: 0, output: ADVISOR_OUT * calls };
    cost = add(cost, usd(adv, PRICES[a.advisorModel]));
    tokens = add(tokens, adv);
  }
  if (has("loop")) {
    const loop = scale(LOOP_RUN, LOOP_RUNS_PER_HOUR * a.hoursPerDay);
    cost = add(cost, usd(loop, PRICES[a.model], priceMul));
    tokens = add(tokens, loop);
  }

  const dayUsd = sum(cost);
  const dayTokens = sum(tokens);
  const week = a.daysPerWeek;
  const month = week * 4.33;
  return {
    perDay: { tokens: dayTokens, usd: dayUsd },
    perWeek: { tokens: dayTokens * week, usd: dayUsd * week },
    perMonth: { tokens: dayTokens * month, usd: dayUsd * month },
    breakdownUsd: cost,
    breakdownTokens: tokens,
    plan: recommendPlan(dayUsd * month),
  };
}

// Heurística propia: Anthropic no publica cuántos dólares de API equivale cada plan.
// Solo dice que Max 5x = 5 veces y Max 20x = 20 veces el uso por sesión de Pro.
export function recommendPlan(monthlyApiUsd: number): Estimate["plan"] {
  if (monthlyApiUsd < 60) return "pro";
  if (monthlyApiUsd < 300) return "max5";
  if (monthlyApiUsd < 1200) return "max20";
  return "max20plus";
}

// Mismo uso con cada modelo solo, sin asesor ni subagentes (esos van en compareStrategies).
export function compareModels(a: Answers) {
  const features = a.features.filter((f) => !["subagents", "advisor", "fast"].includes(f));
  return (Object.keys(PRICES) as ModelId[]).map((model) => ({ model, usd: estimate({ ...a, model, features }).perDay.usd }));
}

// Estrategias de combinación de modelos, mismo uso. La del medio es la del post de @_guillecasaus.
export function compareStrategies(a: Answers) {
  const base = { ...a, features: a.features.filter((f) => !["subagents", "advisor", "fast"].includes(f)) };
  const withF = (...f: FeatureId[]) => [...base.features, ...f];
  return [
    { id: "opusAll", usd: estimate({ ...base, model: "opus" }).perDay.usd },
    { id: "sonnetAll", usd: estimate({ ...base, model: "sonnet" }).perDay.usd },
    {
      id: "trio",
      usd: estimate({ ...base, model: "sonnet", features: withF("subagents", "advisor"), subagentModel: "haiku", advisorModel: "opus" }).perDay.usd,
    },
    { id: "haikuAdvisor", usd: estimate({ ...base, model: "haiku", features: withF("advisor"), advisorModel: "opus" }).perDay.usd },
  ] as const;
}
