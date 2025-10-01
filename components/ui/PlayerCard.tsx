/**
 * Enhanced PlayerCard component with Neo-Brutalist styling
 */

import { colors, getTheme } from '@/colors';
import { BrutalistCard } from '@/components/cards/BrutalistCard';
import { Text } from '@/components/Text';
import { LeagueMember } from '@/types';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

interface PlayerCardProps {
   player: LeagueMember;
   isSelected?: boolean;
   onPress?: (playerId: string) => void;
   variant?: 'grid' | 'list' | 'compact';
   showSelectionIndicator?: boolean;
   disabled?: boolean;
}

export function PlayerCard({
   player,
   isSelected = false,
   onPress,
   variant = 'grid',
   showSelectionIndicator = true,
   disabled = false,
}: PlayerCardProps) {
   const theme = getTheme('light');

   const handlePress = () => {
      if (!disabled && onPress) {
         onPress(player.id);
      }
   };

   const getCardSize = () => {
      switch (variant) {
         case 'compact': return 'small';
         case 'list': return 'medium';
         default: return 'medium';
      }
   };

   const getContainerStyle = () => {
      if (variant === 'grid') {
         return {
            flex: 1,
            height: 128,
            margin: 4,
         };
      } else if (variant === 'list') {
         return {
            marginVertical: 4,
            marginHorizontal: 8,
         };
      } else if (variant === 'compact') {
         return {
            marginVertical: 2,
         };
      }
      return {};
   };

   const getContentContainerClass = () => {
      if (variant === 'grid') {
         return 'items-center justify-center flex-1';
      } else if (variant === 'list') {
         return 'flex-row items-center min-h-[72px]';
      } else if (variant === 'compact') {
         return 'flex-row items-center min-h-[48px]';
      }
      return 'flex-row items-center';
   };

   const getImageSize = () => {
      switch (variant) {
         case 'grid':
            return { width: 50, height: 50 };
         case 'list':
            return { width: 48, height: 48 };
         case 'compact':
            return { width: 32, height: 32 };
         default:
            return { width: 72, height: 72 };
      }
   };

   return (
      <BrutalistCard
         variant={isSelected ? 'elevated' : 'default'}
         size={getCardSize()}
         customBorderColor={isSelected ? colors.primary : theme.border}
         customBackgroundColor={isSelected ? colors.primaryTint : theme.surfaceElevated}
         shadowIntensity="medium"
         pressAnimation={!disabled}
         glowOnPress={isSelected}
         onPress={handlePress}
         disabled={disabled}
         style={getContainerStyle()}
      >
         <View className={getContentContainerClass()}>
         {/* Selection Indicator */}
         {showSelectionIndicator && variant === 'grid' && (
            <View
               className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 items-center justify-center z-10"
               style={{
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderColor: isSelected ? colors.primary : theme.border,
               }}
            >
               {isSelected && (
                  <Ionicons
                     name="checkmark"
                     size={16}
                     color={colors.textInverse}
                  />
               )}
            </View>
         )}

         {/* Player Image */}
         <View className={variant === 'grid' ? 'mt-2 mb-2' : 'mr-3'}>
            <Image
               source={{
                  uri:
                     player.profileImageUrl ||
                     'https://via.placeholder.com/80x80/cccccc/666666?text=?',
               }}
               className="rounded-lg border-2"
               style={[getImageSize(), { borderColor: colors.border }]}
               contentFit="cover"
               onError={(error) => {
                  captureException(new Error('Player image loading failed'), {
                     function: 'PlayerCard.Image.onError',
                     playerId: player.id,
                     imageUri: player.profileImageUrl,
                     error: error.toString(),
                  });
               }}
            />
         </View>

         {/* Player Info */}
         <View
            className={
               variant === 'list' ? 'flex-1 justify-center' : 'items-center'
            }
         >
            <Text
               variant={variant === 'compact' ? 'captionSmall' : 'caption'}
               color={isSelected ? colors.primary : theme.text}
               className="text-center tracking-wide mt-2 mb-1 leading-4 px-1 font-semibold"
               numberOfLines={2}
               ellipsizeMode="tail"
            >
               {player.fullName}
            </Text>

            {variant === 'list' && (
               <Text
                  variant="captionSmall"
                  color={theme.textMuted}
                  className="mt-0.5 font-medium"
               >
                  {player.role === 'admin' ? '👑 Admin' : 'Member'}
               </Text>
            )}
         </View>

         {/* List Selection Indicator */}
         {showSelectionIndicator && variant === 'list' && isSelected && (
            <View className="ml-2">
               <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
               />
            </View>
         )}
         </View>
      </BrutalistCard>
   );
}
