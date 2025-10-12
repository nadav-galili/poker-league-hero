const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

// Check if we're building for mobile platforms
const platform = process.env.EXPO_PLATFORM || process.env.PLATFORM;
const isMobileBuild =
   platform === 'android' ||
   platform === 'ios' ||
   process.env.EAS_BUILD_PLATFORM === 'android' ||
   process.env.EAS_BUILD_PLATFORM === 'ios';

console.log(
   'Metro Config - Platform:',
   platform,
   'EAS Platform:',
   process.env.EAS_BUILD_PLATFORM,
   'Is Mobile:',
   isMobileBuild
);

// Custom resolver function to redirect database imports for mobile builds
const path = require('path');
const customResolver = (context, moduleName, platform) => {
   // Only redirect for mobile platforms
   if (isMobileBuild) {
      // Redirect database imports to mobile stubs
      if (
         moduleName.includes('./db/connection') ||
         moduleName.includes('../db/connection')
      ) {
         console.log('Redirecting db/connection to mobile stub');
         const stubPath = path.resolve(__dirname, 'db/connection.mobile.ts');
         return {
            filePath: stubPath,
            type: 'sourceFile',
         };
      }

      if (
         moduleName.includes('./db/schema') ||
         moduleName.includes('../db/schema')
      ) {
         console.log('Redirecting db/schema to mobile stub');
         const stubPath = path.resolve(__dirname, 'db/schema.mobile.ts');
         return {
            filePath: stubPath,
            type: 'sourceFile',
         };
      }

      if (
         (moduleName.includes('../../db') ||
            moduleName.includes('../../../db')) &&
         !moduleName.includes('.mobile.ts')
      ) {
         console.log('Redirecting relative db import to mobile stub');
         const stubPath = path.resolve(__dirname, 'db/index.mobile.ts');
         return {
            filePath: stubPath,
            type: 'sourceFile',
         };
      }
   }

   // For everything else, fall back to default resolution
   return context.resolveRequest(context, moduleName, platform);
};

// Create platform-specific block list
const createBlockList = () => {
   // For mobile platforms, block server-only dependencies and API routes
   if (isMobileBuild) {
      return [
         // Block server-only node modules from mobile client bundles
         /node_modules\/@aws-sdk\/.*/,
         /node_modules\/@smithy\/.*/,
         /node_modules\/@neondatabase\/.*/,
         /node_modules\/pg\/.*/,
         /node_modules\/postgres\/.*/,
         /node_modules\/drizzle-orm\/.*/,
         /node_modules\/drizzle-kit\/.*/,
         // Block API routes from mobile client bundles - they should only run on server
         /.*\/app\/api\/.*\+api\.ts$/,
      ];
   }

   // For web builds (especially server output), allow database dependencies and API routes
   // Only block development-only tools
   return [
      /node_modules\/drizzle-kit\/.*/, // Only block the CLI tool, not the ORM
   ];
};

// Optimize bundle size and exclude server-only dependencies
config.resolver = {
   ...config.resolver,
   resolverMainFields: ['react-native', 'browser', 'main'],
   sourceExts: [
      ...(config.resolver?.sourceExts || ['js', 'jsx', 'ts', 'tsx', 'json']),
   ],
   blockList: createBlockList(),
   platforms: ['ios', 'android', 'native', 'web'],
   resolveRequest: customResolver,
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
