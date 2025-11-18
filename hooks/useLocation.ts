import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { safeRequestLocationPermissions, safeGetCurrentPosition, safeReverseGeocode } from '@/utils/safeNativeModules';

/**
 * Mobile Location Hook
 * Uses Expo Location for iOS and Android with safe wrappers to prevent crashes
 * 
 * Android: Low accuracy (network-based, 1-3 seconds) - FAST ⚡
 * iOS: Uses default from safeNativeModules (Balanced) - DON'T TOUCH! ✋
 */
export const useLocation = () => {
  const getCurrentLocation = async () => {
    const status = await safeRequestLocationPermissions();
    if (!status || status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Platform-specific location fetch:
    // Android: Explicitly use Low accuracy (network-based, FAST)
    // iOS: Don't pass options, let safeNativeModules use default (Balanced)
    const location = Platform.OS === 'android'
      ? await safeGetCurrentPosition({ accuracy: Location.Accuracy.Low })
      : await safeGetCurrentPosition();

    if (!location) {
      throw new Error('Failed to get current location');
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    const result = await safeReverseGeocode({
      latitude,
      longitude,
    });

    if (result) {
      return `${result.city || result.region || ''}, ${result.country || ''}`;
    }

    return '';
  };

  return {
    getCurrentLocation,
    reverseGeocode,
  };
};
