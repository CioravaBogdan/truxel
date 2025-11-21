import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { 
          backgroundColor: theme.colors.primary,
          ...theme.shadows.small, // Add subtle shadow for depth
        };
      case 'secondary':
        return { 
          backgroundColor: theme.colors.secondary,
          ...theme.shadows.small,
        };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 1.5, 
          borderColor: theme.colors.primary 
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    if (disabled) return { color: theme.colors.disabled };
    switch (variant) {
      case 'primary':
      case 'secondary':
        return { color: theme.colors.white }; // Always white on solid buttons
      case 'outline':
        return { color: theme.colors.primary };
      case 'ghost':
        return { color: theme.colors.textSecondary }; // Ghost buttons usually subtle
      default:
        return {};
    }
  };

  const buttonStyle = [
    styles.button,
    { borderRadius: theme.borderRadius.md }, // Use theme radius
    getVariantStyle(),
    styles[`button_${size}`],
    disabled && { opacity: 0.5, elevation: 0, shadowOpacity: 0 }, // Remove shadow when disabled
    style,
  ];

  const textStyles = [
    styles.text,
    getTextStyle(),
    styles[`text_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.white : theme.colors.primary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 18,
  },
  text_large: {
    fontSize: 20,
  },
});
