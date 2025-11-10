/**
 * Currency Detection & Formatting Utilities
 * 
 * AUTO-DETECTS user's preferred currency based on device locale:
 * - USD: North America (US, CA, MX)
 * - EUR: Europe and rest of world (default)
 * 
 * Similar pattern to distance.ts (Miles vs KM detection)
 */

export type CurrencyCode = 'EUR' | 'USD';

/**
 * Auto-detect preferred currency based on device locale
 * @param locale Device locale string (e.g., 'en-US', 'ro-RO', 'en-CA')
 * @returns Preferred currency code
 */
export function autoDetectCurrency(locale?: string): CurrencyCode {
  if (!locale) {
    return 'EUR'; // Safe default for European logistics market
  }

  // North America countries use USD
  const usdCountries = ['US', 'CA', 'MX'];
  
  // Extract country code from locale (e.g., 'en-US' -> 'US')
  const countryCode = locale.split('-')[1]?.toUpperCase();
  
  // Check if country uses USD
  if (countryCode && usdCountries.includes(countryCode)) {
    return 'USD';
  }
  
  return 'EUR'; // Default to Euro (primary European logistics market)
}

/**
 * Format price with currency symbol
 * @param amount Price amount
 * @param currency Currency code
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted price string (e.g., "€29.99" or "$29.99")
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode,
  decimals: number = 2
): string {
  const symbol = currency === 'USD' ? '$' : '€';
  const formatted = amount.toFixed(decimals);
  
  // USD: symbol before amount ($29.99)
  // EUR: symbol after amount (29.99€) - but for consistency we use before
  return `${symbol}${formatted}`;
}

/**
 * Get currency symbol
 * @param currency Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return currency === 'USD' ? '$' : '€';
}

/**
 * Convert price between currencies (simplified - real app should use live rates)
 * NOTE: This is approximate conversion for display purposes only
 * Real subscription prices should be set separately in Stripe for each currency
 * @param amount Amount in source currency
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @returns Converted amount (approximate)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Approximate conversion rate (EUR to USD ~ 1.10, USD to EUR ~ 0.91)
  // WARNING: Use Stripe's multi-currency pricing instead of conversion in production!
  const EUR_TO_USD = 1.10;
  const USD_TO_EUR = 0.91;

  if (fromCurrency === 'EUR' && toCurrency === 'USD') {
    return amount * EUR_TO_USD;
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'EUR') {
    return amount * USD_TO_EUR;
  }

  return amount;
}

/**
 * Get display label for currency
 * @param currency Currency code
 * @returns Full label (Euro/US Dollar)
 */
export function getCurrencyLabel(currency: CurrencyCode): string {
  return currency === 'EUR' ? 'Euro (€)' : 'US Dollar ($)';
}

/**
 * Check if locale is in North America (for USD)
 * @param locale Device locale string
 * @returns True if North America region
 */
export function isNorthAmerica(locale?: string): boolean {
  if (!locale) return false;
  
  const countryCode = locale.split('-')[1]?.toUpperCase();
  return countryCode ? ['US', 'CA', 'MX'].includes(countryCode) : false;
}

/**
 * Check if locale is in Europe (for EUR)
 * @param locale Device locale string
 * @returns True if European region
 */
export function isEurope(locale?: string): boolean {
  if (!locale) return true; // Default to Europe
  
  // Major European country codes
  const europeanCountries = [
    'RO', 'PL', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'NO', 'FI', 
    'DK', 'PT', 'GR', 'CZ', 'HU', 'SK', 'SI', 'HR', 'BG', 'LT', 'LV', 'EE',
    'IE', 'CY', 'MT', 'LU', 'GB' // UK uses EUR for logistics despite miles
  ];
  
  const countryCode = locale.split('-')[1]?.toUpperCase();
  return countryCode ? europeanCountries.includes(countryCode) : true;
}
