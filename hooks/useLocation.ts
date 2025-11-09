import * as Location from 'expo-location';
import { safeRequestLocationPermissions, safeGetCurrentPosition, safeReverseGeocode } from '@/utils/safeNativeModules';

/**
 * Mobile Location Hook
 * Uses Expo Location for iOS and Android with safe wrappers to prevent crashes
 */
export const useLocation = () => {
  const getCurrentLocation = async () => {
    const status = await safeRequestLocationPermissions();
    if (!status || status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const location = await safeGetCurrentPosition({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
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
