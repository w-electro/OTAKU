import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimeById } from '@/lib/api/anilist';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anilistId = parseInt(id, 10);

    if (isNaN(anilistId)) {
      return NextResponse.json(
        { error: 'Invalid anime ID' },
        { status: 400 }
      );
    }

    // Fetch from AniList
    const anilistData = await fetchAnimeById(anilistId);

    if (!anilistData) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    // Get local data with episodes
    const localAnime = await prisma.anime.findFirst({
      where: { anilistId },
      include: {
        episodes: {
          orderBy: { number: 'asc' },
        },
        genres: true,
        studios: true,
      },
    });

    return NextResponse.json({
      anilist: anilistData,
      local: localAnime,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime data' },
      { status: 500 }
    );
  }
}
