import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { GamePlayer } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { View } from 'react-native';

interface GameEventsListProps {
   players: GamePlayer[];
}

interface GameEvent {
   id: string;
   playerId: string;
   playerName: string;
   playerImage?: string;
   type: string;
   amount: string;
   createdAt: string;
   notes?: string;
}

const GameEventsList: React.FC<GameEventsListProps> = ({ players }) => {
   const { t, isRTL } = useLocalization();
   const theme = getTheme('light');

   const events = useMemo(() => {
      const allEvents: GameEvent[] = [];

      players.forEach((player) => {
         if (player.cashIns && player.cashIns.length > 0) {
            player.cashIns.forEach((cashIn) => {
               allEvents.push({
                  id: cashIn.id,
                  playerId: player.id,
                  playerName: player.fullName,
                  playerImage: player.profileImageUrl,
                  type: cashIn.type,
                  amount: cashIn.amount,
                  createdAt: cashIn.createdAt,
                  notes: cashIn.notes,
               });
            });
         }
      });

      // Sort by createdAt descending (newest first)
      return allEvents.sort((a, b) => {
         return dayjs(b.createdAt).diff(dayjs(a.createdAt));
      });
   }, [players]);

   const renderEventItem = ({ item }: { item: GameEvent }) => {
      const isCashOut = item.type === 'buy_out';
      const eventTypeLabel = isCashOut ? t('cashOut') : t('buyIn');
      const iconName = isCashOut ? 'exit-outline' : 'log-in-outline';
      const iconColor = isCashOut ? colors.success : colors.primary;
      const amountPrefix = isCashOut ? '+' : '-';

      return (
         <View
            className="flex-row items-center justify-between p-3 mb-2 rounded-lg border-2 border-black bg-white shadow-sm"
            style={{ elevation: 2 }}
         >
            <View className="flex-row items-center flex-1 gap-3">
               <View
                  className="w-8 h-8 rounded-full items-center justify-center border border-black"
                  style={{ backgroundColor: theme.surface }}
               >
                  <Ionicons name={iconName} size={16} color={iconColor} />
               </View>
               <View className="flex-1">
                  <Text className="font-bold text-sm" numberOfLines={1}>
                     {item.playerName}
                  </Text>
                  <View className="flex-row items-center gap-2">
                     <Text className="text-xs text-gray-500 font-bold uppercase">
                        {eventTypeLabel}
                     </Text>
                     <Text className="text-xs text-gray-400">
                        {dayjs(item.createdAt).format('HH:mm')}
                     </Text>
                  </View>
               </View>
            </View>
            <View>
               <Text
                  className={`font-black text-base ${isCashOut ? 'text-green-600' : 'text-red-500'}`}
               >
                  {isCashOut ? '' : ''}
                  {t('currency')}
                  {item.amount}
               </Text>
            </View>
         </View>
      );
   };

   if (events.length === 0) {
      return (
         <View className="items-center justify-center p-4 py-8 bg-white/50 rounded-lg border-2 border-gray-200 border-dashed">
            <Text className="text-gray-400 font-bold uppercase text-sm">
               {t('noEventsYet')}
            </Text>
         </View>
      );
   }

   return (
      <View className="min-h-[100px] max-h-[400px]">
         <FlashList
            data={events}
            renderItem={renderEventItem}
            estimatedItemSize={70}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 8 }}
            nestedScrollEnabled={true}
         />
      </View>
   );
};

export default GameEventsList;

