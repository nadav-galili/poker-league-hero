const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

// Optimize bundle size for Cloudflare Workers
config.resolver = {
   ...config.resolver,
   resolverMainFields: ['react-native', 'browser', 'main'],
   sourceExts: [
      ...(config.resolver?.sourceExts || ['js', 'jsx', 'ts', 'tsx', 'json']),
   ],
};

// Exclude large server-only dependencies from client bundles
config.transformer = {
   ...config.transformer,
   getTransformOptions: async () => ({
      transform: {
         experimentalImportSupport: false,
         inlineRequires: true,
      },
   }),
};

module.exports = withNativeWind(config, { input: './global.css' });
