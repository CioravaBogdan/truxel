// Community Feature Types

export type PostType = 'DRIVER_AVAILABLE' | 'LOAD_AVAILABLE';
export type PostStatus = 'active' | 'expired' | 'cancelled';
export type InteractionType = 'view' | 'interested' | 'contacted' | 'saved';

// Database table types
export interface CommunityPost {
  id: string;
  user_id: string;
  post_type: PostType;
  status: PostStatus;

  // Location
  origin_lat: number;
  origin_lng: number;
  origin_city: string;
  origin_country: string;

  // Optional destination
  dest_city?: string;
  dest_country?: string;
  dest_lat?: number;
  dest_lng?: number;

  // Content
  template_key: string;
  metadata: PostMetadata;

  // Contact
  contact_phone?: string;
  contact_whatsapp?: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  expires_at: string;

  // Stats
  view_count: number;
  contact_count: number;

  // Relations (when joined)
  profile?: {
    full_name: string;
    company_name?: string;
    truck_type?: string;
    avatar_url?: string;
    email?: string;
    phone_number?: string;
  };
}

export interface City {
  id: string;
  name: string;
  ascii_name: string;
  country_code: string;
  country_name: string;
  lat: number;
  lng: number;
  population?: number;
  importance?: number;
}

export interface SubscriptionLimits {
  tier: string;
  posts_per_month: number;
  posts_per_day: number;
  concurrent_active_posts: number;
  post_duration_hours: number;
  features: {
    contact_visible?: boolean;
    priority_display?: boolean;
    analytics?: boolean;
  };
}

export interface UserPostUsage {
  user_id: string;
  posts_this_month: number;
  posts_today: number;
  last_post_at?: string;
  month_reset_at: string;
  day_reset_at: string;
}

export interface CommunityInteraction {
  id: string;
  post_id: string;
  user_id: string;
  interaction_type: InteractionType;
  metadata?: Record<string, any>;
  created_at: string;
}

// Metadata types for different post types
export interface DriverAvailableMetadata {
  truck_type?: string;
  truck_capacity_tons?: number;
  direction?: 'north' | 'south' | 'east' | 'west';
  available_hours?: number;
  industries?: string[];
}

export interface LoadAvailableMetadata {
  truck_type_required?: string;
  cargo_tons?: number;
  cargo_type?: string;
  departure?: 'now' | 'today' | 'tomorrow';
  price_per_km?: number;
  loading_type?: 'manual' | 'forklift' | 'crane';
  unloading_type?: 'manual' | 'forklift' | 'crane';
}

export type PostMetadata = DriverAvailableMetadata | LoadAvailableMetadata;

// Templates
export interface PostTemplate {
  key: string;
  type: PostType;
  textKey: string; // Translation key instead of hardcoded text
  icon: string;
  requiredFields?: string[];
}

export const AVAILABILITY_TEMPLATES: PostTemplate[] = [
  { key: 'local', type: 'DRIVER_AVAILABLE', textKey: 'community.templates.availability.local', icon: '📍' },
  { key: 'north', type: 'DRIVER_AVAILABLE', textKey: 'community.templates.availability.north', icon: '⬆️' },
  { key: 'south', type: 'DRIVER_AVAILABLE', textKey: 'community.templates.availability.south', icon: '⬇️' },
  { key: 'east', type: 'DRIVER_AVAILABLE', textKey: 'community.templates.availability.east', icon: '➡️' },
  { key: 'west', type: 'DRIVER_AVAILABLE', textKey: 'community.templates.availability.west', icon: '⬅️' }
];

export const ROUTE_TEMPLATES: PostTemplate[] = [
  { key: 'loaded', type: 'LOAD_AVAILABLE', textKey: 'community.templates.route.loaded', icon: '🚛' },
  { key: 'empty', type: 'LOAD_AVAILABLE', textKey: 'community.templates.route.empty', icon: '📅' },
  { key: 'return', type: 'LOAD_AVAILABLE', textKey: 'community.templates.route.return', icon: '🔄' }
];

// API Response types
export interface PostsResponse {
  data: CommunityPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface CanPostResponse {
  can_post: boolean;
  reason?: string;
  posts_remaining_month: number;
  posts_remaining_today: number;
  active_posts: number;
  tier: string;
}

// Create/Update types
export interface CreatePostData {
  post_type: PostType;
  template_key: string;
  origin_lat: number;
  origin_lng: number;
  origin_city: string;
  origin_country?: string;
  dest_city?: string;
  dest_country?: string;
  dest_lat?: number;
  dest_lng?: number;
  metadata: PostMetadata;
  contact_phone?: string;
  contact_whatsapp?: boolean;
}

export interface UpdatePostData {
  status?: PostStatus;
  metadata?: Partial<PostMetadata>;
  expires_at?: string;
}

// Filter types
export interface PostFilters {
  post_type?: PostType;
  origin_city?: string;
  dest_city?: string;
  radius_km?: number;
  user_id?: string;
  status?: PostStatus;
  limit?: number;
  cursor?: string;
}

// Location types
export interface LocationInfo {
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  region?: string;
  country?: string;
  address?: string;
  nearestMajorCity?: City;
  distanceToMajor?: number;
  directionFromMajor?: string;
  nearestMajorCityName?: string;
  nearestMajorCityId?: string;
}