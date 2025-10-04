import { LeagueCard } from '@/components/league/LeagueCard';
import { MyLeaguesHeader } from '@/components/league/MyLeaguesHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { LeagueCardSkeleton } from '@/components/shared/LeagueCardSkeleton';
import { Text } from '@/components/Text';
import { useMyLeagues } from '@/hooks';
import { LeagueWithTheme } from '@/types/league';
import { captureException } from '@/utils/sentry';
import { FlashList } from '@shopify/flash-list';
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
   } = useMyLeagues();

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
      <View className="flex-1 bg-background">
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
               estimatedItemSize={140}
               showsVerticalScrollIndicator={false}
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={handleRefresh}
                     colors={['#6366F1']} // Primary color for Android
                     tintColor="#6366F1"  // Primary color for iOS
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
      </View>
   );
}
