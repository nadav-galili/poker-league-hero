import { colors, getTheme } from "@/colors";
import { Text } from "@/components/Text";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/context/auth";
import { useLocalization } from "@/context/localization";
import { addBreadcrumb, captureException } from "@/utils/sentry";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface LeagueStats {
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

interface LeagueData {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  status: string;
  createdAt: string;
}

export default function LeagueStatsScreen() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();
  const { fetchWithAuth } = useAuth();
  const { id: leagueId } = useLocalSearchParams<{ id: string }>();

  const [league, setLeague] = React.useState<LeagueData | null>(null);
  const [stats, setStats] = React.useState<LeagueStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Load league data and stats
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

      addBreadcrumb("League stats loaded", "data", {
        screen: "LeagueStatsScreen",
        leagueId,
        totalGames: statsData.stats?.totalGames || 0,
      });
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

  React.useEffect(() => {
    loadLeagueData();
  }, [loadLeagueData]);

  React.useEffect(() => {
    addBreadcrumb("User visited League Stats screen", "navigation", {
      screen: "LeagueStatsScreen",
      leagueId,
      timestamp: new Date().toISOString(),
    });
  }, [leagueId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeagueData();
  };

  const handleBack = () => {
    router.back();
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "₪0.00";
    }
    return `₪${amount.toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.loadingText}>
            {t("loadingStats")}
          </Text>
        </View>
      </View>
    );
  }

  if (error || !league || !stats) {
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
        </View>
        <View style={styles.errorContainer}>
          <Text variant="h3" color={theme.error} style={styles.errorTitle}>
            {t("error")}
          </Text>
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.errorMessage}>
            {error || t("statsNotFound")}
          </Text>
          <TouchableOpacity
            onPress={loadLeagueData}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text variant="labelSmall" color={colors.textInverse}>
              {t("retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statCards = [
    {
      title: t("totalGames"),
      value: stats.totalGames.toString(),
      icon: "game-controller",
      color: colors.primary,
      subtitle: `${stats.activeGames} ${t("active")}, ${
        stats.finishedGames
      } ${t("finished")}`,
    },
    {
      title: t("totalProfit"),
      value: formatCurrency(stats.totalProfit),
      icon: "trending-up",
      color: stats.totalProfit >= 0 ? colors.success : colors.error,
      subtitle:
        stats.totalProfit >= 0 ? t("positiveProfit") : t("negativeProfit"),
    },
    {
      title: t("totalBuyIns"),
      value: formatCurrency(stats.totalBuyIns),
      icon: "arrow-down-circle",
      color: colors.secondary,
      subtitle: t("totalMoneyIn"),
    },
    {
      title: t("totalBuyOuts"),
      value: formatCurrency(stats.totalBuyOuts),
      icon: "arrow-up-circle",
      color: colors.accent,
      subtitle: t("totalMoneyOut"),
    },
    {
      title: t("totalPlayers"),
      value: stats.totalPlayers.toString(),
      icon: "people",
      color: colors.info,
      subtitle: t("uniquePlayers"),
    },
    {
      title: t("avgGameDuration"),
      value: formatDuration(stats.averageGameDuration),
      icon: "time",
      color: colors.highlight,
      subtitle: t("perGame"),
    },
  ];

  const topPlayers = [
    {
      title: t("mostProfitablePlayer"),
      player: stats.mostProfitablePlayer,
      icon: "trophy",
      color: colors.success,
    },
    {
      title: t("mostActivePlayer"),
      player: stats.mostActivePlayer,
      icon: "star",
      color: colors.primary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.textInverse}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text
              variant="h3"
              color={colors.textInverse}
              style={styles.headerTitle}>
              {league.name}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* League Image */}
      {league.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: league.imageUrl }}
            style={styles.leagueImage}
            contentFit="cover"
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Main Stats Grid */}
        <View style={styles.section}>
          <Text variant="h3" color={theme.text} style={styles.sectionTitle}>
            {t("leagueOverview")}
          </Text>
          <View style={styles.statsGrid}>
            {statCards.map((card, index) => (
              <View
                key={index}
                style={[
                  styles.statCard,
                  { backgroundColor: theme.surfaceElevated },
                ]}>
                <View style={styles.statCardContent}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: card.color + "20" },
                    ]}>
                    <Ionicons
                      name={card.icon as any}
                      size={24}
                      color={card.color}
                    />
                  </View>
                  <Text
                    variant="h4"
                    color={theme.text}
                    style={styles.statValue}>
                    {card.value}
                  </Text>
                  <Text
                    variant="captionSmall"
                    color={theme.textSecondary}
                    style={styles.statTitle}>
                    {card.title}
                  </Text>
                  <Text
                    variant="captionSmall"
                    color={theme.textMuted}
                    style={styles.statSubtitle}>
                    {card.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Players */}
        <View style={styles.section}>
          <Text variant="h3" color={theme.text} style={styles.sectionTitle}>
            {t("topPerformers")}
          </Text>
          {topPlayers.map((item, index) => (
            <View
              key={index}
              style={[
                styles.playerCard,
                { backgroundColor: theme.surfaceElevated },
              ]}>
              <View style={styles.playerCardContent}>
                <View style={styles.playerInfo}>
                  <Text
                    variant="h4"
                    color={theme.text}
                    style={styles.playerTitle}>
                    {item.title}
                  </Text>
                  <Text
                    variant="h3"
                    color={item.color}
                    style={styles.playerName}>
                    {item.player.name}
                  </Text>
                  <Text
                    variant="body"
                    color={theme.textSecondary}
                    style={styles.playerStats}>
                    {item.title === t("mostProfitablePlayer")
                      ? formatCurrency((item.player as any).profit)
                      : `${(item.player as any).gamesPlayed} ${t("games")}`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.playerIconContainer,
                    { backgroundColor: item.color + "20" },
                  ]}>
                  <Ionicons
                    name={item.icon as any}
                    size={32}
                    color={item.color}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Stats */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text variant="h3" color={theme.text} style={styles.sectionTitle}>
            {t("additionalStats")}
          </Text>
          <View
            style={[
              styles.additionalCard,
              { backgroundColor: theme.surfaceElevated },
            ]}>
            <View style={styles.additionalRow}>
              <Text variant="body" color={theme.textSecondary}>
                {t("leagueCreated")}
              </Text>
              <Text
                variant="body"
                color={theme.text}
                style={{ fontWeight: "600" }}>
                {new Date(league.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.additionalRow}>
              <Text variant="body" color={theme.textSecondary}>
                {t("leagueStatus")}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      league.status === "active"
                        ? colors.success + "20"
                        : colors.warning + "20",
                  },
                ]}>
                <Text
                  variant="captionSmall"
                  color={
                    league.status === "active" ? colors.success : colors.warning
                  }
                  style={styles.statusText}>
                  {league.status}
                </Text>
              </View>
            </View>
            {league.description && (
              <View style={styles.divider}>
                <Text
                  variant="body"
                  color={theme.textSecondary}
                  style={{ marginBottom: 8 }}>
                  {t("description")}
                </Text>
                <Text variant="body" color={theme.text}>
                  {league.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  leagueImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  statCardContent: {
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statValue: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 4,
  },
  statTitle: {
    textAlign: "center",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statSubtitle: {
    textAlign: "center",
    fontSize: 11,
  },
  playerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  playerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playerInfo: {
    flex: 1,
  },
  playerTitle: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  playerName: {
    fontWeight: "700",
  },
  playerStats: {
    marginTop: 4,
  },
  playerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.border,
  },
  additionalCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  additionalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusText: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.text,
  },
});
