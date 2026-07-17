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

      {/* ============ SECTION 4 — SPLIT SHOWCASE ==================== */}
      <section
        data-section="3"
        className="relative flex h-screen w-screen items-stretch overflow-hidden"
        style={{ background: "transparent" }}
      >
        {/* ghost bgword */}
        <div
          data-bgword
          className="outline-word outline-word--ember pointer-events-none text-[5.5vw] leading-tight"
          style={ghostStyle}
        >
          TWO&nbsp;BOTTLES&nbsp;·&nbsp;ONE&nbsp;FARM&nbsp;·&nbsp;SPLIT&nbsp;BATCH&nbsp;·&nbsp;DOUBLE&nbsp;BURN&nbsp;·&nbsp;FIRE&nbsp;LEFT&nbsp;·&nbsp;FIRE&nbsp;RIGHT&nbsp;·&nbsp;BOTH&nbsp;SIDES
        </div>

        {/* ── red backdrop ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "#dc2626" }}
        />

        {/* scanline texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
            zIndex: 1,
          }}
        />

        {/* ── LEFT CARD — ORIGINAL ── */}
        <div
          data-panel
          className="relative z-10 flex flex-1 flex-col items-start justify-end pb-[12vh] pl-[7vw]"
        >
          <span
            className="font-body text-[10px] uppercase tracking-[0.55em]"
            style={{ color: "rgba(134,239,172,0.6)" }}
          >
            Bottle A
          </span>
          <h3
            className="mt-2 font-display text-4xl md:text-6xl"
            style={{
              color: "#e2fde9",
              textShadow: "0 0 40px rgba(34,197,94,0.45)",
              letterSpacing: "-0.01em",
            }}
          >
            ORIGINAL
          </h3>
          <p
            className="mt-3 max-w-[220px] font-body text-sm leading-relaxed"
            style={{ color: "rgba(187,247,208,0.55)" }}
          >
            The one that started it all. Slow-fermented. Fire-kissed. Zero regrets.
          </p>

          {/* stat pills */}
          <div className="mt-7 flex flex-col gap-2">
            {[
              { label: "Scoville", value: "62 K" },
              { label: "Ferment", value: "21 d" },
              { label: "Batch", value: "#14" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-full px-4 py-1.5"
                style={{
                  background: "rgba(34,197,94,0.10)",
                  border: "1px solid rgba(34,197,94,0.22)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span
                  className="font-display text-base"
                  style={{ color: "#86efac" }}
                >
                  {value}
                </span>
                <span
                  className="font-body text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: "rgba(134,239,172,0.5)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTRE DIVIDER ── */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          {/* glowing vertical line */}
          <div
            style={{
              width: "1px",
              height: "100%",
              position: "absolute",
              top: 0,
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
              boxShadow: "0 0 18px 3px rgba(255,255,255,0.08)",
            }}
          />

          {/* centre badge */}
          <div
            data-panel
            className="relative flex flex-col items-center gap-3 px-2"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full font-display text-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#ffffff",
                boxShadow:
                  "0 0 0 6px rgba(255,255,255,0.04), 0 0 30px rgba(255,255,255,0.08)",
              }}
            >
              VS
            </div>
            {/* bundle pill */}
            <div
              className="rounded-full px-4 py-2 text-center"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                className="font-display text-2xl"
                style={{ color: "#fde68a" }}
              >
                –20%
              </p>
              <p
                className="font-body text-[9px] uppercase tracking-[0.35em]"
                style={{ color: "rgba(253,230,138,0.55)" }}
              >
                Bundle
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT CARD — SCORCHED ── */}
        <div
          data-panel
          className="relative z-10 flex flex-1 flex-col items-end justify-end pb-[12vh] pr-[7vw] text-right"
        >
          <span
            className="font-body text-[10px] uppercase tracking-[0.55em]"
            style={{ color: "rgba(252,165,165,0.6)" }}
          >
            Bottle B
          </span>
          <h3
            className="mt-2 font-display text-4xl md:text-6xl"
            style={{
              color: "#fff1f2",
              textShadow: "0 0 40px rgba(220,38,38,0.5)",
              letterSpacing: "-0.01em",
            }}
          >
            SCORCHED
          </h3>
          <p
            className="mt-3 max-w-[220px] font-body text-sm leading-relaxed"
            style={{ color: "rgba(254,202,202,0.55)" }}
          >
            Extra-roasted habanero. No mercy. No filter. Built for the drawer you never open.
          </p>

          {/* stat pills */}
          <div className="mt-7 flex flex-col items-end gap-2">
            {[
              { label: "Scoville", value: "98 K" },
              { label: "Roast", value: "2× " },
              { label: "Batch", value: "#14" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-full px-4 py-1.5"
                style={{
                  background: "rgba(220,38,38,0.10)",
                  border: "1px solid rgba(220,38,38,0.22)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span
                  className="font-body text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: "rgba(252,165,165,0.5)" }}
                >
                  {label}
                </span>
                <span
                  className="font-display text-base"
                  style={{ color: "#fca5a5" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP HEADLINE (centred, above the bottles) ── */}
        <div
          data-panel
          className="pointer-events-none absolute inset-x-0 top-[10vh] z-20 flex flex-col items-center"
        >
          <p
            className="font-body text-[10px] uppercase tracking-[0.55em]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            03 — The Pair
          </p>
          <h2
            className="mt-3 font-display text-3xl md:text-5xl"
            style={{
              color: "#ffffff",
              textShadow:
                "0 0 60px rgba(255,255,255,0.15)",
              letterSpacing: "-0.02em",
            }}
          >
            TWO BOTTLES,&nbsp;
            <span style={{ color: "#fde68a", textShadow: "0 0 40px rgba(253,230,138,0.4)" }}>
              ONE FIRE
            </span>
          </h2>
        </div>

        {/* ── BOTTOM CTA row ── */}
        <div
          data-panel
          className="pointer-events-none absolute inset-x-0 bottom-[7vh] z-20 flex items-center justify-center gap-6"
        >
          <button
            className="pointer-events-auto rounded-full font-display text-sm tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#020c04",
              padding: "14px 32px",
              boxShadow: "0 0 24px rgba(34,197,94,0.35)",
            }}
          >
            GRAB THE PAIR — $24
          </button>
          <button
            className="pointer-events-auto rounded-full font-body text-sm transition-colors"
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.6)",
              padding: "14px 32px",
              backdropFilter: "blur(8px)",
            }}
          >
            Compare singles
          </button>
        </div>
      </section>

      {/* ============ SECTION 5 — CTA =============================== */}
      <section
        data-section="4"
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
            04 — Batch №14 · 480 bottles
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
