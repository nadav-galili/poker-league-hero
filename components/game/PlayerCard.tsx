import { colors, getTheme } from '@/colors';
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
   isAdmin?: boolean;
   onBuyIn: (player: GamePlayer) => void;
   onCashOut: (player: GamePlayer) => void;
   onRemovePlayer: (player: GamePlayer) => void;
   onUndoBuyIn: (player: GamePlayer) => void;
   onEditPlayer?: (player: GamePlayer) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
   player,
   gameBaseAmount,
   isProcessing,
   isAdmin = false,
   onBuyIn,
   onCashOut,
   onRemovePlayer,
   onUndoBuyIn,
   onEditPlayer,
}) => {
   const { t } = useLocalization();
   const theme = getTheme();

   return (
      <View 
         className="p-3 rounded-xl shadow-lg elevation-5 border border-white/20"
         style={{ backgroundColor: theme.surfaceElevated }}
      >
         {/* Player Info */}
         <View className="flex-row items-center mb-3 gap-1.5">
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
                  borderColor: theme.primary,
                  backgroundColor: '#cccccc',
                  borderRadius: 8,
                  height: 36,
                  width: 36,
                  borderWidth: 2,
               }}
               contentFit="cover"
            />
            <TouchableOpacity
               onPress={() => onRemovePlayer(player)}
               className="w-7 h-7 rounded-full items-center justify-center border border-black"
               style={{ backgroundColor: theme.error }}
               disabled={isProcessing}
            >
               <Ionicons name="remove-circle" size={16} color={theme.text} />
            </TouchableOpacity>
            <View className="flex-1 min-w-0">
               <Text
                  className="text-base font-semibold"
                  style={{ color: theme.text }}
                  numberOfLines={1}
               >
                  {player.fullName}
               </Text>
               <Text 
                  className="text-xs font-medium" 
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
               >
                  {player.isActive ? t('gameInProgress') : 'Inactive'}
               </Text>
            </View>
            {!player.isActive && (
               <View 
                  className="px-2 py-1 rounded-lg border-2 border-black"
                  style={{ backgroundColor: theme.error }}
               >
                  <Text className="text-xs font-bold" style={{ color: theme.text }}>
                     OUT
                  </Text>
               </View>
            )}
         </View>

         {/* Player Stats Grid */}
         <View className="gap-2 mb-3">
            {/* Stats Row 1 */}
            <View className="flex-row gap-2">
               <View
                  className="flex-1 px-3 py-2 rounded-lg items-center justify-center border border-white/10"
                  style={{ backgroundColor: theme.surfaceBlur }}
               >
                  <Text 
                     className="text-xs font-semibold mb-1"
                     style={{ color: theme.textMuted }}
                  >
                     {t('totalBuyIns')}
                  </Text>
                  <Text className="text-base font-bold" style={{ color: theme.text }}>
                     {t('currency')}
                     {player.totalBuyIns}
                  </Text>
               </View>
            </View>

            {/* Stats Row 2 */}
            <View className="flex-row gap-2">
               <View
                  className="flex-1 px-3 py-2 rounded-lg items-center justify-center border border-white/10"
                  style={{ backgroundColor: theme.surfaceBlur }}
               >
                  <Text 
                     className="text-xs font-semibold mb-1"
                     style={{ color: theme.textMuted }}
                  >
                     {t('totalBuyOuts')}
                  </Text>
                  <Text className="text-base font-bold" style={{ color: theme.text }}>
                     {t('currency')}
                     {player.totalBuyOuts}
                  </Text>
               </View>
               <View
                  className="flex-1 px-3 py-2 rounded-lg items-center justify-center border border-white/10"
                  style={{ backgroundColor: theme.surfaceBlur }}
               >
                  <Text 
                     className="text-xs font-semibold mb-1"
                     style={{ color: theme.textMuted }}
                  >
                     {t('currentProfit')}
                  </Text>
                  <Text
                     className="text-base font-bold"
                     style={{
                        color:
                           player.currentProfit >= 0
                              ? theme.success
                              : theme.error,
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
            <View className="flex-row gap-2 items-center justify-between w-full">
               <View className="flex-1">
                  <AppButton
                     title={t('buyIn')}
                     onPress={() => onBuyIn(player)}
                     variant="solid"
                     color="success"
                     disabled={isProcessing}
                     width="100%"
                     icon="add-circle"
                     size="small"
                  />
               </View>

               <View className="flex-1">
                  <AppButton
                     title={t('cancelBuyIn')}
                     onPress={() => onUndoBuyIn(player)}
                     variant="solid"
                     color="warning"
                     disabled={isProcessing || player.totalBuyIns <= 0}
                     width="100%"
                     icon="arrow-undo"
                     size="small"
                     textSize={11}
                  />
               </View>

               <View className="flex-1">
                  <AppButton
                     title={t('cashOut')}
                     onPress={() => onCashOut(player)}
                     variant="solid"
                     color="error"
                     disabled={isProcessing}
                     width="100%"
                     icon="cash-outline"
                     size="small"
                  />
               </View>
            </View>
         )}

         {/* Edit Button for Cashed Out Players (Admin Only) */}
         {!player.isActive && isAdmin && onEditPlayer && (
            <View className="mt-2">
               <AppButton
                  title={t('edit')}
                  onPress={() => onEditPlayer(player)}
                  variant="solid"
                  color="primary"
                  disabled={isProcessing}
                  width="100%"
                  icon="pencil"
                  size="small"
               />
            </View>
         )}
      </View>
   );
};

export default PlayerCard;
