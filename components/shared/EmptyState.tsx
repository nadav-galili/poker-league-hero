/**
 * Enhanced Neo-Brutalist Empty State Component
 */

import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface EmptyStateProps {
   onCreateLeague: () => void;
   onJoinLeague: () => void;
   title?: string;
   subtitle?: string;
   variant?: 'leagues' | 'players' | 'games' | 'stats';
}

export function EmptyState({
   onCreateLeague,
   onJoinLeague,
   title,
   subtitle,
   variant = 'leagues',
}: EmptyStateProps) {
   const { t } = useLocalization();
   const theme = getTheme('light');

   // Animation refs
   const floatAnim = useRef(new Animated.Value(0)).current;
   const rotateAnim = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      // Floating animation for main icon
      const floatAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(floatAnim, {
               toValue: 1,
               duration: 2000,
               easing: Easing.inOut(Easing.ease),
               useNativeDriver: true,
            }),
            Animated.timing(floatAnim, {
               toValue: 0,
               duration: 2000,
               easing: Easing.inOut(Easing.ease),
               useNativeDriver: true,
            }),
         ])
      );

      // Rotation for accent elements
      const rotateAnimation = Animated.loop(
         Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
         })
      );

      // Pulse for interactive elements
      const scaleAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(scaleAnim, {
               toValue: 1.05,
               duration: 1500,
               easing: Easing.inOut(Easing.ease),
               useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
               toValue: 1,
               duration: 1500,
               easing: Easing.inOut(Easing.ease),
               useNativeDriver: true,
            }),
         ])
      );

      floatAnimation.start();
      rotateAnimation.start();
      scaleAnimation.start();

      return () => {
         floatAnimation.stop();
         rotateAnimation.stop();
         scaleAnimation.stop();
      };
   }, [floatAnim, rotateAnim, scaleAnim]);

   const getIconName = () => {
      switch (variant) {
         case 'leagues':
            return 'trophy-outline';
         case 'players':
            return 'people-outline';
         case 'games':
            return 'game-controller-outline';
         case 'stats':
            return 'stats-chart-outline';
         default:
            return 'trophy-outline';
      }
   };

   const floatY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
   });

   const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
   });

   return (
      <View className="flex-1 items-center justify-center px-6 py-8">
         {/* Geometric background elements */}
         <View className="absolute inset-0 items-center justify-center opacity-5">
            <Animated.View
               className="w-80 h-80 border-8 border-primary"
               style={{
                  transform: [{ rotate: rotation }],
               }}
            />
            <Animated.View
               className="absolute w-60 h-60 border-4 border-secondary"
               style={{
                  transform: [{ rotate: rotation }, { rotateY: '180deg' }],
               }}
            />
         </View>

         {/* Main illustration */}
         <View className="relative items-center mb-8">
            {/* Main icon container with brutalist styling */}
            <Animated.View
               className="w-32 h-32 border-6 border-primary rounded-3xl items-center justify-center relative"
               style={{
                  backgroundColor: theme.primary,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 12, height: 12 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 20,
                  transform: [{ translateY: floatY }, { scale: scaleAnim }],
               }}
            >
               <Ionicons name={getIconName()} size={64} color={theme.primary} />

               {/* Corner accents */}
               <View
                  className="absolute -top-3 -right-3 w-8 h-8 border-4 border-border"
                  style={{ backgroundColor: theme.accent }}
               />
               <View
                  className="absolute -bottom-3 -left-3 w-6 h-6 border-3 border-border"
                  style={{ backgroundColor: theme.secondary }}
               />
            </Animated.View>

            {/* Decorative elements around main icon */}
            <Animated.View
               className="absolute -top-4 -left-8 w-4 h-4 border-2 border-border"
               style={{
                  backgroundColor: theme.warning,
                  transform: [{ rotate: rotation }],
               }}
            />
            <Animated.View
               className="absolute -bottom-6 -right-6 w-5 h-5 border-2 border-border"
               style={{
                  backgroundColor: theme.success,
                  transform: [{ rotate: rotation }, { rotateZ: '45deg' }],
               }}
            />
         </View>

         {/* Text content with enhanced styling */}
         <View className="items-center mb-10">
            <View
               className="px-6 py-3 border-4 border-border rounded-2xl mb-4 relative"
               style={{
                  backgroundColor: theme.surface,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 6, height: 6 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 8,
               }}
            >
               <Text
                  className="text-3xl font-black tracking-wider text-center uppercase"
                  style={{ color: theme.primary }}
               >
                  {title || t('noLeaguesYet')}
               </Text>

               {/* Underline accent */}
               <View
                  className="absolute bottom-1 left-4 right-4 h-1"
                  style={{ backgroundColor: theme.accent }}
               />
            </View>

            <Text
               variant="body"
               className="text-lg font-semibold tracking-wide text-center leading-6 px-4"
               style={{ color: theme.textSecondary }}
            >
               {subtitle || t('createFirstLeague')}
            </Text>
         </View>

         {/* Enhanced action buttons */}
         <View className="w-full gap-5">
            <Button
               title={t('createLeague')}
               onPress={onCreateLeague}
               variant="primary"
               size="large"
               icon="add-circle"
               fullWidth
            />
            <Button
               title={t('joinLeague')}
               onPress={onJoinLeague}
               variant="secondary"
               size="large"
               icon="enter"
               fullWidth
            />
         </View>

         {/* Bottom decorative line */}
         <View className="flex-row items-center mt-8 gap-3">
            {[theme.primary, theme.secondary, theme.accent].map(
               (color, index) => (
                  <View
                     key={index}
                     className="w-8 h-1 border border-border"
                     style={{
                        backgroundColor: color,
                        transform: [{ skewX: `${(index - 1) * 15}deg` }],
                     }}
                  />
               )
            )}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   emptyState: {
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
   },

   emptyTitle: {
      letterSpacing: 2,
      textAlign: 'center',
      marginBottom: 12,
   },

   emptySubtitle: {
      textAlign: 'center',
      marginBottom: 40,
   },

   emptyButtons: {
      width: '100%',
      gap: 16,
   },

   rtlText: {
      textAlign: 'right',
   },
});
