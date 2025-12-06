import { useAuth } from '@/context/auth';
import {
   createLeagueStatsService,
   RankingsResponse,
   StatType,
} from '@/services/leagueStatsService';
import { useCallback, useEffect, useState } from 'react';

export function useStatsRankings(
   leagueId: string | undefined,
   statType: StatType,
   year?: number
) {
   const { fetchWithAuth } = useAuth();
   const [data, setData] = useState<RankingsResponse | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const fetchRankings = useCallback(async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
         const statsService = createLeagueStatsService(fetchWithAuth);
         const response = await statsService.getRankings(
            leagueId,
            statType,
            year
         );
         setData(response);
      } catch (err) {
         console.error(`Error fetching ${statType} rankings:`, err);
         setError(
            err instanceof Error ? err.message : `Failed to fetch rankings`
         );
      } finally {
         setIsLoading(false);
      }
   }, [leagueId, statType, year, fetchWithAuth]);

   useEffect(() => {
      fetchRankings();
   }, [fetchRankings]);

   const refetch = useCallback(() => {
      fetchRankings();
   }, [fetchRankings]);

   return {
      data,
      isLoading,
      error,
      refetch,
   };
}
