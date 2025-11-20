import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  safeOpenWhatsApp,
  safeOpenEmail,
  safeOpenPhone,
  showNativeModuleError
} from '@/utils/safeNativeModules';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { useLeadsStore } from '@/store/leadsStore';
import { leadsService } from '@/services/leadsService';
import PostCard from '@/components/community/PostCard';
import CountryPickerModal from '@/components/community/CommunityFiltersModal';
import CitySearchModal from '@/components/community/CitySearchModal';
import LeadDetailModal from '@/components/leads/LeadDetailModal';
import { cityService } from '@/services/cityService';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Download, 
  Search as SearchIcon,
  Zap,
  BookMarked,
  Users,
  Truck,
  Globe,
  Share2,
} from 'lucide-react-native';
import { Lead } from '@/types/database.types';
import type { CommunityPost, Country, City } from '@/types/community.types';
import { useTheme } from '@/lib/theme';

// Helper function to format "last contacted" time
const formatLastContacted = (lastContactedAt: string | null): string => {
  if (!lastContactedAt) return 'New';
  
  const now = new Date();
  const contacted = new Date(lastContactedAt);
  const diffMs = now.getTime() - contacted.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

export default function LeadsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  // ⚠️ DO NOT destructure Zustand functions (loadSavedPosts, loadConvertedLeads, convertToMyBook)
  // They become stale references after set() calls, causing infinite loops in useEffect
  // Use useLeadsStore.getState().functionName() for imperative calls instead
  const { 
    selectedTab,
    setSelectedTab,
    leads, 
    setLeads, 
    savedPosts,
    hotLeadsFilter,
    setHotLeadsFilter,
    convertedLeads,
    searchQuery, 
    setSearchQuery,
    selectedLeadId,
    setSelectedLeadId,
  } = useLeadsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Lead detail modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sourceTab, setSourceTab] = useState<string | null>(null); // Track which tab opened the modal

  // Filter state (Country + City - identical to Community Feed)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isCityPickerVisible, setCityPickerVisible] = useState(false);
  const [isInitializingFilters, setIsInitializingFilters] = useState(true);

  // Initialize filters with GPS location (on mount)
  const initializeFilters = useCallback(async () => {
    try {
      const locationInfo = await cityService.getCurrentLocationCity();
      
      if (locationInfo?.nearestMajorCity) {
        const { country_code, country_name } = locationInfo.nearestMajorCity;
        
        setSelectedCountry({ code: country_code, name: country_name });
        setSelectedCity(locationInfo.nearestMajorCity); // Pass full City object
      }
    } catch (error) {
      console.log('[LeadsScreen] GPS initialization failed (non-critical):', error);
    } finally {
      setIsInitializingFilters(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initFilters = async () => {
      if (isMounted) {
        await initializeFilters();
      }
    };

    void initFilters();

    return () => {
      isMounted = false;
    };
  }, [initializeFilters]);

  // Load data based on selected tab
  const loadLeads = useCallback(async () => {
    if (!user) return;
    try {
      const leadsData = await leadsService.getLeads(user.id);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  }, [setLeads, user]);

  useEffect(() => {
    if (!user) return;
    
    if (selectedTab === 'search') {
      void loadLeads();
    } else if (selectedTab === 'hotleads') {
      void useLeadsStore.getState().loadSavedPosts(user.id);
    } else if (selectedTab === 'mybook') {
      void useLeadsStore.getState().loadConvertedLeads(user.id);
    }
  }, [selectedTab, user, loadLeads]);

  // Watch for selectedLeadId changes (navigation from Home screen)
  useEffect(() => {
    if (!selectedLeadId) return;

    // Find lead in all available leads
    const allLeads = [...leads, ...convertedLeads];
    const lead = allLeads.find(l => l.id === selectedLeadId);

    if (lead) {
      setSelectedLead(lead);
      setModalVisible(true);
      // Track source tab when opening from navigation (Home screen recent leads)
      setSourceTab(selectedTab);
    }

    // Clear selectedLeadId after opening modal
    setSelectedLeadId(null);
  }, [selectedLeadId, leads, convertedLeads, setSelectedLeadId, selectedTab]);

  const onRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    
    if (selectedTab === 'search') {
      await loadLeads();
    } else if (selectedTab === 'hotleads') {
      await useLeadsStore.getState().loadSavedPosts(user.id);
    } else if (selectedTab === 'mybook') {
      await useLeadsStore.getState().loadConvertedLeads(user.id);
    }
    
    setIsRefreshing(false);
  };

  // Filter handlers (identical to Community Feed)
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
  }, []);

  const handleCitySelect = useCallback((city: City) => {
    setSelectedCity(city);
    setCityPickerVisible(false);
  }, []);

  const handleClearCountry = useCallback(() => {
    setSelectedCountry(null);
    setSelectedCity(null); // Clear city when country is cleared
  }, []);

  const handleClearCity = useCallback(() => {
    setSelectedCity(null);
  }, []);

  // Delete lead from My Book (unsave converted post)
  const handleDeleteFromMyBook = async (lead: Lead) => {
    if (!user) return;
    
    const userLeadId = (lead as any).user_lead_id;
    
    console.log('[handleDeleteFromMyBook]', { 
      leadId: lead.id, 
      userLeadId,
      hasUserLeadId: !!userLeadId 
    });
    
    if (!userLeadId) {
      console.error('[handleDeleteFromMyBook] Missing user_lead_id!', lead);
      Toast.show({
        type: 'error',
        text1: 'Error: Missing user_lead_id',
      });
      return;
    }
    
    try {
      // Unsave the lead using user_lead_id from junction table
      await leadsService.deleteLead(userLeadId, user.id);
      
      // Reload My Book leads
      await useLeadsStore.getState().loadConvertedLeads(user.id);
      
      Toast.show({
        type: 'success',
        text1: t('leads.removed_from_mybook'),
      });
    } catch (error) {
      console.error('Error deleting from My Book:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
      });
    }
  };

  // Convert Hot Lead to My Book
  const handleAddToMyBook = async (post: CommunityPost) => {
    if (!user) return;
    
    try {
      await useLeadsStore.getState().convertToMyBook(post, user.id);
      Toast.show({
        type: 'success',
        text1: t('leads.converted_successfully'),
      });
    } catch (error: any) {
      console.error('Error converting to My Book:', error);
      
      // Check if error is duplicate lead
      if (error?.message === 'DUPLICATE_LEAD') {
        Alert.alert(
          t('leads.duplicate_lead_title'),
          t('leads.duplicate_lead_message'),
          [{ text: t('common.ok'), style: 'default' }]
        );
      } else {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: error?.message || 'Failed to convert lead',
        });
      }
    }
  };

  // Email, WhatsApp, Share handlers for Lead cards
  const handleSendEmail = async (lead: Lead) => {
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

    // Use safe wrapper to prevent iOS crashes
    const result = await safeOpenEmail(
      lead.email,
      subject,
      body,
      'Cannot open email client'
    );

    if (!result.success) {
      showNativeModuleError('Error', result.userMessage);
    } else if (user && (lead as any).user_lead_id) {
      // Update last_contacted_at timestamp
      try {
        await leadsService.updateLastContacted((lead as any).user_lead_id, user.id);
        // Reload leads to refresh UI
        await loadLeads();
      } catch (error) {
        console.error('Error updating last contacted:', error);
      }
    }
  };

  const handleSendWhatsApp = async (lead: Lead) => {
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

    const phone = (lead.whatsapp || lead.phone || '').replace(/[^0-9+]/g, '');
    
    // Ensure phone has country code
    const phoneWithCode = phone.startsWith('+') ? phone : `+${phone}`;

    // Use safe wrapper to prevent iOS crashes
    const result = await safeOpenWhatsApp(
      phoneWithCode,
      message,
      'WhatsApp not installed or accessible'
    );

    if (!result.success) {
      Toast.show({ 
        type: 'error', 
        text1: 'WhatsApp Error',
        text2: result.userMessage 
      });
    } else if (user && (lead as any).user_lead_id) {
      // Update last_contacted_at timestamp
      try {
        await leadsService.updateLastContacted((lead as any).user_lead_id, user.id);
        // Reload leads to refresh UI
        await loadLeads();
      } catch (error) {
        console.error('Error updating last contacted:', error);
      }
    }
  };

  const handleShareLead = async (lead: Lead) => {
    try {
      // Create vCard (contact card) format - compatible with all devices
      const vCardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${lead.company_name}`,
        `ORG:${lead.company_name}`,
      ];

      // Add optional fields only if they exist
      if (lead.contact_person_name) {
        vCardLines.push(`N:${lead.contact_person_name};;;;`);
      }
      if (lead.phone) {
        vCardLines.push(`TEL;TYPE=WORK,VOICE:${lead.phone}`);
      }
      if (lead.whatsapp && lead.whatsapp !== lead.phone) {
        vCardLines.push(`TEL;TYPE=CELL:${lead.whatsapp}`);
      }
      if (lead.email) {
        vCardLines.push(`EMAIL;TYPE=WORK:${lead.email}`);
      }
      if (lead.address) {
        vCardLines.push(`ADR;TYPE=WORK:;;${lead.address};${lead.city || ''};;;;`);
      }
      if (lead.website) {
        vCardLines.push(`URL:${lead.website}`);
      }
      if (lead.linkedin) {
        vCardLines.push(`X-SOCIALPROFILE;TYPE=linkedin:${lead.linkedin}`);
      }
      if (lead.user_notes) {
        vCardLines.push(`NOTE:${lead.user_notes.replace(/\n/g, '\\n')}`);
      }
      
      // Add metadata
      vCardLines.push(`NOTE:Industry: ${lead.industry || 'N/A'} | Shared from Truxel`);
      vCardLines.push('END:VCARD');

      const vCard = vCardLines.join('\n');

      // Save vCard to file using expo-file-system SDK 54 API
      const fileName = `${lead.company_name.replace(/[^a-z0-9]/gi, '_')}_Contact.vcf`;
      const file = new File(Paths.cache, fileName);
      
      // Delete existing file if it exists (for re-sharing same contact)
      try {
        if (file.exists) {
          await file.delete();
        }
      } catch {
        // File doesn't exist, that's fine
      }
      
      await file.create();
      await file.write(vCard);

      // Share the vCard file
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/vcard',
        dialogTitle: t('leads.share_contact'),
        UTI: 'public.vcard',
      });

      Toast.show({
        type: 'success',
        text1: t('leads.contact_shared'),
      });
    } catch (error) {
      console.error('Share error:', error);
      Toast.show({
        type: 'error',
        text1: t('leads.share_error'),
        text2: 'Could not create contact card',
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await leadsService.exportLeadsToCSV(leads);
      const fileName = `Truxel_Leads_${new Date().toISOString().split('T')[0]}.csv`;
      const file = new File(Paths.document, fileName);

      await file.create();
      await file.write(csv);

      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: t('leads.export_csv'),
      });

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('leads.export_csv'),
      });
    } catch (error) {
      console.error('Error exporting leads CSV:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
      });
    }
  };

  // Filter logic based on selected tab
  const getFilteredData = () => {
    if (selectedTab === 'search') {
      let filtered = leads;
      
      // Apply Country filter - accept both ISO code and full name (flexible for different sources)
      if (selectedCountry) {
        filtered = filtered.filter(lead => 
          lead.country === selectedCountry.code || lead.country === selectedCountry.name
        );
      }
      
      // Apply City filter
      if (selectedCity) {
        filtered = filtered.filter(lead => lead.city === selectedCity.name);
      }
      
      // Apply search query
      if (searchQuery) {
        filtered = filtered.filter((lead) =>
          lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.city?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return filtered;
    } else if (selectedTab === 'hotleads') {
      let filtered = savedPosts;
      
      // Apply Country filter - compare with full country name
      if (selectedCountry) {
        filtered = filtered.filter(p => p.origin_country === selectedCountry.name);
      }
      
      // Apply City filter - extract clean city name from formatted text
      if (selectedCity) {
        filtered = filtered.filter(p => {
          const cleanCity = p.origin_city?.split(' - ')[0];
          return cleanCity === selectedCity.name;
        });
      }
      
      // Apply post type filter
      if (hotLeadsFilter === 'drivers') {
        filtered = filtered.filter(p => p.post_type === 'DRIVER_AVAILABLE');
      } else if (hotLeadsFilter === 'forwarding') {
        filtered = filtered.filter(p => p.post_type === 'LOAD_AVAILABLE');
      }
      
      // Apply search query
      if (searchQuery) {
        filtered = filtered.filter(p =>
          p.origin_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.profile?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return filtered;
    } else { // mybook
      let filtered = convertedLeads;
      
      // If no filters selected, show ALL my book leads
      const hasFilters = selectedCountry || selectedCity || searchQuery;
      
      if (!hasFilters) {
        return filtered; // Return all converted leads when nothing is selected
      }
      
      // Apply Country filter - compare with full country name (leads from community have full name)
      if (selectedCountry) {
        filtered = filtered.filter(lead => 
          lead.country === selectedCountry.code || lead.country === selectedCountry.name
        );
      }
      
      // Apply City filter
      if (selectedCity) {
        filtered = filtered.filter(lead => lead.city === selectedCity.name);
      }
      
      // Apply search query
      if (searchQuery) {
        filtered = filtered.filter((lead) =>
          lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.city?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return filtered;
    }
  };

  // Render functions for different card types
  const renderLeadCard = ({ item: lead }: { item: Lead }) => {
    // Check if this lead is in My Book
    const isMyBookLead = selectedTab === 'mybook';
    
    const handleLeadPress = () => {
      setSelectedLead(lead);
      setModalVisible(true);
      setSourceTab(selectedTab); // Track current tab when opening modal
    };
    
    // Get image URL (google_url_photo or default)
    const imageUrl = (lead as any).google_url_photo || 'https://via.placeholder.com/80x80.png?text=Company';
    
    // Format last contacted time
    const lastContactedText = formatLastContacted((lead as any).last_contacted_at || null);
    
    return (
      <TouchableOpacity onPress={handleLeadPress} activeOpacity={0.7}>
        <Card style={styles.leadCard}>
          {/* Header with Image, Company Info, and Actions */}
          <View style={styles.leadCardHeader}>
            {/* Company Image */}
            <Image 
              source={{ uri: imageUrl }} 
              style={[styles.leadImage, { backgroundColor: theme.colors.background }]}
              defaultSource={require('@/assets/images/icon.png')}
            />
            
            {/* Company Info */}
            <View style={styles.leadInfo}>
              <Text style={[styles.leadName, { color: theme.colors.text }]} numberOfLines={1}>{lead.company_name}</Text>
              {lead.city && (
                <View style={styles.leadLocation}>
                  <MapPin size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.leadCity, { color: theme.colors.textSecondary }]} numberOfLines={1}>{lead.city}</Text>
                </View>
              )}
              {lead.industry && (
                <Text style={[styles.leadIndustry, { color: theme.colors.textSecondary }]} numberOfLines={1}>{lead.industry}</Text>
              )}
            </View>
            
            {/* Actions: Last Contacted Badge + Bookmark (My Book only) */}
            <View style={styles.cardActions}>
              {isMyBookLead && (
                <TouchableOpacity
                  style={styles.bookmarkButton}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent card press when tapping bookmark
                    handleDeleteFromMyBook(lead);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <BookMarked size={20} color={theme.colors.warning} fill={theme.colors.warning} />
                </TouchableOpacity>
              )}
              
              <View style={[styles.lastContactedBadge, { backgroundColor: theme.colors.background }]}>
                <Text style={[
                  styles.lastContactedText,
                  { color: theme.colors.textSecondary },
                  lastContactedText === 'New' && { color: theme.colors.success }
                ]}>
                  {lastContactedText}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Actions Row (Email, WhatsApp, Phone, Maps) */}
          <View style={styles.contactActionsRow}>
            {lead.email && (
              <TouchableOpacity
                style={[styles.contactChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => handleSendEmail(lead)}
              >
                <Mail size={16} color={theme.colors.primary} />
                <Text style={[styles.chipText, { color: theme.colors.primary }]}>Email</Text>
              </TouchableOpacity>
            )}
            {(lead.phone || lead.whatsapp) && (
              <TouchableOpacity
                style={[styles.contactChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => handleSendWhatsApp(lead)}
              >
                <MessageCircle size={16} color={theme.colors.success} />
                <Text style={[styles.chipText, { color: theme.colors.success }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {lead.phone && (
              <TouchableOpacity
                style={[styles.contactChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={async () => {
                  if (!lead.phone) return;
                  const result = await safeOpenPhone(lead.phone, 'Cannot make phone call');
                  if (!result.success) {
                    Toast.show({
                      type: 'error',
                      text1: 'Phone Error',
                      text2: result.userMessage
                    });
                  } else if (user && (lead as any).user_lead_id) {
                    // Update last_contacted_at timestamp
                    try {
                      await leadsService.updateLastContacted((lead as any).user_lead_id, user.id);
                      // Reload leads to refresh UI
                      await loadLeads();
                    } catch (error) {
                      console.error('Error updating last contacted:', error);
                    }
                  }
                }}
              >
                <Phone size={16} color={theme.colors.warning} />
                <Text style={[styles.chipText, { color: theme.colors.warning }]}>Call</Text>
              </TouchableOpacity>
            )}
            {((lead as any).google_url_place || (lead.latitude && lead.longitude)) && (
              <TouchableOpacity
                style={[styles.contactChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => {
                  try {
                    const url = (lead as any).google_url_place 
                      ? (lead as any).google_url_place
                      : `https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`;
                    Linking.openURL(url);
                  } catch {
                    Toast.show({
                      type: 'error',
                      text1: 'Could not open Maps',
                    });
                  }
                }}
              >
                <MapPin size={16} color={theme.colors.error} />
                <Text style={[styles.chipText, { color: theme.colors.error }]}>Maps</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.contactChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={() => handleShareLead(lead)}
            >
              <Share2 size={16} color={theme.colors.secondary} />
              <Text style={[styles.chipText, { color: theme.colors.secondary }]}>{t('common.share')}</Text>
            </TouchableOpacity>
          </View>

          {/* Notes Preview (if available) */}
          {lead.user_notes && (
            <View style={[styles.notesPreview, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.notesText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                💭 {lead.user_notes}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHotLeadCard = ({ item: post }: { item: CommunityPost }) => (
    <View style={styles.hotLeadCardWrapper}>
      <PostCard 
        post={post} 
        onUnsave={() => {
          // Reload Hot Leads after unsaving
          if (user) {
            void useLeadsStore.getState().loadSavedPosts(user.id);
          }
        }}
        onAddToMyBook={() => handleAddToMyBook(post)}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('leads.title')}</Text>
        <TouchableOpacity onPress={handleExportCSV} disabled={leads.length === 0}>
          <Download size={24} color={leads.length > 0 ? theme.colors.secondary : theme.colors.disabled} />
        </TouchableOpacity>
      </View>

      {/* Tabs Container */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.card, shadowColor: theme.shadows.small.shadowColor }]}>
        {/* Top row: Search Results + Hot Leads */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabHalf, 
              { backgroundColor: selectedTab === 'search' ? theme.colors.secondary : theme.colors.secondary + '15' },
              selectedTab === 'search' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('search')}
          >
            <SearchIcon size={18} color={selectedTab === 'search' ? 'white' : theme.colors.secondary} />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'search' ? 'white' : theme.colors.secondary },
              selectedTab === 'search' && styles.activeTabText
            ]}>
              {t('leads.search_results').toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabHalf, 
              { backgroundColor: selectedTab === 'hotleads' ? theme.colors.warning : theme.colors.warning + '15' },
              selectedTab === 'hotleads' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('hotleads')}
          >
            <Zap size={18} color={selectedTab === 'hotleads' ? 'white' : theme.colors.warning} />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'hotleads' ? 'white' : theme.colors.warning },
              selectedTab === 'hotleads' && styles.activeTabText
            ]}>
              {t('leads.hot_leads').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom row: My Book (full width) */}
        <TouchableOpacity
          style={[
            styles.tabFull, 
            { backgroundColor: selectedTab === 'mybook' ? theme.colors.success : theme.colors.success + '15' },
            selectedTab === 'mybook' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('mybook')}
        >
          <BookMarked size={18} color={selectedTab === 'mybook' ? 'white' : theme.colors.success} />
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'mybook' ? 'white' : theme.colors.success },
            selectedTab === 'mybook' && styles.activeTabText
          ]}>
            {t('leads.my_book').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Country + City Filter Bar (identical to Community Feed) */}
      <View style={[styles.filterBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {isInitializingFilters ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <>
            {/* Country Filter */}
            <TouchableOpacity
              style={[styles.filterControl, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={handleCountryPress}
            >
              <Globe size={14} color={theme.colors.textSecondary} />
              <View style={styles.filterLabelContainer}>
                <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>{t('community.country')}</Text>
                <Text 
                  style={selectedCountry ? [styles.filterValueSelected, { color: theme.colors.text }] : [styles.filterValuePlaceholder, { color: theme.colors.textSecondary }]}
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
                  <Text style={[styles.clearButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* City Filter */}
            <TouchableOpacity
              style={[
                styles.filterControl, 
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                !selectedCountry && styles.filterControlDisabled
              ]}
              onPress={handleCityPress}
              disabled={!selectedCountry}
            >
              <MapPin size={14} color={selectedCountry ? theme.colors.textSecondary : theme.colors.disabled} />
              <View style={styles.filterLabelContainer}>
                <Text style={[styles.filterLabel, !selectedCountry && { color: theme.colors.disabled }]}>
                  {t('community.city')}
                </Text>
                <Text 
                  style={selectedCity ? [styles.filterValueSelected, { color: theme.colors.text }] : [styles.filterValuePlaceholder, { color: theme.colors.textSecondary }]}
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
                  <Text style={[styles.clearButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Hot Leads Filter Buttons */}
      {selectedTab === 'hotleads' && (
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              hotLeadsFilter === 'all' && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
            ]}
            onPress={() => setHotLeadsFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: theme.colors.textSecondary },
              hotLeadsFilter === 'all' && { color: 'white' }
            ]}>
              {t('leads.filter_all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              hotLeadsFilter === 'drivers' && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
            ]}
            onPress={() => setHotLeadsFilter('drivers')}
          >
            <Users size={16} color={hotLeadsFilter === 'drivers' ? 'white' : theme.colors.textSecondary} />
            <Text style={[
              styles.filterButtonText,
              { color: theme.colors.textSecondary },
              hotLeadsFilter === 'drivers' && { color: 'white' }
            ]}>
              {t('leads.filter_drivers')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              hotLeadsFilter === 'forwarding' && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
            ]}
            onPress={() => setHotLeadsFilter('forwarding')}
          >
            <Truck size={16} color={hotLeadsFilter === 'forwarding' ? 'white' : theme.colors.textSecondary} />
            <Text style={[
              styles.filterButtonText,
              { color: theme.colors.textSecondary },
              hotLeadsFilter === 'forwarding' && { color: 'white' }
            ]}>
              {t('leads.filter_forwarding')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('common.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Conditional FlatList based on selectedTab */}
      {selectedTab === 'search' && (
        <FlatList
          data={getFilteredData() as Lead[]}
          renderItem={renderLeadCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.secondary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <SearchIcon size={48} color={theme.colors.disabled} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('leads.no_search_results')}</Text>
            </View>
          }
        />
      )}

      {selectedTab === 'hotleads' && (
        <FlatList
          data={getFilteredData() as CommunityPost[]}
          renderItem={renderHotLeadCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.secondary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Zap size={48} color={theme.colors.disabled} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('leads.no_hot_leads')}</Text>
              <Text style={[styles.emptyHint, { color: theme.colors.disabled }]}>{t('leads.save_posts_hint')}</Text>
            </View>
          }
        />
      )}

      {selectedTab === 'mybook' && (
        <FlatList
          data={getFilteredData() as Lead[]}
          renderItem={renderLeadCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.secondary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookMarked size={48} color={theme.colors.disabled} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('leads.no_mybook_leads')}</Text>
              <Text style={[styles.emptyHint, { color: theme.colors.disabled }]}>{t('leads.convert_hint')}</Text>
            </View>
          }
        />
      )}

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

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedLead(null);
          // Restore source tab if modal was opened from navigation (Home screen)
          if (sourceTab && sourceTab !== selectedTab) {
            setSelectedTab(sourceTab as any);
          }
          setSourceTab(null);
        }}
        onNotesUpdated={loadLeads} // Reload leads after notes are saved
        onAddToMyBook={selectedLead && selectedLead.source_type !== 'community' ? async (lead) => {
          if (!user) return;

          try {
            const userLeadId = (lead as any).user_lead_id;

            if (userLeadId) {
              await useLeadsStore.getState().promoteLeadToMyBook(userLeadId, user.id);
              useLeadsStore.getState().updateLead(lead.id, { source_type: 'community' as Lead['source_type'] });

              Toast.show({
                type: 'success',
                text1: t('leads.converted_successfully'),
              });
            } else {
              const communityPost = {
                id: lead.id,
                user_id: user.id,
                post_type: 'LOAD_AVAILABLE' as const,
                status: 'active' as const,
                origin_city: lead.city || '',
                origin_country: lead.country || '',
                origin_lat: lead.latitude || 0,
                origin_lng: lead.longitude || 0,
                template_key: 'custom',
                created_at: new Date().toISOString(),
                profile: {
                  full_name: lead.contact_person_name || lead.company_name,
                  company_name: lead.company_name,
                  phone_number: lead.phone || '',
                  email: lead.email || '',
                },
                contact_phone: lead.phone || undefined,
                contact_whatsapp: !!lead.whatsapp,
              } as unknown as CommunityPost;

              await handleAddToMyBook(communityPost);
            }

            setModalVisible(false);
            setSelectedLead(null);
            setSourceTab(null);
          } catch (error) {
            console.error('Error adding to My Book from modal:', error);
          }
        } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  leadCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  leadHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkButton: {
    padding: 4,
  },
  leadName: {
    fontSize: 17,
    fontWeight: '700',
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
  socialActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: '500',
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
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  // Tab styles
  tabsContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  tabFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTabText: {
    fontWeight: '700',
  },
  // Country + City Filter Bar (identical to Community Feed)
  filterBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterControlDisabled: {
    opacity: 0.5,
  },
  filterLabelContainer: {
    flex: 1,
    minWidth: 0,
  },
  filterLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  filterLabelDisabled: {
    color: '#D1D5DB',
  },
  filterValueSelected: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  filterValuePlaceholder: {
    fontSize: 13,
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
  // Filter buttons (Hot Leads tab) - Pill style with category colors
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24, // More pronounced pill shape
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  hotLeadCardWrapper: {
    marginBottom: 12,
  },
  // New Lead Card Header with Image
  leadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  leadImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular like Home
    backgroundColor: '#F1F5F9',
  },
  leadInfo: {
    flex: 1,
    gap: 4,
  },
  leadIndustry: {
    fontSize: 13,
    color: '#94A3B8',
  },
  lastContactedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  lastContactedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  lastContactedTextNew: {
    color: '#10B981',
  },
  // Card Actions (Bookmark + Badge)
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Contact Actions Row (Chips)
  contactActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Notes Preview
  notesPreview: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
});
