import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimeList, type FetchAnimeOptions } from '@/lib/api/anilist';
import { mockAnimeData, searchMockAnime, getMockAnimeByGenre } from '@/lib/mockData';
import type { Anime } from '@/types';

// Transform mock data to match AniList response format
function transformMockToResponse(animeList: Anime[], page: number = 1, perPage: number = 20) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedData = animeList.slice(start, end);

  return {
    anime: paginatedData,
    data: paginatedData.map(anime => ({
      id: anime.anilistId,
      title: {
        english: anime.titleEnglish,
        romaji: anime.titleRomaji,
        native: anime.titleNative,
      },
      coverImage: {
        large: anime.coverImage,
        extraLarge: anime.coverImage,
      },
      bannerImage: anime.bannerImage,
      status: anime.status,
      format: anime.format,
      season: anime.season,
      seasonYear: anime.seasonYear,
      episodes: anime.episodeCount,
      duration: anime.duration,
      averageScore: anime.averageScore,
      popularity: anime.popularity,
      genres: anime.genres?.map(g => g.name) || [],
      isAdult: anime.isAdult,
    })),
    pageInfo: {
      total: animeList.length,
      currentPage: page,
      lastPage: Math.ceil(animeList.length / perPage),
      hasNextPage: end < animeList.length,
      perPage,
    },
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const genre = searchParams.get('genre');

  try {
    const options: FetchAnimeOptions = {
      page,
      perPage,
      search: search || undefined,
      genre: genre || undefined,
    };

    const sort = searchParams.get('sort');
    if (sort) {
      switch (sort) {
        case 'trending':
          options.sort = ['TRENDING_DESC'];
          break;
        case 'popular':
          options.sort = ['POPULARITY_DESC'];
          break;
        case 'score':
          options.sort = ['SCORE_DESC'];
          break;
        case 'newest':
          options.sort = ['START_DATE_DESC'];
          break;
        default:
          options.sort = ['TRENDING_DESC'];
      }
    }

    const season = searchParams.get('season');
    if (season) {
      const now = new Date();
      const month = now.getMonth();

      if (season === 'current') {
        if (month >= 0 && month <= 2) options.season = 'WINTER';
        else if (month >= 3 && month <= 5) options.season = 'SPRING';
        else if (month >= 6 && month <= 8) options.season = 'SUMMER';
        else options.season = 'FALL';
        options.seasonYear = now.getFullYear();
      } else {
        options.season = season.toUpperCase() as FetchAnimeOptions['season'];
      }
    }

    const year = searchParams.get('year');
    if (year) {
      options.seasonYear = parseInt(year);
    }

    const status = searchParams.get('status');
    if (status) {
      options.status = status.toUpperCase() as FetchAnimeOptions['status'];
    }

    const format = searchParams.get('format');
    if (format) {
      options.format = format.toUpperCase() as FetchAnimeOptions['format'];
    }

    const response = await fetchAnimeList(options);

    return NextResponse.json({
      anime: response.Page.media.map((media: Record<string, unknown>) => ({
        id: String(media.id),
        anilistId: media.id,
        titleEnglish: (media.title as Record<string, unknown>)?.english,
        titleRomaji: (media.title as Record<string, unknown>)?.romaji,
        titleNative: (media.title as Record<string, unknown>)?.native,
        coverImage: (media.coverImage as Record<string, unknown>)?.extraLarge || (media.coverImage as Record<string, unknown>)?.large,
        bannerImage: media.bannerImage,
        status: media.status,
        format: media.format,
        season: media.season,
        seasonYear: media.seasonYear,
        episodeCount: media.episodes,
        duration: media.duration,
        averageScore: media.averageScore,
        popularity: media.popularity,
        isAdult: media.isAdult,
        genres: (media.genres as string[])?.map((name: string, idx: number) => ({
          id: `${media.id}-${idx}`,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        })),
      })),
      data: response.Page.media,
      pageInfo: response.Page.pageInfo,
    });
  } catch (error) {
    console.error('API Error, falling back to mock data:', error);

    // Fall back to mock data
    let animeList = [...mockAnimeData];

    // Apply search filter
    if (search) {
      animeList = searchMockAnime(search);
    }

    // Apply genre filter
    if (genre) {
      animeList = getMockAnimeByGenre(genre);
    }

    // Apply sort
    const sort = searchParams.get('sort');
    if (sort === 'score') {
      animeList.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    } else if (sort === 'popular') {
      animeList.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return NextResponse.json(transformMockToResponse(animeList, page, perPage));
  }
}
