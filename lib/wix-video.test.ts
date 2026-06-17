import { describe, it, expect } from "vitest";
import { wixVideoUrl } from "./wix-video";
describe("wixVideoUrl", () => {
  it("converts a wix:video uri to a playable mp4 url", () => {
    expect(wixVideoUrl("wix:video://v1/c51492_abc/file.mp4#posterUri=x"))
      .toBe("https://video.wixstatic.com/video/c51492_abc/1080p/mp4/file.mp4");
  });
  it("passes through http(s)", () => { expect(wixVideoUrl("https://x/y.mp4")).toBe("https://x/y.mp4"); });
  it("null for empty/garbage", () => { expect(wixVideoUrl("")).toBeNull(); expect(wixVideoUrl("g")).toBeNull(); });
});
