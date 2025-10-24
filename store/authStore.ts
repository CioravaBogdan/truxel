import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

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
  refreshProfile: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => set({
    session,
    // Only consider authenticated if we have a session
    // Profile will be loaded separately
    isAuthenticated: !!session
  }),

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ 
    profile,
    // Update isAuthenticated when profile is loaded
    // User is fully authenticated when they have both session AND profile
    isAuthenticated: !!get().session && !!profile
  }),

  setIsLoading: (isLoading) => set({ isLoading }),

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      set({ profile: data });
    }
  },

  reset: () => set({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));
