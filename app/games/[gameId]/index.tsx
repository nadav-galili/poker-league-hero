import { colors } from '@/colors';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/Text';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import AddPlayerModal from '@/components/game/AddPlayerModal';
import CashOutModal from '@/components/game/CashOutModal';
import EditPlayerModal from '@/components/game/EditPlayerModal';
import GameEventsList from '@/components/game/GameEventsList';
import GameSummary from '@/components/game/GameSummary';
import PlayerCard from '@/components/game/PlayerCard';
import { ConfirmationModal } from '@/components/modals';
import { CyberpunkButton } from '@/components/ui/CyberpunkButton';
import { BASE_URL } from '@/constants';
import { GamePlayer, LeagueMember, useGameData } from '@/hooks/useGameData';
import { createGameService } from '@/services/gameService';
import { useMutation } from '@tanstack/react-query';

type getSummaryListResponse = {
   summary: string;
};

export default function GameScreen() {
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
   }, [gameId, trackScreenView]);

   // Check if user is admin of the league or game manager
   React.useEffect(() => {
      const checkPermissions = async () => {
         if (!game || !user?.userId) {
            setIsAdmin(false);
            setIsGameManager(false);
            return;
         }

         // Check if user is the game creator
         const gameCreatorId =
            typeof game.createdBy === 'string'
               ? parseInt(game.createdBy)
               : game.createdBy;
         setIsGameManager(gameCreatorId === user.userId);

         // Check if user is league admin
         try {
            const response = await fetchWithAuth(
               `${BASE_URL}/api/leagues/${game.leagueId}`,
               {}
            );

            if (response.ok) {
               const data = await response.json();
               const currentUserMember = data.league?.members?.find(
                  (member: LeagueMember) => parseInt(member.id) === user.userId
               );
               setIsAdmin(currentUserMember?.role === 'admin');
            }
         } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
         }
      };

      checkPermissions();
   }, [game, user?.userId, fetchWithAuth]);

   // Modal states
   const [showCashOutModal, setShowCashOutModal] = React.useState(false);
   const [showAddPlayerModal, setShowAddPlayerModal] = React.useState(false);
   const [showEditPlayerModal, setShowEditPlayerModal] = React.useState(false);
   const [showHistory, setShowHistory] = React.useState(false);
   const [showEndGameConfirmation, setShowEndGameConfirmation] =
      React.useState(false);
   const [showRemovePlayerConfirmation, setShowRemovePlayerConfirmation] =
      React.useState(false);
   const [playerToRemove, setPlayerToRemove] =
      React.useState<GamePlayer | null>(null);
   const [selectedPlayer, setSelectedPlayer] =
      React.useState<GamePlayer | null>(null);
   const [cashOutAmount, setCashOutAmount] = React.useState('');
   const [cashOutError, setCashOutError] = React.useState<string>('');
   const [editBuyInAmount, setEditBuyInAmount] = React.useState('');
   const [editCashOutAmount, setEditCashOutAmount] = React.useState('');
   const [editPlayerError, setEditPlayerError] = React.useState<string>('');
   const [isProcessing, setIsProcessing] = React.useState(false);
   const [isAdmin, setIsAdmin] = React.useState(false);
   const [isGameManager, setIsGameManager] = React.useState(false);

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
            text2: `${t('buyInSuccessful')}  ${player.fullName} - ${t('currency')}${game.buyIn}`,
         });
         loadGameData(true);
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
            text2: ` ${selectedPlayer.fullName} ${t('playerCashedOut')} - ${t('profit')}: ₪${result.profit}`,
         });

         setShowCashOutModal(false);
         setSelectedPlayer(null);
         setCashOutAmount('');
         loadGameData(true);
      } catch (error) {
         const errorMessage =
            error instanceof Error
               ? error.message
               : 'Failed to process cash out';
         trackError(error as Error, 'game_screen_cash_out');
         setCashOutError(errorMessage);
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
         loadGameData(true);
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

   const handleUndoBuyIn = async (player: GamePlayer) => {
      if (!game || !gameService) return;

      try {
         setIsProcessing(true);
         await gameService.undoBuyIn(player);

         trackGameEvent('game_buy_in_undone', gameId || '', game.leagueId, {
            player_id: player.id,
            player_name: player.fullName,
         });

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('buyInUndone'),
         });
         loadGameData(true);
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : 'Failed to undo buy-in';
         trackError(error as Error, 'game_screen_undo_buy_in');
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
      setPlayerToRemove(player);
      setShowRemovePlayerConfirmation(true);
   };

   const confirmRemovePlayer = async () => {
      if (!gameService || !game || !playerToRemove) return;

      try {
         setIsProcessing(true);
         await gameService.removePlayer(playerToRemove);

         trackGameEvent('game_player_removed', gameId || '', game.leagueId, {
            player_id: playerToRemove.id,
            player_name: playerToRemove.fullName,
         });

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('playerRemoved'),
         });
         loadGameData(true);
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
         setShowRemovePlayerConfirmation(false);
         setPlayerToRemove(null);
      }
   };

   const openAddPlayerModal = () => {
      loadAvailableMembers();
      setShowAddPlayerModal(true);
   };

   const handleEditPlayer = (player: GamePlayer) => {
      setSelectedPlayer(player);
      setEditBuyInAmount(player.totalBuyIns.toString());
      setEditCashOutAmount(player.totalBuyOuts.toString());
      setEditPlayerError('');
      setShowEditPlayerModal(true);
   };

   const handleEditBuyInAmountChange = (amount: string) => {
      setEditBuyInAmount(amount);
      if (editPlayerError) {
         setEditPlayerError('');
      }
   };

   const handleEditCashOutAmountChange = (amount: string) => {
      setEditCashOutAmount(amount);
      if (editPlayerError) {
         setEditPlayerError('');
      }
   };

   const processEditPlayer = async () => {
      setEditPlayerError('');

      if (
         !selectedPlayer ||
         !editBuyInAmount.trim() ||
         !editCashOutAmount.trim() ||
         !gameService
      ) {
         setEditPlayerError(t('invalidAmount'));
         return;
      }

      const buyIn = parseFloat(editBuyInAmount);
      const cashOut = parseFloat(editCashOutAmount);

      if (isNaN(buyIn) || buyIn < 0 || isNaN(cashOut) || cashOut < 0) {
         setEditPlayerError(t('invalidAmount'));
         return;
      }

      try {
         setIsProcessing(true);
         const result = await gameService.editPlayerAmounts(
            selectedPlayer,
            buyIn.toString(),
            cashOut.toString()
         );

         trackGameEvent(
            'game_player_amounts_edited',
            gameId || '',
            game?.leagueId || '',
            {
               player_id: selectedPlayer.id,
               player_name: selectedPlayer.fullName,
               new_buy_in: buyIn,
               new_cash_out: cashOut,
               new_profit: result.profit,
            }
         );

         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: t('playerAmountsUpdated'),
         });

         setShowEditPlayerModal(false);
         setSelectedPlayer(null);
         setEditBuyInAmount('');
         setEditCashOutAmount('');
         loadGameData(true);
      } catch (error) {
         const errorMessage =
            error instanceof Error
               ? error.message
               : t('failedToUpdatePlayerAmounts');
         trackError(error as Error, 'game_screen_edit_player');
         setEditPlayerError(errorMessage);
      } finally {
         setIsProcessing(false);
      }
   };

   const handleEndGame = () => {
      const activePlayers = game?.players.filter((player) => player.isActive);

      if (activePlayers && activePlayers.length > 0) {
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

      // Show confirmation modal
      setShowEndGameConfirmation(true);
   };

   const toggleHistory = () => {
      const newState = !showHistory;
      setShowHistory(newState);
      trackGameEvent(
         newState ? 'game_history_expanded' : 'game_history_collapsed',
         gameId || '',
         game?.leagueId || ''
      );
   };

   const confirmEndGame = async () => {
      if (!game || !gameService) return;

      try {
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
         await loadGameData(true);
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
         setShowEndGameConfirmation(false);
      }
   };

   // Check if all players are cashed out
   const allPlayersCashedOut =
      game?.players && game.players.length > 0
         ? game.players.every((player) => !player.isActive)
         : false;

   const renderPlayerCard = ({ item }: { item: GamePlayer }) => (
      <PlayerCard
         player={item}
         gameBaseAmount={game?.buyIn || '0'}
         isProcessing={isProcessing}
         isAdmin={isAdmin || isGameManager}
         onBuyIn={handleBuyIn}
         onCashOut={handleCashOut}
         onRemovePlayer={handleRemovePlayer}
         onUndoBuyIn={handleUndoBuyIn}
         onEditPlayer={handleEditPlayer}
      />
   );

   if (isLoading) {
      return <LoadingState />;
   }

   if (error || !game) {
      return (
         <View
            className="flex-1"
            style={{ backgroundColor: colors.cyberBackground }}
         >
            {/* Cyberpunk Error Header */}
            <LinearGradient
               colors={[
                  colors.cyberBackground,
                  colors.errorGradientStart,
                  colors.cyberBackground,
               ]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.errorHeaderGradient}
            >
               <View style={styles.cornerTopLeft} />
               <View style={styles.cornerTopRight} />

               <View className="flex-row items-center justify-between px-5 pt-15 pb-4">
                  <TouchableOpacity
                     onPress={handleBack}
                     style={styles.cyberpunkButton}
                  >
                     <LinearGradient
                        colors={[colors.neonBlue, colors.neonCyan]}
                        style={styles.buttonGradient}
                     >
                        <Ionicons
                           name={isRTL ? 'arrow-forward' : 'arrow-back'}
                           size={20}
                           color={colors.neonBlue}
                        />
                     </LinearGradient>
                     <View
                        style={[
                           styles.buttonGlow,
                           { shadowColor: colors.neonBlue },
                        ]}
                     />
                  </TouchableOpacity>

                  <View style={styles.titleContainer}>
                     <Text
                        className="text-lg font-mono font-bold uppercase tracking-widest"
                        style={{
                           color: colors.errorGradientEnd,
                           textShadowColor: colors.errorGradientStart,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 10,
                        }}
                     >
                        {t('gameDetails')}
                     </Text>
                     <View
                        style={[
                           styles.scanLine,
                           { backgroundColor: colors.errorGradientEnd },
                        ]}
                     />
                  </View>

                  <View className="w-10" />
               </View>

               <View
                  style={[
                     styles.headerBorder,
                     { backgroundColor: colors.errorGradientEnd },
                  ]}
               />
            </LinearGradient>

            {/* Cyberpunk Error Content */}
            <View className="flex-1 justify-center items-center px-10 py-15">
               <View style={styles.errorContainer}>
                  {/* Error icon with glitch effect */}
                  <View style={styles.errorIcon}>
                     <Ionicons
                        name="warning-outline"
                        size={64}
                        color={colors.errorGradientEnd}
                        style={{
                           textShadowColor: colors.errorGradientStart,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 15,
                        }}
                     />
                  </View>

                  <Text
                     className="text-2xl font-mono font-bold uppercase tracking-widest text-center mb-4"
                     style={{
                        color: colors.errorGradientEnd,
                        textShadowColor: colors.errorGradientStart,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                     }}
                  >
                     {'>>> ' + t('error') + ' <<<'}
                  </Text>

                  <View style={styles.errorMessage}>
                     <Text
                        className="text-sm font-mono text-center mb-6 leading-5"
                        style={{ color: colors.textMuted }}
                     >
                        {error || t('gameNotFound')}
                     </Text>
                  </View>

                  {/* Cyberpunk retry button */}
                  <CyberpunkButton
                     title={t('retry')}
                     onPress={loadGameData}
                     variant="secondary"
                     size="medium"
                     width="60%"
                     icon="refresh"
                  />
               </View>
            </View>
         </View>
      );
   }

   return (
      <View
         className="flex-1"
         style={{ backgroundColor: colors.cyberBackground }}
      >
         {/* Cyberpunk Header */}
         <LinearGradient
            colors={[
               colors.cyberBackground,
               colors.cyberDarkBlue,
               colors.cyberBackground,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
         >
            {/* Corner brackets */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />

            <View className="flex-row items-center justify-between px-5 pt-15 pb-4">
               {/* Back button with cyberpunk styling */}
               <TouchableOpacity
                  onPress={handleBack}
                  style={styles.cyberpunkButton}
               >
                  <LinearGradient
                     colors={[colors.neonBlue, colors.neonCyan]}
                     style={styles.buttonGradient}
                  >
                     <Ionicons
                        name={isRTL ? 'arrow-forward' : 'arrow-back'}
                        size={20}
                        color={colors.neonCyan}
                     />
                  </LinearGradient>
                  {/* Button glow */}
                  <View
                     style={[
                        styles.buttonGlow,
                        { shadowColor: colors.neonBlue },
                     ]}
                  />
               </TouchableOpacity>

               {/* Title with cyberpunk styling */}
               <View style={styles.titleContainer}>
                  <Text
                     className="text-lg font-mono font-bold uppercase tracking-widest"
                     style={{
                        color: colors.neonCyan,
                        textShadowColor: colors.shadowNeonCyan,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 10,
                     }}
                  >
                     {t('gameDetails')}
                  </Text>
                  {/* Scan lines */}
                  <View style={styles.scanLine} />
               </View>

               {/* Action buttons */}
               <View className="flex-row items-center gap-3">
                  {/* Refresh button */}
                  <TouchableOpacity
                     onPress={handleRefresh}
                     style={styles.cyberpunkButton}
                  >
                     <LinearGradient
                        colors={[colors.neonBlue, colors.neonCyan]}
                        style={styles.buttonGradient}
                     >
                        <Ionicons
                           name="refresh"
                           size={20}
                           color={colors.neonCyan}
                        />
                     </LinearGradient>
                     <View
                        style={[
                           styles.buttonGlow,
                           { shadowColor: colors.neonBlue },
                        ]}
                     />
                  </TouchableOpacity>

                  {/* End game button */}
                  {game?.status === 'active' && (
                     <TouchableOpacity
                        onPress={handleEndGame}
                        style={styles.endGameButton}
                     >
                        <LinearGradient
                           colors={[
                              colors.errorGradientStart,
                              colors.errorGradientEnd,
                           ]}
                           style={styles.endGameGradient}
                        >
                           <Ionicons
                              name="stop-circle"
                              size={20}
                              color={colors.neonCyan}
                           />

                           {allPlayersCashedOut && (
                              <Text
                                 className="text-xs font-mono font-bold uppercase tracking-wide"
                                 style={{ color: colors.neonCyan }}
                              >
                                 {t('endGame')}
                              </Text>
                           )}
                        </LinearGradient>
                        <View
                           style={[
                              styles.buttonGlow,
                              { shadowColor: colors.errorGradientEnd },
                           ]}
                        />
                     </TouchableOpacity>
                  )}
               </View>
            </View>

            {/* Bottom border with cyber effect */}
            <View style={styles.headerBorder} />
         </LinearGradient>
         {/* Game Summary */}
         <GameSummary game={game} />
         <View className="px-4 pb-2 items-center my-4">
            <CyberpunkButton
               title={t('addPlayer')}
               onPress={openAddPlayerModal}
               variant="join"
               size="medium"
               disabled={isProcessing}
               width="60%"
               icon="person-add"
            />
         </View>
         {/* Cyberpunk Game Events History */}
         <View className="px-4 mb-2">
            <TouchableOpacity
               onPress={toggleHistory}
               style={styles.historyButton}
            >
               <LinearGradient
                  colors={[
                     colors.cyberDarkBlue,
                     colors.cyberBackground,
                     colors.cyberDarkBlue,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.historyGradient}
               >
                  {/* Corner brackets for history section */}
                  <View style={styles.historyCornerTL} />
                  <View style={styles.historyCornerTR} />
                  <View style={styles.historyCornerBL} />
                  <View style={styles.historyCornerBR} />

                  <View className="flex-row items-center justify-between p-3">
                     <Text
                        className="font-mono font-bold uppercase tracking-wider"
                        style={{
                           color: colors.neonCyan,
                           textShadowColor: colors.shadowNeonCyan,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 8,
                        }}
                     >
                        {t('gameHistory')}
                     </Text>
                     <View className="flex-row items-center gap-3">
                        <Text
                           className="text-xs font-mono uppercase tracking-wide"
                           style={{ color: colors.textMuted }}
                        >
                           {showHistory ? t('hideHistory') : t('showHistory')}
                        </Text>
                        <View style={styles.chevronContainer}>
                           <Ionicons
                              name={showHistory ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color={colors.neonBlue}
                           />
                        </View>
                     </View>
                  </View>

                  {/* Scan line effect */}
                  <View style={styles.historyScanLine} />
               </LinearGradient>
            </TouchableOpacity>

            {showHistory && (
               <View style={styles.historyContent}>
                  <GameEventsList players={game?.players || []} />
               </View>
            )}
         </View>
         {/* Add Player Modal */}
         <AddPlayerModal
            visible={showAddPlayerModal}
            availableMembers={availableMembers}
            isProcessing={isProcessing}
            onClose={() => setShowAddPlayerModal(false)}
            onAddPlayer={handleAddPlayer}
         />
         {/* Cyberpunk Players List */}
         <View style={styles.playersContainer}>
            {/* Players list header */}
            <View style={styles.playersHeader}>
               <Text
                  className="font-mono font-bold uppercase tracking-widest text-center"
                  style={{
                     color: colors.neonBlue,
                     textShadowColor: colors.shadowNeonCyan,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 8,
                  }}
               >
                  {t('activePlayersLabel')}
               </Text>
               <View style={styles.playersHeaderLine} />
            </View>

            <FlatList
               data={game.players}
               renderItem={renderPlayerCard}
               keyExtractor={(item) => item.id}
               contentContainerStyle={{ padding: 16, paddingTop: 8 }}
               showsVerticalScrollIndicator={false}
               refreshing={refreshing}
               onRefresh={handleRefresh}
               ItemSeparatorComponent={() => <View className="h-3" />}
            />
         </View>
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
         {/* End Game Confirmation Modal */}
         <ConfirmationModal
            visible={showEndGameConfirmation}
            title={t('endGameConfirmationTitle')}
            message={t('endGameConfirmationMessage')}
            onConfirm={confirmEndGame}
            onCancel={() => setShowEndGameConfirmation(false)}
            isProcessing={isProcessing}
         />
         {/* Remove Player Confirmation Modal */}
         <ConfirmationModal
            visible={showRemovePlayerConfirmation}
            title={t('confirmRemovePlayer')}
            message={t('removePlayerMessage')}
            onConfirm={confirmRemovePlayer}
            onCancel={() => {
               setShowRemovePlayerConfirmation(false);
               setPlayerToRemove(null);
            }}
            isProcessing={isProcessing}
         />
         {/* Edit Player Modal */}
         <EditPlayerModal
            visible={showEditPlayerModal}
            selectedPlayer={selectedPlayer}
            buyInAmount={editBuyInAmount}
            cashOutAmount={editCashOutAmount}
            isProcessing={isProcessing}
            errorMessage={editPlayerError}
            onClose={() => {
               setShowEditPlayerModal(false);
               setSelectedPlayer(null);
               setEditBuyInAmount('');
               setEditCashOutAmount('');
               setEditPlayerError('');
            }}
            onBuyInAmountChange={handleEditBuyInAmountChange}
            onCashOutAmountChange={handleEditCashOutAmountChange}
            onConfirm={processEditPlayer}
         />
      </View>
   );
}

// Cyberpunk StyleSheet
const styles = StyleSheet.create({
   // Header styles
   headerGradient: {
      borderBottomWidth: 2,
      borderBottomColor: colors.neonBlue,
      position: 'relative',
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 12,
   },
   cornerTopLeft: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 20,
      height: 3,
      backgroundColor: colors.neonCyan,
   },
   cornerTopRight: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 20,
      height: 3,
      backgroundColor: colors.neonCyan,
   },
   titleContainer: {
      alignItems: 'center',
      position: 'relative',
   },
   scanLine: {
      position: 'absolute',
      bottom: -2,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.neonCyan,
      opacity: 0.7,
   },
   cyberpunkButton: {
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
   },
   buttonGradient: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.neonCyan,
   },
   buttonGlow: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
   },
   endGameButton: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
   },
   endGameGradient: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.errorGradientEnd,
   },
   headerBorder: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.neonBlue,
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 6,
   },

   // History section styles
   historyButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.neonBlue,
      marginBottom: 8,
      overflow: 'hidden',
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
   },
   historyGradient: {
      borderRadius: 11,
      position: 'relative',
   },
   historyCornerTL: {
      position: 'absolute',
      top: -1,
      left: -1,
      width: 12,
      height: 2,
      backgroundColor: colors.neonCyan,
   },
   historyCornerTR: {
      position: 'absolute',
      top: -1,
      right: -1,
      width: 12,
      height: 2,
      backgroundColor: colors.neonCyan,
   },
   historyCornerBL: {
      position: 'absolute',
      bottom: -1,
      left: -1,
      width: 12,
      height: 2,
      backgroundColor: colors.neonCyan,
   },
   historyCornerBR: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 12,
      height: 2,
      backgroundColor: colors.neonCyan,
   },
   chevronContainer: {
      borderWidth: 1,
      borderColor: colors.neonBlue,
      borderRadius: 4,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cyberDarkBlue,
   },
   historyScanLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.neonBlue,
      opacity: 0.6,
   },
   historyContent: {
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderColor: colors.neonBlue,
      borderTopWidth: 0,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      backgroundColor: colors.cyberBackground,
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
   },

   // Players section styles
   playersContainer: {
      flex: 1,
      backgroundColor: colors.cyberBackground,
   },
   playersHeader: {
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.neonBlue,
      backgroundColor: colors.cyberDarkBlue,
   },
   playersHeaderLine: {
      width: 120,
      height: 1,
      backgroundColor: colors.neonCyan,
      marginTop: 4,
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
   },

   // Error state styles
   errorHeaderGradient: {
      borderBottomWidth: 2,
      borderBottomColor: colors.errorGradientEnd,
      position: 'relative',
      shadowColor: colors.errorGradientStart,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 12,
   },
   errorContainer: {
      alignItems: 'center',
      backgroundColor: colors.cyberDarkBlue,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.errorGradientEnd,
      padding: 24,
      shadowColor: colors.errorGradientStart,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
   },
   errorIcon: {
      marginBottom: 16,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: colors.errorGradientEnd,
      padding: 16,
      backgroundColor: colors.cyberBackground,
   },
   errorMessage: {
      borderLeftWidth: 2,
      borderLeftColor: colors.errorGradientEnd,
      paddingLeft: 12,
   },
});
