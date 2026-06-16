"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Drifts children by `distance` px across their scroll-through.
 * The outer div is the (untransformed) scroll-measurement anchor; the inner
 * motion element carries the layout className AND the transform, so flex/grid
 * layouts are preserved and there's no measurement feedback loop.
 */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (prefersReducedMotion()) return <div className={className}>{children}</div>;
  return (
    <div ref={ref}>
      <motion.div className={className} style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
