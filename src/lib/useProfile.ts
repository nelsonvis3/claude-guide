"use client";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@/components/Header";
import { DEFAULT_ANSWERS, parseProfile, type Profile } from "./profile";

const KEY = "ccr:profile";
const STEP_KEY = "ccr:step";
export const DONE = 8;
export const EMPTY: Profile = { name: "", experience: "new", role: "fullstack", answers: DEFAULT_ANSWERS, done: [], days: [], remind: false };

function readLocal(): { profile: Profile; step: number } | null {
  try {
    const p = parseProfile(JSON.parse(sessionStorage.getItem(KEY) ?? "null"));
    return p ? { profile: p, step: Number(sessionStorage.getItem(STEP_KEY)) || 0 } : null;
  } catch {
    return null;
  }
}

// Une lo del navegador con lo de la cuenta: nada de lo completado se pierde.
function merge(remote: Profile, local: Profile | null): Profile {
  if (!local) return remote;
  return {
    ...remote,
    done: [...new Set([...remote.done, ...local.done])],
    days: [...new Set([...remote.days, ...local.days])].sort().slice(-400),
  };
}

// Perfil compartido por la ruta y las lecciones. Sin cuenta vive en sessionStorage y se pierde al cerrar la pestaña;
// con sesión se guarda en la cuenta.
export function useProfile(user: User) {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [step, setStep] = useState(0);
  const [cloud, setCloud] = useState(false);
  // Estado (no ref): el guardado nunca corre con el perfil vacío del primer render.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const local = readLocal();
    if (local) {
      // sessionStorage solo existe en el navegador: hidratar después de montar evita el desfasaje con el SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(local.profile);
      setStep(local.step);
    }
    if (!user) {
      setHydrated(true);
      return;
    }
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const remote = res?.profile ? parseProfile(res.profile) : null;
        if (remote) {
          setProfile(merge(remote, local?.profile ?? null));
          setStep(DONE);
          setCloud(true);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(profile));
      sessionStorage.setItem(STEP_KEY, String(step));
    } catch {}
    if (!user || step !== DONE) return;
    const id = setTimeout(() => {
      fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(profile) })
        .then((r) => setCloud(r.ok))
        .catch(() => setCloud(false));
    }, 600);
    return () => clearTimeout(id);
  }, [profile, step, user, hydrated]);

  const update = useCallback((fn: (p: Profile) => Profile) => setProfile(fn), []);
  return { profile, setProfile: update, step, setStep, cloud, hydrated };
}
