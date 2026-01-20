/**
 * Custom Expo Config Plugin
 * Applies @react-native-firebase/app ONLY for Android builds
 * iOS builds will skip Firebase completely to avoid compatibility issues
 */
const { withPlugins, createRunOncePlugin } = require('@expo/config-plugins');

// Only require the Firebase plugin when building for Android
const withAndroidFirebase = (config) => {
  // Check if we're building for Android
  // The plugin will be applied during prebuild, and we can check the platform
  if (process.env.EAS_BUILD_PLATFORM === 'android' || !process.env.EAS_BUILD_PLATFORM) {
    try {
      // Dynamically require the Firebase plugin
      // Pointing to the correct location via exports and using .default because it's a transpiled module
      const withFirebase = require('@react-native-firebase/app/app.plugin.js').default;
      return withFirebase(config);
    } catch (e) {
      console.warn('[withAndroidOnlyFirebase] Firebase plugin not found, skipping...');
      console.error(e);
      return config;
    }
  }
  
  return config;
};

module.exports = createRunOncePlugin(withAndroidFirebase, 'withAndroidOnlyFirebase', '1.0.0');
