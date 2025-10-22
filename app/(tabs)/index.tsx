import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuthStore } from '@/store/authStore';
import { useLeadsStore } from '@/store/leadsStore';
import { leadsService } from '@/services/leadsService';
import { searchesService } from '@/services/searchesService';
import { notificationsService } from '@/services/notificationsService';
import { Briefcase, Clock, CreditCard, MapPin } from 'lucide-react-native';
import { Search } from '@/types/database.types';
import Toast from 'react-native-toast-message';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, user } = useAuthStore();
  const { leads, setLeads } = useLeadsStore();
  const [searchesRemaining, setSearchesRemaining] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!user || !profile) return;

    try {
      const [leadsData, remaining] = await Promise.all([
        leadsService.getLeads(user.id),
        searchesService.getSearchesRemaining(profile),
      ]);

      setLeads(leadsData);
      setSearchesRemaining(remaining);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  useEffect(() => {
    loadData();

    if (!user) return;

    const unsubscribe = searchesService.subscribeToSearchUpdates(
      user.id,
      (updatedSearch: Search) => {
        if (updatedSearch.status === 'completed') {
          notificationsService.sendSearchCompletedNotification(
            updatedSearch.results_count
          );
          Toast.show({
            type: 'success',
            text1: t('common.success'),
            text2: `Search completed! Found ${updatedSearch.results_count} leads.`,
          });
          loadData();
        } else if (updatedSearch.status === 'failed') {
          notificationsService.sendSearchFailedNotification();
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: 'Search failed. Please try again.',
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, profile]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const recentLeads = leads.slice(0, 5);
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('home.welcome', { name: profile?.full_name?.split(' ')[0] || '' })}
          </Text>
          <Text style={styles.subtitle}>
            {t('home.searches_remaining', { count: searchesRemaining })}
          </Text>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Briefcase size={24} color="#2563EB" />
              <Text style={styles.statValue}>{leads.length}</Text>
              <Text style={styles.statLabel}>{t('home.total_leads')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Clock size={24} color="#10B981" />
              <Text style={styles.statValue}>{contactedCount}</Text>
              <Text style={styles.statLabel}>{t('home.leads_contacted')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <CreditCard size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{searchesRemaining}</Text>
              <Text style={styles.statLabel}>{t('tabs.search')}</Text>
            </View>
          </View>
        </Card>

        <Button
          title={t('home.start_search')}
          onPress={() => router.push('/(tabs)/search')}
          style={styles.searchButton}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.recent_leads')}</Text>

          {recentLeads.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {t('leads.no_leads')}
              </Text>
            </Card>
          ) : (
            recentLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                onPress={() => router.push(`/lead/${lead.id}`)}
              >
                <Card style={styles.leadCard}>
                  <View style={styles.leadHeader}>
                    <Text style={styles.leadName}>{lead.company_name}</Text>
                    <StatusBadge status={lead.status} />
                  </View>
                  {lead.city && (
                    <View style={styles.leadLocation}>
                      <MapPin size={14} color="#64748B" />
                      <Text style={styles.leadCity}>{lead.city}</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  searchButton: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  leadCard: {
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  leadLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadCity: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
});
