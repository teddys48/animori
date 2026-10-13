import type { AnimeItem } from '../types/anime';

export const HERO_FEATURED_ANIME: AnimeItem = {
  id: 46474,
  title: "Frieren: Beyond Journey's End",
  titleJapanese: "葬送のフリーレン",
  poster: "https://media.kitsu.app/anime/poster_images/46474/large.jpg",
  banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80",
  type: "TV",
  episodes: 28,
  score: 9.3,
  scoredBy: 462100,
  rank: 1,
  popularity: 185,
  year: 2023,
  season: "Fall",
  status: "Finished Airing",
  synopsis: "The adventure is over but life goes on for an elf mage just beginning to learn what living is all about. Elf mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land. But Frieren will long outlive the rest of her former party...",
  genres: ["Adventure", "Drama", "Fantasy"],
  studios: ["Madhouse"],
  airingDate: "Sep 29, 2023 to Mar 22, 2024"
};

export const MOCK_POPULAR_ANIME: AnimeItem[] = [
  {
    id: 46474,
    title: "Frieren: Beyond Journey's End",
    poster: "https://media.kitsu.app/anime/poster_images/46474/medium.jpg",
    type: "TV",
    episodes: 28,
    score: 9.3,
    year: 2023,
    status: "Finished Airing",
    synopsis: "Elf mage Frieren journeys to understand human emotions after her party's victory over the Demon King.",
    genres: ["Adventure", "Fantasy"],
    studios: ["Madhouse"]
  },
  {
    id: 3936,
    title: "Fullmetal Alchemist: Brotherhood",
    poster: "https://media.kitsu.app/anime/poster_images/3936/medium.jpg",
    type: "TV",
    episodes: 64,
    score: 9.1,
    year: 2009,
    status: "Finished Airing",
    synopsis: "Two brothers search for a Philosopher's Stone after an attempt to revive their mother backfires.",
    genres: ["Action", "Adventure", "Fantasy"],
    studios: ["Bones"]
  },
  {
    id: 5618,
    title: "Steins;Gate",
    poster: "https://media.kitsu.app/anime/poster_images/5618/medium.jpg",
    type: "TV",
    episodes: 24,
    score: 9.1,
    year: 2011,
    status: "Finished Airing",
    synopsis: "An eccentric scientist invents a device capable of sending messages into the past, causing unforeseen consequences.",
    genres: ["Drama", "Sci-Fi", "Suspense"],
    studios: ["White Fox"]
  },
  {
    id: 6448,
    title: "Hunter x Hunter (2011)",
    poster: "https://media.kitsu.app/anime/poster_images/6448/medium.jpg",
    type: "TV",
    episodes: 148,
    score: 9.0,
    year: 2011,
    status: "Finished Airing",
    synopsis: "Gon Freecss aspires to become a Hunter in order to find his missing father who left him at a young age.",
    genres: ["Action", "Adventure", "Fantasy"],
    studios: ["Madhouse"]
  },
  {
    id: 7442,
    title: "Attack on Titan",
    poster: "https://media.kitsu.app/anime/poster_images/7442/medium.jpg",
    type: "TV",
    episodes: 25,
    score: 8.6,
    year: 2013,
    status: "Finished Airing",
    synopsis: "Humanity lives behind giant walls to protect themselves from man-eating Titans until a colossal Titan breaches the wall.",
    genres: ["Action", "Suspense"],
    studios: ["Wit Studio"]
  },
  {
    id: 1,
    title: "Cowboy Bebop",
    poster: "https://media.kitsu.app/anime/poster_images/1/medium.jpg",
    type: "TV",
    episodes: 26,
    score: 8.2,
    year: 1998,
    status: "Finished Airing",
    synopsis: "In 2071, bounty hunters travel through space on their spaceship, Bebop.",
    genres: ["Action", "Sci-Fi"],
    studios: ["Sunrise"]
  }
];

export const MOCK_AIRING_ANIME: AnimeItem[] = [
  {
    id: 12,
    title: "One Piece",
    poster: "https://media.kitsu.app/anime/poster_images/12/medium.jpg",
    type: "TV",
    score: 8.7,
    year: 1999,
    status: "Currently Airing",
    synopsis: "Monkey D. Luffy sets out to become the King of the Pirates.",
    genres: ["Action", "Adventure"],
    studios: ["Toei Animation"]
  },
  {
    id: 48439,
    title: "Solo Leveling",
    poster: "https://media.kitsu.app/anime/poster_images/1/medium.jpg",
    type: "TV",
    score: 8.4,
    year: 2024,
    status: "Currently Airing",
    synopsis: "Sung Jinwoo journeys through dungeons.",
    genres: ["Action", "Fantasy"],
    studios: ["A-1 Pictures"]
  },
  {
    id: 47432,
    title: "Jujutsu Kaisen",
    poster: "https://media.kitsu.app/anime/poster_images/7442/medium.jpg",
    type: "TV",
    score: 8.5,
    year: 2023,
    status: "Currently Airing",
    synopsis: "Yuji Itadori joins Tokyo Jujutsu High.",
    genres: ["Action", "Supernatural"],
    studios: ["MAPPA"]
  },
  {
    id: 42765,
    title: "Bleach: Thousand-Year Blood War",
    poster: "https://media.kitsu.app/anime/poster_images/6448/medium.jpg",
    type: "TV",
    score: 8.8,
    year: 2023,
    status: "Currently Airing",
    synopsis: "The conflict between Shinigami and Quincy.",
    genres: ["Action"],
    studios: ["Pierrot"]
  },
  {
    id: 47250,
    title: "Spy x Family",
    poster: "https://media.kitsu.app/anime/poster_images/5618/medium.jpg",
    type: "TV",
    score: 8.5,
    year: 2023,
    status: "Currently Airing",
    synopsis: "A spy, an assassin, and a telepath form a family.",
    genres: ["Comedy", "Action"],
    studios: ["Wit Studio"]
  },
  {
    id: 44081,
    title: "Chainsaw Man",
    poster: "https://media.kitsu.app/anime/poster_images/3936/medium.jpg",
    type: "TV",
    score: 8.4,
    year: 2022,
    status: "Currently Airing",
    synopsis: "Denji lives as a Devil Hunter.",
    genres: ["Action", "Supernatural"],
    studios: ["MAPPA"]
  }
];

export const MOCK_UPCOMING_ANIME: AnimeItem[] = [
  {
    id: 48671,
    title: "Chainsaw Man Movie: Reze-hen",
    poster: "https://media.kitsu.app/anime/poster_images/3936/medium.jpg",
    type: "Movie",
    score: 8.6,
    year: 2025,
    status: "Not yet aired",
    synopsis: "Upcoming movie adaptation.",
    genres: ["Action"],
    studios: ["MAPPA"]
  },
  {
    id: 48672,
    title: "Demon Slayer: Infinity Castle",
    poster: "https://media.kitsu.app/anime/poster_images/7442/medium.jpg",
    type: "Movie",
    score: 8.9,
    year: 2025,
    status: "Not yet aired",
    synopsis: "The final battle in the Infinity Castle.",
    genres: ["Action"],
    studios: ["ufotable"]
  },
  {
    id: 48673,
    title: "One Punch Man Season 3",
    poster: "https://media.kitsu.app/anime/poster_images/6448/medium.jpg",
    type: "TV",
    score: 8.5,
    year: 2025,
    status: "Not yet aired",
    synopsis: "Saitama returns for a third season.",
    genres: ["Action", "Comedy"],
    studios: ["J.C.Staff"]
  },
  {
    id: 48674,
    title: "My Hero Academia Final Season",
    poster: "https://media.kitsu.app/anime/poster_images/5618/medium.jpg",
    type: "TV",
    score: 8.3,
    year: 2025,
    status: "Not yet aired",
    synopsis: "The conclusion to the hero journey.",
    genres: ["Action"],
    studios: ["Bones"]
  },
  {
    id: 48675,
    title: "Jujutsu Kaisen: Culling Game",
    poster: "https://media.kitsu.app/anime/poster_images/1/medium.jpg",
    type: "TV",
    score: 8.8,
    year: 2026,
    status: "Not yet aired",
    synopsis: "Sorcerers participate in the deadly Culling Game.",
    genres: ["Action"],
    studios: ["MAPPA"]
  },
  {
    id: 48676,
    title: "Fire Force Season 3",
    poster: "https://media.kitsu.app/anime/poster_images/12/medium.jpg",
    type: "TV",
    score: 8.1,
    year: 2025,
    status: "Not yet aired",
    synopsis: "Special Fire Force Company 8 continues their investigation.",
    genres: ["Action"],
    studios: ["David Production"]
  }
];
