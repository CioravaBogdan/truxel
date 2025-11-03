export default {
  expo: {
    name: "Truxel",
    slug: "truxel",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "truxel",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.truxel.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Truxel needs your location to find companies near you.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Truxel needs your location to find companies near you."
      },
      config: {
        googleMapsApiKey: ""
      },
      usesAppleSignIn: true
    },
    android: {
      package: "com.truxel.app",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "INTERNET"
      ],
      config: {
        googleMaps: {
          apiKey: ""
        }
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-location",
      "expo-secure-store",
      "expo-apple-authentication",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    updates: {
      enabled: false
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
  }
};

