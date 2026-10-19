import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, compareStrategies, recommendPlan, type Answers } from "./estimate.ts";

const dev: Answers = {
  use: "fullstack", hoursPerDay: 6, daysPerWeek: 5, model: "sonnet", effort: "medium",
  features: [], subagentModel: "inherit", advisorModel: "opus",
};

test("un dev full-time con Sonnet cae cerca del promedio de la doc (~US$13/día)", () => {
  const { usd } = estimate(dev).perDay;
  assert.ok(usd > 8 && usd < 20, `día = ${usd}`);
});

test("semana y mes escalan con los días", () => {
  const e = estimate(dev);
  assert.equal(Math.round(e.perWeek.usd * 100), Math.round(e.perDay.usd * 5 * 100));
  assert.equal(Math.round(e.perMonth.usd), Math.round(e.perDay.usd * 5 * 4.33));
});

test("Opus cuesta el doble que Sonnet y Haiku mucho menos", () => {
  const s = estimate(dev).perDay.usd;
  assert.ok(Math.abs(estimate({ ...dev, model: "opus" }).perDay.usd / s - 2) < 0.01);
  assert.ok(estimate({ ...dev, model: "haiku" }).perDay.usd < s / 3);
});

test("fast mode solo encarece Opus", () => {
  assert.equal(estimate({ ...dev, features: ["fast"] }).perDay.usd, estimate(dev).perDay.usd);
  const o = { ...dev, model: "opus" as const };
  assert.ok(Math.abs(estimate({ ...o, features: ["fast"] }).perDay.usd / estimate(o).perDay.usd - 2) < 0.01);
});

test("Sonnet + Haiku + asesor Opus sale más barato que Opus en todo", () => {
  const [opusAll, , trio] = compareStrategies(dev);
  assert.ok(trio.usd < opusAll.usd);
});

test("hábitos de ahorro bajan el costo", () => {
  assert.ok(estimate({ ...dev, features: ["clear", "plan"] }).perDay.usd < estimate(dev).perDay.usd);
});

test("plan sugerido por tramos", () => {
  assert.equal(recommendPlan(30), "pro");
  assert.equal(recommendPlan(200), "max5");
  assert.equal(recommendPlan(800), "max20");
  assert.equal(recommendPlan(5000), "max20plus");
});

test("en tokens domina la relectura de caché; en plata no", () => {
  const e = estimate(dev);
  const t = e.breakdownTokens, u = e.breakdownUsd;
  assert.ok(t.cacheRead / (t.input + t.cacheWrite + t.cacheRead + t.output) > 0.85);
  assert.ok(u.cacheRead < u.cacheWrite + u.output);
});
