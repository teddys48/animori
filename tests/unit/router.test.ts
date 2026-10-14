import "./setup";
import { describe, it, expect } from "bun:test";
import { parsePage, buildHref } from "../../src/lib/router/router.svelte";

describe("Router utilities", () => {
  describe("parsePage", () => {
    it("returns 1 for null, undefined, or empty string", () => {
      expect(parsePage(null)).toBe(1);
      expect(parsePage("")).toBe(1);
    });

    it("returns 1 for invalid non-numeric strings", () => {
      expect(parsePage("abc")).toBe(1);
      expect(parsePage("NaN")).toBe(1);
      expect(parsePage("1.5")).toBe(1);
    });

    it("returns 1 for numbers less than 1", () => {
      expect(parsePage("0")).toBe(1);
      expect(parsePage("-5")).toBe(1);
    });

    it("parses valid positive integers correctly", () => {
      expect(parsePage("1")).toBe(1);
      expect(parsePage("2")).toBe(2);
      expect(parsePage("42")).toBe(42);
    });
  });

  describe("buildHref", () => {
    it("returns plain path when params are empty", () => {
      expect(buildHref("/anime", {})).toBe("/anime");
    });

    it("serializes single query parameter", () => {
      expect(buildHref("/anime", { q: "naruto" })).toBe("/anime?q=naruto");
    });

    it("serializes multiple query parameters", () => {
      const url = buildHref("/anime", { q: "naruto", page: 2, sort: "rating" });
      expect(url).toContain("q=naruto");
      expect(url).toContain("page=2");
      expect(url).toContain("sort=rating");
    });

    it("omits null, undefined, and empty string parameters", () => {
      const url = buildHref("/anime", {
        q: "frieren",
        type: null,
        status: undefined,
        category: "",
        page: 1
      });
      expect(url).toBe("/anime?q=frieren&page=1");
    });
  });
});
