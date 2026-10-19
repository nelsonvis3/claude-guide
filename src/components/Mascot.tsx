"use client";
import { motion, useReducedMotion } from "motion/react";

export type Mood = "wave" | "talk" | "think" | "happy" | "wow";

// Tilde: la gatita de Nelson, en dos capas (public/tilde, generadas con scripts/cut.py y scripts/split.py).
// Solo se mueve la cabeza, como si escuchara música. El disco usa el violeta original de la ilustración.
const BACKDROP = "#966c9d";
const W = 208;
const H = 242;

export default function Mascot({ mood, size = 220 }: { mood: Mood; size?: number }) {
  const reduce = useReducedMotion();
  const thinking = mood === "think";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={(size * H) / W} aria-hidden="true" className="overflow-visible">
      <circle cx="104" cy="124" r="126" fill={BACKDROP} />
      <ellipse cx="106" cy="235" rx="84" ry="11" fill="#7a5683" />
      <image href="/tilde/body.png" width={W} height={H} />
      <motion.image
        href="/tilde/head.png"
        width={W}
        height={H}
        style={{ transformBox: "view-box", originX: "100px", originY: "160px" }}
        animate={reduce ? undefined : { rotate: thinking ? [-4, -6, -4] : [-5, 4, -5] }}
        transition={{ duration: thinking ? 2.4 : 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
