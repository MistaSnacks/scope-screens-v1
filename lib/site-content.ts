// lib/site-content.ts
// Aggregates all CMS-editable content for the main SPA into one request-deduped
// object. Each component applies its own festival.ts fallback at point of use,
// so a missing collection or blank field never breaks a render.
import { cache } from "react";
import { queryCollection, getSingleton } from "./wix-cms";

export interface CmsSection {
  sectionKey: string;
  displayName?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  order?: number;
}
export interface CmsPartner { name?: string; logo?: string; url?: string; tier?: string; order?: number; }
export interface CmsSocial { label?: string; url?: string; order?: number; }
export interface CmsSettings {
  contactEmail?: string; venueName?: string; venueAddress?: string; venueCity?: string;
  doorsTime?: string; screenTime?: string; newsletterHeading?: string;
  footerTagline?: string; copyright?: string;
}
export interface SiteContent {
  sections: Record<string, CmsSection>;
  partners: CmsPartner[] | null;
  marquee: { phrase?: string; order?: number }[] | null;
  socials: CmsSocial[] | null;
  settings: CmsSettings | null;
}

const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const [sections, partners, marquee, socials, settings] = await Promise.all([
    queryCollection<CmsSection>("Sections"),
    queryCollection<CmsPartner>("Partners", { sort: [{ fieldName: "order", order: "ASC" }] }),
    queryCollection<{ phrase?: string; order?: number }>("Marquee", { sort: [{ fieldName: "order", order: "ASC" }] }),
    queryCollection<CmsSocial>("Socials", { sort: [{ fieldName: "order", order: "ASC" }] }),
    getSingleton<CmsSettings>("Settings"),
  ]);
  const sectionMap: Record<string, CmsSection> = {};
  for (const s of sections ?? []) if (s.sectionKey) sectionMap[s.sectionKey] = s;
  return {
    sections: sectionMap,
    partners: partners ? [...partners].sort(byOrder) : null,
    marquee: marquee ? [...marquee].sort(byOrder) : null,
    socials: socials ? [...socials].sort(byOrder) : null,
    settings,
  };
});

export function sectionOf(content: SiteContent, key: string): CmsSection | undefined {
  return content.sections[key];
}
