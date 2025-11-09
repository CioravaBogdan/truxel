/**
 * Web Location Hook
 * Uses Browser Geolocation API for web platform
 * Automatically selected by Expo when running on web
 */
export const useLocation = () => {
  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Use Nominatim (OpenStreetMap) for reverse geocoding - FREE!
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Truxel/1.0', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || '';
      const country = data.address?.country || '';

      return city && country ? `${city}, ${country}` : '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

  return {
    getCurrentLocation,
    reverseGeocode,
  };
};
