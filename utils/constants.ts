import { supportedLanguages } from '@/lib/i18n';

export const LANGUAGE_DETAILS: Record<
  string,
  {
    name: string;
    flag: string;
  }
> = {
  en: { name: 'English', flag: 'EN' },
  ro: { name: 'Romanian', flag: 'RO' },
  pl: { name: 'Polish', flag: 'PL' },
  tr: { name: 'Turkish', flag: 'TR' },
  lt: { name: 'Lithuanian', flag: 'LT' },
  es: { name: 'Spanish', flag: 'ES' },
  fr: { name: 'French', flag: 'FR' },
  de: { name: 'German', flag: 'DE' },
  it: { name: 'Italian', flag: 'IT' },
  uk: { name: 'Ukrainian', flag: 'UA' },
};

export const LANGUAGES = supportedLanguages.map((code) => ({
  code,
  ...(LANGUAGE_DETAILS[code] || {
    name: code.toUpperCase(),
    flag: code.toUpperCase(),
  }),
}));

export const TRUCK_TYPES = [
  { value: '3.5T', label: '3.5T Van' },
  { value: '7.5T', label: '7.5T Truck' },
  { value: '12T', label: '12T Truck' },
  { value: '20T', label: '20T Truck' },
  { value: 'Trailer', label: 'Trailer (13.6m)' },
  { value: 'MegaTrailer', label: 'Mega Trailer' },
  { value: 'Frigo', label: 'Refrigerated' },
  { value: 'Tanker', label: 'Tanker' },
  { value: 'Flatbed', label: 'Flatbed' },
  { value: 'StepDeck', label: 'Step Deck' },
  { value: 'PowerOnly', label: 'Power Only' },
  { value: 'BoxTruck', label: 'Box Truck' },
  { value: 'DryVan', label: 'Dry Van' },
  { value: 'Other', label: 'Other' },
];

export const INDUSTRIES = [
  'Automotive', 'Construction', 'Electronics', 'Food & Beverage', 'Furniture',
  'Metalworking', 'Mining', 'Oil & Gas', 'Paper & Packaging', 'Pharmaceuticals',
  'Plastics', 'Textiles', 'Timber & Wood', 'Retail', 'Agriculture',
  'Chemicals', 'Logistics', 'Manufacturing', 'Waste Management', 'Other',
];

export const PHONE_COUNTRIES = [
  { iso: 'US', name: 'United States', dialCode: '1', flag: '🇺🇸' },
  { iso: 'MX', name: 'Mexico', dialCode: '52', flag: '🇲🇽' },
  { iso: 'RO', name: 'Romania', dialCode: '40', flag: '🇷🇴' },
  { iso: 'PL', name: 'Poland', dialCode: '48', flag: '🇵🇱' },
  { iso: 'DE', name: 'Germany', dialCode: '49', flag: '🇩🇪' },
  { iso: 'AT', name: 'Austria', dialCode: '43', flag: '🇦🇹' },
  { iso: 'ES', name: 'Spain', dialCode: '34', flag: '🇪🇸' },
  { iso: 'IT', name: 'Italy', dialCode: '39', flag: '🇮🇹' },
  { iso: 'FR', name: 'France', dialCode: '33', flag: '🇫🇷' },
  { iso: 'NL', name: 'Netherlands', dialCode: '31', flag: '🇳🇱' },
  { iso: 'BE', name: 'Belgium', dialCode: '32', flag: '🇧🇪' },
  { iso: 'HU', name: 'Hungary', dialCode: '36', flag: '🇭🇺' },
  { iso: 'CZ', name: 'Czechia', dialCode: '420', flag: '🇨🇿' },
  { iso: 'SK', name: 'Slovakia', dialCode: '421', flag: '🇸🇰' },
  { iso: 'BG', name: 'Bulgaria', dialCode: '359', flag: '🇧🇬' },
  { iso: 'GR', name: 'Greece', dialCode: '30', flag: '🇬🇷' },
  { iso: 'PT', name: 'Portugal', dialCode: '351', flag: '🇵🇹' },
  { iso: 'SE', name: 'Sweden', dialCode: '46', flag: '🇸🇪' },
  { iso: 'DK', name: 'Denmark', dialCode: '45', flag: '🇩🇰' },
  { iso: 'FI', name: 'Finland', dialCode: '358', flag: '🇫🇮' },
  { iso: 'IE', name: 'Ireland', dialCode: '353', flag: '🇮🇪' },
  { iso: 'HR', name: 'Croatia', dialCode: '385', flag: '🇭🇷' },
  { iso: 'SI', name: 'Slovenia', dialCode: '386', flag: '🇸🇮' },
  { iso: 'LT', name: 'Lithuania', dialCode: '370', flag: '🇱🇹' },
  { iso: 'LV', name: 'Latvia', dialCode: '371', flag: '🇱🇻' },
  { iso: 'EE', name: 'Estonia', dialCode: '372', flag: '🇪🇪' },
  { iso: 'TR', name: 'Turkey', dialCode: '90', flag: '🇹🇷' },
];
