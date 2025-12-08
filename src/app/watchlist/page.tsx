'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Play, BookmarkX, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Anime } from '@/types';

type FilterType = 'all' | 'watching' | 'planning' | 'completed';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      // Fetch user's watchlist from API
      const res = await fetch('/api/anime?limit=20');
      const data = await res.json();
      setWatchlist(data.anime || []);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (animeId: number) => {
    setWatchlist(prev => prev.filter(a => a.id !== animeId));
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'watching', label: 'Watching' },
    { key: 'planning', label: 'Plan to Watch' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">Keep track of anime you want to watch</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 animate-slide-up">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Watchlist Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <BookmarkX className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start adding anime to your watchlist by clicking the bookmark icon on any anime card.
            </p>
            <Link href="/browse">
              <Button variant="gradient" size="lg">
                Browse Anime
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((anime, index) => (
              <div
                key={anime.id}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AnimeCard anime={anime} />

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Link href={`/anime/${anime.id}`}>
                    <Button variant="primary" size="sm" className="p-2">
                      <Play className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2"
                    onClick={() => removeFromWatchlist(anime.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
