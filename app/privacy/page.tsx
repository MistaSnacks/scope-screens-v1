import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/festival";

export const metadata: Metadata = {
  title: "Privacy Policy — Scope Screenings",
  description:
    "How Scope Screenings collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="The fine print"
      title="Privacy Policy"
      updated="June 18, 2026"
      intro="Scope Screenings is a fiscally sponsored project of Shunpike. We keep the data we collect to the minimum it takes to sell a ticket, read a submission, and send the lineup to your inbox — and we never sell it. This page explains what we gather, why, and the choices you have."
    >
      <LegalSection heading="Information We Collect">
        <p>
          We collect what you give us directly: your email when you join the
          newsletter, your name and payment details when you buy a ticket or
          season pass, and the title, synopsis, and contact details attached to
          a film submission. We also collect basic, non-identifying usage data
          (pages viewed, device type) to keep the site working.
        </p>
      </LegalSection>

      <LegalSection heading="How We Use It">
        <p>
          We use your information to process ticket orders, confirm and program
          submissions, respond to questions, and send occasional festival
          updates. We do not use your data for automated decision-making or
          third-party advertising.
        </p>
      </LegalSection>

      <LegalSection heading="Who Handles It With Us">
        <p>
          Ticketing and payments run through Wix and its payment processors;
          donations are handled by our fiscal sponsor, Shunpike; film entries
          come through FilmFreeway. Each is bound by its own privacy terms and
          only receives the data needed for that task. We never sell, rent, or
          trade your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies & Analytics">
        <p>
          The site uses essential cookies and lightweight analytics to remember
          your display preferences and understand which pages people use. You
          can block cookies in your browser; the site will still work, though
          some preferences may not persist.
        </p>
      </LegalSection>

      <LegalSection heading="Your Choices">
        <p>
          Every newsletter includes a one-click unsubscribe. You can ask us to
          access, correct, or delete the personal information we hold about you
          at any time — just email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Privacy%20Request`}
            className="text-curtain underline-offset-2 hover:text-rust hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          and we&rsquo;ll take care of it.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy? Reach us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-curtain underline-offset-2 hover:text-rust hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
