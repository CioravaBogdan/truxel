export type SubscriptionTier = 'trial' | 'standard' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'won' | 'lost';
export type SearchStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'subscription' | 'search_pack' | 'renewal';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type Language = 'en' | 'ro' | 'pl' | 'tr' | 'lt' | 'es';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  company_name?: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_searches_used: number;
  monthly_searches_used: number;
  available_search_credits: number;
  subscription_start_date: string;
  subscription_renewal_date?: string;
  preferred_language: Language;
  expo_push_token?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
  stripe_current_period_end?: string;
  pending_tier_change?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  source_search_id?: string;
  company_name: string;
  contact_person_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  linkedin_profile_url?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: LeadStatus;
  user_notes?: string;
  ai_match_score?: number;
  match_reasons?: { reason: string; weight: number }[];
  employee_count?: number;
  founded_year?: number;
  annual_revenue?: string;
  social_links?: { [key: string]: string };
  created_at: string;
  updated_at: string;
}

export interface Search {
  id: string;
  user_id: string;
  search_type: 'radius' | 'custom';
  search_keywords?: string;
  search_address?: string;
  latitude?: number;
  longitude?: number;
  radius_km: number;
  status: SearchStatus;
  webhook_sent_at?: string;
  completed_at?: string;
  results_count: number;
  error_message?: string;
  created_at: string;
}

export interface SubscriptionTierData {
  id: string;
  tier_name: string;
  price: number;
  searches_per_month: number;
  description?: string;
  stripe_price_id?: string;
  linkedin_enabled: boolean;
  ai_matching_enabled: boolean;
  advanced_research_enabled: boolean;
  max_results_per_search: number;
  created_at: string;
}

export interface AdditionalSearchPack {
  id: string;
  pack_name: string;
  price: number;
  searches_count: number;
  stripe_price_id?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  tier_or_pack_name?: string;
  amount: number;
  stripe_payment_id?: string;
  stripe_subscription_id?: string;
  searches_added?: number;
  status: TransactionStatus;
  created_at: string;
}
