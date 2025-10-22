import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

/**
 * Sign in with Apple using Supabase Auth
 * @returns Session data if successful
 */
export async function signInWithApple() {
  try {
    console.log('Starting Apple Sign In...');
    
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
 * Note: This requires a custom dev client (not available in Expo Go)
 */
export async function signInWithGoogle() {
  try {
    console.log('Google Sign In not yet implemented');
    console.log('Requires custom dev client build (npx expo run:ios)');
    
    // TODO: Implement Google Sign In with expo-auth-session
    // This will require:
    // 1. Google Cloud Console project setup
    // 2. OAuth client ID for iOS
    // 3. Custom dev client build
    
    throw new Error('Google Sign In requires a custom development build. Please use Apple Sign In or email/password for now.');
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
