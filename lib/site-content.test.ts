// lib/site-content.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";

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
  vi.mocked(getSingleton).mockResolvedValue({ contactEmail: "hi@x.com" } as never);

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
});
