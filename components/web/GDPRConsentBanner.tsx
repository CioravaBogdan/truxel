import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export function GDPRConsentBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem('gdpr_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Error checking GDPR consent:', error);
    }
  };

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem('gdpr_consent', 'accepted');
      await AsyncStorage.setItem('gdpr_consent_date', new Date().toISOString());
      setShowBanner(false);
    } catch (error) {
      console.error('Error saving GDPR consent:', error);
    }
  };

  const handleDecline = async () => {
    try {
      await AsyncStorage.setItem('gdpr_consent', 'declined');
      await AsyncStorage.setItem('gdpr_consent_date', new Date().toISOString());
      setShowBanner(false);
    } catch (error) {
      console.error('Error saving GDPR consent:', error);
    }
  };

  if (!showBanner || Platform.OS !== 'web') return null;

  return (
    <View style={styles.banner}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.text}>
            {t('web.gdpr.message')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(web)/cookies')}>
            <Text style={styles.link}>{t('web.gdpr.learn_more')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={handleDecline}
          >
            <Text style={styles.declineButtonText}>{t('web.gdpr.decline')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>{t('web.gdpr.accept')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    padding: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 24,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
    lineHeight: 20,
  },
  link: {
    fontSize: 14,
    color: '#60A5FA',
    textDecorationLine: 'underline',
    cursor: 'pointer' as any,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  declineButtonText: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  acceptButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
