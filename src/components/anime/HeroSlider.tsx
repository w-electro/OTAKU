'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn, getAnimeTitle, truncateText } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Anime } from '@/types';

interface HeroSliderProps {
  animeList: Anime[];
  autoPlay?: boolean;
  interval?: number;
  language?: 'en' | 'ar';
}

export function HeroSlider({
  animeList,
  autoPlay = true,
  interval = 5000,
  language = 'en',
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % animeList.length);
  }, [currentIndex, animeList.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + animeList.length) % animeList.length);
  }, [currentIndex, animeList.length, goToSlide]);

  useEffect(() => {
    if (!autoPlay || animeList.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, animeList.length]);

  if (!animeList.length) return null;

  const currentAnime = animeList[currentIndex];
  const title = getAnimeTitle(currentAnime, language);
  const description = language === 'ar' && currentAnime.synopsisArabic
    ? currentAnime.synopsisArabic
    : currentAnime.synopsis;

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] w-full overflow-hidden">
      {/* Background Images */}
      {animeList.map((anime, index) => (
        <div
          key={anime.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Banner Image */}
          {anime.bannerImage || anime.coverImage ? (
            <Image
              src={anime.bannerImage || anime.coverImage || ''}
              alt={getAnimeTitle(anime, language)}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-6 pb-20">
          <div className={cn(
            'max-w-2xl space-y-4 transition-all duration-500',
            language === 'ar' ? 'mr-auto text-right' : 'ml-0'
          )}>
            {/* Badges */}
            <div className={cn(
              'flex items-center gap-2',
              language === 'ar' ? 'flex-row-reverse' : ''
            )}>
              {currentAnime.status === 'RELEASING' && (
                <Badge variant="success">
                  {language === 'ar' ? 'يعرض حالياً' : 'Airing'}
                </Badge>
              )}
              <Badge variant="default">
                {currentAnime.format}
              </Badge>
              {currentAnime.averageScore && (
                <Badge variant="primary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {(currentAnime.averageScore / 10).toFixed(1)}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {title}
            </h1>

            {/* Meta Info */}
            <div className={cn(
              'flex items-center gap-4 text-gray-300',
              language === 'ar' ? 'flex-row-reverse' : ''
            )}>
              <span>{currentAnime.seasonYear}</span>
              {currentAnime.episodeCount && (
                <>
                  <span>•</span>
                  <span>{currentAnime.episodeCount} {language === 'ar' ? 'حلقة' : 'Episodes'}</span>
                </>
              )}
              {currentAnime.duration && (
                <>
                  <span>•</span>
                  <span>{currentAnime.duration} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                </>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-gray-300 text-lg line-clamp-3">
                {truncateText(description.replace(/<[^>]*>/g, ''), 200)}
              </p>
            )}

            {/* Genres */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className={cn(
                'flex flex-wrap gap-2',
                language === 'ar' ? 'flex-row-reverse' : ''
              )}>
                {currentAnime.genres.slice(0, 4).map((genre) => (
                  <Badge key={genre.id} variant="default" size="lg">
                    {language === 'ar' && genre.nameArabic ? genre.nameArabic : genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className={cn(
              'flex items-center gap-4 pt-4',
              language === 'ar' ? 'flex-row-reverse' : ''
            )}>
              <Link href={`/anime/${currentAnime.id}`}>
                <Button variant="gradient" size="lg" leftIcon={<Play className="w-5 h-5 fill-white" />}>
                  {language === 'ar' ? 'شاهد الآن' : 'Watch Now'}
                </Button>
              </Link>
              <Link href={`/anime/${currentAnime.id}`}>
                <Button variant="outline" size="lg" leftIcon={<Info className="w-5 h-5" />}>
                  {language === 'ar' ? 'المزيد' : 'More Info'}
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="p-3" aria-label="Add to watchlist">
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {animeList.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all',
              language === 'ar' ? 'right-4' : 'left-4'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 rounded-full transition-all',
              language === 'ar' ? 'left-4' : 'right-4'
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {animeList.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {animeList.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-gray-500 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
