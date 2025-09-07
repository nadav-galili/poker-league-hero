/**
 * Hook for managing league members data
 */

import { createLeagueService } from "@/app/services";
import { LeagueData } from "@/app/types";
import { useAuth } from "@/context/auth";
import { addBreadcrumb, captureException, setTag } from "@/utils/sentry";
import React from "react";

interface UseLeagueMembersResult {
  league: LeagueData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLeagueMembers(leagueId: string): UseLeagueMembersResult {
  const { fetchWithAuth } = useAuth();
  const [league, setLeague] = React.useState<LeagueData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const leagueService = React.useMemo(
    () => createLeagueService(fetchWithAuth),
    [fetchWithAuth]
  );

  const loadLeagueMembers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      addBreadcrumb("Loading league members", "info", {
        leagueId,
        screen: "SelectPlayers",
      });

      const leagueData = await leagueService.getLeagueWithMembers(leagueId);

      setLeague(leagueData);
      setTag("league_id", leagueId);
      setTag("league_member_count", leagueData.members.length.toString());

      addBreadcrumb("League members loaded successfully", "info", {
        leagueId,
        memberCount: leagueData.members.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";

      setError(errorMessage);
      captureException(err instanceof Error ? err : new Error(errorMessage), {
        tags: {
          screen: "SelectPlayers",
          action: "loadLeagueMembers",
          leagueId,
        },
      });

      addBreadcrumb("Failed to load league members", "error", {
        leagueId,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, leagueService]);

  // Load league members on mount
  React.useEffect(() => {
    loadLeagueMembers();
  }, [loadLeagueMembers]);

  return {
    league,
    isLoading,
    error,
    refetch: loadLeagueMembers,
  };
}
