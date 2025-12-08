'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Calendar, Crown, Play, Clock, Heart, Settings, Edit2, Camera } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'favorites'>('overview');

  // Mock user data
  const user = {
    name: 'Anime Fan',
    email: 'fan@otaku.tv',
    avatar: null,
    joinedDate: 'December 2024',
    subscription: 'Premium',
    stats: {
      episodesWatched: 342,
      hoursWatched: 114,
      animeCompleted: 28,
      watchlist: 15,
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'history', label: 'Watch History' },
    { key: 'favorites', label: 'Favorites' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <Badge variant="primary" className="flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {user.subscription}
                </Badge>
              </div>
              <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-4">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-4 h-4" />
                Member since {user.joinedDate}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/settings">
                <Button variant="outline" leftIcon={<Settings className="w-4 h-4" />}>
                  Settings
                </Button>
              </Link>
              <Button variant="primary" leftIcon={<Edit2 className="w-4 h-4" />}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="animate-slide-up">
            <CardContent className="p-6 text-center">
              <Play className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{user.stats.episodesWatched}</p>
              <p className="text-gray-400 text-sm">Episodes Watched</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up animation-delay-100">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{user.stats.hoursWatched}</p>
              <p className="text-gray-400 text-sm">Hours Watched</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up animation-delay-200">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{user.stats.animeCompleted}</p>
              <p className="text-gray-400 text-sm">Anime Completed</p>
            </CardContent>
          </Card>
          <Card className="animate-slide-up animation-delay-300">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{user.stats.watchlist}</p>
              <p className="text-gray-400 text-sm">In Watchlist</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <p className="text-gray-400">Your viewing activity and recommendations will appear here.</p>
              <Link href="/browse" className="mt-4 inline-block">
                <Button variant="primary">Start Watching</Button>
              </Link>
            </div>
          )}
          {activeTab === 'history' && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your watch history will appear here.</p>
            </div>
          )}
          {activeTab === 'favorites' && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your favorite anime will appear here.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
