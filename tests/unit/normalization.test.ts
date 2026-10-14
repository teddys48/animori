import { describe, it, expect } from "bun:test";
import {
  resolveScore,
  resolveYear,
  resolvePoster,
  resolveBanner,
  formatRelationshipRole,
  formatLocale,
  mapKitsuAnime,
  FALLBACK_POSTER
} from "../../src/lib/api/anime";
import type { KitsuAnimeResource } from "../../src/lib/api/types";

describe("Anime Normalization Utilities", () => {
  describe("resolveScore", () => {
    it("converts 0-100 string percentage to 0-10 MAL style score", () => {
      expect(resolveScore("82.5")).toEqual({ score: 8.3, scoreRaw: "82.5%" });
      expect(resolveScore("93.45")).toEqual({ score: 9.3, scoreRaw: "93.45%" });
      expect(resolveScore("100")).toEqual({ score: 10, scoreRaw: "100%" });
    });

    it("returns null for null, empty or invalid scores", () => {
      expect(resolveScore(null)).toEqual({ score: null, scoreRaw: null });
      expect(resolveScore("")).toEqual({ score: null, scoreRaw: null });
      expect(resolveScore("-5")).toEqual({ score: null, scoreRaw: null });
      expect(resolveScore("invalid")).toEqual({ score: null, scoreRaw: null });
    });
  });

  describe("resolveYear", () => {
    it("extracts 4-digit year from ISO date string", () => {
      expect(resolveYear({ startDate: "1998-04-03" })).toBe(1998);
      expect(resolveYear({ startDate: "2024-01-01" })).toBe(2024);
    });

    it("returns null when startDate is missing or invalid", () => {
      expect(resolveYear({})).toBeNull();
      expect(resolveYear({ startDate: null })).toBeNull();
      expect(resolveYear({ startDate: "" })).toBeNull();
    });
  });

  describe("resolvePoster", () => {
    it("prefers large > medium > small > original > tiny", () => {
      expect(
        resolvePoster({
          posterImage: {
            large: "large.jpg",
            medium: "medium.jpg",
            small: "small.jpg"
          }
        })
      ).toBe("large.jpg");

      expect(
        resolvePoster({
          posterImage: {
            medium: "medium.jpg",
            small: "small.jpg"
          }
        })
      ).toBe("medium.jpg");
    });

    it("returns FALLBACK_POSTER when posterImage is missing or empty", () => {
      expect(resolvePoster({})).toBe(FALLBACK_POSTER);
      expect(resolvePoster({ posterImage: null })).toBe(FALLBACK_POSTER);
    });
  });

  describe("formatRelationshipRole", () => {
    it("formats known relationship roles", () => {
      expect(formatRelationshipRole("sequel")).toBe("Sequel");
      expect(formatRelationshipRole("prequel")).toBe("Prequel");
      expect(formatRelationshipRole("side_story")).toBe("Side Story");
      expect(formatRelationshipRole("alternative_version")).toBe("Alternative Version");
    });

    it("defaults to Related when raw is missing", () => {
      expect(formatRelationshipRole(null)).toBe("Related");
      expect(formatRelationshipRole("")).toBe("Related");
    });
  });

  describe("formatLocale", () => {
    it("formats known locales", () => {
      expect(formatLocale("ja_jp")).toBe("Japanese");
      expect(formatLocale("ja")).toBe("Japanese");
      expect(formatLocale("en")).toBe("English");
      expect(formatLocale("en_us")).toBe("English");
    });

    it("handles unknown or missing locales", () => {
      expect(formatLocale(null)).toBe("Unknown");
      expect(formatLocale("xyz")).toBe("XYZ");
    });
  });

  describe("mapKitsuAnime", () => {
    it("maps raw JSON:API resource to clean AnimeItem", () => {
      const resource: KitsuAnimeResource = {
        id: "1",
        type: "anime",
        attributes: {
          canonicalTitle: "Cowboy Bebop",
          titles: { en: "Cowboy Bebop", ja_jp: "カウボーイビバップ" },
          synopsis: "In the year 2071...",
          averageRating: "82.5",
          startDate: "1998-04-03",
          endDate: "1999-04-24",
          subtype: "TV",
          status: "finished",
          episodeCount: 26,
          posterImage: {
            large: "https://media.kitsu.app/large.jpg"
          }
        }
      };

      const mapped = mapKitsuAnime(resource);
      expect(mapped.id).toBe("1");
      expect(mapped.title).toBe("Cowboy Bebop");
      expect(mapped.titleJapanese).toBe("カウボーイビバップ");
      expect(mapped.type).toBe("TV");
      expect(mapped.status).toBe("Finished Airing");
      expect(mapped.episodes).toBe(26);
      expect(mapped.year).toBe(1998);
      expect(mapped.score).toBe(8.3);
      expect(mapped.poster).toBe("https://media.kitsu.app/large.jpg");
    });
  });
});
