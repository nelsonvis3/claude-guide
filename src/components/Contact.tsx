"use client";
import { useActionState } from "react";
import { sendContact } from "@/app/actions";
import { CONTACT_TYPES, type ContactState } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import Mascot from "./Mascot";

export default function Contact({ initial }: { initial: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: "idle" });
  const field = "w-full rounded-2xl border border-line bg-surface px-4 py-3 outline-none focus:border-cobalt";
  if (state.status === "sent") {
    return (
      <main id="main" className="mx-auto grid max-w-2xl justify-items-start gap-4 px-4 py-16">
        <Mascot mood="happy" size={150} />
        <h1 className="display text-[2.2rem]">{t("contact.sent")}</h1>
        <p className="text-ink-2">{t("contact.sentSub")}</p>
      </main>
    );
  }
  return (
    <main id="main" className="mx-auto grid max-w-2xl gap-6 px-4 py-12 pb-24">
      <header className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <Mascot mood="talk" size={120} />
        <div>
          <h1 className="display text-[2.2rem] sm:text-[2.6rem]">{t("contact.title")}</h1>
          <p className="mt-1 text-ink-2">{t("contact.lead")}</p>
        </div>
      </header>
      <form action={action} className="grid gap-4 rounded-3xl bg-surface p-5 shadow-soft sm:p-7">
        <label className="grid gap-1 font-bold">
          {t("contact.type")}
          <select name="type" defaultValue={CONTACT_TYPES.includes(initial as never) ? initial : "query"} className={`${field} font-normal`}>
            {CONTACT_TYPES.map((k) => <option key={k} value={k}>{t(`contact.types.${k}`)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 font-bold">
          {t("contact.name")}
          <input name="name" required maxLength={80} autoComplete="name" className={`${field} font-normal`} />
        </label>
        <label className="grid gap-1 font-bold">
          {t("contact.email")}
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={`${field} font-normal`} />
        </label>
        <label className="grid gap-1 font-bold">
          {t("contact.message")}
          <textarea name="message" required minLength={10} maxLength={3000} rows={6} className={`${field} font-normal`} />
        </label>
        {/* Campo trampa para bots: invisible para personas y lectores de pantalla. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {state.status !== "idle" && (
          <p role="alert" className="font-bold text-spend">{t(`contact.${state.status}`)}</p>
        )}
        <button disabled={pending} className="justify-self-start rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink disabled:opacity-50">
          {pending ? t("contact.sending") : t("contact.send")}
        </button>
      </form>
    </main>
  );
}
