import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, MessageCircle, Sparkles } from 'lucide-react-native';
import { Button } from '@/components/Button';
import Toast from 'react-native-toast-message';
import { WebFooter } from '@/components/web/WebFooter';
import { useTheme } from '@/lib/theme';

export default function ContactPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactCards = useMemo(
    () => [
      {
        icon: Mail,
        title: t('web.contact.cards.email.title'),
        value: 'office@truxel.io',
        description: t('web.contact.cards.email.subtitle'),
        action: () => Linking.openURL('mailto:office@truxel.io'),
      },
      {
        icon: Phone,
        title: t('web.contact.cards.phone.title'),
        value: '+40 750 492 985',
        description: t('web.contact.cards.phone.subtitle'),
        action: () => Linking.openURL('tel:+40750492985'),
      },
      {
        icon: MessageCircle,
        title: t('web.contact.cards.whatsapp.title'),
        value: '+40 750 492 985',
        description: t('web.contact.cards.whatsapp.subtitle'),
        action: () => Linking.openURL('https://wa.me/40750492985'),
      },
      {
        icon: Clock,
        title: t('web.contact.cards.hours.title'),
        value: t('web.contact.cards.hours.value'),
        description: t('web.contact.cards.hours.subtitle'),
      },
      {
        icon: MapPin,
        title: t('web.contact.cards.location.title'),
        value: t('web.contact.cards.location.value'),
        description: t('web.contact.cards.location.subtitle'),
      },
    ],
    [t],
  );

  const audiences = useMemo(
    () => [
      {
        badge: t('web.contact.audience.drivers.badge'),
        title: t('web.contact.audience.drivers.title'),
        bullets: [
          t('web.contact.audience.drivers.point1'),
          t('web.contact.audience.drivers.point2'),
          t('web.contact.audience.drivers.point3'),
        ],
      },
      {
        badge: t('web.contact.audience.shippers.badge'),
        title: t('web.contact.audience.shippers.title'),
        bullets: [
          t('web.contact.audience.shippers.point1'),
          t('web.contact.audience.shippers.point2'),
          t('web.contact.audience.shippers.point3'),
        ],
      },
    ],
    [t],
  );

  const handleSubmit = async () => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      Toast.show({ type: 'error', text1: t('web.contact.toast.error_title'), text2: t('web.contact.toast.error_fields') });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Toast.show({ type: 'error', text1: t('web.contact.toast.error_title'), text2: t('web.contact.toast.error_email') });
      return;
    }

    setIsSubmitting(true);

    try {
      const emailBody = `${t('web.contact.form.name_label')}: ${trimmedName}\n${t('web.contact.form.email_label')}: ${trimmedEmail}\n\n${t('web.contact.form.message_label')}\n${trimmedMessage}`;
      const mailtoUrl = `mailto:office@truxel.io?subject=${encodeURIComponent(trimmedSubject)}&body=${encodeURIComponent(emailBody)}`;

      await Linking.openURL(mailtoUrl);

      setFormData({ name: '', email: '', subject: '', message: '' });

      Toast.show({ type: 'success', text1: t('web.contact.toast.success_title'), text2: t('web.contact.toast.success_message') });
    } catch (err) {
      console.error('Failed to open mail client', err);
      Toast.show({ type: 'error', text1: t('web.contact.toast.error_title'), text2: t('web.contact.toast.error_open') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.hero, { backgroundColor: theme.colors.background }]}>
        <View style={styles.section}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: theme.colors.secondary + '1F' }]}>
              <Sparkles size={18} color={theme.colors.secondary} />
              <Text style={[styles.heroBadgeText, { color: theme.colors.secondary }]}>{t('web.contact.hero_badge')}</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{t('web.contact.hero_title')}</Text>
            <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>{t('web.contact.hero_subtitle')}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.cardsSection, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.contact.cards_badge')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.contact.cards_title')}</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>{t('web.contact.cards_subtitle')}</Text>

        <View style={styles.contactGrid}>
          {contactCards.map((card) => {
            const Icon = card.icon;
            const clickable = typeof card.action === 'function';
            const content = (
              <View style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, clickable && styles.contactCardInteractive]}>
                <View style={[styles.contactIcon, { backgroundColor: `${theme.colors.secondary}1F` }]}>
                  <Icon size={22} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.contactTitle, { color: theme.colors.text }]}>{card.title}</Text>
                <Text style={[styles.contactValue, { color: theme.colors.text }]}>{card.value}</Text>
                <Text style={[styles.contactDesc, { color: theme.colors.textSecondary }]}>{card.description}</Text>
              </View>
            );

            if (!clickable) {
              return <View key={card.title}>{content}</View>;
            }

            return (
              <TouchableOpacity key={card.title} activeOpacity={0.85} onPress={card.action}>
                {content}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.formSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.formHeader}>
          <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.contact.form_badge')}</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.contact.form_title')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>{t('web.contact.form_subtitle')}</Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('web.contact.form.name_label')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                placeholder={t('web.contact.form.name_placeholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                autoComplete="name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('web.contact.form.email_label')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                placeholder={t('web.contact.form.email_placeholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('web.contact.form.subject_label')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder={t('web.contact.form.subject_placeholder')}
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.subject}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, subject: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('web.contact.form.message_label')}</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder={t('web.contact.form.message_placeholder')}
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.message}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, message: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <Button
            title={isSubmitting ? t('web.contact.form_button_loading') : t('web.contact.form_button')}
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </View>
      </View>

      <View style={[styles.section, styles.audienceSection, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.contact.audience_badge')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.contact.audience_title')}</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>{t('web.contact.audience_subtitle')}</Text>

        <View style={styles.audienceGrid}>
          {audiences.map((audience) => (
            <View key={audience.title} style={[styles.audienceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.audienceBadge, { backgroundColor: `${theme.colors.secondary}1F`, color: theme.colors.secondary }]}>{audience.badge}</Text>
              <Text style={[styles.audienceTitle, { color: theme.colors.text }]}>{audience.title}</Text>
              <View style={styles.audienceList}>
                {audience.bullets.map((bullet) => (
                  <Text key={bullet} style={[styles.audienceItem, { color: theme.colors.textSecondary }]}>• {bullet}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.bottomCtaSection, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.bottomCtaCard, { backgroundColor: '#0F172A', borderColor: '#1E293B' }]}>
          <Text style={[styles.bottomCtaTitle, { color: '#FFFFFF' }]}>{t('web.contact.bottom_cta_title')}</Text>
          <Text style={[styles.bottomCtaSubtitle, { color: '#94A3B8' }]}>{t('web.contact.bottom_cta_subtitle')}</Text>
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[styles.bottomPrimary, { backgroundColor: theme.colors.secondary }]}
              onPress={() => Linking.openURL('https://cal.com/truxel/demo')}
            >
              <Text style={styles.bottomPrimaryText}>{t('web.contact.bottom_cta_primary')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomSecondary, { borderColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => Linking.openURL('mailto:office@truxel.io?subject=Partnership%20Inquiry')}
            >
              <Text style={[styles.bottomSecondaryText, { color: '#FFFFFF' }]}>{t('web.contact.bottom_cta_secondary')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 80,
    width: '100%',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 992px)': {
        paddingHorizontal: 32,
        paddingVertical: 64,
      },
      '@media (max-width: 600px)': {
        paddingHorizontal: 20,
        paddingVertical: 48,
      },
    } as any),
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    gap: 24,
    maxWidth: 760,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 52,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 34,
        lineHeight: 42,
      },
    } as any),
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 640,
  },
  sectionEyebrow: {
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 12,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 12,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 30,
      },
    } as any),
  },
  sectionSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 720,
    marginBottom: 32,
  },
  cardsSection: {
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  contactCard: {
    flex: 1,
    minWidth: 240,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  contactCardInteractive: {
    ...(Platform.OS === 'web' && {
      transition: 'transform 0.2s ease, border-color 0.2s ease',
      ':hover': {
        transform: 'translateY(-4px)',
        borderColor: 'rgba(255, 107, 53, 0.35)',
      },
    } as any),
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
  formSection: {
  },
  formHeader: {
    marginBottom: 24,
  },
  form: {
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 220,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 160,
  },
  audienceSection: {
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  audienceCard: {
    flex: 1,
    minWidth: 260,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  audienceBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    textTransform: 'uppercase',
  },
  audienceTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  audienceList: {
    gap: 8,
    marginTop: 8,
  },
  audienceItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  bottomCtaSection: {
  },
  bottomCtaCard: {
    borderRadius: 32,
    padding: 48,
    alignItems: 'center',
    gap: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  bottomCtaTitle: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  bottomCtaSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 620,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  bottomPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
  bottomPrimaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
  bottomSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
