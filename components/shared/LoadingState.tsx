/**
 * Loading State Component with Neo-Brutalist Design
 */

import { colors } from '@/colors';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

interface LoadingStateProps {
   message?: string;
   variant?: 'default' | 'minimal' | 'geometric';
}

export function LoadingState({
   message = 'Loading...',
   variant = 'default',
}: LoadingStateProps = {}) {
   const rotateAnim = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      // Simple rotation animation
      const rotateAnimation = Animated.loop(
         Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
         })
      );

      // Simple scale animation
      const scaleAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(scaleAnim, {
               toValue: 1.1,
               duration: 1000,
               useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
               toValue: 1,
               duration: 1000,
               useNativeDriver: true,
            }),
         ])
      );

      rotateAnimation.start();
      scaleAnimation.start();

      return () => {
         rotateAnimation.stop();
         scaleAnimation.stop();
      };
   }, [rotateAnim, scaleAnim]);

   const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
   });

   if (variant === 'minimal') {
      return (
         <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
         </View>
      );
   }

   return (
      <View style={styles.container}>
         {/* Main loader container */}
         <View style={styles.loaderContainer}>
            {/* Rotating square */}
            <Animated.View
               style={[
                  styles.rotatingSquare,
                  {
                     transform: [{ rotate: rotation }],
                  },
               ]}
            />

            {/* Scaling inner square */}
            <Animated.View
               style={[
                  styles.innerSquare,
                  {
                     transform: [{ scale: scaleAnim }],
                  },
               ]}
            />
         </View>

         {/* Loading message */}
         <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
               {message}
            </Text>
         </View>

         {/* Decorative dots */}
         <View style={styles.dotsContainer}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 32,
   },
   loaderContainer: {
      width: 96,
      height: 96,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
   },
   rotatingSquare: {
      position: 'absolute',
      width: 96,
      height: 96,
      borderWidth: 6,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
   },
   innerSquare: {
      width: 64,
      height: 64,
      borderWidth: 4,
      borderColor: colors.border,
      backgroundColor: colors.accent,
   },
   messageContainer: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderWidth: 4,
      borderColor: colors.primary,
      backgroundColor: colors.primaryTint,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
   },
   messageText: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
   },
   dotsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 32,
   },
   dot: {
      width: 12,
      height: 12,
      borderWidth: 2,
      borderColor: colors.border,
   },
});