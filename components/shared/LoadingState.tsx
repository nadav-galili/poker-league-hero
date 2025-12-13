/**
 * Loading State Component with Cyberpunk Design
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingStateProps {
   message?: string;
   variant?: 'default' | 'minimal' | 'geometric';
}

export function LoadingState({
   message = 'Loading...',
   variant = 'default',
}: LoadingStateProps = {}) {
   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={{ flex: 1 }}
      >
         <View className="flex-1 justify-center items-center px-8">
            <View className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 items-center">
               <ActivityIndicator size="large" color="#00FFFF" />
               <Text className="text-white text-lg font-medium mt-4 text-center">
                  {message}
               </Text>
            </View>
         </View>
      </LinearGradient>
   );
}
