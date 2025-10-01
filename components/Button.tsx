import { colors, getTheme } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
   title: string;
   onPress: () => void;
   variant?: ButtonVariant;
   size?: ButtonSize;
   icon?: keyof typeof Ionicons.glyphMap;
   disabled?: boolean;
   fullWidth?: boolean;
   backgroundColor?: string;
   textColor?: string;
   style?: any;
}

export default function Button({
   title,
   onPress,
   variant = 'primary',
   size = 'medium',
   icon,
   disabled = false,
   fullWidth = false,
   backgroundColor,
   textColor,
   style,
}: ButtonProps) {
   const theme = getTheme('light');

   const getVariantStyles = () => {
      if (backgroundColor) {
         return {
            backgroundColor,
            borderColor: colors.text,
         };
      }

      switch (variant) {
         case 'primary':
            return {
               backgroundColor: theme.primary,
               borderColor: colors.text,
            };
         case 'secondary':
            return {
               backgroundColor: theme.secondary,
               borderColor: theme.secondary,
               borderWidth: 5,
            };
// ...
   const getTextColor = () => {
      if (textColor) return textColor;
      if (variant === 'outline') return theme.primary;
      return '#FFFFFF';
   };
         case 'outline':
            return {
               backgroundColor: 'transparent',
               borderColor: theme.primary,
            };
         case 'warning':
            return {
               backgroundColor: colors.warning,
               borderColor: colors.text,
            };
         default:
            return {
               backgroundColor: theme.primary,
               borderColor: colors.text,
            };
      }
   };

   const getSizeStyles = () => {
      switch (size) {
         case 'small':
            return {
               paddingVertical: 12,
               paddingHorizontal: 16,
               borderRadius: 12,
               borderWidth: 2,
            };
         case 'medium':
            return {
               paddingVertical: 16,
               paddingHorizontal: 20,
               borderRadius: 14,
               borderWidth: 3,
            };
         case 'large':
            return {
               paddingVertical: 20,
               paddingHorizontal: 24,
               borderRadius: 16,
               borderWidth: 4,
            };
         default:
            return {
               paddingVertical: 16,
               paddingHorizontal: 20,
               borderRadius: 14,
               borderWidth: 3,
            };
      }
   };

   const getTextColor = () => {
      if (textColor) return textColor;
      if (variant === 'outline') return theme.primary;
      return colors.text;
   };

   const getTypographyVariant = () => {
      switch (size) {
         case 'small':
            return 'buttonSmall' as const;
         case 'medium':
            return 'button' as const;
         case 'large':
            return 'buttonLarge' as const;
         default:
            return 'button' as const;
      }
   };

   const getIconSize = () => {
      switch (size) {
         case 'small':
            return 18;
         case 'medium':
            return 20;
         case 'large':
            return 24;
         default:
            return 20;
      }
   };

   const variantStyles = getVariantStyles();
   const sizeStyles = getSizeStyles();

   return (
      <Pressable
         style={({ pressed }) => [
            {
               ...variantStyles,
               ...sizeStyles,
               alignItems: 'center',
               justifyContent: 'center',
               opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
               transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
               shadowColor: colors.text,
               shadowOffset: {
                  width: pressed ? 4 : 8,
                  height: pressed ? 4 : 8,
               },
               shadowOpacity: 1,
               shadowRadius: 0,
               elevation: pressed ? 6 : 12,
            },
            fullWidth && { width: '100%' },
            style,
         ]}
         onPress={onPress}
         disabled={disabled}
      >
         <View style={styles.content}>
            {icon && (
               <View style={[
                  styles.iconContainer,
                  {
                     width: 32,
                     height: 32,
                     borderRadius: 8,
                     borderWidth: 2,
                     borderColor: 'rgba(255, 255, 255, 0.3)',
                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
               ]}>
                  <Ionicons
                     name={icon}
                     size={getIconSize()}
                     color={getTextColor()}
                  />
               </View>
            )}
            <Text
               variant={getTypographyVariant()}
               color={getTextColor()}
               style={styles.text}
            >
               {title.toUpperCase()}
            </Text>
         </View>
      </Pressable>
   );
}

const styles = StyleSheet.create({
   content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
   },
   iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
   },
   text: {
      letterSpacing: 2,
      textAlign: 'center',
   },
});