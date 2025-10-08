/**
 * Select Players Screen - Modern Dark Theme Design
 * Features glass-morphism effects, deep purple gradients, and smooth animations
 */

import { GameSetupModal } from '@/components/modals';
import { Text } from '@/components/Text';
import { PlayerGrid } from '@/components/ui';
import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { useGameCreation, useLeagueMembers, usePlayerSelection } from '@/hooks';
import useMixpanel from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

export default function SelectPlayers() {
   const { t } = useLocalization();
   const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
   const { track, trackScreenView, trackGameEvent } = useMixpanel();

   // Custom hooks for clean separation of concerns
   const { league, isLoading, error, refetch } = useLeagueMembers(leagueId!);
   const {
      selectedPlayerIds,
      selectedCount,
      togglePlayerSelection,
      clearSelection,
   } = usePlayerSelection(leagueId!);

   const {
      showGameSetup,
      buyIn,
      isCreatingGame,
      availableBuyIns,
      setBuyIn,
      handleStartGame,
      handleCreateGame,
      handleCancelGameSetup,
   } = useGameCreation({
      leagueId: leagueId!,
      selectedPlayerIds,
      selectedCount,
   });

   const handleBack = () => {
      if (selectedCount > 0) {
         clearSelection();
      }
      router.back();
   };

   const selectedPlayers = React.useMemo(() => {
      return (
         league?.members.filter((member) =>
            selectedPlayerIds.includes(member.id)
         ) || []
      );
   }, [league?.members, selectedPlayerIds]);

   // Track screen view
   React.useEffect(() => {
      trackScreenView('Select Players', {
         league_id: leagueId,
         available_players: league?.members?.length || 0,
      });
   }, [league, leagueId, trackScreenView]);

   // Track player selection changes
   React.useEffect(() => {
      if (selectedCount > 0) {
         track('players_selected', {
            league_id: leagueId,
            selected_count: selectedCount,
            player_ids: selectedPlayerIds,
         });
      }
   }, [selectedCount, selectedPlayerIds, leagueId, track]);

   // Modern loading state with gradient background
   if (isLoading) {
      return (
         <LinearGradient
            colors={['#1a0033', '#0f001a', '#000000']}
            style={{ flex: 1 }}
         >
            <View
               className="flex-row items-center justify-between px-5 pt-16 pb-4"
               style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
               }}
            >
               <TouchableOpacity
                  onPress={handleBack}
                  className="p-2"
                  accessibilityLabel={t('goBack')}
                  accessibilityRole="button"
               >
                  <Ionicons
                     name="arrow-back"
                     size={24}
                     color="rgba(255, 255, 255, 0.9)"
                  />
               </TouchableOpacity>
               <Text
                  variant="h3"
                  color="rgba(255, 255, 255, 0.9)"
                  className="text-center font-medium"
               >
                  {t('selectPlayers')}
               </Text>
               <View className="w-10" />
            </View>

            {/* Modern Loading Animation */}
            <View className="flex-1 justify-center items-center px-8">
               <View
                  className="rounded-2xl p-8 items-center"
                  style={{
                     backgroundColor: 'rgba(255, 255, 255, 0.1)',
                     backdropFilter: 'blur(20px)',
                  }}
               >
                  <View className="mb-6">
                     <Animated.View
                        className="w-16 h-16 rounded-full"
                        style={{
                           backgroundColor: 'rgba(138, 43, 226, 0.3)',
                           borderWidth: 2,
                           borderColor: '#60A5FA',
                        }}
                     />
                  </View>
                  <Text
                     variant="body"
                     color="rgba(255, 255, 255, 0.8)"
                     className="text-center font-medium"
                  >
                     {t('loadingPlayers')}
                  </Text>
               </View>
            </View>
         </LinearGradient>
      );
   }

   // Modern error state with gradient background
   if (error) {
      return (
         <LinearGradient
            colors={['#1a0033', '#0f001a', '#000000']}
            style={{ flex: 1 }}
         >
            <View
               className="flex-row items-center justify-between px-5 pt-16 pb-4"
               style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
               }}
            >
               <TouchableOpacity
                  onPress={handleBack}
                  className="p-2"
                  accessibilityLabel={t('goBack')}
                  accessibilityRole="button"
               >
                  <Ionicons
                     name="arrow-back"
                     size={24}
                     color="rgba(255, 255, 255, 0.9)"
                  />
               </TouchableOpacity>
               <Text
                  variant="h3"
                  color="rgba(255, 255, 255, 0.9)"
                  className="text-center font-medium"
               >
                  {t('selectPlayers')}
               </Text>
               <View className="w-10" />
            </View>

            <View className="flex-1 justify-center items-center px-8">
               <View
                  className="rounded-2xl p-8 items-center"
                  style={{
                     backgroundColor: 'rgba(255, 255, 255, 0.1)',
                     backdropFilter: 'blur(20px)',
                  }}
               >
                  <View className="mb-6">
                     <Ionicons
                        name="warning-outline"
                        size={48}
                        color="#EF4444"
                     />
                  </View>
                  <Text
                     variant="h3"
                     color="rgba(255, 255, 255, 0.9)"
                     className="text-center mb-3 font-medium"
                  >
                     {t('errorLoadingPlayers')}
                  </Text>
                  <Text
                     variant="body"
                     color="rgba(255, 255, 255, 0.7)"
                     className="text-center mb-6 leading-6"
                  >
                     {error}
                  </Text>
                  <TouchableOpacity
                     onPress={refetch}
                     className="px-6 py-3 rounded-xl"
                     style={{
                        backgroundColor: 'rgba(138, 43, 226, 0.8)',
                     }}
                     accessibilityLabel={t('tryAgain')}
                     accessibilityRole="button"
                  >
                     <Text
                        variant="button"
                        color="rgba(255, 255, 255, 0.9)"
                        className="font-medium"
                     >
                        {t('tryAgain')}
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </LinearGradient>
      );
   }

   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={{ flex: 1 }}
      >
         {/* Modern Header with Glass-morphism */}
         <View
            className="flex-row items-center justify-between px-5 pt-16 pb-4"
            style={{
               backgroundColor: 'rgba(255, 255, 255, 0.1)',
               backdropFilter: 'blur(20px)',
            }}
         >
            <TouchableOpacity
               onPress={handleBack}
               className="p-2"
               accessibilityLabel={t('goBack')}
               accessibilityRole="button"
            >
               <Ionicons
                  name="arrow-back"
                  size={24}
                  color="rgba(255, 255, 255, 0.9)"
               />
            </TouchableOpacity>
            <Text
               variant="h3"
               color="rgba(255, 255, 255, 0.9)"
               className="text-center font-medium"
            >
               {t('selectPlayers')}
            </Text>
            <View className="w-10" />
         </View>

         {/* Modern League Info Header with Glass Effect */}
         {league && (
            <View
               className="mx-5 mt-4 mb-2 p-5 rounded-2xl"
               style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
               }}
               accessibilityRole="text"
               accessibilityLabel={`${league.name}. ${t('selectPlayersToStartGame')}`}
            >
               <Text
                  variant="h3"
                  color="rgba(255, 255, 255, 0.9)"
                  className="font-semibold mb-2"
               >
                  {league.name}
               </Text>
               <Text
                  variant="body"
                  color="rgba(255, 255, 255, 0.7)"
                  className="font-medium"
               >
                  {t('selectPlayersToStartGame')}
               </Text>
            </View>
         )}

         {/* Modern Selection Summary with Glass-morphism */}
         {selectedCount > 0 && (
            <View
               className="mx-5 mb-4 px-5 py-4 rounded-2xl"
               style={{
                  backgroundColor: 'rgba(138, 43, 226, 0.2)',
                  backdropFilter: 'blur(20px)',
                  borderWidth: 1,
                  borderColor: 'rgba(138, 43, 226, 0.3)',
               }}
               accessibilityRole="text"
               accessibilityLabel={`${selectedCount} ${selectedCount === 1 ? t('playerSelected') : t('playersSelected')}`}
            >
               <Text
                  variant="h4"
                  color="rgba(255, 255, 255, 0.9)"
                  className="text-center font-semibold"
               >
                  {selectedCount}{' '}
                  {selectedCount === 1
                     ? t('playerSelected')
                     : t('playersSelected')}
               </Text>
            </View>
         )}

         {/* Player Grid */}
         <PlayerGrid
            members={league?.members || []}
            selectedPlayerIds={selectedPlayerIds}
            onPlayerToggle={togglePlayerSelection}
            variant="grid"
            numColumns={3}
            loading={isLoading}
            error={error}
            theme="dark"
         />

         {/* Modern Start Game Button */}
         {selectedCount > 0 && (
            <View className="absolute bottom-0 left-0 right-0 p-6 pb-10">
               <AppButton
                  title={t('startGame')}
                  onPress={handleStartGame}
                  variant="gradient"
                  color="success"
                  size="large"
                  icon="play-circle-outline"
               />
            </View>
         )}

         {/* Game Setup Modal */}
         <GameSetupModal
            visible={showGameSetup}
            selectedPlayers={selectedPlayers}
            buyIn={buyIn}
            isCreatingGame={isCreatingGame}
            availableBuyIns={availableBuyIns}
            onClose={handleCancelGameSetup}
            onCreateGame={handleCreateGame}
            onBuyInChange={setBuyIn}
            leagueName={league?.name}
            theme="dark"
         />
      </LinearGradient>
   );
}
