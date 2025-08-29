import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/context/auth";
import { useLocalization } from "@/context/localization";
import { addBreadcrumb, captureException, setTag } from "@/utils/sentry";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface LeagueMember {
  id: string;
  fullName: string;
  profileImageUrl?: string;
  role: "admin" | "member";
  joinedAt: string;
}

interface LeagueData {
  id: string;
  name: string;
  imageUrl: string;
  members: LeagueMember[];
}

export default function SelectPlayers() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();
  const { fetchWithAuth } = useAuth();
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();

  const [league, setLeague] = React.useState<LeagueData | null>(null);
  const [selectedPlayers, setSelectedPlayers] = React.useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Function to load league members
  const loadLeagueMembers = React.useCallback(async () => {
    if (!leagueId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithAuth(
        `${BASE_URL}/api/leagues/${leagueId}`,
        {}
      );

      if (!response.ok) {
        throw new Error("Failed to fetch league details");
      }

      const data = await response.json();
      setLeague(data.league);

      addBreadcrumb("League members loaded for game selection", "data", {
        screen: "SelectPlayers",
        leagueId,
        memberCount: data.league.members?.length || 0,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load league members";
      setError(errorMessage);
      captureException(err as Error, {
        function: "loadLeagueMembers",
        screen: "SelectPlayers",
        leagueId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, fetchWithAuth]);

  // Load league members on mount
  React.useEffect(() => {
    loadLeagueMembers();
  }, [loadLeagueMembers]);

  // Track screen visit
  React.useEffect(() => {
    addBreadcrumb("User visited Select Players screen", "navigation", {
      screen: "SelectPlayers",
      leagueId,
      timestamp: new Date().toISOString(),
    });
    setTag("current_screen", "select_players");
  }, [leagueId]);

  const handleBack = () => {
    router.back();
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }

      addBreadcrumb("Player selection toggled", "user_action", {
        screen: "SelectPlayers",
        playerId,
        isSelected: newSet.has(playerId),
        totalSelected: newSet.size,
      });

      return newSet;
    });
  };

  const handleStartGame = () => {
    if (selectedPlayers.size < 2) {
      Alert.alert(t("error"), t("minimumPlayersRequired"));
      return;
    }

    addBreadcrumb("User started game with selected players", "user_action", {
      screen: "SelectPlayers",
      leagueId,
      selectedPlayerCount: selectedPlayers.size,
    });

    // TODO: Navigate to game creation/setup screen with selected players
    console.log("Starting game with players:", Array.from(selectedPlayers));
  };

  const renderPlayerItem = ({ item }: { item: LeagueMember }) => {
    const isSelected = selectedPlayers.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          {
            backgroundColor: isSelected
              ? colors.primaryTint
              : theme.surfaceElevated,
            borderColor: isSelected ? colors.primary : theme.border,
          },
        ]}
        onPress={() => togglePlayerSelection(item.id)}
        activeOpacity={0.7}>
        {/* Selection Indicator */}
        <View
          style={[
            styles.selectionIndicator,
            {
              backgroundColor: isSelected ? colors.primary : theme.border,
              borderColor: isSelected ? colors.primary : theme.border,
            },
          ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={colors.textInverse} />
          )}
        </View>

        {/* Player Image */}
        <View style={styles.playerImageContainer}>
          <Image
            source={{
              uri:
                item.profileImageUrl ||
                "https://via.placeholder.com/60x60/cccccc/666666?text=?",
            }}
            style={styles.playerImage}
            contentFit="cover"
            onError={(error) => {
              captureException(new Error("Player image loading failed"), {
                function: "Image.onError",
                screen: "SelectPlayers",
                playerId: item.id,
                imageUri: item.profileImageUrl,
                error: error.toString(),
              });
            }}
          />
        </View>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text
            variant="h4"
            color={isSelected ? colors.primary : theme.text}
            style={styles.playerName}>
            {item.fullName}
          </Text>

          <View style={styles.playerMeta}>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    item.role === "admin"
                      ? colors.accent
                      : colors.secondaryTint,
                  borderColor:
                    item.role === "admin" ? colors.accent : colors.secondary,
                },
              ]}>
              <Text
                variant="captionSmall"
                color={
                  item.role === "admin" ? colors.textInverse : colors.secondary
                }
                style={styles.roleText}>
                {item.role === "admin" ? t("admin") : t("member")}
              </Text>
            </View>
          </View>
        </View>

        {/* Selection Arrow */}
        <View style={styles.selectionArrow}>
          <Ionicons
            name={isSelected ? "remove-circle" : "add-circle"}
            size={24}
            color={isSelected ? colors.primary : theme.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
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
            {t("loadingPlayers")}
          </Text>
        </View>
      </View>
    );
  }

  if (error || !league) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
            {t("selectPlayers")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Text variant="h3" color={theme.error} style={styles.errorTitle}>
            {t("error")}
          </Text>
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.errorMessage}>
            {error || t("leagueNotFound")}
          </Text>
          <Button
            title={t("retry")}
            onPress={loadLeagueMembers}
            variant="outline"
            size="small"
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
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color={colors.textInverse}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
          {t("selectPlayers")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* League Info Header */}
      <View
        style={[
          styles.leagueHeader,
          { backgroundColor: theme.surfaceElevated },
        ]}>
        <Image
          source={{ uri: league.imageUrl }}
          style={styles.leagueImage}
          contentFit="cover"
        />
        <View style={styles.leagueInfo}>
          <Text variant="h3" color={theme.text} style={styles.leagueName}>
            {league.name}
          </Text>
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.instruction}>
            {t("selectPlayersInstruction")}
          </Text>
        </View>
      </View>

      {/* Selection Summary */}
      <View
        style={[
          styles.selectionSummary,
          { backgroundColor: colors.primaryTint },
        ]}>
        <Text variant="h4" color={colors.primary} style={styles.selectionCount}>
          {selectedPlayers.size} {t("playersSelected")}
        </Text>
      </View>

      {/* Players List */}
      <FlatList
        data={league.members}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="h3" color={theme.text} style={styles.emptyTitle}>
              {t("noPlayersFound")}
            </Text>
            <Text
              variant="body"
              color={theme.textMuted}
              style={styles.emptyMessage}>
              {t("noPlayersMessage")}
            </Text>
          </View>
        }
      />

      {/* Start Game Button */}
      {selectedPlayers.size > 0 && (
        <View
          style={[
            styles.startGameContainer,
            { backgroundColor: theme.background },
          ]}>
          <Button
            title={`${t("startGame")} (${selectedPlayers.size})`}
            onPress={handleStartGame}
            variant="primary"
            size="large"
            backgroundColor={colors.secondary}
            disabled={selectedPlayers.size < 2}
            fullWidth
          />
        </View>
      )}
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
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  leagueImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.primary,
    marginRight: 12,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  instruction: {
    lineHeight: 18,
  },
  selectionSummary: {
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  selectionCount: {
    letterSpacing: 1,
    fontWeight: "700",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for floating button
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerImageContainer: {
    marginRight: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    letterSpacing: 1,
    marginBottom: 6,
  },
  playerMeta: {
    flexDirection: "row",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
  },
  roleText: {
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  selectionArrow: {
    marginLeft: 8,
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
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  emptyMessage: {
    textAlign: "center",
  },
});
