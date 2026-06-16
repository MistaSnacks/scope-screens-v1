"use client";

import { motion } from "motion/react";
import { DURATION, EASE, prefersReducedMotion } from "@/lib/motion";

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3 } as const;
type Tag = keyof typeof TAGS;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const word = {
  hidden: { y: "120%" },
  visible: { y: "0%", transition: { duration: DURATION.slow, ease: EASE } },
};

/**
 * Title-card headline: each word rises out of a clipping mask, word-by-word.
 * Pass line breaks as "\n". Falls back to static text under reduced motion.
 */
export function KineticText({
  text,
  as = "h2",
  className,
}: {
  text: string;
  as?: Tag;
  className?: string;
}) {
  const lines = text.split("\n");

  if (prefersReducedMotion()) {
    const Plain = as;
    return (
      <Plain className={className}>
        {lines.map((l, i) => (
          <span key={i} style={{ display: "block" }}>
            {l}
          </span>
        ))}
      </Plain>
    );
  }

  const M = TAGS[as];
  return (
    <M
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} style={{ display: "block" }}>
            {words.map((w, wi) => (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  verticalAlign: "top",
                  // Pad the clip box past the glyphs so tight display leading
                  // never shears caps/baselines; negative margin keeps layout.
                  padding: "0.12em 0",
                  margin: "-0.12em 0",
                }}
              >
                <motion.span
                  variants={word}
                  style={{ display: "inline-block", willChange: "transform" }}
                >
                  {w}
                </motion.span>
                {wi < words.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        );
      })}
    </M>
  );
}
