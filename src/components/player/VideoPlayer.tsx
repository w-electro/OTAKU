'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  Subtitles,
  ExternalLink,
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  episodeNumber?: number;
  subtitles?: {
    en?: string;
    ar?: string;
  };
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  onExternalPlayer?: () => void;
  hasNextEpisode?: boolean;
  hasPreviousEpisode?: boolean;
  initialProgress?: number;
  qualities?: string[];
  currentQuality?: string;
  onQualityChange?: (quality: string) => void;
}

export function VideoPlayer({
  src,
  poster,
  title,
  episodeNumber,
  subtitles,
  onProgress,
  onEnded,
  onNextEpisode,
  onPreviousEpisode,
  onExternalPlayer,
  hasNextEpisode = false,
  hasPreviousEpisode = false,
  initialProgress = 0,
  qualities = [],
  currentQuality,
  onQualityChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playerVolume, setPlayerVolume, playerMuted, setPlayerMuted, autoplay, language } = useAppStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const isRTL = language === 'ar';

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = playerVolume;
    video.muted = playerMuted;
    video.playbackRate = playbackSpeed;

    if (initialProgress > 0) {
      video.currentTime = initialProgress;
    }
  }, [src, initialProgress, playerVolume, playerMuted, playbackSpeed]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
      if (autoplay && hasNextEpisode) {
        onNextEpisode?.();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onEnded, onNextEpisode, autoplay, hasNextEpisode]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setPlayerMuted(video.muted);
  };

  const adjustVolume = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = newVolume;
    setPlayerVolume(newVolume);
    if (newVolume > 0 && video.muted) {
      video.muted = false;
      setPlayerMuted(false);
    }
  };

  const setVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value;
    setPlayerVolume(value);
    if (value > 0 && video.muted) {
      video.muted = false;
      setPlayerMuted(false);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const setSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black group',
        isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video w-full rounded-xl overflow-hidden'
      )}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      >
        {selectedSubtitle === 'en' && subtitles?.en && (
          <track kind="subtitles" src={subtitles.en} srcLang="en" label="English" default />
        )}
        {selectedSubtitle === 'ar' && subtitles?.ar && (
          <track kind="subtitles" src={subtitles.ar} srcLang="ar" label="العربية" />
        )}
      </video>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Title */}
        {title && (
          <div className={cn(
            'absolute top-4 px-4',
            isRTL ? 'right-4' : 'left-4'
          )}>
            <h2 className="text-white font-semibold text-lg">
              {episodeNumber && `Episode ${episodeNumber}: `}{title}
            </h2>
          </div>
        )}

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-6 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4 px-4">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="relative h-1 bg-gray-600 rounded-full cursor-pointer group/progress mb-4"
            onClick={seekTo}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-gray-500 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className={cn(
            'flex items-center justify-between',
            isRTL ? 'flex-row-reverse' : ''
          )}>
            <div className={cn(
              'flex items-center gap-2',
              isRTL ? 'flex-row-reverse' : ''
            )}>
              {/* Play/Pause */}
              <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg">
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white" />
                )}
              </button>

              {/* Previous/Next */}
              {hasPreviousEpisode && (
                <button onClick={onPreviousEpisode} className="p-2 hover:bg-white/10 rounded-lg">
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
              )}
              {hasNextEpisode && (
                <button onClick={onNextEpisode} className="p-2 hover:bg-white/10 rounded-lg">
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg">
                  {playerMuted || playerVolume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={playerMuted ? 0 : playerVolume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-primary"
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm ml-2">
                {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
              </span>
            </div>

            <div className={cn(
              'flex items-center gap-2',
              isRTL ? 'flex-row-reverse' : ''
            )}>
              {/* External Player */}
              {onExternalPlayer && (
                <button onClick={onExternalPlayer} className="p-2 hover:bg-white/10 rounded-lg" title="Open in VLC">
                  <ExternalLink className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Subtitles */}
              {(subtitles?.en || subtitles?.ar) && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitlesMenu(!showSubtitlesMenu)}
                    className={cn(
                      'p-2 hover:bg-white/10 rounded-lg',
                      selectedSubtitle && 'text-primary'
                    )}
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                  {showSubtitlesMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg overflow-hidden min-w-32">
                      <button
                        onClick={() => { setSelectedSubtitle(null); setShowSubtitlesMenu(false); }}
                        className={cn(
                          'w-full px-4 py-2 text-left hover:bg-gray-700',
                          !selectedSubtitle && 'text-primary'
                        )}
                      >
                        Off
                      </button>
                      {subtitles?.en && (
                        <button
                          onClick={() => { setSelectedSubtitle('en'); setShowSubtitlesMenu(false); }}
                          className={cn(
                            'w-full px-4 py-2 text-left hover:bg-gray-700',
                            selectedSubtitle === 'en' && 'text-primary'
                          )}
                        >
                          English
                        </button>
                      )}
                      {subtitles?.ar && (
                        <button
                          onClick={() => { setSelectedSubtitle('ar'); setShowSubtitlesMenu(false); }}
                          className={cn(
                            'w-full px-4 py-2 text-left hover:bg-gray-700',
                            selectedSubtitle === 'ar' && 'text-primary'
                          )}
                        >
                          العربية
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg overflow-hidden min-w-40">
                    {/* Quality */}
                    {qualities.length > 0 && (
                      <div className="border-b border-gray-700 p-2">
                        <p className="text-xs text-gray-400 px-2 mb-1">Quality</p>
                        {qualities.map((q) => (
                          <button
                            key={q}
                            onClick={() => onQualityChange?.(q)}
                            className={cn(
                              'w-full px-4 py-1.5 text-left hover:bg-gray-700 text-sm',
                              currentQuality === q && 'text-primary'
                            )}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Speed */}
                    <div className="p-2">
                      <p className="text-xs text-gray-400 px-2 mb-1">Playback Speed</p>
                      {speedOptions.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => { setSpeed(speed); setShowSettings(false); }}
                          className={cn(
                            'w-full px-4 py-1.5 text-left hover:bg-gray-700 text-sm',
                            playbackSpeed === speed && 'text-primary'
                          )}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg">
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
