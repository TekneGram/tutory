import { describe, expect, it } from "vitest";
import { getContentTypeForAssetPath, parseByteRangeHeader } from "../registerContentAssetProtocol";

describe("getContentTypeForAssetPath", () => {
  it("returns audio type for ogg", () => {
    expect(getContentTypeForAssetPath("/tmp/cycle_1_summary.ogg")).toBe("audio/ogg");
  });

  it("returns image type for webp", () => {
    expect(getContentTypeForAssetPath("/tmp/caring_fau_chan.webp")).toBe("image/webp");
  });

  it("falls back to octet-stream for unknown extension", () => {
    expect(getContentTypeForAssetPath("/tmp/file.abcxyz")).toBe("application/octet-stream");
  });
});

describe("parseByteRangeHeader", () => {
  it("parses explicit start/end range", () => {
    expect(parseByteRangeHeader("bytes=10-99", 200)).toEqual({ start: 10, end: 99 });
  });

  it("parses open-ended range", () => {
    expect(parseByteRangeHeader("bytes=50-", 200)).toEqual({ start: 50, end: 199 });
  });

  it("parses suffix range", () => {
    expect(parseByteRangeHeader("bytes=-25", 200)).toEqual({ start: 175, end: 199 });
  });

  it("returns null for invalid ranges", () => {
    expect(parseByteRangeHeader("bytes=300-400", 200)).toBeNull();
    expect(parseByteRangeHeader("bytes=99-10", 200)).toBeNull();
    expect(parseByteRangeHeader("something-else", 200)).toBeNull();
  });
});
