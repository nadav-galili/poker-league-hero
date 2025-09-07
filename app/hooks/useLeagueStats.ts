import { BASE_URL } from "@/constants";
import { useAuth } from "@/context/auth";
import { captureException } from "@/utils/sentry";
import React from "react";

export interface LeagueStats {
  totalGames: number;
  totalProfit: number;
  totalBuyIns: number;
  totalBuyOuts: number;
  activeGames: number;
  finishedGames: number;
  totalPlayers: number;
  averageGameDuration: number;
  mostProfitablePlayer: {
    name: string;
    profit: number;
  };
  mostActivePlayer: {
    name: string;
    gamesPlayed: number;
  };
}

export interface LeagueData {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface UseLeagueStatsReturn {
  league: LeagueData | null;
  stats: LeagueStats | null;
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
  loadLeagueData: () => void;
  handleRefresh: () => void;
}

export function useLeagueStats(leagueId: string | undefined): UseLeagueStatsReturn {
  const { fetchWithAuth } = useAuth();
  const [league, setLeague] = React.useState<LeagueData | null>(null);
  const [stats, setStats] = React.useState<LeagueStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadLeagueData = React.useCallback(async () => {
    if (!leagueId) return;

    try {
      setError(null);
      if (!refreshing) setIsLoading(true);

      // Fetch league details
      const leagueResponse = await fetchWithAuth(
        `${BASE_URL}/api/leagues/${leagueId}`,
        {}
      );

      if (!leagueResponse.ok) {
        throw new Error("Failed to fetch league details");
      }

      const leagueData = await leagueResponse.json();
      setLeague(leagueData.league);

      // Fetch league stats
      const statsResponse = await fetchWithAuth(
        `${BASE_URL}/api/leagues/${leagueId}/stats`,
        {}
      );

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch league stats");
      }

      const statsData = await statsResponse.json();
      setStats(statsData.stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load league data";
      setError(errorMessage);
      captureException(err as Error, {
        function: "loadLeagueData",
        screen: "LeagueStatsScreen",
        leagueId,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [leagueId, fetchWithAuth, refreshing]);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadLeagueData();
  }, [loadLeagueData]);

  React.useEffect(() => {
    loadLeagueData();
  }, [loadLeagueData]);

  return {
    league,
    stats,
    isLoading,
    error,
    refreshing,
    loadLeagueData,
    handleRefresh,
  };
}