"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, REVEAL_Y, staggerContainer, prefersReducedMotion } from "@/lib/motion";

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  if (prefersReducedMotion()) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: REVEAL_Y },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  if (prefersReducedMotion()) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
