import { create } from 'zustand';
import { Lead, LeadStatus } from '@/types/database.types';

interface LeadsState {
  leads: Lead[];
  isLoading: boolean;
  filterStatus: LeadStatus | 'all';
  filterContactType: 'all' | 'email' | 'phone' | 'whatsapp' | 'linkedin';
  sortBy: 'distance' | 'name' | 'date';
  searchQuery: string;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setFilterStatus: (status: LeadStatus | 'all') => void;
  setFilterContactType: (type: 'all' | 'email' | 'phone' | 'whatsapp' | 'linkedin') => void;
  setSortBy: (sortBy: 'distance' | 'name' | 'date') => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],
  isLoading: false,
  filterStatus: 'all',
  filterContactType: 'all',
  sortBy: 'date',
  searchQuery: '',

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

  setIsLoading: (isLoading) => set({ isLoading }),

  setFilterStatus: (filterStatus) => set({ filterStatus }),

  setFilterContactType: (filterContactType) => set({ filterContactType }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  reset: () => set({
    leads: [],
    isLoading: false,
    filterStatus: 'all',
    filterContactType: 'all',
    sortBy: 'date',
    searchQuery: '',
  }),
}));
