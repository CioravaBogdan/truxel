import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/database.types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => set({
    session,
    isAuthenticated: !!session
  }),

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () => set({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));
