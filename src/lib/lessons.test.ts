import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { NODES } from "./content.ts";
import { LESSONS, solves } from "./lessons.ts";

const dir = new URL("../lessons/", import.meta.url);
const load = (f: string) => JSON.parse(readFileSync(new URL(f, dir), "utf8"));

test("cada paso de la ruta tiene lección, terminal y 2 o 3 respuestas", () => {
  for (const n of NODES) {
    const l = LESSONS[n.id];
    assert.ok(l, `falta LESSONS.${n.id}`);
    assert.ok(l.terminal.accept || l.terminal.match || l.terminal.key, `${n.id}: la terminal no acepta nada`);
    assert.ok(l.answers.length >= 2 && l.answers.length <= 3, `${n.id}: ${l.answers.length} respuestas`);
  }
});

test("la terminal acepta lo correcto y rechaza lo demás", () => {
  assert.ok(solves(LESSONS.init.terminal, { text: " /INIT " }));
  assert.ok(!solves(LESSONS.init.terminal, { text: "/clear" }));
  assert.ok(solves(LESSONS.modes.terminal, { key: "shift+tab" }));
  assert.ok(solves(LESSONS.modes.terminal, { text: "Shift+Tab" }));
  assert.ok(!solves(LESSONS.init.terminal, { key: "shift+tab" }));
  assert.ok(solves(LESSONS.loop.terminal, { text: "/loop 5m check the deploy" }));
  assert.ok(!solves(LESSONS.loop.terminal, { text: "/loop" }));
  assert.ok(solves(LESSONS.prompting.terminal, { text: "revisá src/auth/session.ts y arreglá el refresh" }));
  assert.ok(!solves(LESSONS.prompting.terminal, { text: "arreglá el bug" }));
  assert.ok(!solves(LESSONS.init.terminal, { text: "" }));
});

// Cada idioma: misma lista de lecciones, y en cada pregunta la respuesta correcta existe entre las opciones.
for (const file of readdirSync(dir)) {
  test(`lecciones ${file}: completas y coherentes con las respuestas`, () => {
    const lessons = load(file);
    for (const n of NODES) {
      const l = lessons[n.id];
      assert.ok(l, `${file}: falta ${n.id}`);
      assert.ok(l.body.length >= 2 && l.points.length >= 2 && l.task && l.hint, `${file}/${n.id}: faltan textos`);
      assert.equal(l.quiz.length, LESSONS[n.id].answers.length, `${file}/${n.id}: cantidad de preguntas`);
      l.quiz.forEach((q: { q: string; o: string[]; why: string }, i: number) => {
        assert.ok(q.q && q.why && q.o.length >= 3, `${file}/${n.id}#${i}: pregunta incompleta`);
        assert.ok(LESSONS[n.id].answers[i] < q.o.length, `${file}/${n.id}#${i}: la respuesta correcta no está entre las opciones`);
      });
    }
  });
}
