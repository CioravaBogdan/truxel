// Keep App Store version human-readable and stable.
// IMPORTANT:
// - `expo.version` maps to iOS CFBundleShortVersionString (what App Store shows as “Version”).
// - `ios.buildNumber` maps to CFBundleVersion (what App Store shows as “Build”).
// We should never inject timestamps into `expo.version`.
// NOTE: We previously uploaded builds with very large patch versions (e.g. 1.0.<timestamp>).
// To ensure the next submission is accepted, bumping the minor version is safest.
const baseVersion = "1.1.2";
// Build number policy (3–4 digits max):
// - Use a deterministic seed derived from version: Mmmpp (e.g. 1.1.0 -> 1100, 1.2.3 -> 1203)
// - Let EAS autoIncrement bump it per build (configured in eas.json)
// - Optional override via env for emergency/manual cases
const parseVersionPart = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
};

const [vMajor, vMinor, vPatch] = String(baseVersion).split('.');
const major = parseVersionPart(vMajor);
const minor = parseVersionPart(vMinor);
const patch = parseVersionPart(vPatch);

const versionSeedBuildNumber = major * 1000 + minor * 100 + patch; // <= 9999 for 0-9.0-99

const envOverrideBuildNumber = (() => {
  const raw = process.env.TRUXEL_BUILD_NUMBER_OVERRIDE;
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isInteger(n) && n > 0 && n <= 9999) return n;
  return null;
})();

const buildNumber = envOverrideBuildNumber ?? versionSeedBuildNumber;
const computedVersion = baseVersion;

export default {
  expo: {
    name: "Truxel",
    slug: "truxel",
    version: computedVersion,
    orientation: "portrait",
    icon: "./assets/Truxel_Brand/App Store 1024 x 1024.png",
    scheme: "truxel",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: "cioravabogdan",
    splash: {
      image: "./assets/Truxel_Brand/App Store 1024 x 1024.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      buildNumber: String(buildNumber),
      supportsTablet: false,
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
      versionCode: buildNumber,
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
          icon: "./assets/Truxel_Brand/androind launcher 192x192.png",
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
      n8nSearchWebhook: process.env.TRUXEL_N8N_SEARCH_WEBHOOK || 'https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd',
      n8nCityWebhook: process.env.TRUXEL_N8N_CITY_WEBHOOK || 'https://automation.truxel.io/webhook/700ac3c5-d6aa-4e35-9181-39fe0f48d7bf',
      n8nChatWebhook: process.env.TRUXEL_N8N_CHAT_WEBHOOK || 'https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c',
      eas: {
        projectId: "ec6e92c9-663d-4a34-a69a-88ce0ddaafab"
      }
    }
  }
};

