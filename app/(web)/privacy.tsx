import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { useTheme } from '@/lib/theme';

export default function PrivacyPolicy() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: theme.colors.textSecondary }]}>Last Updated: November 12, 2025</Text>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>1. Introduction</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Truxel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>2. Data Controller</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Company Name: Truxel{'\n'}
            Email: office@truxel.io{'\n'}
            Phone: +40 750 492 985{'\n'}
            {'\n'}
            For EU users, we are the data controller responsible for your personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>3. Information We Collect</Text>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>3.1 Personal Information</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Full name{'\n'}
            • Email address{'\n'}
            • Phone number{'\n'}
            • Company name (optional){'\n'}
            • Profile picture (optional)
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>3.2 Location Data</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • GPS coordinates when using search features{'\n'}
            • Addresses you search for{'\n'}
            • Cities selected in Community feature{'\n'}
            • We only collect location when you actively use search features
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>3.3 Usage Data</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Searches performed{'\n'}
            • Leads saved{'\n'}
            • Community posts created{'\n'}
            • App interactions and preferences{'\n'}
            • Device information (device type, OS version, app version)
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>3.4 Payment Information</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Stripe Customer ID (we do NOT store credit card numbers){'\n'}
            • Subscription tier and status{'\n'}
            • Transaction history{'\n'}
            • All payments are processed securely through Stripe (PCI DSS certified)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>4. Legal Basis for Processing (GDPR)</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We process your data based on:{'\n'}
            • Consent: You have given us permission to process your data{'\n'}
            • Contract: Processing is necessary to provide our services{'\n'}
            • Legitimate Interest: To improve our services and prevent fraud{'\n'}
            • Legal Obligation: To comply with applicable laws
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>5. How We Use Your Information</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Provide GPS-based company search services{'\n'}
            • Manage your account and subscription{'\n'}
            • Process payments through Stripe{'\n'}
            • Send you search results and notifications{'\n'}
            • Enable Community features{'\n'}
            • Improve our services and user experience{'\n'}
            • Send important updates and security alerts{'\n'}
            • Comply with legal obligations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>6. Sharing Your Information</Text>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>We share your data with:</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Supabase: Database hosting (EU servers){'\n'}
            • Stripe: Payment processing (PCI DSS compliant){'\n'}
            • Expo: Push notifications{'\n'}
            • Google Analytics: Usage analytics (anonymized){'\n'}
            {'\n'}
            We DO NOT sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>7. International Data Transfers</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Your data is primarily stored on EU servers via Supabase. Some service providers (like Stripe) may transfer data to the US under Standard Contractual Clauses approved by the EU Commission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>8. Data Retention</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Active accounts: Data retained while your account is active{'\n'}
            • Deleted accounts: Data permanently deleted after 30 days{'\n'}
            • Transaction records: Kept for 7 years for accounting purposes{'\n'}
            • Anonymized analytics: Retained indefinitely
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>9. Your Rights (GDPR)</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You have the right to:{'\n'}
            • Access: Request a copy of your data{'\n'}
            • Rectification: Correct inaccurate data{'\n'}
            • Erasure: Request deletion of your data ("Right to be Forgotten"){'\n'}
            • Restriction: Limit how we process your data{'\n'}
            • Portability: Receive your data in a machine-readable format{'\n'}
            • Object: Oppose processing for marketing purposes{'\n'}
            • Withdraw Consent: Revoke consent at any time{'\n'}
            • Lodge a Complaint: Contact your local data protection authority
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>10. How to Exercise Your Rights</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            To exercise any of your rights, contact us at:{'\n'}
            Email: office@truxel.io{'\n'}
            Phone: +40 750 492 985{'\n'}
            {'\n'}
            We will respond within 30 days as required by GDPR.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>11. Cookies and Tracking</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We use essential cookies for authentication and functionality. Optional cookies for analytics require your consent. See our Cookie Policy for details.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>12. Children's Privacy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Our service is intended for users 18 years and older. We do not knowingly collect data from children under 16 (or 13 in some jurisdictions). If we discover such data, we will delete it immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>13. Security</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We implement industry-standard security measures including:{'\n'}
            • SSL/TLS encryption for data in transit{'\n'}
            • Encrypted storage for sensitive data{'\n'}
            • Regular security audits{'\n'}
            • Access controls and authentication{'\n'}
            • Secure EU-based servers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>14. Changes to This Policy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification at least 30 days before they take effect. Continued use after changes constitutes acceptance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>15. Contact Us</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            For privacy-related questions or concerns:{'\n'}
            Email: office@truxel.io{'\n'}
            Phone: +40 750 492 985{'\n'}
            {'\n'}
            For EU users, you can contact your national data protection authority:{'\n'}
            Romania: ANSPDCP (www.dataprotection.ro)
          </Text>
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
  content: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 64,
    width: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 8,
  },
  updated: {
    fontSize: 16,
    marginBottom: 48,
  },
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});
