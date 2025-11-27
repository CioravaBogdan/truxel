import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/useLocation';
import * as Notifications from 'expo-notifications';
import { safeScheduleNotification } from '@/utils/safeNativeModules';
import { formatDistance } from '@/utils/distance';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { searchesService } from '@/services/searchesService';
import { Search as SearchType } from '@/types/database.types';
import Toast from 'react-native-toast-message';
import { MapPin, Crosshair, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

// Configure notifications SAFELY (wrapped in try-catch to prevent iOS crash)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.error('[Search] Notification handler setup failed (non-critical):', error);
}

export default function SearchScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  const [keywords, setKeywords] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(0);
  const [activeSearch, setActiveSearch] = useState<SearchType | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAutoLocationFetched, setIsAutoLocationFetched] = useState(false);

  useEffect(() => {
    if (user) {
      searchesService.getSearchesRemaining(user.id).then(setSearchesRemaining);
    }
  }, [user]);

  // Request notification permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    })();
  }, []);

  // Subscribe to search updates
  useEffect(() => {
    if (!user || !activeSearch) return;

    const unsubscribe = searchesService.subscribeToSearchUpdates(user.id, (updatedSearch) => {
      if (updatedSearch.id === activeSearch.id) {
        setActiveSearch(updatedSearch);

        // Send notification when search completes (safe wrapper prevents crashes)
        if (updatedSearch.status === 'completed') {
          safeScheduleNotification(
            {
              title: t('search.search_complete'),
              body: t('search.results_ready'),
              sound: true,
            },
            null // Immediate
          );
        } else if (updatedSearch.status === 'failed') {
          safeScheduleNotification(
            {
              title: t('search.search_failed'),
              body: t('search.please_try_again'),
              sound: true,
            },
            null
          );
        }
      }
    });

    return unsubscribe;
  }, [user, activeSearch, t]);

  // Polling fallback for search status (in case Realtime is disabled/unreliable)
  useEffect(() => {
    if (!user || !activeSearch || activeSearch.status !== 'pending') return;

    const pollInterval = setInterval(async () => {
      try {
        const updatedSearch = await searchesService.getSearch(activeSearch.id);
        if (updatedSearch && updatedSearch.status !== 'pending') {
          setActiveSearch(updatedSearch);
          
          // Trigger notification logic if status changed to completed/failed
          if (updatedSearch.status === 'completed') {
            safeScheduleNotification(
              {
                title: t('search.search_complete'),
                body: t('search.results_ready'),
                sound: true,
              },
              null
            );
          } else if (updatedSearch.status === 'failed') {
            safeScheduleNotification(
              {
                title: t('search.search_failed'),
                body: t('search.please_try_again'),
                sound: true,
              },
              null
            );
          }
        }
      } catch (error) {
        console.warn('[Search] Polling failed:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [user, activeSearch, t]);

  // Timer for elapsed time
  useEffect(() => {
    if (!activeSearch || activeSearch.status !== 'pending') {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeSearch.created_at).getTime();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSearch]);

  // Parse keywords from text input
  const parseKeywords = (text: string): string[] => {
    return text.split(',').map(k => k.trim()).filter(k => k.length > 0);
  };

  // Update keywords list when text changes
  useEffect(() => {
    const parsed = parseKeywords(keywords);
    setKeywordsList(parsed);
  }, [keywords]);

  const { getCurrentLocation, reverseGeocode } = useLocation();

  const handleUseCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      // Platform-agnostic: Works on mobile (Expo Location) and web (browser Geolocation API)
      const location = await getCurrentLocation();
      
      setLatitude(location.latitude);
      setLongitude(location.longitude);

      // Platform-agnostic reverse geocoding (Expo Location on mobile, Nominatim on web)
      const addressStr = await reverseGeocode(location.latitude, location.longitude);
      if (addressStr) {
        setAddress(addressStr);
      }

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('search.use_current_location'),
      });
    } catch (error: any) {
      console.error('Location error:', error);
      
      // Handle permission denied or geolocation errors
      if (error.message?.includes('denied') || error.message?.includes('Permission')) {
        Toast.show({
          type: 'error',
          text1: t('search.location_denied'),
        });
      } else if (error.message?.includes('timeout')) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: 'Location timeout. Please ensure GPS is enabled and try again.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('errors.something_went_wrong'),
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, reverseGeocode, t]);

  // Auto-fetch location when screen mounts
  useEffect(() => {
    if (!isAutoLocationFetched) {
      handleUseCurrentLocation();
      setIsAutoLocationFetched(true);
    }
  }, [isAutoLocationFetched, handleUseCurrentLocation]);

  const handleStartSearch = async () => {
    // Parse keywords into array (split by comma)
    const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keywordsArray.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('search.enter_at_least_one_keyword'),
      });
      return;
    }

    if (keywordsArray.length > 5) {
      Toast.show({
        type: 'error',
        text1: t('search.max_keywords_title'),
        text2: t('search.max_keywords_message'),
      });
      return;
    }

    if (!latitude || !longitude) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('search.select_location_first'),
      });
      return;
    }

    if (!user || !profile) return;

    const canSearch = await searchesService.canUserSearch(user.id);
    if (!canSearch) {
      Toast.show({
        type: 'error',
        text1: t('search.insufficient_searches'),
        text2: t('search.buy_more'),
      });
      return;
    }

    // Direct search without confirmation popup
    setIsLoading(true);
    try {
      // Join keywords back with commas for webhook (webhook expects this format)
      const keywordsString = keywordsArray.join(', ');
      
      const newSearch = await searchesService.initiateSearch(user.id, profile, {
        keywords: keywordsString,
        address,
        latitude,
        longitude,
      });

      setActiveSearch(newSearch);
      setSearchesRemaining(await searchesService.getSearchesRemaining(user.id));

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('search.search_started'),
      });

      setKeywords('');
      setKeywordsList([]);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = async () => {
    if (!user || !profile) return;

    // Check if user has saved preferred industries
    if (!profile.preferred_industries || profile.preferred_industries.length === 0) {
      Toast.show({
        type: 'error',
        text1: t('search.no_saved_domains'),
        text2: t('search.please_set_domains_in_profile'),
      });
      return;
    }

    if (!latitude || !longitude) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please select a location first',
      });
      return;
    }

    const canSearch = await searchesService.canUserSearch(user.id);
    if (!canSearch) {
      Toast.show({
        type: 'error',
        text1: t('search.insufficient_searches'),
        text2: t('search.buy_more'),
      });
      return;
    }

    // Direct search without confirmation popup
    setIsLoading(true);
    try {
      const quickKeywords = profile.preferred_industries.join(', ');
      
      const newSearch = await searchesService.initiateSearch(user.id, profile, {
        keywords: quickKeywords,
        address,
        latitude,
        longitude,
      });

      setActiveSearch(newSearch);
      setSearchesRemaining(await searchesService.getSearchesRemaining(user.id));

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('search.quick_search_started'),
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color={theme.colors.warning} />;
      case 'completed':
        return <CheckCircle size={20} color={theme.colors.success} />;
      case 'failed':
        return <AlertCircle size={20} color={theme.colors.error} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('search.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('home.searches_remaining', { count: searchesRemaining })}
          </Text>
        </View>

        {/* Active Search Status Card */}
        {activeSearch && (
          <Card style={StyleSheet.flatten([styles.statusCard, { borderColor: getStatusColor(activeSearch.status), backgroundColor: theme.colors.card }])}>
            <View style={styles.statusHeader}>
              {getStatusIcon(activeSearch.status)}
              <Text style={StyleSheet.flatten([styles.statusTitle, { color: getStatusColor(activeSearch.status) }])}>
                {activeSearch.status === 'pending' && t('search.processing')}
                {activeSearch.status === 'completed' && t('search.completed')}
                {activeSearch.status === 'failed' && t('search.failed')}
              </Text>
            </View>

            <View style={styles.statusDetails}>
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>{t('search.keywords')}:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>{activeSearch.search_keywords}</Text>
            </View>

            <View style={styles.statusDetails}>
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>{t('search.location')}:</Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>{activeSearch.search_address}</Text>
            </View>

            {activeSearch.status === 'pending' && (
              <View style={[styles.processingInfo, { backgroundColor: theme.colors.warning + '20' }]}>
                <ActivityIndicator size="small" color={theme.colors.warning} />
                <View style={styles.timerContainer}>
                  <Clock size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.timerText, { color: theme.colors.warning }]}>{formatTime(elapsedTime)}</Text>
                  <Text style={[styles.estimateText, { color: theme.colors.warning }]}>/ ~5:00 {t('search.estimated')}</Text>
                </View>
              </View>
            )}

            {activeSearch.status === 'completed' && (
              <View style={[styles.completedInfo, { backgroundColor: theme.colors.success + '20' }]}>
                <CheckCircle size={16} color={theme.colors.success} />
                <Text style={[styles.completedText, { color: theme.colors.success }]}>
                  {t('search.check_leads_tab')}
                </Text>
              </View>
            )}

            {activeSearch.status === 'failed' && activeSearch.error_message && (
              <View style={[styles.errorInfo, { backgroundColor: theme.colors.error + '20' }]}>
                <AlertCircle size={16} color={theme.colors.error} />
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{activeSearch.error_message}</Text>
              </View>
            )}
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('search.location_method')}</Text>

          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={[styles.locationButtonStyle, { shadowColor: theme.colors.primary, backgroundColor: theme.colors.card }]}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={[styles.locationButtonContent, { borderColor: theme.colors.primary }]}>
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Crosshair size={20} color={theme.colors.primary} />
                  <Text style={[styles.locationButtonText, { color: theme.colors.primary }]}>
                    {t('search.use_current_location')}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {address && (
            <View style={[styles.locationResult, { backgroundColor: theme.colors.success + '10' }]}>
              <MapPin size={16} color={theme.colors.success} />
              <View style={styles.locationInfo}>
                <Text style={[styles.locationText, { color: theme.colors.success }]}>{address}</Text>
                <View style={styles.radiusInfo}>
                  <Crosshair size={14} color={theme.colors.success} />
                  <Text style={[styles.radiusText, { color: theme.colors.success }]}>
                    {formatDistance(
                      profile?.search_radius_km || 5,
                      profile?.preferred_distance_unit || 'km',
                      0
                    )} {t('search.radius')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <View style={styles.keywordsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('search.keywords')}</Text>
            <View style={[styles.keywordCounter, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={[
                styles.counterText,
                { color: theme.colors.textSecondary },
                keywordsList.length > 5 && { color: theme.colors.error }
              ]}>
                {keywordsList.length} / 5
              </Text>
            </View>
          </View>
          
          <Text style={[styles.keywordsHint, { color: theme.colors.textSecondary }]}>
            {t('search.keywords_hint')}
          </Text>
          
          <Input
            placeholder={t('search.keywords_placeholder')}
            value={keywords}
            onChangeText={setKeywords}
            multiline
            style={[
              { borderWidth: 1, borderColor: theme.colors.border },
              keywordsList.length > 5 && { borderColor: theme.colors.error, borderWidth: 2 }
            ]}
          />
          
          {/* Visual Keywords Display */}
          {keywordsList.length > 0 && (
            <View style={[styles.keywordsPreview, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>{t('search.your_keywords')}:</Text>
              <View style={styles.keywordTags}>
                {keywordsList.slice(0, 5).map((keyword, index) => (
                  <View key={index} style={[styles.keywordTag, { backgroundColor: theme.colors.secondary + '20', borderColor: theme.colors.secondary + '40' }]}>
                    <Text style={[styles.keywordTagText, { color: theme.colors.secondary }]}>{keyword}</Text>
                  </View>
                ))}
                {keywordsList.length > 5 && (
                  <View style={[styles.keywordTagError, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error + '40' }]}>
                    <Text style={[styles.keywordTagTextError, { color: theme.colors.error }]}>
                      +{keywordsList.length - 5} {t('search.too_many')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Cost Info */}
          <View style={[styles.costInfo, { backgroundColor: theme.colors.background }]}>
            <Crosshair size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.costText, { color: theme.colors.textSecondary }]}>
              {t('search.search_cost', { remaining: searchesRemaining })}
            </Text>
          </View>

          {/* Start Search Button - Big Gradient Style */}
          <TouchableOpacity
            onPress={handleStartSearch}
            style={[styles.searchButton, { shadowColor: theme.colors.primary }]}
            activeOpacity={0.85}
            disabled={!latitude || !longitude || !keywords.trim() || searchesRemaining === 0 || isLoading}
          >
            <View style={[
              styles.searchButtonGradient, 
              { 
                backgroundColor: theme.colors.secondary,
                borderColor: theme.colors.primary,
                opacity: (!latitude || !longitude || !keywords.trim() || searchesRemaining === 0 || isLoading) ? 0.5 : 1
              }
            ]}>
              {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.white} />
              ) : (
                <Text style={[styles.searchButtonText, { color: theme.colors.white }]}>{t('search.start_search')}</Text>
              )}
            </View>
          </TouchableOpacity>
        </Card>

        {/* Quick Search Section */}
        {profile?.preferred_industries && profile.preferred_industries.length > 0 && (
          <Card style={[styles.quickSearchCard, { backgroundColor: theme.colors.secondary + '10', borderColor: theme.colors.secondary }]}>
            <View style={styles.quickSearchHeader}>
              <Text style={[styles.quickSearchTitle, { color: theme.colors.secondary }]}>{t('search.quick_search')}</Text>
              <Text style={[styles.quickSearchSubtitle, { color: theme.colors.textSecondary }]}>{t('search.quick_search_description')}</Text>
            </View>
            
            <View style={styles.savedDomainsContainer}>
              <Text style={[styles.savedDomainsLabel, { color: theme.colors.textSecondary }]}>{t('search.your_saved_domains')}:</Text>
              <View style={styles.domainsList}>
                {profile.preferred_industries.map((domain, index) => (
                  <View key={index} style={[styles.domainTag, { backgroundColor: theme.colors.secondary + '20', borderColor: theme.colors.secondary + '40' }]}>
                    <Text style={[styles.domainTagText, { color: theme.colors.secondary }]}>{domain}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Button
              title={t('search.start_quick_search')}
              onPress={handleQuickSearch}
              loading={isLoading}
              disabled={!latitude || !longitude || searchesRemaining === 0}
              variant="primary"
              style={styles.quickSearchButton}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  locationButtonStyle: {
    marginBottom: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  radiusText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 12,
    borderRadius: 12,
  },
  costText: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  // Search Button Styles (Matching Home)
  searchButton: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonGradient: {
    height: 80, // Slightly smaller than Home (112) but still big
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusCard: {
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  statusDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    width: 90,
  },
  statusValue: {
    fontSize: 15,
    flex: 1,
  },
  processingInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  estimateText: {
    fontSize: 13,
  },
  completedInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
  },
  errorInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
  },
  quickSearchCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 16,
  },
  quickSearchHeader: {
    marginBottom: 16,
  },
  quickSearchTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  quickSearchSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  savedDomainsContainer: {
    marginBottom: 20,
  },
  savedDomainsLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  domainsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  domainTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  domainTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickSearchButton: {
    marginTop: 8,
  },
  // Keywords Section Styles
  keywordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keywordCounter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  counterTextError: {
    // Removed hardcoded color
  },
  keywordsHint: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputError: {
    borderWidth: 2,
  },
  keywordsPreview: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  keywordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keywordTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  keywordTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  keywordTagError: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  keywordTagTextError: {
    fontSize: 14,
    fontWeight: '700',
  },
});
