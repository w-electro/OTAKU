import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Anime, User, Subscription } from '@/types';

interface AppState {
  // User State
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;

  // UI State
  language: 'en' | 'ar';
  theme: 'dark' | 'light';
  sidebarOpen: boolean;

  // Player State
  currentAnime: Anime | null;
  currentEpisode: number;
  playerVolume: number;
  playerMuted: boolean;
  autoplay: boolean;

  // Search State
  searchQuery: string;
  searchResults: Anime[];
  isSearching: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setLanguage: (language: 'en' | 'ar') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setCurrentAnime: (anime: Anime | null) => void;
  setCurrentEpisode: (episode: number) => void;
  setPlayerVolume: (volume: number) => void;
  setPlayerMuted: (muted: boolean) => void;
  setAutoplay: (autoplay: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Anime[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial User State
      user: null,
      subscription: null,
      isAuthenticated: false,

      // Initial UI State
      language: 'en',
      theme: 'dark',
      sidebarOpen: false,

      // Initial Player State
      currentAnime: null,
      currentEpisode: 1,
      playerVolume: 1,
      playerMuted: false,
      autoplay: true,

      // Initial Search State
      searchQuery: '',
      searchResults: [],
      isSearching: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSubscription: (subscription) => set({ subscription }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentAnime: (anime) => set({ currentAnime: anime }),
      setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
      setPlayerVolume: (volume) => set({ playerVolume: volume }),
      setPlayerMuted: (muted) => set({ playerMuted: muted }),
      setAutoplay: (autoplay) => set({ autoplay }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (isSearching) => set({ isSearching }),
      logout: () => set({
        user: null,
        subscription: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'anime-ultra-storage',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        playerVolume: state.playerVolume,
        playerMuted: state.playerMuted,
        autoplay: state.autoplay,
      }),
    }
  )
);

// Watchlist Store
interface WatchlistState {
  watchlist: string[]; // Anime IDs
  addToWatchlist: (animeId: string) => void;
  removeFromWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (animeId) =>
        set((state) => ({
          watchlist: state.watchlist.includes(animeId)
            ? state.watchlist
            : [...state.watchlist, animeId],
        })),
      removeFromWatchlist: (animeId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((id) => id !== animeId),
        })),
      isInWatchlist: (animeId) => get().watchlist.includes(animeId),
      clearWatchlist: () => set({ watchlist: [] }),
    }),
    {
      name: 'anime-ultra-watchlist',
    }
  )
);

// Watch History Store
interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  progress: number;
  duration: number;
  watchedAt: Date;
}

interface WatchHistoryState {
  history: WatchHistoryItem[];
  addToHistory: (item: WatchHistoryItem) => void;
  updateProgress: (episodeId: string, progress: number) => void;
  getProgress: (episodeId: string) => number;
  getContinueWatching: () => WatchHistoryItem[];
  clearHistory: () => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (item) =>
        set((state) => {
          const existing = state.history.findIndex(
            (h) => h.episodeId === item.episodeId
          );
          if (existing >= 0) {
            const newHistory = [...state.history];
            newHistory[existing] = { ...item, watchedAt: new Date() };
            return { history: newHistory };
          }
          return { history: [item, ...state.history].slice(0, 100) }; // Keep last 100 items
        }),
      updateProgress: (episodeId, progress) =>
        set((state) => {
          const index = state.history.findIndex((h) => h.episodeId === episodeId);
          if (index >= 0) {
            const newHistory = [...state.history];
            newHistory[index] = {
              ...newHistory[index],
              progress,
              watchedAt: new Date(),
            };
            return { history: newHistory };
          }
          return state;
        }),
      getProgress: (episodeId) => {
        const item = get().history.find((h) => h.episodeId === episodeId);
        return item?.progress || 0;
      },
      getContinueWatching: () => {
        return get()
          .history.filter((h) => h.progress > 0 && h.progress < h.duration * 0.9)
          .slice(0, 10);
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'anime-ultra-history',
    }
  )
);
