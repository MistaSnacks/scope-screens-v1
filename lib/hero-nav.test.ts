import { describe, it, expect } from "vitest";
import { PRIMARY_CREDITS, SECONDARY_CREDITS } from "./hero-nav";

describe("hero nav credits", () => {
  it("exposes exactly two primary actions, in order: Buy Tickets then Submit a Film", () => {
    expect(PRIMARY_CREDITS.map((c) => c.label)).toEqual(["Buy Tickets", "Submit a Film"]);
  });

  it("points the primary actions at the tickets and submit routes", () => {
    expect(PRIMARY_CREDITS.find((c) => c.label === "Buy Tickets")?.href).toBe("/#tickets");
    expect(PRIMARY_CREDITS.find((c) => c.label === "Submit a Film")?.href).toBe("/submit");
  });

  it("keeps a single secondary destination: Become a Funder -> /support", () => {
    expect(SECONDARY_CREDITS).toHaveLength(1);
    expect(SECONDARY_CREDITS[0]).toMatchObject({ label: "Become a Funder", href: "/support" });
  });

  it("never reintroduces the dropped hero destinations", () => {
    const labels = [...PRIMARY_CREDITS, ...SECONDARY_CREDITS].map((c) => c.label);
    expect(labels).not.toContain("The Films");
    expect(labels).not.toContain("Press & Media");
    expect(labels).not.toContain("About the Festival");
  });
});
