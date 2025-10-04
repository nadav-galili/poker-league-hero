/**
 * Neo-Brutalist Progress Bar Component
 * Features animated progress, skeleton screens, and visual feedback
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import React, { useEffect, useRef } from 'react';
import {
   Animated,
   Easing,
   View,
   ViewStyle,
} from 'react-native';

interface BrutalistProgressBarProps {
   progress: number; // 0-100
   variant?: 'default' | 'chunky' | 'minimal' | 'ring';
   size?: 'small' | 'medium' | 'large';
   showLabel?: boolean;
   label?: string;
   animated?: boolean;
   color?: string;
   backgroundColor?: string;
   style?: ViewStyle;
}

export function BrutalistProgressBar({
   progress,
   variant = 'default',
   size = 'medium',
   showLabel = false,
   label,
   animated = true,
   color,
   backgroundColor,
   style,
}: BrutalistProgressBarProps) {
   const theme = getTheme('light');
   const progressAnim = useRef(new Animated.Value(0)).current;
   const pulseAnim = useRef(new Animated.Value(1)).current;

   const clampedProgress = Math.max(0, Math.min(100, progress));

   useEffect(() => {
      if (animated) {
         Animated.timing(progressAnim, {
            toValue: clampedProgress,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
         }).start();

         // Pulse animation when progress changes
         if (clampedProgress > 0) {
            Animated.sequence([
               Animated.timing(pulseAnim, {
                  toValue: 1.05,
                  duration: 200,
                  useNativeDriver: true,
               }),
               Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
               }),
            ]).start();
         }
      } else {
         progressAnim.setValue(clampedProgress);
      }
   }, [clampedProgress, animated, progressAnim, pulseAnim]);

   const getBarHeight = () => {
      switch (size) {
         case 'small': return 8;
         case 'large': return 20;
         default: return 12;
      }
   };

   const getBorderWidth = () => {
      switch (size) {
         case 'small': return 2;
         case 'large': return 6;
         default: return 4;
      }
   };

   const getProgressColor = () => {
      if (color) return color;

      // Color based on progress value
      if (clampedProgress >= 80) return theme.success;
      if (clampedProgress >= 60) return theme.primary;
      if (clampedProgress >= 30) return theme.accent;
      return theme.error;
   };

   const renderDefaultProgress = () => (
      <Animated.View
         className="relative rounded-lg overflow-hidden"
         style={[
            {
               height: getBarHeight(),
               backgroundColor: backgroundColor || theme.surface,
               borderWidth: getBorderWidth(),
               borderColor: theme.border,
               shadowColor: theme.shadow,
               shadowOffset: { width: 2, height: 2 },
               shadowOpacity: 1,
               shadowRadius: 0,
               elevation: 4,
            },
            { transform: [{ scale: pulseAnim }] },
            style,
         ]}
      >
         <Animated.View
            className="absolute left-0 top-0 bottom-0 rounded-sm"
            style={{
               width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
               }),
               backgroundColor: getProgressColor(),
               borderRadius: 4,
            }}
         />

         {/* Stripe animation for active progress - removed CSS properties not supported in React Native */}
         {clampedProgress > 0 && animated && (
            <Animated.View
               className="absolute inset-0 opacity-30"
               style={{
                  // Note: CSS background gradients not supported in React Native
                  // Using solid background with opacity for visual feedback
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
               }}
            />
         )}
      </Animated.View>
   );

   const renderChunkyProgress = () => {
      const chunks = 10;
      const activeChunks = Math.ceil((clampedProgress / 100) * chunks);

      return (
         <View className="flex-row gap-1" style={style}>
            {Array.from({ length: chunks }).map((_, index) => (
               <Animated.View
                  key={index}
                  className="flex-1 rounded-sm"
                  style={{
                     height: getBarHeight(),
                     backgroundColor: index < activeChunks ? getProgressColor() : backgroundColor || theme.surface,
                     borderWidth: getBorderWidth(),
                     borderColor: theme.border,
                     opacity: animated ? progressAnim.interpolate({
                        inputRange: [index * 10, (index + 1) * 10],
                        outputRange: [0.3, 1],
                        extrapolate: 'clamp',
                     }) : (index < activeChunks ? 1 : 0.3),
                     transform: [{ scale: pulseAnim }],
                  }}
               />
            ))}
         </View>
      );
   };

   const renderMinimalProgress = () => (
      <View
         className="relative rounded-full overflow-hidden"
         style={[
            {
               height: getBarHeight(),
               backgroundColor: backgroundColor || theme.surface,
            },
            style,
         ]}
      >
         <Animated.View
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{
               width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
               }),
               backgroundColor: getProgressColor(),
            }}
         />
      </View>
   );

   const renderRingProgress = () => {
      const radius = size === 'small' ? 20 : size === 'large' ? 40 : 30;
      const strokeWidth = size === 'small' ? 4 : size === 'large' ? 8 : 6;
      const circumference = 2 * Math.PI * radius;

      return (
         <View
            className="items-center justify-center"
            style={[
               { width: (radius + strokeWidth) * 2, height: (radius + strokeWidth) * 2 },
               style,
            ]}
         >
            {/* Background ring */}
            <Animated.View
               className="absolute rounded-full"
               style={{
                  width: radius * 2,
                  height: radius * 2,
                  borderColor: backgroundColor || theme.surface,
                  borderWidth: strokeWidth,
                  transform: [{ scale: pulseAnim }],
                  // React Native compatible shadow properties
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
               }}
            />
            {/* Progress ring */}
            <Animated.View
               className="absolute rounded-full"
               style={{
                  width: radius * 2,
                  height: radius * 2,
                  borderColor: getProgressColor(),
                  borderWidth: strokeWidth,
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                  transform: [
                     { scale: pulseAnim },
                     {
                        rotate: progressAnim.interpolate({
                           inputRange: [0, 100],
                           outputRange: ['0deg', '360deg'],
                        }),
                     },
                  ],
                  // React Native compatible shadow properties for depth
                  shadowColor: getProgressColor(),
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 3,
               }}
            />

            {showLabel && (
               <Text
                  variant="captionSmall"
                  className="font-bold absolute"
                  style={{ color: getProgressColor() }}
               >
                  {Math.round(clampedProgress)}%
               </Text>
            )}
         </View>
      );
   };

   const renderProgressBar = () => {
      switch (variant) {
         case 'chunky': return renderChunkyProgress();
         case 'minimal': return renderMinimalProgress();
         case 'ring': return renderRingProgress();
         default: return renderDefaultProgress();
      }
   };

   return (
      <View>
         {renderProgressBar()}

         {showLabel && variant !== 'ring' && (
            <View className="flex-row justify-between items-center mt-2">
               <Text
                  variant="captionSmall"
                  className="font-medium"
                  style={{ color: theme.textSecondary }}
               >
                  {label || 'Progress'}
               </Text>
               <Text
                  variant="captionSmall"
                  className="font-bold"
                  style={{ color: getProgressColor() }}
               >
                  {Math.round(clampedProgress)}%
               </Text>
            </View>
         )}
      </View>
   );
}

// Skeleton loading component
export function BrutalistSkeleton({
   width = '100%',
   height = 20,
   variant = 'rounded',
   animated = true,
}: {
   width?: string | number;
   height?: number;
   variant?: 'rounded' | 'rectangular' | 'circular';
   animated?: boolean;
}) {
   const theme = getTheme('light');
   const shimmerAnim = useRef(new Animated.Value(-1)).current;

   useEffect(() => {
      let shimmer: Animated.CompositeAnimation | null = null;

      if (animated) {
         shimmer = Animated.loop(
            Animated.timing(shimmerAnim, {
               toValue: 1,
               duration: 1500,
               easing: Easing.linear,
               useNativeDriver: false, // Cannot use native driver for backgroundColor changes
            })
         );
         shimmer.start();
      }

      // Proper cleanup to prevent memory leaks
      return () => {
         if (shimmer) {
            shimmer.stop();
         }
         shimmerAnim.stopAnimation();
      };
   }, [animated, shimmerAnim]);

   const getShimmerGradient = () => {
      if (!animated) return {};

      return {
         background: shimmerAnim.interpolate({
            inputRange: [-1, 1],
            outputRange: [theme.surface, theme.border],
         }),
      };
   };

   return (
      <Animated.View
         style={{
            width,
            height,
            backgroundColor: theme.surface,
            borderRadius: variant === 'circular' ? height / 2 : variant === 'rounded' ? 8 : 0,
            borderWidth: 2,
            borderColor: theme.border,
            ...getShimmerGradient(),
         }}
      />
   );
}

// Success/Error animation feedback
export function BrutalistFeedbackAnimation({
   type,
   message,
   visible,
   onDismiss,
}: {
   type: 'success' | 'error' | 'warning' | 'info';
   message: string;
   visible: boolean;
   onDismiss?: () => void;
}) {
   const theme = getTheme('light');
   const scaleAnim = useRef(new Animated.Value(0)).current;
   const opacityAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      let timer: NodeJS.Timeout | null = null;

      if (visible) {
         Animated.parallel([
            Animated.spring(scaleAnim, {
               toValue: 1,
               useNativeDriver: true,
               tension: 100,
               friction: 6,
            }),
            Animated.timing(opacityAnim, {
               toValue: 1,
               duration: 300,
               useNativeDriver: true,
            }),
         ]).start();

         // Auto dismiss after 3 seconds
         timer = setTimeout(() => {
            Animated.parallel([
               Animated.timing(scaleAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
               }),
               Animated.timing(opacityAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
               }),
            ]).start(() => onDismiss?.());
         }, 3000);
      }

      // Comprehensive cleanup
      return () => {
         if (timer) {
            clearTimeout(timer);
         }
         scaleAnim.stopAnimation();
         opacityAnim.stopAnimation();
      };
   }, [visible, scaleAnim, opacityAnim, onDismiss]);

   const getTypeColor = () => {
      switch (type) {
         case 'success': return theme.success;
         case 'error': return theme.error;
         case 'warning': return theme.accent;
         case 'info': return theme.info;
         default: return theme.primary;
      }
   };

   const getTypeIcon = () => {
      switch (type) {
         case 'success': return 'checkmark-circle';
         case 'error': return 'close-circle';
         case 'warning': return 'warning';
         case 'info': return 'information-circle';
         default: return 'checkmark-circle';
      }
   };

   if (!visible) return null;

   return (
      <Animated.View
         className="absolute inset-0 items-center justify-center bg-black/50 z-50"
         style={{ opacity: opacityAnim }}
      >
         <Animated.View
            className="bg-white p-6 rounded-xl border-4 items-center mx-8"
            style={{
               borderColor: getTypeColor(),
               transform: [{ scale: scaleAnim }],
               shadowColor: theme.shadow,
               shadowOffset: { width: 8, height: 8 },
               shadowOpacity: 1,
               shadowRadius: 0,
               elevation: 16,
            }}
         >
            <View
               className="w-16 h-16 rounded-full items-center justify-center mb-4 border-4"
               style={{
                  backgroundColor: getTypeColor(),
                  borderColor: theme.border,
               }}
            >
               <Text className="text-2xl">
                  {type === 'success' && '✓'}
                  {type === 'error' && '✗'}
                  {type === 'warning' && '⚠️'}
                  {type === 'info' && 'ℹ️'}
               </Text>
            </View>

            <Text
               variant="body"
               className="text-center font-semibold"
               style={{ color: theme.text }}
            >
               {message}
            </Text>
         </Animated.View>
      </Animated.View>
   );
}