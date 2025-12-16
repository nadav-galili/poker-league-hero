import { colors } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
   Animated,
   Text,
   TextInput,
   TextInputProps,
   TouchableOpacity,
   View,
   ViewStyle,
} from 'react-native';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'error';
export type CyberpunkFormFieldVariant = 'small' | 'medium' | 'large';

interface CyberpunkFormFieldProps extends Omit<TextInputProps, 'style'> {
   label?: string;
   icon?: keyof typeof Ionicons.glyphMap;
   value: string;
   onChangeText: (text: string) => void;
   validationState?: ValidationState;
   errorMessage?: string;
   successMessage?: string;
   helpText?: string;
   required?: boolean;
   showCharacterCount?: boolean;
   maxLength?: number;
   variant?: CyberpunkFormFieldVariant;
   rightComponent?: React.ReactNode;
   style?: ViewStyle;
}

export const CyberpunkFormField: React.FC<CyberpunkFormFieldProps> = ({
   label,
   icon,
   value,
   onChangeText,
   validationState = 'idle',
   errorMessage,
   successMessage,
   helpText,
   required = false,
   showCharacterCount = false,
   maxLength,
   variant = 'medium',
   rightComponent,
   style,
   ...textInputProps
}) => {
   const glowAnim = useRef(new Animated.Value(0)).current;
   const scanlineAnim = useRef(new Animated.Value(0)).current;
   const matrixAnim = useRef(new Animated.Value(0)).current;
   const hologramAnim = useRef(new Animated.Value(0)).current;
   const focusAnim = useRef(new Animated.Value(0)).current;
   const [isFocused, setIsFocused] = React.useState(false);

   useEffect(() => {
      // Continuous glow animation
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 3000,
               useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 3000,
               useNativeDriver: false,
            }),
         ])
      );

      // Matrix rain effect
      const matrixAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(matrixAnim, {
               toValue: 1,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.timing(matrixAnim, {
               toValue: 0,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.delay(5000),
         ])
      );

      // Holographic flicker
      const hologramAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(hologramAnim, {
               toValue: 1,
               duration: 80,
               useNativeDriver: true,
            }),
            Animated.timing(hologramAnim, {
               toValue: 0,
               duration: 80,
               useNativeDriver: true,
            }),
            Animated.delay(4000),
         ])
      );

      glowAnimation.start();
      matrixAnimation.start();
      hologramAnimation.start();

      return () => {
         glowAnimation.stop();
         matrixAnimation.stop();
         hologramAnimation.stop();
      };
   }, []);

   useEffect(() => {
      if (validationState === 'validating') {
         const scanAnimation = Animated.loop(
            Animated.timing(scanlineAnim, {
               toValue: 1,
               duration: 1000,
               useNativeDriver: true,
            })
         );
         scanAnimation.start();
         return () => scanAnimation.stop();
      } else {
         scanlineAnim.setValue(0);
      }
   }, [validationState]);

   const handleFocus = () => {
      setIsFocused(true);
      Animated.timing(focusAnim, {
         toValue: 1,
         duration: 300,
         useNativeDriver: false,
      }).start();
   };

   const handleBlur = () => {
      setIsFocused(false);
      Animated.timing(focusAnim, {
         toValue: 0,
         duration: 300,
         useNativeDriver: false,
      }).start();
   };

   const getValidationStyles = () => {
      switch (validationState) {
         case 'validating':
            return {
               borderColor: colors.neonBlue,
               glowColor: colors.shadowNeonCyan,
               textColor: colors.textNeonCyan,
               backgroundColor: colors.holoBlue,
            };
         case 'valid':
            return {
               borderColor: colors.neonGreen,
               glowColor: colors.shadowNeonGreen,
               textColor: colors.textNeonGreen,
               backgroundColor: colors.holoGreen,
            };
         case 'error':
            return {
               borderColor: colors.error,
               glowColor: colors.shadowPink,
               textColor: colors.error,
               backgroundColor: colors.holoPink,
            };
         default:
            return {
               borderColor: colors.neonCyan,
               glowColor: colors.shadowNeonCyan,
               textColor: colors.textNeonCyan,
               backgroundColor: colors.holoBlue,
            };
      }
   };

   const getSizeStyles = () => {
      switch (variant) {
         case 'small':
            return {
               height: 48,
               paddingHorizontal: 16,
               fontSize: 14,
               iconSize: 18,
               borderRadius: 12,
               cornerSize: 3,
            };
         case 'large':
            return {
               height: 64,
               paddingHorizontal: 20,
               fontSize: 18,
               iconSize: 26,
               borderRadius: 20,
               cornerSize: 6,
            };
         default:
            return {
               height: 56,
               paddingHorizontal: 18,
               fontSize: 16,
               iconSize: 22,
               borderRadius: 16,
               cornerSize: 4,
            };
      }
   };

   const validationStyles = getValidationStyles();
   const sizeStyles = getSizeStyles();

   return (
      <View style={[{ marginBottom: 24 }, style]}>
         {/* Label */}
         {label && (
            <View className="flex-row items-center mb-2">
               <Text
                  className="font-mono font-bold tracking-wider uppercase"
                  style={{
                     color: colors.textNeonCyan,
                     fontSize: 14,
                     textShadowColor: colors.shadowNeonCyan,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 8,
                  }}
               >
                  {label}
               </Text>
               {required && (
                  <Text
                     className="ml-1 font-mono font-bold"
                     style={{
                        color: colors.error,
                        fontSize: 14,
                        textShadowColor: colors.shadowPink,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 6,
                     }}
                  >
                     *
                  </Text>
               )}
               {/* Corner brackets for label */}
               <View className="ml-2 flex-row">
                  <View
                     style={{
                        width: 8,
                        height: 2,
                        backgroundColor: colors.neonCyan,
                     }}
                  />
                  <View
                     style={{
                        width: 2,
                        height: 8,
                        backgroundColor: colors.neonCyan,
                        marginTop: -2,
                        marginLeft: -2,
                     }}
                  />
               </View>
            </View>
         )}

         {/* Input Container */}
         <View style={{ position: 'relative' }}>
            {/* Outer glow */}
            <Animated.View
               className="absolute inset-0"
               style={{
                  borderRadius: sizeStyles.borderRadius,
                  shadowColor: isFocused
                     ? validationStyles.glowColor
                     : colors.shadowNeonCyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: focusAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.3, 1],
                  }),
                  shadowRadius: focusAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [8, 20],
                  }),
                  elevation: 15,
               }}
            />

            {/* Matrix background grid */}
            <LinearGradient
               colors={[
                  colors.cyberBackground,
                  validationStyles.backgroundColor,
                  colors.cyberBackground,
               ]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: sizeStyles.borderRadius,
                  opacity: 0.1,
               }}
            />

            {/* Input field */}
            <View
               style={{
                  height: sizeStyles.height,
                  borderWidth: 2,
                  borderColor: isFocused
                     ? validationStyles.borderColor
                     : colors.borderNeonCyan,
                  borderRadius: sizeStyles.borderRadius,
                  backgroundColor: colors.cyberBackground,
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
               }}
            >
               {/* Icon */}
               {icon && (
                  <View className="pl-4">
                     <Ionicons
                        name={icon}
                        size={sizeStyles.iconSize}
                        color={
                           validationState === 'error'
                              ? colors.error
                              : colors.neonCyan
                        }
                        style={{
                           textShadowColor:
                              validationState === 'error'
                                 ? colors.shadowPink
                                 : colors.shadowNeonCyan,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 8,
                        }}
                     />
                  </View>
               )}

               {/* TextInput */}
               <TextInput
                  value={value}
                  onChangeText={onChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  maxLength={maxLength}
                  style={{
                     flex: 1,
                     paddingHorizontal: sizeStyles.paddingHorizontal,
                     fontSize: sizeStyles.fontSize,
                     color: colors.neonCyan,
                     fontFamily: 'monospace',
                     fontWeight: '600',
                     letterSpacing: 1,
                     textShadowColor: colors.shadowNeonCyan,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 8,
                  }}
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.neonCyan}
                  {...textInputProps}
               />

               {/* Right component */}
               {rightComponent && (
                  <View className="pr-4">{rightComponent}</View>
               )}

               {/* Corner brackets */}
               <View className="absolute top-0 left-0">
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: validationStyles.borderColor,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: validationStyles.borderColor,
                        marginTop: -sizeStyles.cornerSize,
                     }}
                  />
               </View>

               <View className="absolute top-0 right-0">
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: validationStyles.borderColor,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: validationStyles.borderColor,
                        alignSelf: 'flex-end',
                        marginTop: -sizeStyles.cornerSize,
                     }}
                  />
               </View>

               <View className="absolute bottom-0 left-0">
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: validationStyles.borderColor,
                        marginBottom: -sizeStyles.cornerSize,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: validationStyles.borderColor,
                     }}
                  />
               </View>

               <View className="absolute bottom-0 right-0">
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: validationStyles.borderColor,
                        alignSelf: 'flex-end',
                        marginBottom: -sizeStyles.cornerSize,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: validationStyles.borderColor,
                     }}
                  />
               </View>

               {/* Scan line animation for validation */}
               {validationState === 'validating' && (
                  <Animated.View
                     pointerEvents="none"
                     className="absolute left-0 right-0 h-0.5"
                     style={{
                        backgroundColor: colors.neonBlue,
                        transform: [
                           {
                              translateY: scanlineAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0, sizeStyles.height],
                              }),
                           },
                        ],
                        shadowColor: colors.shadowNeonCyan,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                     }}
                  />
               )}

               {/* Matrix effect overlay */}
               <Animated.View
                  pointerEvents="none"
                  className="absolute inset-0 bg-white"
                  style={{
                     opacity: matrixAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.05],
                     }),
                     borderRadius: sizeStyles.borderRadius - 2,
                  }}
               />

               {/* Holographic flicker */}
               <Animated.View
                  pointerEvents="none"
                  className="absolute inset-0"
                  style={{
                     borderRadius: sizeStyles.borderRadius - 2,
                     borderWidth: 1,
                     borderColor: colors.neonPink,
                     opacity: hologramAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.2],
                     }),
                  }}
               />
            </View>

            {/* Data stream indicators */}
            <View
               className="absolute -right-1 top-1/2 w-3 h-px bg-neonCyan opacity-50"
               pointerEvents="none"
            />
            <View
               className="absolute -left-1 top-1/2 w-3 h-px bg-neonPink opacity-50"
               pointerEvents="none"
            />
         </View>

         {/* Character count */}
         {showCharacterCount && maxLength && (
            <View className="flex-row justify-end mt-1">
               <Text
                  className="font-mono text-xs"
                  style={{
                     color:
                        value.length === maxLength
                           ? colors.error
                           : colors.textMuted,
                  }}
               >
                  {value.length}/{maxLength}
               </Text>
            </View>
         )}

         {/* Messages */}
         {(errorMessage || successMessage || helpText) && (
            <View className="mt-2">
               {errorMessage && (
                  <Text
                     className="font-mono text-sm tracking-wide"
                     style={{
                        color: colors.error,
                        textShadowColor: colors.shadowPink,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 6,
                     }}
                  >
                     ⚠ {errorMessage}
                  </Text>
               )}
               {successMessage && !errorMessage && (
                  <Text
                     className="font-mono text-sm tracking-wide"
                     style={{
                        color: colors.neonGreen,
                        textShadowColor: colors.shadowNeonGreen,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 6,
                     }}
                  >
                     ✓ {successMessage}
                  </Text>
               )}
               {helpText && !errorMessage && !successMessage && (
                  <Text
                     className="font-mono text-xs tracking-wide opacity-70"
                     style={{
                        color: colors.textMuted,
                     }}
                  >
                     {helpText}
                  </Text>
               )}
            </View>
         )}
      </View>
   );
};

export const CyberpunkClearButton: React.FC<{
   onPress: () => void;
   visible: boolean;
}> = ({ onPress, visible }) => {
   if (!visible) return null;

   return (
      <TouchableOpacity
         onPress={onPress}
         style={{
            padding: 4,
            borderRadius: 12,
            backgroundColor: colors.cyberBackground,
            borderWidth: 1,
            borderColor: colors.error,
         }}
      >
         <Ionicons
            name="close"
            size={16}
            color={colors.error}
            style={{
               textShadowColor: colors.shadowPink,
               textShadowOffset: { width: 0, height: 0 },
               textShadowRadius: 6,
            }}
         />
      </TouchableOpacity>
   );
};

export default CyberpunkFormField;
