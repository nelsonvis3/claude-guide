import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, validEmail, validPassword, verifyPassword } from "./password.ts";

test("contraseñas: el hash verifica la correcta y rechaza otras", async () => {
  const h = await hashPassword("tilde-1234");
  assert.ok(h.startsWith("scrypt$"));
  assert.notEqual(h, await hashPassword("tilde-1234"), "cada hash lleva su propia sal");
  assert.ok(await verifyPassword("tilde-1234", h));
  assert.ok(!(await verifyPassword("tilde-12345", h)));
  assert.ok(!(await verifyPassword("tilde-1234", "basura")));
});

test("validación de email y contraseña", () => {
  assert.ok(validEmail("ana@example.com"));
  assert.ok(!validEmail("ana@"));
  assert.ok(!validPassword("corta"));
  assert.ok(validPassword("larga-de-verdad"));
});
