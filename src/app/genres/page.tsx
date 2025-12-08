'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sword, Heart, Laugh, Ghost, Sparkles, Rocket, Eye, Dumbbell, Music, Coffee, Brain, Wand2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Anime } from '@/types';

const genreIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Action': Sword,
  'Romance': Heart,
  'Comedy': Laugh,
  'Horror': Ghost,
  'Fantasy': Sparkles,
  'Sci-Fi': Rocket,
  'Mystery': Eye,
  'Sports': Dumbbell,
  'Music': Music,
  'Slice of Life': Coffee,
  'Psychological': Brain,
  'Supernatural': Wand2,
};

const genreColors: Record<string, string> = {
  'Action': 'from-red-500 to-orange-500',
  'Romance': 'from-pink-500 to-rose-500',
  'Comedy': 'from-yellow-500 to-amber-500',
  'Horror': 'from-gray-700 to-gray-900',
  'Fantasy': 'from-purple-500 to-indigo-500',
  'Sci-Fi': 'from-cyan-500 to-blue-500',
  'Mystery': 'from-emerald-500 to-teal-500',
  'Sports': 'from-green-500 to-lime-500',
  'Music': 'from-violet-500 to-purple-500',
  'Slice of Life': 'from-amber-400 to-yellow-500',
  'Psychological': 'from-indigo-500 to-blue-600',
  'Supernatural': 'from-fuchsia-500 to-pink-500',
  'Drama': 'from-blue-500 to-indigo-500',
  'Adventure': 'from-orange-500 to-yellow-500',
  'Mecha': 'from-slate-500 to-zinc-600',
  'Ecchi': 'from-pink-400 to-red-400',
};

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Psychological', 'Music', 'Mecha'
];

export default function GenresPage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGenre) {
      fetchAnimeByGenre(selectedGenre);
    }
  }, [selectedGenre]);

  const fetchAnimeByGenre = async (genre: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/anime?genre=${encodeURIComponent(genre)}&limit=12`);
      const data = await res.json();
      setAnimeList(data.anime || []);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGenreIcon = (genre: string) => {
    const Icon = genreIcons[genre];
    return Icon ? <Icon className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />;
  };

  const getGenreGradient = (genre: string) => {
    return genreColors[genre] || 'from-primary to-purple-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Page Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore by Genre
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover anime across different genres and find your perfect match
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {genres.map((genre, index) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
              className={`relative group p-6 rounded-xl transition-all duration-300 animate-fade-in overflow-hidden ${
                selectedGenre === genre
                  ? 'scale-105 ring-2 ring-white'
                  : 'hover:scale-105'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getGenreGradient(genre)} opacity-80 group-hover:opacity-100 transition-opacity`} />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-white">
                <div className="mb-3 p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  {getGenreIcon(genre)}
                </div>
                <span className="font-semibold text-sm">{genre}</span>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          ))}
        </div>

        {/* Selected Genre Content */}
        {selectedGenre && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${getGenreGradient(selectedGenre)}`}>
                {getGenreIcon(selectedGenre)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedGenre} Anime</h2>
                <p className="text-gray-400">Popular {selectedGenre.toLowerCase()} anime titles</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            ) : animeList.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-xl font-semibold text-white mb-2">No anime found</h3>
                <p className="text-gray-400">
                  We couldn&apos;t find any {selectedGenre} anime at the moment.
                  Try another genre!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {animeList.map((anime, index) => (
                  <div
                    key={anime.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Genre Selected State */}
        {!selectedGenre && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-6xl mb-4">👆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Genre</h3>
            <p className="text-gray-400">
              Click on any genre above to see anime in that category
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
