/**
 * Anime Sync Script
 *
 * This script fetches trending anime from AniList and syncs them to the database.
 * Run with: npx ts-node scripts/sync-anime.ts
 *
 * Options:
 * --max-pages <number>  Maximum number of pages to fetch (default: 5)
 * --with-episodes       Also fetch episodes from Jikan API
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ANILIST_API = 'https://graphql.anilist.co';
const JIKAN_API = 'https://api.jikan.moe/v4';

const animeQuery = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC], isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
        large
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

interface AniListMedia {
  id: number;
  idMal?: number;
  title: { romaji: string; english?: string; native?: string };
  description?: string;
  coverImage: { extraLarge?: string; large?: string };
  bannerImage?: string;
  status: string;
  format: string;
  season?: string;
  seasonYear?: number;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  trending?: number;
  isAdult: boolean;
  source?: string;
  countryOfOrigin?: string;
  startDate?: { year?: number; month?: number; day?: number };
  endDate?: { year?: number; month?: number; day?: number };
  genres: string[];
  studios: { nodes: Array<{ id: number; name: string; isAnimationStudio: boolean }> };
}

async function fetchAniListPage(page: number): Promise<{ media: AniListMedia[]; hasNextPage: boolean }> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: animeQuery,
      variables: { page, perPage: 50 },
    }),
  });

  const json = await response.json();
  return {
    media: json.data.Page.media,
    hasNextPage: json.data.Page.pageInfo.hasNextPage,
  };
}

async function fetchJikanEpisodes(malId: number): Promise<Array<{ mal_id: number; title?: string; aired?: string }>> {
  const episodes: Array<{ mal_id: number; title?: string; aired?: string }> = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= 10) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit

    const response = await fetch(`${JIKAN_API}/anime/${malId}/episodes?page=${page}`);
    if (!response.ok) break;

    const json = await response.json();
    episodes.push(...json.data);
    hasNextPage = json.pagination?.has_next_page || false;
    page++;
  }

  return episodes;
}

async function syncAnime(anime: AniListMedia, withEpisodes: boolean): Promise<void> {
  // Upsert genres
  const genreRecords = await Promise.all(
    anime.genres.map(async (name) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      return prisma.genre.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
    })
  );

  // Upsert studios
  const studioRecords = await Promise.all(
    anime.studios.nodes.map(async (studio) => {
      return prisma.studio.upsert({
        where: { name: studio.name },
        update: { isMain: studio.isAnimationStudio },
        create: { name: studio.name, isMain: studio.isAnimationStudio },
      });
    })
  );

  // Parse dates
  const startDate = anime.startDate?.year
    ? new Date(anime.startDate.year, (anime.startDate.month || 1) - 1, anime.startDate.day || 1)
    : null;
  const endDate = anime.endDate?.year
    ? new Date(anime.endDate.year, (anime.endDate.month || 1) - 1, anime.endDate.day || 1)
    : null;

  // Upsert anime
  const savedAnime = await prisma.anime.upsert({
    where: { anilistId: anime.id },
    update: {
      malId: anime.idMal,
      titleEnglish: anime.title.english,
      titleRomaji: anime.title.romaji,
      titleNative: anime.title.native,
      synopsis: anime.description?.replace(/<[^>]*>/g, ''),
      coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
      bannerImage: anime.bannerImage,
      status: anime.status as 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS',
      format: anime.format as 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC',
      season: anime.season as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null,
      seasonYear: anime.seasonYear,
      episodeCount: anime.episodes,
      duration: anime.duration,
      averageScore: anime.averageScore,
      popularity: anime.popularity,
      trending: anime.trending,
      isAdult: anime.isAdult,
      source: anime.source,
      countryOfOrigin: anime.countryOfOrigin,
      startDate,
      endDate,
      genres: { set: genreRecords.map((g) => ({ id: g.id })) },
      studios: { set: studioRecords.map((s) => ({ id: s.id })) },
    },
    create: {
      anilistId: anime.id,
      malId: anime.idMal,
      titleEnglish: anime.title.english,
      titleRomaji: anime.title.romaji,
      titleNative: anime.title.native,
      synopsis: anime.description?.replace(/<[^>]*>/g, ''),
      coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
      bannerImage: anime.bannerImage,
      status: anime.status as 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS',
      format: anime.format as 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC',
      season: anime.season as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null,
      seasonYear: anime.seasonYear,
      episodeCount: anime.episodes,
      duration: anime.duration,
      averageScore: anime.averageScore,
      popularity: anime.popularity,
      trending: anime.trending,
      isAdult: anime.isAdult,
      source: anime.source,
      countryOfOrigin: anime.countryOfOrigin,
      startDate,
      endDate,
      genres: { connect: genreRecords.map((g) => ({ id: g.id })) },
      studios: { connect: studioRecords.map((s) => ({ id: s.id })) },
    },
  });

  // Sync episodes if requested and MAL ID exists
  if (withEpisodes && anime.idMal) {
    const episodes = await fetchJikanEpisodes(anime.idMal);

    for (const episode of episodes) {
      await prisma.episode.upsert({
        where: {
          animeId_number: {
            animeId: savedAnime.id,
            number: episode.mal_id,
          },
        },
        update: {
          title: episode.title || `Episode ${episode.mal_id}`,
          airDate: episode.aired ? new Date(episode.aired) : null,
        },
        create: {
          animeId: savedAnime.id,
          number: episode.mal_id,
          title: episode.title || `Episode ${episode.mal_id}`,
          airDate: episode.aired ? new Date(episode.aired) : null,
        },
      });
    }

    console.log(`  Synced ${episodes.length} episodes`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const maxPagesArg = args.indexOf('--max-pages');
  const maxPages = maxPagesArg !== -1 ? parseInt(args[maxPagesArg + 1]) || 5 : 5;
  const withEpisodes = args.includes('--with-episodes');

  console.log(`Starting sync with maxPages=${maxPages}, withEpisodes=${withEpisodes}\n`);

  let totalAnime = 0;
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= maxPages) {
    console.log(`Fetching page ${page}...`);

    const { media, hasNextPage: nextPage } = await fetchAniListPage(page);
    hasNextPage = nextPage;

    for (const anime of media) {
      console.log(`Syncing: ${anime.title.romaji}`);
      await syncAnime(anime, withEpisodes);
      totalAnime++;
    }

    page++;

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\nSync complete! Total anime synced: ${totalAnime}`);
}

main()
  .catch((e) => {
    console.error('Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
