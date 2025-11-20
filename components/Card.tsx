import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/lib/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const { theme } = useTheme();
  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg, // Use theme radius
          ...theme.shadows.medium, // Use theme shadow
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    // Shadow props removed here as they are now handled by theme
  },
});
