import { colors } from '@/colors';
// import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { GamePlayer } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../ui/AppButton';

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
   const { t } = useLocalization();

   return (
      <View className="p-4 rounded-xl  shadow-sm elevation-4 border-2 border-primary bg-[#8B5CF6]">
         {/* Player Info */}
         <View className="flex-row items-center mb-3">
            <Image
               source={{
                  uri:
                     player.profileImageUrl ||
                     'https://via.placeholder.com/50x50/cccccc/666666?text=?',
               }}
               style={{
                  borderColor: colors.primary,
                  backgroundColor: '#cccccc',
                  borderRadius: 8,
                  height: 40,
                  width: 40,
                  marginRight: 12,
                  borderWidth: 2,
               }}
               contentFit="cover"
            />
            <TouchableOpacity
               onPress={() => onRemovePlayer(player)}
               className="w-9 h-9 rounded-full items-center justify-center border-2 border-black"
               style={{ backgroundColor: colors.error }}
               disabled={isProcessing}
            >
               <Ionicons name="remove-circle" size={20} color={colors.text} />
            </TouchableOpacity>
            <View className="flex-1">
               <Text className="text-xl tracking-wider mb-0.5 text-text">
                  {player.fullName}
               </Text>
               <Text className="text-xs text-text">
                  {player.isActive ? t('gameInProgress') : 'Inactive'}
               </Text>
            </View>
            {!player.isActive && (
               <View className="px-1.5 py-0.5 rounded-lg border m-4 border-primary bg-red-500">
                  <Text className="text-xs text-text">OUT</Text>
               </View>
            )}
         </View>

         {/* Player Stats */}
         <View className="flex-row justify-between mb-3">
            <View className="items-center flex-1">
               <Text className="text-xs text-text">{t('initialBuyIn')}</Text>
               <Text className="text-xl text-primary">
                  {t('currency')}
                  {gameBaseAmount}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text className="text-xs text-text">{t('totalBuyIns')}</Text>
               <Text className="text-xl text-text">
                  {t('currency')}
                  {player.totalBuyIns}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text className="text-xs text-text">{t('totalBuyOuts')}</Text>
               <Text className="text-xl text-text">
                  {t('currency')}
                  {player.totalBuyOuts}
               </Text>
            </View>
            <View className="items-center flex-1">
               <Text className="text-xs text-text">{t('currentProfit')}</Text>
               <Text
                  className="text-xl text-text"
                  style={{
                     color:
                        player.currentProfit >= 0
                           ? colors.success
                           : colors.error,
                  }}
               >
                  {t('currency')}
                  {(player.currentProfit || 0).toFixed(2)}
               </Text>
            </View>
         </View>

         {/* Action Buttons */}
         {player.isActive && (
            <View className="flex-row gap-2 items-center justify-between w-full mt-4">
               <AppButton
                  title={t('buyIn')}
                  onPress={() => onBuyIn(player)}
                  color="success"
                  disabled={isProcessing}
                  width="100%"
                  icon="add-circle"
               />
               <AppButton
                  title={t('cashOut')}
                  onPress={() => onCashOut(player)}
                  color="error"
                  disabled={isProcessing}
                  width="100%"
                  icon="cash-outline"
               />
            </View>
         )}
      </View>
   );
};

export default PlayerCard;
