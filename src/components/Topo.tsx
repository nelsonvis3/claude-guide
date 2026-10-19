// Curvas de nivel de fondo: anillos concéntricos deformados, generados de forma determinística.
function ring(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const k = 1 + 0.16 * Math.sin(3 * a + seed) + 0.08 * Math.sin(5 * a + seed * 2);
    pts.push(`${(cx + Math.cos(a) * r * k).toFixed(1)},${(cy + Math.sin(a) * r * k * 0.8).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const PATHS = [
  ...Array.from({ length: 9 }, (_, i) => ring(250, 260, 40 + i * 42, 0.6 + i * 0.12)),
  ...Array.from({ length: 7 }, (_, i) => ring(1180, 120, 30 + i * 46, 2.1 + i * 0.1)),
];

export default function Topo() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice">
      {PATHS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--contour)" strokeWidth={i % 4 === 0 ? 2.5 : 1.5} />
      ))}
    </svg>
  );
}
