/**
 * League Card Component - Modern dark theme design
 */

import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { LeagueWithTheme } from '@/types/league';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';

interface LeagueCardProps {
   league: LeagueWithTheme;
   onPress: (league: LeagueWithTheme) => void;
   onShare: (league: LeagueWithTheme) => void;
}

const LeagueCardComponent = ({ league, onPress, onShare }: LeagueCardProps) => {
   const { t } = useLocalization();

   const handlePress = () => {
      try {
         onPress(league);
      } catch (error) {
         captureException(error as Error, {
            function: 'LeagueCard.onPress',
            screen: 'MyLeagues',
            leagueId: league.id,
         });
      }
   };

   const stats = {
      members: league.memberCount || 0,
   };

   return (
      <Pressable
         onPress={handlePress}
         className="bg-cyberBackground/90 backdrop-blur-sm rounded-2xl p-4 mx-1 border border-neonCyan/30 relative overflow-hidden"
         style={{
            shadowColor: league.themeColor || '#00FFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
            elevation: 8,
         }}
      >
         {/* Holographic overlay */}
         <View className="absolute inset-0 bg-gradient-to-br from-holoBlue via-transparent to-holoPink opacity-20" />

         {/* Scan lines */}
         <View className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
               <View
                  key={i}
                  className="absolute left-0 right-0 h-px bg-neonCyan/10"
                  style={{ top: i * 15 }}
               />
            ))}
         </View>

         {/* Corner brackets */}
         <View className="absolute top-2 left-2 w-3 h-3">
            <View className="absolute top-0 left-0 w-full h-px bg-neonCyan" />
            <View className="absolute top-0 left-0 w-px h-full bg-neonCyan" />
         </View>
         <View className="absolute top-2 right-2 w-3 h-3">
            <View className="absolute top-0 right-0 w-full h-px bg-neonPink" />
            <View className="absolute top-0 right-0 w-px h-full bg-neonPink" />
         </View>
         <View className="flex-row items-start justify-between relative z-10">
            {/* Left side - League Info */}
            <View className="flex-1 mr-4">
               {/* League Name with cyberpunk styling */}
               <View className="relative mb-2">
                  <Text className="text-white text-lg font-bold font-mono tracking-wide">
                     {league.name}
                  </Text>
                  {/* Name underline glow */}
                  <View className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neonCyan/60 to-transparent" />
               </View>

               {/* League Code Badge with enhanced styling */}
               <View className="flex-row items-center gap-3 mb-3">
                  <Text className="text-neonCyan text-sm font-semibold font-mono">
                     {t('leagueCode')}
                  </Text>
                  <View className="relative">
                     <View
                        className="px-3 py-1 rounded-lg border border-neonPink/50"
                        style={{
                           backgroundColor: league.themeColor
                              ? `${league.themeColor}20`
                              : '#6366F120',
                        }}
                     >
                        <Text className="text-white text-sm font-bold font-mono tracking-widest">
                           {league.code}
                        </Text>
                     </View>
                     {/* Code badge glow */}
                     <View
                        className="absolute inset-0 rounded-lg opacity-30"
                        style={{
                           backgroundColor: league.themeColor || '#6366F1',
                           shadowColor: league.themeColor || '#6366F1',
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 1,
                           shadowRadius: 8,
                        }}
                     />
                  </View>
               </View>

               {/* Enhanced Statistics Row */}
               <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-2 bg-holoBlue/20 px-2 py-1 rounded border border-neonBlue/30">
                     <Ionicons
                        name="people-outline"
                        size={16}
                        color="#00FFFF"
                     />
                     <Text className="text-neonCyan text-sm font-mono font-bold">
                        {stats.members}
                     </Text>
                  </View>

                  {/* Status indicator */}
                  <View className="flex-row items-center gap-1">
                     <View className="w-2 h-2 rounded-full bg-neonGreen animate-pulse" />
                     <Text className="text-neonGreen text-xs font-mono">
                        ONLINE
                     </Text>
                  </View>
               </View>
            </View>

            {/* Right side - Enhanced League Avatar/Image */}
            <View className="items-center relative">
               {league.image && league.image.trim() !== '' ? (
                  <View className="relative">
                     {/* Holographic frame */}
                     <View
                        className="absolute inset-0 rounded-xl border-2 border-neonPink/60 opacity-80"
                        style={{
                           shadowColor: league.themeColor || '#FF00FF',
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 0.8,
                           shadowRadius: 10,
                        }}
                     />

                     <Image
                        source={{ uri: league.image }}
                        style={{
                           width: 60,
                           height: 60,
                           borderRadius: 12,
                           backgroundColor: league.themeColor || '#6366F1',
                        }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        priority="normal"
                        placeholder={{
                           uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                        }}
                        placeholderContentFit="cover"
                        transition={200}
                        onError={(error) => {
                           captureException(new Error('Image loading failed'), {
                              function: 'LeagueCard.Image.onError',
                              screen: 'MyLeagues',
                              leagueId: league.id,
                              imageUri: league.image,
                              error: error.toString(),
                           });
                        }}
                     />

                     {/* Corner accents */}
                     <View className="absolute -top-1 -left-1 w-2 h-2 bg-neonCyan" />
                     <View className="absolute -bottom-1 -right-1 w-2 h-2 bg-neonPink" />
                  </View>
               ) : (
                  <View className="relative">
                     {/* Enhanced default avatar */}
                     <View
                        className="w-15 h-15 rounded-xl items-center justify-center border-2 border-neonBlue/60"
                        style={{
                           backgroundColor: `${league.themeColor || '#6366F1'}40`,
                           shadowColor: league.themeColor || '#6366F1',
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 0.8,
                           shadowRadius: 10,
                        }}
                     >
                        <Ionicons name="people" size={24} color="#00FFFF" />

                        {/* Inner holographic lines */}
                        <View className="absolute inset-2 border border-holoBlue/30 rounded-lg" />
                     </View>

                     {/* Corner brackets */}
                     <View className="absolute -top-1 -left-1 w-2 h-2 bg-neonGreen" />
                     <View className="absolute -bottom-1 -right-1 w-2 h-2 bg-neonOrange" />
                  </View>
               )}

               {/* Data stream indicator */}
               <View className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-neonGreen via-neonCyan to-transparent opacity-80" />
            </View>
         </View>
      </Pressable>
   );
};

// Memoize the component with custom comparison function
export const LeagueCard = React.memo(
   LeagueCardComponent,
   (prevProps, nextProps) => {
      // Shallow comparison of league object and function references
      return (
         prevProps.league.id === nextProps.league.id &&
         prevProps.league.name === nextProps.league.name &&
         prevProps.league.code === nextProps.league.code &&
         prevProps.league.memberCount === nextProps.league.memberCount &&
         prevProps.league.image === nextProps.league.image &&
         prevProps.league.themeColor === nextProps.league.themeColor &&
         prevProps.league.accentColor === nextProps.league.accentColor &&
         prevProps.onPress === nextProps.onPress &&
         prevProps.onShare === nextProps.onShare
      );
   }
);
