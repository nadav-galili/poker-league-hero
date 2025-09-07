/**
 * Reusable PlayerGrid component for displaying players in a grid layout
 */

import { LeagueMember } from "@/types";
import { getTheme } from "@/colors";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { PlayerCard } from "./PlayerCard";

interface PlayerGridProps {
  members: LeagueMember[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  variant?: "grid" | "list";
  showSelectionIndicator?: boolean;
  numColumns?: number;
  loading?: boolean;
  error?: string | null;
}

export function PlayerGrid({
  members,
  selectedPlayerIds,
  onPlayerToggle,
  variant = "grid",
  showSelectionIndicator = true,
  numColumns = 3,
  loading = false,
  error = null,
}: PlayerGridProps) {
  const theme = getTheme("light");
  const { t } = useLocalization();
  const selectedSet = new Set(selectedPlayerIds);

  const renderPlayerItem = ({ item }: { item: LeagueMember }) => {
    return (
      <PlayerCard
        player={item}
        isSelected={selectedSet.has(item.id)}
        onPress={onPlayerToggle}
        variant={variant}
        showSelectionIndicator={showSelectionIndicator}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="h3" color={theme.text} style={styles.emptyTitle}>
        {t("noPlayersFound")}
      </Text>
      <Text variant="body" color={theme.textMuted} style={styles.emptyMessage}>
        {t("noPlayersFoundMessage")}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text variant="h3" color={theme.error} style={styles.errorTitle}>
        {t("error")}
      </Text>
      <Text variant="body" color={theme.textMuted} style={styles.errorMessage}>
        {error || t("unknownError")}
      </Text>
    </View>
  );

  const renderSeparator = () => <View style={styles.gridSeparator} />;

  if (error) {
    return renderErrorState();
  }

  return (
    <FlatList
      data={members}
      renderItem={renderPlayerItem}
      keyExtractor={(item) => item.id}
      numColumns={variant === "grid" ? numColumns : 1}
      key={variant} // Force re-render when variant changes
      columnWrapperStyle={
        variant === "grid" && numColumns > 1 ? styles.gridRow : undefined
      }
      contentContainerStyle={[
        variant === "grid" ? styles.gridContainer : styles.listContainer,
        members.length === 0 && styles.emptyContainer,
      ]}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={variant === "grid" ? renderSeparator : undefined}
      ListEmptyComponent={renderEmptyState}
      scrollEnabled={!loading}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gridContainer: {
    padding: 16,
    paddingBottom: 100, // Extra space for floating button
  },

  listContainer: {
    padding: 8,
    paddingBottom: 100, // Extra space for floating button
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },

  gridSeparator: {
    height: 8,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    textAlign: "center",
    marginBottom: 12,
  },

  emptyMessage: {
    textAlign: "center",
    lineHeight: 20,
  },

  errorState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  errorTitle: {
    textAlign: "center",
    marginBottom: 12,
  },

  errorMessage: {
    textAlign: "center",
    lineHeight: 20,
  },
});
