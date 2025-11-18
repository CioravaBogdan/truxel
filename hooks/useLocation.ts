import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { safeRequestLocationPermissions, safeGetCurrentPosition, safeReverseGeocode } from '@/utils/safeNativeModules';

/**
 * Mobile Location Hook
 * Uses Expo Location for iOS and Android with safe wrappers to prevent crashes
 * Android: Uses Low accuracy for faster network-based location
 * iOS: Uses Balanced accuracy (Low causes issues on some iOS versions)
 */
export const useLocation = () => {
  const getCurrentLocation = async () => {
    const status = await safeRequestLocationPermissions();
    if (!status || status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Android: Low accuracy is fast and works well (network-based)
    // iOS: Balanced accuracy to avoid native module crashes
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
