export default {
  expo: {
    name: "Truxel",
    slug: "truxel",
    version: "1.0.1",
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
      buildNumber: "5",
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
      // Maps disabled - not using MapView in app (Location via Expo Location only)
      // If needed in future, uncomment and use TRUXEL_ prefix:
      // config: {
      //   googleMapsApiKey: process.env.TRUXEL_GOOGLE_MAPS_API_KEY || ""
      // },
      usesAppleSignIn: true,
      // iOS App Icons (from Truxel_Brand assets)
      icon: "./assets/Truxel_Brand/App Store 1024 x 1024.png"
    },
    android: {
      versionCode: 5,
      package: "io.truxel.app",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "INTERNET",
        "POST_NOTIFICATIONS"
      ],
      // Intent filters for deep linking (OAuth redirects)
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "truxel",
              host: "*"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      // Maps disabled - not using MapView in app (Location via Expo Location only)
      // If needed in future, uncomment and use TRUXEL_ prefix:
      // config: {
      //   googleMaps: {
      //     apiKey: process.env.TRUXEL_GOOGLE_MAPS_API_KEY || ""
      //   }
      // }
      // Android Adaptive Icon
      adaptiveIcon: {
        foregroundImage: "./assets/Truxel_Brand/androind launcher 192x192.png",
        backgroundColor: "#ffffff"
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
          color: "#ffffff",
          sounds: ["./assets/sounds/notification.mp3"]
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
      // TRUXEL_ prefix for all environments (consistent naming)
      supabaseUrl: process.env.TRUXEL_SUPABASE_URL,
      supabaseAnonKey: process.env.TRUXEL_SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.TRUXEL_STRIPE_PUBLISHABLE_KEY,
      // RevenueCat API Keys (get from RevenueCat Dashboard)
      revenueCatIosKey: process.env.TRUXEL_REVENUECAT_IOS_KEY || '',
      revenueCatAndroidKey: process.env.TRUXEL_REVENUECAT_ANDROID_KEY || '',
      revenueCatWebKey: process.env.TRUXEL_REVENUECAT_WEB_KEY || '',
      revenueCatWebAppId: process.env.TRUXEL_REVENUECAT_WEB_APP_ID || '',
      // N8N Webhook URLs (for analytics and automation)
      n8nSearchWebhook: process.env.TRUXEL_N8N_SEARCH_WEBHOOK,
      n8nCityWebhook: process.env.TRUXEL_N8N_CITY_WEBHOOK,
      n8nChatWebhook: process.env.TRUXEL_N8N_CHAT_WEBHOOK,
      eas: {
        projectId: "ec6e92c9-663d-4a34-a69a-88ce0ddaafab"
      }
    }
  }
};

