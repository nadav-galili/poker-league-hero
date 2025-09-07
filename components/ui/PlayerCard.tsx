/**
 * Reusable PlayerCard component for displaying player information
 */

import { LeagueMember } from '@/types';
import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

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

   const getCardStyle = () => {
      const baseStyle = [styles.playerCard];

      if (variant === 'grid') {
         baseStyle.push(styles.gridCard);
      } else if (variant === 'list') {
         baseStyle.push(styles.listCard);
      } else if (variant === 'compact') {
         baseStyle.push(styles.compactCard);
      }

      baseStyle.push({
         backgroundColor: isSelected
            ? colors.primaryTint
            : theme.surfaceElevated,
         borderColor: isSelected ? colors.primary : theme.border,
         opacity: disabled ? 0.6 : 1,
      });

      return baseStyle;
   };

   const getImageSize = () => {
      switch (variant) {
         case 'grid':
            return { width: 60, height: 60 };
         case 'list':
            return { width: 48, height: 48 };
         case 'compact':
            return { width: 32, height: 32 };
         default:
            return { width: 60, height: 60 };
      }
   };

   return (
      <TouchableOpacity
         style={getCardStyle()}
         onPress={handlePress}
         activeOpacity={disabled ? 1 : 0.7}
         disabled={disabled}
      >
         {/* Selection Indicator */}
         {showSelectionIndicator && variant === 'grid' && (
            <View
               style={[
                  styles.selectionIndicator,
                  {
                     backgroundColor: isSelected
                        ? colors.primary
                        : 'transparent',
                     borderColor: isSelected ? colors.primary : theme.border,
                  },
               ]}
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
         <View
            style={
               variant === 'grid'
                  ? styles.gridImageContainer
                  : styles.imageContainer
            }
         >
            <Image
               source={{
                  uri:
                     player.profileImageUrl ||
                     'https://via.placeholder.com/80x80/cccccc/666666?text=?',
               }}
               style={[styles.playerImage, getImageSize()]}
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
         <View style={variant === 'list' ? styles.listInfo : styles.gridInfo}>
            <Text
               variant={variant === 'compact' ? 'captionSmall' : 'caption'}
               color={isSelected ? colors.primary : theme.text}
               style={styles.playerName}
            >
               {player.fullName}
            </Text>

            {variant === 'list' && (
               <Text
                  variant="captionSmall"
                  color={theme.textMuted}
                  style={styles.playerRole}
               >
                  {player.role === 'admin' ? '👑 Admin' : 'Member'}
               </Text>
            )}
         </View>

         {/* List Selection Indicator */}
         {showSelectionIndicator && variant === 'list' && isSelected && (
            <View style={styles.listSelectionIndicator}>
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

const styles = StyleSheet.create({
   playerCard: {
      borderRadius: 12,
      borderWidth: 2,
      padding: 8,
      position: 'relative',
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
      elevation: 4,
   },

   gridCard: {
      flex: 1,
      aspectRatio: 1,
      margin: 4,
      alignItems: 'center',
      justifyContent: 'center',
   },

   listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      marginHorizontal: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      minHeight: 72,
   },

   compactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginVertical: 2,
      minHeight: 48,
   },

   selectionIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
   },

   gridImageContainer: {
      marginTop: 8,
      marginBottom: 8,
   },

   imageContainer: {
      marginRight: 12,
   },

   playerImage: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
   },

   gridInfo: {
      alignItems: 'center',
   },

   listInfo: {
      flex: 1,
      justifyContent: 'center',
   },

   playerName: {
      textAlign: 'center',
      letterSpacing: 0.3,
      marginTop: 3,
      marginBottom: 3,
      lineHeight: 16,
      paddingHorizontal: 4,
      fontWeight: '600',
   },

   playerRole: {
      marginTop: 2,
      fontWeight: '500',
   },

   listSelectionIndicator: {
      marginLeft: 8,
   },
});
