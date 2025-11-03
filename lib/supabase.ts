import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

// Check if we're on web platform
const isWeb = Platform.OS === 'web';

// For web, use localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // Fallback for SSR or non-browser environments
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

// Web storage adapter
const WebStorageAdapter = {
  getItem: (key: string) => {
    const storage = getLocalStorage();
    return Promise.resolve(storage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    const storage = getLocalStorage();
    storage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    const storage = getLocalStorage();
    storage.removeItem(key);
    return Promise.resolve();
  },
};

// Native storage adapter using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => SecureStore.deleteItemAsync(key),
};

// Check if we can use SecureStore (native platforms only)
const canUseSecureStore = !isWeb && SecureStore;

// Use appropriate storage adapter based on platform
const storageAdapter = canUseSecureStore ? ExpoSecureStoreAdapter : WebStorageAdapter;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});
