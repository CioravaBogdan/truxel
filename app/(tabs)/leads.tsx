import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { useLeadsStore } from '@/store/leadsStore';
import { leadsService } from '@/services/leadsService';
import PostCard from '@/components/community/PostCard';
import CountryPickerModal from '@/components/community/CommunityFiltersModal';
import CitySearchModal from '@/components/community/CitySearchModal';
import { cityService } from '@/services/cityService';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Share2, 
  Download, 
  Search as SearchIcon,
  Zap,
  BookMarked,
  Users,
  Truck,
  Globe,
} from 'lucide-react-native';
import { Lead } from '@/types/database.types';
import type { CommunityPost, Country, City } from '@/types/community.types';

export default function LeadsScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const { 
    selectedTab,
    setSelectedTab,
    leads, 
    setLeads, 
    savedPosts,
    hotLeadsFilter,
    setHotLeadsFilter,
    convertedLeads,
    loadSavedPosts,
    loadConvertedLeads,
    searchQuery, 
    setSearchQuery,
  } = useLeadsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      void loadSavedPosts(user.id);
    } else if (selectedTab === 'mybook') {
      void loadConvertedLeads(user.id);
    }
  }, [selectedTab, user, loadLeads, loadSavedPosts, loadConvertedLeads]);

  const onRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    
    if (selectedTab === 'search') {
      await loadLeads();
    } else if (selectedTab === 'hotleads') {
      await loadSavedPosts(user.id);
    } else if (selectedTab === 'mybook') {
      await loadConvertedLeads(user.id);
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
    if (!user || !lead.source_id) return;
    
    try {
      // Unsave the community post (this will remove the converted lead)
      await leadsService.deleteLead(lead.id);
      
      // Reload My Book leads
      await loadConvertedLeads(user.id);
      
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

  // Email, WhatsApp, Share handlers for Lead cards
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

Shared from Truxel
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
      const fileName = `Truxel_Leads_${new Date().toISOString().split('T')[0]}.csv`;
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
      
      // Apply Country filter
      if (selectedCountry) {
        filtered = filtered.filter(lead => lead.country === selectedCountry.code);
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
      
      // Apply Country filter
      if (selectedCountry) {
        filtered = filtered.filter(p => p.origin_country === selectedCountry.code);
      }
      
      // Apply City filter
      if (selectedCity) {
        filtered = filtered.filter(p => p.origin_city === selectedCity.name);
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
      
      // Apply Country filter
      if (selectedCountry) {
        filtered = filtered.filter(lead => lead.country === selectedCountry.code);
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
    // Check if this lead is from My Book (converted from community post)
    const isMyBookLead = lead.source_type === 'community';
    
    return (
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
          <View style={styles.leadHeaderRight}>
            {isMyBookLead && selectedTab === 'mybook' && (
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={() => handleDeleteFromMyBook(lead)}
              >
                <BookMarked size={20} color="#10B981" fill="#10B981" />
              </TouchableOpacity>
            )}
            <StatusBadge status={lead.status} />
          </View>
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
  };  const renderHotLeadCard = ({ item: post }: { item: CommunityPost }) => (
    <PostCard post={post} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('leads.title')}</Text>
        <TouchableOpacity onPress={handleExportCSV} disabled={leads.length === 0}>
          <Download size={24} color={leads.length > 0 ? '#2563EB' : '#CBD5E1'} />
        </TouchableOpacity>
      </View>

      {/* Tabs Container */}
      <View style={styles.tabsContainer}>
        {/* Top row: Search Results + Hot Leads */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabHalf, 
              { backgroundColor: selectedTab === 'search' ? '#2563EB' : '#DBEAFE' },
              selectedTab === 'search' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('search')}
          >
            <SearchIcon size={18} color={selectedTab === 'search' ? 'white' : '#2563EB'} />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'search' ? 'white' : '#2563EB' },
              selectedTab === 'search' && styles.activeTabText
            ]}>
              {t('leads.search_results').toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabHalf, 
              { backgroundColor: selectedTab === 'hotleads' ? '#F59E0B' : '#FEF3C7' },
              selectedTab === 'hotleads' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('hotleads')}
          >
            <Zap size={18} color={selectedTab === 'hotleads' ? 'white' : '#D97706'} />
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'hotleads' ? 'white' : '#D97706' },
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
            { backgroundColor: selectedTab === 'mybook' ? '#10B981' : '#D1FAE5' },
            selectedTab === 'mybook' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('mybook')}
        >
          <BookMarked size={18} color={selectedTab === 'mybook' ? 'white' : '#059669'} />
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'mybook' ? 'white' : '#059669' },
            selectedTab === 'mybook' && styles.activeTabText
          ]}>
            {t('leads.my_book').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Country + City Filter Bar (identical to Community Feed) */}
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

      {/* Hot Leads Filter Buttons */}
      {selectedTab === 'hotleads' && (
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              hotLeadsFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setHotLeadsFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              hotLeadsFilter === 'all' && styles.filterButtonTextActive
            ]}>
              {t('leads.filter_all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              hotLeadsFilter === 'drivers' && styles.filterButtonActive
            ]}
            onPress={() => setHotLeadsFilter('drivers')}
          >
            <Users size={16} color={hotLeadsFilter === 'drivers' ? 'white' : '#64748B'} />
            <Text style={[
              styles.filterButtonText,
              hotLeadsFilter === 'drivers' && styles.filterButtonTextActive
            ]}>
              {t('leads.filter_drivers')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              hotLeadsFilter === 'forwarding' && styles.filterButtonActive
            ]}
            onPress={() => setHotLeadsFilter('forwarding')}
          >
            <Truck size={16} color={hotLeadsFilter === 'forwarding' ? 'white' : '#64748B'} />
            <Text style={[
              styles.filterButtonText,
              hotLeadsFilter === 'forwarding' && styles.filterButtonTextActive
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
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <SearchIcon size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('leads.no_search_results')}</Text>
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
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Zap size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('leads.no_hot_leads')}</Text>
              <Text style={styles.emptyHint}>{t('leads.save_posts_hint')}</Text>
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
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <BookMarked size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('leads.no_mybook_leads')}</Text>
              <Text style={styles.emptyHint}>{t('leads.convert_hint')}</Text>
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
  leadHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkButton: {
    padding: 4,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterControl: {
    flex: 1,
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
    minWidth: 0,
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
});
