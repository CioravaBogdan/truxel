/**
 * Safe Native Modules - iOS Crash Prevention
 * 
 * CRITICAL: All native module calls MUST go through these wrappers
 * to prevent iOS TestFlight crashes (EXC_CRASH SIGABRT).
 * 
 * Root Cause of Crashes:
 * - Linking.openURL() fails when app not installed → app crash
 * - Location services throw if permissions denied → app crash
 * - Notifications throw if not supported → app crash
 * 
 * Solution: Defensive programming with try-catch + canOpenURL checks
 */

import { Linking, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export type SafeLinkingResult = 
  | { success: true }
  | { success: false; error: string; userMessage: string };

/**
 * Safe wrapper for Linking.openURL with canOpenURL check
 * ALWAYS use this instead of direct Linking.openURL calls
 * 
 * @param url - URL to open (whatsapp://, mailto:, tel:, https://)
 * @param fallbackMessage - Message to show user if URL can't open
 * @returns Result object with success status and error details
 */
export async function safeLinkingOpenURL(
  url: string,
  fallbackMessage: string
): Promise<SafeLinkingResult> {
  try {
    // Step 1: Validate URL format
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return {
        success: false,
        error: 'Invalid URL: empty or not a string',
        userMessage: fallbackMessage
      };
    }

    // Step 2: Check if URL can be opened (prevents crash)
    const canOpen = await Linking.canOpenURL(url);
    
    if (!canOpen) {
      console.warn('[SafeNativeModules] Cannot open URL:', url);
      return {
        success: false,
        error: `URL scheme not supported: ${url.split('://')[0]}`,
        userMessage: fallbackMessage
      };
    }

    // Step 3: Attempt to open URL
    await Linking.openURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('[SafeNativeModules] Error opening URL:', url, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      userMessage: fallbackMessage
    };
  }
}

/**
 * Safe wrapper for opening WhatsApp with multiple fallback schemes
 * Tries regular WhatsApp, then WhatsApp Business, then web.whatsapp.com
 * 
 * @param phone - Phone number with country code (+40...)
 * @param message - Pre-filled message
 * @returns Result object
 */
export async function safeOpenWhatsApp(
  phone: string,
  message: string,
  fallbackMessage: string
): Promise<SafeLinkingResult> {
  // Validate phone format
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  if (!cleanPhone || !cleanPhone.startsWith('+')) {
    return {
      success: false,
      error: 'Invalid phone format (must start with +)',
      userMessage: fallbackMessage
    };
  }

  const encodedMessage = encodeURIComponent(message);
  const phoneDigits = cleanPhone.replace(/\+/g, '');

  // Try schemes in order
  const schemes = [
    `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`,
    `whatsapp://send?phone=${phoneDigits}&text=${encodedMessage}`,
    `https://wa.me/${phoneDigits}?text=${encodedMessage}`,
  ];

  for (const url of schemes) {
    const result = await safeLinkingOpenURL(url, fallbackMessage);
    if (result.success) {
      return result;
    }
  }

  // All schemes failed
  return {
    success: false,
    error: 'WhatsApp not installed or not accessible',
    userMessage: fallbackMessage
  };
}

/**
 * Safe wrapper for opening email client
 * 
 * @param email - Email address
 * @param subject - Email subject
 * @param body - Email body
 * @returns Result object
 */
export async function safeOpenEmail(
  email: string,
  subject: string,
  body: string,
  fallbackMessage: string
): Promise<SafeLinkingResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      error: 'Invalid email format',
      userMessage: fallbackMessage
    };
  }

  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  return safeLinkingOpenURL(mailto, fallbackMessage);
}

/**
 * Safe wrapper for opening phone dialer
 * 
 * @param phone - Phone number
 * @returns Result object
 */
export async function safeOpenPhone(
  phone: string,
  fallbackMessage: string
): Promise<SafeLinkingResult> {
  // Validate phone format
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  if (!cleanPhone) {
    return {
      success: false,
      error: 'Invalid phone format',
      userMessage: fallbackMessage
    };
  }

  const telUrl = `tel:${cleanPhone}`;
  
  return safeLinkingOpenURL(telUrl, fallbackMessage);
}

/**
 * Safe wrapper for Location.requestForegroundPermissionsAsync
 * Handles permission denials gracefully without crashing
 * 
 * @returns Permission status or null if error
 */
export async function safeRequestLocationPermissions(): Promise<Location.PermissionStatus | null> {
  try {
    if (Platform.OS === 'web') {
      console.warn('[SafeNativeModules] Location not supported on web');
      return null;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error('[SafeNativeModules] Error requesting location permissions:', error);
    return null;
  }
}

/**
 * Safe wrapper for Location.getCurrentPositionAsync
 * Returns location or null if error/denied
 * 
 * Android: Uses 5s timeout for faster response
 * iOS: Uses default timeout (longer but more accurate)
 * 
 * @param options - Location options
 * @returns Location object or null
 */
export async function safeGetCurrentPosition(
  options?: Location.LocationOptions
): Promise<Location.LocationObject | null> {
  try {
    if (Platform.OS === 'web') {
      console.warn('[SafeNativeModules] Location not supported on web');
      return null;
    }

    // Android: 5s timeout for faster response with network location
    // iOS: Default timeout (no timeout option needed)
    const defaultOptions: Location.LocationOptions = {
      accuracy: Location.Accuracy.Balanced,
      ...(Platform.OS === 'android' && { timeInterval: 5000 }), // 5 second timeout on Android
    };

    const location = await Location.getCurrentPositionAsync(options || defaultOptions);

    return location;
  } catch (error) {
    console.error('[SafeNativeModules] Error getting current position:', error);
    return null;
  }
}

/**
 * Safe wrapper for Location.reverseGeocodeAsync
 * Returns address or null if error
 * 
 * @param coords - Latitude and longitude
 * @returns Geocoded address or null
 */
export async function safeReverseGeocode(
  coords: { latitude: number; longitude: number }
): Promise<Location.LocationGeocodedAddress | null> {
  try {
    if (Platform.OS === 'web') {
      console.warn('[SafeNativeModules] Geocoding not supported on web');
      return null;
    }

    const results = await Location.reverseGeocodeAsync(coords);
    return results[0] || null;
  } catch (error) {
    console.error('[SafeNativeModules] Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Safe wrapper for Notifications.requestPermissionsAsync
 * Handles permission denials gracefully
 * 
 * @returns Permission status or null if error
 */
export async function safeRequestNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus | null> {
  try {
    if (Platform.OS === 'web') {
      console.warn('[SafeNativeModules] Notifications not supported on web');
      return null;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return { status } as Notifications.NotificationPermissionsStatus;
  } catch (error) {
    console.error('[SafeNativeModules] Error requesting notification permissions:', error);
    return null;
  }
}

/**
 * Safe wrapper for Notifications.getExpoPushTokenAsync
 * Returns push token or null if error
 * 
 * @param options - Push token options
 * @returns Expo push token or null
 */
export async function safeGetExpoPushToken(
  options: { projectId: string }
): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      console.warn('[SafeNativeModules] Push notifications not supported on web');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync(options);
    return token.data;
  } catch (error) {
    console.error('[SafeNativeModules] Error getting push token:', error);
    return null;
  }
}

/**
 * Safe wrapper for Notifications.scheduleNotificationAsync
 * Schedules notification or logs error if fails
 * 
 * @param content - Notification content
 * @param trigger - Notification trigger (null = immediate)
 * @returns Notification ID or null if error
 */
export async function safeScheduleNotification(
  content: Notifications.NotificationContentInput,
  trigger: Notifications.NotificationTriggerInput | null
): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      console.warn('[SafeNativeModules] Local notifications not supported on web');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('[SafeNativeModules] Error scheduling notification:', error);
    return null;
  }
}

/**
 * Show user-friendly error alert when native operation fails
 * 
 * @param title - Alert title
 * @param message - Alert message
 */
export function showNativeModuleError(title: string, message: string): void {
  Alert.alert(title, message, [
    { text: 'OK', style: 'default' }
  ]);
}
