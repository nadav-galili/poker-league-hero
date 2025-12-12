import { colors } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
   Animated,
   Pressable,
   Text,
   View,
   ViewStyle,
} from 'react-native';
import CyberpunkLoader from './CyberpunkLoader';

export type CyberpunkButtonVariant = 'join' | 'create' | 'primary' | 'secondary';
export type CyberpunkButtonSize = 'small' | 'medium' | 'large';

interface CyberpunkButtonProps {
   title: string;
   onPress: () => void;
   variant?: CyberpunkButtonVariant;
   size?: CyberpunkButtonSize;
   icon?: keyof typeof Ionicons.glyphMap;
   disabled?: boolean;
   loading?: boolean;
   width?: number | string;
   style?: ViewStyle;
}

export const CyberpunkButton: React.FC<CyberpunkButtonProps> = ({
   title,
   onPress,
   variant = 'primary',
   size = 'medium',
   icon,
   disabled = false,
   loading = false,
   width = '100%',
   style,
}) => {
   const scaleAnim = React.useRef(new Animated.Value(1)).current;
   const glowAnim = React.useRef(new Animated.Value(0)).current;
   const scanlineAnim = React.useRef(new Animated.Value(0)).current;
   const hologramAnim = React.useRef(new Animated.Value(0)).current;
   const glitchAnim = React.useRef(new Animated.Value(0)).current;

   React.useEffect(() => {
      // Continuous glow animation
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 2000,
               useNativeDriver: true,
            }),
         ])
      );

      // Occasional hologram flicker
      const hologramAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(hologramAnim, {
               toValue: 1,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.timing(hologramAnim, {
               toValue: 0,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.delay(3000),
         ])
      );

      // Subtle glitch effect
      const glitchAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glitchAnim, {
               toValue: 1,
               duration: 50,
               useNativeDriver: true,
            }),
            Animated.timing(glitchAnim, {
               toValue: 0,
               duration: 50,
               useNativeDriver: true,
            }),
            Animated.delay(8000),
         ])
      );

      glowAnimation.start();
      hologramAnimation.start();
      glitchAnimation.start();

      return () => {
         glowAnimation.stop();
         hologramAnimation.stop();
         glitchAnimation.stop();
      };
   }, []);

   const handlePressIn = () => {
      Animated.parallel([
         Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
         }),
         Animated.timing(scanlineAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
         }),
      ]).start();
   };

   const handlePressOut = () => {
      Animated.parallel([
         Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
         }),
         Animated.timing(scanlineAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }),
      ]).start();
   };

   const getVariantStyles = () => {
      switch (variant) {
         case 'join':
            return {
               gradient: [colors.cyberDarkBlue, colors.neonBlue, colors.neonCyan],
               borderColor: colors.neonCyan,
               glowColor: colors.shadowNeonCyan,
               textColor: colors.textPrimary,
               shadowColor: colors.neonCyan,
            };
         case 'create':
            return {
               gradient: [colors.cyberDarkPurple, colors.neonGreen, colors.matrixGreen],
               borderColor: colors.neonGreen,
               glowColor: colors.shadowNeonGreen,
               textColor: colors.cyberBackground,
               shadowColor: colors.neonGreen,
            };
         case 'secondary':
            return {
               gradient: [colors.cyberGray, colors.neonPink, colors.neonPurple],
               borderColor: colors.neonPink,
               glowColor: colors.shadowNeonPink,
               textColor: colors.textPrimary,
               shadowColor: colors.neonPink,
            };
         default: // primary
            return {
               gradient: [colors.cyberDarkPurple, colors.primaryPurple, colors.neonPurple],
               borderColor: colors.neonPurple,
               glowColor: colors.shadowPurple,
               textColor: colors.textPrimary,
               shadowColor: colors.neonPurple,
            };
      }
   };

   const getSizeStyles = () => {
      switch (size) {
         case 'small':
            return {
               paddingVertical: 8,
               paddingHorizontal: 16,
               fontSize: 13,
               iconSize: 16,
               borderRadius: 12,
               cornerSize: 3,
            };
         case 'large':
            return {
               paddingVertical: 18,
               paddingHorizontal: 32,
               fontSize: 18,
               iconSize: 24,
               borderRadius: 20,
               cornerSize: 6,
            };
         default: // medium
            return {
               paddingVertical: 14,
               paddingHorizontal: 24,
               fontSize: 15,
               iconSize: 20,
               borderRadius: 16,
               cornerSize: 4,
            };
      }
   };

   const variantStyles = getVariantStyles();
   const sizeStyles = getSizeStyles();

   const renderContent = () => {
      if (loading) {
         return (
            <View className="flex-row items-center justify-center gap-2">
               <CyberpunkLoader
                  size="small"
                  variant="cyan"
               />
               <Text
                  className="font-mono font-bold tracking-wider"
                  style={{
                     color: variantStyles.textColor,
                     fontSize: sizeStyles.fontSize,
                  }}
               >
                  LOADING...
               </Text>
            </View>
         );
      }

      return (
         <View className="flex-row items-center justify-center gap-2">
            {icon && (
               <Ionicons
                  name={icon}
                  size={sizeStyles.iconSize}
                  color={disabled ? colors.textDisabled : variantStyles.textColor}
               />
            )}
            <Text
               className="font-mono font-bold tracking-widest uppercase"
               style={{
                  color: disabled ? colors.textDisabled : variantStyles.textColor,
                  fontSize: sizeStyles.fontSize,
                  textShadowColor: variantStyles.shadowColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
               }}
            >
               {title}
            </Text>
         </View>
      );
   };

   return (
      <Animated.View
         style={[
            {
               transform: [{ scale: scaleAnim }],
               width,
            },
            style,
         ]}
      >
         <Pressable
            onPress={disabled || loading ? undefined : onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={{ position: 'relative' }}
         >
            {/* Outer glow effect */}
            <Animated.View
               className="absolute inset-0"
               style={{
                  opacity: disabled ? 0.3 : glowAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.5, 1],
                  }),
                  transform: [{
                     scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                     }),
                  }],
                  borderRadius: sizeStyles.borderRadius,
                  shadowColor: variantStyles.glowColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 20,
                  elevation: 20,
               }}
            />

            {/* Main button gradient */}
            <LinearGradient
               colors={disabled ? [colors.cyberGray, colors.cyberGray, colors.cyberGray] : variantStyles.gradient}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={{
                  paddingVertical: sizeStyles.paddingVertical,
                  paddingHorizontal: sizeStyles.paddingHorizontal,
                  borderRadius: sizeStyles.borderRadius,
                  borderWidth: 2,
                  borderColor: disabled ? colors.borderMuted : variantStyles.borderColor,
                  position: 'relative',
               }}
            >
               {/* Corner brackets */}
               <View className="absolute" style={{ top: -2, left: -2 }}>
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: variantStyles.borderColor,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: variantStyles.borderColor,
                        marginTop: -sizeStyles.cornerSize,
                     }}
                  />
               </View>

               <View className="absolute" style={{ top: -2, right: -2 }}>
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: variantStyles.borderColor,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: variantStyles.borderColor,
                        alignSelf: 'flex-end',
                        marginTop: -sizeStyles.cornerSize,
                     }}
                  />
               </View>

               <View className="absolute" style={{ bottom: -2, left: -2 }}>
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: variantStyles.borderColor,
                        marginBottom: -sizeStyles.cornerSize,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: variantStyles.borderColor,
                     }}
                  />
               </View>

               <View className="absolute" style={{ bottom: -2, right: -2 }}>
                  <View
                     style={{
                        width: sizeStyles.cornerSize,
                        height: sizeStyles.cornerSize * 3,
                        backgroundColor: variantStyles.borderColor,
                        alignSelf: 'flex-end',
                        marginBottom: -sizeStyles.cornerSize,
                     }}
                  />
                  <View
                     style={{
                        width: sizeStyles.cornerSize * 3,
                        height: sizeStyles.cornerSize,
                        backgroundColor: variantStyles.borderColor,
                     }}
                  />
               </View>

               {/* Button content */}
               {renderContent()}

               {/* Scan line effect on press */}
               <Animated.View
                  className="absolute left-0 right-0 h-0.5"
                  style={{
                     backgroundColor: variantStyles.borderColor,
                     opacity: scanlineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.8],
                     }),
                     transform: [{
                        translateY: scanlineAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [-20, sizeStyles.paddingVertical * 2 + 20],
                        }),
                     }],
                     shadowColor: variantStyles.shadowColor,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 1,
                     shadowRadius: 8,
                  }}
               />

               {/* Hologram flicker overlay */}
               <Animated.View
                  className="absolute inset-0 bg-white"
                  style={{
                     opacity: hologramAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.1],
                     }),
                     borderRadius: sizeStyles.borderRadius,
                  }}
               />

               {/* Glitch effect */}
               <Animated.View
                  className="absolute inset-0"
                  style={{
                     borderRadius: sizeStyles.borderRadius,
                     borderWidth: 1,
                     borderColor: colors.neonPink,
                     opacity: glitchAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.3],
                     }),
                     transform: [{
                        translateX: glitchAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0, 2],
                        }),
                     }],
                  }}
               />
            </LinearGradient>

            {/* Data stream indicators */}
            <View className="absolute -right-1 top-1/2 w-2 h-px bg-neonCyan opacity-60" />
            <View className="absolute -left-1 top-1/2 w-2 h-px bg-neonPink opacity-60" />
         </Pressable>
      </Animated.View>
   );
};

export default CyberpunkButton;