import { create } from 'zustand';
import { Search } from '@/types/database.types';

interface SearchesState {
  searches: Search[];
  activeSearch: Search | null;
  isLoading: boolean;
  setSearches: (searches: Search[]) => void;
  addSearch: (search: Search) => void;
  updateSearch: (id: string, updates: Partial<Search>) => void;
  setActiveSearch: (search: Search | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useSearchesStore = create<SearchesState>((set) => ({
  searches: [],
  activeSearch: null,
  isLoading: false,

  setSearches: (searches) => set({ searches }),

  addSearch: (search) => set((state) => ({
    searches: [search, ...state.searches],
  })),

  updateSearch: (id, updates) => set((state) => ({
    searches: state.searches.map((search) =>
      search.id === id ? { ...search, ...updates } : search
    ),
    activeSearch: state.activeSearch?.id === id
      ? { ...state.activeSearch, ...updates }
      : state.activeSearch,
  })),

  setActiveSearch: (activeSearch) => set({ activeSearch }),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () => set({
    searches: [],
    activeSearch: null,
    isLoading: false,
  }),
}));
