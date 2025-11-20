import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { WebFooter } from '@/components/web/WebFooter';
import { useTheme } from '@/lib/theme';

export default function DataDeletion() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Data Deletion Instructions</Text>
        <Text style={[styles.updated, { color: theme.colors.textSecondary }]}>Last Updated: November 20, 2025</Text>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>1. Overview</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            At Truxel, we respect your right to control your data. In compliance with GDPR and App Store guidelines, we provide a simple way for you to request the deletion of your account and all associated data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>2. How to Delete Your Account</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            You can delete your account directly within the Truxel mobile application. This action is irreversible.
          </Text>
          
          <View style={styles.stepsContainer}>
            <Text style={[styles.step, { color: theme.colors.text }]}>1. Open the Truxel App</Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>Log in to your account on your mobile device.</Text>
            
            <Text style={[styles.step, { color: theme.colors.text }]}>2. Go to Profile</Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>Tap on the Profile tab in the bottom navigation bar.</Text>
            
            <Text style={[styles.step, { color: theme.colors.text }]}>3. Access Settings</Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>Tap the Settings icon (gear) in the top right corner.</Text>
            
            <Text style={[styles.step, { color: theme.colors.text }]}>4. Select "Delete Account"</Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>Scroll to the bottom and tap "Delete Account".</Text>
            
            <Text style={[styles.step, { color: theme.colors.text }]}>5. Confirm Deletion</Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>Read the warning and confirm your choice. You may be asked to re-authenticate.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>3. What Data is Deleted?</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            When you delete your account, the following data is permanently removed from our systems:
            {'\n'}• Personal Profile Information (Name, Email, Phone)
            {'\n'}• Authentication Credentials
            {'\n'}• Saved Leads and Favorites
            {'\n'}• Community Posts and Comments
            {'\n'}• Search History
            {'\n'}• Device Tokens
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>4. Data Retention</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            Some data may be retained for legal or accounting purposes, such as transaction records for purchases made through Stripe or App Stores, as required by law. This data is not linked to your active profile and is stored securely.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>5. Manual Deletion Request</Text>
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            If you cannot access the app or prefer to request deletion manually, please contact our support team:
            {'\n'}
            {'\n'}Email: office@truxel.io
            {'\n'}Subject: Data Deletion Request
            {'\n'}
            {'\n'}Please include your registered email address in the request. We will process your request within 30 days.
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
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 32,
      },
    }),
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
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepsContainer: {
    marginTop: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
  },
  step: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 16,
    lineHeight: 24,
  },
});
