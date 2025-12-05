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
      <View className="p-2.5 rounded-lg shadow-sm elevation-3 border border-primary bg-primary">
         {/* Player Info */}
         <View className="flex-row items-center mb-2 gap-1.5">
            <Image
               source={
                  !player.userId
                     ? require('@/assets/images/anonymous.webp')
                     : {
                          uri:
                             player.profileImageUrl ||
                             'https://via.placeholder.com/50x50/cccccc/666666?text=?',
                       }
               }
               style={{
                  borderColor: colors.primary,
                  backgroundColor: '#cccccc',
                  borderRadius: 6,
                  height: 32,
                  width: 32,
                  borderWidth: 1.5,
               }}
               contentFit="cover"
            />
            <TouchableOpacity
               onPress={() => onRemovePlayer(player)}
               className="w-6 h-6 rounded-full items-center justify-center border border-black"
               style={{ backgroundColor: colors.error }}
               disabled={isProcessing}
            >
               <Ionicons name="remove-circle" size={14} color={colors.text} />
            </TouchableOpacity>
            <View className="flex-1 min-w-0">
               <Text
                  className="text-sm font-semibold text-text"
                  numberOfLines={1}
               >
                  {player.fullName}
               </Text>
               <Text className="text-xs text-text opacity-70" numberOfLines={1}>
                  {player.isActive ? t('gameInProgress') : 'Inactive'}
               </Text>
            </View>
            {!player.isActive && (
               <View className="px-1 py-0.5 rounded border border-primary bg-red-500">
                  <Text className="text-xs text-text font-bold">OUT</Text>
               </View>
            )}
         </View>

         {/* Player Stats Grid */}
         <View className="gap-2 mb-2">
            {/* Stats Row 1 */}
            <View className="flex-row gap-2">
               {/* <View
                  className="flex-1 px-2 py-1.5 rounded items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
               >
                  <Text className="text-xs font-semibold text-success opacity-60 mb-0.5">
                     {t('initialBuyIn')}
                  </Text>
                  <Text className="text-sm font-bold text-text">
                     {t('currency')}
                     {gameBaseAmount}
                  </Text>
               </View> */}
               <View
                  className="flex-1 px-2 py-1.5 rounded items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
               >
                  <Text className="text-xs font-semibold text-text mb-0.5">
                     {t('totalBuyIns')}
                  </Text>
                  <Text className="text-sm font-bold text-text">
                     {t('currency')}
                     {player.totalBuyIns}
                  </Text>
               </View>
            </View>

            {/* Stats Row 2 */}
            <View className="flex-row gap-2">
               <View
                  className="flex-1 px-2 py-1.5 rounded items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
               >
                  <Text className="text-xs font-semibold text-text  mb-0.5">
                     {t('totalBuyOuts')}
                  </Text>
                  <Text className="text-sm font-bold text-text">
                     {t('currency')}
                     {player.totalBuyOuts}
                  </Text>
               </View>
               <View
                  className="flex-1 px-2 py-1.5 rounded items-center justify-center"
                  style={{
                     backgroundColor: 'rgba(255,255,255,0.08)',
                  }}
               >
                  <Text className="text-xs font-semibold text-text  mb-0.5">
                     {t('currentProfit')}
                  </Text>
                  <Text
                     className="text-sm font-bold"
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
         </View>

         {/* Action Buttons */}
         {player.isActive && (
            <View className="flex-row gap-1.5 items-center justify-between w-full">
               <AppButton
                  title={t('buyIn')}
                  onPress={() => onBuyIn(player)}
                  color="success"
                  disabled={isProcessing}
                  width="100%"
                  icon="add-circle"
                  size="small"
               />
               <AppButton
                  title={t('cashOut')}
                  onPress={() => onCashOut(player)}
                  color="error"
                  disabled={isProcessing}
                  width="100%"
                  icon="cash-outline"
                  size="small"
               />
            </View>
         )}
      </View>
   );
};

export default PlayerCard;
