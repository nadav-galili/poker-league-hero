import { colors } from '@/colors';
import Button from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';

import { addBreadcrumb, captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';

import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

   // Function to load league details
   const loadLeagueDetails = React.useCallback(async () => {
      if (!id) return;

      try {
         setIsLoading(true);
         setError(null);

         const response = await fetchWithAuth(`${BASE_URL}/api/leagues/${id}`);

         if (!response.ok) {
            throw new Error('Failed to fetch league details');
         }

         const data = await response.json();
         setLeague(data.league);

         addBreadcrumb('League details loaded', 'data', {
            screen: 'LeagueStats',
            leagueId: id,
            leagueName: data.league?.name,
         });
      } catch (err) {
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
         setIsLoading(false);
      }
   }, [id, fetchWithAuth]);

   // Load league details on mount
   React.useEffect(() => {
      loadLeagueDetails();
   }, [loadLeagueDetails]);

   const handleBack = () => {
      router.back();
   };

   const handleStartGame = async () => {
      if (!league) return;

      try {
         // Check for active game first
         console.log('🔍 Checking for active game for league:', league.id);
         const activeGameResponse = await fetchWithAuth(
            `${BASE_URL}/api/games/active/${league.id}`
         );
         console.log(
            '🚀 ~ handleStartGame ~ activeGameResponse status:',
            activeGameResponse.status,
            'ok:',
            activeGameResponse.ok
         );

         if (activeGameResponse.ok) {
            const activeGameData = await activeGameResponse.json();
            console.log('🚀 ~ activeGameData:', activeGameData);

            if (activeGameData.success && activeGameData.game) {
               console.log(
                  '✅ Active game found, navigating to game:',
                  activeGameData.game.id
               );
               // Navigate to the active game screen
               router.push(`/games/${activeGameData.game.id}`);
               return;
            } else {
               console.log(
                  'ℹ️ No active game found, proceeding to select players'
               );
            }
         } else {
            const errorData = await activeGameResponse.json();
            console.error('❌ API Error:', errorData);
         }

         // No active game found, proceed to select players
         console.log('🎮 Navigating to select players screen');
         router.push(`/games/${league.id}/select-players`);
      } catch (error) {
         // If there's an error checking for active game, still proceed to select players
         console.error('❌ Error checking for active game:', error);
         router.push(`/games/${league.id}/select-players`);
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
                     width={120}
                     height={120}
                     className="w-30 h-30 rounded-2xl border-8 border-primary object-cover shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
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

               {/* Start New Game Card */}
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
            </View>
         </ScrollView>
      </View>
   );
}
