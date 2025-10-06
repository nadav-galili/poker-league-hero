import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
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

   const {
      mutate,
      data: summary,
      isPending: isLoading,
      error,
   } = useMutation<getSummaryListResponse, Error>({
      mutationFn: async () => {
         const response = await fetchWithAuth(
            `${BASE_URL}/api/leagues/${leagueId}/ai-summary`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         );
         if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to fetch AI summary');
         }
         return response.json();
      },
   });

   useEffect(() => {
      if (leagueId) {
         mutate();
      }
   }, [leagueId, mutate]);

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
      <View>
         <Text className="text-primary text-center mb-6 text-2xl font-black uppercase tracking-[3px]">
            ✨ AI Summary
         </Text>

         <View className="bg-primaryTint rounded-lg p-4">
            <Text className="text-black font-bold text-md">
               {summary?.summary ??
                  'No games played in this year OR summary not generated yet'}
            </Text>
         </View>
      </View>
   );
};

export default Summary;