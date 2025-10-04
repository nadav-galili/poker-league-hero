import { colors } from '@/colors';
import Button from '@/components/Button';
import { LoadingState } from '@/components/shared/LoadingState';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';

import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';

import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface LeagueData {
   id: string;
   name: string;
   imageUrl: string;
   inviteCode: string;
   memberCount: number;
   isActive: boolean;
   createdAt: string;
}

export default function LeagueStats() {
   const { t, isRTL } = useLocalization();
   const { fetchWithAuth } = useAuth();
   const { id } = useLocalSearchParams<{ id: string }>();

   const [league, setLeague] = React.useState<LeagueData | null>(null);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [activeGame, setActiveGame] = React.useState<{
      id: string;
      leagueId: string;
      status: string;
      createdAt: string;
   } | null>(null);
   const [isCheckingActiveGame, setIsCheckingActiveGame] =
      React.useState(false);

   // Function to load league details with abort controller support
   const loadLeagueDetails = React.useCallback(async (abortSignal?: AbortSignal) => {
      if (!id || abortSignal?.aborted) return;

      try {
         setIsLoading(true);
         setError(null);

         const response = await fetchWithAuth(`${BASE_URL}/api/leagues/${id}`, {
            signal: abortSignal,
         });

         if (abortSignal?.aborted) return;

         if (!response.ok) {
            throw new Error('Failed to fetch league details');
         }

         const data = await response.json();

         if (abortSignal?.aborted) return;

         setLeague(data.league);
      } catch (err) {
         if (abortSignal?.aborted) return;

         const errorMessage =
            err instanceof Error
               ? err.message
               : 'Failed to load league details';
         setError(errorMessage);
         captureException(err as Error, {
            function: 'loadLeagueDetails',
            screen: 'LeagueStats',
            leagueId: id,
         });
      } finally {
         if (!abortSignal?.aborted) {
            setIsLoading(false);
         }
      }
   }, [id, fetchWithAuth]);

   // Function to check for active game with abort controller support
   const checkActiveGame = React.useCallback(async (abortSignal?: AbortSignal) => {
      if (!league || abortSignal?.aborted) return;

      try {
         setIsCheckingActiveGame(true);
         const activeGameResponse = await fetchWithAuth(
            `${BASE_URL}/api/games/active/${league.id}`,
            { signal: abortSignal }
         );

         if (abortSignal?.aborted) return;

         if (activeGameResponse.ok) {
            const activeGameData = await activeGameResponse.json();

            if (abortSignal?.aborted) return;

            if (activeGameData.success && activeGameData.game) {
               setActiveGame(activeGameData.game);
            } else {
               setActiveGame(null);
            }
         } else {
            setActiveGame(null);
         }
      } catch (error) {
         if (abortSignal?.aborted) return;

         console.error('Error checking for active game:', error);
         setActiveGame(null);
      } finally {
         if (!abortSignal?.aborted) {
            setIsCheckingActiveGame(false);
         }
      }
   }, [league, fetchWithAuth]);

   // Load league details on mount with proper cleanup
   React.useEffect(() => {
      const abortController = new AbortController();
      loadLeagueDetails(abortController.signal);

      return () => {
         abortController.abort();
      };
   }, [loadLeagueDetails]);

   // Check for active game when league is loaded with proper cleanup
   React.useEffect(() => {
      if (!league) return;

      const abortController = new AbortController();
      checkActiveGame(abortController.signal);

      return () => {
         abortController.abort();
      };
   }, [league, checkActiveGame]);

   const handleBack = () => {
      router.back();
   };

   const handleStartGame = () => {
      if (!league) return;
      router.push(`/games/${league.id}/select-players`);
   };

   const handleContinueGame = () => {
      if (activeGame) {
         router.push(`/games/${activeGame.id}`);
      }
   };

   if (isLoading) {
      return <LoadingState />;
   }

   if (error || !league) {
      return (
         <View className="flex-1 bg-background">
            {/* Header with thick border and shadow */}
            <View className="flex-row items-center justify-between px-6 py-8 bg-primary border-b-8 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               <TouchableOpacity
                  onPress={handleBack}
                  className="p-3 bg-background border-4 border-border rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1"
               >
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={24}
                     color={colors.text}
                  />
               </TouchableOpacity>
               <Text className="text-textInverse text-xl font-black tracking-widest uppercase">
                  {t('leagueStats')}
               </Text>
               <View className="w-16" />
            </View>

            <View className="flex-1 items-center justify-center p-8">
               <View className="bg-error border-8 border-border rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Text className="text-center mb-6 font-black tracking-wider uppercase">
                     {t('error')}
                  </Text>
                  <Text className="text-center mb-8 font-bold">
                     {error || t('leagueNotFound')}
                  </Text>
                  <Button
                     title={t('retry')}
                     onPress={loadLeagueDetails}
                     variant="outline"
                     size="small"
                  />
               </View>
            </View>
         </View>
      );
   }

   return (
      <View className="flex-1 bg-background">
         {/* Header with thick border and shadow */}
         <View className="flex-row items-center justify-between px-6 py-8 bg-primary border-b-8 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <TouchableOpacity
               onPress={handleBack}
               className="p-3 bg-background border-4 border-border rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1"
            >
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={colors.text}
               />
            </TouchableOpacity>
            <Text className="text-textInverse text-xl font-black tracking-widest uppercase">
               {t('leagueStats')}
            </Text>
            <View className="w-16" />
         </View>

         <ScrollView
            className="flex-1"
            contentContainerClassName="p-6 pb-24"
            showsVerticalScrollIndicator={false}
         >
            {/* League Header with neo brutalism styling */}
            <View className="flex-row p-6 rounded-2xl mb-8 bg-primaryTint border-8 border-primary">
               <View className="mr-6">
                  <Image
                     source={{ uri: league.imageUrl }}
                     style={{
                        width: 120,
                        height: 120,
                        borderRadius: 16,
                        borderWidth: 8,
                        borderColor: colors.primary,
                     }}
                     className="shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                     contentFit="cover"
                     cachePolicy="memory-disk"
                     priority="high"
                     placeholder={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }}
                     placeholderContentFit="cover"
                     transition={300}
                     onError={(error) => {
                        captureException(
                           new Error('League image loading failed'),
                           {
                              function: 'Image.onError',
                              screen: 'LeagueStats',
                              leagueId: league.id,
                              imageUri: league.imageUrl,
                              error: error.toString(),
                           }
                        );
                     }}
                  />
               </View>

               <View className="flex-1 justify-center">
                  <Text className="text-black mb-4 font-bold text-xl">
                     {league.name}
                  </Text>

                  <View className="gap-4">
                     <View className="self-start px-4 py-3 rounded-lg border-4 border-border bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Text className="tracking-wider font-black uppercase">
                           {league.inviteCode}
                        </Text>
                     </View>

                     <Text className="tracking-widest uppercase font-bold">
                        {league.memberCount} {t('members')}
                     </Text>
                  </View>
               </View>
            </View>

            {/* Main Action Cards */}
            <View className="gap-10">
               {/* View Detailed Stats Card */}
               <TouchableOpacity
                  className="relative border-8 border-border bg-secondary rounded-2xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-3 active:translate-y-3 transition-all duration-100"
                  onPress={() => {
                     // Navigate to detailed stats screen
                     router.push(`/leagues/${league.id}/league-stats-screen`);
                  }}
               >
                  <View className="flex-row items-center">
                     <View className="w-20 h-20 bg-primary border-8 border-border rounded-2xl items-center justify-center mr-6 transform rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <Ionicons
                           name="stats-chart"
                           size={40}
                           color={colors.textInverse}
                        />
                     </View>

                     <View className="flex-1">
                        <Text className="tracking-widest mb-3 font-black uppercase transform -rotate-1">
                           {t('viewDetailedStats')}
                        </Text>
                        <Text className="leading-6 font-bold opacity-95">
                           {t('viewStatsDescription')}
                        </Text>
                     </View>

                     <View className="ml-4 transform rotate-12">
                        <Ionicons
                           name="chevron-back"
                           size={32}
                           color={colors.textInverse}
                        />
                     </View>
                  </View>
               </TouchableOpacity>

               {/* Conditional Game Action Card */}
               {isCheckingActiveGame ? (
                  <View className="relative border-8 border-border bg-surface rounded-2xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                     <View className="flex-row items-center">
                        <View className="w-20 h-20 bg-surfaceElevated border-8 border-border rounded-2xl items-center justify-center mr-6 transform -rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                           <Ionicons
                              name="hourglass"
                              size={40}
                              color={colors.text}
                           />
                        </View>

                        <View className="flex-1">
                           <Text className="tracking-widest mb-3 font-black uppercase transform rotate-1">
                              {t('checkingGames')}
                           </Text>
                           <Text className="leading-6 font-bold opacity-95">
                              {t('checkingGamesDescription')}
                           </Text>
                        </View>
                     </View>
                  </View>
               ) : activeGame ? (
                  /* Continue Active Game Card */
                  <TouchableOpacity
                     className="relative border-8 border-border bg-warning rounded-2xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-3 active:translate-y-3 transition-all duration-100"
                     onPress={handleContinueGame}
                  >
                     <View className="flex-row items-center">
                        <View className="w-20 h-20 bg-textInverse border-8 border-border rounded-2xl items-center justify-center mr-6 transform -rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                           <Ionicons
                              name="play-circle"
                              size={40}
                              color={colors.warning}
                           />
                        </View>

                        <View className="flex-1">
                           <Text className="tracking-widest mb-3 font-black uppercase transform rotate-1">
                              {t('continueGame')}
                           </Text>
                           <Text className="leading-6 font-bold opacity-95">
                              {t('continueGameDescription')}
                           </Text>
                        </View>

                        <View className="ml-4 transform -rotate-12">
                           <Ionicons
                              name="chevron-back"
                              size={32}
                              color={colors.textInverse}
                           />
                        </View>
                     </View>
                  </TouchableOpacity>
               ) : (
                  /* Start New Game Card */
                  <TouchableOpacity
                     className="relative border-8 border-border bg-success rounded-2xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-3 active:translate-y-3 transition-all duration-100"
                     onPress={handleStartGame}
                  >
                     <View className="flex-row items-center">
                        <View className="w-20 h-20 bg-textInverse border-8 border-border rounded-2xl items-center justify-center mr-6 transform -rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                           <Ionicons
                              name="play-circle"
                              size={40}
                              color={colors.success}
                           />
                        </View>

                        <View className="flex-1">
                           <Text className="tracking-widest mb-3 font-black uppercase transform rotate-1">
                              {t('startNewGame')}
                           </Text>
                           <Text className="leading-6 font-bold opacity-95">
                              {t('startGameDescription')}
                           </Text>
                        </View>

                        <View className="ml-4 transform -rotate-12">
                           <Ionicons
                              name="chevron-back"
                              size={32}
                              color={colors.textInverse}
                           />
                        </View>
                     </View>
                  </TouchableOpacity>
               )}
            </View>
         </ScrollView>
      </View>
   );
}
