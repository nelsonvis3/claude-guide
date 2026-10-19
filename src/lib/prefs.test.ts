import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CATS, catDir, validAvatar } from "./prefs.ts";

test("cada color de Tilde tiene sus dos capas", () => {
  for (const c of CATS) for (const part of ["head", "body"]) assert.ok(existsSync(`public${catDir(c)}/${part}.png`), `${c}/${part}`);
});

test("foto de perfil: solo presets conocidos o imágenes chicas", () => {
  assert.ok(validAvatar("preset:lila"));
  assert.ok(!validAvatar("preset:hack"));
  assert.ok(validAvatar("data:image/webp;base64,AAAA"));
  assert.ok(!validAvatar("data:image/svg+xml;base64,AAAA"), "SVG no: puede traer scripts");
  assert.ok(!validAvatar("javascript:alert(1)"));
  assert.ok(!validAvatar(`data:image/png;base64,${"A".repeat(90_000)}`));
});
