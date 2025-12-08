'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Anime } from '@/types';

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/anime?search=${encodeURIComponent(searchQuery)}&limit=24`);
      const data = await res.json();
      setResults(data.anime || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Search Header */}
        <div className="max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Search Anime
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anime titles..."
                className="w-full pl-14 pr-24 py-4 bg-gray-800/80 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <Button
                type="submit"
                variant="primary"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700 animate-slide-down">
              <h3 className="text-white font-medium mb-4">Filter by Genre</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'primary' : 'default'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <SearchIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We couldn&apos;t find any anime matching &quot;{query}&quot;. Try a different search term.
            </p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-gray-400 mb-6">
              Found {results.length} results for &quot;{query}&quot;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((anime, index) => (
                <div
                  key={anime.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <SearchIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-2">Start your search</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter an anime title above to search our extensive library.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
