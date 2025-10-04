import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { captureException } from '@/utils/sentry';
import React from 'react';

export interface CashIn {
   id: string;
   amount: string;
   type: 'buy_in' | 'buy_out';
   createdAt: string;
   chipCount?: number;
   notes?: string;
}

export interface GamePlayer {
   id: string;
   userId: number;
   fullName: string;
   profileImageUrl?: string;
   isActive: boolean;
   joinedAt: string;
   leftAt?: string;
   finalAmount?: string;
   profit?: string;
   cashIns: CashIn[];
   totalBuyIns: number;
   totalBuyOuts: number;
   currentProfit: number;
}

export interface GameData {
   id: string;
   leagueId: string;
   createdBy: string;
   buyIn: string;
   status: string;
   startedAt: string;
   endedAt?: string;
   players: GamePlayer[];
   totals: {
      totalBuyIns: number;
      totalBuyOuts: number;
      activePlayers: number;
      totalPlayers: number;
   };
}

export interface LeagueMember {
   id: string;
   fullName: string;
   profileImageUrl?: string;
   role: 'admin' | 'member';
   joinedAt: string;
}

export const useGameData = (gameId: string | undefined) => {
   const { fetchWithAuth } = useAuth();
   const { t } = useLocalization();

   const [game, setGame] = React.useState<GameData | null>(null);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [refreshing, setRefreshing] = React.useState(false);
   const [availableMembers, setAvailableMembers] = React.useState<
      LeagueMember[]
   >([]);

   const loadGameData = React.useCallback(async () => {
      if (!gameId) return;

      try {
         setError(null);
         if (!refreshing) setIsLoading(true);

         const response = await fetchWithAuth(
            `${BASE_URL}/api/games/${gameId}`,
            {}
         );

         if (!response.ok) {
            throw new Error('Failed to fetch game details');
         }

         const data = await response.json();
         setGame(data.game);
      } catch (err) {
         const errorMessage =
            err instanceof Error ? err.message : 'Failed to load game details';
         setError(errorMessage);
         captureException(err as Error, {
            function: 'loadGameData',
            screen: 'GameScreen',
            gameId,
         });
      } finally {
         setIsLoading(false);
         setRefreshing(false);
      }
   }, [gameId, fetchWithAuth, refreshing]);

   const loadAvailableMembers = React.useCallback(async () => {
      if (!game?.leagueId) return;

      try {
         const response = await fetchWithAuth(
            `${BASE_URL}/api/leagues/${game.leagueId}/available-players`,
            {}
         );

         if (!response.ok) {
            throw new Error('Failed to fetch available members');
         }

         const data = await response.json();
         const currentPlayerIds = game.players.map((p) => p.userId);
         const availableMembers = data.members.filter(
            (member: LeagueMember) => !currentPlayerIds.includes(member.id)
         );

         setAvailableMembers(availableMembers);
      } catch (error) {
         console.error('Error loading available members:', error);
      }
   }, [game?.leagueId, game?.players, fetchWithAuth]);

   const handleRefresh = () => {
      setRefreshing(true);
      loadGameData();
   };

   React.useEffect(() => {
      loadGameData();
   }, [loadGameData]);

   return {
      game,
      isLoading,
      error,
      refreshing,
      availableMembers,
      loadGameData,
      loadAvailableMembers,
      handleRefresh,
   };
};
