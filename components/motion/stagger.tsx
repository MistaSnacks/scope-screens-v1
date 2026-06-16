"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, REVEAL_Y, staggerContainer, prefersReducedMotion } from "@/lib/motion";

const TAGS = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  header: motion.header,
  section: motion.section,
} as const;
type Tag = keyof typeof TAGS;

export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
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
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </M>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: REVEAL_Y },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  if (prefersReducedMotion()) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const M = TAGS[as];
  return (
    <M className={className} variants={itemVariants}>
      {children}
    </M>
  );
}
