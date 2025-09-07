/**
 * Hook for managing player selection state
 */

import { addBreadcrumb } from "@/utils/sentry";
import React from "react";

interface UsePlayerSelectionResult {
  selectedPlayers: Set<string>;
  togglePlayerSelection: (playerId: string) => void;
  clearSelection: () => void;
  isPlayerSelected: (playerId: string) => boolean;
  selectedPlayerIds: string[];
  selectedCount: number;
  selectMultiple: (playerIds: string[]) => void;
  deselectMultiple: (playerIds: string[]) => void;
}

export function usePlayerSelection(leagueId: string): UsePlayerSelectionResult {
  const [selectedPlayers, setSelectedPlayers] = React.useState<Set<string>>(
    new Set()
  );

  const togglePlayerSelection = React.useCallback(
    (playerId: string) => {
      setSelectedPlayers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(playerId)) {
          newSet.delete(playerId);
          addBreadcrumb("Player deselected", "user_action", {
            playerId,
            leagueId,
            selectedCount: newSet.size,
          });
        } else {
          newSet.add(playerId);
          addBreadcrumb("Player selected", "user_action", {
            playerId,
            leagueId,
            selectedCount: newSet.size,
          });
        }
        return newSet;
      });
    },
    [leagueId]
  );

  const clearSelection = React.useCallback(() => {
    setSelectedPlayers(new Set());
    addBreadcrumb("Player selection cleared", "user_action", {
      leagueId,
    });
  }, [leagueId]);

  const selectMultiple = React.useCallback(
    (playerIds: string[]) => {
      setSelectedPlayers((prev) => {
        const newSet = new Set(prev);
        playerIds.forEach((id) => newSet.add(id));
        addBreadcrumb("Multiple players selected", "user_action", {
          playerIds,
          leagueId,
          selectedCount: newSet.size,
        });
        return newSet;
      });
    },
    [leagueId]
  );

  const deselectMultiple = React.useCallback(
    (playerIds: string[]) => {
      setSelectedPlayers((prev) => {
        const newSet = new Set(prev);
        playerIds.forEach((id) => newSet.delete(id));
        addBreadcrumb("Multiple players deselected", "user_action", {
          playerIds,
          leagueId,
          selectedCount: newSet.size,
        });
        return newSet;
      });
    },
    [leagueId]
  );

  const isPlayerSelected = React.useCallback(
    (playerId: string) => {
      return selectedPlayers.has(playerId);
    },
    [selectedPlayers]
  );

  const selectedPlayerIds = React.useMemo(() => {
    return Array.from(selectedPlayers);
  }, [selectedPlayers]);

  const selectedCount = selectedPlayers.size;

  return {
    selectedPlayers,
    togglePlayerSelection,
    clearSelection,
    isPlayerSelected,
    selectedPlayerIds,
    selectedCount,
    selectMultiple,
    deselectMultiple,
  };
}
