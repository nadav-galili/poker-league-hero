import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { GamePlayer } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface PlayerCardProps {
   player: GamePlayer;
   gameBaseAmount: string;
   isProcessing: boolean;
   onBuyIn: (player: GamePlayer) => void;
   onCashOut: (player: GamePlayer) => void;
   onRemovePlayer: (player: GamePlayer) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
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
      <View className="p-4 rounded-xl  shadow-sm elevation-4 bg-primaryTint">
         {/* Player Info */}
         <View className="flex-row items-center mb-3">
            <Image
               source={{
                  uri:
                     player.profileImageUrl ||
                     'https://via.placeholder.com/50x50/cccccc/666666?text=?',
               }}
               contentFit="cover"
               style={{
                  width: 48,
                  height: 48,
                  borderColor: colors.primary,
                  borderWidth: 2,
                  borderRadius: 12,
                  marginRight: 12,
               }}
            />
            <View className="flex-1">
               <Text variant="h4" className="tracking-wider mb-0.5">
                  {player.fullName}
               </Text>
               <Text variant="body" className="text-xs text-textMuted">
                  {player.isActive ? t('gameInProgress') : 'Inactive'}
               </Text>
            </View>
            {!player.isActive && (
               <View className="px-1.5 py-0.5 rounded-lg border border-primary bg-textMuted">
                  <Text variant="captionSmall" color={colors.textInverse}>
                     OUT
                  </Text>
               </View>
            )}
         </View>

         {/* Player Stats */}
         <View className="flex-row justify-between mb-3">
            <View className="items-center flex-1">
               <Text variant="captionSmall" className="text-textMuted">
                  {t('initialBuyIn')}
               </Text>
               <Text variant="h4" className="text-primary">
                  {t('currency')}
                  {gameBaseAmount}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text variant="captionSmall" className="text-textMuted">
                  {t('totalBuyIns')}
               </Text>
               <Text variant="h4" className="text-text">
                  {t('currency')}
                  {player.totalBuyIns}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text variant="captionSmall" color={theme.textMuted}>
                  {t('totalBuyOuts')}
               </Text>
               <Text variant="h4" color={theme.text}>
                  {t('currency')}
                  {player.totalBuyOuts}
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
                  {t('currency')}
                  {(player.currentProfit || 0).toFixed(2)}
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
                  icon="add-circle"
                  disabled={isProcessing}
                  className="bg-primary"
                  textColor={colors.textInverse}
               />
               <Button
                  title={t('cashOut')}
                  onPress={() => onCashOut(player)}
                  variant="primary"
                  icon="cash-outline"
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

export default PlayerCard;
