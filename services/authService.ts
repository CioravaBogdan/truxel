import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  company_name?: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        phone_number: data.phone_number,
        company_name: data.company_name,
        subscription_tier: 'trial',
        subscription_status: 'active',
        trial_searches_used: 0,
        monthly_searches_used: 0,
      });

    if (profileError) throw profileError;

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getProfile(userId: string, accessToken?: string): Promise<Profile | null> {
    console.log('authService.getProfile called with userId:', userId);
    
    try {
      // Use REST API directly instead of Supabase client (fixes mobile timeout issue)
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      // Use provided access token or fallback to anon key
      const token = accessToken || SUPABASE_KEY;

      console.log('authService.getProfile: Using token type:', accessToken ? 'USER_JWT' : 'ANON_KEY');

      const url = `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*`;
      console.log('authService.getProfile: Fetching URL:', url);

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('authService.getProfile: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('authService.getProfile HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('authService.getProfile success, data:', data);
      console.log('authService.getProfile: Data type:', typeof data, 'Is array:', Array.isArray(data), 'Length:', data?.length);
      
      // REST API returns array, we need first item
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('authService.getProfile error:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
