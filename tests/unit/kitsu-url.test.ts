import { describe, it, expect } from "bun:test";
import { buildKitsuUrl } from "../../src/lib/api/kitsu";

describe("buildKitsuUrl", () => {
  it("builds plain URL without parameters", () => {
    expect(buildKitsuUrl("/trending/anime")).toBe("https://kitsu.io/api/edge/trending/anime");
  });

  it("encodes flat query parameters in alphabetical order", () => {
    const url = buildKitsuUrl("/anime", { sort: "-userCount", limit: 10 });
    expect(url).toBe("https://kitsu.io/api/edge/anime?limit=10&sort=-userCount");
  });

  it("formats nested object parameters for JSON:API filter and page", () => {
    const url = buildKitsuUrl("/anime", {
      filter: { text: "cowboy", subtype: "TV" },
      page: { limit: 20, offset: 0 }
    });
    expect(url).toContain("filter%5Bsubtype%5D=TV");
    expect(url).toContain("filter%5Btext%5D=cowboy");
    expect(url).toContain("page%5Blimit%5D=20");
    expect(url).toContain("page%5Boffset%5D=0");
  });

  it("omits empty, null, and undefined values", () => {
    const url = buildKitsuUrl("/anime", {
      filter: { text: "naruto", empty: "", nil: null, undef: undefined },
      sort: undefined
    });
    expect(url).toBe("https://kitsu.io/api/edge/anime?filter%5Btext%5D=naruto");
  });
});
