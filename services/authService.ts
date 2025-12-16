import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';
import { User } from '@supabase/supabase-js';
import { autoDetectDistanceUnit } from '@/utils/distance';
import { autoDetectCurrency } from '@/utils/currency';
import * as Localization from 'expo-localization';
import Constants from 'expo-constants';
import { initRevenueCat, logoutRevenueCat } from '@/lib/revenueCat';

import { Platform } from 'react-native';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  company_name?: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Use a web-based redirect URL to avoid "white page" on desktop
    // This page (app/(web)/verify-email.tsx) will handle the token and deep link to the app
    // Ensure 'https://truxel.io/verify-email' is whitelisted in Supabase
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : 'https://truxel.io/verify-email';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: data.full_name,
          phone_number: data.phone_number,
          company_name: data.company_name,
          preferred_distance_unit: autoDetectDistanceUnit(Localization.getLocales()[0]?.languageTag || 'en'),
          preferred_currency: autoDetectCurrency(Localization.getLocales()[0]?.languageTag || 'en'),
          preferred_language: Localization.getLocales()[0]?.languageCode || 'en',
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Profile is auto-created by Supabase Trigger (handle_new_user)
    // We pass all necessary data in options.data above.
    // No manual insert needed here to avoid RLS issues.

    return authData;
  },

  async signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;
    
    // Initialize RevenueCat after successful login
    if (data?.user) {
      await initRevenueCat(data.user.id);
    }
    
    return data;
  },

  async signOut() {
    // Logout from RevenueCat first (safe - has internal checks for initialization)
    await logoutRevenueCat();
    
    // Logout from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // Ignore "Auth session missing" errors (user already logged out)
      if (error.message?.includes('session missing') || error.message?.includes('No session')) {
        console.log('⚠️ Already logged out (no active session)');
        return;
      }
      throw error;
    }
  },

  async resetPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : 'https://truxel.io/verify-email';

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });
    if (error) throw error;
  },

  async resendConfirmation(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : 'https://truxel.io/verify-email';

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo,
      }
    });
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
      const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl;
      const SUPABASE_KEY = Constants.expoConfig?.extra?.supabaseAnonKey;

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
        console.log('authService.getProfile: No profile found immediately. Waiting for trigger...');
        
        // Profile creation is handled by the database trigger (handle_new_user).
        // We wait a bit and retry fetching, but we DO NOT insert manually to avoid RLS/Duplicate errors.
        
        // Wait 1 second for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (profileRecord) {
        return profileRecord;
      }

      // Final fallback: re-fetch profile
      const refetchResponse = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!refetchResponse.ok) {
        const refetchError = await refetchResponse.text();
        console.error('authService.getProfile: Refetch failed:', refetchResponse.status, refetchError);
        return null;
      }

      const refetched = await refetchResponse.json();
      console.log('authService.getProfile: Refetched profile:', refetched);
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

  /**
   * Delete user account and all associated data (GDPR compliance)
   * Calls Supabase Edge Function that deletes:
   * - profiles, user_leads, searches, community_posts, community_interactions
   * - user_post_usage, transactions, user_search_credits, notification_log
   * - support_messages, avatar files, auth.users
   * 
   * IMPORTANT: Does NOT delete from 'leads' table (public company data)
   */
  async deleteAccount(): Promise<void> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    // Call Edge Function with user's access token
    const { data, error } = await supabase.functions.invoke('delete-user-account', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Failed to delete account');
    }

    if (!data?.success) {
      throw new Error('Account deletion failed');
    }

    // Logout from RevenueCat
    await logoutRevenueCat();
  },
};
