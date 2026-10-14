import "./setup";
import { describe, it, expect, beforeEach } from "bun:test";
import { userLibrary, getStatusMeta } from "../../src/lib/stores/library.svelte";
import type { AnimeItem } from "../../src/lib/types/anime";

const mockAnime: AnimeItem = {
  id: "1",
  title: "Cowboy Bebop",
  poster: "https://media.kitsu.app/large.jpg",
  type: "TV",
  year: 1998,
  score: 8.3,
  genres: ["Action", "Sci-Fi"]
};

describe("UserLibrary Store", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear userLibrary entries
    userLibrary.removeEntry("1", true);
    userLibrary.removeEntry("2", true);
  });

  describe("Favorites management", () => {
    it("toggles favorite status from false to true and back", () => {
      expect(userLibrary.isFavorite("1")).toBe(false);

      const isFavNow = userLibrary.toggleFavorite(mockAnime, true);
      expect(isFavNow).toBe(true);
      expect(userLibrary.isFavorite("1")).toBe(true);

      const isFavRemoved = userLibrary.toggleFavorite(mockAnime, true);
      expect(isFavRemoved).toBe(false);
      expect(userLibrary.isFavorite("1")).toBe(false);
    });

    it("persists favorites across storage save and load", () => {
      userLibrary.toggleFavorite(mockAnime, true);
      const raw = localStorage.getItem("animori_user_library");
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe("1");
      expect(parsed[0].isFavorite).toBe(true);
    });
  });

  describe("Watchlist management", () => {
    it("sets watch status and transitions between statuses", () => {
      expect(userLibrary.getWatchStatus("1")).toBeNull();

      userLibrary.setWatchStatus(mockAnime, "watching", true);
      expect(userLibrary.getWatchStatus("1")).toBe("watching");

      userLibrary.setWatchStatus(mockAnime, "completed", true);
      expect(userLibrary.getWatchStatus("1")).toBe("completed");

      userLibrary.setWatchStatus(mockAnime, null, true);
      expect(userLibrary.getWatchStatus("1")).toBeNull();
    });

    it("returns correct metadata for watch statuses", () => {
      expect(getStatusMeta("watching")?.label).toBe("Watching");
      expect(getStatusMeta("completed")?.label).toBe("Completed");
      expect(getStatusMeta("plan_to_watch")?.label).toBe("Plan to Watch");
      expect(getStatusMeta("on_hold")?.label).toBe("On Hold");
      expect(getStatusMeta("dropped")?.label).toBe("Dropped");
    });
  });

  describe("Entry removal", () => {
    it("completely removes an entry from both favorites and watchlist", () => {
      userLibrary.toggleFavorite(mockAnime, true);
      userLibrary.setWatchStatus(mockAnime, "watching", true);
      expect(userLibrary.isFavorite("1")).toBe(true);
      expect(userLibrary.getWatchStatus("1")).toBe("watching");

      userLibrary.removeEntry("1", true);
      expect(userLibrary.isFavorite("1")).toBe(false);
      expect(userLibrary.getWatchStatus("1")).toBeNull();
    });
  });
});
