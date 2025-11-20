import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  ...textInputProps
}: InputProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text 
          },
          error ? { borderColor: theme.colors.error } : undefined,
          style,
        ]}
        placeholderTextColor={theme.colors.placeholder}
        {...textInputProps}
      />
      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
