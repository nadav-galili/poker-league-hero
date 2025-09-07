/**
 * Select Players Screen - Refactored with clean architecture
 * Reduced from 873 lines to ~120 lines using extracted components and hooks
 */

import {
  useGameCreation,
  useLeagueMembers,
  usePlayerSelection,
} from "@/hooks";
import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { GameSetupModal } from "@/components/modals";
import { PlayerGrid } from "@/components/ui";
import { useLocalization } from "@/context/localization";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectPlayers() {
  const theme = getTheme("light");
  const { t } = useLocalization();
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();

  // Custom hooks for clean separation of concerns
  const { league, isLoading, error, refetch } = useLeagueMembers(leagueId!);
  const {
    selectedPlayerIds,
    selectedCount,
    togglePlayerSelection,
    clearSelection,
  } = usePlayerSelection(leagueId!);

  const {
    showGameSetup,
    buyIn,
    isCreatingGame,
    availableBuyIns,
    setBuyIn,
    handleStartGame,
    handleCreateGame,
    handleCancelGameSetup,
  } = useGameCreation({
    leagueId: leagueId!,
    selectedPlayerIds,
    selectedCount,
  });

  const handleBack = () => {
    if (selectedCount > 0) {
      clearSelection();
    }
    router.back();
  };

  const selectedPlayers = React.useMemo(() => {
    return (
      league?.members.filter((member) =>
        selectedPlayerIds.includes(member.id)
      ) || []
    );
  }, [league?.members, selectedPlayerIds]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
          </TouchableOpacity>
          <Text
            variant="h3"
            color={colors.textInverse}
            style={styles.headerTitle}>
            {t("selectPlayers")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.loadingText}>
            {t("loadingLeagueMembers")}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
          </TouchableOpacity>
          <Text
            variant="h3"
            color={colors.textInverse}
            style={styles.headerTitle}>
            {t("selectPlayers")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Text variant="h3" color={theme.error} style={styles.errorTitle}>
            {t("errorLoadingPlayers")}
          </Text>
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.errorMessage}>
            {error}
          </Text>
          <Button
            title={t("tryAgain")}
            onPress={refetch}
            variant="secondary"
            size="medium"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
        </TouchableOpacity>
        <Text
          variant="h3"
          color={colors.textInverse}
          style={styles.headerTitle}>
          {t("selectPlayers")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* League Info Header */}
      {league && (
        <View
          style={[
            styles.leagueHeader,
            { backgroundColor: theme.surfaceElevated },
          ]}>
          <Text variant="h3" color={theme.text} style={styles.leagueName}>
            {league.name}
          </Text>
          <Text variant="body" color={theme.textMuted}>
            {t("selectPlayersForGame")}
          </Text>
        </View>
      )}

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <View
          style={[
            styles.selectionSummary,
            { backgroundColor: colors.primaryTint },
          ]}>
          <Text variant="h4" color={colors.primary} style={styles.summaryText}>
            {t("playersSelected", { count: selectedCount })}
          </Text>
        </View>
      )}

      {/* Player Grid */}
      <PlayerGrid
        members={league?.members || []}
        selectedPlayerIds={selectedPlayerIds}
        onPlayerToggle={togglePlayerSelection}
        variant="grid"
        numColumns={3}
        loading={isLoading}
        error={error}
      />

      {/* Start Game Button */}
      {selectedCount > 0 && (
        <View
          style={[
            styles.startGameContainer,
            { backgroundColor: theme.background },
          ]}>
          <Button
            title={t("startGame")}
            onPress={handleStartGame}
            variant="primary"
            size="large"
            backgroundColor={colors.secondary}
            fullWidth
          />
        </View>
      )}

      {/* Game Setup Modal */}
      <GameSetupModal
        visible={showGameSetup}
        selectedPlayers={selectedPlayers}
        buyIn={buyIn}
        isCreatingGame={isCreatingGame}
        availableBuyIns={availableBuyIns}
        onClose={handleCancelGameSetup}
        onCreateGame={handleCreateGame}
        onBuyInChange={setBuyIn}
        leagueName={league?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 6,
    borderBottomColor: colors.text,
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  placeholder: {
    width: 40,
  },

  leagueHeader: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },

  leagueName: {
    letterSpacing: 1,
    marginBottom: 4,
  },

  selectionSummary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  summaryText: {
    textAlign: "center",
    letterSpacing: 0.5,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  errorTitle: {
    textAlign: "center",
    marginBottom: 12,
  },

  errorMessage: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  startGameContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
});
