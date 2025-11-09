/**
 * Distance Conversion Utilities
 * 
 * CRITICAL RULE: All database storage and calculations MUST use kilometers (km).
 * This file ONLY handles UI display conversion between km and miles.
 * 
 * Conversion factor: 1 mile = 1.60934 kilometers
 */

export type DistanceUnit = 'km' | 'mi';

// Conversion constants
const KM_TO_MILES = 0.621371; // 1 km = 0.621371 miles
const MILES_TO_KM = 1.60934; // 1 mile = 1.60934 km

/**
 * Convert kilometers to miles
 * @param km Distance in kilometers
 * @returns Distance in miles
 */
export function kmToMiles(km: number): number {
  return km * KM_TO_MILES;
}

/**
 * Convert miles to kilometers
 * @param miles Distance in miles
 * @returns Distance in kilometers
 */
export function milesToKm(miles: number): number {
  return miles * MILES_TO_KM;
}

/**
 * Convert distance from km (database storage) to user's preferred unit
 * @param distanceInKm Distance in kilometers (database value)
 * @param preferredUnit User's preferred distance unit
 * @returns Distance in user's preferred unit
 */
export function convertDistance(
  distanceInKm: number,
  preferredUnit: DistanceUnit
): number {
  if (preferredUnit === 'mi') {
    return kmToMiles(distanceInKm);
  }
  return distanceInKm; // Already in km
}

/**
 * Convert distance from user's preferred unit to km (for database storage)
 * @param distance Distance in user's preferred unit
 * @param preferredUnit User's preferred distance unit
 * @returns Distance in kilometers (for database storage)
 */
export function convertToKm(
  distance: number,
  preferredUnit: DistanceUnit
): number {
  if (preferredUnit === 'mi') {
    return milesToKm(distance);
  }
  return distance; // Already in km
}

/**
 * Format distance for display with proper rounding and unit label
 * @param distanceInKm Distance in kilometers (database value)
 * @param preferredUnit User's preferred distance unit
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted string with distance and unit (e.g., "5.2 km" or "3.2 mi")
 */
export function formatDistance(
  distanceInKm: number,
  preferredUnit: DistanceUnit,
  decimals: number = 1
): string {
  const converted = convertDistance(distanceInKm, preferredUnit);
  const rounded = converted.toFixed(decimals);
  return `${rounded} ${preferredUnit}`;
}

/**
 * Get display label for distance unit (translated)
 * @param unit Distance unit
 * @returns Full label (kilometers/miles)
 */
export function getUnitLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'Kilometers' : 'Miles';
}

/**
 * Auto-detect preferred distance unit based on device locale
 * @param locale Device locale string (e.g., 'en-US', 'ro-RO')
 * @returns Preferred distance unit
 */
export function autoDetectDistanceUnit(locale?: string): DistanceUnit {
  if (!locale) {
    locale = 'en'; // Safe default
  }

  // Countries that use miles: United States, UK, Myanmar, Liberia
  // For trucking app, we primarily care about US/CA/UK
  const milesCountries = ['US', 'GB', 'MM', 'LR'];
  
  // Extract country code from locale (e.g., 'en-US' -> 'US')
  const countryCode = locale.split('-')[1]?.toUpperCase();
  
  // Check if country uses miles
  if (countryCode && milesCountries.includes(countryCode)) {
    return 'mi';
  }
  
  return 'km'; // Default to kilometers (international standard)
}

/**
 * Common radius values for search/notification settings
 * Stored in km (database), displayed based on user preference
 */
export const RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50, 100];

/**
 * Get radius options formatted for user's preferred unit
 * @param preferredUnit User's preferred distance unit
 * @returns Array of {value: km, label: formatted} objects
 */
export function getRadiusOptions(preferredUnit: DistanceUnit): {
  value: number; // Always in km (for database)
  label: string; // Formatted in user's preferred unit
}[] {
  return RADIUS_OPTIONS_KM.map(km => ({
    value: km,
    label: formatDistance(km, preferredUnit, 0), // No decimals for radius options
  }));
}
