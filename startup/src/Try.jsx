import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

// NOTE: Plain React JavaScript (no TypeScript)
// Tailwind CSS classes are used for layout & typography.
// Libraries used: @react-three/fiber, @react-three/drei, framer-motion

const PALETTES = [
  {
    key: "luxury",
    name: "Luxury · Black + Gold + White",
    colors: { bg: "#0A0A0A", text: "#FFFFFF", accent: "#FFD700", muted: "#B3B3B3" },
  },
  {
    key: "classic",
    name: "Classic · Black + White + Gray",
    colors: { bg: "#000000", text: "#FFFFFF", accent: "#E5E5E5", muted: "#8A8A8A" },
  },
  {
    key: "bold",
    name: "Bold · Black + Orange + Light Gray",
    colors: { bg: "#0B0B0B", text: "#F5F5F5", accent: "#FF6A00", muted: "#D1D5DB" },
  },
  {
    key: "mono",
    name: "Soft Monochrome · #121212/#444/#E0E0E0",
    colors: { bg: "#121212", text: "#E0E0E0", accent: "#444444", muted: "#BDBDBD" },
  },
  {
    key: "neutral",
    name: "Neutral · Black + Beige + White",
    colors: { bg: "#0E0E0E", text: "#FFFFFF", accent: "#D8C3A5", muted: "#A89F94" },
  },
];

function SpinningKnot({ accent }) {
  return (
    <motion.mesh
      initial={{ rotateY: 0 }}
      animate={{ rotateY: 2 * Math.PI }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    >
      <torusKnotGeometry args={[0.8, 0.25, 256, 32]} />
      <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} />
    </motion.mesh>
  );
}

function FloatingSphere({ accent }) {
  return (
    <motion.mesh
      initial={{ y: 0 }}
      animate={{ y: [0, 0.15, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      position={[1.8, 0.6, -0.5]}
      castShadow
    >
      <sphereGeometry args={[0.35, 64, 64]} />
      <meshStandardMaterial color={accent} metalness={0.2} roughness={0.1} />
    </motion.mesh>
  );
}

function GlowRim({ accent }) {
  return (
    <mesh position={[-1.8, -0.3, 0]}>
      <ringGeometry args={[0.35, 0.45, 64]} />
      <meshBasicMaterial color={accent} />
    </mesh>
  );
}

export default function App() {
  const [idx, setIdx] = useState(0);
  const palette = PALETTES[idx];
  const { bg, text, accent, muted } = palette.colors;

  const gradient = useMemo(() => ({
    background: `radial-gradient(1200px 600px at 20% 10%, ${accent}10, transparent 60%), radial-gradient(800px 400px at 80% 90%, ${muted}22, transparent 60%)`,
  }), [accent, muted]);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: bg }}>
      {/* Top Bar */}
      <header className="w-full sticky top-0 z-20 backdrop-blur-sm/30" style={{ borderBottom: `1px solid ${muted}33` }}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-2xl" style={{ backgroundColor: accent }} />
            <span className="font-semibold tracking-wide" style={{ color: text }}>Dark Palette Playground</span>
          </motion.div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {PALETTES.map((p, i) => (
              <button
                key={p.key}
                onClick={() => setIdx(i)}
                className="px-3 py-1.5 rounded-2xl text-sm transition transform active:scale-95 border"
                style={{
                  backgroundColor: i === idx ? accent : "transparent",
                  borderColor: `${muted}55`,
                  color: i === idx ? "#111111" : text,
                }}
              >
                {p.name.split(" · ")[0]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center" style={gradient}>
        <div className="mx-auto max-w-6xl w-full px-4 grid md:grid-cols-2 gap-10 items-center py-12">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.h1
                key={palette.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-4xl md:text-5xl font-extrabold leading-tight"
                style={{ color: text }}
              >
                {palette.name}
              </motion.h1>
            </AnimatePresence>

            <p className="text-base md:text-lg max-w-prose" style={{ color: muted }}>
              Toggle palettes, watch the 3D scene adapt, and feel the difference in contrast, mood, and readability. This sandbox mixes
              Three.js motion with Framer Motion transitions so you can judge what fits your brand.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIdx((i) => (i + 1) % PALETTES.length)}
                className="px-4 py-2 rounded-2xl font-medium shadow-md border"
                style={{ backgroundColor: accent, color: "#111", borderColor: `${muted}66` }}
              >
                Try Next Palette →
              </button>
              <span className="text-sm" style={{ color: muted }}>
                Accent: {accent} · Text: {text} · BG: {bg}
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[420px] w-full rounded-2xl shadow-2xl border"
            style={{ borderColor: `${muted}44`, background: `linear-gradient(180deg, ${bg}, ${bg})` }}
          >
            <Canvas camera={{ position: [2.6, 1.8, 2.6], fov: 50 }} shadows>
              <ambientLight intensity={0.5} />
              <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
              <spotLight position={[-3, 5, -2]} intensity={0.6} angle={0.6} penumbra={0.4} />

              {/* Ground */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color={bg} metalness={0} roughness={1} />
              </mesh>

              {/* Objects */}
              <SpinningKnot accent={accent} />
              <FloatingSphere accent={accent} />
              <GlowRim accent={accent} />

              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t" style={{ borderColor: `${muted}33` }}>
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm" style={{ color: muted }}>
            Tip: Evaluate contrast (WCAG) and hover/active states before shipping.
          </span>
          <div className="flex gap-2 flex-wrap">
            {Object.entries({ Primary: accent, Text: text, Muted: muted, BG: bg }).map(([k, v]) => (
              <div key={k} className="px-3 py-1 rounded-xl text-xs border" style={{ backgroundColor: v, borderColor: `${muted}55`, color: k === "BG" ? text : "#111" }}>
                {k}: {v}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
