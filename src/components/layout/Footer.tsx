'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/i18n';

export function Footer() {
  const { language } = useAppStore();
  const { t, isRTL, dir } = useTranslation(language);
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { href: '/about', label: t('footer.about') },
      { href: '/contact', label: t('footer.contact') },
      { href: '/careers', label: language === 'ar' ? 'الوظائف' : 'Careers' },
    ],
    legal: [
      { href: '/terms', label: t('footer.terms') },
      { href: '/privacy', label: t('footer.privacy') },
      { href: '/dmca', label: 'DMCA' },
    ],
    support: [
      { href: '/faq', label: t('footer.faq') },
      { href: '/help', label: t('footer.help') },
      { href: '/feedback', label: language === 'ar' ? 'الملاحظات' : 'Feedback' },
    ],
    browse: [
      { href: '/browse', label: t('nav.trending') },
      { href: '/genres', label: t('nav.genres') },
      { href: '/4k', label: t('nav.4kEnhanced') },
      { href: '/new', label: t('nav.newReleases') },
    ],
  };

  const socialLinks = [
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
  ];

  return (
    <footer dir={dir} className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className={cn(
          'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8',
          isRTL ? 'text-right' : ''
        )}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                  お
                </span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OTAKU
              </span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              {language === 'ar'
                ? 'OTAKU - منصة البث المميزة للأنمي بجودة 4K و 240fps. استمتع بأفضل جودة بصرية.'
                : 'OTAKU - Premium 4K 240fps anime streaming. Experience the best visual quality.'}
            </p>

            {/* Social Links */}
            <div className={cn(
              'flex gap-4 mt-6',
              isRTL ? 'flex-row-reverse justify-end' : ''
            )}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {language === 'ar' ? 'تصفح' : 'Browse'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {language === 'ar' ? 'الشركة' : 'Company'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {language === 'ar' ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {language === 'ar' ? 'قانوني' : 'Legal'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={cn(
          'mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4',
          isRTL ? 'md:flex-row-reverse' : ''
        )}>
          <p className="text-gray-500 text-sm">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className={cn(
            'flex items-center gap-1 text-gray-500 text-sm',
            isRTL ? 'flex-row-reverse' : ''
          )}>
            {language === 'ar' ? 'صنع بـ' : 'Made with'}
            <Heart className="w-4 h-4 text-primary fill-primary" />
            {language === 'ar' ? 'لعشاق الأنمي' : 'for anime lovers'}
          </p>
        </div>
      </div>
    </footer>
  );
}
