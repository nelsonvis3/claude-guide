"use client";
import { motion, useReducedMotion } from "motion/react";
import type { Role } from "@/lib/content";
import { useCatDir } from "@/lib/cat";

export type Mood = "wave" | "talk" | "think" | "happy" | "wow";

// Tilde: la gatita de Nelson, en dos capas (public/tilde, generadas con scripts/cut.py y scripts/split.py).
// La cabeza se mueve al ritmo; con `bounce` (un número que cambia) da un salto; con `role` lleva un accesorio.
const BACKDROP = "#966c9d";
const W = 208;
const H = 242;

export const ROLE_PROP: Record<Role, string> = {
  frontend: "💻", backend: "🗄️", fullstack: "🧩", mobile: "📱", devops: "☁️", data: "📊",
  designer: "🎨", video: "🎬", marketing: "📣", pm: "🗂️", qa: "🧪", student: "🎓",
};

export default function Mascot({ mood, size = 220, role, bounce = 0, backdrop = true }: {
  mood: Mood; size?: number; role?: Role; bounce?: number; backdrop?: boolean;
}) {
  const reduce = useReducedMotion();
  const dir = useCatDir();
  const thinking = mood === "think";
  const excited = mood === "happy" || mood === "wow";
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
        <image href={`${dir}/body.png`} width={W} height={H} />
        <motion.image
          href={`${dir}/head.png`}
          width={W}
          height={H}
          style={{ transformBox: "view-box", originX: "100px", originY: "160px" }}
          animate={reduce ? undefined : { rotate: thinking ? [-4, -6, -4] : excited ? [-7, 7, -7] : [-5, 4, -5] }}
          transition={{ duration: thinking ? 2.4 : excited ? 0.7 : 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      {role && (
        <motion.span
          aria-hidden="true"
          className="absolute grid place-items-center rounded-full bg-surface shadow-soft"
          style={{ right: -size * 0.04, bottom: size * 0.18, width: size * 0.26, height: size * 0.26, fontSize: size * 0.14 }}
          animate={reduce ? undefined : { rotate: [-8, 8, -8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {ROLE_PROP[role]}
        </motion.span>
      )}
    </motion.div>
  );
}

// Tilde asomando la cabeza desde abajo de un borde, cuando la sección entra en pantalla.
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
        viewBox="0 0 208 160"
        width={size}
        height={(size * 160) / 208}
        variants={{ hidden: { y: size * 0.7 }, show: { y: 0 } }}
        transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}
      >
        <motion.image
          href={`${dir}/head.png`}
          width="208"
          height="242"
          style={{ transformBox: "view-box", originX: "100px", originY: "160px" }}
          animate={reduce ? undefined : { rotate: [-6, 6, -6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}
