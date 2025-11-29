export type SubscriptionTier = 'trial' | 'standard' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'won' | 'lost';
export type SearchStatus = 'pending' | 'completed' | 'failed';
export type NotificationType = 'search_completed' | 'community_alert' | 'system' | 'promotion';
export type TransactionType = 'subscription' | 'search_pack' | 'renewal';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type Language = 'en' | 'ro' | 'pl' | 'tr' | 'lt' | 'es';
export type DistanceUnit = 'km' | 'mi';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  company_name?: string;
  avatar_url?: string;
  truck_type?: string;
  search_radius_km?: number;
  preferred_industries?: string[];
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_searches_used: number;
  monthly_searches_used: number;
  available_search_credits: number;
  subscription_start_date: string;
  subscription_renewal_date?: string;
  preferred_language: Language;
  preferred_distance_unit: DistanceUnit;
  expo_push_token?: string;
  last_known_city?: string;
  last_known_lat?: number;
  last_known_lng?: number;
  notification_radius_km?: number;
  community_notifications_enabled?: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
  stripe_current_period_end?: string;
  pending_tier_change?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string; // Lead ID from leads table (company data)
  user_lead_id?: string; // Junction table ID from user_leads (for updates/deletes)
  source_type?: 'search' | 'community'; // Type of source (N8N search or Community post)
  source_id?: string; // ID of source (community_posts.id if from Community)
  company_name: string;
  contact_person_name?: string;
  email?: string;
  emails?: string; // New column
  phone?: string;
  phones?: string; // New column
  whatsapp?: string;
  linkedin?: string;
  // linkedin_profile_url removed as it's not in DB schema
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
  saved_at?: string; // When user saved this lead (from user_leads)
  last_contacted_at?: string; // When user last contacted this lead (from user_leads)
  ai_match_score?: number;
  match_reasons?: { reason: string; weight: number }[];
  employee_count?: number;
  founded_year?: number;
  annual_revenue?: string;
  social_links?: { [key: string]: string };
  review_count?: string;
  snapchat?: string;
  telegram?: string;
  tiktok?: string;
  X?: string;
  yelp?: string;
  youtube?: string;
  company_id?: string;
  keywords_searched?: string;
  region?: string;
  google_place_id?: string;
  google_url_place?: string;
  google_url_photo?: string;
  google_rating?: string;
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

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
  is_read: boolean;
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
