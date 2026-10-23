"use client";
import { motion, useReducedMotion } from "motion/react";
import type { Role } from "@/lib/content";
import { useCatDir } from "@/lib/cat";

export type Mood = "wave" | "talk" | "think" | "happy" | "wow" | "sit" | "play";

// Tilde: la gatita de Nelson, en dos capas por color y traje (public/tilde, generadas con scripts/tilde.py).
// La cabeza se mueve al ritmo; con `bounce` (un número que cambia) da un salto; con `role` lleva un accesorio.
const BACKDROP = "#966c9d";
const W = 208;
const H = 242;
// Movimiento lento: respira (el cuerpo se estira desde el piso y la cabeza acompaña) y ladea la cabeza con otro ritmo.
const BREATH = { duration: 3.6, repeat: Infinity, ease: "easeInOut" } as const;
// "sit": sentada de frente, casi sin ladear y con la panza que se infla al respirar. "play": sigue con la cabeza al juguete.
export const PLAY_PERIOD = 2.4;
const HEAD: Record<Mood, { rotate: number[]; duration: number }> = {
  wave: { rotate: [-3, 3, -3], duration: 4.2 },
  talk: { rotate: [-3, 3, -3], duration: 4.2 },
  think: { rotate: [-2, -4, -2], duration: 5 },
  happy: { rotate: [-5, 5, -5], duration: 2 },
  wow: { rotate: [-5, 5, -5], duration: 2 },
  sit: { rotate: [-1, 1, -1], duration: 6 },
  play: { rotate: [-8, 8, -8], duration: PLAY_PERIOD },
};

export const ROLE_PROP: Record<Role, string> = {
  frontend: "💻", backend: "🗄️", fullstack: "🧩", mobile: "📱", devops: "☁️", data: "📊",
  designer: "🎨", video: "🎬", marketing: "📣", pm: "🗂️", qa: "🧪", student: "🎓",
};

export default function Mascot({ mood, size = 220, role, bounce = 0, backdrop = true }: {
  mood: Mood; size?: number; role?: Role; bounce?: number; backdrop?: boolean;
}) {
  const reduce = useReducedMotion();
  const dir = useCatDir();
  const head = HEAD[mood];
  const sit = mood === "sit";
  return (
    <motion.div
      key={bounce}
      className="relative inline-block"
      style={{ width: size }}
      initial={false}
      animate={reduce || !bounce ? undefined : { y: [0, -size * 0.12, 0, -size * 0.05, 0] }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={size} height={(size * H) / W} aria-hidden="true" className="overflow-visible">
        {backdrop && <circle cx="104" cy="124" r="126" fill={BACKDROP} />}
        <ellipse cx="106" cy="235" rx="84" ry="11" fill="#7a5683" opacity={backdrop ? 1 : 0.35} />
        <motion.image
          href={`${dir}/body.webp`}
          width={W}
          height={H}
          style={{ transformBox: "view-box", originX: "104px", originY: "240px" }}
          animate={reduce ? undefined : sit ? { scaleY: [1, 1.035, 1], scaleX: [1, 1.03, 1] } : { scaleY: [1, 1.02, 1] }}
          transition={sit ? { ...BREATH, duration: 4.4 } : BREATH}
        />
        <motion.image
          href={`${dir}/head.webp`}
          width={W}
          height={H}
          style={{ transformBox: "view-box", originX: "100px", originY: "160px" }}
          animate={reduce ? undefined : { rotate: head.rotate, y: sit ? [0, -2.6, 0] : [0, -1.6, 0] }}
          transition={{
            rotate: { duration: head.duration, repeat: Infinity, ease: "easeInOut" },
            y: sit ? { ...BREATH, duration: 4.4 } : BREATH,
          }}
        />
      </svg>
      {role && (
        <motion.span
          aria-hidden="true"
          className="absolute grid place-items-center rounded-full bg-surface shadow-soft"
          style={{ right: -size * 0.04, bottom: size * 0.18, width: size * 0.26, height: size * 0.26, fontSize: size * 0.14 }}
          animate={reduce ? undefined : { rotate: [-6, 6, -6] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {ROLE_PROP[role]}
        </motion.span>
      )}
    </motion.div>
  );
}

// Tilde asomando la cabeza desde abajo de un borde, cuando la sección entra en pantalla. El viewBox arranca en y=25: arriba solo hay aire.
// El disparador va en el contenedor: la imagen arranca recortada y nunca contaría como visible.
export function Peek({ size = 96, className = "" }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const dir = useCatDir();
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className}`}
      style={{ width: size, height: size * 0.62 }}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.svg
        viewBox="0 25 208 160"
        width={size}
        height={(size * 160) / 208}
        variants={{ hidden: { y: size * 0.7 }, show: { y: 0 } }}
        transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}
      >
        <motion.image
          href={`${dir}/head.webp`}
          width="208"
          height="242"
          style={{ transformBox: "view-box", originX: "100px", originY: "160px" }}
          animate={reduce ? undefined : { rotate: [-4, 4, -4] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}
