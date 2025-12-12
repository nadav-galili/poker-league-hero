/**
 * My Leagues Header Component
 */

import { colors } from '@/colors';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Text } from '@/components/Text';
import { CyberpunkButton } from '@/components/ui/CyberpunkButton';
import { useLocalization } from '@/context/localization';
import React from 'react';
import { View, Animated } from 'react-native';

interface MyLeaguesHeaderProps {
   onJoinLeague: () => void;
   onCreateLeague: () => void;
}

export function MyLeaguesHeader({
   onJoinLeague,
   onCreateLeague,
}: MyLeaguesHeaderProps) {
   const { t, isRTL } = useLocalization();

   // Cyberpunk text glow animation
   const textGlow = React.useRef(new Animated.Value(0)).current;

   React.useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(textGlow, {
               toValue: 1,
               duration: 1500,
               useNativeDriver: false,
            }),
            Animated.timing(textGlow, {
               toValue: 0,
               duration: 1500,
               useNativeDriver: false,
            }),
         ])
      );

      glowAnimation.start();

      return () => {
         glowAnimation.stop();
      };
   }, []);

   return (
      <View className="pt-14 pb-6 px-5 bg-transparent relative">
         {/* Cyberpunk frame corners */}
         <View className="absolute top-12 left-4 w-6 h-6">
            <View className="absolute top-0 left-0 w-full h-1 bg-neonCyan" />
            <View className="absolute top-0 left-0 w-1 h-full bg-neonCyan" />
         </View>
         <View className="absolute top-12 right-4 w-6 h-6">
            <View className="absolute top-0 right-0 w-full h-1 bg-neonPink" />
            <View className="absolute top-0 right-0 w-1 h-full bg-neonPink" />
         </View>

         {/* Top Row: Enhanced Title and Language Selector */}
         <View
            className={`flex-row items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
         >
            <View className="relative">
               {/* Title with cyberpunk styling */}
               <Animated.Text
                  className={`text-2xl font-bold tracking-wider ${isRTL ? 'text-right' : 'text-left'} text-white font-mono`}
                  style={{
                     textShadowColor: textGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [colors.neonCyan + '80', colors.neonCyan],
                     }),
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: textGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [5, 15],
                     }),
                  }}
               >
                  {t('myLeagues')}
               </Animated.Text>

               {/* Underline effect */}
               <Animated.View
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neonCyan"
                  style={{
                     opacity: textGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                     }),
                     shadowColor: colors.neonCyan,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 1,
                     shadowRadius: 8,
                  }}
               />

               {/* Side accent lines */}
               <View className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-neonCyan to-neonBlue opacity-60" />
               <View className="absolute -right-2 top-0 bottom-0 w-1 bg-gradient-to-b from-neonPink to-neonPurple opacity-60" />
            </View>

            {/* Enhanced Language Selector */}
            <View className="relative">
               <LanguageSelector size="medium" />
               {/* Holographic frame */}
               <View className="absolute inset-0 border border-holoBlue rounded-lg opacity-30 pointer-events-none" />
            </View>
         </View>

         {/* Enhanced Action Buttons Row with cyberpunk styling */}
         <View className={`flex-row gap-4 ${isRTL ? 'flex-row-reverse' : ''} relative`}>
            {/* Side neon accent bars */}
            <View className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neonGreen via-neonCyan to-neonBlue opacity-80" />
            <View className="absolute -right-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neonPink via-neonPurple to-neonOrange opacity-80" />

            <View className="flex-1">
               {/* Join button with cyberpunk styling */}
               <CyberpunkButton
                  title={t('join')}
                  onPress={onJoinLeague}
                  variant="join"
                  icon="enter"
                  size="medium"
               />
            </View>

            <View className="flex-1">
               {/* Create button with cyberpunk styling */}
               <CyberpunkButton
                  title={t('create')}
                  onPress={onCreateLeague}
                  variant="create"
                  icon="add-circle"
                  size="medium"
               />
            </View>
         </View>

         {/* Data stream effect */}
         <View className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neonCyan/50 to-transparent" />

         {/* Matrix-style corner details */}
         <View className="absolute bottom-4 left-4 w-2 h-2 bg-neonGreen opacity-60" />
         <View className="absolute bottom-4 right-4 w-2 h-2 bg-neonPink opacity-60" />
      </View>
   );
}
