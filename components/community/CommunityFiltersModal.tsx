import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Search, X, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Country } from '@/types/community.types';
import { useTheme } from '../../lib/theme';

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  onClear?: () => void;
  selectedCountryCode?: string;
}

// North American countries (priority markets)
const NORTH_AMERICAN_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
];

// European countries with logistics relevance
const EUROPEAN_COUNTRIES: Country[] = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'TR', name: 'Turkey' },
  { code: 'GB', name: 'United Kingdom' },
];

// Combined list: North America first (priority), then Europe alphabetically
const ALL_COUNTRIES: Country[] = [
  ...NORTH_AMERICAN_COUNTRIES,
  ...EUROPEAN_COUNTRIES,
];

export default function CountryPickerModal({
  visible,
  onClose,
  onSelect,
  onClear,
  selectedCountryCode,
}: CountryPickerModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    
    const query = searchQuery.toLowerCase();
    return ALL_COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setSearchQuery(''); // Reset search on select
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('community.select_country')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={t('community.search_country')}
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Clear Filter Button */}
        {selectedCountryCode && onClear && (
          <TouchableOpacity style={[styles.clearFilterButton, { backgroundColor: theme.colors.error + '20' }]} onPress={handleClear}>
            <Text style={[styles.clearFilterText, { color: theme.colors.error }]}>{t('community.clear_filter')}</Text>
          </TouchableOpacity>
        )}

        {/* Countries List */}
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCountryCode;
            return (
              <TouchableOpacity
                style={[
                  styles.countryItem, 
                  { backgroundColor: theme.colors.card },
                  isSelected && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary, borderWidth: 1 }
                ]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.countryInfo}>
                  <Text style={styles.countryFlag}>{getFlagEmoji(item.code)}</Text>
                  <Text style={[
                    styles.countryName, 
                    { color: theme.colors.text },
                    isSelected && { color: theme.colors.primary }
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.countryCode, { color: theme.colors.textSecondary }]}>{item.code}</Text>
                </View>
                {isSelected && <Check size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('community.no_countries_found')}</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  );
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearFilterButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  selectedCountryItem: {
    // Removed hardcoded styles
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedCountryName: {
    fontWeight: '600',
  },
  countryCode: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
