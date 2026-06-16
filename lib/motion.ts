// Single source of truth for motion timing so every branch/section feels coherent.

/** Site signature ease (matches globals.css cubic-bezier(0.22,1,0.36,1)). */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = { fast: 0.35, base: 0.6, slow: 0.9 } as const;

/** Soft spring for hover/tap micro-interactions. */
export const SPRING = { type: "spring", stiffness: 320, damping: 26, mass: 0.6 } as const;

/** Default rise distance for reveals (px). */
export const REVEAL_Y = 20;

export const revealVariants = {
  hidden: { opacity: 0, y: REVEAL_Y },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
} as const;

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
