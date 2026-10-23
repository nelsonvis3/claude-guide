import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { ROLE_IDS } from "./content.ts";
import { GUIDE_PASS, GUIDES } from "./guides.ts";

const dir = new URL("../guides/", import.meta.url);
const load = (f: string) => JSON.parse(readFileSync(new URL(f, dir), "utf8"));

test("cada rol tiene guía y la prueba se puede aprobar", () => {
  for (const r of ROLE_IDS) {
    const g = GUIDES[r];
    assert.ok(g, `falta GUIDES.${r}`);
    assert.ok(GUIDE_PASS <= g.answers.length, `${r}: hacen falta más respuestas correctas que preguntas`);
  }
});

// Cada idioma: una guía por rol, un texto por paso y una pregunta por respuesta, con la correcta entre las opciones.
for (const file of readdirSync(dir)) {
  test(`guías ${file}: completas y coherentes con las respuestas`, () => {
    const guides = load(file);
    for (const r of ROLE_IDS) {
      const g = guides[r];
      assert.ok(g?.lead, `${file}: falta ${r}`);
      assert.equal(g.steps.length, GUIDES[r].code.length, `${file}/${r}: cantidad de pasos`);
      g.steps.forEach((s: { t: string; d: string }, i: number) => assert.ok(s.t && s.d, `${file}/${r} paso ${i}: incompleto`));
      assert.equal(g.quiz.length, GUIDES[r].answers.length, `${file}/${r}: cantidad de preguntas`);
      g.quiz.forEach((q: { q: string; o: string[]; why: string }, i: number) => {
        assert.ok(q.q && q.why && q.o.length >= 3, `${file}/${r}#${i}: pregunta incompleta`);
        assert.ok(GUIDES[r].answers[i] < q.o.length, `${file}/${r}#${i}: la respuesta correcta no está entre las opciones`);
      });
    }
  });
}
