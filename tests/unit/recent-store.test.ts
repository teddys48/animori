import "./setup";
import { describe, it, expect, beforeEach } from "bun:test";
import { recentStore } from "../../src/lib/stores/recent.svelte";
import type { AnimeItem } from "../../src/lib/types/anime";

const createAnime = (id: string, title: string): AnimeItem => ({
  id,
  title,
  poster: `https://media.kitsu.app/${id}.jpg`,
  type: "TV",
  year: 2024,
  score: 8.5,
  genres: []
});

describe("RecentStore (Recently Viewed Anime)", () => {
  beforeEach(() => {
    recentStore.clear();
  });

  it("records an anime view with most recent first", () => {
    recentStore.recordView(createAnime("1", "First Anime"));
    recentStore.recordView(createAnime("2", "Second Anime"));

    expect(recentStore.items.length).toBe(2);
    expect(recentStore.items[0].id).toBe("2");
    expect(recentStore.items[1].id).toBe("1");
  });

  it("revisiting an anime moves it to the front without duplicates", () => {
    recentStore.recordView(createAnime("1", "First"));
    recentStore.recordView(createAnime("2", "Second"));
    recentStore.recordView(createAnime("3", "Third"));
    expect(recentStore.items.map((i) => i.id)).toEqual(["3", "2", "1"]);

    // Re-visit First
    recentStore.recordView(createAnime("1", "First"));
    expect(recentStore.items.map((i) => i.id)).toEqual(["1", "3", "2"]);
    expect(recentStore.items.length).toBe(3);
  });

  it("enforces maximum limit of 16 recent items", () => {
    for (let i = 1; i <= 20; i++) {
      recentStore.recordView(createAnime(String(i), `Anime ${i}`));
    }
    expect(recentStore.items.length).toBe(16);
    // Most recent is item 20
    expect(recentStore.items[0].id).toBe("20");
    // Oldest retained is item 5 (items 1-4 were pruned)
    expect(recentStore.items[15].id).toBe("5");
  });

  it("clears all recent views cleanly", () => {
    recentStore.recordView(createAnime("1", "Anime 1"));
    expect(recentStore.items.length).toBe(1);

    recentStore.clear();
    expect(recentStore.items.length).toBe(0);
    expect(localStorage.getItem("animori_recent_views")).toBeNull();
  });
});
