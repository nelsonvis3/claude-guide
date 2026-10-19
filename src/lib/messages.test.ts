import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

// Cada idioma tiene que tener exactamente las mismas claves que el español (el original).
const dir = new URL("../messages/", import.meta.url);
const load = (f: string) => JSON.parse(readFileSync(new URL(f, dir), "utf8"));
const keys = (o: unknown, p = ""): string[] =>
  typeof o === "object" && o !== null && !Array.isArray(o)
    ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k))
    : [Array.isArray(o) ? `${p}[${o.length}]` : p];

const base = keys(load("es.json")).sort();
for (const file of readdirSync(dir).filter((f) => f !== "es.json")) {
  test(`${file} tiene las mismas claves que es.json`, () => {
    assert.deepEqual(keys(load(file)).sort(), base);
  });
}

test("cada comando, skill, paso y plugin de content.ts tiene texto en es.json", async () => {
  const c = await import("./content.ts");
  const g = await import("./game.ts");
  const es = load("es.json");
  const missing = [
    ...[...c.COMMANDS, ...c.SKILLS].filter((id) => !es.commands[id]).map((id) => `commands.${id}`),
    ...c.NODES.filter((n) => !es.nodes[n.id]).map((n) => `nodes.${n.id}`),
    ...[...c.ANTHROPIC_PLUGINS, ...c.PARTNER_PLUGINS].filter((p) => !es.plugins[p]).map((p) => `plugins.${p}`),
    ...c.SAMPLE_MODS.filter((m) => !es.modGuide.samples[m.id]).map((m) => `modGuide.samples.${m.id}`),
    ...c.COMMUNITY.filter((x) => !es.community[x.id]).map((x) => `community.${x.id}`),
    ...c.ANTHROPIC_SKILLS.filter((x) => !es.askills[x.id]).map((x) => `askills.${x.id}`),
    ...c.KNOWLEDGE_WORK.filter((id) => !es.kw[id]).map((id) => `kw.${id}`),
    ...c.BUILTIN_MODS.filter((id) => !es.builtinMods[id]).map((id) => `builtinMods.${id}`),
    ...c.ROLE_IDS.filter((r) => !es.roles[r]).map((r) => `roles.${r}`),
    ...g.STICKERS.filter((x) => !es.stickerNames[x]).map((x) => `stickerNames.${x}`),
    ...g.LEVELS.filter((x) => !es.game.levels[x.id]).map((x) => `game.levels.${x.id}`),
    // cada recomendación por rol apunta a algo que existe y tiene texto
    ...[...Object.values(c.ROLES).flat(), ...c.TOKEN_SAVERS]
      .map((k) => c.resolve(k))
      .filter((r) => !es[r.ns]?.[r.id])
      .map((r) => r.key),
  ];
  assert.deepEqual(missing, []);
});
