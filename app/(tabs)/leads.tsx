import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { useLeadsStore } from '@/store/leadsStore';
import { leadsService } from '@/services/leadsService';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { Mail, Phone, MessageCircle, MapPin, Share2, Download } from 'lucide-react-native';
import { Lead } from '@/types/database.types';

export default function LeadsScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const { leads, setLeads, searchQuery, setSearchQuery } = useLeadsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadLeads = async () => {
    if (!user) return;
    try {
      const leadsData = await leadsService.getLeads(user.id);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [user]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLeads();
    setIsRefreshing(false);
  };

  const handleSendEmail = (lead: Lead) => {
    if (!lead.email) {
      Toast.show({ type: 'error', text1: 'No email available' });
      return;
    }

    const subject = t('templates.email_subject', { company: profile?.company_name || '' });
    const body = t('templates.email_body', {
      contactName: lead.contact_person_name || 'there',
      userName: profile?.full_name || '',
      userCompany: profile?.company_name || '',
      location: lead.city || '',
      userPhone: profile?.phone_number || '',
      userEmail: profile?.email || '',
    });

    const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailto);
  };

  const handleSendWhatsApp = (lead: Lead) => {
    if (!lead.whatsapp && !lead.phone) {
      Toast.show({ type: 'error', text1: 'No WhatsApp number available' });
      return;
    }

    const message = t('templates.whatsapp_message', {
      contactName: lead.contact_person_name || 'there',
      userName: profile?.full_name || '',
      userCompany: profile?.company_name || '',
      location: lead.city || '',
      userPhone: profile?.phone_number || '',
    });

    const phone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
    const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Toast.show({ type: 'error', text1: 'WhatsApp not installed' });
      }
    });
  };

  const handleShareLead = async (lead: Lead) => {
    const shareText = `
Company: ${lead.company_name}
Contact: ${lead.contact_person_name || 'N/A'}
Email: ${lead.email || 'N/A'}
Phone: ${lead.phone || 'N/A'}
WhatsApp: ${lead.whatsapp || 'N/A'}
Address: ${lead.address || 'N/A'}
City: ${lead.city || 'N/A'}
Industry: ${lead.industry || 'N/A'}
Website: ${lead.website || 'N/A'}
LinkedIn: ${lead.linkedin || 'N/A'}
Facebook: ${lead.facebook || 'N/A'}

Notes: ${lead.user_notes || 'N/A'}

Shared from LogisticsLead
    `.trim();

    try {
      await Sharing.shareAsync('data:text/plain,' + encodeURIComponent(shareText));
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await leadsService.exportLeadsToCSV(leads);
      const fileName = `LogisticsLeads_${new Date().toISOString().split('T')[0]}.csv`;
      const file = new File(Paths.document, fileName);

      await file.create();
      await file.write(csv);

      await Sharing.shareAsync(file.uri);

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('leads.export_csv'),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
      });
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLeadCard = ({ item: lead }: { item: Lead }) => (
    <Card style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadHeaderLeft}>
          <Text style={styles.leadName}>{lead.company_name}</Text>
          {lead.city && (
            <View style={styles.leadLocation}>
              <MapPin size={14} color="#64748B" />
              <Text style={styles.leadCity}>{lead.city}</Text>
            </View>
          )}
        </View>
        <StatusBadge status={lead.status} />
      </View>

      <View style={styles.leadActions}>
        {lead.email && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendEmail(lead)}
          >
            <Mail size={20} color="#2563EB" />
          </TouchableOpacity>
        )}
        {(lead.phone || lead.whatsapp) && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSendWhatsApp(lead)}
          >
            <MessageCircle size={20} color="#10B981" />
          </TouchableOpacity>
        )}
        {lead.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(`tel:${lead.phone}`)}
          >
            <Phone size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareLead(lead)}
        >
          <Share2 size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {lead.user_notes && (
        <Text style={styles.leadNotes} numberOfLines={2}>
          {lead.user_notes}
        </Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('leads.title')}</Text>
        <TouchableOpacity onPress={handleExportCSV} disabled={leads.length === 0}>
          <Download size={24} color={leads.length > 0 ? '#2563EB' : '#CBD5E1'} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder={t('common.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLeadCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('leads.no_leads')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchInput: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  leadCard: {
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
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
  leadActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadNotes: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
});
