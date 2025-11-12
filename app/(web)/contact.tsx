import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react-native';
import { Button } from '@/components/Button';
import Toast from 'react-native-toast-message';
import { WebFooter } from '@/components/web/WebFooter';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    if (!formData.email.includes('@')) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, just open email client with pre-filled data
      const emailBody = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
      const mailtoUrl = `mailto:office@truxel.io?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;

      await Linking.openURL(mailtoUrl);

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'Your email client has been opened. Please send the email to complete your message.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not open email client. Please email us directly at office@truxel.io' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.section}>
          <Text style={styles.heroTitle}>Contact Us</Text>
          <Text style={styles.heroSubtitle}>
            Have questions? We&apos;d love to hear from you. Get in touch with our team.
          </Text>
        </View>
      </View>

      {/* Contact Methods */}
      <View style={[styles.section, styles.contactSection]}>
        <View style={styles.contactGrid}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:office@truxel.io')}
          >
            <Mail size={32} color="#2563EB" />
            <Text style={styles.contactCardTitle}>Email</Text>
            <Text style={styles.contactCardText}>office@truxel.io</Text>
            <Text style={styles.contactCardDesc}>
              We&apos;ll respond within 24-48 hours
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL('tel:+40750492985')}
          >
            <Phone size={32} color="#2563EB" />
            <Text style={styles.contactCardTitle}>Phone</Text>
            <Text style={styles.contactCardText}>+40 750 492 985</Text>
            <Text style={styles.contactCardDesc}>
              Mon-Fri, 9:00-18:00 EET
            </Text>
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <MapPin size={32} color="#2563EB" />
            <Text style={styles.contactCardTitle}>Location</Text>
            <Text style={styles.contactCardText}>Bucharest, Romania</Text>
            <Text style={styles.contactCardDesc}>
              European Union
            </Text>
          </View>

          <View style={styles.contactCard}>
            <Clock size={32} color="#2563EB" />
            <Text style={styles.contactCardTitle}>Support Hours</Text>
            <Text style={styles.contactCardText}>Monday - Friday</Text>
            <Text style={styles.contactCardDesc}>
              9:00 AM - 6:00 PM EET
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Form */}
      <View style={[styles.section, styles.formSection]}>
        <Text style={styles.sectionTitle}>Send Us a Message</Text>
        <Text style={styles.sectionSubtitle}>
          Fill out the form below and we&apos;ll get back to you as soon as possible.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="How can we help?"
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us more about your inquiry..."
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <Button
            title={isSubmitting ? 'Sending...' : 'Send Message'}
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </View>
      </View>

      {/* FAQ Quick Links */}
      <View style={[styles.section, styles.faqSection]}>
        <Text style={styles.sectionTitle}>Looking for Quick Answers?</Text>
        <Text style={styles.sectionText}>
          Before contacting us, you might find your answer in our FAQ section on the home page, or check out these common topics:
        </Text>

        <View style={styles.topicsList}>
          <View style={styles.topicItem}>
            <Text style={styles.topicTitle}>• How to use GPS search</Text>
          </View>
          <View style={styles.topicItem}>
            <Text style={styles.topicTitle}>• Subscription plans and pricing</Text>
          </View>
          <View style={styles.topicItem}>
            <Text style={styles.topicTitle}>• Cancellation and refunds</Text>
          </View>
          <View style={styles.topicItem}>
            <Text style={styles.topicTitle}>• Data privacy and security</Text>
          </View>
          <View style={styles.topicItem}>
            <Text style={styles.topicTitle}>• Community feature usage</Text>
          </View>
          <View style={styles.topicItem}>
            <Text style={styles.topicTitle}>• Export and manage leads</Text>
          </View>
        </View>
      </View>

      {/* Business Inquiries */}
      <View style={[styles.section, styles.businessSection]}>
        <Text style={styles.sectionTitle}>Business Partnerships</Text>
        <Text style={styles.sectionText}>
          Interested in partnering with Truxel? We&apos;re always looking for opportunities to collaborate with:
          {'\n\n'}
          • Logistics companies{'\n'}
          • Fleet management services{'\n'}
          • Transportation associations{'\n'}
          • Technology providers{'\n'}
          • Marketing and media partners{'\n'}
          {'\n'}
          Email us at office@truxel.io with &quot;Partnership Inquiry&quot; in the subject line.
        </Text>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 64,
    width: '100%',
  },
  hero: {
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 600,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  contactCard: {
    flex: 1,
    minWidth: 250,
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
  },
  contactCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  contactCardText: {
    fontSize: 18,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 8,
  },
  contactCardDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12,
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
  },
  sectionText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
  },
  topicsList: {
    gap: 12,
  },
  topicItem: {
    paddingVertical: 8,
  },
  topicTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  businessSection: {
    backgroundColor: '#F8FAFC',
  },
});
