import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform } from 'react-native';

const THEME_KEY = 'app_theme_preference';

/**
 * Theme type definitions
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    white: string;
    black: string;
    disabled: string;
    placeholder: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

/**
 * Light Theme (The Professional - Navy/Orange)
 * Matches "Option 1" from design_preview_v2.html
 */
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#0F172A', // Deep Navy (Option 1)
    primaryDark: '#020617', // Darker Navy
    secondary: '#FF5722', // Neon Orange (Option 1)
    background: Platform.OS === 'web' ? '#FFFFFF' : '#F1F5F9', // White on web, Light Gray on mobile
    surface: '#FFFFFF', // Pure White
    card: '#FFFFFF',
    text: '#0F172A', // Navy Text
    textSecondary: '#64748B', // Slate 500
    border: '#E2E8F0', // Slate 200
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#0EA5E9',
    white: '#FFFFFF',
    black: '#000000',
    disabled: '#94A3B8',
    placeholder: '#CBD5E1',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6, // Slightly softer corners
    md: 10,
    lg: 16,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#64748B', // Softer shadow color
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

/**
 * Dark Theme (Night Haul - Midnight/Neon)
 * Matches "Option 3" from design_preview_v2.html
 */
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#38BDF8', // Cyan Glow (Option 3)
    primaryDark: '#0284C7',
    secondary: '#FF6D00', // Neon Orange (Option 3)
    background: '#0F172A', // Deep Navy (Option 3)
    surface: '#1E293B', // Lighter Navy Card (Option 3)
    card: '#1E293B',
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    border: '#334155', // Slate 700
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#38BDF8',
    white: '#FFFFFF',
    black: '#000000',
    disabled: '#475569',
    placeholder: '#64748B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

/**
 * Theme Context
 */
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Component
 * 
 * Usage:
 * 1. Wrap app in ThemeProvider in app/_layout.tsx
 * 2. Use useTheme() hook in components to access theme
 * 3. Call setThemeMode('dark'|'light'|'auto') to change theme
 * 
 * Example:
 * ```tsx
 * const { theme, isDark, setThemeMode } = useTheme();
 * <View style={{ backgroundColor: theme.colors.background }}>
 *   <Text style={{ color: theme.colors.text }}>Hello</Text>
 * </View>
 * ```
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isReady, setIsReady] = useState(false);

  // Load saved preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        setThemeModeState(saved);
      }
    } catch (error) {
      console.error('[ThemeProvider] Error loading theme:', error);
    } finally {
      setIsReady(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_KEY, mode);
      console.log(`[ThemeProvider] Theme set to: ${mode}`);
    } catch (error) {
      console.error('[ThemeProvider] Error saving theme:', error);
    }
  };

  // Determine actual theme based on mode and system preference
  const getActiveTheme = (): Theme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getActiveTheme();
  const isDark = theme.mode === 'dark';

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme
 * 
 * Example:
 * ```tsx
 * const { theme, isDark, setThemeMode } = useTheme();
 * 
 * <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
 *   <Text style={{ color: theme.colors.text }}>
 *     Current mode: {isDark ? 'Dark' : 'Light'}
 *   </Text>
 *   <Button onPress={() => setThemeMode('dark')}>Enable Dark Mode</Button>
 * </View>
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
