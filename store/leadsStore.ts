import { create } from 'zustand';
import { Lead, LeadStatus } from '@/types/database.types';
import type { CommunityPost } from '@/types/community.types';

interface LeadsState {
  // Tab state
  selectedTab: 'search' | 'hotleads' | 'mybook';
  
  // Search Results tab (N8N leads)
  leads: Lead[];
  
  // Hot Leads tab filter (savedPosts now come from communityStore)
  hotLeadsFilter: 'all' | 'drivers' | 'forwarding';
  
  // My Book tab (converted leads)
  convertedLeads: Lead[];
  
  // Common state
  isLoading: boolean;
  filterStatus: LeadStatus | 'all';
  filterContactType: 'all' | 'email' | 'phone' | 'whatsapp' | 'linkedin';
  sortBy: 'distance' | 'name' | 'date';
  searchQuery: string;
  
  // Search Results actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  
  // Hot Leads actions
  setHotLeadsFilter: (filter: 'all' | 'drivers' | 'forwarding') => void;
  // Note: savedPosts and loadSavedPosts are now in communityStore for real-time updates
  
  // My Book actions
  setConvertedLeads: (leads: Lead[]) => void;
  loadConvertedLeads: (userId: string) => Promise<void>;
  convertToMyBook: (post: CommunityPost, userId: string) => Promise<void>;
  
  // Tab navigation
  setSelectedTab: (tab: 'search' | 'hotleads' | 'mybook') => void;
  
  // Common actions
  setIsLoading: (isLoading: boolean) => void;
  setFilterStatus: (status: LeadStatus | 'all') => void;
  setFilterContactType: (type: 'all' | 'email' | 'phone' | 'whatsapp' | 'linkedin') => void;
  setSortBy: (sortBy: 'distance' | 'name' | 'date') => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  // Initial state
  selectedTab: 'search', // Default to Search Results tab
  leads: [],
  hotLeadsFilter: 'all',
  convertedLeads: [],
  isLoading: false,
  filterStatus: 'all',
  filterContactType: 'all',
  sortBy: 'date',
  searchQuery: '',

  // Search Results actions
  setLeads: (leads) => set({ leads }),

  addLead: (lead) => set((state) => ({
    leads: [lead, ...state.leads],
  })),

  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map((lead) =>
      lead.id === id ? { ...lead, ...updates } : lead
    ),
  })),

  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== id),
  })),

  // Hot Leads actions
  setHotLeadsFilter: (hotLeadsFilter) => set({ hotLeadsFilter }),

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

  // Tab navigation
  setSelectedTab: (tab: 'search' | 'hotleads' | 'mybook') => {
    set({ selectedTab: tab });
  },

  // Common actions
  setIsLoading: (isLoading) => set({ isLoading }),

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setFilterContactType: (filterContactType) => set({ filterContactType }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  reset: () => set({
    selectedTab: 'search',
    leads: [],
    hotLeadsFilter: 'all',
    convertedLeads: [],
    isLoading: false,
    filterStatus: 'all',
    filterContactType: 'all',
    sortBy: 'date',
    searchQuery: '',
  }),
}));
