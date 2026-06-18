import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { KineticText } from "@/components/motion/kinetic-text";

/** Shared shell for static legal pages (Privacy, Terms) — matches the
 *  About/Support hero + prose rhythm so it reads as part of the site. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-bg">
      <section className="px-5 pt-[7.5rem] md:shell-x md:pt-[9.375rem]">
        <Reveal className="max-w-[68ch]">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-curtain" />
            <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-label">
              {eyebrow}
            </span>
          </div>
          <KineticText
            as="h1"
            className="pulp mt-5 font-display text-[3.25rem] uppercase leading-[0.9] md:text-[5rem]"
            text={title}
          />
          <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
            Last updated {updated}
          </p>
          <p className="mt-6 font-credits text-[1.125rem] leading-relaxed text-fg/80 md:text-[1.1875rem]">
            {intro}
          </p>
        </Reveal>
      </section>

      <section className="px-5 pb-24 pt-14 md:shell-x">
        <div className="flex max-w-[68ch] flex-col gap-10">{children}</div>
      </section>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className="flex flex-col gap-3">
      <h2 className="font-display text-[1.5rem] uppercase leading-[1.05] text-fg md:text-[1.875rem]">
        {heading}
      </h2>
      <div className="flex flex-col gap-3 font-credits text-[1rem] leading-relaxed text-muted md:text-[1.0625rem]">
        {children}
      </div>
    </Reveal>
  );
}
