import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, X, MapPin, Clock } from 'lucide-react-native';
import { City } from '../../types/community.types';
import { cityService } from '../../services/cityService';
import { debounce } from 'lodash';

// Type for list items (headers + cities)
type HeaderItem = { type: 'header'; title: string; id: string };
type CityItem = City & { type?: string };
type ListItem = HeaderItem | CityItem;

// Type guard
const isHeaderItem = (item: ListItem): item is HeaderItem => {
  return 'type' in item && item.type === 'header';
};

interface CitySearchModalProps {
  onSelect: (city: City) => void;
  onClose: () => void;
  countryCode?: string;
  selectionContext?: 'origin' | 'destination'; // NEW: context for header text
}

export default function CitySearchModal({ 
  onSelect, 
  onClose, 
  countryCode,
  selectionContext = 'destination' // Default to destination for backward compatibility
}: CitySearchModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [recentCities, setRecentCities] = useState<City[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    // Load recent cities
    const recent = await cityService.getRecentCities();
    setRecentCities(recent);

    // Load popular cities
    const popular = await cityService.getPopularCities(countryCode);
    setPopularCities(popular);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = await cityService.searchCities(query, countryCode);
      setSearchResults(results);
      setIsSearching(false);
    }, 300),
    [countryCode]
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleCitySelect = async (city: City) => {
    // Save to recent
    await cityService.saveToRecent(city);
    onSelect(city);
  };

  const renderCity = ({ item }: { item: City }) => {
    // Safety check - ensure item has required fields
    if (!item || !item.id || !item.name) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.cityItem}
        onPress={() => handleCitySelect(item)}
      >
        <MapPin size={20} color="#6B7280" />
        <View style={styles.cityInfo}>
          <Text style={styles.cityName}>{item.name}</Text>
          {item.country_name && (
            <Text style={styles.cityCountry}>{item.country_name}</Text>
          )}
        </View>
        {item.population && item.population > 100000 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('community.popular') || 'Popular'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (searchQuery.length >= 2) {
      if (isSearching) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.searchingText}>{t('community.searching')}</Text>
          </View>
        );
      }

      if (searchResults.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <MapPin size={48} color="#D1D5DB" />
            <Text style={styles.noResultsText}>{t('community.no_results')}</Text>
            <Text style={styles.noResultsHint}>{t('community.try_different_name')}</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={searchResults}
          renderItem={renderCity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      );
    }

    // Show recent and popular when not searching
    // Filter by selected country if provided
    const safeRecentCities = recentCities
      .filter(city => city && city.id && city.name && city.country_name)
      .filter(city => !countryCode || city.country_code === countryCode); // Only show cities from selected country
    
    const recentCityIds = new Set(safeRecentCities.map(c => c.id));
    const safePopularCities = popularCities
      .filter(city => city && city.id && city.name && city.country_name)
      .filter(city => !countryCode || city.country_code === countryCode) // Only show cities from selected country
      .filter(city => !recentCityIds.has(city.id)); // Exclude duplicates from recent
    
    return (
      <FlatList
        data={[
          ...(safeRecentCities.length > 0 ? [{ type: 'header' as const, title: t('community.recent_cities'), id: 'header-recent' }] : []),
          ...safeRecentCities.slice(0, 3).map(city => ({ ...city, type: 'recent' })),
          { type: 'header' as const, title: t('community.popular_cities'), id: 'header-popular' },
          ...safePopularCities.map(city => ({ ...city, type: 'popular' })),
        ] as ListItem[]}
        renderItem={({ item }) => {
          if (isHeaderItem(item)) {
            return (
              <View style={styles.sectionHeader}>
                {item.title === t('community.recent_cities') && <Clock size={16} color="#6B7280" />}
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
            );
          }
          return renderCity({ item: item as City });
        }}
        keyExtractor={(item, index) => ('id' in item && item.id ? String(item.id) : `item-${index}`)}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {selectionContext === 'origin' 
                ? t('community.select_origin_city') 
                : t('community.select_city')}
            </Text>
            <Text style={styles.subtitle}>
              {selectionContext === 'origin'
                ? t('community.select_origin_hint')
                : t('community.select_destination_hint')}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('community.search_city')}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  cityCountry: {
    fontSize: 14,
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  searchingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  noResultsHint: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});