import { CONTACT_EMAIL, SOCIALS, VENUE } from "@/lib/festival";

const COLUMNS = [
  { head: "Festival", links: ["About", "The Films", "Schedule", "Venues"] },
  { head: "Attend", links: ["Buy Tickets", "Season Pass", "FAQ", "Accessibility"] },
  { head: "Get Involved", links: ["Submit a Film", "Become a Funder", "Press & Media", "Volunteer"] },
];

export function SiteFooter() {
  return (
    <footer className="bg-stage-deep px-5 pb-9 pt-16 md:px-[90px]">
      {/* Sign-off + newsletter */}
      <div className="flex flex-col gap-10 border-b border-cream/10 pb-12 md:flex-row md:items-end md:justify-between">
        <h2 className="pulp font-display text-[48px] uppercase leading-[0.9] tracking-[-0.01em] md:text-[62px]">
          See You At
          <br />
          The Movies
        </h2>
        <div className="flex w-full max-w-[440px] flex-col gap-3">
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-smoke">
            Get the lineup in your inbox
          </span>
          <form className="flex h-[52px] overflow-hidden rounded-md border border-cream/25 focus-within:border-rust">
            <input
              type="email"
              required
              placeholder="you@email.com"
              aria-label="Email address"
              className="flex-1 bg-ink/40 px-4 font-body text-[15px] text-cream placeholder:text-smoke focus:outline-none"
            />
            <button
              type="submit"
              className="bg-curtain px-6 font-body text-[14px] font-extrabold uppercase tracking-[0.06em] text-cream"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-10 border-b border-cream/10 py-11 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="font-marquee text-[18px] uppercase text-cream">Scope Screenings</span>
          <p className="max-w-[28ch] font-body text-[14px] leading-relaxed text-smoke">
            Seattle&rsquo;s underground film festival. We put the fun back in film fests.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.head} className="flex flex-col gap-2.5">
            <span className="font-body text-[12px] font-bold uppercase tracking-[0.16em] text-rust">
              {col.head}
            </span>
            {col.links.map((l) => (
              <a key={l} href="#" className="font-body text-[14px] text-cream/80 transition-colors hover:text-rust">
                {l}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Legal */}
      <div className="flex flex-col gap-2 pt-6 md:flex-row md:items-center md:justify-between">
        <span className="font-body text-[12px] text-smoke">
          © 2026 Scope Screenings · A fiscally sponsored project of Shunpike · {VENUE.city}
        </span>
        <div className="flex items-center gap-5">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[12px] text-smoke transition-colors hover:text-rust"
            >
              {s.label}
            </a>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-body text-[12px] text-smoke transition-colors hover:text-rust">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
