import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { useTheme } from '@/lib/theme';

export default function RefundPolicy() {
  const { theme } = useTheme();
  const seoDescription =
    'Politica de rambursare Truxel explica optiunile de anulare si returnare pentru abonamente si pachete de cautari destinate soferilor si flotelor.';

  return (
    <>
      <SeoHead
        title="Politica de rambursare Truxel"
        description={seoDescription}
        path="/refund"
        type="article"
      />

      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Refund Policy</Text>
          <Text style={[styles.updated, { color: theme.colors.textSecondary }]}>Last Updated: November 12, 2025</Text>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>1. Overview</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            At Truxel, we want you to be completely satisfied with our Service. This Refund Policy explains our refund and cancellation procedures for subscriptions and search pack purchases.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>2. Monthly Subscriptions</Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>2.1 Cancellation Anytime</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You can cancel your monthly subscription at any time from your profile settings. There are no cancellation fees or penalties.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>2.2 Access Until End of Billing Period</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            When you cancel, you retain full access to your subscription features until the end of your current billing period. You will not be charged for subsequent months.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>2.3 No Partial Month Refunds</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We do not provide refunds for partial months. If you cancel mid-month, you can continue using the Service until your paid period ends, but you will not receive a refund for unused days.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>2.4 First Payment Refund (7-Day Window)</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If you are unsatisfied with your first subscription payment, you may request a full refund within 7 days of the initial charge. After 7 days, standard refund rules apply.{'\n\n'}
            To request a first-payment refund:{'\n'}
            • Email office@truxel.io with your account email{'\n'}
            • State "First Payment Refund Request"{'\n'}
            • We will process your refund within 5-7 business days
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>3. Plan Changes</Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>3.1 Upgrades</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            When you upgrade to a higher-tier plan:{'\n'}
            • You are charged the pro-rated difference immediately{'\n'}
            • New features activate instantly{'\n'}
            • Your billing date remains the same
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>3.2 Downgrades</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            When you downgrade to a lower-tier plan:{'\n'}
            • Change takes effect at your next billing cycle{'\n'}
            • You receive pro-rated credit for the difference{'\n'}
            • You keep current-tier features until the change takes effect{'\n'}
            • Credits are applied automatically to your next invoice
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>4. Search Packs (One-Time Purchases)</Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>4.1 Refund Eligibility</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Search packs are eligible for refund ONLY if:{'\n'}
            • No searches have been used (0 credits consumed){'\n'}
            • Request is made within 14 days of purchase{'\n'}
            • You provide a valid reason for the refund request
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>4.2 Non-Refundable After Use</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Once you use even one search credit from a purchased pack, the entire pack becomes non-refundable. This is because search data has been provided to you.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>4.3 Expired Credits</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Search pack credits expire 12 months from purchase date. We do not provide refunds for expired, unused credits. Please use your credits within the validity period.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>5. Exceptional Refund Circumstances</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We may provide refunds outside of our standard policy in the following circumstances:
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>5.1 Technical Issues</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If you experience significant technical problems that prevent you from using the Service for an extended period (3+ days), we may issue a pro-rated refund for the downtime period.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>5.2 Billing Errors</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If you are charged incorrectly due to a system error (double charge, wrong amount, unauthorized charge), we will issue a full refund immediately upon verification.
          </Text>

          <Text style={[styles.subheading, { color: theme.colors.text }]}>5.3 Service Not as Described</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If we make material changes to our Service that significantly reduce functionality without notice, you may request a pro-rated refund within 30 days of the change.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>6. Refund Request Process</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            To request a refund:{'\n\n'}
            Step 1: Email us at office@truxel.io{'\n'}
            Step 2: Include:{'\n'}
            • Your account email address{'\n'}
            • Reason for refund request{'\n'}
            • Transaction ID or date of charge{'\n'}
            • Any supporting documentation{'\n\n'}
            Step 3: Our team will review your request within 2-3 business days{'\n'}
            Step 4: If approved, refund is processed within 5-7 business days{'\n'}
            Step 5: Refund appears on your original payment method within 5-10 business days
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>7. Refund Method</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            All refunds are issued to the original payment method used for the purchase. We process refunds through Stripe, our payment processor.{'\n\n'}
            • Credit/Debit Card: 5-10 business days{'\n'}
            • Bank Transfer: 5-10 business days{'\n'}
            • Other Methods: According to Stripe's processing time{'\n\n'}
            We cannot issue refunds to a different payment method or account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>8. Non-Refundable Items</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            The following are NOT eligible for refunds:{'\n'}
            • Used search credits (searches already performed){'\n'}
            • Subscription months after the first 7 days{'\n'}
            • Community posts already published{'\n'}
            • Exported data (CSV downloads){'\n'}
            • Account suspension/termination due to Terms violation{'\n'}
            • Expired search pack credits{'\n'}
            • Voluntary account deletion
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>9. Chargeback Policy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If you initiate a chargeback through your bank or credit card company without first contacting us:{'\n'}
            • Your account will be immediately suspended{'\n'}
            • We will provide documentation to your bank showing the charge was legitimate{'\n'}
            • You may be charged chargeback processing fees{'\n\n'}
            Please contact us FIRST at office@truxel.io to resolve billing issues before initiating a chargeback.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>10. Failed Payment Recovery</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If a subscription payment fails:{'\n'}
            • We will retry the charge 2 additional times over 7 days{'\n'}
            • You will receive email notifications about the failed payment{'\n'}
            • After 3 failed attempts, your subscription will be cancelled{'\n'}
            • No refund is provided for partial service during the retry period
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>11. Refund Abuse Policy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We reserve the right to refuse refund requests that appear fraudulent or abusive, including:{'\n'}
            • Repeated refund requests across multiple accounts{'\n'}
            • Requesting refunds after extensive Service use{'\n'}
            • Providing false information in refund requests{'\n'}
            • Pattern of subscribing, using heavily, then immediately cancelling{'\n\n'}
            Accounts found to be abusing our refund policy may be permanently banned.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>12. Currency and Exchange Rates</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            All prices are displayed in EUR. If your bank converts charges to a different currency:{'\n'}
            • Exchange rate fluctuations are not grounds for refund{'\n'}
            • Refunds are issued in EUR; your bank handles conversion{'\n'}
            • Currency conversion fees are non-refundable
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>13. Changes to This Policy</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            We may update this Refund Policy from time to time. Material changes will be communicated via email at least 30 days in advance. Continued use after changes constitutes acceptance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>14. Contact Us</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            For refund requests or questions about this policy:{'\n\n'}
            Email: office@truxel.io{'\n'}
            Phone: +40 750 492 985{'\n'}
            Support Hours: Monday-Friday, 9:00-18:00 EET{'\n'}
            Response Time: Within 2-3 business days{'\n\n'}
            When contacting us, please include your account email and as much detail as possible to help us process your request quickly.
          </Text>
        </View>
        </View>

        <WebFooter />
      </ScrollView>
    </>
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
