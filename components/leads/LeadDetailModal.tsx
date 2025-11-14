import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Navigation,
  Package,
} from 'lucide-react-native';
import { Lead } from '@/types/database.types';
import { useAuthStore } from '@/store/authStore';
import {
  safeOpenWhatsApp,
  safeOpenEmail,
  safeOpenPhone,
} from '@/utils/safeNativeModules';

interface LeadDetailModalProps {
  lead: Lead | null;
  visible: boolean;
  onClose: () => void;
  onAddToMyBook?: (lead: Lead) => void;
}

export default function LeadDetailModal({ lead, visible, onClose, onAddToMyBook }: LeadDetailModalProps) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();

  if (!lead) return null;
  
  // Check if this lead is already in My Book (converted from community)
  const isAlreadyInMyBook = lead.source_type === 'community';

  // Collect all phone numbers (work + mobile)
  const phoneNumbers = [
    { type: 'work', number: lead.phone, icon: Phone },
    { type: 'mobile', number: lead.whatsapp, icon: MessageCircle },
  ].filter(p => p.number);

  // Collect all emails
  const emails = [lead.email].filter(Boolean);

  // Social media links
  const socialLinks = [
    { 
      name: 'LinkedIn', 
      url: lead.linkedin_profile_url || lead.linkedin, 
      color: '#0A66C2',
      icon: Globe,
    },
    { 
      name: 'Facebook', 
      url: lead.facebook, 
      color: '#1877F2',
      icon: Globe,
    },
    { 
      name: 'Instagram', 
      url: lead.instagram, 
      color: '#E4405F',
      icon: Globe,
    },
    { 
      name: 'Website', 
      url: lead.website, 
      color: '#10B981',
      icon: Globe,
    },
  ].filter(link => link.url);

  const handleWhatsApp = async (phone: string) => {
    const message = t('templates.whatsapp_message', {
      contactName: lead.contact_person_name || lead.company_name,
      userName: profile?.full_name || '',
      userCompany: profile?.company_name || '',
      location: lead.city || '',
      userPhone: profile?.phone_number || '',
    });

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const phoneWithCode = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

    const result = await safeOpenWhatsApp(
      phoneWithCode,
      message,
      'WhatsApp not available'
    );

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'WhatsApp Error',
        text2: result.userMessage,
      });
    }
  };

  const handleEmail = async (email: string) => {
    const subject = t('templates.email_subject', { 
      company: profile?.company_name || '' 
    });
    const body = t('templates.email_body', {
      contactName: lead.contact_person_name || lead.company_name,
      userName: profile?.full_name || '',
      userCompany: profile?.company_name || '',
      location: lead.city || '',
      userPhone: profile?.phone_number || '',
      userEmail: profile?.email || '',
    });

    const result = await safeOpenEmail(email, subject, body, 'Cannot open email');

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Email Error',
        text2: result.userMessage,
      });
    }
  };

  const handleCall = async (phone: string) => {
    const result = await safeOpenPhone(phone, 'Cannot make phone call');

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Phone Error',
        text2: result.userMessage,
      });
    }
  };

  const handleMaps = () => {
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
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('leads.lead_details')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Company Info Card */}
          <View style={styles.companyCard}>
            <View style={styles.avatarContainer}>
              <Building2 size={48} color="#2563EB" />
            </View>
            
            <Text style={styles.companyName}>{lead.company_name}</Text>
            
            {lead.city && (
              <View style={styles.infoRow}>
                <MapPin size={16} color="#64748B" />
                <Text style={styles.infoText}>
                  {lead.city}{lead.country ? `, ${lead.country}` : ''}
                </Text>
              </View>
            )}
            
            {lead.industry && (
              <View style={styles.infoRow}>
                <Briefcase size={16} color="#64748B" />
                <Text style={styles.infoText}>{lead.industry}</Text>
              </View>
            )}
          </View>

          {/* Add to My Book Button - Only show if not already in My Book and callback provided */}
          {onAddToMyBook && !isAlreadyInMyBook && (
            <View style={styles.addToMyBookContainer}>
              <TouchableOpacity 
                style={styles.addToMyBookButton} 
                onPress={() => onAddToMyBook(lead)}
                accessibilityLabel={t('leads.add_to_mybook')}
              >
                <Package size={18} color="#FFF" />
                <Text style={styles.addToMyBookText}>{t('leads.add_to_mybook')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Contact Section */}
          {(phoneNumbers.length > 0 || emails.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📞 {t('leads.contact_info')}</Text>
              
              {/* Phone Numbers */}
              {phoneNumbers.map((phone, idx) => (
                <View key={`phone-${idx}`} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <phone.icon size={18} color="#64748B" />
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactLabel}>
                        {phone.type === 'work' ? 'Work Phone' : 'Mobile / WhatsApp'}
                      </Text>
                      <Text style={styles.contactValue}>{phone.number}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactActions}>
                    {phone.type === 'mobile' && (
                      <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: '#10B98110' }]}
                        onPress={() => handleWhatsApp(phone.number!)}
                      >
                        <MessageCircle size={18} color="#10B981" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: '#2563EB10' }]}
                      onPress={() => handleCall(phone.number!)}
                    >
                      <Phone size={18} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Emails */}
              {emails.map((email, idx) => (
                <View key={`email-${idx}`} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Mail size={18} color="#64748B" />
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactLabel}>Email</Text>
                      <Text style={styles.contactValue}>{email}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: '#2563EB10' }]}
                    onPress={() => handleEmail(email!)}
                  >
                    <Mail size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Social Media & Maps */}
          {(socialLinks.length > 0 || (lead as any).google_url_place || lead.latitude) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌐 {t('leads.view_website', 'Online Presence')}</Text>
              
              <View style={styles.socialGrid}>
                {socialLinks.map((link, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(link.url!)}
                  >
                    <link.icon size={20} color={link.color} />
                    <Text style={[styles.socialButtonText, { color: link.color }]}>
                      {link.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {((lead as any).google_url_place || lead.latitude) && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleMaps}
                  >
                    <Navigation size={20} color="#EA4335" />
                    <Text style={[styles.socialButtonText, { color: '#EA4335' }]}>
                      Google Maps
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Address */}
          {lead.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 {t('leads.location')}</Text>
              <Text style={styles.addressText}>{lead.address}</Text>
              {lead.city && (
                <Text style={styles.addressText}>
                  {lead.city}{lead.country ? `, ${lead.country}` : ''}
                </Text>
              )}
            </View>
          )}

          {/* Notes */}
          {lead.user_notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 {t('leads.notes')}</Text>
              <Text style={styles.notesText}>{lead.user_notes}</Text>
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Add extra top padding to avoid status bar overlap
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  companyCard: {
    backgroundColor: 'white',
    padding: 24,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#64748B',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  notesText: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  addToMyBookContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  addToMyBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B', // Orange background (same as PostCard)
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 200,
    justifyContent: 'center',
  },
  addToMyBookText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
