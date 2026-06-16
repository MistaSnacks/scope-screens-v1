"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { SPRING, prefersReducedMotion } from "@/lib/motion";

export function Hoverable({
  children,
  className,
  lift = -4,
  magnetic = false,
  strength = 0.25,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  magnetic?: boolean;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useSpring(useMotionValue(0), SPRING);
  const my = useSpring(useMotionValue(0), SPRING);

  if (prefersReducedMotion()) return <div className={className}>{children}</div>;

  const onMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={magnetic ? { x: mx, y: my } : undefined}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileHover={{ y: lift }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
    >
      {children}
    </motion.div>
  );
}
