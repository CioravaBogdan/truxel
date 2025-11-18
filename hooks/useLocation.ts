import * as Location from 'expo-location';
import { safeRequestLocationPermissions, safeGetCurrentPosition, safeReverseGeocode } from '@/utils/safeNativeModules';

/**
 * Mobile Location Hook
 * Uses Expo Location for iOS and Android with safe wrappers to prevent crashes
 * Uses Lowest accuracy for both platforms for fastest location fetch
 * Lowest = network-based location (1-3 seconds on both iOS and Android)
 */
export const useLocation = () => {
  const getCurrentLocation = async () => {
    const status = await safeRequestLocationPermissions();
    if (!status || status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Android: Use Lowest accuracy (network location) for speed (~1-2 seconds)
    // iOS: Use Lowest accuracy for speed (uses significant location changes)
    // Note: iOS doesn't support Accuracy.Low, use Lowest instead
    const location = await safeGetCurrentPosition({
      accuracy: Location.Accuracy.Lowest,
    });

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
