import { getGradient, getTheme } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
   ActivityIndicator,
   Animated,
   Pressable,
   Text,
   View,
} from 'react-native';

export type ButtonVariant = 'solid' | 'gradient' | 'glass' | 'outline';
export type ButtonColor = 'primary' | 'success' | 'error' | 'warning' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';

interface AppButtonProps {
   title: string;
   onPress: () => void;
   variant?: ButtonVariant;
   color?: ButtonColor;
   size?: ButtonSize;
   icon?: keyof typeof Ionicons.glyphMap;
   disabled?: boolean;
   width?: number | string;
   loading?: boolean;
   style?: any;
}

export const AppButton: React.FC<AppButtonProps> = ({
   title,
   onPress,
   variant = 'solid',
   color = 'primary',
   size = 'medium',
   icon,
   disabled = false,
   width = '100%',
   loading = false,
   style,
}) => {
   const theme = getTheme();
   const scaleAnim = React.useRef(new Animated.Value(1)).current;

   const handlePressIn = () => {
      Animated.spring(scaleAnim, {
         toValue: 0.95,
         useNativeDriver: true,
      }).start();
   };

   const handlePressOut = () => {
      Animated.spring(scaleAnim, {
         toValue: 1,
         useNativeDriver: true,
      }).start();
   };

   const getColorStyles = () => {
      const colorMap = {
         primary: {
            solid: theme.primary,
            solidDark: theme.primaryDark,
            gradient: getGradient('primary'),
            shadow: theme.shadowPurple,
         },
         success: {
            solid: theme.success,
            solidDark: theme.successDark,
            gradient: getGradient('success'),
            shadow: `rgba(74, 222, 128, 0.3)`,
         },
         error: {
            solid: theme.error,
            solidDark: theme.errorDark,
            gradient: getGradient('error'),
            shadow: `rgba(248, 113, 113, 0.3)`,
         },
         warning: {
            solid: theme.warning,
            solidDark: theme.warningDark,
            gradient: getGradient('warning'),
            shadow: `rgba(251, 146, 60, 0.3)`,
         },
         info: {
            solid: theme.info,
            solidDark: theme.infoDark,
            gradient: getGradient('info'),
            shadow: `rgba(96, 165, 250, 0.3)`,
         },
      };
      return colorMap[color];
   };

   const getSizeStyles = () => {
      const sizeMap = {
         small: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 12,
            fontSize: 14,
            iconSize: 16,
         },
         medium: {
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 16,
            fontSize: 16,
            iconSize: 20,
         },
         large: {
            paddingVertical: 18,
            paddingHorizontal: 32,
            borderRadius: 20,
            fontSize: 18,
            iconSize: 24,
         },
      };
      return sizeMap[size];
   };

   const colorStyles = getColorStyles();
   const sizeStyles = getSizeStyles();

   const getButtonContent = () => {
      if (loading) {
         return (
            <View
               style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
               <ActivityIndicator size="small" color={theme.text} />
               <Text
                  style={{
                     color: theme.text,
                     fontSize: sizeStyles.fontSize,
                     fontWeight: '600',
                  }}
               >
                  Loading...
               </Text>
            </View>
         );
      }

      return (
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {icon && (
               <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color={disabled ? theme.textDisabled : theme.text}
               />
            )}
            <Text
               style={{
                  color: disabled ? theme.textDisabled : theme.text,
                  fontSize: sizeStyles.fontSize,
                  fontWeight: '600',
               }}
            >
               {title}
            </Text>
         </View>
      );
   };

   const baseStyle = {
      width: width as number,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderRadius: sizeStyles.borderRadius,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      opacity: disabled ? 0.5 : 1,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
   };

   if (variant === 'gradient') {
      return (
         <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
               onPress={disabled || loading ? undefined : onPress}
               onPressIn={handlePressIn}
               onPressOut={handlePressOut}
               disabled={disabled || loading}
            >
               <LinearGradient
                  colors={
                     disabled
                        ? [theme.textMuted as any, theme.textMuted as any]
                        : (colorStyles.gradient as any)
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                     baseStyle,
                     {
                        shadowColor: disabled
                           ? theme.shadow
                           : colorStyles.shadow,
                     },
                  ]}
               >
                  {getButtonContent()}
               </LinearGradient>
            </Pressable>
         </Animated.View>
      );
   }

   if (variant === 'glass') {
      return (
         <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
               onPress={disabled || loading ? undefined : onPress}
               onPressIn={handlePressIn}
               onPressOut={handlePressOut}
               disabled={disabled || loading}
               style={[
                  baseStyle,
                  {
                     backgroundColor: disabled
                        ? theme.surfaceBlur
                        : theme.surfaceElevated,
                     borderWidth: 1,
                     borderColor: disabled ? theme.borderMuted : theme.border,
                     shadowColor: disabled ? theme.shadow : colorStyles.shadow,
                  },
               ]}
            >
               {getButtonContent()}
            </Pressable>
         </Animated.View>
      );
   }

   if (variant === 'outline') {
      return (
         <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <Pressable
               onPress={disabled || loading ? undefined : onPress}
               onPressIn={handlePressIn}
               onPressOut={handlePressOut}
               disabled={disabled || loading}
               style={[
                  baseStyle,
                  {
                     backgroundColor: 'transparent',
                     borderWidth: 2,
                     borderColor: disabled
                        ? theme.textDisabled
                        : colorStyles.solid,
                     shadowColor: disabled ? theme.shadow : colorStyles.shadow,
                  },
               ]}
            >
               <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
               >
                  {loading ? (
                     <>
                        <ActivityIndicator
                           size="small"
                           color={
                              disabled ? theme.textDisabled : colorStyles.solid
                           }
                        />
                        <Text
                           style={{
                              color: disabled
                                 ? theme.textDisabled
                                 : colorStyles.solid,
                              fontSize: sizeStyles.fontSize,
                              fontWeight: '600',
                           }}
                        >
                           Loading...
                        </Text>
                     </>
                  ) : (
                     <>
                        {icon && (
                           <Ionicons
                              name={icon}
                              size={sizeStyles.iconSize}
                              color={
                                 disabled
                                    ? theme.textDisabled
                                    : colorStyles.solid
                              }
                           />
                        )}
                        <Text
                           style={{
                              color: disabled
                                 ? theme.textDisabled
                                 : colorStyles.solid,
                              fontSize: sizeStyles.fontSize,
                              fontWeight: '600',
                           }}
                        >
                           {title}
                        </Text>
                     </>
                  )}
               </View>
            </Pressable>
         </Animated.View>
      );
   }

   // Default solid variant
   return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
         <Pressable
            onPress={disabled || loading ? undefined : onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[
               baseStyle,
               {
                  backgroundColor: disabled
                     ? theme.textMuted
                     : colorStyles.solid,
                  shadowColor: disabled ? theme.shadow : colorStyles.shadow,
               },
            ]}
         >
            {getButtonContent()}
         </Pressable>
      </Animated.View>
   );
};

// Legacy support - export as default for backward compatibility
export default AppButton;
