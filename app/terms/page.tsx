import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/festival";

export const metadata: Metadata = {
  title: "Terms of Service — Scope Screenings",
  description:
    "The terms that govern tickets, submissions, and use of the Scope Screenings site.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="The fine print"
      title="Terms of Service"
      updated="June 18, 2026"
      intro="These terms cover your use of the Scope Screenings website, the tickets you buy, and the films you submit. By using the site or attending a screening, you agree to what follows. We&rsquo;ve kept it as plain as we can."
    >
      <LegalSection heading="Using This Site">
        <p>
          You may browse, buy tickets, and submit films for your own,
          non-commercial use. Don&rsquo;t attempt to disrupt, scrape, or
          reverse-engineer the site, and don&rsquo;t use it for anything
          unlawful.
        </p>
      </LegalSection>

      <LegalSection heading="Tickets & Admission">
        <p>
          Ticket and season-pass sales are processed through Wix. Tickets are
          valid only for the screening and date shown and are non-refundable
          unless an event is cancelled, in which case we&rsquo;ll refund the
          face value. Programs, films, and showtimes may change. We reserve the
          right to refuse or revoke admission to keep the room safe and
          welcoming for everyone.
        </p>
      </LegalSection>

      <LegalSection heading="Film Submissions">
        <p>
          You keep all rights to the work you submit. By entering, you confirm
          you hold the rights to your film and everything in it, and you grant
          Scope Screenings permission to screen your film at our events and to
          use short excerpts or stills to promote the festival. Entry fees are
          non-refundable, and submission does not guarantee selection.
        </p>
      </LegalSection>

      <LegalSection heading="Conduct at Events">
        <p>
          We&rsquo;re built on access and respect. Harassment, discrimination,
          or disruptive behavior at any screening may result in removal without
          a refund. Follow venue rules and the direction of festival staff.
        </p>
      </LegalSection>

      <LegalSection heading="Our Content">
        <p>
          The Scope Screenings name, branding, site design, and original copy
          are ours or our licensors&rsquo;. You may not reuse them without
          permission. Films and artwork remain the property of their respective
          creators.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimers & Liability">
        <p>
          The site and events are provided &ldquo;as is.&rdquo; To the fullest
          extent allowed by law, Scope Screenings and Shunpike are not liable
          for indirect or incidental damages arising from your use of the site
          or attendance at an event. Nothing here limits rights you have that
          can&rsquo;t be waived under applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="Changes & Contact">
        <p>
          We may update these terms from time to time; the date above shows the
          latest version. Questions? Email us at{" "}
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
