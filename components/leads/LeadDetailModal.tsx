import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  useAnimatedScrollHandler,
  useAnimatedRef,
} from 'react-native-reanimated';
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
  Save,
  Edit3,
  Users,
  FileText,
} from 'lucide-react-native';
import { Lead } from '@/types/database.types';
import { useAuthStore } from '@/store/authStore';
import { useLeadsStore } from '@/store/leadsStore';
import {
  safeOpenWhatsApp,
  safeOpenEmail,
  safeOpenPhone,
} from '@/utils/safeNativeModules';
import { leadsService } from '@/services/leadsService';
import { useTheme } from '@/lib/theme';

interface LeadDetailModalProps {
  lead: Lead | null;
  visible: boolean;
  onClose: () => void;
  onAddToMyBook?: (lead: Lead) => void;
  onNotesUpdated?: () => void; // Callback to reload leads after saving notes
  onNext?: () => void;
  onPrev?: () => void;
  enableSwipe?: boolean;
}

// Helper to parse contact lists that might be JSON arrays or comma-separated strings
const parseContactList = (input?: string): string[] => {
  if (!input) return [];
  
  try {
    // Try parsing as JSON first (e.g. ["+123", "+456"])
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.map(item => String(item).trim()).filter(Boolean);
    }
  } catch (e) {
    // Not valid JSON, fall back to split
  }
  
  // Fallback: split by comma, newline, or semicolon
  // Also clean up any leftover JSON artifacts like brackets or quotes if the string was malformed
  return input
    .split(/[,\n;]/)
    .map(item => item.replace(/[\[\]"]/g, '').trim()) // Remove [ ] " chars
    .filter(Boolean);
};

const LeadCardContent = React.memo(({ lead, onNext, onPrev, onClose, onAddToMyBook, onNotesUpdated, enableSwipe = true }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { profile, user } = useAuthStore();
  
  // Notes editor state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  // Animation State
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  // Reset position when lead changes (instead of remounting component)
  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scrollY.value = 0;
    // Scroll to top when lead changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [lead.id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const pan = Gesture.Pan()
    .simultaneousWithExternalGesture(scrollViewRef)
    .activeOffsetX([-10, 10]) // Activate on horizontal swipe > 10px
    .activeOffsetY([-1000, 10]) // Activate on vertical pull-down > 10px (ignore scroll-down/push-up)
    .enabled(enableSwipe) // Disable swipe if enableSwipe is false
    .onUpdate((event) => {
      // Handle Horizontal Swipe (Next/Prev)
      let x = event.translationX;
      
      // Resistance at boundaries
      if (x > 0 && !onPrev) {
        x = x * 0.3; // Dampen if no previous
      } else if (x < 0 && !onNext) {
        x = x * 0.3; // Dampen if no next
      }
      
      translateX.value = x;
      
      // Handle Vertical Swipe (Close)
      // Only allow dragging down (positive Y) AND when scroll is at top
      let y = event.translationY;
      
      // If we are scrolled down, don't allow dragging down to close
      // Unless we are dragging UP (scrolling down), which ScrollView handles
      // We use a small threshold (5) for scrollY to account for bounce/precision
      if (scrollY.value > 5 && y > 0) {
        y = 0;
      }
      
      if (y < 0) y = y * 0.3; // Dampen upward drag
      
      translateY.value = y;
    })
    .onEnd((event) => {
      const SWIPE_THRESHOLD = 100;
      const VELOCITY_THRESHOLD = 500;

      // 1. Handle Vertical Close (Swipe Down)
      // Only if we are at the top (with small threshold)
      if (scrollY.value <= 5 && (event.translationY > 150 || (event.translationY > 50 && event.velocityY > VELOCITY_THRESHOLD))) {
        runOnJS(onClose)();
        return;
      }

      // 2. Handle Horizontal Navigation
      // Swipe Right -> Previous
      if ((event.translationX > SWIPE_THRESHOLD || (event.translationX > 20 && event.velocityX > VELOCITY_THRESHOLD)) && onPrev) {
        runOnJS(onPrev)();
      } 
      // Swipe Left -> Next
      else if ((event.translationX < -SWIPE_THRESHOLD || (event.translationX < -20 && event.velocityX < -VELOCITY_THRESHOLD)) && onNext) {
        runOnJS(onNext)();
      } 
      // 3. Reset / Bounce Back
      else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
  }));

  // Initialize notes text when modal opens
  React.useEffect(() => {
    if (lead) {
      setNotesText(lead.user_notes || '');
      setIsEditingNotes(false);
    }
  }, [lead]);

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

  // Parse additional contacts (collected from web)
  const additionalPhones = parseContactList(lead.phones)
    .filter(p => p !== lead.phone && p !== lead.whatsapp);
    
  const additionalEmails = parseContactList(lead.emails)
    .filter(e => e !== lead.email);

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

  const markAsContacted = async () => {
    if (!user || !lead.user_lead_id) return;
    
    try {
      // Update in DB
      await leadsService.updateLeadStatus(lead.user_lead_id, 'contacted', user.id);
      
      // Update in Store (Optimistic)
      useLeadsStore.getState().updateLead(lead.id, { 
        status: 'contacted',
        last_contacted_at: new Date().toISOString()
      });
      
      // Notify parent to reload if needed
      if (onNotesUpdated) onNotesUpdated();
      
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

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

    if (result.success) {
      markAsContacted();
    } else {
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

    if (result.success) {
      markAsContacted();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Email Error',
        text2: result.userMessage,
      });
    }
  };

  const handleCall = async (phone: string) => {
    const result = await safeOpenPhone(phone, 'Cannot make phone call');

    if (result.success) {
      markAsContacted();
    } else {
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
  
  const handleSaveNotes = async () => {
    if (!user || !(lead as any).user_lead_id) {
      Toast.show({
        type: 'error',
        text1: 'Cannot save notes',
        text2: 'User lead ID not found',
      });
      return;
    }
    
    setIsSavingNotes(true);
    try {
      await leadsService.updateLeadNotes(
        (lead as any).user_lead_id,
        user.id,
        notesText.trim() || null
      );
      
      Toast.show({
        type: 'success',
        text1: 'Notes saved',
        text2: 'Your notes have been updated',
      });
      
      setIsEditingNotes(false);
      
      // Trigger reload of leads list
      if (onNotesUpdated) {
        onNotesUpdated();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save notes',
        text2: 'Please try again',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View 
        style={[styles.content, animatedStyle]}
      >
        <Animated.ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Company Info Card */}
          <View style={[styles.companyCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              {(lead as any).google_url_photo ? (
                <Image 
                  source={{ uri: (lead as any).google_url_photo }} 
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <Building2 size={48} color={theme.colors.primary} />
              )}
            </View>
            
            <Text style={[styles.companyName, { color: theme.colors.text }]}>{lead.company_name}</Text>
            
            {lead.city && (
              <View style={styles.infoRow}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {lead.city}{lead.country ? `, ${lead.country}` : ''}
                </Text>
              </View>
            )}
            
            {lead.industry && (
              <View style={styles.infoRow}>
                <Briefcase size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{lead.industry}</Text>
              </View>
            )}
          </View>

          {/* Description Section (AI Generated) */}
          {lead.description && (
            <View style={[styles.section, { backgroundColor: theme.colors.surface, marginTop: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <FileText size={18} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0, marginLeft: 8 }]}>
                  {t('leads.about_company', 'About Company')}
                </Text>
              </View>
              <Text style={[styles.infoText, { color: theme.colors.text, lineHeight: 22 }]}>
                {lead.description}
              </Text>
            </View>
          )}

          {/* Add to My Book Button - Only show if not already in My Book and callback provided */}
          {onAddToMyBook && !isAlreadyInMyBook && (
            <View style={styles.addToMyBookContainer}>
              <TouchableOpacity 
                style={[styles.addToMyBookButton, { backgroundColor: theme.colors.secondary, shadowColor: theme.colors.secondary }]} 
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
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📞 {t('leads.contact_info')}</Text>
              
              {/* Phone Numbers */}
              {phoneNumbers.map((phone, idx) => (
                <View key={`phone-${idx}`} style={[styles.contactItem, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.contactInfo}>
                    <phone.icon size={18} color={theme.colors.textSecondary} />
                    <View style={styles.contactTextContainer}>
                      <Text style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                        {phone.type === 'work' ? 'Work Phone' : 'Mobile / WhatsApp'}
                      </Text>
                      <Text style={[styles.contactValue, { color: theme.colors.text }]}>{phone.number}</Text>
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
                      style={[styles.iconButton, { backgroundColor: theme.colors.primary + '10' }]}
                      onPress={() => handleCall(phone.number!)}
                    >
                      <Phone size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Emails */}
              {emails.map((email, idx) => (
                <View key={`email-${idx}`} style={[styles.contactItem, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.contactInfo}>
                    <Mail size={18} color={theme.colors.textSecondary} />
                    <View style={styles.contactTextContainer}>
                      <Text style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>Email</Text>
                      <Text style={[styles.contactValue, { color: theme.colors.text }]}>{email}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.colors.primary + '10' }]}
                    onPress={() => handleEmail(email!)}
                  >
                    <Mail size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Additional Contacts Section (Collected from Web) */}
          {(additionalPhones.length > 0 || additionalEmails.length > 0) && (
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🌐 {t('leads.collected_contacts', 'Contacts from Web')}</Text>
              
              {/* Additional Phones */}
              {additionalPhones.map((phone, idx) => (
                <View key={`add-phone-${idx}`} style={[styles.contactItem, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.contactInfo}>
                    <Phone size={18} color={theme.colors.textSecondary} />
                    <View style={styles.contactTextContainer}>
                      <Text style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                        {t('leads.phone_from_web', 'Phone (Web)')}
                      </Text>
                      <Text style={[styles.contactValue, { color: theme.colors.text }]}>{phone}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: '#10B98110' }]}
                      onPress={() => handleWhatsApp(phone)}
                    >
                      <MessageCircle size={18} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: theme.colors.primary + '10' }]}
                      onPress={() => handleCall(phone)}
                    >
                      <Phone size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Additional Emails */}
              {additionalEmails.map((email, idx) => (
                <View key={`add-email-${idx}`} style={[styles.contactItem, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.contactInfo}>
                    <Mail size={18} color={theme.colors.textSecondary} />
                    <View style={styles.contactTextContainer}>
                      <Text style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                        {t('leads.email_from_web', 'Email (Web)')}
                      </Text>
                      <Text style={[styles.contactValue, { color: theme.colors.text }]}>{email}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.colors.primary + '10' }]}
                    onPress={() => handleEmail(email)}
                  >
                    <Mail size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Social Media & Maps */}
          {(socialLinks.length > 0 || (lead as any).google_url_place || lead.latitude || lead.followers) && (
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🌐 {t('leads.view_website', 'Online Presence')}</Text>
              
              {lead.followers && (
                 <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}>
                    <Users size={18} color={theme.colors.textSecondary} />
                    <Text style={{ marginLeft: 12, color: theme.colors.text, fontWeight: '600', fontSize: 15 }}>
                      {lead.followers} {t('leads.followers', 'Followers')}
                    </Text>
                 </View>
              )}
              
              <View style={styles.socialGrid}>
                {socialLinks.map((link, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.socialButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
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
                    style={[styles.socialButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
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
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📍 {t('leads.location')}</Text>
              <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>{lead.address}</Text>
              {lead.city && (
                <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
                  {lead.city}{lead.country ? `, ${lead.country}` : ''}
                </Text>
              )}
            </View>
          )}

          {/* Notes Editor */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.notesHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📝 {t('leads.notes', 'Notes')}</Text>
              {!isEditingNotes && (
                <TouchableOpacity
                  onPress={() => setIsEditingNotes(true)}
                  style={[styles.editButton, { backgroundColor: theme.colors.primary + '15' }]}
                >
                  <Edit3 size={18} color={theme.colors.primary} />
                  <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isEditingNotes ? (
              <>
                <TextInput
                  style={[styles.notesInput, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                  value={notesText}
                  onChangeText={setNotesText}
                  placeholder="Add notes about this lead..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <View style={styles.notesActions}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => {
                      setNotesText(lead?.user_notes || '');
                      setIsEditingNotes(false);
                    }}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.colors.success }]}
                    onPress={handleSaveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Save size={18} color="#FFF" />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
                {notesText || 'No notes yet. Tap Edit to add notes about this lead.'}
              </Text>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </Animated.View>
    </GestureDetector>
  );
});

export default function LeadDetailModal({ lead, visible, onClose, onAddToMyBook, onNotesUpdated, onNext, onPrev, enableSwipe = true }: LeadDetailModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!lead) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('leads.lead_details')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <LeadCardContent 
          // Removed key={lead.id} to prevent full remounting and improve performance
          // State reset is handled inside LeadCardContent via useEffect
          lead={lead}
          onNext={onNext}
          onPrev={onPrev}
          onClose={onClose}
          onAddToMyBook={onAddToMyBook}
          onNotesUpdated={onNotesUpdated}
          enableSwipe={enableSwipe}
        />
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Add extra top padding to avoid status bar overlap
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  companyCard: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
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
  },
  section: {
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
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    fontWeight: '500',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
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
    borderWidth: 1.5,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 15,
    lineHeight: 22,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  addToMyBookContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  addToMyBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    width: '100%', // Full width like other sections
  },
  addToMyBookText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Notes Editor Styles
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    marginBottom: 12,
  },
  notesActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
