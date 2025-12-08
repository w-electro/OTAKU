'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings,
  SkipForward, SkipBack, ChevronLeft, ChevronRight,
  Download, ExternalLink, List, MessageSquare
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function WatchPage() {
  const params = useParams();
  const episodeId = params.episodeId as string;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1440); // 24 minutes in seconds
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Mock episode data
  const episode = {
    id: episodeId,
    title: 'The Beginning',
    number: 1,
    animeId: 1,
    animeTitle: 'Sample Anime',
    synopsis: 'The journey begins as our hero discovers their hidden powers...',
    thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg',
    duration: 24,
    airDate: '2024-01-15',
    nextEpisode: { id: '2', number: 2 },
    prevEpisode: null,
  };

  const qualities = ['4K 240fps', '4K', '1080p', '720p', '480p'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(percent * duration);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    if (showControls) {
      hideTimer = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(hideTimer);
  }, [showControls, isPlaying]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Compact Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/anime/${episode.animeId}`} className="flex items-center gap-2 text-white hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back to {episode.animeTitle}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="primary">Episode {episode.number}</Badge>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div
        className="relative flex-1 flex items-center justify-center bg-black cursor-pointer"
        onMouseMove={() => setShowControls(true)}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {/* Video Placeholder */}
        <div className="w-full h-full max-h-[80vh] bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-24 h-24 text-white/50 mx-auto mb-4" />
            <p className="text-gray-500">Video Player Placeholder</p>
            <p className="text-gray-600 text-sm mt-2">Episode {episode.number}: {episode.title}</p>
          </div>
        </div>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors animate-pulse"
              onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
            >
              <Play className="w-10 h-10 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="px-4 mb-4">
            <div
              className="h-1 bg-gray-700 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-primary rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-primary transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {/* Skip Backward */}
              <button className="text-white hover:text-primary transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button className="text-white hover:text-primary transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-primary transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-0 group-hover:w-20 transition-all duration-300 accent-primary"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Previous Episode */}
              {episode.prevEpisode && (
                <Link href={`/watch/${episode.prevEpisode.id}`}>
                  <button className="text-white hover:text-primary transition-colors flex items-center gap-1 text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                </Link>
              )}

              {/* Next Episode */}
              {episode.nextEpisode && (
                <Link href={`/watch/${episode.nextEpisode.id}`}>
                  <button className="text-white hover:text-primary transition-colors flex items-center gap-1 text-sm">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              )}

              {/* Quality Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">{quality}</span>
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                    {qualities.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                        className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors ${
                          quality === q ? 'text-primary' : 'text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button className="text-white hover:text-primary transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">
                Episode {episode.number}: {episode.title}
              </h1>
              <p className="text-gray-400 mt-1">{episode.animeTitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Download
              </Button>
              <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Open in VLC
              </Button>
              <Link href={`/anime/${episode.animeId}`}>
                <Button variant="outline" size="sm" leftIcon={<List className="w-4 h-4" />}>
                  All Episodes
                </Button>
              </Link>
            </div>
          </div>

          {episode.synopsis && (
            <p className="text-gray-400 mt-4 max-w-3xl">{episode.synopsis}</p>
          )}
        </div>
      </div>
    </div>
  );
}
