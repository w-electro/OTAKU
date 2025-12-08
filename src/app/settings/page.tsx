'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User, Bell, Globe, Palette, Shield, CreditCard,
  Monitor, Volume2, Download, Eye, ChevronRight, Save
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type SettingsSection = 'account' | 'playback' | 'notifications' | 'appearance' | 'privacy' | 'subscription';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  // Settings state
  const [settings, setSettings] = useState({
    // Account
    displayName: 'Anime Fan',
    email: 'fan@otaku.tv',
    // Playback
    defaultQuality: '1080p',
    autoplay: true,
    autoplayNext: true,
    skipIntro: true,
    defaultVolume: 80,
    // Notifications
    emailNotifications: true,
    newEpisodes: true,
    recommendations: false,
    newsletter: false,
    // Appearance
    theme: 'dark',
    language: 'en',
    // Privacy
    watchHistory: true,
    publicProfile: false,
  });

  const sections = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'playback', label: 'Playback', icon: Monitor },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const qualities = ['Auto', '4K 240fps', '4K', '1080p', '720p', '480p'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
  ];

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof settings]
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-white mb-8 animate-fade-in">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.key
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 animate-fade-in">
            {activeSection === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                    <Input
                      value={settings.displayName}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <Button variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'playback' && (
              <Card>
                <CardHeader>
                  <CardTitle>Playback Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Default Video Quality</label>
                    <select
                      value={settings.defaultQuality}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultQuality: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      {qualities.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Autoplay Videos</p>
                      <p className="text-sm text-gray-400">Start playing videos automatically</p>
                    </div>
                    <ToggleSwitch enabled={settings.autoplay} onToggle={() => handleToggle('autoplay')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Autoplay Next Episode</p>
                      <p className="text-sm text-gray-400">Automatically play the next episode</p>
                    </div>
                    <ToggleSwitch enabled={settings.autoplayNext} onToggle={() => handleToggle('autoplayNext')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Skip Intro</p>
                      <p className="text-sm text-gray-400">Automatically skip intro sequences</p>
                    </div>
                    <ToggleSwitch enabled={settings.skipIntro} onToggle={() => handleToggle('skipIntro')} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Default Volume: {settings.defaultVolume}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.defaultVolume}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultVolume: Number(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <ToggleSwitch enabled={settings.emailNotifications} onToggle={() => handleToggle('emailNotifications')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">New Episode Alerts</p>
                      <p className="text-sm text-gray-400">Get notified when new episodes are available</p>
                    </div>
                    <ToggleSwitch enabled={settings.newEpisodes} onToggle={() => handleToggle('newEpisodes')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Recommendations</p>
                      <p className="text-sm text-gray-400">Receive personalized anime recommendations</p>
                    </div>
                    <ToggleSwitch enabled={settings.recommendations} onToggle={() => handleToggle('recommendations')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Newsletter</p>
                      <p className="text-sm text-gray-400">Weekly updates and announcements</p>
                    </div>
                    <ToggleSwitch enabled={settings.newsletter} onToggle={() => handleToggle('newsletter')} />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Watch History</p>
                      <p className="text-sm text-gray-400">Keep track of what you watch</p>
                    </div>
                    <ToggleSwitch enabled={settings.watchHistory} onToggle={() => handleToggle('watchHistory')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Public Profile</p>
                      <p className="text-sm text-gray-400">Allow others to see your profile</p>
                    </div>
                    <ToggleSwitch enabled={settings.publicProfile} onToggle={() => handleToggle('publicProfile')} />
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'subscription' && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg border border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Current Plan</span>
                      <span className="text-primary font-bold">Premium</span>
                    </div>
                    <p className="text-sm text-gray-400">Your next billing date is January 15, 2025</p>
                  </div>
                  <Link href="/subscribe">
                    <Button variant="primary" className="w-full">
                      Manage Subscription
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    View Billing History
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
