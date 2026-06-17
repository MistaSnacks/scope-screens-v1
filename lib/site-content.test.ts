// lib/site-content.test.ts
import { it, expect, vi, afterEach } from "vitest";

vi.mock("./wix-cms", () => ({
  queryCollection: vi.fn(),
  getSingleton: vi.fn(),
}));
import { queryCollection, getSingleton } from "./wix-cms";
import { getSiteContent, sectionOf } from "./site-content";

afterEach(() => vi.restoreAllMocks());

it("indexes sections by sectionKey and exposes lists", async () => {
  vi.mocked(queryCollection).mockImplementation(async (id: string) => {
    if (id === "Sections") return [{ sectionKey: "submissions", ctaUrl: "https://ff/x", title: "Submit" }] as never;
    if (id === "Partners") return [{ name: "SIFF", url: "https://siff.net", order: 1 }] as never;
    if (id === "Marquee") return [{ phrase: "NOW SHOWING", order: 1 }] as never;
    if (id === "Socials") return [{ label: "Instagram", url: "https://ig", order: 1 }] as never;
    return null;
  });
  vi.mocked(getSingleton).mockImplementation(async (id: string) => {
    if (id === "Settings") return { contactEmail: "hi@x.com" } as never;
    return null;
  });

  const c = await getSiteContent();
  expect(sectionOf(c, "submissions")?.ctaUrl).toBe("https://ff/x");
  expect(c.partners?.[0].name).toBe("SIFF");
  expect(c.marquee?.[0].phrase).toBe("NOW SHOWING");
  expect(c.socials?.[0].label).toBe("Instagram");
  expect(c.settings?.contactEmail).toBe("hi@x.com");
});

it("tolerates all-null CMS (returns empty structures)", async () => {
  vi.mocked(queryCollection).mockResolvedValue(null);
  vi.mocked(getSingleton).mockResolvedValue(null);
  const c = await getSiteContent();
  expect(sectionOf(c, "anything")).toBeUndefined();
  expect(c.partners).toBeNull();
  expect(c.settings).toBeNull();
  // new lists must also be null
  expect(c.stats).toBeNull();
  expect(c.moments).toBeNull();
  expect(c.clapboard).toBeNull();
  expect(c.chips).toBeNull();
  expect(c.givingTiers).toBeNull();
  expect(c.pressKit).toBeNull();
  // new per-section singletons must also be null
  expect(c.hero).toBeNull();
  expect(c.whatIs).toBeNull();
  expect(c.builtForAccess).toBeNull();
  expect(c.magicGallery).toBeNull();
  expect(c.submissions).toBeNull();
  expect(c.archives).toBeNull();
  expect(c.support).toBeNull();
  expect(c.footer).toBeNull();
  expect(c.siteSettings).toBeNull();
});

it("exposes and sorts the 6 new CMS collections", async () => {
  vi.mocked(queryCollection).mockImplementation(async (id: string) => {
    if (id === "Stats") return [{ value: "500+", label: "Films", order: 2 }, { value: "10", label: "Years", order: 1 }] as never;
    if (id === "Moments") return [{ title: "Opening Night", slug: "opening", order: 2 }, { title: "Awards", slug: "awards", order: 1 }] as never;
    if (id === "Clapboard") return [{ label: "Founded", value: "2014", order: 1 }, { label: "Films", value: "500+", order: 2 }] as never;
    if (id === "SubmissionChips") return [{ label: "Short Film", accent: "red", order: 2 }, { label: "Feature", accent: "blue", order: 1 }] as never;
    if (id === "GivingTiers") return [{ label: "Gold", featured: true, order: 2 }, { label: "Silver", featured: false, order: 1 }] as never;
    if (id === "PressKit") return [{ label: "Logo", format: "PNG", url: "https://x/logo.png", order: 1 }] as never;
    return null;
  });
  vi.mocked(getSingleton).mockResolvedValue(null);

  const c = await getSiteContent();

  // stats sorted by order
  expect(c.stats).toHaveLength(2);
  expect(c.stats?.[0].label).toBe("Years");
  expect(c.stats?.[1].label).toBe("Films");

  // moments sorted by order
  expect(c.moments).toHaveLength(2);
  expect(c.moments?.[0].slug).toBe("awards");
  expect(c.moments?.[1].slug).toBe("opening");

  // clapboard sorted by order
  expect(c.clapboard).toHaveLength(2);
  expect(c.clapboard?.[0].label).toBe("Founded");

  // chips sorted by order
  expect(c.chips).toHaveLength(2);
  expect(c.chips?.[0].label).toBe("Feature");
  expect(c.chips?.[1].label).toBe("Short Film");

  // givingTiers sorted by order
  expect(c.givingTiers).toHaveLength(2);
  expect(c.givingTiers?.[0].label).toBe("Silver");

  // pressKit
  expect(c.pressKit).toHaveLength(1);
  expect(c.pressKit?.[0].format).toBe("PNG");
});

it("exposes new CmsSettings fields", async () => {
  vi.mocked(queryCollection).mockResolvedValue(null);
  vi.mocked(getSingleton).mockImplementation(async (id: string) => {
    if (id === "Settings") return {
      contactEmail: "hi@x.com",
      founderName: "Jane Doe",
      founderTitle: "Director",
      founderCredential: "Sundance alum",
      motto: "Film for all",
      supportUrl: "https://support.x.com",
      pressEmail: "press@x.com",
    } as never;
    return null;
  });

  const c = await getSiteContent();
  expect(c.settings?.founderName).toBe("Jane Doe");
  expect(c.settings?.founderTitle).toBe("Director");
  expect(c.settings?.founderCredential).toBe("Sundance alum");
  expect(c.settings?.motto).toBe("Film for all");
  expect(c.settings?.supportUrl).toBe("https://support.x.com");
  expect(c.settings?.pressEmail).toBe("press@x.com");
});

it("exposes per-section singleton content readers", async () => {
  vi.mocked(queryCollection).mockResolvedValue(null);
  vi.mocked(getSingleton).mockImplementation(async (id: string) => {
    if (id === "Hero") return { eyebrow: "Welcome", title: "Scope Screenings", tagline: "Film for all", poster: "/poster.jpg", video: "/trailer.mp4" } as never;
    if (id === "WhatIs") return { eyebrow: "About", title: "What Is This?", body: "A festival.", motto: "Film for all" } as never;
    if (id === "BuiltForAccess") return { eyebrow: "Access", title: "Built For Access", quote: "Everyone in.", founderName: "Jane Doe", founderTitle: "Director", founderCredential: "Sundance alum", photo: "/jane.jpg" } as never;
    if (id === "MagicGallery") return { eyebrow: "Gallery", title: "The Magic", body: "See films.", ctaLabel: "Browse", ctaUrl: "/gallery" } as never;
    if (id === "Submissions") return { eyebrow: "Submit", title: "Submit Your Film", intro: "Open now.", ctaLabel: "Apply", ctaUrl: "/apply" } as never;
    if (id === "Archives") return { eyebrow: "Past", title: "Archives", body: "Years of films.", ctaLabel: "Explore", ctaUrl: "/archives" } as never;
    if (id === "Support") return { eyebrow: "Give", title: "Support Us", funderTitle: "Funders", funderBody: "Thank you.", donateLabel: "Donate", donateUrl: "/donate", pressTitle: "Press", pressBody: "For media.", pressKitLabel: "Press Kit", pressEmail: "press@x.com" } as never;
    if (id === "Footer") return { signoff: "See you at the movies.", tagline: "Film for all", newsletterHeading: "Stay in touch", copyright: "© 2026", contactEmail: "hi@x.com" } as never;
    if (id === "SiteSettings") return { venueName: "The Grand", venueAddress: "123 Main St", venueCity: "Seattle" } as never;
    return null;
  });

  const c = await getSiteContent();
  expect(c.hero?.title).toBe("Scope Screenings");
  expect(c.hero?.video).toBe("/trailer.mp4");
  expect(c.whatIs?.motto).toBe("Film for all");
  expect(c.builtForAccess?.founderName).toBe("Jane Doe");
  expect(c.builtForAccess?.quote).toBe("Everyone in.");
  expect(c.magicGallery?.ctaUrl).toBe("/gallery");
  expect(c.submissions?.ctaLabel).toBe("Apply");
  expect(c.archives?.body).toBe("Years of films.");
  expect(c.support?.donateUrl).toBe("/donate");
  expect(c.support?.pressEmail).toBe("press@x.com");
  expect(c.footer?.signoff).toBe("See you at the movies.");
  expect(c.footer?.contactEmail).toBe("hi@x.com");
  expect(c.siteSettings?.venueName).toBe("The Grand");
  expect(c.siteSettings?.venueCity).toBe("Seattle");
});
