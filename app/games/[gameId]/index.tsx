import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/Text';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import useMixpanel from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import AddPlayerModal from '@/components/game/AddPlayerModal';
import CashOutModal from '@/components/game/CashOutModal';
import GameSummary from '@/components/game/GameSummary';
import PlayerCard from '@/components/game/PlayerCard';
import { AppButton } from '@/components/ui/AppButton';
import { BASE_URL } from '@/constants';
import { GamePlayer, LeagueMember, useGameData } from '@/hooks/useGameData';
import { createGameService } from '@/services/gameService';
import { useMutation } from '@tanstack/react-query';

type getSummaryListResponse = {
   summary: string;
};

export default function GameScreen() {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();
   const { fetchWithAuth, user } = useAuth();
   const { gameId } = useLocalSearchParams<{ gameId: string }>();
   const { trackScreenView, trackGameEvent, trackError } = useMixpanel();

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

   React.useEffect(() => {
      if (gameId) {
         trackScreenView('game_details', { game_id: gameId });
      }
   }, [gameId]);

   // Modal states
   const [showCashOutModal, setShowCashOutModal] = React.useState(false);
   const [showAddPlayerModal, setShowAddPlayerModal] = React.useState(false);
   const [selectedPlayer, setSelectedPlayer] =
      React.useState<GamePlayer | null>(null);
   const [cashOutAmount, setCashOutAmount] = React.useState('');
   const [cashOutError, setCashOutError] = React.useState<string>('');
   const [isProcessing, setIsProcessing] = React.useState(false);

   const createAiSummaryMutation = useMutation<getSummaryListResponse, Error>({
      mutationFn: async () => {
         const response = await fetchWithAuth(
            `${BASE_URL}/api/leagues/${game?.leagueId}/ai-summary`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ createSummary: true }),
            }
         );

         return response.json();
      },
   });
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

         trackGameEvent('game_buy_in', gameId || '', game.leagueId, {
            player_id: player.id,
            player_name: player.fullName,
            buy_in_amount: game.buyIn,
         });

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: `${t('buyInSuccessful')} for ${player.fullName} - ${t('currency')}${game.buyIn}`,
         });
         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to process buy-in';
         trackError(error as Error, 'game_screen_buy_in');
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

         trackGameEvent('game_cash_out', gameId || '', game?.leagueId || '', {
            player_id: selectedPlayer.id,
            player_name: selectedPlayer.fullName,
            cash_out_amount: amount,
            profit: result.profit,
         });

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
         trackError(error as Error, 'game_screen_cash_out');
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

         trackGameEvent('game_player_added', gameId || '', game.leagueId, {
            member_id: member.id,
            member_name: member.fullName,
            buy_in_amount: game.buyIn,
         });

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
         trackError(error as Error, 'game_screen_add_player');
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
      if (!gameService || !game) return;

      try {
         setIsProcessing(true);
         await gameService.removePlayer(player);

         trackGameEvent('game_player_removed', gameId || '', game.leagueId, {
            player_id: player.id,
            player_name: player.fullName,
         });

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('playerRemoved'),
         });
         loadGameData();
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to remove player';
         trackError(error as Error, 'game_screen_remove_player');
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

         trackGameEvent('game_ended', gameId || '', game.leagueId, {
            total_players: game.players.length,
            total_cash_out: game.players.reduce(
               (sum, player) => sum + Number(player.profit),
               0
            ),
         });

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('gameEndedSuccessfully'),
         });
         createAiSummaryMutation.mutate();
         await loadGameData();
         router.replace({
            pathname: '/leagues/[id]/stats',
            params: { id: game.leagueId },
         });
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to end game';
         trackError(error as Error, 'game_screen_end_game');
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
                     color={colors.text}
                  />
               </TouchableOpacity>
               <Text
                  className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: colors.text }}
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
                  color={colors.text}
               />
            </TouchableOpacity>
            <Text
               className="text-xl font-bold uppercase tracking-wide"
               style={{ color: colors.text }}
            >
               {t('gameDetails')}
            </Text>
            <View className="flex-row items-center gap-2">
               <TouchableOpacity onPress={handleRefresh} className="p-2">
                  <Ionicons name="refresh" size={24} color={colors.text} />
               </TouchableOpacity>
               {game?.status === 'active' && (
                  <TouchableOpacity
                     onPress={handleEndGame}
                     className="p-2 rounded-lg border-2 border-gray-600"
                     style={{ backgroundColor: colors.errorGradientEnd }}
                  >
                     <Ionicons
                        name="stop-circle"
                        size={24}
                        color={colors.text}
                     />
                  </TouchableOpacity>
               )}
            </View>
         </View>

         {/* Game Summary */}
         <GameSummary game={game} />
         <View className="px-4 pb-2 items-center my-4">
            <AppButton
               title={t('addPlayer')}
               onPress={openAddPlayerModal}
               color="info"
               disabled={isProcessing}
               width="50%"
               icon="person-add"
            />
         </View>

         {/* Add Player Modal */}
         <AddPlayerModal
            visible={showAddPlayerModal}
            availableMembers={availableMembers}
            isProcessing={isProcessing}
            onClose={() => setShowAddPlayerModal(false)}
            onAddPlayer={handleAddPlayer}
         />

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
      </View>
   );
}
