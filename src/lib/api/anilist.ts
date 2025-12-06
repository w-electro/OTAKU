import type { AniListAnime } from '@/types';

const ANILIST_API = 'https://graphql.anilist.co';

const animeQuery = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $genre: String, $season: MediaSeason, $seasonYear: Int, $status: MediaStatus, $format: MediaFormat) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(type: ANIME, sort: $sort, search: $search, genre: $genre, season: $season, seasonYear: $seasonYear, status: $status, format: $format, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      coverImage {
        extraLarge
        large
        medium
      }
      bannerImage
      status
      format
      season
      seasonYear
      episodes
      duration
      averageScore
      popularity
      trending
      isAdult
      source
      countryOfOrigin
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      trailer {
        id
        site
      }
      genres
      studios {
        nodes {
          id
          name
          isAnimationStudio
        }
      }
    }
  }
}
`;

const singleAnimeQuery = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      large
      medium
    }
    bannerImage
    status
    format
    season
    seasonYear
    episodes
    duration
    averageScore
    popularity
    trending
    isAdult
    source
    countryOfOrigin
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    nextAiringEpisode {
      airingAt
      episode
    }
    trailer {
      id
      site
    }
    genres
    studios {
      nodes {
        id
        name
        isAnimationStudio
      }
    }
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
    relations {
      edges {
        relationType
        node {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          format
          status
        }
      }
    }
    recommendations(sort: RATING_DESC, perPage: 10) {
      nodes {
        mediaRecommendation {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
        }
      }
    }
  }
}
`;

export interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AniListResponse {
  Page: {
    pageInfo: AniListPageInfo;
    media: AniListAnime[];
  };
}

export interface AniListSingleResponse {
  Media: AniListAnime & {
    streamingEpisodes?: Array<{
      title: string;
      thumbnail: string;
      url: string;
      site: string;
    }>;
    relations?: {
      edges: Array<{
        relationType: string;
        node: {
          id: number;
          title: { romaji: string; english?: string };
          coverImage: { large: string };
          format: string;
          status: string;
        };
      }>;
    };
    recommendations?: {
      nodes: Array<{
        mediaRecommendation: {
          id: number;
          title: { romaji: string; english?: string };
          coverImage: { large: string };
          averageScore: number;
        };
      }>;
    };
  };
}

type MediaSort = 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'START_DATE_DESC' | 'UPDATED_AT_DESC';
type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
type MediaStatus = 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';

export interface FetchAnimeOptions {
  page?: number;
  perPage?: number;
  sort?: MediaSort[];
  search?: string;
  genre?: string;
  season?: MediaSeason;
  seasonYear?: number;
  status?: MediaStatus;
  format?: MediaFormat;
}

async function fetchFromAniList<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'AniList API error');
  }

  return json.data;
}

export async function fetchAnimeList(options: FetchAnimeOptions = {}): Promise<AniListResponse> {
  const {
    page = 1,
    perPage = 20,
    sort = ['TRENDING_DESC'],
    search,
    genre,
    season,
    seasonYear,
    status,
    format,
  } = options;

  return fetchFromAniList<AniListResponse>(animeQuery, {
    page,
    perPage,
    sort,
    search,
    genre,
    season,
    seasonYear,
    status,
    format,
  });
}

export async function fetchTrendingAnime(perPage = 20): Promise<AniListAnime[]> {
  const response = await fetchAnimeList({
    page: 1,
    perPage,
    sort: ['TRENDING_DESC'],
  });
  return response.Page.media;
}

export async function fetchPopularAnime(perPage = 20): Promise<AniListAnime[]> {
  const response = await fetchAnimeList({
    page: 1,
    perPage,
    sort: ['POPULARITY_DESC'],
  });
  return response.Page.media;
}

export async function fetchTopRatedAnime(perPage = 20): Promise<AniListAnime[]> {
  const response = await fetchAnimeList({
    page: 1,
    perPage,
    sort: ['SCORE_DESC'],
  });
  return response.Page.media;
}

export async function fetchCurrentSeasonAnime(perPage = 20): Promise<AniListAnime[]> {
  const now = new Date();
  const month = now.getMonth();
  let season: MediaSeason;

  if (month >= 0 && month <= 2) season = 'WINTER';
  else if (month >= 3 && month <= 5) season = 'SPRING';
  else if (month >= 6 && month <= 8) season = 'SUMMER';
  else season = 'FALL';

  const response = await fetchAnimeList({
    page: 1,
    perPage,
    sort: ['POPULARITY_DESC'],
    season,
    seasonYear: now.getFullYear(),
  });
  return response.Page.media;
}

export async function fetchAnimeById(id: number): Promise<AniListSingleResponse['Media']> {
  const response = await fetchFromAniList<AniListSingleResponse>(singleAnimeQuery, { id });
  return response.Media;
}

export async function searchAnime(
  query: string,
  page = 1,
  perPage = 20
): Promise<AniListResponse> {
  return fetchAnimeList({
    page,
    perPage,
    search: query,
    sort: ['POPULARITY_DESC'],
  });
}

export async function fetchAnimeByGenre(
  genre: string,
  page = 1,
  perPage = 20
): Promise<AniListResponse> {
  return fetchAnimeList({
    page,
    perPage,
    genre,
    sort: ['POPULARITY_DESC'],
  });
}

// Function to fetch all popular anime with pagination (for initial seeding)
export async function fetchAllTrendingAnime(maxPages = 5): Promise<AniListAnime[]> {
  const allAnime: AniListAnime[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const response = await fetchAnimeList({
      page,
      perPage: 50,
      sort: ['TRENDING_DESC'],
    });

    allAnime.push(...response.Page.media);

    if (!response.Page.pageInfo.hasNextPage) break;

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return allAnime;
}
