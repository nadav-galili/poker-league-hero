import { colors } from '@/colors';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LeagueCardSkeleton } from '../shared/LeagueCardSkeleton';

type Props = {
   leagueId: number;
};

type AISummaryType = {
   financialSnapshot: string;
   lastGameHighlights: string;
   outlook: string;
   stats: {
      totalProfit: number;
      totalBuyIns: number;
      totalGames: number;
      highestSingleGameProfit: number;
      highestSingleGamePlayer: string;
   };
};

type getSummaryListResponse = {
   summary: AISummaryType | null;
   cached?: boolean; // True if loaded from DB
   needsBackendCache?: boolean; // True if client should cache locally
   noGames?: boolean; // True if there are no games played yet
};

const Summary = ({ leagueId }: Props) => {
   const { fetchWithAuth } = useAuth();
   const { t, language, isRTL } = useLocalization();
   const [refreshKey, setRefreshKey] = useState(0);
   const cacheKey = `ai_summary_${leagueId}`;

   useEffect(() => {
      setRefreshKey((prev) => prev + 1);
   }, [leagueId, language]); // Refetch when language changes

   // Helper to persist summary via separate lightweight endpoint
   const persistSummaryToBackend = async (summaryData: AISummaryType) => {
      try {
         const response = await fetchWithAuth(
            `${BASE_URL}/api/leagues/${leagueId}/store-summary`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ summary: summaryData }),
            }
         );
         if (response.ok) {
            console.log(
               '✅ Successfully persisted summary to DB via separate endpoint'
            );
            await AsyncStorage.removeItem(cacheKey);
            return true;
         }
         console.error('❌ Failed to persist summary:', await response.text());
         return false;
      } catch (error) {
         console.error('❌ Error persisting summary:', error);
         return false;
      }
   };

   const {
      data: summary,
      isPending: isLoading,
      error,
      refetch,
   } = useQuery<getSummaryListResponse, Error>({
      queryKey: ['summary', leagueId, language, refreshKey],
      queryFn: async () => {
         // First, try to persist any locally cached summary via separate endpoint
         try {
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
               console.log(
                  '📦 Found locally cached summary, trying to persist...'
               );
               const cachedSummary = JSON.parse(cached) as AISummaryType;
               await persistSummaryToBackend(cachedSummary);
            }
         } catch (error) {
            console.error('⚠️ Failed to handle cached summary:', error);
         }

         const response = await fetchWithAuth(
            `${BASE_URL}/api/leagues/${leagueId}/ai-summary?t=${Date.now()}`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ createSummary: false, language }),
            }
         );

         const data = await response.json();

         if (!response.ok) {
            console.error('AI Summary API Error:', data);
            const cause = data.cause
               ? ` Cause: ${
                    typeof data.cause === 'object'
                       ? JSON.stringify(data.cause)
                       : data.cause
                 }`
               : '';
            throw new Error(
               (data.details || data.error || 'Failed to fetch summary') + cause
            );
         }

         // Handle caching logic
         if (data.needsBackendCache && data.summary) {
            // Backend couldn't cache, store locally AND try separate endpoint
            try {
               await AsyncStorage.setItem(
                  cacheKey,
                  JSON.stringify(data.summary)
               );
               console.log('💾 Stored summary in local cache');
               // Try to persist via separate lightweight endpoint
               persistSummaryToBackend(data.summary);
            } catch (error) {
               console.error('⚠️ Failed to store summary locally:', error);
            }
         } else if (data.cached) {
            // Backend has it cached, clear local cache
            try {
               await AsyncStorage.removeItem(cacheKey);
               console.log('🗑️ Cleared local cache (backend has it)');
            } catch (error) {
               console.error('⚠️ Failed to clear local cache:', error);
            }
         }

         return data;
      },
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      placeholderData: undefined,
      initialData: undefined,
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
      enabled: true,
      retry: false,
   });

   if (isLoading)
      return (
         <View className="p-5 gap-4">
            {Array.from({ length: 1 }).map((_, index) => (
               <LeagueCardSkeleton key={index} />
            ))}
         </View>
      );

   // Check if there are no games (from the successful response)
   const hasNoGames = summary?.noGames === true;

   if (error)
      return (
         <View className="px-6 mb-8">
            <View
               className="relative p-5 border-2 items-center gap-4"
               style={{
                  backgroundColor: `${colors.cyberBackground}DD`,
                  borderColor: colors.error,
                  shadowColor: colors.error,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 10,
               }}
            >
               {/* Corner Brackets */}
               <View className="absolute top-0 left-0 w-6 h-6">
                  <View
                     className="absolute top-0 left-0 w-4 h-1"
                     style={{ backgroundColor: colors.error }}
                  />
                  <View
                     className="absolute top-0 left-0 w-1 h-4"
                     style={{ backgroundColor: colors.error }}
                  />
               </View>
               <View className="absolute top-0 right-0 w-6 h-6">
                  <View
                     className="absolute top-0 right-0 w-4 h-1"
                     style={{ backgroundColor: colors.error }}
                  />
                  <View
                     className="absolute top-0 right-0 w-1 h-4"
                     style={{ backgroundColor: colors.error }}
                  />
               </View>
               <View className="absolute bottom-0 left-0 w-6 h-6">
                  <View
                     className="absolute bottom-0 left-0 w-4 h-1"
                     style={{ backgroundColor: colors.error }}
                  />
                  <View
                     className="absolute bottom-0 left-0 w-1 h-4"
                     style={{ backgroundColor: colors.error }}
                  />
               </View>
               <View className="absolute bottom-0 right-0 w-6 h-6">
                  <View
                     className="absolute bottom-0 right-0 w-4 h-1"
                     style={{ backgroundColor: colors.error }}
                  />
                  <View
                     className="absolute bottom-0 right-0 w-1 h-4"
                     style={{ backgroundColor: colors.error }}
                  />
               </View>

               <Text
                  className="text-center font-bold uppercase tracking-[2px] text-lg"
                  style={{
                     color: colors.error,
                     fontFamily: 'monospace',
                  }}
               >
                  !!! {t('errorOccurred')} !!!
               </Text>

               <Text
                  className="text-center text-sm max-w-[300px]"
                  style={{ color: colors.textSecondary }}
               >
                  {error.message}
               </Text>

               <TouchableOpacity
                  onPress={() => refetch()}
                  className="px-6 py-3 border-2 rounded mt-2"
                  style={{
                     backgroundColor: colors.cyberBackground,
                     borderColor: colors.error,
                     shadowColor: colors.error,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.6,
                     shadowRadius: 5,
                     elevation: 5,
                  }}
               >
                  <Text
                     className="font-bold uppercase tracking-[1px]"
                     style={{
                        color: colors.error,
                        fontFamily: 'monospace',
                     }}
                  >
                     {t('retry')}
                  </Text>
               </TouchableOpacity>
            </View>
         </View>
      );

   // If there are no games, show friendly message
   if (hasNoGames) {
      return (
         <View className="px-6 mb-8">
            {/* Cyberpunk AI Summary Header */}
            <View
               className="relative mb-6 p-4 border-2"
               style={{
                  backgroundColor: colors.cyberBackground,
                  borderColor: colors.neonPink,
                  shadowColor: colors.shadowNeonPink,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 10,
                  elevation: 10,
               }}
            >
               {/* Corner Brackets */}
               <View className="absolute top-0 left-0 w-6 h-6">
                  <View
                     className="absolute top-0 left-0 w-4 h-1"
                     style={{ backgroundColor: colors.neonPink }}
                  />
                  <View
                     className="absolute top-0 left-0 w-1 h-4"
                     style={{ backgroundColor: colors.neonPink }}
                  />
               </View>
               <View className="absolute top-0 right-0 w-6 h-6">
                  <View
                     className="absolute top-0 right-0 w-4 h-1"
                     style={{ backgroundColor: colors.neonPink }}
                  />
                  <View
                     className="absolute top-0 right-0 w-1 h-4"
                     style={{ backgroundColor: colors.neonPink }}
                  />
               </View>
               <View className="absolute bottom-0 left-0 w-6 h-6">
                  <View
                     className="absolute bottom-0 left-0 w-4 h-1"
                     style={{ backgroundColor: colors.neonPink }}
                  />
                  <View
                     className="absolute bottom-0 left-0 w-1 h-4"
                     style={{ backgroundColor: colors.neonPink }}
                  />
               </View>
               <View className="absolute bottom-0 right-0 w-6 h-6">
                  <View
                     className="absolute bottom-0 right-0 w-4 h-1"
                     style={{ backgroundColor: colors.neonPink }}
                  />
                  <View
                     className="absolute bottom-0 right-0 w-1 h-4"
                     style={{ backgroundColor: colors.neonPink }}
                  />
               </View>

               <View className="flex-row justify-center items-center gap-2">
                  <Text
                     className="text-center text-xl font-black uppercase tracking-[3px]"
                     style={{
                        color: colors.neonPink,
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                        fontFamily: 'monospace',
                     }}
                  >
                     <Ionicons
                        name="sparkles"
                        size={20}
                        color={colors.neonPink}
                     />{' '}
                     {t('aiSummary')}
                  </Text>
               </View>
            </View>

            {/* Friendly no games message */}
            <View
               className="relative p-5 border-2"
               style={{
                  backgroundColor: `${colors.cyberBackground}AA`,
                  borderColor: colors.neonCyan,
                  shadowColor: colors.neonCyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                  elevation: 6,
               }}
            >
               {/* Corner Brackets */}
               <View className="absolute top-0 left-0 w-4 h-4">
                  <View
                     className="absolute top-0 left-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
                  <View
                     className="absolute top-0 left-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
               </View>
               <View className="absolute top-0 right-0 w-4 h-4">
                  <View
                     className="absolute top-0 right-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
                  <View
                     className="absolute top-0 right-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
               </View>
               <View className="absolute bottom-0 left-0 w-4 h-4">
                  <View
                     className="absolute bottom-0 left-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
                  <View
                     className="absolute bottom-0 left-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
               </View>
               <View className="absolute bottom-0 right-0 w-4 h-4">
                  <View
                     className="absolute bottom-0 right-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
                  <View
                     className="absolute bottom-0 right-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonCyan }}
                  />
               </View>

               <View className="flex-row justify-center items-center gap-2 mb-2">
                  <Ionicons
                     name="game-controller"
                     size={24}
                     color={colors.neonCyan}
                  />
               </View>

               <Text
                  className="font-bold text-lg text-center uppercase tracking-[2px]"
                  style={{
                     color: colors.neonCyan,
                     fontFamily: 'monospace',
                  }}
               >
                  {t('playGameToGetAiSummary')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View className="px-6 mb-8">
         {/* Cyberpunk AI Summary Header */}
         <View
            className="relative mb-6 p-4 border-2"
            style={{
               backgroundColor: colors.cyberBackground,
               borderColor: colors.neonPink,
               shadowColor: colors.shadowNeonPink,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 1,
               shadowRadius: 10,
               elevation: 10,
            }}
         >
            {/* Corner Brackets */}
            <View className="absolute top-0 left-0 w-6 h-6">
               <View
                  className="absolute top-0 left-0 w-4 h-1"
                  style={{ backgroundColor: colors.neonPink }}
               />
               <View
                  className="absolute top-0 left-0 w-1 h-4"
                  style={{ backgroundColor: colors.neonPink }}
               />
            </View>
            <View className="absolute top-0 right-0 w-6 h-6">
               <View
                  className="absolute top-0 right-0 w-4 h-1"
                  style={{ backgroundColor: colors.neonPink }}
               />
               <View
                  className="absolute top-0 right-0 w-1 h-4"
                  style={{ backgroundColor: colors.neonPink }}
               />
            </View>
            <View className="absolute bottom-0 left-0 w-6 h-6">
               <View
                  className="absolute bottom-0 left-0 w-4 h-1"
                  style={{ backgroundColor: colors.neonPink }}
               />
               <View
                  className="absolute bottom-0 left-0 w-1 h-4"
                  style={{ backgroundColor: colors.neonPink }}
               />
            </View>
            <View className="absolute bottom-0 right-0 w-6 h-6">
               <View
                  className="absolute bottom-0 right-0 w-4 h-1"
                  style={{ backgroundColor: colors.neonPink }}
               />
               <View
                  className="absolute bottom-0 right-0 w-1 h-4"
                  style={{ backgroundColor: colors.neonPink }}
               />
            </View>

            <View className="flex-row justify-center items-center gap-2 relative">
               <Text
                  className="text-center text-xl font-black uppercase tracking-[3px]"
                  style={{
                     color: colors.neonPink,
                     writingDirection: isRTL ? 'rtl' : 'ltr',
                     fontFamily: 'monospace',
                  }}
               >
                  <Ionicons name="sparkles" size={20} color={colors.neonPink} />{' '}
                  {t('aiSummary')}
               </Text>
            </View>
         </View>

         {summary?.summary ? (
            <View className="gap-6">
               {/* Financial Snapshot Card */}
               <View
                  className="relative p-5 border-2"
                  style={{
                     backgroundColor: `${colors.cyberBackground}CC`,
                     borderColor: colors.neonCyan,
                     shadowColor: colors.shadowNeonCyan,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.6,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  {/* Corner Brackets */}
                  <View className="absolute top-0 left-0 w-4 h-4">
                     <View
                        className="absolute top-0 left-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                     <View
                        className="absolute top-0 left-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                  </View>
                  <View className="absolute top-0 right-0 w-4 h-4">
                     <View
                        className="absolute top-0 right-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                     <View
                        className="absolute top-0 right-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                  </View>
                  <View className="absolute bottom-0 left-0 w-4 h-4">
                     <View
                        className="absolute bottom-0 left-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                     <View
                        className="absolute bottom-0 left-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                  </View>
                  <View className="absolute bottom-0 right-0 w-4 h-4">
                     <View
                        className="absolute bottom-0 right-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                     <View
                        className="absolute bottom-0 right-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonCyan }}
                     />
                  </View>

                  {/* Holographic overlay */}
                  <View
                     className="absolute inset-0 opacity-20"
                     style={{ backgroundColor: colors.holoBlue }}
                  />

                  <Text
                     className="font-bold text-lg mb-3 uppercase tracking-[2px]"
                     style={{
                        color: colors.neonCyan,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                        fontFamily: 'monospace',
                     }}
                  >
                     {t('financialSnapshot')}
                  </Text>
                  <Text
                     className="font-medium text-base leading-6"
                     style={{
                        color: colors.textSecondary,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                     }}
                  >
                     {summary.summary.financialSnapshot}
                  </Text>
               </View>

               {/* Last Game Highlights Card */}
               <View
                  className="relative p-5 border-2"
                  style={{
                     backgroundColor: `${colors.cyberBackground}CC`,
                     borderColor: colors.neonGreen,
                     shadowColor: colors.shadowNeonGreen,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.6,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  {/* Corner Brackets */}
                  <View className="absolute top-0 left-0 w-4 h-4">
                     <View
                        className="absolute top-0 left-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                     <View
                        className="absolute top-0 left-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                  </View>
                  <View className="absolute top-0 right-0 w-4 h-4">
                     <View
                        className="absolute top-0 right-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                     <View
                        className="absolute top-0 right-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                  </View>
                  <View className="absolute bottom-0 left-0 w-4 h-4">
                     <View
                        className="absolute bottom-0 left-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                     <View
                        className="absolute bottom-0 left-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                  </View>
                  <View className="absolute bottom-0 right-0 w-4 h-4">
                     <View
                        className="absolute bottom-0 right-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                     <View
                        className="absolute bottom-0 right-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonGreen }}
                     />
                  </View>

                  {/* Holographic overlay */}
                  <View
                     className="absolute inset-0 opacity-20"
                     style={{ backgroundColor: colors.holoGreen }}
                  />

                  <Text
                     className="font-bold text-lg mb-3 uppercase tracking-[2px]"
                     style={{
                        color: colors.neonGreen,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                        fontFamily: 'monospace',
                     }}
                  >
                     {t('lastGameHighlights')}
                  </Text>
                  <Text
                     className="font-medium text-base leading-6"
                     style={{
                        color: colors.textSecondary,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                     }}
                  >
                     {summary.summary.lastGameHighlights}
                  </Text>
               </View>

               {/* Outlook & Prediction Card */}
               <View
                  className="relative p-5 border-2"
                  style={{
                     backgroundColor: `${colors.cyberBackground}CC`,
                     borderColor: colors.neonPurple,
                     shadowColor: colors.shadowPurple,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.6,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  {/* Corner Brackets */}
                  <View className="absolute top-0 left-0 w-4 h-4">
                     <View
                        className="absolute top-0 left-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                     <View
                        className="absolute top-0 left-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                  </View>
                  <View className="absolute top-0 right-0 w-4 h-4">
                     <View
                        className="absolute top-0 right-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                     <View
                        className="absolute top-0 right-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                  </View>
                  <View className="absolute bottom-0 left-0 w-4 h-4">
                     <View
                        className="absolute bottom-0 left-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                     <View
                        className="absolute bottom-0 left-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                  </View>
                  <View className="absolute bottom-0 right-0 w-4 h-4">
                     <View
                        className="absolute bottom-0 right-0 w-3 h-0.5"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                     <View
                        className="absolute bottom-0 right-0 w-0.5 h-3"
                        style={{ backgroundColor: colors.neonPurple }}
                     />
                  </View>

                  {/* Holographic overlay */}
                  <View
                     className="absolute inset-0 opacity-20"
                     style={{ backgroundColor: 'rgba(138, 43, 226, 0.3)' }}
                  />

                  <Text
                     className="font-bold text-lg mb-3 uppercase tracking-[2px]"
                     style={{
                        color: colors.neonPurple,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                        fontFamily: 'monospace',
                     }}
                  >
                     {t('outlook')}
                  </Text>
                  <Text
                     className="font-medium text-base leading-6"
                     style={{
                        color: colors.textSecondary,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                     }}
                  >
                     {summary.summary.outlook}
                  </Text>
               </View>
            </View>
         ) : (
            <View
               className="relative p-5 border-2"
               style={{
                  backgroundColor: `${colors.cyberBackground}AA`,
                  borderColor: colors.neonOrange,
                  shadowColor: colors.neonOrange,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                  elevation: 6,
               }}
            >
               {/* Corner Brackets */}
               <View className="absolute top-0 left-0 w-4 h-4">
                  <View
                     className="absolute top-0 left-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
                  <View
                     className="absolute top-0 left-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
               </View>
               <View className="absolute top-0 right-0 w-4 h-4">
                  <View
                     className="absolute top-0 right-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
                  <View
                     className="absolute top-0 right-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
               </View>
               <View className="absolute bottom-0 left-0 w-4 h-4">
                  <View
                     className="absolute bottom-0 left-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
                  <View
                     className="absolute bottom-0 left-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
               </View>
               <View className="absolute bottom-0 right-0 w-4 h-4">
                  <View
                     className="absolute bottom-0 right-0 w-3 h-0.5"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
                  <View
                     className="absolute bottom-0 right-0 w-0.5 h-3"
                     style={{ backgroundColor: colors.neonOrange }}
                  />
               </View>

               <Text
                  className="font-bold text-lg text-center uppercase tracking-[2px]"
                  style={{
                     color: colors.neonOrange,
                     fontFamily: 'monospace',
                  }}
               >
                  {t('noSummaryYet')}
               </Text>
            </View>
         )}
      </View>
   );
};

export default Summary;
