/**
 * Loading State Component with Cyberpunk Design
 */

import React from 'react';
import { View } from 'react-native';
import CyberpunkLoader, { CyberpunkLoaderVariant } from '../ui/CyberpunkLoader';

interface LoadingStateProps {
   message?: string;
   variant?: 'default' | 'minimal' | 'geometric';
}

export function LoadingState({
   message = 'Loading...',
   variant = 'default',
}: LoadingStateProps = {}) {
   // Map old variant to cyberpunk variant
   const getCyberpunkVariant = (): CyberpunkLoaderVariant => {
      switch (variant) {
         case 'minimal':
            return 'cyan';
         case 'geometric':
            return 'matrix';
         default:
            return 'cyber';
      }
   };

   return (
      <View className="flex-1 justify-center items-center bg-cyberBackground px-8">
         <CyberpunkLoader
            size="large"
            variant={getCyberpunkVariant()}
            text={message}
            overlay={false}
         />
      </View>
   );
}
