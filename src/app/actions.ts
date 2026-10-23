"use server";
import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { auth, canLogin, passwordLogin, providerIds, signIn, signOut } from "@/auth";
import type { FormState } from "@/lib/account";
import { createUser, findUser, setAvatar, setLook, setPassword } from "@/lib/db";
import { hashPassword, validEmail, validPassword, verifyPassword } from "@/lib/password";
import { PREFS, type PrefKey, validAvatar } from "@/lib/prefs";
import { LANGS, type Lang } from "@/lib/content";
import { CONTACT_TYPES, type ContactState } from "@/lib/contact";
import { mailReady, sendMail } from "@/lib/mail";

export async function login(provider: string) {
  if (!providerIds.includes(provider)) return;
  await signIn(provider, { redirectTo: "/#ruta" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

const YEAR = 60 * 60 * 24 * 365;

export async function setLang(lang: string) {
  if (!LANGS.includes(lang as Lang)) return;
  (await cookies()).set("lang", lang, { maxAge: YEAR, sameSite: "lax", path: "/" });
}

export async function setPref(key: PrefKey, value: string) {
  if (!(key in PREFS) || !(PREFS[key] as readonly string[]).includes(value)) return;
  const id = (key === "cat" || key === "suit") && canLogin ? (await auth())?.user?.id : undefined;
  if (key === "suit" && !id) return; // los trajes son solo con cuenta
  if (id) await setLook(id, key as "cat" | "suit", value);
  (await cookies()).set(key, value, { maxAge: YEAR, sameSite: "lax", path: "/" });
}

const field = (form: FormData, k: string) => String(form.get(k) ?? "").trim();

// Entra con email y contraseña. signIn redirige si sale bien; si no, lanza un AuthError.
async function enter(email: string, password: string): Promise<FormState> {
  try {
    await signIn("credentials", { email, password, redirectTo: "/#ruta" });
  } catch (e) {
    if (e instanceof AuthError) {
      const user = await findUser({ email });
      return { status: user?.locked_until && user.locked_until > new Date() ? "locked" : "wrong" };
    }
    throw e; // la redirección de Next viaja como excepción
  }
  return { status: "ok" };
}

export async function loginWithPassword(_: FormState, form: FormData): Promise<FormState> {
  if (!passwordLogin) return { status: "unavailable" };
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!validEmail(email) || !password) return { status: "invalid" };
  return enter(email, password);
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  if (!passwordLogin) return { status: "unavailable" };
  const name = field(form, "name");
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!name || name.length > 60 || !validEmail(email) || !validPassword(password)) return { status: "invalid" };
  const id = await createUser(email, name, await hashPassword(password));
  if (!id) return { status: "taken" };
  return enter(email, password);
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const uid = (await auth())?.user?.id;
  if (!uid?.startsWith("credentials:")) return { status: "unavailable" };
  const user = await findUser({ id: uid.slice("credentials:".length) });
  const next = String(form.get("next") ?? "");
  if (!user || !validPassword(next)) return { status: "invalid" };
  if (!(await verifyPassword(String(form.get("current") ?? ""), user.password_hash))) return { status: "wrong" };
  await setPassword(user.id, await hashPassword(next));
  return { status: "ok" };
}

// image: un preset ("preset:<id>"), un data URL chico o null para volver a la foto de la cuenta.
export async function saveAvatar(image: string | null): Promise<boolean> {
  const uid = (await auth())?.user?.id;
  if (!uid || !process.env.DATABASE_URL) return false;
  if (image !== null && !validAvatar(image)) return false;
  await setAvatar(uid, image);
  return true;
}

// Formulario de contacto: llega al correo de Nelson (CONTACT_TO), que nunca se muestra en la página.
// shortcut: sin límite de envíos por IP, solo el campo trampa; sumar rate limit si llega spam.
export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  if (get("website")) return { status: "sent" }; // campo trampa: lo completan los bots
  const type = get("type");
  const name = get("name");
  const email = get("email");
  const message = get("message");
  const valid =
    CONTACT_TYPES.includes(type as (typeof CONTACT_TYPES)[number]) &&
    name.length >= 1 && name.length <= 80 &&
    email.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    message.length >= 10 && message.length <= 3000;
  if (!valid) return { status: "invalid" };
  const to = process.env.CONTACT_TO;
  if (!to || !mailReady()) return { status: "unavailable" };
  const ok = await sendMail(to, `[Procode · ${type}] ${name}`, `${name} <${email}>\n\n${message}`, email).catch(() => false);
  return { status: ok ? "sent" : "error" };
}
