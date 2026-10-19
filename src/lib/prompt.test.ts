import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { buildPrompt, PROMPT_KINDS, PROMPT_RULES, tidy } from "./prompt.ts";

const dir = new URL("../messages/", import.meta.url);
const load = (f: string) => JSON.parse(readFileSync(new URL(f, dir), "utf8"));

test("tidy ordena espacios, mayúscula y punto final", () => {
  assert.equal(tidy("  agregá   login con google  ", "."), "Agregá login con google.");
  assert.equal(tidy("¿por qué falla?", "."), "¿por qué falla?");
  assert.equal(tidy("ログインを追加", "。"), "ログインを追加。");
  assert.equal(tidy("   \n ", "."), "");
});

test("el prompt usa lo que escribió la persona y cae a los textos de base", () => {
  const { out, rules } = load("es.json").prompt;
  assert.equal(buildPrompt({ idea: "", kind: "build", context: "", done: "", rules: [] }, out, rules), "");
  const p = buildPrompt({ idea: "agregá login con google", kind: "fix", context: "@src/auth.ts", done: "", rules: ["plan"] }, out, rules);
  assert.match(p, /Agregá login con google\./);
  assert.match(p, /@src\/auth\.ts\./);
  assert.ok(p.includes(out.done.fix) && p.includes(rules.plan) && !p.includes(rules.small));
  const e = buildPrompt({ idea: "explicame el login", kind: "explain", context: "", done: "", rules: [] }, out, rules);
  assert.ok(e.includes(out.context) && !e.includes(out.summary) && !e.includes(`## ${out.h.rules}`));
});

test("cada idioma tiene pasos y cierre para cada tipo de tarea y texto para cada regla", () => {
  for (const f of readdirSync(dir)) {
    const { out, rules } = load(f).prompt;
    for (const k of PROMPT_KINDS) assert.ok(out.steps[k]?.length && out.done[k], `${f} ${k}`);
    for (const r of PROMPT_RULES) assert.ok(rules[r], `${f} ${r}`);
  }
});
