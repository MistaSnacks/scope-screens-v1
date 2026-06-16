"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** A soft rust glow that trails the cursor. Pointer devices only. */
export function CursorField() {
  const x = useSpring(useMotionValue(-100), { stiffness: 220, damping: 30 });
  const y = useSpring(useMotionValue(-100), { stiffness: 220, damping: 30 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[40] hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
      style={{
        left: x, top: y,
        background: "radial-gradient(circle, color-mix(in srgb, var(--color-rust) 18%, transparent) 0%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
