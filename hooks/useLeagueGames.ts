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
   endedAt: string | null;
   status?: 'active' | 'completed';
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
   limit: number = 10
): UseLeagueGamesReturn {
   const { fetchWithAuth } = useAuth();
   // `fetchWithAuth` is currently not memoized in AuthProvider, so its identity can
   // change on every render. If we depend on it directly, `loadGames` becomes unstable,
   // which can trigger infinite effect loops (Maximum update depth exceeded).
   const fetchWithAuthRef = React.useRef(fetchWithAuth);
   React.useEffect(() => {
      fetchWithAuthRef.current = fetchWithAuth;
   }, [fetchWithAuth]);

   const [games, setGames] = React.useState<GameResult[]>([]);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [hasMore, setHasMore] = React.useState(false);
   const [total, setTotal] = React.useState(0);

   const loadGames = React.useCallback(
      async (page?: number, abortSignal?: AbortSignal) => {
         if (!leagueId || abortSignal?.aborted) return;

         try {
            setError(null);
            setIsLoading(true);

            // Use provided page or default to 1 (always start fresh)
            const pageToLoad = page ?? 1;

            // Add cache-busting timestamp to prevent stale data
            const cacheBuster = Date.now();
            const response = await fetchWithAuthRef.current(
               `${BASE_URL}/api/leagues/${leagueId}/games?page=${pageToLoad}&limit=${limit}&_t=${cacheBuster}`,
               { signal: abortSignal }
            );

            if (abortSignal?.aborted) return;

            if (!response.ok) {
               throw new Error('Failed to fetch league games');
            }

            const data = await response.json();

            if (abortSignal?.aborted) return;

            if (data.success) {
               if (pageToLoad === 1) {
                  // Always replace games when loading page 1 (fresh data)
                  setGames(data.games);
               } else {
                  // Append games for pagination
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
      [leagueId, limit]
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
