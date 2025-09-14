import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { Text } from '@/components/Text';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import AddPlayerModal from '@/app/components/game/AddPlayerModal';
import CashOutModal from '@/app/components/game/CashOutModal';
import GameSummary from '@/app/components/game/GameSummary';
import PlayerCard from '@/app/components/game/PlayerCard';
import { GamePlayer, LeagueMember, useGameData } from '@/hooks/useGameData';
import { createGameService } from '@/services/gameService';

export default function GameScreen() {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();
   const { fetchWithAuth } = useAuth();
   const { gameId } = useLocalSearchParams<{ gameId: string }>();

   const {
      game,
      isLoading,
      error,
      refreshing,
      availableMembers,
      loadGameData,
      loadAvailableMembers,
      handleRefresh,
   } = useGameData(gameId);

   // Modal states
   const [showCashOutModal, setShowCashOutModal] = React.useState(false);
   const [showAddPlayerModal, setShowAddPlayerModal] = React.useState(false);
   const [selectedPlayer, setSelectedPlayer] =
      React.useState<GamePlayer | null>(null);
   const [cashOutAmount, setCashOutAmount] = React.useState('');
   const [cashOutError, setCashOutError] = React.useState<string>('');
   const [isProcessing, setIsProcessing] = React.useState(false);

   // Initialize game service
   const gameService = React.useMemo(() => {
      if (!gameId) return null;
      return createGameService(fetchWithAuth, t, gameId);
   }, [fetchWithAuth, gameId, t]);

   const handleBack = () => {
      router.back();
   };

   const handleBuyIn = async (player: GamePlayer) => {
      if (!game || !gameService) return;

      try {
         setIsProcessing(true);
         await gameService.buyIn(player, game.buyIn);

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: `${t('buyInSuccessful')} for ${player.fullName} - ${t('currency')}${game.buyIn}`,
         });
         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to process buy-in';
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: errorMessage,
         });
      } finally {
         setIsProcessing(false);
      }
   };

   const handleCashOut = (player: GamePlayer) => {
      setSelectedPlayer(player);
      setCashOutAmount('');
      setCashOutError('');
      setShowCashOutModal(true);
   };

   const handleCashOutAmountChange = (amount: string) => {
      setCashOutAmount(amount);
      // Clear error when user starts typing
      if (cashOutError) {
         setCashOutError('');
      }
   };

   const processCashOut = async () => {
      // Clear any previous error
      setCashOutError('');

      if (!selectedPlayer || !cashOutAmount.trim() || !gameService) {
         setCashOutError(t('invalidAmount'));
         return;
      }

      const amount = parseFloat(cashOutAmount);
      if (isNaN(amount) || amount < 0) {
         setCashOutError(t('invalidAmount'));
         return;
      }

      try {
         setIsProcessing(true);
         const result = await gameService.cashOut(
            selectedPlayer,
            amount.toString()
         );

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: `${t('playerCashedOut')} - ${t('profit')}: ₪${result.profit}`,
         });

         setShowCashOutModal(false);
         setSelectedPlayer(null);
         setCashOutAmount('');
         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error
               ? error.message
               : 'Failed to process cash out';
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: errorMessage,
         });
      } finally {
         setIsProcessing(false);
      }
   };

   const handleAddPlayer = async (member: LeagueMember) => {
      if (!game || !gameService) return;

      try {
         setIsProcessing(true);
         await gameService.addPlayer(member, game.buyIn);

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('playerAdded'),
         });
         setShowAddPlayerModal(false);
         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to add player';
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: errorMessage,
         });
      } finally {
         setIsProcessing(false);
      }
   };

   const handleRemovePlayer = (player: GamePlayer) => {
      Toast.show({
         type: 'info',
         text1: t('confirmRemovePlayer'),
         text2: t('removePlayerMessage'),
      });
      setTimeout(() => removePlayer(player), 1500);
   };

   const removePlayer = async (player: GamePlayer) => {
      if (!gameService) return;

      try {
         setIsProcessing(true);
         await gameService.removePlayer(player);

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('playerRemoved'),
         });
         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to remove player';
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: errorMessage,
         });
      } finally {
         setIsProcessing(false);
      }
   };

   const openAddPlayerModal = () => {
      loadAvailableMembers();
      setShowAddPlayerModal(true);
   };

   const handleEndGame = async () => {
      if (!game || !gameService) return;

      try {
         const activePlayers = game.players.filter((player) => player.isActive);

         if (activePlayers.length > 0) {
            const activePlayerNames = activePlayers
               .map((p) => p.fullName)
               .join(', ');
            Toast.show({
               type: 'error',
               text1: t('cannotEndGame'),
               text2: `${t('playersStillActive')}: ${activePlayerNames}`,
            });
            return;
         }

         setIsProcessing(true);
         await gameService.endGame();

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('gameEndedSuccessfully'),
         });

         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to end game';
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: errorMessage,
         });
      } finally {
         setIsProcessing(false);
      }
   };

   const renderPlayerCard = ({ item }: { item: GamePlayer }) => (
      <PlayerCard
         player={item}
         gameBaseAmount={game?.buyIn || '0'}
         isProcessing={isProcessing}
         onBuyIn={handleBuyIn}
         onCashOut={handleCashOut}
         onRemovePlayer={handleRemovePlayer}
      />
   );

   if (isLoading) {
      return <LoadingState />;
   }

   if (error || !game) {
      return (
         <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View
               className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-6 border-black shadow-lg elevation-12"
               style={{ backgroundColor: colors.primary }}
            >
               <TouchableOpacity onPress={handleBack} className="p-2">
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={24}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
               <Text
                  className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: colors.textInverse }}
               >
                  {t('gameDetails')}
               </Text>
               <View className="w-10" />
            </View>

            <View className="flex-1 justify-center items-center px-10 py-15">
               <Text
                  variant="h3"
                  color={theme.error}
                  className="text-center mb-3"
               >
                  {t('error')}
               </Text>
               <Text
                  variant="body"
                  color={theme.textMuted}
                  className="text-center mb-6"
               >
                  {error || t('gameNotFound')}
               </Text>
               <Button
                  title={t('retry')}
                  onPress={loadGameData}
                  variant="outline"
                  size="small"
               />
            </View>
         </View>
      );
   }

   return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
         {/* Header */}
         <View
            className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-6 border-black shadow-lg elevation-12"
            style={{ backgroundColor: colors.primary }}
         >
            <TouchableOpacity onPress={handleBack} className="p-2">
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={colors.textInverse}
               />
            </TouchableOpacity>
            <Text
               className="text-xl font-bold uppercase tracking-wide"
               style={{ color: colors.textInverse }}
            >
               {t('gameDetails')}
            </Text>
            <View className="flex-row items-center gap-2">
               <TouchableOpacity onPress={handleRefresh} className="p-2">
                  <Ionicons
                     name="refresh"
                     size={24}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
               {game?.status === 'active' && (
                  <TouchableOpacity
                     onPress={handleEndGame}
                     className="p-2 rounded-lg border-2 border-gray-600"
                     style={{ backgroundColor: colors.error }}
                  >
                     <Ionicons
                        name="stop-circle"
                        size={24}
                        color={colors.textInverse}
                     />
                  </TouchableOpacity>
               )}
            </View>
         </View>

         {/* Game Summary */}
         <GameSummary game={game} />

         {/* Players List */}
         <FlatList
            data={game.players}
            renderItem={renderPlayerCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ItemSeparatorComponent={() => <View className="h-3" />}
         />

         {/* Add Player Button */}
         <TouchableOpacity
            className="absolute bottom-5 right-5 flex-row items-center px-4 py-3 rounded-3xl border-3 border-black shadow-lg elevation-8"
            style={{ backgroundColor: colors.primary }}
            onPress={openAddPlayerModal}
            disabled={isProcessing}
         >
            <Ionicons name="person-add" size={24} color={colors.textInverse} />
            <Text
               variant="labelSmall"
               color={colors.textInverse}
               className="ml-2 font-bold tracking-wide"
            >
               {t('addPlayer')}
            </Text>
         </TouchableOpacity>

         {/* Cash Out Modal */}
         <CashOutModal
            visible={showCashOutModal}
            selectedPlayer={selectedPlayer}
            cashOutAmount={cashOutAmount}
            isProcessing={isProcessing}
            errorMessage={cashOutError}
            onClose={() => setShowCashOutModal(false)}
            onCashOutAmountChange={handleCashOutAmountChange}
            onConfirm={processCashOut}
         />

         {/* Add Player Modal */}
         <AddPlayerModal
            visible={showAddPlayerModal}
            availableMembers={availableMembers}
            isProcessing={isProcessing}
            onClose={() => setShowAddPlayerModal(false)}
            onAddPlayer={handleAddPlayer}
         />
      </View>
   );
}
