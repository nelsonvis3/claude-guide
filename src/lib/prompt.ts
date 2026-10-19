// Generador de prompts para Claude Code. Arma el texto con plantillas en el navegador: no llama a ninguna API.
export const PROMPT_KINDS = ["build", "fix", "refactor", "test", "explain"] as const;
export const PROMPT_RULES = ["small", "ask", "plan", "safe"] as const;
export type PromptKind = (typeof PROMPT_KINDS)[number];
export type PromptRule = (typeof PROMPT_RULES)[number];

// Lo que trae messages.prompt.out en cada idioma.
export type PromptText = {
  h: { goal: string; context: string; steps: string; rules: string; done: string };
  context: string;
  steps: Record<PromptKind, string[]>;
  done: Record<PromptKind, string>;
  summary: string;
  stop: string;
};

// Limpia lo que escribió la persona: espacios de más, mayúscula inicial y punto final.
export function tidy(text: string, stop: string) {
  const s = text.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
  if (!s) return "";
  const out = s[0].toLocaleUpperCase() + s.slice(1);
  return /[.!?。！？:;)]$/.test(out) ? out : out + stop;
}

export function buildPrompt(
  input: { idea: string; kind: PromptKind; context: string; done: string; rules: PromptRule[] },
  out: PromptText,
  ruleText: Record<PromptRule, string>,
) {
  const goal = tidy(input.idea, out.stop);
  if (!goal) return "";
  const done = [tidy(input.done, out.stop) || out.done[input.kind], ...(input.kind === "explain" ? [] : [out.summary])];
  return [
    `## ${out.h.goal}\n${goal}`,
    `## ${out.h.context}\n${tidy(input.context, out.stop) || out.context}`,
    `## ${out.h.steps}\n${out.steps[input.kind].map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    ...(input.rules.length ? [`## ${out.h.rules}\n${input.rules.map((r) => `- ${ruleText[r]}`).join("\n")}`] : []),
    `## ${out.h.done}\n${done.map((d) => `- ${d}`).join("\n")}`,
  ].join("\n\n");
}
