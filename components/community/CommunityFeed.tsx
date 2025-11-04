import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewToken,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe, MapPin, Package, Truck } from 'lucide-react-native';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import PostCard from './PostCard';
import QuickPostBar from './QuickPostBar';
import CitySearchModal from './CitySearchModal';
import CountryPickerModal from './CommunityFiltersModal';
import { CommunityPost, City, Country } from '../../types/community.types';
import { cityService } from '../../services/cityService';

interface CommunityFeedProps {
  customHeader?: React.ReactNode;
}

export default function CommunityFeed({ customHeader }: CommunityFeedProps = {}) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    posts,
    selectedTab,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    selectedCity,
    selectedCountry,
    loadPosts,
    loadMorePosts,
    refreshPosts,
    setSelectedTab,
    setSelectedCountry,
    setSelectedCity,
    initializeFilters,
    clearError,
    recordView,
  } = useCommunityStore();

  // Local state for modals and initialization
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isCityPickerVisible, setCityPickerVisible] = useState(false);
  const [isInitializingFilters, setIsInitializingFilters] = useState(false);

  // Initialize filters with user location on mount (ONE-SHOT)
  useEffect(() => {
    if (!user?.id) return;
    
    let isMounted = true;

    async function initFilters() {
      try {
        setIsInitializingFilters(true);
        
        const locationInfo = await cityService.getCurrentLocationCity();
        
        if (!isMounted) return;

        if (locationInfo?.nearestMajorCity) {
          const { country_code, country_name } = locationInfo.nearestMajorCity;
          
          await initializeFilters({
            country: { code: country_code, name: country_name },
            city: locationInfo.nearestMajorCity // Pass full City object
          });
        }
      } catch (err) {
        console.log('[CommunityFeed] Location init failed (non-critical):', err);
      } finally {
        if (isMounted) {
          setIsInitializingFilters(false);
        }
      }
    }

    void initFilters();

    return () => {
      isMounted = false;
    };
  }, [user?.id, initializeFilters]);

  // Load posts on mount and tab/filter change
  useEffect(() => {
    void loadPosts(true);
  }, [loadPosts, selectedTab, selectedCity, selectedCountry]);

  // Load user stats when user is available
  useEffect(() => {
    if (user) {
      useCommunityStore.getState().loadCommunityStats(user.id);
      useCommunityStore.getState().checkPostLimits(user.id);
    }
  }, [user]);

  // Filter handlers
  const handleCountryPress = useCallback(() => {
    setCountryPickerVisible(true);
  }, []);

  const handleCityPress = useCallback(() => {
    if (!selectedCountry) {
      Alert.alert(
        t('community.select_country_first'),
        t('community.select_country_before_city')
      );
      return;
    }
    setCityPickerVisible(true);
  }, [selectedCountry, t]);

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setCountryPickerVisible(false);
  }, [setSelectedCountry]);

  const handleCitySelect = useCallback((city: City) => {
    setSelectedCity(city);
    setCityPickerVisible(false);
  }, [setSelectedCity]);

  const handleClearCountry = useCallback(() => {
    setSelectedCountry(null);
    setSelectedCity(null); // Clear city when country is cleared
  }, [setSelectedCountry, setSelectedCity]);

  const handleClearCity = useCallback(() => {
    setSelectedCity(null);
  }, [setSelectedCity]);

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <PostCard
      post={item}
      onPress={() => {
        // Navigate to post details if needed
      }}
    />
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!user?.id) {
        return;
      }

      viewableItems.forEach((viewToken) => {
        if (!viewToken.isViewable) {
          return;
        }

        const item = viewToken.item as CommunityPost | undefined;

        if (item && item.user_id !== user.id) {
          recordView(item.id, user.id);
        }
      });
    },
    [recordView, user?.id]
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        {selectedTab === 'availability' ? (
          <>
            <Truck size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t('community.no_drivers_available')}</Text>
            <Text style={styles.emptyText}>
              {t('community.be_first_to_post')}
            </Text>
          </>
        ) : (
          <>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t('community.no_routes_available')}</Text>
            <Text style={styles.emptyText}>
              {t('community.post_route_to_find_drivers')}
            </Text>
          </>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  const renderHeader = useMemo(() => (
    <View>
      {/* Custom header from parent (e.g., home stats) */}
      {customHeader ? customHeader : null}

      {/* Quick Post Bar */}
      <QuickPostBar />

      {/* Community Stats */}
      {useCommunityStore.getState().communityStats && (
        <View style={styles.statsBar}>
          <Text style={styles.statsTitle}>{t('community.title')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {useCommunityStore.getState().communityStats?.activePosts || 0}
              </Text>
              <Text style={styles.statLabel}>{t('community.active')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {useCommunityStore.getState().communityStats?.contacts || 0}
              </Text>
              <Text style={styles.statLabel}>{t('community.contacts')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {useCommunityStore.getState().communityStats?.conversions || 0}
              </Text>
              <Text style={styles.statLabel}>{t('community.leads')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'availability' && styles.activeTab]}
          onPress={() => setSelectedTab('availability')}
        >
          <Truck size={18} color={selectedTab === 'availability' ? '#10B981' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'availability' && styles.activeTabText]}>
            {t('community.available_drivers').toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'routes' && styles.activeTab]}
          onPress={() => setSelectedTab('routes')}
        >
          <Package size={18} color={selectedTab === 'routes' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'routes' && styles.activeTabText]}>
            {t('community.available_routes').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {isInitializingFilters ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <>
            {/* Country Filter */}
            <TouchableOpacity
              style={styles.filterControl}
              onPress={handleCountryPress}
            >
              <Globe size={16} color="#6B7280" />
              <View style={styles.filterLabelContainer}>
                <Text style={styles.filterLabel}>{t('community.country')}</Text>
                <Text style={selectedCountry ? styles.filterValueSelected : styles.filterValuePlaceholder}>
                  {selectedCountry?.name || t('community.select_country')}
                </Text>
              </View>
              {selectedCountry && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCountry}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* City Filter */}
            <TouchableOpacity
              style={[styles.filterControl, !selectedCountry && styles.filterControlDisabled]}
              onPress={handleCityPress}
              disabled={!selectedCountry}
            >
              <MapPin size={16} color={selectedCountry ? "#6B7280" : "#D1D5DB"} />
              <View style={styles.filterLabelContainer}>
                <Text style={[styles.filterLabel, !selectedCountry && styles.filterLabelDisabled]}>
                  {t('community.city')}
                </Text>
                <Text style={selectedCity ? styles.filterValueSelected : styles.filterValuePlaceholder}>
                  {selectedCity?.name || t('community.all_cities')}
                </Text>
              </View>
              {selectedCity && selectedCountry && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCity}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>Închide</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [
    customHeader,
    selectedTab,
    error,
    selectedCity,
    selectedCountry,
    isInitializingFilters,
    handleCountryPress,
    handleCityPress,
    handleClearCountry,
    handleClearCity,
    clearError,
    setSelectedTab,
    t,
  ]);

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshPosts}
            colors={['#3B82F6']}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
      />

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={isCountryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={handleCountrySelect}
        onClear={handleClearCountry}
        selectedCountryCode={selectedCountry?.code}
      />

      {/* City Search Modal */}
      <Modal
        visible={isCityPickerVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setCityPickerVisible(false)}
      >
        <CitySearchModal
          countryCode={selectedCountry?.code || ''}
          onSelect={handleCitySelect}
          onClose={() => setCityPickerVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  statsBar: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
  },
  filterBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
  },
  filterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  filterControlDisabled: {
    opacity: 0.5,
  },
  filterLabelContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  filterLabelDisabled: {
    color: '#D1D5DB',
  },
  filterValueSelected: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  filterValuePlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 8,
  },
});