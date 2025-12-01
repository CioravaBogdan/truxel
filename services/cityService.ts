import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { City, LocationInfo } from '../types/community.types';
import {
  safeRequestLocationPermissions,
  safeGetCurrentPosition,
  safeReverseGeocode
} from '@/utils/safeNativeModules';

class CityService {
  private cache: Map<string, { data: City[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly RECENT_CITIES_KEY = 'recent_cities';
  private readonly MAX_RECENT_CITIES = 10;

  /**
   * Search cities by name with fuzzy matching
   */
  async searchCities(query: string, countryCode?: string): Promise<City[]> {
    // Return empty if query too short
    if (query.length < 2) {
      return [];
    }

    // Check cache
    const cacheKey = `${query}-${countryCode || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      let queryBuilder = supabase
        .from('cities')
        .select('*')
        .limit(10);

      // Use both name and ascii_name for better matching
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,ascii_name.ilike.%${query}%`);

      // Filter by country if provided
      if (countryCode) {
        queryBuilder = queryBuilder.eq('country_code', countryCode);
      }

      // Order by importance and population
      queryBuilder = queryBuilder
        .order('importance', { ascending: false })
        .order('population', { ascending: false });

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error searching cities:', error);
        return [];
      }

      // Cache the results
      this.cache.set(cacheKey, { data: data || [], timestamp: Date.now() });

      return data || [];
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  }

  /**
   * Get city by ID
   */
  async getCityById(cityId: string): Promise<City | null> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single();

    if (error) {
      console.error('Error fetching city:', error);
      return null;
    }

    return data as City;
  }

  /**
   * Get popular cities for quick selection
   */
  async getPopularCities(countryCode?: string): Promise<City[]> {
    const cacheKey = `popular-${countryCode || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    let queryBuilder = supabase
      .from('cities')
      .select('*')
      .gt('population', 100000)
      .limit(20);

    if (countryCode) {
      queryBuilder = queryBuilder.eq('country_code', countryCode);
    }

    queryBuilder = queryBuilder
      .order('importance', { ascending: false })
      .order('population', { ascending: false });

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching popular cities:', error);
      return [];
    }

    // Cache results
    this.cache.set(cacheKey, { data: data || [], timestamp: Date.now() });

    return data || [];
  }

  /**
   * Get recent cities from local storage
   */
  async getRecentCities(): Promise<City[]> {
    try {
      const stored = await AsyncStorage.getItem(this.RECENT_CITIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recent cities:', error);
    }
    return [];
  }

  /**
   * Save city to recent list
   */
  async saveToRecent(city: City): Promise<void> {
    try {
      let recent = await this.getRecentCities();

      // Remove if already exists
      recent = recent.filter(c => c.id !== city.id);

      // Add to beginning
      recent.unshift(city);

      // Keep only MAX_RECENT_CITIES
      recent = recent.slice(0, this.MAX_RECENT_CITIES);

      await AsyncStorage.setItem(this.RECENT_CITIES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving recent city:', error);
    }
  }

  /**
   * Get current location and find nearest major city with details
   */
  async getCurrentLocationCity(): Promise<LocationInfo | null> {
    try {
      // Request permission (safe wrapper prevents crashes)
      const status = await safeRequestLocationPermissions();
      if (!status || status !== 'granted') {
        console.log('[CityService] Location permission denied');
        return null;
      }

      // Get current location with timeout (safe wrapper prevents crashes)
      const location = await Promise.race([
        safeGetCurrentPosition({
          accuracy: Location.Accuracy.Balanced,
          // Android needs more time for GPS lock
          timeInterval: 5000,
          distanceInterval: 0,
        }),
        new Promise<Location.LocationObject | null>((resolve) => 
          setTimeout(() => {
            console.warn('[CityService] Location timeout after 10s - using last known or null');
            resolve(null);
          }, 10000)
        )
      ]);

      if (!location) {
        console.log('[CityService] Could not get current location');
        return null;
      }

      const { latitude, longitude } = location.coords;

      // Reverse geocode to capture the exact locality (safe wrapper prevents crashes)
      const reverseGeo = await safeReverseGeocode({ latitude, longitude });

      // Find nearest major city using mathematical calculation
      const nearestMajor = await this.findNearestMajorCityWithDetails(latitude, longitude);

      const locality = reverseGeo?.city || reverseGeo?.district || reverseGeo?.name || reverseGeo?.subregion || undefined;
      
      // Try to find the exact city object in database
      let exactCity: City | null = null;
      if (locality) {
        const { data } = await supabase
          .from('cities')
          .select('*')
          .ilike('name', locality)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          exactCity = data as City;
        }
      }

      const region = reverseGeo?.region || reverseGeo?.subregion || undefined;
      const country = reverseGeo?.country || nearestMajor?.city.country_name;

      const addressParts = [
        locality || reverseGeo?.name,
        region,
        country,
      ].filter(Boolean);

      return {
        latitude,
        longitude,
        city: locality || nearestMajor?.city.name || reverseGeo?.city || 'Unknown',
        locality,
        region,
        country,
        address: addressParts.join(', '),
        nearestMajorCity: nearestMajor?.city,
        nearestMajorCityName: nearestMajor?.city.name,
        nearestMajorCityId: nearestMajor?.city.id,
        distanceToMajor: nearestMajor?.distance,
        directionFromMajor: nearestMajor?.direction,
        detectedCity: exactCity, // Return the exact city object if found
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Find nearest city from coordinates
   */
  async findNearestCity(latitude: number, longitude: number): Promise<City | null> {
    try {
      // For MVP, we'll do a simple query to find cities within a reasonable distance
      // In production, you'd want to use PostGIS functions for accurate distance calculations

      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .gte('lat', latitude - 0.5)
        .lte('lat', latitude + 0.5)
        .gte('lng', longitude - 0.5)
        .lte('lng', longitude + 0.5)
        .limit(10);

      if (error) {
        console.error('Error finding nearest city:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No cities found near coordinates:', { latitude, longitude });
        return null;
      }

      // Calculate distances and sort
      const citiesWithDistance = data.map(city => ({
        ...city,
        distance: this.calculateDistance(latitude, longitude, city.lat, city.lng)
      }));

      citiesWithDistance.sort((a, b) => a.distance - b.distance);

      return citiesWithDistance[0];
    } catch (error) {
      console.error('Exception in findNearestCity:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  /**
   * Calculate direction from one point to another (cardinal direction)
   * Returns translation key instead of hardcoded Romanian text
   */
  calculateDirection(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
    const dLng = toLng - fromLng;
    const dLat = toLat - fromLat;
    
    // Calculate angle in degrees
    const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
    
    // Return translation keys instead of hardcoded Romanian
    if (angle >= -22.5 && angle < 22.5) return 'directions.north';
    if (angle >= 22.5 && angle < 67.5) return 'directions.northeast';
    if (angle >= 67.5 && angle < 112.5) return 'directions.east';
    if (angle >= 112.5 && angle < 157.5) return 'directions.southeast';
    if (angle >= 157.5 || angle < -157.5) return 'directions.south';
    if (angle >= -157.5 && angle < -112.5) return 'directions.southwest';
    if (angle >= -112.5 && angle < -67.5) return 'directions.west';
    return 'directions.northwest';
  }

  /**
   * Get cached major cities or load from database
   */
  async getMajorCities(): Promise<City[]> {
    const cacheKey = 'major-cities-all';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .gt('population', 50000) // Cities with population > 50k
        .order('population', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching major cities:', error);
        return [];
      }

      // Cache for longer (30 minutes)
      this.cache.set(cacheKey, { 
        data: data || [], 
        timestamp: Date.now() 
      });

      // Also save to AsyncStorage for offline access
      try {
        await AsyncStorage.setItem('cached_major_cities', JSON.stringify({
          cities: data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving cities to AsyncStorage:', e);
      }

      return data || [];
    } catch (error) {
      console.error('Exception loading major cities:', error);
      
      // Try to load from AsyncStorage as fallback
      try {
        const stored = await AsyncStorage.getItem('cached_major_cities');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.cities || [];
        }
      } catch (e) {
        console.error('Error loading from AsyncStorage:', e);
      }
      
      return [];
    }
  }

  /**
   * Find nearest major city with distance and direction
   */
  async findNearestMajorCityWithDetails(latitude: number, longitude: number): Promise<{
    city: City;
    distance: number;
    direction: string;
  } | null> {
    try {
      const majorCities = await this.getMajorCities();
      
      if (majorCities.length === 0) {
        return null;
      }

      // Calculate distance to all cities
      const citiesWithDistance = majorCities.map(city => ({
        city,
        distance: this.calculateDistance(latitude, longitude, city.lat, city.lng),
        direction: this.calculateDirection(latitude, longitude, city.lat, city.lng)
      }));

      // Sort by distance
      citiesWithDistance.sort((a, b) => a.distance - b.distance);

      return citiesWithDistance[0];
    } catch (error) {
      console.error('Error finding nearest major city:', error);
      return null;
    }
  }

  /**
   * Format location display with city and distance
   * NOTE: Now returns raw data - formatting moved to components with i18n access
   * Returns: { city, distance, directionKey } for translation in UI
   */
  formatLocationDisplay(
    nearestCity: City, 
    distance: number, 
    directionKey?: string
  ): { city: string, distance: number, directionKey?: string } {
    return {
      city: nearestCity.name,
      distance: Math.round(distance),
      directionKey: distance >= 5 ? directionKey : undefined // Hide direction if < 5km
    };
  }

  /**
   * Send location data to N8N webhook for internal database enrichment
   * NOTE: Fire-and-forget - app does not wait for response
   */
  sendLocationToWebhook(locationData: {
    latitude: number;
    longitude: number;
    nearestCityId?: string;
    nearestCityName?: string;
    distance?: number;
    userId?: string;
    timestamp?: string;
    resolvedCity?: string;
    resolvedCountry?: string;
    region?: string;
    formattedLocation?: string;
  }): void {
    // N8N webhook URL from environment variables
    const webhookUrl = Constants.expoConfig?.extra?.n8nCityWebhook || 'https://automation.truxel.io/webhook/700ac3c5-d6aa-4e35-9181-39fe0f48d7bf';
    
    const payload = {
      lat: locationData.latitude,
      lng: locationData.longitude,
      nearest_city_id: locationData.nearestCityId,
      nearest_city_name: locationData.nearestCityName,
      distance_km: locationData.distance,
      user_id: locationData.userId,
      timestamp: locationData.timestamp || new Date().toISOString(),
      resolved_city: locationData.resolvedCity,
      resolved_country: locationData.resolvedCountry,
      region: locationData.region,
      formatted_location: locationData.formattedLocation,
      source: 'truxel_mobile_app'
    };

    // Fire-and-forget: send without waiting for response
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently ignore errors - this is internal logging only
      // No user impact if N8N is down
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cities by country
   */
  async getCitiesByCountry(countryCode: string, limit: number = 50): Promise<City[]> {
    const cacheKey = `country-${countryCode}-${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('country_code', countryCode)
      .order('importance', { ascending: false })
      .order('population', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching cities by country:', error);
      return [];
    }

    // Cache results
    this.cache.set(cacheKey, { data: data || [], timestamp: Date.now() });

    return data || [];
  }

  /**
   * Validate if a city exists
   */
  async validateCity(cityName: string, countryCode?: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true })
      .ilike('name', cityName)
      .eq(countryCode ? 'country_code' : '', countryCode || '');

    if (error) {
      console.error('Error validating city:', error);
      return false;
    }

    return (count || 0) > 0;
  }

  /**
   * Format city display name
   */
  formatCityDisplay(city: City): string {
    return `${city.name}, ${city.country_name}`;
  }

  /**
   * Get country list from cities
   */
  async getCountries(): Promise<{ code: string; name: string }[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('country_code, country_name')
      .limit(1000);

    if (error) {
      console.error('Error fetching countries:', error);
      return [];
    }

    // Get unique countries
    const uniqueCountries = new Map<string, string>();
    data?.forEach(item => {
      if (item.country_code && item.country_name) {
        uniqueCountries.set(item.country_code, item.country_name);
      }
    });

    return Array.from(uniqueCountries, ([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const cityService = new CityService();