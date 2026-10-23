import { test } from "node:test";
import assert from "node:assert/strict";
import { NODES } from "./content.ts";
import { bestStreak, current, level, MAX_XP, passedTests, stickers, streak, xp } from "./game.ts";

const all = NODES.map((n) => n.id);
const start = NODES.filter((n) => n.phase === "start").map((n) => n.id);

test("XP por tramo y bonus al completar un tramo", () => {
  assert.equal(xp([]), 0);
  assert.equal(xp(["install"]), 10);
  assert.equal(xp(["advisor"]), 50);
  assert.equal(xp(start), start.length * 10 + 50);
  assert.equal(xp(all), MAX_XP);
});

test("ignora pasos que no existen", () => {
  assert.equal(xp(["install", "hack", "install-2"]), 10);
});

test("niveles y progreso hacia el siguiente", () => {
  assert.equal(level(0).id, "kitten");
  assert.equal(level(60).id, "curious");
  assert.equal(level(MAX_XP).id, "master");
  assert.equal(level(MAX_XP).next, null);
  assert.ok(Math.abs(level(30).progress - 0.5) < 1e-9);
});

test("racha: cuenta hasta hoy o ayer, y se corta con un hueco", () => {
  assert.equal(streak([], "2026-10-18"), 0);
  assert.equal(streak(["2026-10-16", "2026-10-17", "2026-10-18"], "2026-10-18"), 3);
  assert.equal(streak(["2026-10-16", "2026-10-17"], "2026-10-18"), 2);
  assert.equal(streak(["2026-10-14", "2026-10-17", "2026-10-18"], "2026-10-18"), 2);
  assert.equal(streak(["2026-10-15"], "2026-10-18"), 0);
  assert.equal(streak(["2026-09-30", "2026-10-01"], "2026-10-01"), 2);
});

test("mejor racha histórica", () => {
  assert.equal(bestStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-10"]), 3);
  assert.equal(bestStreak([]), 0);
});

test("stickers", () => {
  assert.deepEqual(stickers({ done: [], days: [], roleChosen: false }), []);
  assert.deepEqual(stickers({ done: ["install"], days: [], roleChosen: true }), ["first-step", "role-pick"]);
  const s = stickers({ done: all, days: ["2026-10-01", "2026-10-02", "2026-10-03"], roleChosen: false });
  assert.ok(s.includes("all-done") && s.includes("phase-pro") && s.includes("streak-3") && !s.includes("streak-7"));
});

test("el paso en curso es el primero sin hacer, aunque se hagan en cualquier orden", () => {
  assert.equal(current([]), 0);
  assert.equal(current(["init", "prompting"]), 0, "saltear pasos no mueve el paso en curso");
  assert.equal(current(["install"]), 1);
  assert.equal(current(all), NODES.length, "con los 48 se habilita el examen");
});

test("pruebas aprobadas: lecciones y guías, sin el examen ni ids desconocidos", () => {
  assert.equal(passedTests(["install", "init", "stack:qa", "exam", "basura"]), 3);
  assert.equal(passedTests([]), 0);
});
