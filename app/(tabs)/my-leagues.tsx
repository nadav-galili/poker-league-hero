import { LeagueCard } from '@/components/league/LeagueCard';
import { MyLeaguesHeader } from '@/components/league/MyLeaguesHeader';
import { InputModal } from '@/components/modals';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LeagueCardSkeleton } from '@/components/shared/LeagueCardSkeleton';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { useMyLeagues } from '@/hooks';
import { useMixpanel } from '@/hooks/useMixpanel';
import { LeagueWithTheme } from '@/types/league';
import { captureException } from '@/utils/sentry';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { RefreshControl, View } from 'react-native';

export default function MyLeagues() {
   const {
      leagues,
      isLoading,
      error,
      refreshing,
      loadLeagues,
      handleCreateLeague,
      handleJoinLeague,
      handleShareLeague,
      handleLeaguePress,
      handleRefresh,
      // Join modal state
      joinModalVisible,
      joinCode,
      setJoinCode,
      handleCloseJoinModal,
      handleSubmitJoinCode,
   } = useMyLeagues();

   const { trackScreenView } = useMixpanel();
   const { t } = useLocalization();

   // Track screen view on mount
   React.useEffect(() => {
      trackScreenView('My Leagues', {
         leagues_count: leagues?.length || 0,
      });
   }, [leagues, trackScreenView]);

   // Render function for league cards
   const renderLeagueCard = React.useCallback(
      ({ item }: { item: LeagueWithTheme }) => {
         try {
            return (
               <LeagueCard
                  league={item}
                  onPress={handleLeaguePress}
                  onShare={handleShareLeague}
               />
            );
         } catch (error) {
            captureException(error as Error, {
               function: 'renderLeagueCard',
               screen: 'MyLeagues',
               leagueId: item.id,
               leagueName: item.name,
            });
            // Return a fallback UI
            return (
               <View className="bg-error/10 border-2 border-error rounded-xl p-5 mx-4 items-center justify-center min-h-[100px]">
                  <Text>Error loading league card</Text>
               </View>
            );
         }
      },
      [handleLeaguePress, handleShareLeague]
   );

   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={{ flex: 1 }}
      >
         <MyLeaguesHeader
            onJoinLeague={handleJoinLeague}
            onCreateLeague={handleCreateLeague}
         />

         {/* Loading State */}
         {isLoading && (
            <View className="p-5 gap-4">
               {Array.from({ length: 3 }).map((_, index) => (
                  <LeagueCardSkeleton key={index} />
               ))}
            </View>
         )}

         {/* Error State */}
         {error && !isLoading && (
            <ErrorState error={error} onRetry={loadLeagues} />
         )}

         {/* Leagues List */}
         {!isLoading && !error && (
            <FlashList
               data={leagues}
               renderItem={renderLeagueCard}
               keyExtractor={(item) => item.id}
               contentContainerStyle={{
                  padding: 20,
               }}
               ItemSeparatorComponent={() => <View className="h-4" />}
               showsVerticalScrollIndicator={false}
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={handleRefresh}
                     colors={['#FF1493']} // Pink color for Android
                     tintColor="#FF1493" // Pink color for iOS
                  />
               }
               ListEmptyComponent={
                  <EmptyState
                     onCreateLeague={handleCreateLeague}
                     onJoinLeague={handleJoinLeague}
                  />
               }
            />
         )}

         {/* Join League Modal */}
         <InputModal
            visible={joinModalVisible}
            title={t('joinLeague')}
            placeholder={t('enterLeagueCode')}
            value={joinCode}
            onChangeText={setJoinCode}
            onClose={handleCloseJoinModal}
            onSubmit={handleSubmitJoinCode}
            submitText={t('join')}
            cancelText={t('cancel')}
            isLoading={isLoading}
            theme="dark"
         />
      </LinearGradient>
   );
}
