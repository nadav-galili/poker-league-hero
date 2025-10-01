/**
 * Base Neo-Brutalist Card Component
 * Provides consistent styling and interaction patterns for all cards
 */

import { colors, getTheme } from '@/colors';
import React, { useRef } from 'react';
import {
   Animated,
   PressableProps,
   ViewStyle,
   Pressable,
   ViewProps,
} from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'minimal';
export type CardSize = 'small' | 'medium' | 'large';

interface BrutalistCardProps extends Omit<PressableProps, 'style'> {
   children: React.ReactNode;
   variant?: CardVariant;
   size?: CardSize;
   customBorderColor?: string;
   customBackgroundColor?: string;
   shadowIntensity?: 'none' | 'light' | 'medium' | 'heavy';
   pressAnimation?: boolean;
   glowOnPress?: boolean;
   style?: ViewStyle;
   containerStyle?: ViewStyle;
}

interface StaticCardProps extends Omit<ViewProps, 'style'> {
   children: React.ReactNode;
   variant?: CardVariant;
   size?: CardSize;
   customBorderColor?: string;
   customBackgroundColor?: string;
   shadowIntensity?: 'none' | 'light' | 'medium' | 'heavy';
   style?: ViewStyle;
}

export function BrutalistCard({
   children,
   variant = 'default',
   size = 'medium',
   customBorderColor,
   customBackgroundColor,
   shadowIntensity = 'medium',
   pressAnimation = true,
   glowOnPress = false,
   style,
   containerStyle,
   disabled = false,
   ...pressableProps
}: BrutalistCardProps) {
   const theme = getTheme('light');

   // Animation values
   const scaleAnim = useRef(new Animated.Value(1)).current;
   const shadowOffsetAnim = useRef(new Animated.Value(1)).current;
   const glowAnim = useRef(new Animated.Value(0)).current;

   const getCardStyles = (): ViewStyle => {
      const baseStyles: ViewStyle = {
         borderRadius: 12,
         borderWidth: getSizeBorderWidth(),
         borderColor: customBorderColor || getBorderColor(),
         backgroundColor: customBackgroundColor || getBackgroundColor(),
      };

      // Add shadow based on intensity
      if (shadowIntensity !== 'none') {
         const shadowOffset = getShadowOffset();
         baseStyles.shadowColor = theme.shadow;
         baseStyles.shadowOffset = {
            width: shadowOffset,
            height: shadowOffset
         };
         baseStyles.shadowOpacity = 1;
         baseStyles.shadowRadius = 0;
         baseStyles.elevation = shadowOffset * 2;
      }

      // Add padding based on size
      baseStyles.padding = getSizePadding();

      return baseStyles;
   };

   const getSizeBorderWidth = (): number => {
      switch (size) {
         case 'small': return 3;
         case 'large': return 8;
         default: return 6;
      }
   };

   const getSizePadding = (): number => {
      switch (size) {
         case 'small': return 12;
         case 'large': return 20;
         default: return 16;
      }
   };

   const getShadowOffset = (): number => {
      const baseOffset = shadowIntensity === 'light' ? 4 :
                         shadowIntensity === 'heavy' ? 12 : 8;

      switch (size) {
         case 'small': return Math.max(2, baseOffset - 2);
         case 'large': return baseOffset + 4;
         default: return baseOffset;
      }
   };

   const getBorderColor = (): string => {
      switch (variant) {
         case 'elevated': return theme.primary;
         case 'outlined': return theme.border;
         case 'minimal': return 'transparent';
         default: return theme.border;
      }
   };

   const getBackgroundColor = (): string => {
      switch (variant) {
         case 'elevated': return theme.surfaceElevated;
         case 'outlined': return theme.background;
         case 'minimal': return 'transparent';
         default: return theme.surface;
      }
   };

   const handlePressIn = () => {
      if (pressAnimation && !disabled) {
         const shadowOffset = getShadowOffset();

         Animated.parallel([
            Animated.timing(scaleAnim, {
               toValue: 0.98,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.timing(shadowOffsetAnim, {
               toValue: 0.5,
               duration: 150,
               useNativeDriver: false,
            }),
         ]).start();

         if (glowOnPress) {
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 150,
               useNativeDriver: false,
            }).start();
         }
      }
      pressableProps.onPressIn?.();
   };

   const handlePressOut = () => {
      if (pressAnimation && !disabled) {
         Animated.parallel([
            Animated.timing(scaleAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: true,
            }),
            Animated.timing(shadowOffsetAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: false,
            }),
         ]).start();

         if (glowOnPress) {
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 300,
               useNativeDriver: false,
            }).start();
         }
      }
      pressableProps.onPressOut?.();
   };

   const shadowOffset = getShadowOffset();
   const animatedShadowOffset = shadowOffsetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [shadowOffset * 0.5, shadowOffset],
   });

   const glowColor = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(0, 102, 255, 0)', 'rgba(0, 102, 255, 0.3)'],
   });

   return (
      <Animated.View style={[containerStyle, { transform: [{ scale: scaleAnim }] }]}>
         {glowOnPress && (
            <Animated.View
               style={{
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: 16,
                  backgroundColor: glowColor,
                  opacity: glowAnim,
               }}
            />
         )}

         <Animated.View style={[
            getCardStyles(),
            shadowIntensity !== 'none' && {
               shadowOffset: {
                  width: animatedShadowOffset,
                  height: animatedShadowOffset,
               },
            },
            style,
         ]}>
            <Pressable
               {...pressableProps}
               onPressIn={handlePressIn}
               onPressOut={handlePressOut}
               disabled={disabled}
               style={[
                  { flex: 1 },
                  disabled && { opacity: 0.6 },
               ]}
            >
               {children}
            </Pressable>
         </Animated.View>
      </Animated.View>
   );
}

// Static version for non-interactive cards
export function BrutalistCardStatic({
   children,
   variant = 'default',
   size = 'medium',
   customBorderColor,
   customBackgroundColor,
   shadowIntensity = 'medium',
   style,
   ...viewProps
}: StaticCardProps) {
   const theme = getTheme('light');

   const getSizeBorderWidth = (): number => {
      switch (size) {
         case 'small': return 3;
         case 'large': return 8;
         default: return 6;
      }
   };

   const getSizePadding = (): number => {
      switch (size) {
         case 'small': return 12;
         case 'large': return 20;
         default: return 16;
      }
   };

   const getShadowOffset = (): number => {
      const baseOffset = shadowIntensity === 'light' ? 4 :
                         shadowIntensity === 'heavy' ? 12 : 8;

      switch (size) {
         case 'small': return Math.max(2, baseOffset - 2);
         case 'large': return baseOffset + 4;
         default: return baseOffset;
      }
   };

   const getBorderColor = (): string => {
      switch (variant) {
         case 'elevated': return theme.primary;
         case 'outlined': return theme.border;
         case 'minimal': return 'transparent';
         default: return theme.border;
      }
   };

   const getBackgroundColor = (): string => {
      switch (variant) {
         case 'elevated': return theme.surfaceElevated;
         case 'outlined': return theme.background;
         case 'minimal': return 'transparent';
         default: return theme.surface;
      }
   };

   const getCardStyles = (): ViewStyle => {
      const baseStyles: ViewStyle = {
         borderRadius: 12,
         borderWidth: getSizeBorderWidth(),
         borderColor: customBorderColor || getBorderColor(),
         backgroundColor: customBackgroundColor || getBackgroundColor(),
         padding: getSizePadding(),
      };

      // Add shadow based on intensity
      if (shadowIntensity !== 'none') {
         const shadowOffset = getShadowOffset();
         baseStyles.shadowColor = theme.shadow;
         baseStyles.shadowOffset = {
            width: shadowOffset,
            height: shadowOffset
         };
         baseStyles.shadowOpacity = 1;
         baseStyles.shadowRadius = 0;
         baseStyles.elevation = shadowOffset * 2;
      }

      return baseStyles;
   };

   return (
      <Animated.View
         {...viewProps}
         style={[getCardStyles(), style]}
      >
         {children}
      </Animated.View>
   );
}

// Preset card variants for common use cases
export const PresetCards = {
   // Primary action card
   Primary: (props: BrutalistCardProps) => (
      <BrutalistCard
         {...props}
         variant="elevated"
         customBorderColor={getTheme('light').primary}
         shadowIntensity="medium"
         glowOnPress={true}
      />
   ),

   // Secondary info card
   Secondary: (props: BrutalistCardProps) => (
      <BrutalistCard
         {...props}
         variant="outlined"
         shadowIntensity="light"
      />
   ),

   // Danger/warning card
   Warning: (props: BrutalistCardProps) => (
      <BrutalistCard
         {...props}
         variant="outlined"
         customBorderColor={getTheme('light').error}
         customBackgroundColor={getTheme('light').errorTint}
      />
   ),

   // Success card
   Success: (props: BrutalistCardProps) => (
      <BrutalistCard
         {...props}
         variant="outlined"
         customBorderColor={getTheme('light').success}
         customBackgroundColor={getTheme('light').successTint}
      />
   ),
};