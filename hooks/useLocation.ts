import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { safeRequestLocationPermissions, safeGetCurrentPosition, safeReverseGeocode } from '@/utils/safeNativeModules';

/**
 * Mobile Location Hook
 * Uses Expo Location for iOS and Android with safe wrappers to prevent crashes
 * Android: Uses Low accuracy (network-based) for faster results
 * iOS: Uses Balanced accuracy (GPS + network)
 */
export const useLocation = () => {
  const getCurrentLocation = async () => {
    const status = await safeRequestLocationPermissions();
    if (!status || status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Android: Use Low accuracy (network location) for speed (~1-2 seconds)
    // iOS: Use Balanced accuracy for better precision (~instant)
    const location = await safeGetCurrentPosition({
      accuracy: Platform.OS === 'android' ? Location.Accuracy.Low : Location.Accuracy.Balanced,
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
