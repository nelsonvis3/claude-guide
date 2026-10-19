"use server";
import { cookies } from "next/headers";
import { providerIds, signIn, signOut } from "@/auth";
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

export async function setLang(lang: string) {
  if (!LANGS.includes(lang as Lang)) return;
  (await cookies()).set("lang", lang, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });
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
