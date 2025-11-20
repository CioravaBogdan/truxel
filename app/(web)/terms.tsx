import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { useTheme } from '@/lib/theme';

export default function TermsOfService() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Terms of Service</Text>
        <Text style={[styles.updated, { color: theme.colors.textSecondary }]}>Last Updated: November 12, 2025</Text>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            By accessing and using Truxel ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>2. Definitions</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • "Service" refers to the Truxel mobile application and web platform{'\n'}
            • "User" or "you" refers to the person using our Service{'\n'}
            • "We," "us," or "our" refers to Truxel{'\n'}
            • "Searches" refers to GPS-based company searches{'\n'}
            • "Credits" refers to search credits in your account{'\n'}
            • "Leads" refers to company information saved by users{'\n'}
            • "Community" refers to the driver networking feature
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>3. Eligibility</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You must be at least 18 years old and have the legal capacity to enter into contracts to use our Service. By using Truxel, you represent that you meet these requirements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>4. Account Registration</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            4.1 Account Security: You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized access.{'\n\n'}
            4.2 Account Sharing: Each account is for individual use only. Sharing accounts is prohibited.{'\n\n'}
            4.3 Accurate Information: You must provide accurate and complete information during registration and keep it updated.{'\n\n'}
            4.4 Account Termination: We reserve the right to suspend or terminate accounts that violate these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>5. Service Description</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            5.1 GPS Search: Find logistics companies within 5km of your location based on GPS coordinates.{'\n\n'}
            5.2 Lead Management: Save, organize, and export company contact information.{'\n\n'}
            5.3 Community: Post availability, find routes, and connect with other drivers.{'\n\n'}
            5.4 Templates: Use pre-filled email and WhatsApp templates for outreach.{'\n\n'}
            5.5 Service Limitations: Search results depend on available data and may vary. We do not guarantee 100% accuracy of company information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>6. Subscription Plans and Pricing</Text>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>6.1 Available Plans</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Trial: 5 searches total, free, no credit card required{'\n'}
            • Standard: €29.99/month, 15 searches per month{'\n'}
            • Pro: €49.99/month, 30 searches per month + LinkedIn + AI matching{'\n'}
            • Search Packs: One-time purchase of additional searches (10, 25, or 50)
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>6.2 Billing and Payment</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • All payments are processed securely through Stripe{'\n'}
            • Subscriptions are billed monthly in advance{'\n'}
            • Payment must be received to maintain active subscription{'\n'}
            • We accept credit cards, debit cards, and other Stripe-supported methods{'\n'}
            • Prices are in EUR and include applicable taxes
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>6.3 Automatic Renewal</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date. You will be charged the then-current subscription price.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>6.4 Cancellation</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You may cancel your subscription at any time from your profile settings. Cancellation takes effect at the end of your current billing period. No refunds for partial months.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>6.5 Upgrades and Downgrades</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            • Upgrades: Applied immediately with pro-rated charges{'\n'}
            • Downgrades: Take effect at next billing cycle with pro-rated credit applied
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>7. Search Credits</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            7.1 Monthly Credits: Reset on your subscription renewal date{'\n'}
            7.2 Purchased Credits: Valid for 12 months from purchase date{'\n'}
            7.3 Credit Priority: Purchased credits are used before monthly subscription credits{'\n'}
            7.4 Non-transferable: Credits cannot be transferred, sold, or refunded once used{'\n'}
            7.5 Expiration: Unused monthly credits do not roll over to the next month
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>8. Acceptable Use Policy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You agree NOT to:{'\n'}
            • Use automated tools, bots, or scripts to access the Service{'\n'}
            • Scrape, harvest, or collect data from the Service{'\n'}
            • Resell or redistribute data obtained from the Service{'\n'}
            • Send spam or unsolicited communications to leads{'\n'}
            • Harass, threaten, or abuse other users{'\n'}
            • Post false, misleading, or fraudulent information{'\n'}
            • Violate any applicable laws or regulations{'\n'}
            • Circumvent usage limits or access controls{'\n'}
            • Reverse engineer or attempt to extract source code{'\n'}
            • Upload malware, viruses, or harmful code
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>9. Community Guidelines</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            9.1 Authentic Posts: Only post genuine availability or route information{'\n'}
            9.2 Respectful Communication: Treat all community members with respect{'\n'}
            9.3 No Spam: Excessive promotional content is prohibited{'\n'}
            9.4 Posting Limits: Respect tier-based posting limits:{'\n'}
            • Trial: Limited community access{'\n'}
            • Standard: 5 posts/day, 30 posts/month{'\n'}
            • Pro: 10 posts/day, 100 posts/month{'\n'}
            9.5 Content Moderation: We reserve the right to remove inappropriate content
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>10. Intellectual Property</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            10.1 Truxel Ownership: All intellectual property rights in the Service, including design, code, logos, and trademarks, belong to Truxel.{'\n\n'}
            10.2 User Content: You retain ownership of your data (leads, notes, posts). By using the Service, you grant us a limited license to store and process your data.{'\n\n'}
            10.3 Limited License: We grant you a non-exclusive, non-transferable license to use the Service for its intended purpose.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>11. Data Accuracy and Liability</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            11.1 No Guarantee: We strive for accuracy but do not guarantee the completeness or accuracy of company information.{'\n\n'}
            11.2 Third-Party Data: Some data is sourced from public sources and third parties. We are not responsible for inaccuracies in such data.{'\n\n'}
            11.3 User Verification: You are responsible for verifying information before acting on it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>12. Limitation of Liability</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            12.1 Service "As Is": The Service is provided "as is" without warranties of any kind, express or implied.{'\n\n'}
            12.2 No Liability for Damages: We are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.{'\n\n'}
            12.3 Maximum Liability: Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months preceding the claim.{'\n\n'}
            12.4 Business Outcomes: We are not responsible for your business relationships, contracts, or outcomes with companies found through our Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>13. Indemnification</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You agree to indemnify and hold harmless Truxel from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>14. Termination</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            14.1 By You: You may delete your account at any time from profile settings.{'\n\n'}
            14.2 By Us: We may suspend or terminate your account for violation of these Terms, non-payment, or fraudulent activity.{'\n\n'}
            14.3 Effect of Termination: Upon termination, you lose access to your account and data. Downloaded data (CSV exports) remains yours.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>15. Changes to Terms</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We may modify these Terms at any time. Material changes will be communicated via email at least 30 days in advance. Continued use after changes constitutes acceptance. If you disagree, you must stop using the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>16. Privacy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Your use of the Service is also governed by our Privacy Policy. Please review it at truxel.io/privacy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>17. Dispute Resolution</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            17.1 Informal Resolution: We encourage you to contact us first at office@truxel.io to resolve disputes amicably.{'\n\n'}
            17.2 Mediation: If informal resolution fails, parties agree to attempt mediation before litigation.{'\n\n'}
            17.3 Jurisdiction: Any legal disputes shall be resolved in the courts of Bucharest, Romania.{'\n\n'}
            17.4 Governing Law: These Terms are governed by Romanian law and EU regulations (GDPR).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>18. Force Majeure</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We are not liable for failure to perform due to circumstances beyond our reasonable control, including natural disasters, war, strikes, or internet/server failures.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>19. Severability</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in full effect.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>20. Entire Agreement</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and Truxel regarding the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>21. Contact Information</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            For questions about these Terms:{'\n'}
            Email: office@truxel.io{'\n'}
            Phone: +40 750 492 985{'\n'}
            {'\n'}
            Truxel{'\n'}
            Bucharest, Romania
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
