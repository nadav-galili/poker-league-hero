/**
 * League Card Skeleton Component - Loading placeholder for league cards
 */

import { getTheme } from '@/colors';
import React from 'react';
import { Animated, View } from 'react-native';

export function LeagueCardSkeleton() {
   const theme = getTheme('light');
   const shimmerValue = React.useRef(new Animated.Value(0)).current;

   React.useEffect(() => {
      const shimmerAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(shimmerValue, {
               toValue: 1,
               duration: 1000,
               useNativeDriver: true,
            }),
            Animated.timing(shimmerValue, {
               toValue: 0,
               duration: 1000,
               useNativeDriver: true,
            }),
         ])
      );

      shimmerAnimation.start();

      return () => {
         shimmerAnimation.stop();
      };
   }, [shimmerValue]);

   const shimmerOpacity = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
   });

   return (
      <View
         className="flex-row items-center p-5 rounded-xl border-[6px] border-gray-200 bg-gray-50 relative overflow-hidden"
         style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
         }}
      >
         {/* League Image Skeleton */}
         <View className="relative mr-5">
            <Animated.View
               className="w-20 h-20 rounded-xl bg-gray-300"
               style={{
                  opacity: shimmerOpacity,
                  backgroundColor: theme.surfaceElevated,
               }}
            />
            <View
               className="absolute -top-2 -left-2 -right-2 -bottom-2 border-[6px] rounded-[20px] opacity-90 border-gray-300"
               style={{ borderColor: theme.border }}
            />
         </View>

         {/* League Info Skeleton */}
         <View className="flex-1 gap-3">
            {/* Title skeleton */}
            <Animated.View
               className="h-5 rounded bg-gray-300 w-3/4"
               style={{
                  opacity: shimmerOpacity,
                  backgroundColor: theme.surfaceElevated,
               }}
            />

            <View className="flex-row items-center gap-3">
               {/* Code skeleton */}
               <Animated.View
                  className="flex-1 h-12 rounded-md bg-gray-300"
                  style={{
                     opacity: shimmerOpacity,
                     backgroundColor: theme.surfaceElevated,
                  }}
               />

               {/* Share button skeleton */}
               <Animated.View
                  className="w-10 h-10 rounded-md bg-gray-300"
                  style={{
                     opacity: shimmerOpacity,
                     backgroundColor: theme.surfaceElevated,
                  }}
               />
            </View>

            {/* Members count skeleton */}
            <Animated.View
               className="h-4 rounded bg-gray-300 w-1/2"
               style={{
                  opacity: shimmerOpacity,
                  backgroundColor: theme.surfaceElevated,
               }}
            />
         </View>
      </View>
   );
}