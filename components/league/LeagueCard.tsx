/**
 * League Card Component - Enhanced with Neo-Brutalist styling
 */

import { getTheme } from '@/colors';
import { BrutalistCard } from '@/components/cards/BrutalistCard';
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
   const theme = getTheme('light');
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

   return (
      <BrutalistCard
         variant="elevated"
         size="large"
         customBorderColor={theme.primary}
         shadowIntensity="heavy"
         pressAnimation={true}
         glowOnPress={true}
         onPress={handlePress}
         style={{ padding: 0 }} // Remove default padding to use custom layout
      >
         <View className="flex-row items-center p-5">
         {/* League Image with colored frame */}
         <View className="relative mr-5">
            {league.image && league.image.trim() !== '' ? (
               <Image
                  source={{ uri: league.image }}
                  style={{
                     width: 80,
                     height: 80,
                     borderRadius: 12,
                     borderWidth: 6,
                     borderColor: '#E5E7EB',
                  }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  priority="normal"
                  placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }}
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
               <View className="w-20 h-20 rounded-xl border-[6px] border-border bg-primary/20 items-center justify-center">
                  <Ionicons name="people" size={32} color={theme.primary} />
               </View>
            )}
            <View
               className="absolute -top-2 -left-2 -right-2 -bottom-2 border-[6px] rounded-[20px] opacity-90"
               style={{ borderColor: league.themeColor }}
            />
         </View>

         {/* League Info with enhanced styling */}
         <View className="flex-1 gap-3">
            <Text
               variant="h4"
               className="tracking-widest font-bold uppercase text-base text-primary underline"
            >
               {league.name}
            </Text>

            <View className="flex-row items-center gap-3">
               <View
                  className="flex-1 px-3 py-2 rounded-md border-[3px]"
                  style={{
                     backgroundColor: league.accentColor,
                     borderColor: league.themeColor,
                  }}
               >
                  <Text variant="labelSmall" color={league.themeColor}>
                     {t('leagueCode')}
                  </Text>
                  <Text
                     variant="body"
                     color={league.themeColor}
                     className="tracking-wide"
                  >
                     {league.code}
                  </Text>
               </View>

               <Pressable
                  className="w-10 h-10 rounded-md border-[3px] border-border items-center justify-center shadow-[4px_4px_0px_0px] shadow-shadow"
                  style={{ backgroundColor: league.themeColor }}
                  onPress={handleShare}
               >
                  <Ionicons name="share" size={16} color="#FFFFFF" />
               </Pressable>
            </View>

            <Text
               variant="captionSmall"
               color={theme.textMuted}
               className="tracking-wide uppercase"
            >
               {league.memberCount} {t('members')}
            </Text>
         </View>
         </View>
      </BrutalistCard>
   );
};

// Memoize the component with custom comparison function
export const LeagueCard = React.memo(LeagueCardComponent, (prevProps, nextProps) => {
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
});
