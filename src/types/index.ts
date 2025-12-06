// Type definitions for AnimeUltra 4K

export interface Config {
  site: SiteConfig;
  subscription: SubscriptionConfig;
  content: ContentConfig;
  streaming: StreamingConfig;
  ui: UIConfig;
  admin: AdminConfig;
  security: SecurityConfig;
  cache: CacheConfig;
  notifications: NotificationsConfig;
}

export interface SiteConfig {
  name: string;
  domain: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  description: string;
  logo: string;
}

export interface SubscriptionConfig {
  tiers: {
    basic: SubscriptionTier;
    premium: SubscriptionTier;
    ultimate: SubscriptionTier;
  };
  trialDays: number;
  paymentMethods: string[];
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  downloadLimit: number;
  quality: string[];
  concurrentStreams: number;
  features: string[];
}

export interface ContentConfig {
  apiSources: string[];
  autoSync: boolean;
  syncInterval: string;
  minRatingToShow: number;
  episodeStoragePath: string;
  streamingProtocol: string;
  thumbnailPath: string;
  bannerPath: string;
}

export interface StreamingConfig {
  enableExternalPlayer: boolean;
  vlcProtocol: string;
  tokenExpiration: number;
  chunkSize: string;
  enableDownload: boolean;
  downloadExpiration: number;
  maxBitrate: {
    "1080p": number;
    "4K": number;
    "4K240": number;
  };
}

export interface UIConfig {
  heroSliderAutoplay: boolean;
  sliderInterval: number;
  cardsPerRow: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  enableDarkMode: boolean;
  defaultTheme: string;
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string[];
}

export interface AdminConfig {
  uploadMaxSize: string;
  allowBatchUpload: boolean;
  requireApproval: boolean;
  allowedFormats: string[];
  thumbnailAutoGenerate: boolean;
}

export interface SecurityConfig {
  jwtSecret: string;
  tokenRefreshInterval: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableGeoRestriction: boolean;
  allowedRegions: string[];
}

export interface CacheConfig {
  animeMetadataTTL: number;
  episodeListTTL: number;
  userSessionTTL: number;
}

export interface NotificationsConfig {
  enableEmail: boolean;
  enablePush: boolean;
  newEpisodeAlert: boolean;
  subscriptionReminder: boolean;
}

// Anime Types
export interface Anime {
  id: string;
  anilistId?: number;
  malId?: number;
  titleEnglish?: string;
  titleRomaji: string;
  titleNative?: string;
  titleArabic?: string;
  synopsis?: string;
  synopsisArabic?: string;
  coverImage?: string;
  bannerImage?: string;
  status: AnimeStatus;
  format: AnimeFormat;
  season?: AnimeSeason;
  seasonYear?: number;
  episodeCount?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  trending?: number;
  isAdult: boolean;
  source?: string;
  countryOfOrigin?: string;
  startDate?: Date;
  endDate?: Date;
  nextAiringAt?: Date;
  trailerUrl?: string;
  genres?: Genre[];
  studios?: Studio[];
  episodes?: Episode[];
}

export type AnimeStatus = 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type AnimeFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface Genre {
  id: string;
  name: string;
  nameArabic?: string;
  slug: string;
}

export interface Studio {
  id: string;
  name: string;
  nameArabic?: string;
  isMain: boolean;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  titleArabic?: string;
  synopsis?: string;
  thumbnail?: string;
  duration?: number;
  airDate?: Date;
  is4KEnhanced: boolean;
  is4K240: boolean;
  enhancedAt?: Date;
  filePath1080p?: string;
  filePath4K?: string;
  filePath4K240?: string;
  fileSize1080p?: number;
  fileSize4K?: number;
  fileSize4K240?: number;
  subtitlesEn?: string;
  subtitlesAr?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  language: string;
  subscription?: Subscription;
}

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTierType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  downloadsThisMonth: number;
}

export type SubscriptionTierType = 'BASIC' | 'PREMIUM' | 'ULTIMATE' | 'TRIAL';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' | 'EXPIRED';

// Watch History Types
export interface WatchHistory {
  id: string;
  userId: string;
  animeId: string;
  episodeId: string;
  progress: number;
  completed: boolean;
  watchedAt: Date;
  anime?: Anime;
  episode?: Episode;
}

export interface Watchlist {
  id: string;
  userId: string;
  animeId: string;
  status: WatchlistStatus;
  addedAt: Date;
  anime?: Anime;
}

export type WatchlistStatus = 'WATCHING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'PLAN_TO_WATCH';

// Stream Token Types
export interface StreamToken {
  id: string;
  userId: string;
  episodeId: string;
  token: string;
  quality: string;
  expiresAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

// AniList API Types
export interface AniListAnime {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  status: string;
  format: string;
  season?: string;
  seasonYear?: number;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  trending?: number;
  isAdult: boolean;
  source?: string;
  countryOfOrigin?: string;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  };
  trailer?: {
    id?: string;
    site?: string;
  };
  genres: string[];
  studios: {
    nodes: Array<{
      id: number;
      name: string;
      isAnimationStudio: boolean;
    }>;
  };
}

// Translations
export interface Translations {
  [key: string]: string | Translations;
}

// Component Props Types
export interface AnimeCardProps {
  anime: Anime;
  showRating?: boolean;
  showStatus?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface EpisodeCardProps {
  episode: Episode;
  anime: Anime;
  userSubscription?: Subscription;
  watchProgress?: number;
}

export interface HeroSlideProps {
  anime: Anime;
  isActive: boolean;
}

export interface PlayerProps {
  episodeId: string;
  streamUrl: string;
  subtitles?: {
    en?: string;
    ar?: string;
  };
  onProgress?: (progress: number) => void;
}
