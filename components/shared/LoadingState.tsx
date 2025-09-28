/**
 * Loading State Component
 */

import { getTheme } from '@/colors';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function LoadingState() {
   const theme = getTheme('light');

   return (
      <View className="flex-1 justify-center items-center">
         <ActivityIndicator size="large" color={theme.primary} />
      </View>
   );
}
