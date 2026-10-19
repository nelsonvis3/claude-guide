"use client";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { changePassword, logout, saveAvatar, setPref } from "@/app/actions";
import type { FormState } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import { ACCENTS, AVATAR_PRESETS, CATS, catDir, MAX_AVATAR, THEMES, type Accent, type Cat, type PrefKey, type Theme } from "@/lib/prefs";
import { useProfile } from "@/lib/useProfile";
import Avatar from "./Avatar";
import type { User } from "./Header";
import Mascot from "./Mascot";

const ACCENT_SWATCH: Record<Accent, string> = { violet: "#7449c9", blue: "#2f62d0", green: "#1d7f55", pink: "#c03a7c", orange: "#b8530f" };
const PROVIDER_NAMES: Record<string, string> = { github: "GitHub", google: "Google", discord: "Discord", gitlab: "GitLab" };
const SOON = { pets: ["🐶", "🦊", "🐼"], outfits: ["🚀", "🧙", "🏴‍☠️", "🦸"] } as const;

// Recorta al centro y achica a 160 px en webp: la foto entra cómoda en la base sin servicio de archivos aparte.
async function shrink(file: File) {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 160;
  canvas.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, 160, 160);
  return canvas.toDataURL("image/webp", 0.85);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-soft sm:p-7">
      <h2 className="display text-[1.5rem]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Settings({ user, prefs }: { user: NonNullable<User>; prefs: { theme: Theme; accent: Accent; cat: Cat } }) {
  const { t } = useI18n();
  const router = useRouter();
  const { profile, setProfile, hydrated } = useProfile(user);
  const [current, setCurrent] = useState(prefs);
  const [photoError, setPhotoError] = useState(false);
  const [saving, start] = useTransition();
  const [pwState, pwAction, pwPending] = useActionState<FormState, FormData>(changePassword, { status: "idle" });

  const pick = (key: PrefKey, value: string) => {
    setCurrent((c) => ({ ...c, [key]: value }));
    // Se aplica al instante; el refresh trae la versión del servidor con la cookie nueva.
    const attr = key === "theme" ? "data-theme" : key === "accent" ? "data-accent" : null;
    if (attr && (value === "system" || value === "violet")) document.documentElement.removeAttribute(attr);
    else if (attr) document.documentElement.setAttribute(attr, value);
    start(async () => { await setPref(key, value); router.refresh(); });
  };
  const photo = (image: string | null) => start(async () => { setPhotoError(!(await saveAvatar(image))); router.refresh(); });
  const upload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await shrink(file);
      if (url.length > MAX_AVATAR) throw new Error("grande");
      photo(url);
    } catch {
      setPhotoError(true);
    }
  };

  const chip = (on: boolean) => `rounded-2xl border-2 p-3 text-left font-bold ${on ? "border-cobalt bg-[var(--glow)]" : "border-line hover:bg-surface-2"}`;
  const field = "w-full rounded-2xl border border-line bg-surface px-4 py-3 font-normal outline-none focus:border-cobalt";
  return (
    <main id="main" className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-10 pb-24">
      <header className="flex flex-wrap items-center gap-4">
        <Avatar src={user.image} size={72} />
        <div className="min-w-0">
          <h1 className="display text-[2.2rem]">{t("account.settings")}</h1>
          <p className="truncate text-ink-2">{user.name}</p>
        </div>
      </header>

      <Section title={t("account.profile")}>
        <label className="grid gap-1 font-bold">
          {t("account.displayName")}
          <input
            value={profile.name}
            maxLength={40}
            disabled={!hydrated}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className={field}
          />
          <span className="text-[0.85rem] font-normal text-ink-2">{t("account.displayNameNote")}</span>
        </label>
        <p className="mt-6 font-bold">{t("account.photo")}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {AVATAR_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => photo(`preset:${p.id}`)}
              aria-label={t("account.presetAvatar")}
              aria-pressed={user.image === `preset:${p.id}`}
              className={`rounded-full p-1 ${user.image === `preset:${p.id}` ? "ring-3 ring-cobalt" : "hover:ring-2 hover:ring-line"}`}
            >
              <Avatar src={`preset:${p.id}`} size={56} />
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full bg-cobalt px-5 py-2 font-bold text-cobalt-ink">
            {t("account.upload")}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          <button onClick={() => photo(null)} className="rounded-full bg-surface-2 px-5 py-2 font-bold">{t("account.useAccountPhoto")}</button>
          {saving && <span className="text-[0.9rem] text-ink-2">{t("account.saving")}</span>}
        </div>
        {photoError && <p role="alert" className="mt-2 font-bold text-spend">{t("account.photoError")}</p>}
      </Section>

      <Section title={t("account.appearance")}>
        <p className="font-bold">{t("account.theme")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {THEMES.map((th) => (
            <button key={th} onClick={() => pick("theme", th)} aria-pressed={current.theme === th} className={chip(current.theme === th)}>
              {t(`account.themes.${th}`)}
            </button>
          ))}
        </div>
        <p className="mt-6 font-bold">{t("account.accent")}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => pick("accent", a)}
              aria-pressed={current.accent === a}
              aria-label={t(`account.accents.${a}`)}
              title={t(`account.accents.${a}`)}
              className={`size-11 rounded-full ${current.accent === a ? "ring-3 ring-ink ring-offset-2 ring-offset-surface" : ""}`}
              style={{ background: ACCENT_SWATCH[a] }}
            />
          ))}
        </div>
      </Section>

      <Section title={t("account.tilde")}>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <Mascot mood="happy" size={110} />
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button key={c} onClick={() => pick("cat", c)} aria-pressed={current.cat === c} className={`${chip(current.cat === c)} flex items-center gap-2`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${catDir(c)}/head.png`} alt="" className="size-9 object-cover object-top" />
                {t(`account.cats.${c}`)}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={t("account.shop")}>
        <p className="text-ink-2">{t("account.shopLead")}</p>
        {(["pets", "outfits"] as const).map((k) => (
          <div key={k} className="mt-4">
            <p className="font-bold">{t(`account.${k}`)}</p>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SOON[k].map((emoji, i) => (
                <li key={emoji} className="grid justify-items-center gap-1 rounded-2xl bg-surface-2 p-3 text-center opacity-80">
                  <span aria-hidden="true" className="text-[1.8rem] grayscale-[40%]">{emoji}</span>
                  <span className="text-[0.9rem] font-bold">{t(`account.${k}Names.${i}`)}</span>
                  <span className="rounded-full bg-marker px-2 text-[0.75rem] font-bold text-marker-ink">🔒 {t("account.soon")}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title={t("account.notifications")}>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={profile.remind}
            disabled={!hydrated}
            onChange={(e) => setProfile((p) => ({ ...p, remind: e.target.checked }))}
            className="mt-1 size-4 accent-[var(--cobalt)]"
          />
          <span>{t("game.remind")}<span className="block text-[0.85rem] text-ink-2">{t("game.remindNote")}</span></span>
        </label>
      </Section>

      <Section title={t("account.security")}>
        {user.provider === "credentials" ? (
          <form action={pwAction} className="grid gap-4">
            <label className="grid gap-1 font-bold">
              {t("account.currentPassword")}
              <input name="current" type="password" required autoComplete="current-password" className={field} />
            </label>
            <label className="grid gap-1 font-bold">
              {t("account.newPassword")}
              <input name="next" type="password" required minLength={8} maxLength={200} autoComplete="new-password" className={field} />
              <span className="text-[0.85rem] font-normal text-ink-2">{t("account.passwordRule")}</span>
            </label>
            {pwState.status !== "idle" && (
              <p role="alert" className={`font-bold ${pwState.status === "ok" ? "text-save" : "text-spend"}`}>
                {pwState.status === "ok" ? t("account.passwordChanged") : pwState.status === "wrong" ? t("account.wrongCurrent") : t(`account.errors.${pwState.status}`)}
              </p>
            )}
            <button disabled={pwPending} className="justify-self-start rounded-full bg-cobalt px-6 py-2.5 font-bold text-cobalt-ink disabled:opacity-50">
              {t("account.changePassword")}
            </button>
          </form>
        ) : (
          <p className="text-ink-2">{t("account.passwordElsewhere", { provider: PROVIDER_NAMES[user.provider] ?? user.provider })}</p>
        )}
        <form action={logout} className="mt-6 border-t border-line pt-5">
          <button className="rounded-full bg-surface-2 px-5 py-2 font-bold">{t("nav.logout")}</button>
        </form>
      </Section>
    </main>
  );
}
