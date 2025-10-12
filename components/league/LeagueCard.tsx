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
import { Alert, Pressable, View } from 'react-native';

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

   const handleShare = () => {
      try {
         onShare(league);
      } catch (error) {
         captureException(error as Error, {
            function: 'LeagueCard.onShare',
            screen: 'MyLeagues',
            leagueId: league.id,
         });
         Alert.alert(t('error'), 'Failed to initiate share');
      }
   };

   // Mock data for statistics - you can replace with actual data from league object
   const stats = {
      members: league.memberCount || 0,
   };

   return (
      <Pressable
         onPress={handlePress}
         className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 mx-1 border border-gray-700/50"
         style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
         }}
      >
         <View className="flex-row items-start justify-between">
            {/* Left side - League Info */}
            <View className="flex-1 mr-4">
               {/* League Name */}
               <Text className="text-white text-lg font-bold mb-2">
                  {league.name}
               </Text>

               {/* League Code Badge and Share Button */}
               <View className="flex-row items-center gap-3 mb-3">
                  <View
                     className="px-3 py-1 rounded-full"
                     style={{ backgroundColor: league.themeColor || '#6366F1' }}
                  >
                     <Text className="text-white text-sm font-semibold">
                        {league.code}
                     </Text>
                  </View>

                  <Pressable
                     className="bg-gray-700/50 p-2 rounded-full"
                     onPress={handleShare}
                  >
                     <Ionicons name="share-outline" size={16} color="#FFFFFF" />
                  </Pressable>
               </View>

               {/* Statistics Row */}
               <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1">
                     <Ionicons
                        name="people-outline"
                        size={16}
                        color="#9CA3AF"
                     />
                     <Text className="text-gray-400 text-sm">
                        {stats.members}
                     </Text>
                  </View>

                  {/* <View className="flex-row items-center gap-1">
                     <Ionicons
                        name="game-controller-outline"
                        size={16}
                        color="#9CA3AF"
                     />
                     <Text className="text-gray-400 text-sm">
                        {stats.games}
                     </Text>
                  </View> */}

                  {/* <View className="flex-row items-center gap-1">
                     <Ionicons name="trophy-outline" size={16} color="#9CA3AF" />
                     <Text className="text-gray-400 text-sm">
                        {stats.wins}
                     </Text>
                  </View> */}
               </View>
            </View>

            {/* Right side - League Avatar/Image */}
            <View className="items-center">
               {league.image && league.image.trim() !== '' ? (
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
               ) : (
                  <View
                     className="w-15 h-15 rounded-xl items-center justify-center"
                     style={{ backgroundColor: league.themeColor || '#6366F1' }}
                  >
                     <Ionicons name="people" size={24} color="#FFFFFF" />
                  </View>
               )}
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
