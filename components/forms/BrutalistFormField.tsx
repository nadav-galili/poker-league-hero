/**
 * Enhanced Neo-Brutalist Form Field Component
 * Features thick borders, validation states, haptic feedback, and animations
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { sanitizeString } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
   Animated,
   Easing,
   I18nManager,
   TextInput,
   TextInputProps,
   TouchableOpacity,
   View,
} from 'react-native';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'error';

interface BrutalistFormFieldProps extends Omit<TextInputProps, 'style'> {
   label: string;
   icon?: keyof typeof Ionicons.glyphMap;
   validationState?: ValidationState;
   errorMessage?: string;
   successMessage?: string;
   required?: boolean;
   helpText?: string;
   showCharacterCount?: boolean;
   hapticFeedback?: boolean;
   variant?: 'default' | 'large' | 'compact';
   rightComponent?: React.ReactNode;
}

export function BrutalistFormField({
   label,
   icon,
   validationState = 'idle',
   errorMessage,
   successMessage,
   required = false,
   helpText,
   showCharacterCount = false,
   hapticFeedback = true,
   variant = 'default',
   rightComponent,
   value = '',
   maxLength,
   onChangeText,
   onFocus,
   onBlur,
   ...textInputProps
}: BrutalistFormFieldProps) {
   const theme = getTheme('light');
   const [isFocused, setIsFocused] = useState(false);

   // Animation values
   const borderColorAnim = useRef(new Animated.Value(0)).current;
   const shadowAnim = useRef(new Animated.Value(0)).current;
   const shakeAnim = useRef(new Animated.Value(0)).current;
   const successRotateAnim = useRef(new Animated.Value(0)).current;
   const glowAnim = useRef(new Animated.Value(0)).current;

   // Animate border color based on validation state and focus
   useEffect(() => {
      let targetValue = 0; // idle state

      if (isFocused) {
         targetValue = 1; // focused state
      } else if (validationState === 'error') {
         targetValue = 2; // error state
      } else if (validationState === 'valid') {
         targetValue = 3; // success state
      } else if (validationState === 'validating') {
         targetValue = 4; // validating state
      }

      Animated.timing(borderColorAnim, {
         toValue: targetValue,
         duration: 300,
         easing: Easing.out(Easing.cubic),
         useNativeDriver: false,
      }).start();
   }, [isFocused, validationState, borderColorAnim]);

   // Animate shadow on focus
   useEffect(() => {
      Animated.timing(shadowAnim, {
         toValue: isFocused ? 1 : 0,
         duration: 200,
         easing: Easing.out(Easing.quad),
         useNativeDriver: false,
      }).start();
   }, [isFocused, shadowAnim]);

   // Shake animation on error
   useEffect(() => {
      if (validationState === 'error' && hapticFeedback) {
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

         const shakeSequence = Animated.sequence([
            Animated.timing(shakeAnim, {
               toValue: 10,
               duration: 100,
               easing: Easing.linear,
               useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
               toValue: -10,
               duration: 100,
               easing: Easing.linear,
               useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
               toValue: 5,
               duration: 100,
               easing: Easing.linear,
               useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
               toValue: 0,
               duration: 100,
               easing: Easing.linear,
               useNativeDriver: true,
            }),
         ]);
         shakeSequence.start();
      }
   }, [validationState, hapticFeedback, shakeAnim]);

   // Success checkmark rotation animation
   useEffect(() => {
      if (validationState === 'valid') {
         if (hapticFeedback) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         }

         Animated.timing(successRotateAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.elastic(2),
            useNativeDriver: true,
         }).start();
      } else {
         successRotateAnim.setValue(0);
      }
   }, [validationState, hapticFeedback, successRotateAnim]);

   // Glow effect for focused state with proper cleanup
   useEffect(() => {
      let glowLoop: Animated.CompositeAnimation | null = null;

      if (isFocused) {
         glowLoop = Animated.loop(
            Animated.sequence([
               Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 1000,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: false,
               }),
               Animated.timing(glowAnim, {
                  toValue: 0,
                  duration: 1000,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: false,
               }),
            ])
         );
         glowLoop.start();
      } else {
         glowAnim.setValue(0);
      }

      // Cleanup function to prevent memory leaks
      return () => {
         if (glowLoop) {
            glowLoop.stop();
         }
      };
   }, [isFocused, glowAnim]);

   const handleFocus = useCallback((e: any) => {
      setIsFocused(true);
      if (hapticFeedback) {
         Haptics.selectionAsync();
      }
      onFocus?.(e);
   }, [onFocus, hapticFeedback]);

   const handleBlur = useCallback((e: any) => {
      setIsFocused(false);
      onBlur?.(e);
   }, [onBlur]);

   const handleChangeText = useCallback((text: string) => {
      // Sanitize input to prevent XSS attacks
      const sanitizedText = sanitizeString(text);
      onChangeText?.(sanitizedText);
   }, [onChangeText]);

   const getBorderColor = () => {
      return borderColorAnim.interpolate({
         inputRange: [0, 1, 2, 3, 4],
         outputRange: [
            theme.border,          // idle
            theme.primary,         // focused
            theme.error,           // error
            theme.success,         // valid
            theme.accent,          // validating
         ],
      });
   };

   const getGlowColor = () => {
      return glowAnim.interpolate({
         inputRange: [0, 1],
         outputRange: ['rgba(0, 102, 255, 0)', 'rgba(0, 102, 255, 0.3)'],
      });
   };

   const getFieldHeight = () => {
      switch (variant) {
         case 'large': return 60;
         case 'compact': return 40;
         default: return 50;
      }
   };

   const getIconSize = () => {
      switch (variant) {
         case 'large': return 24;
         case 'compact': return 16;
         default: return 20;
      }
   };

   const getFontSize = () => {
      switch (variant) {
         case 'large': return 18;
         case 'compact': return 14;
         default: return 16;
      }
   };

   const characterCount = typeof value === 'string' ? value.length : 0;
   const isNearMaxLength = maxLength && characterCount >= maxLength * 0.8;

   return (
      <View className="mb-6">
         {/* Label with required indicator */}
         <View className="flex-row items-center mb-2">
            <Text
               variant="labelMedium"
               className="font-semibold uppercase tracking-wide"
               style={{ color: isFocused ? theme.primary : theme.textSecondary }}
            >
               {label}
            </Text>
            {required && (
               <Text
                  variant="labelMedium"
                  className="ml-1 font-bold"
                  style={{ color: theme.error }}
               >
                  *
               </Text>
            )}
         </View>

         {/* Input container with animations */}
         <Animated.View
            className="relative"
            style={{
               transform: [{ translateX: shakeAnim }],
            }}
         >
            {/* Glow effect */}
            <Animated.View
               className="absolute -inset-1 rounded-xl opacity-50"
               style={{
                  backgroundColor: getGlowColor(),
                  display: isFocused ? 'flex' : 'none',
               }}
            />

            {/* Input field */}
            <View className="flex-row items-center relative">
               {/* Left icon */}
               {icon && (
                  <View
                     className="absolute left-4 z-10"
                     style={{
                        top: (getFieldHeight() - getIconSize()) / 2,
                     }}
                  >
                     <Ionicons
                        name={icon}
                        size={getIconSize()}
                        color={
                           validationState === 'error'
                              ? theme.error
                              : validationState === 'valid'
                              ? theme.success
                              : isFocused
                              ? theme.primary
                              : theme.textMuted
                        }
                     />
                  </View>
               )}

               <Animated.View className="flex-1" style={[{
                  shadowColor: shadowAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [theme.shadow, theme.primary],
                  }),
               }]}>
                  <TextInput
                     {...textInputProps}
                     value={value}
                     onChangeText={handleChangeText}
                     onFocus={handleFocus}
                     onBlur={handleBlur}
                     maxLength={maxLength}
                     className="font-semibold"
                     style={[
                        {
                           height: getFieldHeight(),
                           borderWidth: 4,
                           borderRadius: 12,
                           paddingHorizontal: icon ? 52 : 16,
                           paddingRight: rightComponent ? 52 : 16,
                           fontSize: getFontSize(),
                           backgroundColor: theme.surfaceElevated,
                           color: theme.text,
                           textAlign: I18nManager.isRTL ? 'right' : 'left',
                           shadowOffset: { width: 4, height: 4 },
                           shadowOpacity: 1,
                           shadowRadius: 0,
                           elevation: 8,
                        },
                        {
                           borderColor: getBorderColor(),
                        },
                     ]}
                     placeholderTextColor={theme.textMuted}
                  />
               </Animated.View>

               {/* Right component or validation icon */}
               <View
                  className="absolute right-4 z-10 flex-row items-center gap-2"
                  style={{
                     top: (getFieldHeight() - getIconSize()) / 2,
                  }}
               >
                  {rightComponent}

                  {/* Validation state icon */}
                  {validationState === 'validating' && (
                     <Animated.View
                        style={{
                           transform: [{
                              rotate: borderColorAnim.interpolate({
                                 inputRange: [0, 4],
                                 outputRange: ['0deg', '360deg'],
                              })
                           }]
                        }}
                     >
                        <Ionicons
                           name="refresh"
                           size={getIconSize()}
                           color={theme.accent}
                        />
                     </Animated.View>
                  )}

                  {validationState === 'valid' && (
                     <Animated.View
                        style={{
                           transform: [{
                              rotate: successRotateAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: ['0deg', '360deg'],
                              })
                           }]
                        }}
                     >
                        <Ionicons
                           name="checkmark-circle"
                           size={getIconSize()}
                           color={theme.success}
                        />
                     </Animated.View>
                  )}

                  {validationState === 'error' && (
                     <Ionicons
                        name="close-circle"
                        size={getIconSize()}
                        color={theme.error}
                     />
                  )}
               </View>
            </View>
         </Animated.View>

         {/* Feedback messages and help text */}
         <View className="mt-2 min-h-[20px]">
            {validationState === 'error' && errorMessage && (
               <View className="flex-row items-center gap-2">
                  <View
                     className="w-1 h-4 rounded-full"
                     style={{ backgroundColor: theme.error }}
                  />
                  <Text
                     variant="captionSmall"
                     className="font-medium"
                     style={{ color: theme.error }}
                  >
                     {errorMessage}
                  </Text>
               </View>
            )}

            {validationState === 'valid' && successMessage && (
               <View className="flex-row items-center gap-2">
                  <View
                     className="w-1 h-4 rounded-full"
                     style={{ backgroundColor: theme.success }}
                  />
                  <Text
                     variant="captionSmall"
                     className="font-medium"
                     style={{ color: theme.success }}
                  >
                     {successMessage}
                  </Text>
               </View>
            )}

            {validationState === 'idle' && helpText && (
               <Text
                  variant="captionSmall"
                  className="font-normal opacity-75"
                  style={{ color: theme.textMuted }}
               >
                  {helpText}
               </Text>
            )}
         </View>

         {/* Character count */}
         {showCharacterCount && maxLength && (
            <View className="flex-row justify-end mt-1">
               <Text
                  variant="captionSmall"
                  className="font-mono"
                  style={{
                     color: isNearMaxLength ? theme.warning : theme.textMuted
                  }}
               >
                  {characterCount}/{maxLength}
               </Text>
            </View>
         )}
      </View>
   );
}

// Clear button component for text inputs
export function ClearButton({
   onPress,
   visible = true,
}: {
   onPress: () => void;
   visible?: boolean;
}) {
   const theme = getTheme('light');

   if (!visible) return null;

   return (
      <TouchableOpacity
         onPress={onPress}
         className="w-6 h-6 rounded-full items-center justify-center"
         style={{ backgroundColor: theme.textMuted }}
         activeOpacity={0.7}
      >
         <Ionicons
            name="close"
            size={14}
            color={theme.background}
         />
      </TouchableOpacity>
   );
}