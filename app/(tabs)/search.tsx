import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { searchesService } from '@/services/searchesService';
import { notificationsService } from '@/services/notificationsService';
import Toast from 'react-native-toast-message';
import { MapPin, Crosshair, Search } from 'lucide-react-native';

export default function SearchScreen() {
  const { t } = useTranslation();
  const { user, profile, setProfile } = useAuthStore();
  const [keywords, setKeywords] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(0);

  useEffect(() => {
    if (profile) {
      searchesService.getSearchesRemaining(profile).then(setSearchesRemaining);
    }
  }, [profile]);

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: t('search.location_denied'),
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode[0]) {
        const geo = reverseGeocode[0];
        const addressStr = `${geo.city || geo.region || ''}, ${geo.country || ''}`;
        setAddress(addressStr);
      }

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('search.use_current_location'),
      });
    } catch (error) {
      console.error('Location error:', error);
      Toast.show({
        type: 'error',
        text1: t('errors.something_went_wrong'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSearch = async () => {
    if (!keywords.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please enter keywords',
      });
      return;
    }

    if (!latitude || !longitude) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please select a location',
      });
      return;
    }

    if (!user || !profile) return;

    const canSearch = await searchesService.canUserSearch(profile);
    if (!canSearch) {
      Toast.show({
        type: 'error',
        text1: t('search.insufficient_searches'),
        text2: t('search.buy_more'),
      });
      return;
    }

    Alert.alert(
      t('common.confirm'),
      t('search.search_cost', { remaining: searchesRemaining }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setIsLoading(true);
            try {
              await searchesService.initiateSearch(user.id, profile, {
                keywords,
                address,
                latitude,
                longitude,
              });

              await notificationsService.sendSearchStartedNotification(keywords);

              const updatedProfile = await searchesService.getSearchesRemaining(profile);
              setSearchesRemaining(await searchesService.getSearchesRemaining(profile));

              Toast.show({
                type: 'success',
                text1: t('common.success'),
                text2: t('search.search_started'),
              });

              setKeywords('');
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message,
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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
          <Text style={styles.sectionTitle}>{t('search.keywords')}</Text>
          <Input
            placeholder={t('search.keywords_placeholder')}
            value={keywords}
            onChangeText={setKeywords}
            multiline
          />
        </Card>

        <View style={styles.costInfo}>
          <Crosshair size={20} color="#64748B" />
          <Text style={styles.costText}>
            {t('search.search_cost', { remaining: searchesRemaining })}
          </Text>
        </View>

        <Button
          title={t('search.start_search')}
          onPress={handleStartSearch}
          loading={isLoading}
          disabled={!latitude || !longitude || !keywords.trim() || searchesRemaining === 0}
        />
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
    marginBottom: 16,
    padding: 12,
  },
  costText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
});
