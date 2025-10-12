const { getDefaultConfig } = require('expo/metro-config');

module.exports = ({ config }) => {
   // Base configuration from app.json
   const baseConfig = {
      name: 'HomeStack',
      slug: 'poker-ai-homestack',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      scheme: 'pokeraihomestack',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
         supportsTablet: true,
         bundleIdentifier: 'com.pokeraihomestack.app',
         infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
         },
      },
      android: {
         adaptiveIcon: {
            foregroundImage: './assets/images/icon.png',
            backgroundColor: '#ffffff',
         },
         edgeToEdgeEnabled: true,
         package: 'com.pokeraihomestack.app',
         intentFilters: [
            {
               autoVerify: true,
               action: 'VIEW',
               data: [
                  {
                     scheme: 'pokeraihomestack',
                  },
               ],
               category: ['BROWSABLE', 'DEFAULT'],
            },
         ],
      },
      plugins: [
         [
            'expo-router',
            {
               asyncRoutes: {
                  web: true,
                  default: false,
               },
            },
         ],
         [
            'expo-splash-screen',
            {
               image: './assets/images/icon.png',
               imageWidth: 200,
               resizeMode: 'contain',
               backgroundColor: '#ffffff',
            },
         ],
         'expo-font',
         'expo-web-browser',
         [
            '@sentry/react-native/expo',
            {
               url: 'https://sentry.io/',
               project: 'poker-league-hero',
               organization: 'nadav-g',
            },
         ],
      ],
      experiments: {
         typedRoutes: true,
      },
      extra: {
         router: {
            origin: false,
            asyncRoutes: {
               web: true,
               default: false,
            },
         },
         eas: {
            projectId: '43b198a0-4fc4-46b7-a540-4550da1b1e45',
         },
      },
   };

   // Only add web configuration for web builds
   const platform =
      process.env.EXPO_PLATFORM || process.env.EAS_BUILD_PLATFORM || 'default';
   console.log('App Config - Platform detected:', platform);

   if (platform === 'web' || platform === undefined) {
      baseConfig.web = {
         bundler: 'metro',
         output: 'server',
         favicon: './assets/images/icon.png',
      };
   }

   return baseConfig;
};
