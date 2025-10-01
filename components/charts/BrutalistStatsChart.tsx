/**
 * Neo-Brutalist Stats Chart Component
 * Custom data visualization that matches the app's aesthetic
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import React, { useEffect, useRef } from 'react';
import { Animated, View, Dimensions, Easing } from 'react-native';

interface StatItem {
   label: string;
   value: number;
   color?: string;
   icon?: string;
}

interface BrutalistStatsChartProps {
   data: StatItem[];
   title: string;
   variant?: 'bar' | 'progress' | 'stack';
   maxValue?: number;
}

export function BrutalistStatsChart({
   data,
   title,
   variant = 'bar',
   maxValue
}: BrutalistStatsChartProps) {
   const theme = getTheme('light');
   const { width } = Dimensions.get('window');
   const chartWidth = width - 48; // Account for padding

   // Animation refs
   const progressAnims = useRef(
      data.map(() => new Animated.Value(0))
   ).current;

   const pulseAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      // Animate bars in sequence
      const animations = progressAnims.map((anim, index) =>
         Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            delay: index * 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
         })
      );

      // Pulse animation for active elements
      const pulseAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(pulseAnim, {
               toValue: 1.05,
               duration: 1500,
               easing: Easing.inOut(Easing.sine),
               useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
               toValue: 1,
               duration: 1500,
               easing: Easing.inOut(Easing.sine),
               useNativeDriver: true,
            }),
         ])
      );

      Animated.parallel(animations).start();
      pulseAnimation.start();

      return () => pulseAnimation.stop();
   }, [data, progressAnims, pulseAnim]);

   const getMaxValue = () => {
      if (maxValue) return maxValue;
      return Math.max(...data.map(item => item.value));
   };

   const max = getMaxValue();

   const renderBarChart = () => (
      <View className="space-y-4">
         {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            const barWidth = progressAnims[index].interpolate({
               inputRange: [0, 1],
               outputRange: [0, (chartWidth - 100) * (percentage / 100)],
            });

            return (
               <View key={index} className="space-y-2">
                  {/* Label and value */}
                  <View className="flex-row justify-between items-center">
                     <Text
                        variant="labelLarge"
                        color={theme.text}
                        className="font-bold uppercase tracking-wide"
                     >
                        {item.label}
                     </Text>
                     <View
                        className="px-3 py-1 border-2 border-border rounded-lg"
                        style={{
                           backgroundColor: item.color || theme.primary,
                        }}
                     >
                        <Text
                           variant="labelSmall"
                           color={theme.textInverse}
                           className="font-black tracking-wider"
                        >
                           {item.value}
                        </Text>
                     </View>
                  </View>

                  {/* Bar container */}
                  <View className="relative">
                     {/* Background bar */}
                     <View
                        className="h-8 border-3 border-border rounded-lg"
                        style={{
                           backgroundColor: theme.surface,
                           width: chartWidth - 100,
                        }}
                     />

                     {/* Progress bar */}
                     <Animated.View
                        className="absolute left-0 top-0 h-8 border-3 border-border rounded-lg"
                        style={{
                           backgroundColor: item.color || theme.primary,
                           width: barWidth,
                           shadowColor: colors.shadow,
                           shadowOffset: { width: 4, height: 4 },
                           shadowOpacity: 1,
                           shadowRadius: 0,
                           elevation: 8,
                        }}
                     >
                        {/* Inner glow effect */}
                        <View
                           className="absolute inset-1 rounded opacity-40"
                           style={{
                              backgroundColor: theme.accent,
                           }}
                        />
                     </Animated.View>

                     {/* Decorative corner accent */}
                     <View
                        className="absolute -top-1 -right-1 w-4 h-4 border-2 border-border"
                        style={{
                           backgroundColor: theme.warning,
                           transform: [{ rotate: '45deg' }],
                        }}
                     />
                  </View>
               </View>
            );
         })}
      </View>
   );

   const renderProgressChart = () => (
      <View className="space-y-6">
         {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            const circumference = 2 * Math.PI * 40;
            const strokeDasharray = `${(circumference * percentage) / 100} ${circumference}`;

            return (
               <View key={index} className="flex-row items-center space-x-4">
                  {/* Circular progress */}
                  <View className="relative w-20 h-20">
                     <View
                        className="w-20 h-20 rounded-full border-6 border-surface"
                        style={{ borderColor: theme.surface }}
                     />
                     <Animated.View
                        className="absolute inset-0 w-20 h-20 rounded-full border-6"
                        style={{
                           borderColor: item.color || theme.primary,
                           borderTopColor: 'transparent',
                           borderRightColor: 'transparent',
                           transform: [
                              {
                                 rotate: progressAnims[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', `${(percentage / 100) * 360}deg`],
                                 }),
                              },
                           ],
                        }}
                     />

                     {/* Center value */}
                     <View className="absolute inset-0 items-center justify-center">
                        <Text
                           variant="h4"
                           color={theme.primary}
                           className="font-black"
                        >
                           {item.value}
                        </Text>
                     </View>
                  </View>

                  {/* Label */}
                  <View className="flex-1">
                     <Text
                        variant="h4"
                        color={theme.text}
                        className="font-bold uppercase tracking-wide mb-1"
                     >
                        {item.label}
                     </Text>
                     <View
                        className="h-1 border border-border"
                        style={{
                           backgroundColor: item.color || theme.primary,
                           width: '60%',
                        }}
                     />
                  </View>
               </View>
            );
         })}
      </View>
   );

   return (
      <Animated.View
         className="p-6 border-6 border-border rounded-3xl relative"
         style={{
            backgroundColor: theme.surfaceElevated,
            shadowColor: colors.shadow,
            shadowOffset: { width: 12, height: 12 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 20,
            transform: [{ scale: pulseAnim }],
         }}
      >
         {/* Title with accent */}
         <View className="mb-6 relative">
            <Text
               variant="h3"
               color={theme.primary}
               className="font-black uppercase tracking-wider text-center"
            >
               {title}
            </Text>
            <View
               className="absolute -bottom-1 left-1/4 right-1/4 h-1"
               style={{ backgroundColor: theme.accent }}
            />
         </View>

         {/* Chart content */}
         {variant === 'bar' && renderBarChart()}
         {variant === 'progress' && renderProgressChart()}

         {/* Corner decorations */}
         <View
            className="absolute -top-2 -right-2 w-6 h-6 border-3 border-border"
            style={{ backgroundColor: theme.secondary }}
         />
         <View
            className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-border"
            style={{ backgroundColor: theme.warning }}
         />
      </Animated.View>
   );
}