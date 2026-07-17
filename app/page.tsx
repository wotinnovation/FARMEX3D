"use client";

import dynamic from "next/dynamic";
import Sections from "@/components/Sections";

// solid flat fills — one per section, no gradient
const BG_COLORS = [
  "#22c55e",  // S0 hero    — brand green
  "#f97316",  // S1 details — vivid orange
  "#22c55e",  // S2 heat    — brand green
  "#facc15",  // S3 CTA     — golden yellow
];

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-10 grid place-items-center" style={{ background: "transparent" }}>
      <span className="font-display text-sm tracking-[0.4em] text-gray-900">
        LOADING…
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main id="scroll-wrap" className="relative w-screen">
      {/* section color glows — sit under the 3D layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {BG_COLORS.map((color, i) => (
          <div
            key={i}
            data-glow={i}
            className="absolute inset-0"
            // S0 starts fully visible so yellow shows instantly — no black flash
            style={{ background: color, opacity: i === 0 ? 1 : 0 }}
          />
        ))}
      </div>
      {/* pinned 3D layer */}
      <Experience />
      {/* scrolling content layer */}
      <Sections />
    </main>
  );
}
