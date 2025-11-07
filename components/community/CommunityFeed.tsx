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
import { useFocusEffect } from '@react-navigation/native';
import { Globe, MapPin, Package, Truck, Bookmark } from 'lucide-react-native';
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
    savedPosts,
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

  // Load saved posts ONCE on mount (for bookmark status)
  useEffect(() => {
    if (user?.id) {
      console.log('[CommunityFeed] Loading saved posts for bookmark status');
      void useCommunityStore.getState().loadSavedPosts(user.id);
    }
  }, [user?.id]);

  // Load posts on mount and tab/filter change
  useEffect(() => {
    if (selectedTab === 'saved') {
      // Saved tab - posts already loaded by effect above
      return;
    } else {
      // Load regular feed posts
      void loadPosts(true);
    }
  }, [loadPosts, selectedTab, selectedCity, selectedCountry, user?.id]);

  // Refresh posts when tab becomes focused (e.g., after deleting a post)
  useFocusEffect(
    useCallback(() => {
      // Silent refresh to update feed after actions like delete
      void refreshPosts();
    }, [refreshPosts])
  );

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
      // NO onUnsave callback needed in Community Feed!
      // unsavePost() already updates savedPosts array in Zustand store
      // Adding reload here causes race condition: delete from DB → reload → post still in DB → reappears
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
        ) : selectedTab === 'routes' ? (
          <>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t('community.no_routes_available')}</Text>
            <Text style={styles.emptyText}>
              {t('community.post_route_to_find_drivers')}
            </Text>
          </>
        ) : (
          <>
            <Bookmark size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t('community.no_saved_posts')}</Text>
            <Text style={styles.emptyText}>
              {t('community.save_posts_hint')}
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

      {/* Tabs - 2 side-by-side + 1 full-width below */}
      <View style={styles.tabsContainer}>
        {/* Top row: Available Drivers + Available Loads */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabHalf, 
              { backgroundColor: selectedTab === 'availability' ? '#10B981' : '#D1FAE5' },
              selectedTab === 'availability' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('availability')}
          >
            <Truck size={20} color={selectedTab === 'availability' ? 'white' : '#059669'} />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'availability' ? 'white' : '#059669' },
              selectedTab === 'availability' && styles.activeTabText
            ]}>
              {t('community.available_drivers').toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabHalf, 
              { backgroundColor: selectedTab === 'routes' ? '#3B82F6' : '#DBEAFE' },
              selectedTab === 'routes' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('routes')}
          >
            <Package size={20} color={selectedTab === 'routes' ? 'white' : '#2563EB'} />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'routes' ? 'white' : '#2563EB' },
              selectedTab === 'routes' && styles.activeTabText
            ]}>
              {t('community.available_loads').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom row: Saved (full width) */}
        <TouchableOpacity
          style={[
            styles.tabFull, 
            { backgroundColor: selectedTab === 'saved' ? '#F59E0B' : '#FEF3C7' },
            selectedTab === 'saved' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('saved')}
        >
          <Bookmark size={20} color={selectedTab === 'saved' ? 'white' : '#D97706'} />
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'saved' ? 'white' : '#D97706' },
            selectedTab === 'saved' && styles.activeTabText
          ]}>
            {t('community.saved').toUpperCase()}
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
              <Globe size={14} color="#6B7280" />
              <View style={styles.filterLabelContainer}>
                <Text style={styles.filterLabel}>{t('community.country')}</Text>
                <Text 
                  style={selectedCountry ? styles.filterValueSelected : styles.filterValuePlaceholder}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
              <MapPin size={14} color={selectedCountry ? "#6B7280" : "#D1D5DB"} />
              <View style={styles.filterLabelContainer}>
                <Text style={[styles.filterLabel, !selectedCountry && styles.filterLabelDisabled]}>
                  {t('community.city')}
                </Text>
                <Text 
                  style={selectedCity ? styles.filterValueSelected : styles.filterValuePlaceholder}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
        data={selectedTab === 'saved' ? savedPosts : posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              if (selectedTab === 'saved' && user?.id) {
                // For Saved tab, reload from DB
                void useCommunityStore.getState().loadSavedPosts(user.id);
              } else {
                // For other tabs, use refreshPosts
                void refreshPosts();
              }
            }}
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
  tabsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  tabFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row', // Horizontal layout like tabs
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8, // Space between controls
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterControl: {
    flex: 1, // Equal width for both controls
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterControlDisabled: {
    opacity: 0.5,
  },
  filterLabelContainer: {
    flex: 1,
    minWidth: 0, // Allow text truncation
  },
  filterLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  filterLabelDisabled: {
    color: '#D1D5DB',
  },
  filterValueSelected: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  filterValuePlaceholder: {
    fontSize: 12,
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