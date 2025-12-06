import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Clock, Film, Play, Plus, Share2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimeSection } from '@/components/anime/AnimeSection';
import { EpisodeList } from '@/components/anime/EpisodeCard';
import { fetchAnimeById } from '@/lib/api/anilist';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAnimeTitle, truncateText, getStatusName, getSeasonName } from '@/lib/utils';
import type { Anime, Episode } from '@/types';

interface AnimePageProps {
  params: Promise<{ id: string }>;
}

async function getAnimeData(anilistId: number) {
  try {
    const anilistData = await fetchAnimeById(anilistId);

    if (!anilistData) {
      return null;
    }

    // Try to get local data with episodes
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

    // Transform AniList data
    const anime: Anime = {
      id: localAnime?.id || anilistData.id.toString(),
      anilistId: anilistData.id,
      malId: anilistData.idMal ?? undefined,
      titleEnglish: anilistData.title.english ?? undefined,
      titleRomaji: anilistData.title.romaji,
      titleNative: anilistData.title.native ?? undefined,
      synopsis: anilistData.description ?? undefined,
      coverImage: anilistData.coverImage.extraLarge || anilistData.coverImage.large || undefined,
      bannerImage: anilistData.bannerImage ?? undefined,
      status: anilistData.status as Anime['status'],
      format: anilistData.format as Anime['format'],
      season: anilistData.season as Anime['season'] | undefined,
      seasonYear: anilistData.seasonYear ?? undefined,
      episodeCount: anilistData.episodes ?? undefined,
      duration: anilistData.duration ?? undefined,
      averageScore: anilistData.averageScore ?? undefined,
      popularity: anilistData.popularity ?? undefined,
      isAdult: anilistData.isAdult,
      source: anilistData.source ?? undefined,
      trailerUrl: anilistData.trailer?.site === 'youtube'
        ? `https://www.youtube.com/watch?v=${anilistData.trailer.id}`
        : undefined,
      genres: anilistData.genres.map((name, index) => ({
        id: `${anilistData.id}-${index}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      })),
      studios: anilistData.studios.nodes.map((studio) => ({
        id: studio.id.toString(),
        name: studio.name,
        isMain: studio.isAnimationStudio,
      })),
      episodes: localAnime?.episodes.map((ep) => ({
        id: ep.id,
        animeId: ep.animeId,
        number: ep.number,
        title: ep.title ?? undefined,
        synopsis: ep.synopsis ?? undefined,
        thumbnail: ep.thumbnail ?? undefined,
        duration: ep.duration ?? undefined,
        airDate: ep.airDate ?? undefined,
        is4KEnhanced: ep.is4KEnhanced,
        is4K240: ep.is4K240,
        filePath1080p: ep.filePath1080p ?? undefined,
        filePath4K: ep.filePath4K ?? undefined,
        filePath4K240: ep.filePath4K240 ?? undefined,
        fileSize1080p: ep.fileSize1080p ? Number(ep.fileSize1080p) : undefined,
        fileSize4K: ep.fileSize4K ? Number(ep.fileSize4K) : undefined,
        fileSize4K240: ep.fileSize4K240 ? Number(ep.fileSize4K240) : undefined,
      })) || [],
    };

    // Get recommendations
    const recommendations = anilistData.recommendations?.nodes
      .filter((node) => node.mediaRecommendation)
      .map((node) => ({
        id: node.mediaRecommendation.id.toString(),
        anilistId: node.mediaRecommendation.id,
        titleEnglish: node.mediaRecommendation.title.english ?? undefined,
        titleRomaji: node.mediaRecommendation.title.romaji,
        coverImage: node.mediaRecommendation.coverImage.large || undefined,
        averageScore: node.mediaRecommendation.averageScore,
        status: 'FINISHED' as const,
        format: 'TV' as const,
        isAdult: false,
      })) || [];

    return { anime, recommendations };
  } catch (error) {
    console.error('Error fetching anime:', error);
    return null;
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { id } = await params;
  const anilistId = parseInt(id, 10);

  if (isNaN(anilistId)) {
    notFound();
  }

  const session = await auth();
  const data = await getAnimeData(anilistId);

  if (!data) {
    notFound();
  }

  const { anime, recommendations } = data;
  const title = getAnimeTitle(anime, 'en');
  const mainStudio = anime.studios?.find((s) => s.isMain) || anime.studios?.[0];

  // Get user's subscription
  let userSubscription = null;
  if (session?.user?.id) {
    userSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={session?.user} />

      <main>
        {/* Banner Section */}
        <div className="relative h-[50vh] min-h-[400px]">
          {anime.bannerImage ? (
            <Image
              src={anime.bannerImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : anime.coverImage ? (
            <Image
              src={anime.coverImage}
              alt={title}
              fill
              className="object-cover blur-xl scale-110"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="relative -mt-48 z-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                <div className="relative w-48 md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                  {anime.coverImage ? (
                    <Image
                      src={anime.coverImage}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="gradient" className="flex-1" leftIcon={<Play className="w-5 h-5 fill-white" />}>
                    Watch
                  </Button>
                  <Button variant="outline" className="p-3">
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" className="p-3">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {title}
                </h1>
                {anime.titleNative && (
                  <p className="text-gray-400 text-lg mb-4">{anime.titleNative}</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {anime.averageScore && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {(anime.averageScore / 10).toFixed(1)}
                    </Badge>
                  )}
                  <Badge variant="default">{anime.format}</Badge>
                  <Badge variant={anime.status === 'RELEASING' ? 'success' : 'default'}>
                    {getStatusName(anime.status)}
                  </Badge>
                  {anime.episodes?.some((ep) => ep.is4K240) && (
                    <Badge variant="4k240">4K 240fps</Badge>
                  )}
                  {anime.episodes?.some((ep) => ep.is4KEnhanced) && !anime.episodes?.some((ep) => ep.is4K240) && (
                    <Badge variant="4k">4K Enhanced</Badge>
                  )}
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {anime.seasonYear && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {anime.season && getSeasonName(anime.season)} {anime.seasonYear}
                      </span>
                    </div>
                  )}
                  {anime.episodeCount && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Film className="w-4 h-4 text-gray-500" />
                      <span>{anime.episodeCount} Episodes</span>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{anime.duration} min/ep</span>
                    </div>
                  )}
                  {mainStudio && (
                    <div className="text-gray-300">
                      <span className="text-gray-500">Studio: </span>
                      {mainStudio.name}
                    </div>
                  )}
                </div>

                {/* Genres */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {anime.genres.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/browse?genre=${genre.slug}`}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Synopsis */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-3">Synopsis</h2>
                  <p
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: anime.synopsis
                        ? truncateText(anime.synopsis.replace(/<br\s*\/?>/g, ' '), 600)
                        : 'No synopsis available.',
                    }}
                  />
                </div>

                {/* Trailer */}
                {anime.trailerUrl && (
                  <div className="mb-8">
                    <a
                      href={anime.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      Watch Trailer
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Episodes Section */}
            {anime.episodes && anime.episodes.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Episodes ({anime.episodes.length})
                </h2>
                <EpisodeList
                  episodes={anime.episodes}
                  animeId={anime.id}
                  animeTitle={title}
                  userSubscription={userSubscription}
                />
              </section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-12">
                <AnimeSection
                  title="You May Also Like"
                  titleArabic="قد يعجبك أيضاً"
                  animeList={recommendations as Anime[]}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
