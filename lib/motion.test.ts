import { describe, it, expect, vi, afterEach } from "vitest";
import { prefersReducedMotion, revealVariants, EASE } from "./motion";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("reduce") ? matches : false,
    media: q, addEventListener() {}, removeEventListener() {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe("motion tokens", () => {
  it("EASE is a 4-number cubic-bezier", () => {
    expect(EASE).toHaveLength(4);
    EASE.forEach((n) => expect(typeof n).toBe("number"));
  });

  it("reports reduced-motion preference from matchMedia", () => {
    mockReducedMotion(true);
    expect(prefersReducedMotion()).toBe(true);
    mockReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("revealVariants hidden state is offset, visible state is settled", () => {
    expect(revealVariants.hidden.opacity).toBe(0);
    expect(revealVariants.hidden.y).toBeGreaterThan(0);
    expect(revealVariants.visible.opacity).toBe(1);
    expect(revealVariants.visible.y).toBe(0);
  });
});
