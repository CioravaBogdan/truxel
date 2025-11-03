import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Filter, MapPin, Package, Truck } from 'lucide-react-native';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import PostCard from './PostCard';
import QuickPostBar from './QuickPostBar';
import { CommunityPost } from '../../types/community.types';

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
    loadPosts,
    loadMorePosts,
    refreshPosts,
    setSelectedTab,
    clearError,
  } = useCommunityStore();

  // Load posts on mount and tab change
  useEffect(() => {
    loadPosts(true);
  }, [selectedTab]);

  // Load user stats when user is available
  useEffect(() => {
    if (user) {
      useCommunityStore.getState().loadCommunityStats(user.id);
      useCommunityStore.getState().checkPostLimits(user.id);
    }
  }, [user]);

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <PostCard
      post={item}
      onPress={() => {
        // Navigate to post details if needed
      }}
    />
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
        <View style={styles.activeFilters}>
          {selectedCity ? (
            <View style={styles.filterChip}>
              <MapPin size={14} color="#3B82F6" />
              <Text style={styles.filterChipText}>{selectedCity.name}</Text>
              <TouchableOpacity
                onPress={() => useCommunityStore.getState().setSelectedCity(null)}
              >
                <Text style={styles.filterChipClear}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.filterHint}>{t('community.all_cities')}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color="#6B7280" />
          <Text style={styles.filterButtonText}>{t('community.filters')}</Text>
        </TouchableOpacity>
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
  ), [customHeader, selectedTab, error, selectedCity, clearError, setSelectedTab, t]);

  return (
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
    />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  filterChipClear: {
    marginLeft: 4,
    fontSize: 16,
    color: '#3B82F6',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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