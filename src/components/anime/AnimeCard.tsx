'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Play, Plus, Check } from 'lucide-react';
import { cn, getAnimeTitle, truncateText } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useWatchlistStore } from '@/lib/store';
import type { Anime } from '@/types';

interface AnimeCardProps {
  anime: Anime;
  showRating?: boolean;
  showStatus?: boolean;
  size?: 'small' | 'medium' | 'large';
  language?: 'en' | 'ar';
  priority?: boolean;
}

export function AnimeCard({
  anime,
  showRating = true,
  showStatus = false,
  size = 'medium',
  language = 'en',
  priority = false,
}: AnimeCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(anime.id);

  const sizes = {
    small: 'w-32',
    medium: 'w-44',
    large: 'w-56',
  };

  const title = getAnimeTitle(anime, language);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime.id);
    }
  };

  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn(
        'group relative block',
        sizes[size]
      )}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800">
        {/* Cover Image */}
        {anime.coverImage ? (
          <Image
            src={anime.coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes={size === 'large' ? '224px' : size === 'medium' ? '176px' : '128px'}
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        {showRating && anime.averageScore && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="bg-black/60 backdrop-blur-sm">
              <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
              {(anime.averageScore / 10).toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Status Badge */}
        {showStatus && anime.status === 'RELEASING' && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" size="sm">
              Airing
            </Badge>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="p-3 bg-primary rounded-full hover:bg-primary/80 transition-colors"
            aria-label="Play"
          >
            <Play className="w-5 h-5 text-white fill-white" />
          </button>
          <button
            onClick={handleWatchlistClick}
            className={cn(
              'p-3 rounded-full transition-colors',
              inWatchlist
                ? 'bg-accent hover:bg-accent/80'
                : 'bg-gray-700/80 hover:bg-gray-600'
            )}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <Plus className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Title & Info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400">
          {anime.format} • {anime.seasonYear || 'TBA'}
          {anime.episodeCount && ` • ${anime.episodeCount} eps`}
        </p>
      </div>
    </Link>
  );
}

// Horizontal Card Variant
interface AnimeCardHorizontalProps extends AnimeCardProps {
  showDescription?: boolean;
}

export function AnimeCardHorizontal({
  anime,
  showRating = true,
  showDescription = true,
  language = 'en',
}: AnimeCardHorizontalProps) {
  const title = getAnimeTitle(anime, language);
  const description = language === 'ar' && anime.synopsisArabic
    ? anime.synopsisArabic
    : anime.synopsis;

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group flex gap-4 p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-colors"
    >
      {/* Cover */}
      <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
        {anime.coverImage ? (
          <Image
            src={anime.coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-700" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
          <span>{anime.format}</span>
          <span>•</span>
          <span>{anime.seasonYear}</span>
          {showRating && anime.averageScore && (
            <>
              <span>•</span>
              <span className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
                {(anime.averageScore / 10).toFixed(1)}
              </span>
            </>
          )}
        </div>
        {showDescription && description && (
          <p className="mt-2 text-sm text-gray-400 line-clamp-2">
            {truncateText(description, 150)}
          </p>
        )}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {anime.genres.slice(0, 3).map((genre) => (
              <Badge key={genre.id} variant="default" size="sm">
                {language === 'ar' && genre.nameArabic ? genre.nameArabic : genre.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
