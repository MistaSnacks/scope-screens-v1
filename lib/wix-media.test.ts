import { describe, it, expect } from "vitest";
import { wixImageUrl } from "./wix-media";

describe("wixImageUrl", () => {
  it("converts a wix:image URI to a static URL", () => {
    expect(wixImageUrl("wix:image://v1/c51492_abc~mv2.jpg/founder.jpg#originWidth=1000&originHeight=800"))
      .toBe("https://static.wixstatic.com/media/c51492_abc~mv2.jpg");
  });
  it("passes through an http url", () => {
    expect(wixImageUrl("https://x/y.jpg")).toBe("https://x/y.jpg");
    expect(wixImageUrl("http://x/y.jpg")).toBe("http://x/y.jpg");
  });
  it("returns null for empty/undefined/unparseable", () => {
    expect(wixImageUrl(undefined)).toBeNull();
    expect(wixImageUrl("")).toBeNull();
    expect(wixImageUrl("garbage")).toBeNull();
  });
});
