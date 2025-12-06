import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { captureException } from '@/utils/sentry';
import React from 'react';

export interface GamePlayerResult {
   id: number;
   userId: number | null;
   fullName: string;
   profileImageUrl: string | null;
   profit: number;
   totalBuyIns: number;
}

export interface GameResult {
   id: number;
   leagueId: number;
   buyIn: string;
   startedAt: string;
   endedAt: string;
   createdBy: number;
   creatorName: string;
   creatorImage: string | null;
   players: GamePlayerResult[];
}

interface UseLeagueGamesReturn {
   games: GameResult[];
   isLoading: boolean;
   error: string | null;
   hasMore: boolean;
   total: number;
   loadGames: (page?: number) => Promise<void>;
}

export function useLeagueGames(
   leagueId: string | undefined,
   initialPage: number = 1,
   limit: number = 3
): UseLeagueGamesReturn {
   const { fetchWithAuth } = useAuth();
   const [games, setGames] = React.useState<GameResult[]>([]);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [hasMore, setHasMore] = React.useState(false);
   const [total, setTotal] = React.useState(0);

   const loadGames = React.useCallback(
      async (page: number = initialPage, abortSignal?: AbortSignal) => {
         if (!leagueId || abortSignal?.aborted) return;

         try {
            setError(null);
            setIsLoading(true);

            const response = await fetchWithAuth(
               `${BASE_URL}/api/leagues/${leagueId}/games?page=${page}&limit=${limit}`,
               { signal: abortSignal }
            );

            if (abortSignal?.aborted) return;

            if (!response.ok) {
               throw new Error('Failed to fetch league games');
            }

            const data = await response.json();

            if (abortSignal?.aborted) return;

            if (data.success) {
               if (page === 1) {
                  setGames(data.games);
               } else {
                  setGames((prev) => [...prev, ...data.games]);
               }
               setHasMore(data.hasMore);
               setTotal(data.total);
            } else {
               throw new Error(data.message || 'Failed to fetch games');
            }
         } catch (err) {
            if (abortSignal?.aborted) return;

            const errorMessage =
               err instanceof Error ? err.message : 'Failed to load games';
            setError(errorMessage);
            captureException(err as Error, {
               function: 'loadGames',
               screen: 'LeagueStatsScreen',
               leagueId,
               page,
            });
         } finally {
            if (!abortSignal?.aborted) {
               setIsLoading(false);
            }
         }
      },
      [leagueId, limit, initialPage, fetchWithAuth]
   );

   React.useEffect(() => {
      const abortController = new AbortController();
      loadGames(initialPage, abortController.signal);

      return () => {
         abortController.abort();
      };
   }, [loadGames, initialPage]);

   return React.useMemo(
      () => ({
         games,
         isLoading,
         error,
         hasMore,
         total,
         loadGames: (page?: number) => loadGames(page),
      }),
      [games, isLoading, error, hasMore, total, loadGames]
   );
}
