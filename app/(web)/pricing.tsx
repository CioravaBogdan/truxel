import React from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PricingScreen from '@/app/(tabs)/pricing';
import { WebFooter } from '@/components/web/WebFooter';

export default function WebPricingPage() {
  return (
    <ScrollView style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.webContainer}>
          <PricingScreen />
        </View>
      ) : (
        <SafeAreaView style={styles.container} edges={['top']}>
          <PricingScreen />
        </SafeAreaView>
      )}
      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
});
