'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
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

const formats = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];
const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
const statuses = ['Releasing', 'Finished', 'Not Yet Released'];

export default function BrowsePage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/anime?limit=50');
      const data = await res.json();
      setAnimeList(data.anime || []);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnime = animeList.filter((anime) => {
    const title = (anime.titleEnglish || anime.titleRomaji || '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenres.length === 0 ||
      anime.genres?.some(g => selectedGenres.includes(g.name));

    const matchesFormat = !selectedFormat || anime.format === selectedFormat.toUpperCase();

    const matchesSeason = !selectedSeason || anime.season === selectedSeason.toUpperCase();

    const matchesStatus = !selectedStatus ||
      anime.status === selectedStatus.toUpperCase().replace(/ /g, '_');

    const matchesYear = !selectedYear ||
      anime.seasonYear?.toString() === selectedYear;

    return matchesSearch && matchesGenre && matchesFormat && matchesSeason && matchesStatus && matchesYear;
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedFormat('');
    setSelectedSeason('');
    setSelectedStatus('');
    setSelectedYear('');
    setSearchQuery('');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Anime</h1>
          <p className="text-gray-400">Discover your next favorite anime from our extensive collection</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-slide-up">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-full bg-gray-800/50 border-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters {selectedGenres.length > 0 && `(${selectedGenres.length})`}
            </Button>

            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8 animate-slide-down border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            {/* Genres */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Genres</h4>
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

            {/* Other Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Formats</option>
                  {formats.map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Season</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Seasons</option>
                  {seasons.map((season) => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          Showing {filteredAnime.length} anime
        </div>

        {/* Anime Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            : 'space-y-4'
          }>
            {Array.from({ length: 18 }).map((_, i) => (
              <Skeleton key={i} className={viewMode === 'grid' ? 'aspect-[3/4] rounded-lg' : 'h-32 rounded-lg'} />
            ))}
          </div>
        ) : filteredAnime.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No anime found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
            <Button variant="primary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            : 'space-y-4'
          }>
            {filteredAnime.map((anime, index) => (
              <div
                key={anime.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AnimeCard anime={anime} variant={viewMode === 'list' ? 'horizontal' : 'default'} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
