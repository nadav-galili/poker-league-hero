import { colors } from '@/colors';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { LeagueCardSkeleton } from '../shared/LeagueCardSkeleton';

type Props = {
   leagueId: number;
};

type getSummaryListResponse = {
   summary: string;
};

const Summary = ({ leagueId }: Props) => {
   const { fetchWithAuth } = useAuth();
   const [refreshKey, setRefreshKey] = React.useState(0);

   useEffect(() => {
      setRefreshKey((prev) => prev + 1);
   }, [leagueId]);

   const {
      data: summary,
      isPending: isLoading,
      error,
   } = useQuery<getSummaryListResponse, Error>({
      queryKey: ['summary', leagueId, refreshKey],
      queryFn: async () => {
         const response = await fetchWithAuth(
            `${BASE_URL}/api/leagues/${leagueId}/ai-summary?t=${Date.now()}`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ createSummary: false }),
            }
         );

         return response.json();
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
         <View className="bg-errorTint rounded-lg p-4">
            <Text className="text-error">Failed to fetch AI summary</Text>
         </View>
      );

   return (
      <View className="px-6 mb-8">
         <Text className="text-primary text-center mb-6 text-2xl font-black uppercase tracking-[3px]">
            <Ionicons
               name="sparkles"
               size={24}
               color={colors.warningGradientEnd}
            />
            AI Summary
         </Text>

         <View className="bg-primaryTint rounded-lg p-4">
            <Text className="text-blue-300  font-bold text-lg">
               {summary?.summary ??
                  'No games played in this year OR summary not generated yet'}
            </Text>
         </View>
      </View>
   );
};

export default Summary;
