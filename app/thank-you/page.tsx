import Link from "next/link";

export const metadata = { title: "Thank You — Scope Screenings" };

export default function ThankYou() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 text-center text-fg">
      <span className="font-mono text-[0.75rem] uppercase tracking-[0.3em] text-label">Admit One</span>
      <h1 className="pulp font-display text-[3.5rem] uppercase leading-[0.94] md:text-[5rem]">You're In</h1>
      <p className="max-w-[44ch] font-body text-[1.0625rem] leading-relaxed text-fg/70">
        Your tickets are confirmed — check your email for the details and your digital ticket.
        Doors 7:00, lights down at 7:30. See you at the show.
      </p>
      <Link
        href="/"
        className="border-b-2 border-rust pb-1.5 font-body text-[0.8125rem] font-extrabold uppercase tracking-[0.14em] text-fg transition-colors hover:text-rust"
      >
        Back to the festival ›
      </Link>
    </main>
  );
}
