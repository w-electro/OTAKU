'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Monitor, Zap, Crown, Play, Star, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Anime } from '@/types';

const features = [
  {
    icon: Monitor,
    title: '4K Ultra HD',
    description: 'Experience anime in stunning 3840x2160 resolution with HDR support'
  },
  {
    icon: Zap,
    title: '240 FPS',
    description: 'Smooth motion interpolation for the most fluid viewing experience'
  },
  {
    icon: Sparkles,
    title: 'AI Enhanced',
    description: 'Advanced AI upscaling technology brings classic anime to life'
  },
  {
    icon: Crown,
    title: 'Premium Quality',
    description: 'Hand-selected and carefully mastered by our expert team'
  }
];

const qualityTiers = [
  { name: '1080p HD', available: 'Basic', color: 'bg-blue-500' },
  { name: '4K UHD', available: 'Premium', color: 'bg-purple-500' },
  { name: '4K 240fps', available: 'Ultimate', color: 'bg-gradient-to-r from-primary to-purple-500' }
];

export default function FourKPage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    try {
      const res = await fetch('/api/anime?limit=12&sort=popularity');
      const data = await res.json();
      setAnimeList(data.anime || []);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <div className="absolute inset-0 bg-[url('/images/4k-pattern.svg')] opacity-5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center py-20">
            <div className="animate-float">
              <Badge variant="primary" size="lg" className="mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Premium Quality
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent">
                4K Ultra HD
              </span>
              <br />
              <span className="text-3xl md:text-5xl">240fps Anime Streaming</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 animate-slide-up">
              Experience your favorite anime like never before with our cutting-edge
              4K 240fps AI-enhanced streaming technology
            </p>

            <div className="flex flex-wrap justify-center gap-4 animate-slide-up animation-delay-200">
              <Link href="/subscribe">
                <Button variant="gradient" size="lg" leftIcon={<Crown className="w-5 h-5" />}>
                  Upgrade to Premium
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-800/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose 4K?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Comparison */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Quality Tiers
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Choose the streaming quality that suits your needs. Higher tiers unlock more features.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {qualityTiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-full h-2 ${tier.color} rounded-full mb-6`} />
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 mb-4">Available in</p>
                  <Badge variant="primary" size="lg">{tier.available}</Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4K Enhanced Anime */}
        <section className="py-20 bg-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">4K Enhanced Collection</h2>
                <p className="text-gray-400">Premium content available in stunning 4K quality</p>
              </div>
              <Link href="/browse">
                <Button variant="ghost" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {animeList.slice(0, 6).map((anime, index) => (
                  <div
                    key={anime.id}
                    className="relative animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="primary" className="bg-gradient-to-r from-primary to-purple-500">
                        4K
                      </Badge>
                    </div>
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-12 text-center border border-primary/30">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready for the Ultimate Experience?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Upgrade to Ultimate plan and unlock 4K 240fps streaming for the smoothest anime experience possible.
              </p>
              <Link href="/subscribe">
                <Button variant="gradient" size="lg" leftIcon={<Crown className="w-5 h-5" />}>
                  Get Ultimate Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
