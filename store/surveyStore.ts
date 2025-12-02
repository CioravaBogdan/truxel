import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Survey, SurveyResponse } from '@/types/database.types';
import { useAuthStore } from './authStore';

interface SurveyState {
  activeSurvey: Survey | null;
  isLoading: boolean;
  hasChecked: boolean;
  fetchActiveSurvey: () => Promise<void>;
  submitResponse: (surveyId: string, answers: Record<string, string>, customResponse?: string) => Promise<boolean>;
  dismissSurvey: () => void; // Locally dismiss for session
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  activeSurvey: null,
  isLoading: false,
  hasChecked: false,

  fetchActiveSurvey: async () => {
    const { user, profile } = useAuthStore.getState();
    if (!user || !profile) return;

    set({ isLoading: true });

    try {
      // 1. Get active surveys
      // We can't easily filter by array containment in Supabase JS for 'target_countries' 
      // if we want "contains profile.country OR is null".
      // So we fetch active surveys and filter in memory (assuming low volume of active surveys).
      
      const { data: surveys, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      if (!surveys || surveys.length === 0) {
        set({ activeSurvey: null, hasChecked: true, isLoading: false });
        return;
      }

      const now = new Date();

      // 2. Filter by Country, Subscription Tier, and Dates
      const eligibleSurveys = surveys.filter(survey => {
        // Date checks
        if (survey.starts_at && new Date(survey.starts_at) > now) return false;
        if (survey.ends_at && new Date(survey.ends_at) < now) return false;

        // Country check
        if (survey.target_countries && survey.target_countries.length > 0) {
          if (!profile.country || !survey.target_countries.includes(profile.country)) {
            return false;
          }
        }

        // Tier check (simple hierarchy check)
        if (survey.min_subscription_tier) {
           // If user is trial, and survey requires standard+, skip
           if (profile.subscription_tier === 'trial' && survey.min_subscription_tier !== 'trial') {
             return false;
           }
           // Add more tier logic if needed (e.g. standard < pro < premium)
        }

        return true;
      });

      if (eligibleSurveys.length === 0) {
        set({ activeSurvey: null, hasChecked: true, isLoading: false });
        return;
      }

      // 3. Check if user already responded to these surveys
      const surveyIds = eligibleSurveys.map(s => s.id);
      const { data: responses, error: respError } = await supabase
        .from('survey_responses')
        .select('survey_id')
        .eq('user_id', user.id)
        .in('survey_id', surveyIds);

      if (respError) throw respError;

      const respondedSurveyIds = new Set(responses?.map(r => r.survey_id) || []);
      
      // Find first survey user hasn't responded to
      const nextSurvey = eligibleSurveys.find(s => !respondedSurveyIds.has(s.id));

      set({ activeSurvey: nextSurvey || null, hasChecked: true, isLoading: false });

    } catch (error) {
      console.error('[SurveyStore] Error fetching surveys:', error);
      set({ activeSurvey: null, hasChecked: true, isLoading: false });
    }
  },

  submitResponse: async (surveyId, answers, customResponse) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: surveyId,
          user_id: user.id,
          answers,
          custom_response: customResponse
        });

      if (error) throw error;

      // Clear active survey immediately
      set({ activeSurvey: null });
      return true;
    } catch (error) {
      console.error('[SurveyStore] Error submitting response:', error);
      return false;
    }
  },

  dismissSurvey: () => {
    set({ activeSurvey: null });
  }
}));
