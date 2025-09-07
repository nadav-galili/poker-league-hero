/**
 * Reusable PlayerCard component for displaying player information
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { LeagueMember } from '@/types';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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

   const getCardClassName = () => {
      let baseClasses = 'rounded-xl border-2 p-3 relative shadow-lg';

      if (variant === 'grid') {
         baseClasses += ' flex-1 h-32 mx-1 my-1 items-center justify-center';
      } else if (variant === 'list') {
         baseClasses +=
            ' flex-row items-center my-1 mx-2 px-3 py-3 min-h-[72px]';
      } else if (variant === 'compact') {
         baseClasses +=
            ' flex-row items-center px-2 py-1.5 my-0.5 min-h-[48px]';
      }

      return baseClasses;
   };

   const getCardStyle = () => {
      return {
         backgroundColor: isSelected
            ? colors.primaryTint
            : theme.surfaceElevated,
         borderColor: isSelected ? colors.primary : theme.border,
         opacity: disabled ? 0.6 : 1,
         shadowColor: colors.shadow,
         shadowOffset: { width: 2, height: 2 },
         shadowOpacity: 0.3,
         shadowRadius: 0,
         elevation: 4,
      };
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
      <TouchableOpacity
         className={getCardClassName()}
         style={getCardStyle()}
         onPress={handlePress}
         activeOpacity={disabled ? 1 : 0.7}
         disabled={disabled}
      >
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
      </TouchableOpacity>
   );
}
