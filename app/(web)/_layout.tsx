import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { WebHeader } from '@/components/web/WebHeader';
import { useTheme } from '@/lib/theme';

export default function WebLayout() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
