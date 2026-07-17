"use client";

import dynamic from "next/dynamic";
import Sections from "@/components/Sections";

const GLOWS = [
  "radial-gradient(60% 60% at 50% 55%, rgba(255,77,28,0.22) 0%, rgba(20,13,9,0) 70%)",
  "radial-gradient(55% 60% at 72% 50%, rgba(92,138,58,0.20) 0%, rgba(20,13,9,0) 70%)",
  "radial-gradient(55% 60% at 28% 50%, rgba(217,43,4,0.26) 0%, rgba(20,13,9,0) 70%)",
  "radial-gradient(60% 60% at 50% 50%, rgba(242,163,60,0.22) 0%, rgba(20,13,9,0) 70%)",
];

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-10 grid place-items-center bg-char">
      <span className="font-display text-sm tracking-[0.4em] text-ember">
        POURING…
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main id="scroll-wrap" className="relative w-screen">
      {/* section color glows — sit under the 3D layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {GLOWS.map((bg, i) => (
          <div
            key={i}
            data-glow={i}
            className="absolute inset-0 opacity-0"
            style={{ background: bg }}
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
