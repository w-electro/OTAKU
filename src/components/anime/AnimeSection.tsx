'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimeCard } from './AnimeCard';
import { AnimeCardSkeleton } from '@/components/ui/Skeleton';
import type { Anime } from '@/types';

interface AnimeSectionProps {
  title: string;
  titleArabic?: string;
  animeList: Anime[];
  seeAllHref?: string;
  language?: 'en' | 'ar';
  isLoading?: boolean;
  cardsPerRow?: number;
}

export function AnimeSection({
  title,
  titleArabic,
  animeList,
  seeAllHref,
  language = 'en',
  isLoading = false,
  cardsPerRow = 6,
}: AnimeSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const displayTitle = language === 'ar' && titleArabic ? titleArabic : title;

  return (
    <section className="py-8">
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between mb-6 px-6',
        language === 'ar' ? 'flex-row-reverse' : ''
      )}>
        <h2 className="text-2xl font-bold text-white">{displayTitle}</h2>
        <div className={cn(
          'flex items-center gap-2',
          language === 'ar' ? 'flex-row-reverse' : ''
        )}>
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              {language === 'ar' ? 'عرض الكل' : 'See All'}
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-4',
          language === 'ar' ? 'flex-row-reverse' : ''
        )}
        style={{
          scrollSnapType: 'x mandatory',
        }}
      >
        {isLoading
          ? Array.from({ length: cardsPerRow }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44" style={{ scrollSnapAlign: 'start' }}>
                <AnimeCardSkeleton />
              </div>
            ))
          : animeList.map((anime, index) => (
              <div
                key={anime.id}
                className="flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <AnimeCard
                  anime={anime}
                  language={language}
                  priority={index < 4}
                />
              </div>
            ))}
      </div>
    </section>
  );
}

// Grid variant for browse/search pages
interface AnimeGridProps {
  animeList: Anime[];
  language?: 'en' | 'ar';
  isLoading?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function AnimeGrid({
  animeList,
  language = 'en',
  isLoading = false,
  columns = { sm: 2, md: 4, lg: 5, xl: 6 },
}: AnimeGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        `grid-cols-${columns.sm}`,
        `md:grid-cols-${columns.md}`,
        `lg:grid-cols-${columns.lg}`,
        `xl:grid-cols-${columns.xl}`
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
      }}
    >
      {isLoading
        ? Array.from({ length: 12 }).map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))
        : animeList.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              language={language}
            />
          ))}
    </div>
  );
}
