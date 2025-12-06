import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimeList, type FetchAnimeOptions } from '@/lib/api/anilist';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options: FetchAnimeOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      perPage: parseInt(searchParams.get('perPage') || '20'),
      search: searchParams.get('search') || undefined,
      genre: searchParams.get('genre') || undefined,
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
      data: response.Page.media,
      pageInfo: response.Page.pageInfo,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime data' },
      { status: 500 }
    );
  }
}
