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
    owner: "cioravabogdan",
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "io.truxel.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: "Truxel needs your location to find companies near you.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Truxel needs your location to find companies near you.",
        LSApplicationQueriesSchemes: [
          "whatsapp",
          "whatsapp-business",
          "whatsapp-messenger"
        ]
      },
      config: {
        googleMapsApiKey: ""
      },
      usesAppleSignIn: true
    },
    android: {
      package: "io.truxel.app",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "INTERNET",
        "POST_NOTIFICATIONS"
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
      // TRUXEL_ prefix for EAS builds, EXPO_PUBLIC_ for local development
      supabaseUrl: process.env.TRUXEL_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.TRUXEL_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.TRUXEL_STRIPE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      eas: {
        projectId: "ec6e92c9-663d-4a34-a69a-88ce0ddaafab"
      }
    }
  }
};

