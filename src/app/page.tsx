import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/anime/HeroSlider';
import { AnimeSection } from '@/components/anime/AnimeSection';
import { HeroSkeleton, AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { fetchTrendingAnime, fetchPopularAnime, fetchCurrentSeasonAnime, fetchTopRatedAnime } from '@/lib/api/anilist';
import { auth } from '@/lib/auth';
import type { Anime, AniListAnime } from '@/types';

// Transform AniList anime to our Anime type
function transformAnime(anilistAnime: AniListAnime): Anime {
  return {
    id: anilistAnime.id.toString(),
    anilistId: anilistAnime.id,
    malId: anilistAnime.idMal ?? undefined,
    titleEnglish: anilistAnime.title.english ?? undefined,
    titleRomaji: anilistAnime.title.romaji,
    titleNative: anilistAnime.title.native ?? undefined,
    synopsis: anilistAnime.description ?? undefined,
    coverImage: anilistAnime.coverImage.extraLarge || anilistAnime.coverImage.large || undefined,
    bannerImage: anilistAnime.bannerImage ?? undefined,
    status: anilistAnime.status as Anime['status'],
    format: anilistAnime.format as Anime['format'],
    season: anilistAnime.season as Anime['season'] | undefined,
    seasonYear: anilistAnime.seasonYear ?? undefined,
    episodeCount: anilistAnime.episodes ?? undefined,
    duration: anilistAnime.duration ?? undefined,
    averageScore: anilistAnime.averageScore ?? undefined,
    popularity: anilistAnime.popularity ?? undefined,
    trending: anilistAnime.trending ?? undefined,
    isAdult: anilistAnime.isAdult,
    source: anilistAnime.source ?? undefined,
    countryOfOrigin: anilistAnime.countryOfOrigin ?? undefined,
    trailerUrl: anilistAnime.trailer?.site === 'youtube'
      ? `https://www.youtube.com/watch?v=${anilistAnime.trailer.id}`
      : undefined,
    genres: anilistAnime.genres.map((name, index) => ({
      id: `${anilistAnime.id}-${index}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    })),
    studios: anilistAnime.studios.nodes.map((studio) => ({
      id: studio.id.toString(),
      name: studio.name,
      isMain: studio.isAnimationStudio,
    })),
  };
}

async function getHomePageData() {
  try {
    const [trending, popular, currentSeason, topRated] = await Promise.all([
      fetchTrendingAnime(10),
      fetchPopularAnime(12),
      fetchCurrentSeasonAnime(12),
      fetchTopRatedAnime(12),
    ]);

    return {
      heroAnime: trending.slice(0, 5).map(transformAnime),
      trending: trending.map(transformAnime),
      popular: popular.map(transformAnime),
      currentSeason: currentSeason.map(transformAnime),
      topRated: topRated.map(transformAnime),
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      heroAnime: [],
      trending: [],
      popular: [],
      currentSeason: [],
      topRated: [],
    };
  }
}

function LoadingSection() {
  return (
    <section className="py-8">
      <div className="px-6 mb-6">
        <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-44">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const session = await auth();
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={session?.user} />

      <main>
        {/* Hero Section */}
        <Suspense fallback={<HeroSkeleton />}>
          {data.heroAnime.length > 0 ? (
            <HeroSlider animeList={data.heroAnime} />
          ) : (
            <div className="h-[70vh] flex items-center justify-center">
              <p className="text-gray-400">Unable to load featured anime</p>
            </div>
          )}
        </Suspense>

        {/* Content Sections */}
        <div className="relative z-10 -mt-20 bg-gradient-to-b from-transparent via-gray-900 to-gray-900 pt-20">
          {/* Trending Now */}
          <Suspense fallback={<LoadingSection />}>
            <AnimeSection
              title="Trending Now"
              titleArabic="الرائج الآن"
              animeList={data.trending}
              seeAllHref="/browse?sort=trending"
            />
          </Suspense>

          {/* This Season */}
          <Suspense fallback={<LoadingSection />}>
            <AnimeSection
              title="This Season"
              titleArabic="هذا الموسم"
              animeList={data.currentSeason}
              seeAllHref="/browse?season=current"
            />
          </Suspense>

          {/* Popular */}
          <Suspense fallback={<LoadingSection />}>
            <AnimeSection
              title="Most Popular"
              titleArabic="الأكثر شعبية"
              animeList={data.popular}
              seeAllHref="/browse?sort=popular"
            />
          </Suspense>

          {/* Top Rated */}
          <Suspense fallback={<LoadingSection />}>
            <AnimeSection
              title="Top Rated"
              titleArabic="الأعلى تقييماً"
              animeList={data.topRated}
              seeAllHref="/browse?sort=score"
            />
          </Suspense>

          {/* 4K Enhanced Section Promo */}
          <section className="py-16 px-6">
            <div className="container mx-auto">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20 p-8 md:p-12">
                <div className="absolute inset-0 bg-[url('/images/4k-pattern.png')] opacity-10" />
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold mb-4">
                    4K 240fps
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Experience Anime Like Never Before
                  </h2>
                  <p className="text-gray-300 text-lg mb-6">
                    Upgrade to our premium plans to access exclusive 4K enhanced content with
                    ultra-smooth 240fps playback. See every frame in stunning detail.
                  </p>
                  <a
                    href="/subscribe"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Explore Premium
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
