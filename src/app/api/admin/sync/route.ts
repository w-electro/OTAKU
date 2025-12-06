import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fetchAllTrendingAnime, type AniListAnime } from '@/lib/api/anilist';
import { fetchAllAnimeEpisodes } from '@/lib/api/jikan';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { maxPages = 3 } = await request.json().catch(() => ({}));

    // Start sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        source: 'anilist',
        status: 'running',
        animeCount: 0,
        episodeCount: 0,
        startedAt: new Date(),
      },
    });

    try {
      // Fetch trending anime from AniList
      const animeList = await fetchAllTrendingAnime(maxPages);

      let animeCount = 0;
      let episodeCount = 0;
      const errors: string[] = [];

      for (const anilistAnime of animeList) {
        try {
          // Upsert anime
          const anime = await upsertAnime(anilistAnime);
          animeCount++;

          // Fetch episodes from Jikan if MAL ID exists
          if (anilistAnime.idMal) {
            const episodes = await fetchAllAnimeEpisodes(anilistAnime.idMal);

            for (const episode of episodes) {
              await prisma.episode.upsert({
                where: {
                  animeId_number: {
                    animeId: anime.id,
                    number: episode.mal_id,
                  },
                },
                update: {
                  title: episode.title || `Episode ${episode.mal_id}`,
                  airDate: episode.aired ? new Date(episode.aired) : null,
                },
                create: {
                  animeId: anime.id,
                  number: episode.mal_id,
                  title: episode.title || `Episode ${episode.mal_id}`,
                  airDate: episode.aired ? new Date(episode.aired) : null,
                },
              });
              episodeCount++;
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync ${anilistAnime.title.romaji}: ${message}`);
        }
      }

      // Update sync log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'completed',
          animeCount,
          episodeCount,
          errors: errors.length > 0 ? errors : null,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        animeCount,
        episodeCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      // Update sync log with error
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'failed',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          completedAt: new Date(),
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function upsertAnime(anilistAnime: AniListAnime) {
  // First, upsert genres
  const genreRecords = await Promise.all(
    anilistAnime.genres.map(async (genreName) => {
      const slug = genreName.toLowerCase().replace(/\s+/g, '-');
      return prisma.genre.upsert({
        where: { slug },
        update: {},
        create: {
          name: genreName,
          slug,
        },
      });
    })
  );

  // Upsert studios
  const studioRecords = await Promise.all(
    anilistAnime.studios.nodes.map(async (studio) => {
      return prisma.studio.upsert({
        where: { name: studio.name },
        update: { isMain: studio.isAnimationStudio },
        create: {
          name: studio.name,
          isMain: studio.isAnimationStudio,
        },
      });
    })
  );

  // Parse dates
  const startDate = anilistAnime.startDate?.year
    ? new Date(
        anilistAnime.startDate.year,
        (anilistAnime.startDate.month || 1) - 1,
        anilistAnime.startDate.day || 1
      )
    : null;

  const endDate = anilistAnime.endDate?.year
    ? new Date(
        anilistAnime.endDate.year,
        (anilistAnime.endDate.month || 1) - 1,
        anilistAnime.endDate.day || 1
      )
    : null;

  // Upsert anime
  const anime = await prisma.anime.upsert({
    where: { anilistId: anilistAnime.id },
    update: {
      malId: anilistAnime.idMal,
      titleEnglish: anilistAnime.title.english,
      titleRomaji: anilistAnime.title.romaji,
      titleNative: anilistAnime.title.native,
      synopsis: anilistAnime.description?.replace(/<[^>]*>/g, ''),
      coverImage: anilistAnime.coverImage.extraLarge || anilistAnime.coverImage.large,
      bannerImage: anilistAnime.bannerImage,
      status: anilistAnime.status as 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS',
      format: anilistAnime.format as 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC',
      season: anilistAnime.season as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null,
      seasonYear: anilistAnime.seasonYear,
      episodeCount: anilistAnime.episodes,
      duration: anilistAnime.duration,
      averageScore: anilistAnime.averageScore,
      popularity: anilistAnime.popularity,
      trending: anilistAnime.trending,
      isAdult: anilistAnime.isAdult,
      source: anilistAnime.source,
      countryOfOrigin: anilistAnime.countryOfOrigin,
      startDate,
      endDate,
      nextAiringAt: anilistAnime.nextAiringEpisode
        ? new Date(anilistAnime.nextAiringEpisode.airingAt * 1000)
        : null,
      trailerUrl: anilistAnime.trailer?.site === 'youtube'
        ? `https://www.youtube.com/watch?v=${anilistAnime.trailer.id}`
        : null,
      genres: {
        set: genreRecords.map((g) => ({ id: g.id })),
      },
      studios: {
        set: studioRecords.map((s) => ({ id: s.id })),
      },
    },
    create: {
      anilistId: anilistAnime.id,
      malId: anilistAnime.idMal,
      titleEnglish: anilistAnime.title.english,
      titleRomaji: anilistAnime.title.romaji,
      titleNative: anilistAnime.title.native,
      synopsis: anilistAnime.description?.replace(/<[^>]*>/g, ''),
      coverImage: anilistAnime.coverImage.extraLarge || anilistAnime.coverImage.large,
      bannerImage: anilistAnime.bannerImage,
      status: anilistAnime.status as 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS',
      format: anilistAnime.format as 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC',
      season: anilistAnime.season as 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null,
      seasonYear: anilistAnime.seasonYear,
      episodeCount: anilistAnime.episodes,
      duration: anilistAnime.duration,
      averageScore: anilistAnime.averageScore,
      popularity: anilistAnime.popularity,
      trending: anilistAnime.trending,
      isAdult: anilistAnime.isAdult,
      source: anilistAnime.source,
      countryOfOrigin: anilistAnime.countryOfOrigin,
      startDate,
      endDate,
      nextAiringAt: anilistAnime.nextAiringEpisode
        ? new Date(anilistAnime.nextAiringEpisode.airingAt * 1000)
        : null,
      trailerUrl: anilistAnime.trailer?.site === 'youtube'
        ? `https://www.youtube.com/watch?v=${anilistAnime.trailer.id}`
        : null,
      genres: {
        connect: genreRecords.map((g) => ({ id: g.id })),
      },
      studios: {
        connect: studioRecords.map((s) => ({ id: s.id })),
      },
    },
  });

  return anime;
}
