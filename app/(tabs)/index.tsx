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

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, user } = useAuthStore();
  const { leads, setLeads, setSelectedLeadId, setSelectedTab } = useLeadsStore();
  const [searchesRemaining, setSearchesRemaining] = useState(0);

  const loadData = useCallback(async () => {
    if (!user || !profile) return;

    try {
      const [leadsData, remaining] = await Promise.all([
        leadsService.getLeads(user.id),
        searchesService.getSearchesRemaining(user.id), // FIX: Use user.id instead of profile
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

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/search')}
        style={styles.searchButton}
        activeOpacity={0.85}
      >
        <View style={styles.searchButtonGradient}>
          <Text style={styles.searchButtonText}>{t('home.start_search')}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recent_leads')}</Text>
          {leads.length > 5 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedTab('search');
                router.push('/(tabs)/leads');
              }}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>{t('home.view_all_results')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentLeads.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
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
                    <View style={styles.leadIconContainer}>
                      <Building2 size={20} color="#2563EB" />
                    </View>
                    <View style={styles.leadInfo}>
                      <Text style={styles.leadName}>{lead.company_name}</Text>
                      {lead.industry && (
                        <Text style={styles.leadIndustry}>{lead.industry}</Text>
                      )}
                      {lead.city && (
                        <View style={styles.leadLocation}>
                          <MapPin size={12} color="#94A3B8" />
                          <Text style={styles.leadCity}>{lead.city}</Text>
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
          <Users size={24} color="#2563EB" />
          <Text style={styles.sectionTitle}>{t('home.community_title', 'Comunitatea Truxel')}</Text>
        </View>
        <Text style={styles.communitySubtitle}>
          {t('home.community_subtitle', 'Găsește curse și șoferi în timp real')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CommunityFeed 
        customHeader={renderStatsHeader()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonGradient: {
    height: 112, // Double height (56 * 2)
    backgroundColor: '#2563EB', // Logo blue as base
    borderWidth: 2,
    borderColor: '#F59E0B', // Logo orange border
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
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
    color: '#1E293B',
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
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
  leadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
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
    color: '#1E293B',
    marginBottom: 4,
  },
  leadIndustry: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  leadLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  leadCity: {
    fontSize: 13,
    color: '#94A3B8',
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
    color: '#64748B',
    marginBottom: 16,
  },
});
