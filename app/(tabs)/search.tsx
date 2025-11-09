import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/useLocation';
import * as Notifications from 'expo-notifications';
import { safeScheduleNotification } from '@/utils/safeNativeModules';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { searchesService } from '@/services/searchesService';
import { Search as SearchType } from '@/types/database.types';
import Toast from 'react-native-toast-message';
import { MapPin, Crosshair, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SearchScreen() {
  const { t } = useTranslation();
  const { user, profile, setProfile } = useAuthStore();
  const [keywords, setKeywords] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(0);
  const [activeSearch, setActiveSearch] = useState<SearchType | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  const handleUseCurrentLocation = async () => {
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
  };

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
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'completed':
        return <CheckCircle size={20} color="#10B981" />;
      case 'failed':
        return <AlertCircle size={20} color="#EF4444" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Search size={32} color="#2563EB" />
          <Text style={styles.title}>{t('search.title')}</Text>
          <Text style={styles.subtitle}>
            {t('home.searches_remaining', { count: searchesRemaining })}
          </Text>
        </View>

        {/* Active Search Status Card */}
        {activeSearch && (
          <Card style={StyleSheet.flatten([styles.statusCard, { borderColor: getStatusColor(activeSearch.status) }])}>
            <View style={styles.statusHeader}>
              {getStatusIcon(activeSearch.status)}
              <Text style={StyleSheet.flatten([styles.statusTitle, { color: getStatusColor(activeSearch.status) }])}>
                {activeSearch.status === 'pending' && t('search.processing')}
                {activeSearch.status === 'completed' && t('search.completed')}
                {activeSearch.status === 'failed' && t('search.failed')}
              </Text>
            </View>

            <View style={styles.statusDetails}>
              <Text style={styles.statusLabel}>{t('search.keywords')}:</Text>
              <Text style={styles.statusValue}>{activeSearch.search_keywords}</Text>
            </View>

            <View style={styles.statusDetails}>
              <Text style={styles.statusLabel}>{t('search.location')}:</Text>
              <Text style={styles.statusValue}>{activeSearch.search_address}</Text>
            </View>

            {activeSearch.status === 'pending' && (
              <View style={styles.processingInfo}>
                <ActivityIndicator size="small" color="#F59E0B" />
                <View style={styles.timerContainer}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                  <Text style={styles.estimateText}>/ ~5:00 {t('search.estimated')}</Text>
                </View>
              </View>
            )}

            {activeSearch.status === 'completed' && (
              <View style={styles.completedInfo}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.completedText}>
                  {t('search.check_leads_tab')}
                </Text>
              </View>
            )}

            {activeSearch.status === 'failed' && activeSearch.error_message && (
              <View style={styles.errorInfo}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{activeSearch.error_message}</Text>
              </View>
            )}
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('search.location_method')}</Text>

          <Button
            title={t('search.use_current_location')}
            onPress={handleUseCurrentLocation}
            variant="outline"
            style={styles.locationButton}
            loading={isLoading}
          />

          {address && (
            <View style={styles.locationResult}>
              <MapPin size={16} color="#10B981" />
              <Text style={styles.locationText}>{address}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <View style={styles.keywordsHeader}>
            <Text style={styles.sectionTitle}>{t('search.keywords')}</Text>
            <View style={styles.keywordCounter}>
              <Text style={[
                styles.counterText,
                keywordsList.length > 5 && styles.counterTextError
              ]}>
                {keywordsList.length} / 5
              </Text>
            </View>
          </View>
          
          <Text style={styles.keywordsHint}>
            {t('search.keywords_hint')}
          </Text>
          
          <Input
            placeholder={t('search.keywords_placeholder')}
            value={keywords}
            onChangeText={setKeywords}
            multiline
            style={keywordsList.length > 5 ? styles.inputError : undefined}
          />
          
          {/* Visual Keywords Display */}
          {keywordsList.length > 0 && (
            <View style={styles.keywordsPreview}>
              <Text style={styles.previewLabel}>{t('search.your_keywords')}:</Text>
              <View style={styles.keywordTags}>
                {keywordsList.slice(0, 5).map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordTagText}>{keyword}</Text>
                  </View>
                ))}
                {keywordsList.length > 5 && (
                  <View style={styles.keywordTagError}>
                    <Text style={styles.keywordTagTextError}>
                      +{keywordsList.length - 5} {t('search.too_many')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Cost Info */}
          <View style={styles.costInfo}>
            <Crosshair size={20} color="#64748B" />
            <Text style={styles.costText}>
              {t('search.search_cost', { remaining: searchesRemaining })}
            </Text>
          </View>

          {/* Start Search Button - Directly under keywords */}
          <Button
            title={t('search.start_search')}
            onPress={handleStartSearch}
            loading={isLoading}
            disabled={!latitude || !longitude || !keywords.trim() || searchesRemaining === 0}
          />
        </Card>

        {/* Quick Search Section */}
        {profile?.preferred_industries && profile.preferred_industries.length > 0 && (
          <Card style={styles.quickSearchCard}>
            <View style={styles.quickSearchHeader}>
              <Text style={styles.quickSearchTitle}>{t('search.quick_search')}</Text>
              <Text style={styles.quickSearchSubtitle}>{t('search.quick_search_description')}</Text>
            </View>
            
            <View style={styles.savedDomainsContainer}>
              <Text style={styles.savedDomainsLabel}>{t('search.your_saved_domains')}:</Text>
              <View style={styles.domainsList}>
                {profile.preferred_industries.map((domain, index) => (
                  <View key={index} style={styles.domainTag}>
                    <Text style={styles.domainTagText}>{domain}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  locationButton: {
    marginBottom: 12,
  },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  costText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  statusCard: {
    marginBottom: 16,
    borderWidth: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    width: 80,
  },
  statusValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  processingInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginHorizontal: 8,
  },
  estimateText: {
    fontSize: 12,
    color: '#78350F',
  },
  completedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
    flex: 1,
  },
  errorInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    marginLeft: 8,
    flex: 1,
  },
  quickSearchCard: {
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  quickSearchHeader: {
    marginBottom: 12,
  },
  quickSearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  quickSearchSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  savedDomainsContainer: {
    marginBottom: 16,
  },
  savedDomainsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  domainsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  domainTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  domainTagText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
  quickSearchButton: {
    backgroundColor: '#3B82F6',
  },
  // Keywords Section Styles
  keywordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  keywordCounter: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  counterTextError: {
    color: '#EF4444',
  },
  keywordsHint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  keywordsPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  keywordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  keywordTagText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
  keywordTagError: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  keywordTagTextError: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
  },
});
