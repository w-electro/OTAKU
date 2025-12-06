'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Download, ExternalLink, Lock } from 'lucide-react';
import { cn, formatDuration, formatFileSize, canAccessQuality } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Episode, Subscription } from '@/types';

interface EpisodeCardProps {
  episode: Episode;
  animeId: string;
  animeTitle: string;
  userSubscription?: Subscription | null;
  watchProgress?: number;
  language?: 'en' | 'ar';
  onPlay?: (episodeId: string, quality: string) => void;
  onDownload?: (episodeId: string, quality: string) => void;
  onExternalPlayer?: (episodeId: string, quality: string) => void;
}

export function EpisodeCard({
  episode,
  animeId,
  animeTitle,
  userSubscription,
  watchProgress = 0,
  language = 'en',
  onPlay,
  onDownload,
  onExternalPlayer,
}: EpisodeCardProps) {
  const userTier = userSubscription?.tier || undefined;
  const isSubscribed = !!userSubscription && userSubscription.status === 'ACTIVE';

  const title = language === 'ar' && episode.titleArabic
    ? episode.titleArabic
    : episode.title;

  // Calculate available qualities
  const availableQualities: { quality: string; fileSize?: number; canAccess: boolean }[] = [];

  if (episode.filePath1080p) {
    availableQualities.push({
      quality: '1080p',
      fileSize: episode.fileSize1080p ? Number(episode.fileSize1080p) : undefined,
      canAccess: canAccessQuality(userTier, '1080p'),
    });
  }
  if (episode.is4KEnhanced && episode.filePath4K) {
    availableQualities.push({
      quality: '4K',
      fileSize: episode.fileSize4K ? Number(episode.fileSize4K) : undefined,
      canAccess: canAccessQuality(userTier, '4K'),
    });
  }
  if (episode.is4K240 && episode.filePath4K240) {
    availableQualities.push({
      quality: '4K240',
      fileSize: episode.fileSize4K240 ? Number(episode.fileSize4K240) : undefined,
      canAccess: canAccessQuality(userTier, '4K240'),
    });
  }

  const progressPercent = episode.duration && watchProgress > 0
    ? Math.min((watchProgress / episode.duration) * 100, 100)
    : 0;

  return (
    <div className={cn(
      'group relative bg-gray-800/40 rounded-xl overflow-hidden hover:bg-gray-800/60 transition-all duration-300',
      language === 'ar' ? 'text-right' : ''
    )}>
      <div className={cn(
        'flex gap-4 p-4',
        language === 'ar' ? 'flex-row-reverse' : ''
      )}>
        {/* Thumbnail */}
        <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
          {episode.thumbnail ? (
            <Image
              src={episode.thumbnail}
              alt={`Episode ${episode.number}`}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">
                {episode.number}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Play Overlay */}
          {isSubscribed && availableQualities.some(q => q.canAccess) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onPlay?.(episode.id, availableQualities.find(q => q.canAccess)?.quality || '1080p')}
                className="p-3 bg-primary rounded-full hover:bg-primary/80 transition-colors"
              >
                <Play className="w-6 h-6 text-white fill-white" />
              </button>
            </div>
          )}

          {/* Lock Overlay */}
          {!isSubscribed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Episode Info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'flex items-start justify-between gap-2',
            language === 'ar' ? 'flex-row-reverse' : ''
          )}>
            <div>
              <h3 className="font-semibold text-white">
                {language === 'ar' ? 'الحلقة' : 'Episode'} {episode.number}
                {title && `: ${title}`}
              </h3>
              <div className={cn(
                'flex items-center gap-3 mt-1 text-sm text-gray-400',
                language === 'ar' ? 'flex-row-reverse' : ''
              )}>
                {episode.duration && (
                  <span>{formatDuration(episode.duration)}</span>
                )}
                {episode.airDate && (
                  <>
                    <span>•</span>
                    <span>
                      {new Date(episode.airDate).toLocaleDateString(
                        language === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quality Badges */}
            <div className={cn(
              'flex gap-1',
              language === 'ar' ? 'flex-row-reverse' : ''
            )}>
              {episode.is4K240 && (
                <Badge variant="4k240" size="sm">4K 240fps</Badge>
              )}
              {episode.is4KEnhanced && !episode.is4K240 && (
                <Badge variant="4k" size="sm">4K</Badge>
              )}
            </div>
          </div>

          {/* Synopsis */}
          {episode.synopsis && (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">
              {episode.synopsis}
            </p>
          )}

          {/* Action Buttons */}
          <div className={cn(
            'flex items-center gap-2 mt-4',
            language === 'ar' ? 'flex-row-reverse' : ''
          )}>
            {!isSubscribed ? (
              <Link href="/subscribe">
                <Button variant="primary" size="sm" leftIcon={<Lock className="w-4 h-4" />}>
                  {language === 'ar' ? 'اشترك للمشاهدة' : 'Subscribe to Watch'}
                </Button>
              </Link>
            ) : (
              <>
                {availableQualities.map(({ quality, fileSize, canAccess }) => (
                  <div key={quality} className={cn(
                    'flex items-center gap-1',
                    language === 'ar' ? 'flex-row-reverse' : ''
                  )}>
                    <Button
                      variant={canAccess ? 'secondary' : 'ghost'}
                      size="sm"
                      disabled={!canAccess}
                      onClick={() => canAccess && onPlay?.(episode.id, quality)}
                      leftIcon={canAccess ? <Play className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    >
                      {quality}
                    </Button>
                    {canAccess && onDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(episode.id, quality)}
                        title={fileSize ? formatFileSize(fileSize) : 'Download'}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {onExternalPlayer && availableQualities.some(q => q.canAccess) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExternalPlayer(episode.id, availableQualities.find(q => q.canAccess)?.quality || '1080p')}
                    title="Open in VLC"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Episode List
interface EpisodeListProps {
  episodes: Episode[];
  animeId: string;
  animeTitle: string;
  userSubscription?: Subscription | null;
  language?: 'en' | 'ar';
  onPlay?: (episodeId: string, quality: string) => void;
}

export function EpisodeList({
  episodes,
  animeId,
  animeTitle,
  userSubscription,
  language = 'en',
  onPlay,
}: EpisodeListProps) {
  return (
    <div className="space-y-3">
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          animeId={animeId}
          animeTitle={animeTitle}
          userSubscription={userSubscription}
          language={language}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}
