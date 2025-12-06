// Jikan API (MyAnimeList unofficial API)
// https://docs.api.jikan.moe/

const JIKAN_API = 'https://api.jikan.moe/v4';

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  approved: boolean;
  titles: Array<{
    type: string;
    title: string;
  }>;
  title: string;
  title_english: string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  aired: {
    from: string;
    to: string;
    prop: {
      from: { day: number; month: number; year: number };
      to: { day: number; month: number; year: number };
    };
  };
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season: string;
  year: number;
  broadcast: {
    day: string;
    time: string;
    timezone: string;
    string: string;
  };
  producers: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  licensors: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  studios: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  explicit_genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  themes: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  demographics: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
}

export interface JikanEpisode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  title_romanji: string;
  aired: string;
  score: number;
  filler: boolean;
  recap: boolean;
  forum_url: string;
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}

// Rate limiting helper (Jikan has strict rate limits)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (response.status === 429) {
    // Rate limited - wait and retry
    await new Promise(resolve => setTimeout(resolve, 5000));
    return rateLimitedFetch(url);
  }

  return response;
}

export async function fetchAnimeById(malId: number): Promise<JikanAnime | null> {
  try {
    const response = await rateLimitedFetch(`${JIKAN_API}/anime/${malId}`);

    if (!response.ok) {
      console.error(`Jikan API error: ${response.status}`);
      return null;
    }

    const data: JikanResponse<JikanAnime> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching from Jikan:', error);
    return null;
  }
}

export async function fetchAnimeEpisodes(
  malId: number,
  page = 1
): Promise<{ episodes: JikanEpisode[]; pagination: JikanPagination | null }> {
  try {
    const response = await rateLimitedFetch(
      `${JIKAN_API}/anime/${malId}/episodes?page=${page}`
    );

    if (!response.ok) {
      console.error(`Jikan API error: ${response.status}`);
      return { episodes: [], pagination: null };
    }

    const data: JikanResponse<JikanEpisode[]> = await response.json();
    return {
      episodes: data.data,
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Error fetching episodes from Jikan:', error);
    return { episodes: [], pagination: null };
  }
}

export async function fetchAllAnimeEpisodes(malId: number): Promise<JikanEpisode[]> {
  const allEpisodes: JikanEpisode[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { episodes, pagination } = await fetchAnimeEpisodes(malId, page);
    allEpisodes.push(...episodes);

    hasNextPage = pagination?.has_next_page || false;
    page++;

    // Safety limit
    if (page > 100) break;
  }

  return allEpisodes;
}

export async function searchAnime(
  query: string,
  page = 1,
  limit = 25
): Promise<{ anime: JikanAnime[]; pagination: JikanPagination | null }> {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
    });

    const response = await rateLimitedFetch(`${JIKAN_API}/anime?${params}`);

    if (!response.ok) {
      console.error(`Jikan API error: ${response.status}`);
      return { anime: [], pagination: null };
    }

    const data: JikanResponse<JikanAnime[]> = await response.json();
    return {
      anime: data.data,
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Error searching anime from Jikan:', error);
    return { anime: [], pagination: null };
  }
}

export async function fetchTopAnime(
  filter: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' = 'bypopularity',
  page = 1,
  limit = 25
): Promise<{ anime: JikanAnime[]; pagination: JikanPagination | null }> {
  try {
    const params = new URLSearchParams({
      filter,
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
    });

    const response = await rateLimitedFetch(`${JIKAN_API}/top/anime?${params}`);

    if (!response.ok) {
      console.error(`Jikan API error: ${response.status}`);
      return { anime: [], pagination: null };
    }

    const data: JikanResponse<JikanAnime[]> = await response.json();
    return {
      anime: data.data,
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Error fetching top anime from Jikan:', error);
    return { anime: [], pagination: null };
  }
}

export async function fetchSeasonAnime(
  year: number,
  season: 'winter' | 'spring' | 'summer' | 'fall',
  page = 1,
  limit = 25
): Promise<{ anime: JikanAnime[]; pagination: JikanPagination | null }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
    });

    const response = await rateLimitedFetch(
      `${JIKAN_API}/seasons/${year}/${season}?${params}`
    );

    if (!response.ok) {
      console.error(`Jikan API error: ${response.status}`);
      return { anime: [], pagination: null };
    }

    const data: JikanResponse<JikanAnime[]> = await response.json();
    return {
      anime: data.data,
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Error fetching seasonal anime from Jikan:', error);
    return { anime: [], pagination: null };
  }
}

export async function fetchAnimeByGenre(
  genreId: number,
  page = 1,
  limit = 25
): Promise<{ anime: JikanAnime[]; pagination: JikanPagination | null }> {
  try {
    const params = new URLSearchParams({
      genres: genreId.toString(),
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
      order_by: 'popularity',
    });

    const response = await rateLimitedFetch(`${JIKAN_API}/anime?${params}`);

    if (!response.ok) {
      console.error(`Jikan API error: ${response.status}`);
      return { anime: [], pagination: null };
    }

    const data: JikanResponse<JikanAnime[]> = await response.json();
    return {
      anime: data.data,
      pagination: data.pagination || null,
    };
  } catch (error) {
    console.error('Error fetching anime by genre from Jikan:', error);
    return { anime: [], pagination: null };
  }
}

// Genre IDs from Jikan
export const JIKAN_GENRES = {
  Action: 1,
  Adventure: 2,
  Comedy: 4,
  Drama: 8,
  Fantasy: 10,
  Horror: 14,
  Mystery: 7,
  Romance: 22,
  SciFi: 24,
  SliceOfLife: 36,
  Sports: 30,
  Supernatural: 37,
  Thriller: 41,
  Shounen: 27,
  Seinen: 42,
  Isekai: 62,
  Mecha: 18,
} as const;
