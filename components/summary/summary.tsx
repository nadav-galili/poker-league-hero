import { colors } from '@/colors';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeagueCardSkeleton } from '../shared/LeagueCardSkeleton';

type Props = {
   leagueId: number;
};

type AISummaryType = {
   financialSnapshot: string;
   lastGameHighlights: string;
   stats: {
      totalProfit: number;
      totalBuyIns: number;
      totalGames: number;
      highestSingleGameProfit: number;
      highestSingleGamePlayer: string;
   };
};

type getSummaryListResponse = {
   summary: AISummaryType;
   cached?: boolean; // True if loaded from DB
   needsBackendCache?: boolean; // True if client should cache locally
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
            console.log('✅ Successfully persisted summary to DB via separate endpoint');
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
               console.log('📦 Found locally cached summary, trying to persist...');
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
         console.log('AI Summary API Response:', data);

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
               await AsyncStorage.setItem(cacheKey, JSON.stringify(data.summary));
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

   if (error)
      return (
         <View className="bg-errorTint rounded-lg p-4 items-center gap-2">
            <Text className="text-error text-center font-bold">
               {t('errorOccurred')}
            </Text>
            <Text className="text-error text-center text-sm">
               {error.message}
            </Text>
            <TouchableOpacity
               onPress={() => refetch()}
               className="bg-error px-4 py-2 rounded mt-2"
            >
               <Text className="text-white font-bold">{t('retry')}</Text>
            </TouchableOpacity>
         </View>
      );

   return (
      <View className="px-6 mb-8">
         <View className="flex-row justify-center items-center mb-6 gap-2 relative">
            <Text 
               className="text-primary text-center text-2xl font-black uppercase tracking-[3px]"
               style={{ writingDirection: isRTL ? 'rtl' : 'ltr' }}
            >
               <Ionicons
                  name="sparkles"
                  size={24}
                  color={colors.warningGradientEnd}
               />{' '}
               {t('aiSummary')}
            </Text>
            <TouchableOpacity
               onPress={() => refetch()}
               className={`absolute ${isRTL ? 'left-0' : 'right-0'}`}
               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
               <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
         </View>

         {summary?.summary ? (
            <View className="gap-4">
               <View className="bg-primaryTint rounded-lg p-4">
                  <Text
                     className="text-primary font-bold text-lg mb-2"
                     style={{ 
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr' 
                     }}
                  >
                     {t('financialSnapshot')}
                  </Text>
                  <Text
                     className="text-blue-300 font-medium text-base leading-6"
                     style={{ 
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr' 
                     }}
                  >
                     {summary.summary.financialSnapshot}
                  </Text>
               </View>

               <View className="bg-primaryTint rounded-lg p-4">
                  <Text
                     className="text-primary font-bold text-lg mb-2"
                     style={{ 
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr' 
                     }}
                  >
                     {t('lastGameHighlights')}
                  </Text>
                  <Text
                     className="text-blue-300 font-medium text-base leading-6"
                     style={{ 
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr' 
                     }}
                  >
                     {summary.summary.lastGameHighlights}
                  </Text>
               </View>
            </View>
         ) : (
            <View className="bg-primaryTint rounded-lg p-4">
               <Text className="text-blue-300 font-bold text-lg text-center">
                  {t('noSummaryYet')}
               </Text>
            </View>
         )}
      </View>
   );
};

export default Summary;
