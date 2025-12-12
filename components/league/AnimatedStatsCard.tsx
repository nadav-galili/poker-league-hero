/**
 * Animated Statistics Card Components
 * Features animated numbers, progress rings, and visual feedback
 */

import { colors, getTheme } from '@/colors';
import { BrutalistCard } from '@/components/cards/BrutalistCard';
import { BrutalistProgressBar } from '@/components/feedback/BrutalistProgressBar';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
   Animated,
   Easing,
   View,
   Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedNumberProps {
   value: number;
   duration?: number;
   formatter?: (value: number) => string;
   style?: any;
   variant?: any;
   color?: string;
}

// Animated number counter component
export function AnimatedNumber({
   value,
   duration = 1500,
   formatter,
   style,
   variant = 'h3',
   color,
}: AnimatedNumberProps) {
   const animatedValue = useRef(new Animated.Value(0)).current;
   const displayValue = useRef(0);

   useEffect(() => {
      const listener = animatedValue.addListener(({ value: animValue }) => {
         displayValue.current = animValue;
      });

      Animated.timing(animatedValue, {
         toValue: value,
         duration,
         easing: Easing.out(Easing.cubic),
         useNativeDriver: false,
      }).start();

      return () => animatedValue.removeListener(listener);
   }, [value, duration, animatedValue]);

   return (
      <Animated.Text
         style={[style, color ? { color } : {}]}
      >
         {animatedValue.interpolate({
            inputRange: [0, value || 1],
            outputRange: [0, value || 1],
            extrapolate: 'clamp',
         })._value !== undefined
            ? formatter
               ? formatter(Math.round(animatedValue._value || 0))
               : Math.round(animatedValue._value || 0).toString()
            : '0'}
      </Animated.Text>
   );
}

interface AnimatedStatsCardProps {
   title: string;
   value: string | number;
   icon?: keyof typeof Ionicons.glyphMap;
   subtitle?: string;
   trend?: 'up' | 'down' | 'neutral';
   trendValue?: string;
   color?: string;
   delay?: number;
   showProgress?: boolean;
   progressValue?: number;
   maxValue?: number;
   animateNumber?: boolean;
   onPress?: () => void;
}

export function AnimatedStatsCard({
   title,
   value,
   icon,
   subtitle,
   trend,
   trendValue,
   color,
   delay = 0,
   showProgress = false,
   progressValue,
   maxValue,
   animateNumber = false,
   onPress,
}: AnimatedStatsCardProps) {
   const theme = getTheme('light');
   const cardAnim = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(0.8)).current;
   const rotateAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const animations = [
         Animated.timing(cardAnim, {
            toValue: 1,
            duration: 600,
            delay,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
         }),
         Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            delay: delay + 200,
            easing: Easing.elastic(1.5),
            useNativeDriver: true,
         }),
      ];

      if (icon) {
         animations.push(
            Animated.timing(rotateAnim, {
               toValue: 1,
               duration: 800,
               delay: delay + 400,
               easing: Easing.elastic(2),
               useNativeDriver: true,
            })
         );
      }

      Animated.parallel(animations).start();
   }, [cardAnim, scaleAnim, rotateAnim, delay, icon]);

   const getTrendColor = () => {
      switch (trend) {
         case 'up': return theme.success;
         case 'down': return theme.error;
         default: return theme.textMuted;
      }
   };

   const getTrendIcon = () => {
      switch (trend) {
         case 'up': return 'trending-up';
         case 'down': return 'trending-down';
         default: return 'remove';
      }
   };

   const cardColor = color || theme.primary;
   const cardWidth = (SCREEN_WIDTH - 80) / 2; // Two cards per row with margins

   return (
      <Animated.View
         style={{
            transform: [
               { translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
               })},
               { scale: scaleAnim },
            ],
            opacity: cardAnim,
            width: cardWidth,
            marginBottom: 16,
         }}
      >
         <BrutalistCard
            variant="elevated"
            size="medium"
            customBorderColor={cardColor}
            customBackgroundColor={theme.surfaceElevated}
            shadowIntensity="medium"
            pressAnimation={!!onPress}
            onPress={onPress}
            style={{
               minHeight: 120,
               padding: 0,
            }}
         >
            <View className="p-4 items-center">
               {/* Icon with rotation animation */}
               {icon && (
                  <Animated.View
                     className="mb-3 w-12 h-12 rounded-full items-center justify-center border-2"
                     style={{
                        backgroundColor: `${cardColor}20`,
                        borderColor: cardColor,
                        transform: [{
                           rotate: rotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                           }),
                        }],
                     }}
                  >
                     <Ionicons name={icon} size={20} color={cardColor} />
                  </Animated.View>
               )}

               {/* Title */}
               <Text
                  variant="captionSmall"
                  className="text-center font-semibold uppercase tracking-wide mb-2"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={2}
               >
                  {title}
               </Text>

               {/* Value with animated number */}
               {animateNumber && typeof value === 'number' ? (
                  <AnimatedNumber
                     value={value}
                     duration={1500}
                     variant="h3"
                     color={cardColor}
                     style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: 8,
                     }}
                  />
               ) : (
                  <Text
                     variant="h3"
                     className="text-center font-bold mb-2"
                     style={{ color: cardColor }}
                     numberOfLines={1}
                  >
                     {value}
                  </Text>
               )}

               {/* Subtitle */}
               {subtitle && (
                  <Text
                     variant="captionSmall"
                     className="text-center opacity-75"
                     style={{ color: theme.textMuted }}
                     numberOfLines={1}
                  >
                     {subtitle}
                  </Text>
               )}

               {/* Trend indicator */}
               {trend && trendValue && (
                  <View className="flex-row items-center mt-2">
                     <Ionicons
                        name={getTrendIcon() as any}
                        size={12}
                        color={getTrendColor()}
                     />
                     <Text
                        variant="captionSmall"
                        className="ml-1 font-semibold"
                        style={{ color: getTrendColor() }}
                     >
                        {trendValue}
                     </Text>
                  </View>
               )}

               {/* Progress bar */}
               {showProgress && progressValue !== undefined && (
                  <View className="w-full mt-3">
                     <BrutalistProgressBar
                        progress={(progressValue / (maxValue || 100)) * 100}
                        variant="minimal"
                        size="small"
                        color={cardColor}
                        animated={true}
                     />
                  </View>
               )}
            </View>
         </BrutalistCard>
      </Animated.View>
   );
}

// Comparison chart component for stats
interface ComparisonChartProps {
   data: {
      label: string;
      value: number;
      color?: string;
   }[];
   title: string;
   animated?: boolean;
   delay?: number;
}

export function BrutalistComparisonChart({
   data,
   title,
   animated = true,
   delay = 0,
}: ComparisonChartProps) {
   const theme = getTheme('light');
   const containerAnim = useRef(new Animated.Value(0)).current;
   const maxValue = Math.max(...data.map(item => item.value));

   useEffect(() => {
      if (animated) {
         Animated.timing(containerAnim, {
            toValue: 1,
            duration: 800,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
         }).start();
      }
   }, [animated, delay, containerAnim]);

   return (
      <Animated.View
         className="mb-6"
         style={{
            opacity: containerAnim,
            transform: [{
               translateY: containerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
               }),
            }],
         }}
      >
         <BrutalistCard
            variant="outlined"
            size="large"
            shadowIntensity="light"
         >
            <Text
               variant="h4"
               className="text-center font-bold uppercase tracking-wide mb-4"
               style={{ color: theme.text }}
            >
               {title}
            </Text>

            <View className="gap-3">
               {data.map((item, index) => (
                  <ComparisonBar
                     key={item.label}
                     label={item.label}
                     value={item.value}
                     maxValue={maxValue}
                     color={item.color || theme.primary}
                     delay={delay + (index * 150)}
                     animated={animated}
                  />
               ))}
            </View>
         </BrutalistCard>
      </Animated.View>
   );
}

interface ComparisonBarProps {
   label: string;
   value: number;
   maxValue: number;
   color: string;
   delay?: number;
   animated?: boolean;
}

function ComparisonBar({
   label,
   value,
   maxValue,
   color,
   delay = 0,
   animated = true,
}: ComparisonBarProps) {
   const theme = getTheme('light');
   const barAnim = useRef(new Animated.Value(0)).current;
   const valueAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      if (animated) {
         Animated.parallel([
            Animated.timing(barAnim, {
               toValue: (value / maxValue) * 100,
               duration: 1000,
               delay,
               easing: Easing.out(Easing.cubic),
               useNativeDriver: false,
            }),
            Animated.timing(valueAnim, {
               toValue: value,
               duration: 1200,
               delay,
               easing: Easing.out(Easing.cubic),
               useNativeDriver: false,
            }),
         ]).start();
      }
   }, [animated, delay, barAnim, valueAnim, value, maxValue]);

   return (
      <View className="mb-3">
         <View className="flex-row justify-between items-center mb-1">
            <Text
               variant="caption"
               className="font-medium"
               style={{ color: theme.textSecondary }}
            >
               {label}
            </Text>
            <Animated.Text
               className="font-bold text-sm"
               style={{ color }}
            >
               {animated
                  ? valueAnim.interpolate({
                     inputRange: [0, value],
                     outputRange: [0, value],
                     extrapolate: 'clamp',
                  })
                  : value}
            </Animated.Text>
         </View>

         <View
            className="h-3 rounded-sm border-2 overflow-hidden"
            style={{
               backgroundColor: theme.surface,
               borderColor: theme.border,
            }}
         >
            <Animated.View
               className="h-full rounded-sm"
               style={{
                  backgroundColor: color,
                  width: barAnim.interpolate({
                     inputRange: [0, 100],
                     outputRange: ['0%', '100%'],
                     extrapolate: 'clamp',
                  }),
               }}
            />
         </View>
      </View>
   );
}