"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, REVEAL_Y, prefersReducedMotion } from "@/lib/motion";

const TAGS = {
  div: motion.div,
  section: motion.section,
  aside: motion.aside,
  header: motion.header,
  article: motion.article,
} as const;
type Tag = keyof typeof TAGS;

export function Reveal({
  children,
  delay = 0,
  y = REVEAL_Y,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: Tag;
}) {
  if (prefersReducedMotion()) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const M = TAGS[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}
