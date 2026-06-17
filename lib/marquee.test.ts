import { describe, it, expect } from "vitest";
import { buildMarqueeItems } from "./marquee";

describe("buildMarqueeItems", () => {
  it("puts the live line first when present", () => {
    expect(buildMarqueeItems(["A", "B"], "NOW SHOWING · JUL 28 · Langston"))
      .toEqual(["NOW SHOWING · JUL 28 · Langston", "A", "B"]);
  });
  it("falls back to phrases only when no live line", () => {
    expect(buildMarqueeItems(["A", "B"], null)).toEqual(["A", "B"]);
  });
  it("drops empty phrases", () => {
    expect(buildMarqueeItems(["A", "", "  "], null)).toEqual(["A"]);
  });
});
