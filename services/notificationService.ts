import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// @ts-ignore
import notificationSound from '@/assets/sounds/notification.mp3';

import {
  safeRequestNotificationPermissions,
  safeGetExpoPushToken,
  safeScheduleNotification
} from '@/utils/safeNativeModules';

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

      // Configure notification behavior (wrapped in try-catch to prevent iOS crash)
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      } catch (handlerError) {
        console.error('[NotificationService] setNotificationHandler failed (non-critical):', handlerError);
      }

      // Request permissions (safe wrapper prevents crashes)
      const permissionsResult = await safeRequestNotificationPermissions();
      
      if (!permissionsResult || permissionsResult.status !== 'granted') {
        console.log('[NotificationService] Permissions not granted');
        return false;
      }

      // Get and save Expo push token (safe wrapper prevents crashes)
      if (Platform.OS !== 'web') {
        const token = await safeGetExpoPushToken({
          projectId: 'ec6e92c9-663d-4a34-a69a-88ce0ddaafab'
        });
        
        if (!token) {
          console.log('[NotificationService] Could not get push token (non-critical)');
          // Continue anyway - local notifications still work
          return true;
        }
        
        console.log('[NotificationService] Expo push token:', token);

        // Save token to user profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ expo_push_token: token })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[NotificationService] Error saving push token:', updateError);
          throw updateError;
        }

        console.log('[NotificationService] Push token saved to profile');
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
        
        // Play sound
        await this.playNotificationSound();

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
   * Play custom notification sound
   */
  private async playNotificationSound(): Promise<void> {
    try {
      // Configure audio session
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Play sound - using local file from assets
      const { sound } = await Audio.Sound.createAsync(notificationSound);
      
      await sound.playAsync();
      
      // Cleanup
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('[NotificationService] Error playing sound:', error);
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

      const notificationId = await safeScheduleNotification(
        {
          title: `🚛 New load in ${city}`,
          body: `${companyName} posted: ${cargoInfo}`,
          data: { postId: post.id },
          sound: true,
        },
        null // Send immediately
      );

      if (notificationId) {
        console.log('[NotificationService] Notification sent:', notificationId);
      } else {
        console.log('[NotificationService] Could not send notification (non-critical)');
      }
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
