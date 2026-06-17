import {
  SUBMISSION_DEADLINES,
  SUBMISSION_NOTIFICATION,
  SUBMISSION_SEASON,
  SUBMIT_URL,
  nextSubmissionDeadline,
} from "@/lib/festival";
import { getSiteContent, sectionOf } from "@/lib/site-content";
import { Reveal } from "@/components/motion/reveal";
import { KineticText } from "@/components/motion/kinetic-text";

const LEAVES = [
  { cx: 72, cy: 132, rx: 13, ry: 5.2, rot: -36 },
  { cx: 62, cy: 110, rx: 13, ry: 5.2, rot: -46 },
  { cx: 56, cy: 88, rx: 13, ry: 5.2, rot: -57 },
  { cx: 55, cy: 66, rx: 13, ry: 5.2, rot: -69 },
  { cx: 60, cy: 45, rx: 12, ry: 5, rot: -83 },
  { cx: 70, cy: 27, rx: 11, ry: 4.6, rot: -99 },
];

function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="92" height="148" viewBox="0 0 110 168" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden>
      <g transform={flip ? "translate(110,0) scale(-1,1)" : undefined}>
        <path
          d="M86 158 C60 128 50 96 54 58 C56 38 66 22 82 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {LEAVES.map((l, i) => (
          <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}

const CHIPS = [
  { label: "≤ 20 MIN", dot: "bg-curtain" },
  { label: "6 CATEGORIES", dot: "bg-rust" },
  { label: "JUDGED AWARDS · NEW", dot: "bg-curtain" },
  { label: "JUNE–DECEMBER", dot: "bg-rust" },
];

export async function Submissions() {
  const content = await getSiteContent();
  const cms = sectionOf(content, "submissions");
  const submitUrl = cms?.ctaUrl ?? SUBMIT_URL;
  const ctaLabel = cms?.ctaLabel ?? "Open the Call ›";
  const heading = cms?.title ?? "Submit Your Film";
  const next = nextSubmissionDeadline();
  const eyebrow = cms?.eyebrow ?? `Open Call · ${SUBMISSION_SEASON} Submissions`;
  const intro = cms?.body ?? `Narrative shorts, documentaries, animation, music videos, commercials, and experimental work — all under twenty minutes. Screened live on the big screen, June through December, and for the first time ${SUBMISSION_SEASON} brings judged awards.`;
  const chips = content.chips && content.chips.length
    ? content.chips.map((c) => ({ label: c.label ?? "", dot: c.accent === "rust" ? "bg-rust" : "bg-curtain" }))
    : CHIPS;

  return (
    <section className="flex flex-col items-center gap-9 border-t border-hairline bg-bg-alt px-5 py-24 md:px-[90px]">
      {/* Eyebrow */}
      <div className="flex items-center gap-3">
        <span className="h-px w-9 bg-curtain" />
        <span className="font-mono text-[12px] uppercase tracking-[0.28em] text-curtain">
          {eyebrow}
        </span>
        <span className="h-px w-9 bg-curtain" />
      </div>

      {/* Laurel lockup */}
      <Reveal className="flex items-center justify-center gap-4">
        <Laurel />
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[13px] tracking-[0.34em] text-fg/60">OFFICIAL SELECTION</span>
          <KineticText as="h2" className="pulp text-center font-display text-[52px] uppercase leading-[0.92] md:text-[60px]" text={heading} />
          <span className="font-mono text-[13px] tracking-[0.26em] text-curtain">SCOPE SCREENINGS · 2026</span>
        </div>
        <Laurel flip />
      </Reveal>

      <p className="max-w-[60ch] text-center font-body text-[17px] leading-relaxed text-fg/70">
        {intro}
      </p>

      {/* Meta chips */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {chips.map((c, i) => (
          <span key={`${i}-${c.label}`} className="flex items-center gap-2 rounded-full border border-hairline px-3.5 py-2 font-mono text-[12px] tracking-[0.1em] text-fg/80">
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {c.label}
          </span>
        ))}
      </div>

      {/* Real FilmFreeway deadline ladder — next one highlighted */}
      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-fg/45">Submission Deadlines</span>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SUBMISSION_DEADLINES.map((d) => {
            const isNext = d.iso === next.iso;
            return (
              <span
                key={d.name}
                className={
                  isNext
                    ? "flex items-center gap-2 rounded-md bg-curtain px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-cream"
                    : "flex items-center gap-2 rounded-md border border-hairline px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.1em] text-fg/55"
                }
              >
                {isNext ? <span className="rounded-sm bg-cream/25 px-1.5 py-0.5 text-[9px] tracking-[0.12em]">NEXT</span> : null}
                {d.name} · {d.date}
              </span>
            );
          })}
        </div>
        <span className="font-mono text-[11px] tracking-[0.14em] text-fg/40">Notifications {SUBMISSION_NOTIFICATION}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5">
        <a
          href={submitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-curtain px-7 py-3.5 font-body text-[14px] font-extrabold uppercase tracking-[0.06em] text-cream transition-transform hover:scale-[1.03]"
        >
          {ctaLabel}
        </a>
        <span className="font-body text-[15px] text-fg/55">
          submitted via <span className="text-fg/80">FilmFreeway</span>
        </span>
      </div>
    </section>
  );
}
