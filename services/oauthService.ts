import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

/**
 * Sign in with Apple using Supabase Auth
 * @returns Session data if successful
 */
export async function signInWithApple() {
  try {
    console.log('Starting Apple Sign In...');
    
    // Check if running in Expo Go (doesn't support Apple Sign In properly)
    const appOwnership = Constants.appOwnership;
    if (appOwnership === 'expo') {
      throw new Error('Apple Sign In requires a Development Build. It does not work in Expo Go. Run: npx expo run:ios');
    }
    
    // Check if Apple Auth is available (iOS 13+)
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Authentication is not available on this device');
    }

    // Generate nonce for security
    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );

    console.log('Requesting Apple credentials...');
    
    // Request Apple ID credential
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    console.log('Apple credentials received:', {
      hasIdentityToken: !!credential.identityToken,
      hasEmail: !!credential.email,
      hasFullName: !!credential.fullName,
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    // Sign in to Supabase with Apple ID token
    console.log('Signing in to Supabase with Apple token...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    });

    if (error) {
      console.error('Supabase Apple sign-in error:', error);
      throw error;
    }

    console.log('Apple Sign In successful!', {
      hasSession: !!data.session,
      hasUser: !!data.user,
    });

    // If this is the first sign-in and we have full name, update profile
    if (credential.fullName && data.user) {
      const fullName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(' ');

      if (fullName) {
        console.log('Updating profile with Apple name:', fullName);
        await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('user_id', data.user.id);
      }
    }

    return data;
  } catch (error: any) {
    console.error('Apple Sign In error:', error);
    
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User canceled the sign-in flow
      return null;
    }
    
    throw error;
  }
}

/**
 * Sign in with Google using OAuth
 * Uses expo-auth-session for browser-based OAuth flow
 */
export async function signInWithGoogle() {
  try {
    console.log('Starting Google Sign In...');

    // For web: Just use origin - Supabase SDK will auto-detect session from URL fragments
    // For mobile: Use custom scheme deep link
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin // Web: Supabase SDK auto-detects session
      : 'truxel://auth/callback'; // Mobile: deep link

    console.log('Google OAuth redirect URL:', redirectTo);

    // Supabase handles the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect back to app after auth
        redirectTo,
        // Skip browser redirect on mobile (we'll handle it manually)
        skipBrowserRedirect: Platform.OS !== 'web',
        // Request user info scopes
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Supabase Google sign-in error:', error);
      throw error;
    }

    console.log('Google OAuth initiated:', {
      hasUrl: !!data.url,
      provider: data.provider,
      redirectTo,
    });

    // Note: The actual sign-in happens in browser
    // User will be redirected back to app after authentication
    // Session will be automatically created by Supabase

    return data;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}

/**
 * Check if Apple Sign In is available on this device
 */
export async function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Check if Google Sign In is available
 * Google OAuth works on all platforms via browser
 */
export function isGoogleAuthAvailable(): boolean {
  // Google OAuth via browser works on all platforms
  return true;
}
