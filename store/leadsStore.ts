import { create } from 'zustand';
import { Lead, LeadStatus } from '@/types/database.types';
import type { CommunityPost, Country, City } from '@/types/community.types';

interface LeadsState {
  // Tab state
  selectedTab: 'all' | 'latest' | 'mybook';
  
  // All Search Results tab
  leads: Lead[];
  
  // Latest Search tab
  latestSearchLeads: Lead[];
  selectedSearchId: string | null;
  
  // My Book tab (converted leads)
  convertedLeads: Lead[];
  
  // Legacy Hot Leads (kept for compatibility if needed, but unused in UI)
  savedPosts: CommunityPost[];
  hotLeadsFilter: 'all' | 'drivers' | 'forwarding';
  
  // Lead detail modal (cross-tab communication)
  selectedLeadId: string | null;
  
  // Common state
  isLoading: boolean;
  filterStatus: LeadStatus | 'all';
  filterContactType: 'all' | 'email' | 'phone' | 'whatsapp' | 'linkedin';
  sortBy: 'distance' | 'name' | 'date';
  searchQuery: string;
  
  // Location Filters
  selectedCountry: Country | null;
  selectedCity: City | null;
  
  // Actions
  setLeads: (leads: Lead[]) => void;
  setLatestSearchLeads: (leads: Lead[]) => void;
  setSelectedSearchId: (id: string | null) => void;
  loadLatestSearchLeads: (userId: string, searchId?: string | null) => Promise<void>;
  
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  
  // Hot Leads actions (Legacy)
  setSavedPosts: (posts: CommunityPost[]) => void;
  setHotLeadsFilter: (filter: 'all' | 'drivers' | 'forwarding') => void;
  loadSavedPosts: (userId: string) => Promise<void>;
  
  // My Book actions
  setConvertedLeads: (leads: Lead[]) => void;
  loadConvertedLeads: (userId: string) => Promise<void>;
  convertToMyBook: (post: CommunityPost, userId: string) => Promise<void>;
  promoteLeadToMyBook: (userLeadId: string, userId: string) => Promise<void>;
  
  // Tab navigation
  setSelectedTab: (tab: 'all' | 'latest' | 'mybook') => void;
  
  // Lead detail modal actions
  setSelectedLeadId: (id: string | null) => void;
  
  // Common actions
  setIsLoading: (isLoading: boolean) => void;
  setFilterStatus: (status: LeadStatus | 'all') => void;
  setFilterContactType: (type: 'all' | 'email' | 'phone' | 'whatsapp' | 'linkedin') => void;
  setSortBy: (sortBy: 'distance' | 'name' | 'date') => void;
  setSearchQuery: (query: string) => void;
  
  // Location Filter Actions
  setSelectedCountry: (country: Country | null) => void;
  setSelectedCity: (city: City | null) => void;
  
  reset: () => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  // Initial state
  selectedTab: 'all',
  leads: [],
  latestSearchLeads: [],
  selectedSearchId: null,
  savedPosts: [],
  hotLeadsFilter: 'all',
  convertedLeads: [],
  selectedLeadId: null,
  isLoading: false,
  filterStatus: 'all',
  filterContactType: 'all',
  sortBy: 'date',
  searchQuery: '',
  selectedCountry: null,
  selectedCity: null,

  // Actions
  setLeads: (leads) => set({ leads }),
  setLatestSearchLeads: (leads) => set({ latestSearchLeads: leads }),
  setSelectedSearchId: (id) => set({ selectedSearchId: id }),

  loadLatestSearchLeads: async (userId: string, searchId?: string | null) => {
    set({ isLoading: true });
    try {
      const { leadsService } = await import('@/services/leadsService');
      const { searchesService } = await import('@/services/searchesService');
      
      let targetSearchId = searchId;

      // If no searchId provided, find the most recent one
      if (!targetSearchId) {
        const searches = await searchesService.getSearches(userId);
        if (searches && searches.length > 0) {
          targetSearchId = searches[0].id;
          set({ selectedSearchId: targetSearchId });
        }
      }

      if (targetSearchId) {
        const leads = await leadsService.getLeadsBySearch(targetSearchId);
        set({ latestSearchLeads: leads, isLoading: false });
      } else {
        set({ latestSearchLeads: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error loading latest search leads:', error);
      set({ isLoading: false });
    }
  },

  addLead: (lead) => set((state) => ({
    leads: [lead, ...state.leads],
  })),

  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map((lead) =>
      lead.id === id ? { ...lead, ...updates } : lead
    ),
    latestSearchLeads: state.latestSearchLeads.map((lead) =>
      lead.id === id ? { ...lead, ...updates } : lead
    ),
  })),

  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== id),
    latestSearchLeads: state.latestSearchLeads.filter((lead) => lead.id !== id),
  })),

  // Hot Leads actions
  setSavedPosts: (savedPosts) => set({ savedPosts }),

  setHotLeadsFilter: (hotLeadsFilter) => set({ hotLeadsFilter }),

  loadSavedPosts: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { communityService } = await import('@/services/communityService');
      const posts = await communityService.getSavedPosts(userId);
      set({ savedPosts: posts, isLoading: false });
    } catch (error) {
      console.error('Error loading saved posts:', error);
      set({ isLoading: false });
    }
  },

  // My Book actions
  setConvertedLeads: (convertedLeads) => set({ convertedLeads }),

  loadConvertedLeads: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { leadsService } = await import('@/services/leadsService');
      const leads = await leadsService.getConvertedLeads(userId);
      set({ convertedLeads: leads, isLoading: false });
    } catch (error) {
      console.error('Error loading converted leads:', error);
      set({ isLoading: false });
    }
  },

  convertToMyBook: async (post: CommunityPost, userId: string) => {
    set({ isLoading: true });
    try {
      const { leadsService } = await import('@/services/leadsService');
      const newLead = await leadsService.convertPostToLead(post, userId);
      
      // Add to converted leads
      set((state) => ({
        convertedLeads: [newLead, ...state.convertedLeads],
        isLoading: false,
      }));
      
      // Reload converted leads to ensure sync
      await get().loadConvertedLeads(userId);
    } catch (error) {
      console.error('Error converting to My Book:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  promoteLeadToMyBook: async (userLeadId: string, userId: string) => {
    set({ isLoading: true });
    try {
      const { leadsService } = await import('@/services/leadsService');
      await leadsService.promoteLeadToMyBook(userLeadId, userId);

      // Reload converted leads to reflect the promoted lead
      await get().loadConvertedLeads(userId);
      set({ isLoading: false });
    } catch (error) {
      console.error('Error promoting lead to My Book:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Tab navigation
  setSelectedTab: (tab: 'all' | 'latest' | 'mybook') => {
    set({ selectedTab: tab });
  },

  // Lead detail modal actions
  setSelectedLeadId: (id: string | null) => set({ selectedLeadId: id }),

  // Common actions
  setIsLoading: (isLoading) => set({ isLoading }),

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setFilterContactType: (filterContactType) => set({ filterContactType }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Location Filter Actions
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedCity: (city) => set({ selectedCity: city }),

  reset: () => set({
    selectedTab: 'all',
    leads: [],
    latestSearchLeads: [],
    selectedSearchId: null,
    savedPosts: [],
    hotLeadsFilter: 'all',
    convertedLeads: [],
    selectedLeadId: null,
    isLoading: false,
    filterStatus: 'all',
    filterContactType: 'all',
    sortBy: 'date',
    searchQuery: '',
    selectedCountry: null,
    selectedCity: null,
  }),
}));
