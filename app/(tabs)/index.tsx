import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/authStore';
import { useLeadsStore } from '@/store/leadsStore';
import { leadsService } from '@/services/leadsService';
import { searchesService } from '@/services/searchesService';
import { Briefcase, Clock, CreditCard, MapPin, Building2, Users } from 'lucide-react-native';
import CommunityFeed from '@/components/community/CommunityFeed';
import { useTheme } from '@/lib/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const { profile, user } = useAuthStore();
  const { leads, setLeads, setSelectedLeadId, setSelectedTab } = useLeadsStore();
  const [searchesRemaining, setSearchesRemaining] = useState(0);

  const loadData = useCallback(async () => {
    if (!user || !profile) return;

    try {
      const [leadsData, remaining] = await Promise.all([
        leadsService.getLeads(user.id),
        searchesService.getSearchesRemaining(user.id),
      ]);

      setLeads(leadsData);
      setSearchesRemaining(remaining);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  }, [profile, setLeads, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recentLeads = leads.slice(0, 5);
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;

  // Render stats header for CommunityFeed
  const renderStatsHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          {t('home.welcome', { name: profile?.full_name?.split(' ')[0] || '' })}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('home.searches_remaining', { count: searchesRemaining })}
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Briefcase size={24} color={theme.colors.secondary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{leads.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('home.total_leads')}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.stat}>
            <Clock size={24} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{contactedCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('home.leads_contacted')}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.stat}>
            <CreditCard size={24} color={theme.colors.warning} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{searchesRemaining}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('tabs.search')}</Text>
          </View>
        </View>
      </Card>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/search')}
        style={[styles.searchButton, { shadowColor: theme.colors.primary }]}
        activeOpacity={0.85}
      >
        <View style={[
          styles.searchButtonGradient, 
          { 
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.primary 
          }
        ]}>
          <Text style={[styles.searchButtonText, { color: theme.colors.white }]}>{t('home.start_search')}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.recent_leads')}</Text>
          {leads.length > 5 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedTab('search');
                router.push('/(tabs)/leads');
              }}
              style={[styles.viewAllButton, { backgroundColor: theme.colors.secondary + '20' }]} // 20% opacity
            >
              <Text style={[styles.viewAllText, { color: theme.colors.secondary }]}>{t('home.view_all_results')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentLeads.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('leads.no_leads')}
            </Text>
          </Card>
        ) : (
          <>
            {recentLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                onPress={() => {
                  setSelectedTab('mybook');
                  setSelectedLeadId(lead.id);
                  router.push('/(tabs)/leads');
                }}
              >
                <Card style={styles.leadCard}>
                  <View style={styles.leadContent}>
                    <View style={[styles.leadIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                      <Building2 size={20} color={theme.colors.secondary} />
                    </View>
                    <View style={styles.leadInfo}>
                      <Text style={[styles.leadName, { color: theme.colors.text }]}>{lead.company_name}</Text>
                      {lead.industry && (
                        <Text style={[styles.leadIndustry, { color: theme.colors.textSecondary }]}>{lead.industry}</Text>
                      )}
                      {lead.city && (
                        <View style={styles.leadLocation}>
                          <MapPin size={12} color={theme.colors.textSecondary} />
                          <Text style={[styles.leadCity, { color: theme.colors.textSecondary }]}>{lead.city}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      <View style={styles.communityHeader}>
        <View style={styles.sectionHeaderRow}>
          <Users size={24} color={theme.colors.secondary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.community_title', 'Comunitatea Truxel')}</Text>
        </View>
        <Text style={[styles.communitySubtitle, { color: theme.colors.textSecondary }]}>
          {t('home.community_subtitle', 'Găsește curse și șoferi în timp real')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <CommunityFeed 
        customHeader={renderStatsHeader()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
  },
  searchButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonGradient: {
    height: 112,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  leadCard: {
    marginBottom: 12,
  },
  leadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  leadIndustry: {
    fontSize: 14,
    marginBottom: 4,
  },
  leadLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  leadCity: {
    fontSize: 13,
    marginLeft: 4,
  },
  communityHeader: {
    marginTop: 24,
    marginBottom: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  communitySubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
});
