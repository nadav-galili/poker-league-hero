/**
 * Custom hook for managing user leagues
 */

import { addThemeToLeagues } from "@/app/constants/leagueThemes";
import { joinLeagueWithCode, shareLeague } from "@/app/services";
import { LeagueWithTheme } from "@/app/types/league";
import { useAuth } from "@/context/auth";
import { useLocalization } from "@/context/localization";
import { fetchUserLeagues } from "@/utils/leagueService";
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  setTag,
} from "@/utils/sentry";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import { Alert } from "react-native";

export function useMyLeagues() {
  const { t } = useLocalization();
  const { fetchWithAuth } = useAuth();

  const [leagues, setLeagues] = React.useState<LeagueWithTheme[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Function to load leagues
  const loadLeagues = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userLeagues = await fetchUserLeagues(fetchWithAuth);
      const leaguesWithTheme = addThemeToLeagues(userLeagues);
      setLeagues(leaguesWithTheme);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load leagues";
      setError(errorMessage);
      captureException(err as Error, {
        function: "loadLeagues",
        screen: "MyLeagues",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  // Load leagues on mount and when screen comes into focus
  React.useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  // Refresh leagues when screen comes into focus (e.g., after creating a league)
  useFocusEffect(
    React.useCallback(() => {
      loadLeagues();
    }, [loadLeagues])
  );

  // Track screen visit
  React.useEffect(() => {
    addBreadcrumb("User visited My Leagues screen", "navigation", {
      screen: "MyLeagues",
      timestamp: new Date().toISOString(),
    });
    setTag("current_screen", "my_leagues");
  }, []);

  // Navigation handlers
  const handleCreateLeague = () => {
    try {
      addBreadcrumb("User clicked Create League", "user_action", {
        screen: "MyLeagues",
        action: "create_league",
      });

      router.push("/leagues/create-league");
    } catch (error) {
      captureException(error as Error, {
        function: "handleCreateLeague",
        screen: "MyLeagues",
      });
      Alert.alert(t("error"), "Failed to open create league dialog");
    }
  };

  const handleJoinLeague = () => {
    try {
      Alert.prompt(
        t("joinLeague"),
        t("enterLeagueCode"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("join"),
            onPress: async (code) => {
              await handleJoinLeagueWithCode(code);
            },
          },
        ],
        "plain-text"
      );
    } catch (error) {
      captureException(error as Error, {
        function: "handleJoinLeague",
        screen: "MyLeagues",
      });
      Alert.alert(t("error"), "Failed to open join league dialog");
    }
  };

  const handleJoinLeagueWithCode = async (code?: string) => {
    try {
      if (!code) {
        Alert.alert(t("error"), "Please enter a league code");
        return;
      }

      // Show loading state
      setIsLoading(true);

      const result = await joinLeagueWithCode(code, fetchWithAuth, t);

      if (result.success && result.league) {
        // Success! Show success message and refresh leagues
        Alert.alert(
          t("success"),
          `${t("joinedLeagueSuccess")} "${result.league.name}"`,
          [
            {
              text: t("ok"),
              onPress: () => {
                // Refresh the leagues list
                loadLeagues();
              },
            },
          ]
        );
      } else {
        Alert.alert(t("error"), result.error || "Failed to join league");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join league";
      Alert.alert(t("error"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLeague = React.useCallback(
    async (league: LeagueWithTheme) => {
      const result = await shareLeague(league, t);

      if (!result.success && !result.cancelled && result.error) {
        Alert.alert(t("error"), t("failedToShare"));
      }
    },
    [t]
  );

  const handleLeaguePress = (league: LeagueWithTheme) => {
    try {
      // Navigate to league stats
      router.push(`/leagues/${league.id}/stats`);

      captureMessage("User viewed league details", "info", {
        screen: "MyLeagues",
        leagueId: league.id,
        leagueName: league.name,
      });
    } catch (error) {
      captureException(error as Error, {
        function: "handleLeaguePress",
        screen: "MyLeagues",
        leagueId: league.id,
      });
    }
  };

  return {
    leagues,
    isLoading,
    error,
    loadLeagues,
    handleCreateLeague,
    handleJoinLeague,
    handleShareLeague,
    handleLeaguePress,
  };
}
