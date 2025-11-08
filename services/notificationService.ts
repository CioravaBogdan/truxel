import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LAST_CHECK_KEY = 'notification_last_check';
const POLLING_INTERVAL = 7 * 60 * 1000; // 7 minutes (between 5-10min as requested)

/**
 * NotificationService - Location-based push notifications
 * 
 * Features:
 * - Polls Supabase every 5-10 minutes for new posts
 * - Filters posts by user's city/location
 * - Sends local notification when new load appears
 * - Checks on app open + periodic background checks
 * 
 * User Requirement: "sa primeasca notificatia cand se posteaza un load 
 * din orasul unde sunt ei, sa avem un fel de interogare de supabase 
 * la deschiderea aplicatiei si la intervale de 5-10 minute"
 */
class NotificationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;

  /**
   * Initialize notification service
   * - Requests permissions
   * - Registers push token
   * - Performs initial check
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      this.userId = userId;

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationService] Permissions not granted');
        return false;
      }

      // Get and save Expo push token (for future server-side notifications)
      if (Platform.OS !== 'web') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('[NotificationService] Expo push token:', token);

        // Save token to user profile
        await supabase
          .from('profiles')
          .update({ expo_push_token: token })
          .eq('user_id', userId);
      }

      // Perform initial check
      await this.checkForNewPosts();

      console.log('[NotificationService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Start polling for new posts
   * Checks every 5-10 minutes
   */
  startLocationPolling(): void {
    if (this.intervalId) {
      console.log('[NotificationService] Polling already running');
      return;
    }

    console.log(`[NotificationService] Starting location polling (${POLLING_INTERVAL / 60000}min interval)`);

    this.intervalId = setInterval(() => {
      this.checkForNewPosts();
    }, POLLING_INTERVAL);
  }

  /**
   * Stop polling
   */
  stopLocationPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[NotificationService] Stopped location polling');
    }
  }

  /**
   * Check for new posts in user's location
   * Core logic: Query Supabase for posts created after last check
   */
  private async checkForNewPosts(): Promise<void> {
    try {
      if (!this.userId) {
        console.warn('[NotificationService] No userId set');
        return;
      }

      // Get user's location
      const userLocation = await this.getUserLocation();
      if (!userLocation) {
        console.log('[NotificationService] Could not get user location');
        return;
      }

      // Get last check timestamp
      const lastCheck = await this.getLastCheckTimestamp();
      const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      console.log(`[NotificationService] Checking for posts since ${lastCheckDate.toISOString()}`);

      // Query new posts near user's location
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('id, post_type, origin_city, cargo_type, cargo_weight, created_at, profiles(company_name)')
        .gte('created_at', lastCheckDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[NotificationService] Error fetching posts:', error);
        return;
      }

      if (!posts || posts.length === 0) {
        console.log('[NotificationService] No new posts found');
        await this.updateLastCheckTimestamp();
        return;
      }

      // Filter posts by city match
      const matchingPosts = posts.filter(post => 
        this.isCityMatch(post.origin_city, userLocation.city)
      );

      if (matchingPosts.length > 0) {
        console.log(`[NotificationService] Found ${matchingPosts.length} new posts in user's city`);
        
        // Send notification for the most recent post
        const latestPost = matchingPosts[0];
        await this.sendLocalNotification(latestPost);
      } else {
        console.log('[NotificationService] No posts match user location');
      }

      // Update last check timestamp
      await this.updateLastCheckTimestamp();

    } catch (error) {
      console.error('[NotificationService] Error checking posts:', error);
    }
  }

  /**
   * Get user's current location from profile
   */
  private async getUserLocation(): Promise<{ city: string; lat: number; lng: number } | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('last_known_city, last_known_lat, last_known_lng')
        .eq('user_id', this.userId)
        .single();

      if (error || !profile?.last_known_city) {
        return null;
      }

      return {
        city: profile.last_known_city,
        lat: profile.last_known_lat || 0,
        lng: profile.last_known_lng || 0
      };
    } catch (error) {
      console.error('[NotificationService] Error getting user location:', error);
      return null;
    }
  }

  /**
   * Check if post city matches user city
   * Handles format: "Bucharest - 42km" → "Bucharest"
   */
  private isCityMatch(postCity: string | null, userCity: string): boolean {
    if (!postCity) return false;

    // Extract city name (remove distance if present)
    const cleanPostCity = postCity.split(' - ')[0].trim().toLowerCase();
    const cleanUserCity = userCity.trim().toLowerCase();

    return cleanPostCity === cleanUserCity;
  }

  /**
   * Send local notification to user
   */
  private async sendLocalNotification(post: any): Promise<void> {
    try {
      const companyName = post.profiles?.company_name || 'A company';
      const city = post.origin_city?.split(' - ')[0] || 'your area';
      const cargoInfo = post.cargo_type 
        ? `${post.cargo_type}${post.cargo_weight ? ` (${post.cargo_weight}t)` : ''}`
        : 'cargo';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚛 New load in ${city}`,
          body: `${companyName} posted: ${cargoInfo}`,
          data: { postId: post.id },
          sound: true,
        },
        trigger: null, // Send immediately
      });

      console.log('[NotificationService] Notification sent');
    } catch (error) {
      console.error('[NotificationService] Error sending notification:', error);
    }
  }

  /**
   * Get last check timestamp from AsyncStorage
   */
  private async getLastCheckTimestamp(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_CHECK_KEY);
    } catch (error) {
      console.error('[NotificationService] Error getting last check:', error);
      return null;
    }
  }

  /**
   * Update last check timestamp
   */
  private async updateLastCheckTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
    } catch (error) {
      console.error('[NotificationService] Error updating last check:', error);
    }
  }

  /**
   * Get status (for debugging)
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
