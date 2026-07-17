"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Sections() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const sections = gsap.utils.toArray<HTMLElement>("[data-section]");

      sections.forEach((section, i) => {
        /* content panels slide in from right */
        const panels = section.querySelectorAll<HTMLElement>("[data-panel]");
        if (panels.length && !reduce && i !== 0) {
          gsap.fromTo(
            panels,
            { x: "100vw", opacity: 0 },
            {
              x: 0, opacity: 1, stagger: 0.06, ease: "none",
              scrollTrigger: { trigger: section, start: "top bottom", end: "top 12%", scrub: 1 },
            }
          );
        }

        /* ghost letter — fixed left column, z-5 (behind the canvas/bottle) */
        const word = section.querySelector<HTMLElement>("[data-bgword]");
        if (word && !reduce) {
          /* fade in as section enters */
          gsap.fromTo(word,
            { opacity: i === 0 ? 1 : 0 },
            {
              opacity: 1, ease: "none",
              scrollTrigger: { trigger: section, start: "top 80%", end: "top 10%", scrub: true },
            }
          );
          /* fade out as section leaves (all but last) */
          if (i !== sections.length - 1) {
            gsap.to(word, {
              opacity: 0, ease: "none",
              scrollTrigger: { trigger: section, start: "bottom 90%", end: "bottom 30%", scrub: true },
            });
          }
        }

        /* section background colour crossfade */
        const glow = document.querySelector<HTMLElement>(`[data-glow="${i}"]`);
        if (glow) {
          gsap.fromTo(glow,
            { opacity: i === 0 ? 1 : 0 },
            { opacity: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 80%", end: "top 10%", scrub: true } }
          );
          if (i !== sections.length - 1) {
            gsap.to(glow, {
              opacity: 0, ease: "none",
              scrollTrigger: { trigger: section, start: "bottom 90%", end: "bottom 30%", scrub: true },
            });
          }
        }
      });

      /* top progress bar */
      gsap.fromTo("[data-progress]", { scaleX: 0 }, {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: "#scroll-wrap", start: "top top", end: "bottom bottom", scrub: 0.4 },
      });

      /* hero text drifts up on scroll-out */
      if (!reduce) {
        gsap.to("[data-hero]", {
          y: "-18vh", opacity: 0, ease: "none",
          scrollTrigger: { trigger: "[data-section='0']", start: "top top", end: "bottom 40%", scrub: 1 },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  /* shared ghost-letter style — fixed left column, vertical, below the canvas */
  const ghostStyle: React.CSSProperties = {
    position:    "fixed",
    zIndex:      5,          // below canvas z-10, above bg z-0
    writingMode: "vertical-lr",
    left:        "1.25rem",
    top:         "50%",
    transform:   "translateY(-50%)",
    opacity:     0,          // GSAP controls this
  };

  return (
    <div ref={root} className="relative z-20 w-screen">
      {/* fixed chrome */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-display text-lg tracking-tight text-gray-900">
          FARMEX<span className="text-ember">.</span>
        </span>
        <span className="font-body text-[11px] uppercase tracking-[0.35em] text-gray-600">
          Row 7 · Small batch
        </span>
      </div>
      <div className="fixed inset-x-0 top-0 z-40 h-[3px] origin-left bg-ember" data-progress />

      {/* ============ SECTION 1 — HERO ============================== */}
      <section
        data-section="0"
        className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
      >
        <div
          data-bgword
          className="outline-word outline-word--ember pointer-events-none text-[5.5vw] leading-tight"
          style={ghostStyle}
        >
          GROWN&nbsp;·&nbsp;FERMENTED&nbsp;·&nbsp;BOTTLED&nbsp;·&nbsp;SMALL&nbsp;BATCH&nbsp;·&nbsp;FARM&nbsp;FIRED&nbsp;·&nbsp;ROW&nbsp;7&nbsp;·&nbsp;HAND&nbsp;PACKED
        </div>

        <div data-hero className="relative z-10 mt-[52vh] text-center md:mt-[56vh]">
          <p className="font-body text-xs uppercase tracking-[0.5em] text-amber-700">
            Grown · Fermented · Bottled
          </p>
          <h1 className="mt-3 font-display text-[13vw] leading-[0.9] text-gray-900 md:text-[8vw]">
            FARM-FIRED
            <br />
            <span className="text-chili">HOT SAUCE</span>
          </h1>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.4em] text-gray-600">
            Scroll to taste
          </p>
          <div className="mx-auto mt-3 h-10 w-px animate-pulse bg-ember" />
        </div>
      </section>

      {/* ============ SECTION 2 — DETAILS =========================== */}
      <section
        data-section="1"
        className="relative flex h-screen w-screen items-center overflow-hidden"
      >
        <div
          data-bgword
          className="outline-word pointer-events-none text-[5.5vw] leading-tight"
          style={ghostStyle}
        >
          HABANERO&nbsp;·&nbsp;EMBER&nbsp;CHILI&nbsp;·&nbsp;HEIRLOOM&nbsp;TOMATO&nbsp;·&nbsp;SMOKED&nbsp;GARLIC&nbsp;·&nbsp;CIDER&nbsp;VINEGAR&nbsp;·&nbsp;NO&nbsp;SUGAR&nbsp;·&nbsp;NO&nbsp;DYES
        </div>

        <div className="relative z-10 w-full px-6 md:w-1/2 md:pl-[7vw] md:pr-0">
          <div data-panel>
            <p className="font-body text-xs uppercase tracking-[0.5em] text-field">
              01 — The details
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] text-gray-900 md:text-6xl">
              EVERYTHING IN IT GREW <span className="text-field">40&nbsp;FT</span> FROM THE KETTLE
            </h2>
          </div>
          <ul data-panel className="mt-8 space-y-4 font-body text-sm text-gray-700 md:text-base">
            <li className="flex gap-4 border-b border-black/10 pb-3">
              <span className="text-ember">→</span> Red habanero &amp; ember chili, picked at dawn
            </li>
            <li className="flex gap-4 border-b border-black/10 pb-3">
              <span className="text-ember">→</span> Fire-roasted heirloom tomato &amp; smoked garlic
            </li>
            <li className="flex gap-4 border-b border-black/10 pb-3">
              <span className="text-ember">→</span> Raw cider vinegar from our own orchard press
            </li>
            <li className="flex gap-4">
              <span className="text-ember">→</span> Nothing else. No sugar, no thickeners, no dyes
            </li>
          </ul>
        </div>
        <div className="hidden md:block md:w-1/2" aria-hidden />
      </section>

      {/* ============ SECTION 3 — HEAT ============================== */}
      <section
        data-section="2"
        className="relative flex h-screen w-screen items-center justify-end overflow-hidden"
      >
        <div
          data-bgword
          className="outline-word outline-word--ember pointer-events-none text-[5.5vw] leading-tight"
          style={ghostStyle}
        >
          62K&nbsp;SCOVILLE&nbsp;·&nbsp;21&nbsp;DAYS&nbsp;FERMENTED&nbsp;·&nbsp;ZERO&nbsp;ADDITIVES&nbsp;·&nbsp;SLOW&nbsp;BURN&nbsp;·&nbsp;LONG&nbsp;FINISH&nbsp;·&nbsp;WARM&nbsp;→&nbsp;REGRET
        </div>

        <div className="hidden md:block md:w-1/2" aria-hidden />
        <div className="relative z-10 w-full px-6 md:w-1/2 md:pl-0 md:pr-[7vw]">
          <div data-panel>
            <p className="font-body text-xs uppercase tracking-[0.5em] text-chili">
              02 — The heat index
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] text-gray-900 md:text-6xl">
              SLOW BURN, <span className="text-chili">LONG FINISH</span>
            </h2>
          </div>

          <div data-panel className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="font-display text-3xl text-chili md:text-5xl">62K</p>
              <p className="mt-2 font-body text-[11px] uppercase tracking-[0.25em] text-gray-600">Scoville</p>
            </div>
            <div>
              <p className="font-display text-3xl text-amber-700 md:text-5xl">21</p>
              <p className="mt-2 font-body text-[11px] uppercase tracking-[0.25em] text-gray-600">Days fermented</p>
            </div>
            <div>
              <p className="font-display text-3xl text-field md:text-5xl">0</p>
              <p className="mt-2 font-body text-[11px] uppercase tracking-[0.25em] text-gray-600">Additives</p>
            </div>
          </div>

          <div data-panel className="mt-10">
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-ember via-field to-chili" />
            </div>
            <div className="mt-2 flex justify-between font-body text-[10px] uppercase tracking-[0.3em] text-gray-500">
              <span>Warm</span><span>Farmex</span><span>Regret</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 4 — CTA =============================== */}
      <section
        data-section="3"
        className="relative flex h-screen w-screen items-end justify-center overflow-hidden pb-[9vh]"
      >
        <div
          data-bgword
          className="outline-word pointer-events-none text-[5.5vw] leading-tight"
          style={ghostStyle}
        >
          BATCH&nbsp;№14&nbsp;·&nbsp;480&nbsp;BOTTLES&nbsp;·&nbsp;$14&nbsp;·&nbsp;SHIPS&nbsp;EVERY&nbsp;FRIDAY&nbsp;·&nbsp;FARM&nbsp;TO&nbsp;TABLE&nbsp;·&nbsp;HAND&nbsp;PACKED&nbsp;·&nbsp;LIMITED&nbsp;RUN
        </div>

        <div className="relative z-10 text-center">
          <p data-panel className="font-body text-xs uppercase tracking-[0.5em] text-amber-700">
            03 — Batch №14 · 480 bottles
          </p>
          <h2 data-panel className="mt-3 font-display text-4xl leading-none text-gray-900 md:text-6xl">
            TAKE ONE HOME
          </h2>
          <div data-panel className="mt-7 flex items-center justify-center gap-4">
            <button className="pointer-events-auto rounded-full bg-ember px-8 py-4 font-display text-sm tracking-wide text-char transition-transform hover:scale-105 active:scale-95">
              ADD TO CRATE — $14
            </button>
            <button className="pointer-events-auto rounded-full border border-black/25 px-8 py-4 font-body text-sm text-gray-700 transition-colors hover:border-chili hover:text-chili">
              Find a stockist
            </button>
          </div>
          <p data-panel className="mt-6 font-body text-[11px] uppercase tracking-[0.3em] text-gray-500">
            Ships from the farm every Friday
          </p>
        </div>
      </section>
    </div>
  );
}
