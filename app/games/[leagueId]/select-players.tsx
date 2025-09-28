/**
 * Select Players Screen - Refactored with clean architecture
 * Reduced from 873 lines to ~120 lines using extracted components and hooks
 */

import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { GameSetupModal } from '@/components/modals';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/Text';
import { PlayerGrid } from '@/components/ui';
import { useLocalization } from '@/context/localization';
import { useGameCreation, useLeagueMembers, usePlayerSelection } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function SelectPlayers() {
   const theme = getTheme('light');
   const { t } = useLocalization();
   const { leagueId } = useLocalSearchParams<{ leagueId: string }>();

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

   // Loading state
   if (isLoading) {
      return <LoadingState />;
   }

   // Error state
   if (error) {
      return (
         <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View
               className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-[6px]"
               style={{
                  backgroundColor: colors.primary,
                  borderBottomColor: colors.text,
               }}
            >
               <TouchableOpacity onPress={handleBack} className="p-2">
                  <Ionicons
                     name="arrow-back"
                     size={24}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
               <Text
                  variant="h3"
                  color={colors.textInverse}
                  className="tracking-wider uppercase"
               >
                  {t('selectPlayers')}
               </Text>
               <View className="w-10" />
            </View>

            <View className="flex-1 justify-center items-center px-10 py-15">
               <Text
                  variant="h3"
                  color={theme.error}
                  className="text-center mb-3"
               >
                  {t('errorLoadingPlayers')}
               </Text>
               <Text
                  variant="body"
                  color={theme.textMuted}
                  className="text-center mb-6 leading-5"
               >
                  {error}
               </Text>
               <Button
                  title={t('tryAgain')}
                  onPress={refetch}
                  variant="secondary"
                  size="medium"
               />
            </View>
         </View>
      );
   }

   return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
         {/* Header */}
         <View
            className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-[6px]"
            style={{
               backgroundColor: colors.primary,
               borderBottomColor: colors.text,
            }}
         >
            <TouchableOpacity onPress={handleBack} className="p-2">
               <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.textInverse}
               />
            </TouchableOpacity>
            <Text
               variant="h3"
               color={colors.textInverse}
               className="tracking-wider uppercase"
            >
               {t('selectPlayers')}
            </Text>
            <View className="w-10" />
         </View>

         {/* League Info Header */}
         {league && (
            <View
               className="p-4 border-b-2"
               style={{
                  backgroundColor: theme.surfaceElevated,
                  borderBottomColor: colors.border,
               }}
            >
               <Text
                  variant="h3"
                  color={theme.text}
                  className="tracking-wide mb-1"
               >
                  {league.name}
               </Text>
               <Text variant="body" color={theme.textMuted}>
                  {t('Select Players For Game')}
               </Text>
            </View>
         )}

         {/* Selection Summary */}
         {selectedCount > 0 && (
            <View
               className="px-4 py-3 border-b-2"
               style={{
                  backgroundColor: colors.primaryTint,
                  borderBottomColor: colors.primary,
               }}
            >
               <Text
                  variant="h4"
                  color={colors.primary}
                  className="text-center tracking-wide"
               >
                  {selectedCount} {t('playersSelected')}
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
         />

         {/* Start Game Button */}
         {selectedCount > 0 && (
            <View
               className="absolute bottom-0 left-0 right-0 p-4 pb-8 shadow-lg"
               style={{
                  backgroundColor: theme.background,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 16,
               }}
            >
               <Button
                  title={t('startGame')}
                  onPress={handleStartGame}
                  variant="primary"
                  size="large"
                  className="bg-secondary"
                  fullWidth
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
         />
      </View>
   );
}
