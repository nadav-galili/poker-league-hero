import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { GamePlayer } from '@/hooks/useGameData';

interface PlayerCardProps {
   player: GamePlayer;
   gameBaseAmount: string;
   isProcessing: boolean;
   onBuyIn: (player: GamePlayer) => void;
   onCashOut: (player: GamePlayer) => void;
   onRemovePlayer: (player: GamePlayer) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
   player,
   gameBaseAmount,
   isProcessing,
   onBuyIn,
   onCashOut,
   onRemovePlayer,
}) => {
   const theme = getTheme('light');
   const { t } = useLocalization();

   return (
      <View
         className="p-4 rounded-xl border-3 border-black shadow-sm elevation-4"
         style={{ backgroundColor: theme.surfaceElevated }}
      >
         {/* Player Info */}
         <View className="flex-row items-center mb-3">
            <Image
               source={{
                  uri:
                     player.profileImageUrl ||
                     'https://via.placeholder.com/50x50/cccccc/666666?text=?',
               }}
               className="w-12.5 h-12.5 rounded-lg border-2 border-black mr-3"
               contentFit="cover"
            />
            <View className="flex-1">
               <Text
                  variant="h4"
                  color={theme.text}
                  className="tracking-wider mb-0.5"
               >
                  {player.fullName}
               </Text>
               <Text
                  variant="body"
                  color={theme.textMuted}
                  className="text-xs"
               >
                  {player.isActive ? t('gameInProgress') : 'Inactive'}
               </Text>
            </View>
            {!player.isActive && (
               <View
                  className="px-1.5 py-0.5 rounded-lg border border-black"
                  style={{ backgroundColor: theme.textMuted }}
               >
                  <Text variant="captionSmall" color={colors.textInverse}>
                     OUT
                  </Text>
               </View>
            )}
         </View>

         {/* Player Stats */}
         <View className="flex-row justify-between mb-3">
            <View className="items-center flex-1">
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('initialBuyIn')}
               </Text>
               <Text variant="h4" color={colors.primary}>
                  ₪{gameBaseAmount}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('totalBuyIns')}
               </Text>
               <Text variant="h4" color={theme.text}>
                  ₪{player.totalBuyIns}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('totalBuyOuts')}
               </Text>
               <Text variant="h4" color={theme.text}>
                  ₪{player.totalBuyOuts}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('currentProfit')}
               </Text>
               <Text
                  variant="h4"
                  color={
                     player.currentProfit >= 0 ? colors.success : colors.error
                  }
                  className="font-bold"
               >
                  ₪{player.currentProfit.toFixed(2)}
               </Text>
            </View>
         </View>

         {/* Action Buttons */}
         {player.isActive && (
            <View className="flex-row gap-2 items-center">
               <Button
                  title={t('buyIn')}
                  onPress={() => onBuyIn(player)}
                  variant="outline"
                  size="small"
                  disabled={isProcessing}
                  className="bg-primary"
                  textColor={colors.textInverse}
               />
               <Button
                  title={t('cashOut')}
                  onPress={() => onCashOut(player)}
                  variant="primary"
                  size="small"
                  className="bg-secondary flex-1"
                  disabled={isProcessing}
               />
               <TouchableOpacity
                  onPress={() => onRemovePlayer(player)}
                  className="w-9 h-9 rounded-full items-center justify-center border-2 border-black"
                  style={{ backgroundColor: colors.error }}
                  disabled={isProcessing}
               >
                  <Ionicons
                     name="remove-circle"
                     size={20}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
            </View>
         )}
      </View>
   );
};