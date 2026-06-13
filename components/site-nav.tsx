"use client";

import { useState } from "react";
import { NAV_ITEMS } from "@/lib/festival";
import { ThemeToggle } from "./theme-toggle";

function hrefFor(item: string) {
  return item === "Watch" ? "#top" : `#${item.toLowerCase()}`;
}

// Persistent header — fixed, rides the whole page. Desktop shows the inline
// anchor nav; below `lg` it collapses to a hamburger that opens a dropdown so
// the section nav still works on mobile.
export function SiteNav({ active = "Watch" }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed left-5 right-5 top-2 z-[60] flex items-center justify-between md:left-[100px] md:right-[100px]">
      <a href="/" aria-label="Scope Screenings — home" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/popcorn-logo.png"
          alt="Scope Screenings"
          className="h-[56px] w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:h-[88px]"
        />
      </a>

      <div className="flex items-center gap-3 md:gap-9">
        {/* Desktop inline nav */}
        <div className="hidden items-center gap-9 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={hrefFor(item)}
              className={`font-mono text-[12px] uppercase tracking-[0.14em] transition-colors hover:text-rust ${
                item === active ? "text-rust" : "text-cream"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        <ThemeToggle />

        <a
          href="#tickets"
          className="group flex items-center gap-2 border border-rust px-3 py-2 transition-colors hover:bg-rust md:px-4 md:py-2.5"
        >
          <span
            className="size-[6px] rounded-full bg-rust"
            style={{ boxShadow: "0 0 8px var(--color-rust)" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-rust group-hover:text-stage md:text-[11px]">
            Get Tickets
          </span>
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex size-[38px] items-center justify-center border border-cream/30 bg-ink/70 text-cream backdrop-blur-sm transition-colors hover:border-rust hover:text-rust lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M5 5l14 14" />
                <path d="M19 5L5 19" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] flex w-52 flex-col overflow-hidden rounded-md border border-cream/15 bg-ink/95 backdrop-blur-md lg:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={hrefFor(item)}
              onClick={() => setOpen(false)}
              className={`border-b border-cream/10 px-5 py-3.5 font-mono text-[13px] uppercase tracking-[0.14em] transition-colors last:border-b-0 hover:bg-curtain/10 hover:text-rust ${
                item === active ? "text-rust" : "text-cream"
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
