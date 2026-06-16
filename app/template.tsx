"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The homepage owns the pinned GSAP curtain hero; a transformed wrapper would
  // become its containing block and break the pin. It's also the fresh-entry
  // page, so it doesn't need a route transition.
  if (pathname === "/" || prefersReducedMotion()) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.fast, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
