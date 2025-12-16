import { colors } from '@/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
   Animated,
   Text,
   TouchableOpacity,
   View,
   ViewStyle,
} from 'react-native';

interface CyberpunkImagePickerProps {
   imageUri?: string | null;
   onPickImage: () => void;
   onRemoveImage: () => void;
   label?: string;
   size?: 'small' | 'medium' | 'large';
   style?: ViewStyle;
}

export const CyberpunkImagePicker: React.FC<CyberpunkImagePickerProps> = ({
   imageUri,
   onPickImage,
   onRemoveImage,
   label = 'Image',
   size = 'medium',
   style,
}) => {
   const glowAnim = useRef(new Animated.Value(0)).current;
   const scanlineAnim = useRef(new Animated.Value(0)).current;
   const matrixAnim = useRef(new Animated.Value(0)).current;
   const hologramAnim = useRef(new Animated.Value(0)).current;
   const pulseAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      // Continuous glow animation
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2500,
               useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 2500,
               useNativeDriver: false,
            }),
         ])
      );

      // Matrix scan effect
      const matrixAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(matrixAnim, {
               toValue: 1,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.timing(matrixAnim, {
               toValue: 0,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.delay(3000),
         ])
      );

      // Holographic flicker
      const hologramAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(hologramAnim, {
               toValue: 1,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.timing(hologramAnim, {
               toValue: 0,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.delay(4500),
         ])
      );

      // Pulse animation for empty state
      const pulseAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(pulseAnim, {
               toValue: 1.05,
               duration: 1500,
               useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
               toValue: 1,
               duration: 1500,
               useNativeDriver: true,
            }),
         ])
      );

      glowAnimation.start();
      matrixAnimation.start();
      hologramAnimation.start();

      if (!imageUri) {
         pulseAnimation.start();
      }

      return () => {
         glowAnimation.stop();
         matrixAnimation.stop();
         hologramAnimation.stop();
         pulseAnimation.stop();
      };
   }, [imageUri]);

   // Scan line effect on image upload
   useEffect(() => {
      if (imageUri) {
         const scanAnimation = Animated.timing(scanlineAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
         });
         scanAnimation.start(() => {
            scanlineAnim.setValue(0);
         });
      }
   }, [imageUri]);

   const getSizeStyles = () => {
      switch (size) {
         case 'small':
            return {
               size: 80,
               borderRadius: 12,
               cornerSize: 3,
               fontSize: 10,
               iconSize: 24,
            };
         case 'large':
            return {
               size: 160,
               borderRadius: 20,
               cornerSize: 6,
               fontSize: 14,
               iconSize: 40,
            };
         default:
            return {
               size: 120,
               borderRadius: 16,
               cornerSize: 4,
               fontSize: 12,
               iconSize: 32,
            };
      }
   };

   const sizeStyles = getSizeStyles();

   return (
      <View style={[{ alignItems: 'center' }, style]}>
         {/* Label */}
         {label && (
            <View className="flex-row items-center mb-3">
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

         {/* Image Container */}
         <View style={{ position: 'relative' }}>
            {/* Outer glow */}
            <Animated.View
               className="absolute inset-0"
               style={{
                  width: sizeStyles.size,
                  height: sizeStyles.size,
                  borderRadius: sizeStyles.borderRadius,
                  shadowColor: imageUri ? colors.shadowNeonGreen : colors.shadowNeonCyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: glowAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.4, 1],
                  }),
                  shadowRadius: glowAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [10, 25],
                  }),
                  elevation: 20,
               }}
            />

            {imageUri ? (
               // Image Preview
               <Animated.View
                  style={{
                     transform: [{ scale: pulseAnim }],
                     position: 'relative',
                  }}
               >
                  <TouchableOpacity
                     onPress={onPickImage}
                     style={{
                        width: sizeStyles.size,
                        height: sizeStyles.size,
                        borderRadius: sizeStyles.borderRadius,
                        borderWidth: 3,
                        borderColor: colors.neonGreen,
                        overflow: 'hidden',
                        position: 'relative',
                     }}
                  >
                     {/* Matrix grid background */}
                     <LinearGradient
                        colors={[colors.cyberBackground, colors.holoGreen, colors.cyberBackground]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                           position: 'absolute',
                           inset: 0,
                           opacity: 0.2,
                        }}
                     />

                     {/* Image */}
                     <Image
                        key={imageUri}
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        cachePolicy="none"
                     />

                     {/* Scan line effect */}
                     <Animated.View
                        className="absolute left-0 right-0 h-1"
                        style={{
                           backgroundColor: colors.neonGreen,
                           opacity: scanlineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.8],
                           }),
                           transform: [{
                              translateY: scanlineAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0, sizeStyles.size],
                              }),
                           }],
                           shadowColor: colors.shadowNeonGreen,
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 1,
                           shadowRadius: 10,
                        }}
                     />

                     {/* Corner brackets */}
                     <View className="absolute top-0 left-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonGreen,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonGreen,
                              marginTop: -sizeStyles.cornerSize,
                           }}
                        />
                     </View>

                     <View className="absolute top-0 right-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonGreen,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonGreen,
                              alignSelf: 'flex-end',
                              marginTop: -sizeStyles.cornerSize,
                           }}
                        />
                     </View>

                     <View className="absolute bottom-0 left-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonGreen,
                              marginBottom: -sizeStyles.cornerSize,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonGreen,
                           }}
                        />
                     </View>

                     <View className="absolute bottom-0 right-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonGreen,
                              alignSelf: 'flex-end',
                              marginBottom: -sizeStyles.cornerSize,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonGreen,
                           }}
                        />
                     </View>

                     {/* Holographic overlay */}
                     <Animated.View
                        className="absolute inset-0 bg-white"
                        style={{
                           opacity: hologramAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.15],
                           }),
                        }}
                     />

                     {/* Matrix effect */}
                     <Animated.View
                        className="absolute inset-0"
                        style={{
                           borderWidth: 1,
                           borderColor: colors.neonPink,
                           opacity: matrixAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.3],
                           }),
                        }}
                     />
                  </TouchableOpacity>

                  {/* Remove button */}
                  <TouchableOpacity
                     onPress={onRemoveImage}
                     style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: colors.cyberBackground,
                        borderWidth: 2,
                        borderColor: colors.error,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: colors.shadowPink,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        elevation: 10,
                     }}
                  >
                     <Ionicons
                        name="close"
                        size={16}
                        color={colors.error}
                        style={{
                           textShadowColor: colors.shadowPink,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 8,
                        }}
                     />
                  </TouchableOpacity>

                  {/* Data streams */}
                  <View className="absolute -right-2 top-1/2 w-4 h-px bg-neonGreen opacity-60" />
                  <View className="absolute -left-2 top-1/2 w-4 h-px bg-neonCyan opacity-60" />
               </Animated.View>
            ) : (
               // Empty picker
               <Animated.View
                  style={{
                     transform: [{ scale: pulseAnim }],
                  }}
               >
                  <TouchableOpacity
                     onPress={onPickImage}
                     style={{
                        width: sizeStyles.size,
                        height: sizeStyles.size,
                        borderRadius: sizeStyles.borderRadius,
                        borderWidth: 3,
                        borderColor: colors.neonCyan,
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                     }}
                  >
                     {/* Matrix grid background */}
                     <LinearGradient
                        colors={[colors.cyberBackground, colors.holoBlue, colors.cyberBackground]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                           position: 'absolute',
                           inset: 0,
                           opacity: 0.1,
                        }}
                     />

                     {/* Upload icon and text */}
                     <View className="items-center gap-2">
                        <Ionicons
                           name="camera-outline"
                           size={sizeStyles.iconSize}
                           color={colors.neonCyan}
                           style={{
                              textShadowColor: colors.shadowNeonCyan,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 10,
                           }}
                        />
                        <Text
                           className="font-mono font-bold tracking-wider uppercase text-center"
                           style={{
                              color: colors.textNeonCyan,
                              fontSize: sizeStyles.fontSize,
                              textShadowColor: colors.shadowNeonCyan,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 8,
                           }}
                        >
                           SELECT{'\n'}IMAGE
                        </Text>
                     </View>

                     {/* Corner brackets */}
                     <View className="absolute top-0 left-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonCyan,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonCyan,
                              marginTop: -sizeStyles.cornerSize,
                           }}
                        />
                     </View>

                     <View className="absolute top-0 right-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonCyan,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonCyan,
                              alignSelf: 'flex-end',
                              marginTop: -sizeStyles.cornerSize,
                           }}
                        />
                     </View>

                     <View className="absolute bottom-0 left-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonCyan,
                              marginBottom: -sizeStyles.cornerSize,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonCyan,
                           }}
                        />
                     </View>

                     <View className="absolute bottom-0 right-0">
                        <View
                           style={{
                              width: sizeStyles.cornerSize,
                              height: sizeStyles.cornerSize * 4,
                              backgroundColor: colors.neonCyan,
                              alignSelf: 'flex-end',
                              marginBottom: -sizeStyles.cornerSize,
                           }}
                        />
                        <View
                           style={{
                              width: sizeStyles.cornerSize * 4,
                              height: sizeStyles.cornerSize,
                              backgroundColor: colors.neonCyan,
                           }}
                        />
                     </View>

                     {/* Matrix effect overlay */}
                     <Animated.View
                        className="absolute inset-0 bg-white"
                        style={{
                           opacity: matrixAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.08],
                           }),
                        }}
                     />

                     {/* Holographic flicker */}
                     <Animated.View
                        className="absolute inset-0"
                        style={{
                           borderWidth: 1,
                           borderColor: colors.neonPink,
                           borderRadius: sizeStyles.borderRadius - 3,
                           opacity: hologramAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.2],
                           }),
                        }}
                     />
                  </TouchableOpacity>

                  {/* Data stream indicators */}
                  <View className="absolute -right-2 top-1/2 w-4 h-px bg-neonCyan opacity-40" />
                  <View className="absolute -left-2 top-1/2 w-4 h-px bg-neonPink opacity-40" />
               </Animated.View>
            )}
         </View>
      </View>
   );
};

export default CyberpunkImagePicker;