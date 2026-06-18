"use client";

import { useEffect, useState } from "react";

const MOBILE = "(max-width: 767px)";

// The pinned hero opens the curtain over the first ~62% of its scroll range
// (+=190% desktop / +=140% mobile). Landing in the open-hold zone shows the
// curtain fully parted with the screen + credits revealed.
function heroOpenTarget() {
  const vh = window.innerHeight;
  return vh * (window.matchMedia(MOBILE).matches ? 1.05 : 1.5);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Floating "Return to top" cue. Hidden in the hero (the logo opening carries its
 * own "Scroll to enter" prompt, so we don't duplicate it here); once the visitor
 * has scrolled past the hero - or jumped via the nav - it appears and scrolls
 * back to the hero with the curtain open.
 */
export function ScrollControl() {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const threshold = vh * (window.matchMedia(MOBILE).matches ? 0.9 : 1.2);
      setPast(window.scrollY > threshold);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = () =>
    window.scrollTo({
      top: heroOpenTarget(),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });

  return (
    // Always mounted (toggling mount/unmount next to the GSAP-pinned hero
    // corrupts React's DOM bookkeeping). In the hero it's hidden - the logo
    // opening's own "Scroll to enter" cue stands in, so there's no duplicate
    // prompt; past the hero it fades in as "Return to top".
    <button
      type="button"
      onClick={go}
      aria-label="Return to the top"
      aria-hidden={!past}
      tabIndex={past ? 0 : -1}
      className={`fixed bottom-6 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-rust/35 bg-ink/70 py-2.5 pl-5 pr-4 backdrop-blur-sm transition-all duration-300 hover:border-rust hover:bg-ink/90 ${
        past ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-rust">
        Return to top
      </span>
      <Chevron dir="up" />
    </button>
  );
}

function Chevron({ dir }: { dir: "up" | "down" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`text-rust ${dir === "down" ? "cue-bob-down" : "cue-bob-up"}`}
    >
      {dir === "down" ? <path d="M6 9l6 6 6-6" /> : <path d="M6 15l6-6 6 6" />}
    </svg>
  );
}
