import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

export function getAnimeTitle(anime: {
  titleEnglish?: string | null;
  titleRomaji: string;
  titleArabic?: string | null;
}, language: string = 'en'): string {
  if (language === 'ar' && anime.titleArabic) {
    return anime.titleArabic;
  }
  return anime.titleEnglish || anime.titleRomaji;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateStreamToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getQualityBadgeColor(quality: string): string {
  switch (quality) {
    case '4K240':
      return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case '4K':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    case '1080p':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function canAccessQuality(
  userTier: string | undefined,
  quality: string
): boolean {
  const tierAccess: Record<string, string[]> = {
    TRIAL: ['1080p'],
    BASIC: ['1080p'],
    PREMIUM: ['1080p', '4K'],
    ULTIMATE: ['1080p', '4K', '4K240'],
  };

  if (!userTier) return false;
  return tierAccess[userTier]?.includes(quality) || false;
}

export function getSeasonName(season: string, language: string = 'en'): string {
  const seasons: Record<string, Record<string, string>> = {
    WINTER: { en: 'Winter', ar: 'شتاء' },
    SPRING: { en: 'Spring', ar: 'ربيع' },
    SUMMER: { en: 'Summer', ar: 'صيف' },
    FALL: { en: 'Fall', ar: 'خريف' },
  };
  return seasons[season]?.[language] || season;
}

export function getStatusName(status: string, language: string = 'en'): string {
  const statuses: Record<string, Record<string, string>> = {
    RELEASING: { en: 'Releasing', ar: 'يعرض حالياً' },
    FINISHED: { en: 'Finished', ar: 'منتهي' },
    NOT_YET_RELEASED: { en: 'Not Yet Released', ar: 'لم يصدر بعد' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
    HIATUS: { en: 'On Hiatus', ar: 'متوقف' },
  };
  return statuses[status]?.[language] || status;
}

export function parseAniListDate(date?: {
  year?: number;
  month?: number;
  day?: number;
}): Date | undefined {
  if (!date || !date.year) return undefined;
  return new Date(
    date.year,
    (date.month || 1) - 1,
    date.day || 1
  );
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
