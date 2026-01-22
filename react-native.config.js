module.exports = {
  dependencies: {
    '@react-native-firebase/app': {
      platforms: {
        ios: null,
        android: {
          packageImportPath: 'import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;',
        },
      },
    },
    '@react-native-firebase/analytics': {
      platforms: {
        ios: null,
        android: {
          packageImportPath: 'import io.invertase.firebase.analytics.ReactNativeFirebaseAnalyticsPackage;',
        },
      },
    },
  },
};
