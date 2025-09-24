import { useAuth } from '@/context/auth';
import {
   createLeagueStatsService,
   PlayerStat,
   StatType,
} from '@/services/leagueStatsService';
import { useCallback, useEffect, useState } from 'react';

export function usePlayerStat(
   leagueId: string | undefined,
   statType: StatType,
   year?: number
) {
   const { fetchWithAuth } = useAuth();
   const [data, setData] = useState<PlayerStat | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const fetchPlayerStat = useCallback(async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
         const statsService = createLeagueStatsService(fetchWithAuth);
         const response = await statsService.getPlayerStat(
            leagueId,
            statType,
            year
         );
         console.log('🚀 ~ usePlayerStat ~ response:', response.data);
         setData(response.data);
      } catch (err) {
         console.error(`Error fetching ${statType} stat:`, err);
         setError(
            err instanceof Error
               ? err.message
               : `Failed to fetch ${statType} stat`
         );
      } finally {
         setIsLoading(false);
      }
   }, [leagueId, statType, year, fetchWithAuth]);

   useEffect(() => {
      fetchPlayerStat();
   }, [fetchPlayerStat]);

   const refetch = useCallback(() => {
      fetchPlayerStat();
   }, [fetchPlayerStat]);

   return {
      data,
      isLoading,
      error,
      refetch,
   };
}
