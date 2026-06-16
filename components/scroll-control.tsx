"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/motion/smooth-scroll-provider";

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
 * Floating cue at the bottom of the viewport.
 *  - In the hero: an animated "Scroll to open" prompt (click nudges the curtain
 *    open).
 *  - Past the hero (scrolled or jumped via the nav): flips to "Return to top",
 *    which scrolls back to the hero with the curtain open.
 */
export function ScrollControl() {
  const [past, setPast] = useState(false);
  const lenis = useLenis();

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

  const go = () => {
    const top = heroOpenTarget();
    if (lenis && !prefersReducedMotion()) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={go}
      aria-label={past ? "Return to the top" : "Scroll to open the curtains"}
      className="fixed bottom-6 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-rust/35 bg-ink/70 py-2.5 pl-5 pr-4 backdrop-blur-sm transition-colors hover:border-rust hover:bg-ink/90"
    >
      {past ? (
        <>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-rust">
            Return to top
          </span>
          <Chevron dir="up" />
        </>
      ) : (
        <>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-rust">
            Scroll to open
          </span>
          <Chevron dir="down" />
        </>
      )}
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
