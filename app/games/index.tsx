import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function Games() {
   const { t } = useLocalization();

   // Mock active game data - replace with actual data fetching
   const activeGame = {
      id: '1',
      status: 'ACTIVE',
      activePlayers: 4,
      totalBuyIns: 0,
      totalPot: 200,
   };

   // Mock player data - replace with actual data
   const players = [
      {
         id: '1',
         name: 'שי לוי',
         status: 'active',
         profit: -50,
         buyIns: 0,
         cashOut: 50,
         finalAmount: 50,
         avatar: '🎭',
      },
      {
         id: '2',
         name: 'מיה ברזני',
         status: 'active',
         profit: -50,
         buyIns: 0,
         cashOut: 50,
         finalAmount: 50,
         avatar: '🎨',
      },
   ];

   const handleAddPlayer = () => {
      // Navigate to add player screen
      console.log('Add player');
   };

   const handleCashOut = (playerId: string) => {
      // Handle cash out for player
      console.log('Cash out player:', playerId);
   };

   const handleEndGame = () => {
      // Handle end game
      console.log('End game');
   };

   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={{ flex: 1 }}
      >
         {/* Header */}
         <View
            className="flex-row items-center justify-between px-5 pt-16 pb-4"
            style={{
               backgroundColor: 'rgba(138, 43, 226, 0.15)',
               backdropFilter: 'blur(20px)',
            }}
         >
            <View className="w-10" />
            <Text className="text-white text-xl font-semibold">
               {t('gameDetails') || 'פרטי המשחק'}
            </Text>
            <View className="w-10" />
         </View>

         <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
         >
            {/* Game Status Card */}
            <View
               className="mx-5 mt-4 p-5 rounded-3xl"
               style={{
                  backgroundColor: 'rgba(138, 43, 226, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(138, 43, 226, 0.3)',
                  backdropFilter: 'blur(20px)',
               }}
            >
               <View className="flex-row items-center justify-between mb-4">
                  <View className="px-3 py-1 rounded-full bg-green-500/30 border border-green-500/50">
                     <Text className="text-green-400 text-sm font-semibold">
                        {activeGame.status}
                     </Text>
                  </View>
                  <Text className="text-white text-2xl font-bold">
                     {t('activeGame') || 'משחק פעיל'}
                  </Text>
               </View>

               <View className="flex-row justify-around">
                  <View className="items-center">
                     <Text className="text-white text-3xl font-bold">
                        {activeGame.activePlayers}
                     </Text>
                     <Text className="text-white/70 text-sm mt-1">
                        {t('activePlayersLabel') || 'Active Players'}
                     </Text>
                  </View>
                  <View className="items-center">
                     <Text className="text-pink-400 text-3xl font-bold">
                        ₪{activeGame.totalBuyIns}
                     </Text>
                     <Text className="text-white/70 text-sm mt-1">
                        {t('totalBuyIns') || 'סך כל הכניסות'}
                     </Text>
                  </View>
                  <View className="items-center">
                     <Text className="text-purple-400 text-3xl font-bold">
                        ₪{activeGame.totalPot}
                     </Text>
                     <Text className="text-white/70 text-sm mt-1">
                        {t('totalPot') || 'סך כל הכניסות'}
                     </Text>
                  </View>
               </View>
            </View>

            {/* Add Player Button */}
            <View className="mx-5 mt-4">
               <AppButton
                  title={t('addPlayer') || 'הוסף שחקן'}
                  onPress={handleAddPlayer}
                  variant="glass"
                  color="primary"
                  size="medium"
                  icon="person-add-outline"
               />
            </View>

            {/* Players List */}
            <View className="mx-5 mt-6">
               <Text className="text-white text-xl font-semibold mb-4">
                  {t('players') || 'שחקנים'}
               </Text>

               {players.map((player) => (
                  <View
                     key={player.id}
                     className="mb-4 p-4 rounded-2xl"
                     style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                     }}
                  >
                     <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                           <View className="w-12 h-12 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                              <Text className="text-2xl">{player.avatar}</Text>
                           </View>
                           <View>
                              <Text className="text-white font-semibold text-lg">
                                 {player.name}
                              </Text>
                              <Text className="text-green-400 text-sm">
                                 {t('activeInGame') || 'משחק פעיל'}
                              </Text>
                           </View>
                        </View>
                     </View>

                     <View className="flex-row justify-between mb-3">
                        <View className="flex-1 mr-2">
                           <Text className="text-white/50 text-xs mb-1">
                              {t('profit') || 'רווח נוכחי'}
                           </Text>
                           <Text
                              className={`font-bold text-lg ${player.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                           >
                              ₪{Math.abs(player.profit)}
                              {player.profit < 0 ? '-' : ''}
                           </Text>
                        </View>
                        <View className="flex-1 mr-2">
                           <Text className="text-white/50 text-xs mb-1">
                              {t('buyIns') || 'סך כל הכניסות'}
                           </Text>
                           <Text className="text-white font-bold text-lg">
                              ₪{player.buyIns}
                           </Text>
                        </View>
                        <View className="flex-1 mr-2">
                           <Text className="text-white/50 text-xs mb-1">
                              {t('cashOut') || 'סך הכניסות'}
                           </Text>
                           <Text className="text-white font-bold text-lg">
                              ₪{player.cashOut}
                           </Text>
                        </View>
                        <View className="flex-1">
                           <Text className="text-white/50 text-xs mb-1">
                              {t('finalAmount') || 'כניסה ראשונית'}
                           </Text>
                           <Text className="text-purple-400 font-bold text-lg">
                              ₪{player.finalAmount}
                           </Text>
                        </View>
                     </View>

                     <View className="flex-row gap-3">
                        <AppButton
                           title={t('cashOut') || 'משוך כסף'}
                           onPress={() => handleCashOut(player.id)}
                           variant="solid"
                           color="primary"
                           size="medium"
                           icon="cash-outline"
                           width="48%"
                        />
                        <AppButton
                           title={t('buyIn') || 'כניסה'}
                           onPress={() => console.log('Buy in')}
                           variant="outline"
                           color="success"
                           size="medium"
                           icon="add-circle-outline"
                           width="48%"
                        />
                     </View>
                  </View>
               ))}
            </View>
         </ScrollView>

         {/* Bottom Action Button */}
         <View className="absolute bottom-0 left-0 right-0 p-5 pb-8">
            <AppButton
               title={t('endGame') || 'סיים משחק'}
               onPress={handleEndGame}
               variant="gradient"
               color="error"
               size="large"
               icon="stop-circle-outline"
            />
         </View>
      </LinearGradient>
   );
}
