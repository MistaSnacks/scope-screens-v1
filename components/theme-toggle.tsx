"use client";

import { useTheme } from "./theme-provider";

/**
 * Movie Mode ⇆ House Lights switch — same bordered pill as the "Get Tickets"
 * box, but its status circle shows whether Movie Mode is ON: a solid, glowing
 * gold dot when on (dark mode), a hollow ring when off (House Lights).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const movie = theme === "movie"; // Movie Mode on
  const label = movie ? "Movie Mode" : "House Lights";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={movie}
      aria-label={`Movie Mode ${movie ? "on" : "off"} — switch to ${movie ? "House Lights (light mode)" : "Movie Mode (dark mode)"}`}
      title={label}
      className="group flex items-center gap-2 border border-rust px-3 py-2 transition-colors hover:bg-rust md:px-4 md:py-2.5"
    >
      {movie ? (
        // ON — solid glowing dot
        <span
          className="size-[0.375rem] shrink-0 rounded-full bg-rust group-hover:bg-stage"
          style={{ boxShadow: "0 0 8px var(--color-rust)" }}
        />
      ) : (
        // OFF — hollow ring
        <span className="size-[0.4375rem] shrink-0 rounded-full border border-rust bg-transparent group-hover:border-stage" />
      )}
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-rust group-hover:text-stage md:text-[0.6875rem]">
        {label}
      </span>
    </button>
  );
}
