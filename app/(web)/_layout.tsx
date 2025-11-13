import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { WebHeader } from '@/components/web/WebHeader';
import { GDPRConsentBanner } from '@/components/web/GDPRConsentBanner';

export default function WebLayout() {
  return (
    <View style={styles.container}>
      <WebHeader />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="features" />
          <Stack.Screen name="pricing_web" />
          <Stack.Screen name="about" />
          <Stack.Screen name="contact" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="refund" />
          <Stack.Screen name="cookies" />
        </Stack>
      </View>
      {Platform.OS === 'web' && <GDPRConsentBanner />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});
