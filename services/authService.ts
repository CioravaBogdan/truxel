import { supabase } from '@/lib/supabase';
import { Language, Profile } from '@/types/database.types';
import { User } from '@supabase/supabase-js';
import { autoDetectDistanceUnit } from '@/utils/distance';
import * as Localization from 'expo-localization';

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

    // Auto-detect distance unit based on device locale
    const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en';
    const distanceUnit = autoDetectDistanceUnit(deviceLocale);

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
        preferred_distance_unit: distanceUnit, // Auto-detect km or mi based on locale
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

  async getProfile(
    userId: string,
    accessToken?: string,
    sessionUser?: User | null
  ): Promise<Profile | null> {
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

      let profileRecord: Profile | null = null;

      if (Array.isArray(data) && data.length > 0) {
        profileRecord = data[0];
      } else {
        console.log('authService.getProfile: No profile found, attempting to create default profile');

        const fallbackEmail = sessionUser?.email || sessionUser?.user_metadata?.email || '';
        const fallbackFullName =
          sessionUser?.user_metadata?.full_name ||
          (fallbackEmail ? fallbackEmail.split('@')[0] : '') ||
          'Truxel Logistics Partner';
        const fallbackLanguage =
          (sessionUser?.user_metadata?.preferred_language as Language | undefined) || 'en';

        const defaultProfilePayload = {
          user_id: userId,
          email: fallbackEmail || `${userId}@placeholder.truxel`,
          full_name: fallbackFullName,
          subscription_tier: 'trial',
          subscription_status: 'active',
          trial_searches_used: 0,
          monthly_searches_used: 0,
          available_search_credits: 0,
          preferred_language: fallbackLanguage,
        } satisfies Partial<Profile> & {
          user_id: string;
          email: string;
          full_name: string;
          preferred_language: Language;
        };

        try {
          const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY!,
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(defaultProfilePayload),
          });

          console.log('authService.getProfile: Create profile status:', createResponse.status);

          if (!createResponse.ok) {
            const createError = await createResponse.text();
            console.error('authService.getProfile: Failed to auto-create profile:', createResponse.status, createError);
          } else {
            const created = await createResponse.json();
            console.log('authService.getProfile: Default profile created:', created);

            if (Array.isArray(created) && created.length > 0) {
              profileRecord = created[0];
            }
          }
        } catch (creationError) {
          console.error('authService.getProfile: Error creating default profile:', creationError);
        }
      }

      if (profileRecord) {
        return profileRecord;
      }

      // Final fallback: re-fetch profile in case creation succeeded but returned empty body or conflict occurred
      const refetchResponse = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!refetchResponse.ok) {
        const refetchError = await refetchResponse.text();
        console.error('authService.getProfile: Refetch after auto-create failed:', refetchResponse.status, refetchError);
        return null;
      }

      const refetched = await refetchResponse.json();
      console.log('authService.getProfile: Refetched profile after creation attempt:', refetched);
      return Array.isArray(refetched) && refetched.length > 0 ? refetched[0] : null;
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
