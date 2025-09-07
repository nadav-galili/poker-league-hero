/**
 * Hook for managing game creation flow
 */

import { createGameService } from "@/app/services";
import { CreateGameRequest } from "@/app/types";
import { useAuth } from "@/context/auth";
import { useLocalization } from "@/context/localization";
import { addBreadcrumb, captureException } from "@/utils/sentry";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

interface UseGameCreationResult {
  showGameSetup: boolean;
  buyIn: string;
  isCreatingGame: boolean;
  setBuyIn: (value: string) => void;
  handleStartGame: () => void;
  handleCreateGame: () => Promise<void>;
  handleCancelGameSetup: () => void;
  availableBuyIns: string[];
}

interface UseGameCreationProps {
  leagueId: string;
  selectedPlayerIds: string[];
  selectedCount: number;
  minPlayers?: number;
}

export function useGameCreation({
  leagueId,
  selectedPlayerIds,
  selectedCount,
  minPlayers = 2,
}: UseGameCreationProps): UseGameCreationResult {
  const { fetchWithAuth } = useAuth();
  const { t } = useLocalization();
  const [showGameSetup, setShowGameSetup] = React.useState(false);
  const [buyIn, setBuyIn] = React.useState("50");
  const [isCreatingGame, setIsCreatingGame] = React.useState(false);

  // Available buy-in amounts - could be moved to league settings
  const availableBuyIns = ["50", "100"];

  const gameService = React.useMemo(
    () => createGameService(fetchWithAuth),
    [fetchWithAuth]
  );

  const handleStartGame = React.useCallback(() => {
    if (selectedCount < minPlayers) {
      Alert.alert(t("invalidSelection"), t("selectAtLeastTwoPlayers"), [
        { text: t("ok") },
      ]);
      return;
    }

    addBreadcrumb("User opened game setup modal", "user_action", {
      screen: "SelectPlayers",
      leagueId,
      selectedPlayerCount: selectedCount,
    });

    setShowGameSetup(true);
  }, [selectedCount, leagueId, minPlayers, t]);

  const handleCreateGame = React.useCallback(async () => {
    try {
      setIsCreatingGame(true);

      addBreadcrumb("Creating game", "user_action", {
        leagueId,
        selectedPlayerIds,
        buyIn,
        playerCount: selectedCount,
      });

      const request: CreateGameRequest = {
        leagueId,
        selectedPlayerIds,
        buyIn: parseInt(buyIn),
      };

      const result = await gameService.createGame(request);

      addBreadcrumb("Game created successfully", "info", {
        gameId: result.gameId,
        leagueId,
        playerCount: selectedCount,
      });

      // Navigate to the game screen
      router.push(`/games/${result.gameId}` as any);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";

      Alert.alert(t("error"), errorMessage, [{ text: t("ok") }]);

      captureException(err instanceof Error ? err : new Error(errorMessage), {
        tags: {
          screen: "SelectPlayers",
          action: "createGame",
          leagueId,
        },
        extra: {
          selectedPlayerIds,
          buyIn,
          playerCount: selectedCount,
        },
      });

      addBreadcrumb("Failed to create game", "error", {
        leagueId,
        error: errorMessage,
      });
    } finally {
      setIsCreatingGame(false);
    }
  }, [leagueId, selectedPlayerIds, buyIn, selectedCount, gameService, t]);

  const handleCancelGameSetup = React.useCallback(() => {
    setShowGameSetup(false);
    setBuyIn("50"); // Reset buy-in to default
  }, []);

  return {
    showGameSetup,
    buyIn,
    isCreatingGame,
    setBuyIn,
    handleStartGame,
    handleCreateGame,
    handleCancelGameSetup,
    availableBuyIns,
  };
}
