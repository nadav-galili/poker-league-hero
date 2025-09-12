import { useAuth } from '@/context/auth';
import {
   createLeagueStatsService,
   TopProfitPlayer,
} from '@/services/leagueStatsService';
import { useCallback, useEffect, useState } from 'react';

export function useTopProfitPlayer(
   leagueId: string | undefined,
   year?: number
) {
   const { fetchWithAuth } = useAuth();
   const [data, setData] = useState<TopProfitPlayer | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const fetchTopProfitPlayer = useCallback(async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
         const statsService = createLeagueStatsService(fetchWithAuth);
         const response = await statsService.getTopProfitPlayer(leagueId, year);
         setData(response.data);
      } catch (err) {
         console.error('Error fetching top profit player:', err);
         setError(
            err instanceof Error
               ? err.message
               : 'Failed to fetch top profit player'
         );
      } finally {
         setIsLoading(false);
      }
   }, [leagueId, year, fetchWithAuth]);

   useEffect(() => {
      fetchTopProfitPlayer();
   }, [fetchTopProfitPlayer]);

   const refetch = useCallback(() => {
      fetchTopProfitPlayer();
   }, [fetchTopProfitPlayer]);

   return {
      data,
      isLoading,
      error,
      refetch,
   };
}
