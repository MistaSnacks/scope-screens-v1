// scripts/px-to-rem.test.ts
import { describe, it, expect } from "vitest";
import { convertClassNamePx } from "./px-to-rem.mjs";

describe("convertClassNamePx", () => {
  it("converts a whole-number px utility to rem (÷16)", () => {
    const { out, count } = convertClassNamePx('className="text-[56px]"');
    expect(out).toBe('className="text-[3.5rem]"');
    expect(count).toBe(1);
  });

  it("converts gutter and offset utilities", () => {
    const { out } = convertClassNamePx("px-[90px] scroll-mt-[120px]");
    expect(out).toBe("px-[5.625rem] scroll-mt-[7.5rem]");
  });

  it("converts a decimal px value", () => {
    const { out } = convertClassNamePx("gap-[6.5px]");
    expect(out).toBe("gap-[0.40625rem]");
  });

  it("preserves responsive variant prefixes", () => {
    const { out } = convertClassNamePx("md:text-[80px]");
    expect(out).toBe("md:text-[5rem]");
  });

  it("keeps border widths in px", () => {
    const { out, skipped } = convertClassNamePx("border-r-[3px]");
    expect(out).toBe("border-r-[3px]");
    expect(skipped).toContain("border-r-[3px]");
  });

  it("keeps <=2px hairlines in px", () => {
    const { out } = convertClassNamePx("h-[1px] w-[2px]");
    expect(out).toBe("h-[1px] w-[2px]");
  });

  it("does not touch compound shadow/calc values", () => {
    const src = "shadow-[0_20px_45px_rgba(11,10,9,0.07)] w-[calc(100%+10px)]";
    const { out, count } = convertClassNamePx(src);
    expect(out).toBe(src);
    expect(count).toBe(0);
  });
});
