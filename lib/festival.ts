// Single source of truth for Scope Screenings content.
// Seeded from the live Wix Events site ("scope", id 5e0eaedc-6847-4c06-bb37-34cb6ff143b5).
// Ticketing runs through Wix Events — Reserve links point at the real event pages.

export const NAV_ITEMS = ["Watch", "Schedule", "Submit", "About", "Support"] as const;
export type NavItem = (typeof NAV_ITEMS)[number];

export const TICKET_BASE_URL = "https://www.lexscopefilms.com/event-details/";
export function ticketUrl(slug: string): string {
  return TICKET_BASE_URL + slug;
}

export const SUBMIT_URL = "https://filmfreeway.com/scopescreenings";

// Submissions — pulled from the live FilmFreeway listing (Season 5).
// Founded 2021; monthly series June–December, Opening Night in June,
// residency at Langston July–December. Season 5 introduces judged awards.
export const SUBMISSION_SEASON = "Season 5";
export const SUBMISSION_YEAR = 2026;

export interface SubmissionDeadline {
  name: string; // "EarlyScope"
  date: string; // "Jun 12" — short display
  iso: string; // "2026-06-12" — for sorting / "next" logic
}

// Verbatim from FilmFreeway "Dates & Deadlines":
export const SUBMISSION_DEADLINES: SubmissionDeadline[] = [
  { name: "EarlyScope", date: "Jun 12", iso: "2026-06-12" },
  { name: "Deadline 1", date: "Jul 20", iso: "2026-07-20" },
  { name: "Deadline 2", date: "Aug 31", iso: "2026-08-31" },
  { name: "LateScope", date: "Sep 28", iso: "2026-09-28" },
];

export const SUBMISSION_NOTIFICATION = "Nov 5, 2026";

/** First deadline still open (server-evaluated; safe in a server component). */
export function nextSubmissionDeadline(): SubmissionDeadline {
  const today = new Date().toISOString().slice(0, 10);
  return (
    SUBMISSION_DEADLINES.find((d) => d.iso >= today) ??
    SUBMISSION_DEADLINES[SUBMISSION_DEADLINES.length - 1]
  );
}

// FilmFreeway "Categories & Fees" — short-form, all under 20 minutes.
export const SUBMISSION_CATEGORIES = [
  "Narrative Short",
  "Documentary",
  "Animation",
  "Music Video",
  "Commercial",
  "Experimental",
] as const;

export const VENUE = {
  name: "Langston Hughes Performing Arts Institute",
  short: "Langston Hughes P.A.I.",
  address: "104 17th Ave S",
  city: "Seattle, WA",
  doors: "7:00 PM",
  program: "7:30 PM",
} as const;

export const FOUNDER = {
  name: "Lex Scope",
  legalName: "Lawrence Alexander III",
  title: "Festival Director",
  credential: "Seattle Film Commissioner",
  company: "LexScope Productions",
  since: 2012,
  quote: "We put the fun back in film fests.",
  origin:
    "A lot of my peers — shooters, editors, DPs, photographers — have been creating for 5–10 years and never had the opportunity to see their work on a big screen. I built this for access, for collaboration, and to break down the systemic barriers placed in front of Black, brown, and tan creatives.",
} as const;

export type ScreeningStatus = "open" | "soon" | "ended" | "soldout";

export interface Screening {
  /** "TUE JUL 28" — short marquee label */
  label: string;
  /** "Tuesday · July 28, 2026" — long label */
  long: string;
  month: string; // "JUL"
  day: string; // "28"
  year: number;
  title: string;
  /** Wix event slug, when individually ticketed */
  slug?: string;
  status: ScreeningStatus;
}

// Season 5 — last Tuesdays, per the live VIP Season Pass schedule.
export const SCREENINGS: Screening[] = [
  { label: "TUE JUL 28", long: "Tuesday · July 28, 2026", month: "JUL", day: "28", year: 2026, title: "Opening Night", slug: "scope-screenings-opening-night", status: "open" },
  { label: "TUE AUG 25", long: "Tuesday · August 25, 2026", month: "AUG", day: "25", year: 2026, title: "Season 05 · No. 2", status: "soon" },
  { label: "TUE SEP 29", long: "Tuesday · September 29, 2026", month: "SEP", day: "29", year: 2026, title: "Season 05 · No. 3", status: "soon" },
  { label: "TUE OCT 27", long: "Tuesday · October 27, 2026", month: "OCT", day: "27", year: 2026, title: "Season 05 · No. 4", status: "soon" },
  { label: "TUE NOV 24", long: "Tuesday · November 24, 2026", month: "NOV", day: "24", year: 2026, title: "Season 05 · No. 5", status: "soon" },
  { label: "TUE DEC 29", long: "Tuesday · December 29, 2026", month: "DEC", day: "29", year: 2026, title: "Season 05 · No. 6", status: "soon" },
  { label: "TUE JAN 26", long: "Tuesday · January 26, 2027", month: "JAN", day: "26", year: 2027, title: "Season Finale", status: "soon" },
];

export function nextScreening(): Screening {
  return SCREENINGS.find((s) => s.status === "open") ?? SCREENINGS[0];
}

export const SEASON_PASS = {
  slug: "season-pass-for-scope-screenings-season-5",
  gaPrice: "$99",
  vipPrice: "$500",
  nights: 7,
} as const;

/** Reserve target for a screening: its own page if open, else the season pass page. */
export function reserveUrl(s: Screening): string {
  return ticketUrl(s.slug ?? SEASON_PASS.slug);
}

export interface TicketTier {
  id: string;
  label: string;
  price: string;
  cadence: string; // "PER NIGHT" | "ALL SEASON"
  perks: string[];
  tone: "primary" | "secondary" | "ghost";
  href: string;
}

export const TICKET_TIERS: TicketTier[] = [
  {
    id: "ga",
    label: "GENERAL ADMISSION",
    price: "$22",
    cadence: "PER NIGHT",
    perks: ["Open seating", "Program zine", "Early-bird $18 while they last", "Doors 7:00 · program 7:30"],
    tone: "primary",
    href: ticketUrl(nextScreening().slug ?? SEASON_PASS.slug),
  },
  {
    id: "vip",
    label: "VIP",
    price: "$85",
    cadence: "PER NIGHT",
    perks: ["Best seats in the house", "2 drinks + endless popcorn", "VIP gift bag", "Meet & greet + photographer"],
    tone: "secondary",
    href: ticketUrl(nextScreening().slug ?? SEASON_PASS.slug),
  },
  {
    id: "season",
    label: "SEASON PASS",
    price: "$109",
    cadence: "ALL 7 NIGHTS",
    perks: ["Every Season 05 show", "Priority RSVP", "VIP season pass also available", "Best value of the season"],
    tone: "ghost",
    href: ticketUrl(SEASON_PASS.slug),
  },
];

export interface ProgramMood {
  name: string;
  count: string;
  blurb: string;
}

// Emotional strands (BFI model) recommended in the brief.
export const PROGRAM_MOODS: ProgramMood[] = [
  { name: "HEAT", count: "Premieres", blurb: "Opening night, headliners, the films we couldn't stop talking about." },
  { name: "PULSE", count: "Narrative", blurb: "Shorts with a story to tell — under 20 minutes, all the way through." },
  { name: "FREQUENCY", count: "Music Video", blurb: "Sound and image, PNW artists, the loudest room of the night." },
  { name: "STATIC", count: "Experimental", blurb: "Animated, abstract, and the work that doesn't fit a box. By design." },
  { name: "LATE SHOW", count: "After Dark", blurb: "Midnight energy — horror, genre, and the deliciously strange." },
];

export interface Director {
  name: string;
  film: string;
  mood: string;
}

export const DIRECTORS: Director[] = [
  { name: "Runaya Mwangi", film: "The Slow Blink", mood: "HEAT" },
  { name: "D. Anejo", film: "Northgate Blues", mood: "PULSE" },
  { name: "K. Yeh", film: "4 Minutes at 3rd & Pike", mood: "PULSE" },
  { name: "M. Kaur", film: "Saltwater, Again", mood: "STATIC" },
  { name: "T. Okonkwo", film: "Boombox Year", mood: "FREQUENCY" },
  { name: "J. Reyes", film: "Last Bus to Rainier", mood: "LATE SHOW" },
];

export interface SponsorTier {
  tier: string;
  name: string;
  blurb: string;
  slots: string[];
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    tier: "TITLE",
    name: "Presenting Sponsor",
    blurb: "Named in the lockup — “Scope Screenings, presented by…” — on every page, every night.",
    slots: ["Your name here"],
  },
  {
    tier: "MAJOR",
    name: "Season Sponsors",
    blurb: "Logo on the homepage and every film card. 3–6 partners per season.",
    slots: ["Converge", "SIFF", "FilmFreeway"],
  },
  {
    tier: "SUPPORTING",
    name: "Community Partners",
    blurb: "Venue, fiscal, and community partners who keep the lights on.",
    slots: ["Langston Hughes P.A.I.", "Shunpike", "Office of Film + Music", "4Culture"],
  },
];

export interface Social {
  label: string;
  href: string;
}

export const SOCIALS: Social[] = [
  { label: "Instagram", href: "https://instagram.com/scopescreenings" },
  { label: "TikTok", href: "https://tiktok.com/@scopescreenings" },
  { label: "YouTube", href: "https://youtube.com/@scopescreenings" },
];

export const CONTACT_EMAIL = "hello@scopescreenings.com";

// --- About page ---
export const ABOUT_STATS = [
  { n: "Last Tue", l: "Monthly · June–December" },
  { n: "~300", l: "In the room each night" },
  { n: "10", l: "Directors a night" },
  { n: "≤20 min", l: "Every film, every genre" },
] as const;

export interface TimelineEntry { year: string; title: string; blurb: string; }
export const TIMELINE: TimelineEntry[] = [
  { year: "2022", title: "It starts in June", blurb: "Lex Scope launches Scope Screenings in Seattle — one night, a handful of directors, and a simple idea: get overlooked filmmakers onto a real screen, in front of a real crowd." },
  { year: "2023–24", title: "Word gets out", blurb: "Monthly screenings start packing the Langston Hughes Institute. The lineup grows to 200+ films from 150+ filmmakers across 20+ nights and six-plus theaters around the city." },
  { year: "2025", title: "A seat at the table", blurb: "Lex Scope is appointed to the Seattle Film Commission — carrying the same fight for access into the rooms where the city's film policy gets made." },
  { year: "2026", title: "Where we are now", blurb: "Seven nights a season, June through December, still the last Tuesday of every month — and still putting the fun back in film fests." },
];

export interface House { name: string; eyebrow: string; address: string; blurb: string; }
export const HOUSES: House[] = [
  { name: "Langston Hughes Institute", eyebrow: "Home venue", address: "104 17th Ave S, Seattle 98144", blurb: "Our monthly home in the Central District." },
  { name: "Majestic Bay Theatres", eyebrow: "Also screens at", address: "2044 NW Market St, Ballard", blurb: "Special nights and season finales on the big house screen." },
  { name: "SIFF Cinema Egyptian", eyebrow: "Also screens at", address: "805 E Pine St, Capitol Hill", blurb: "A historic landmark house for our marquee screenings." },
];

// --- Submit page ---
export interface SubmissionRound { name: string; closes: string; fee: string; }
export const SUBMISSION_ROUNDS: SubmissionRound[] = [
  { name: "Early Bird", closes: "Closes June 30, 2026", fee: "$15" },
  { name: "Regular", closes: "Closes August 31, 2026", fee: "$25" },
  { name: "Late", closes: "Closes September 30, 2026", fee: "$35" },
  { name: "Extended", closes: "Closes October 15, 2026", fee: "$40" },
];
export const SUBMIT_CRITERIA = [
  { n: "01", title: "A point of view", blurb: "We'll take a rough film with a real voice over a polished one with nothing to say. Show us how you see." },
  { n: "02", title: "Twenty minutes, max", blurb: "Shorts, music videos, trailers, docs, animation, experiments, skits. Any genre — just make every minute count." },
  { n: "03", title: "Made by you", blurb: "We prioritize PNW and underrepresented filmmakers. First-timers and new names are exactly who we're here for." },
] as const;
export const SUBMIT_STEPS = [
  { n: "1", title: "Cut it to twenty", blurb: "Lock your film at twenty minutes or under and export a screener link or file you're proud of." },
  { n: "2", title: "Enter on FilmFreeway", blurb: "Add your title, synopsis, stills, and bio, then pay the entry fee — or request a waiver, no questions." },
  { n: "3", title: "Watch your inbox", blurb: "We watch every submission and reply to every filmmaker — programmed or not. Selections screen that season." },
] as const;

// --- Support page ---
export const SUPPORT_STATS = [
  { n: "$0", l: "Cost barrier", blurb: "Fee waivers keep submissions open to everyone. Your gift covers the gap." },
  { n: "300+", l: "Seats a night", blurb: "A full house every month means real audiences for first-time filmmakers." },
  { n: "100%", l: "To the work", blurb: "Every dollar goes to venue, gear, and filmmaker stipends — not overhead." },
] as const;
export interface GivingLevel { name: string; amount: string; cadence: string; perks: string[]; featured?: boolean; }
export const GIVING_LEVELS: GivingLevel[] = [
  { name: "Friend", amount: "$50", cadence: "once", perks: ["Name on the season funder wall", "Our eternal gratitude"] },
  { name: "Patron", amount: "$250", cadence: "once", perks: ["Two season passes, on us", "Name on the funder wall"] },
  { name: "Producer", amount: "$1,000", cadence: "once", perks: ["Reserved VIP table for four", "Logo on screen before each show"] },
  { name: "Title Partner", amount: "Custom", cadence: "season", perks: ["Presenting billing all season", "A named night + custom activation"], featured: true },
];
