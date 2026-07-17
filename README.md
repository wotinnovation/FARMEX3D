# FARMEX — Farm-Fired Hot Sauce

A 100vw scrollytelling product site: Next.js 14 (App Router) + TypeScript + React Three Fiber + GSAP ScrollTrigger + Tailwind.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How it works

- `components/Experience.tsx` — a **fixed, pinned full-screen Canvas**. The GLB (`public/models/farmex_bottle.glb`) is auto-centered and scaled, lit with a warm key light, an ember rim light and cool fill, over soft contact shadows. One scrubbed GSAP timeline (trigger `#scroll-wrap`) drives the bottle across all 4 sections: center → docks **right** while rotating 360° → crosses **left** with a tilt → returns center with an extra spin + scale pop.
- `components/Sections.tsx` — four `h-screen w-screen` sections. Content panels slide in **from the right edge to their slot** (scrubbed), and a giant hollow word behind each section sweeps **right → left** as you scroll. A top progress bar and per-section color glows crossfade with scroll.
- `prefers-reduced-motion` is respected (scroll animations are skipped).

## Tweak points

- Bottle travel distance: `xSlot` in `Experience.tsx`
- Section colors: `tailwind.config.ts` + `GLOWS` in `app/page.tsx`
- Scroll feel: the `scrub` values on each ScrollTrigger
