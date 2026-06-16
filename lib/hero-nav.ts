// The hero's nav, rendered as film credits beneath the silver screen. Trimmed to
// the three destinations the hero pushes — Buy Tickets and Submit a Film are the
// two primary actions; Become a Funder is a quiet secondary line. Everything else
// the festival offers lives in the persistent SiteNav header and the footer.
export interface HeroCredit {
  /** Small eyebrow above the label, e.g. "General · VIP · Season Pass". */
  role: string;
  /** The destination's display label, e.g. "Buy Tickets". */
  label: string;
  /** Route or in-page anchor. */
  href: string;
}

export const PRIMARY_CREDITS: HeroCredit[] = [
  { role: "General · VIP · Season Pass", label: "Buy Tickets", href: "/#tickets" },
  { role: "Open Call · FilmFreeway", label: "Submit a Film", href: "/submit" },
];

export const SECONDARY_CREDITS: HeroCredit[] = [
  { role: "Sponsor · Donate · Shunpike", label: "Become a Funder", href: "/support" },
];
