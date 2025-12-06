'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  Globe,
  LogOut,
  Settings,
  Crown,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/i18n';

interface HeaderProps {
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const { language, setLanguage, searchQuery, setSearchQuery } = useAppStore();
  const { t, isRTL, dir } = useTranslation(language);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/browse', label: t('nav.trending') },
    { href: '/browse?filter=popular', label: t('nav.popular') },
    { href: '/genres', label: t('nav.genres') },
    { href: '/browse?format=MOVIE', label: t('nav.movies') },
    { href: '/4k', label: t('nav.4kEnhanced') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header
      dir={dir}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                A
              </span>
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AnimeUltra 4K
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={cn(
            'hidden lg:flex items-center gap-6',
            isRTL ? 'flex-row-reverse' : ''
          )}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-gray-300'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className={cn(
            'flex items-center gap-2 md:gap-4',
            isRTL ? 'flex-row-reverse' : ''
          )}>
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 md:w-80">
                  <Input
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                    rightIcon={
                      <button onClick={() => setIsSearchOpen(false)}>
                        <X className="w-4 h-4" />
                      </button>
                    }
                    className="bg-gray-800"
                    autoFocus
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="p-2"
              title={language === 'en' ? 'العربية' : 'English'}
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-xs hidden md:inline">
                {language === 'en' ? 'EN' : 'عر'}
              </span>
            </Button>

            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className={cn(
                      'absolute top-full mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden',
                      isRTL ? 'left-0' : 'right-0'
                    )}>
                      <div className="p-4 border-b border-gray-700">
                        <p className="font-medium text-white">{user.name || 'User'}</p>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      </div>
                      <nav className="p-2">
                        <Link
                          href="/profile"
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white',
                            isRTL ? 'flex-row-reverse' : ''
                          )}
                        >
                          <User className="w-4 h-4" />
                          {t('common.profile')}
                        </Link>
                        <Link
                          href="/subscribe"
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white',
                            isRTL ? 'flex-row-reverse' : ''
                          )}
                        >
                          <Crown className="w-4 h-4 text-yellow-500" />
                          {t('common.subscribe')}
                        </Link>
                        <Link
                          href="/settings"
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white',
                            isRTL ? 'flex-row-reverse' : ''
                          )}
                        >
                          <Settings className="w-4 h-4" />
                          {t('common.settings')}
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 text-primary',
                              isRTL ? 'flex-row-reverse' : ''
                            )}
                          >
                            <Settings className="w-4 h-4" />
                            {t('admin.dashboard')}
                          </Link>
                        )}
                        <hr className="my-2 border-gray-700" />
                        <button
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 text-red-400',
                            isRTL ? 'flex-row-reverse' : ''
                          )}
                        >
                          <LogOut className="w-4 h-4" />
                          {t('common.logout')}
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={cn(
                'flex items-center gap-2',
                isRTL ? 'flex-row-reverse' : ''
              )}>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t('common.login')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="gradient" size="sm">
                    {t('common.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
