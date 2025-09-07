import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { BASE_URL } from "@/constants";
import { useLocalization } from "@/context/localization";
import { tw, twMerge } from "@/styles/tw";
import { addBreadcrumb, captureException, setTag } from "@/utils/sentry";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface LeagueData {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function LeagueStats() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [league, setLeague] = React.useState<LeagueData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Function to load league details
  const loadLeagueDetails = React.useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/leagues/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch league details");
      }

      const data = await response.json();
      setLeague(data.league);

      addBreadcrumb("League details loaded", "data", {
        screen: "LeagueStats",
        leagueId: id,
        leagueName: data.league?.name,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load league details";
      setError(errorMessage);
      captureException(err as Error, {
        function: "loadLeagueDetails",
        screen: "LeagueStats",
        leagueId: id,
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load league details on mount
  React.useEffect(() => {
    loadLeagueDetails();
  }, [loadLeagueDetails]);

  // Track screen visit
  React.useEffect(() => {
    addBreadcrumb("User visited League Stats screen", "navigation", {
      screen: "LeagueStats",
      leagueId: id,
      timestamp: new Date().toISOString(),
    });
    setTag("current_screen", "league_stats");
  }, [id]);

  const handleBack = () => {
    router.back();
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
            {t("leagueStats")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.loadingText}>
            {t("loadingLeagueDetails")}
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
            {t("leagueStats")}
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
            onPress={loadLeagueDetails}
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
          {t("leagueStats")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={tw["flex-1"]}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* League Header */}
        <View
          style={twMerge(
            "flex-row",
            "p-5",
            "rounded-xl",
            "border-6",
            "border-border",
            "bg-surfaceElevated",
            "mb-5",
            "shadow-lg"
          )}>
          <View style={tw["mr-5"]}>
            <Image
              source={{ uri: league.imageUrl }}
              style={twMerge(
                "w-25",
                "h-25",
                "rounded-xl",
                "border-6",
                "border-primary"
              )}
              contentFit="cover"
              onError={(error) => {
                captureException(new Error("League image loading failed"), {
                  function: "Image.onError",
                  screen: "LeagueStats",
                  leagueId: league.id,
                  imageUri: league.imageUrl,
                  error: error.toString(),
                });
              }}
            />
          </View>

          <View style={twMerge("flex-1", "justify-center")}>
            <Text
              variant="h2"
              color={theme.text}
              style={twMerge("tracking-wider", "mb-3")}>
              {league.name}
            </Text>

            <View style={tw["gap-2"]}>
              <View
                style={twMerge(
                  "self-start",
                  "px-3",
                  "py-1.5",
                  "rounded-md",
                  "border-3",
                  "bg-primaryTint",
                  "border-primary"
                )}>
                <Text
                  variant="labelSmall"
                  color={colors.primary}
                  style={twMerge("tracking-wide", "font-bold")}>
                  {league.inviteCode}
                </Text>
              </View>

              <Text
                variant="captionSmall"
                color={theme.textMuted}
                style={twMerge("tracking-wide", "uppercase")}>
                {league.memberCount} {t("members")}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Action Cards */}
        <View style={tw["gap-4"]}>
          {/* View Detailed Stats Card */}
          <TouchableOpacity
            style={twMerge(
              "flex-row",
              "items-center",
              "p-5",
              "bg-success",
              "rounded-xl",
              "border-6",
              "border-border",
              "shadow-lg"
            )}
            onPress={() => {
              // Navigate to detailed stats screen
              router.push(`/leagues/${league.id}/league-stats-screen`);
            }}>
            <View
              style={twMerge(
                "w-15",
                "h-15",
                "rounded-xl",
                "items-center",
                "justify-center",
                "mr-4",
                "border-3",
                "border-border",
                "bg-primary"
              )}>
              <Ionicons
                name="stats-chart"
                size={32}
                color={colors.textInverse}
              />
            </View>

            <View style={tw["flex-1"]}>
              <Text
                variant="h3"
                color={theme.text}
                style={twMerge("tracking-wider", "mb-1", "font-bold")}>
                {t("viewDetailedStats")}
              </Text>
              <Text
                variant="body"
                color={theme.textMuted}
                style={tw["leading-5"]}>
                {t("viewStatsDescription")}
              </Text>
            </View>

            <View style={tw["ml-3"]}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Start New Game Card */}
          <TouchableOpacity
            style={twMerge(
              "flex-row",
              "items-center",
              "p-5",
              "rounded-xl",
              "border-6",
              "bg-secondary",
              "border-border",
              "shadow-lg"
            )}
            onPress={() => {
              // Navigate to select players screen
              router.push(`/games/${league.id}/select-players`);
            }}>
            <View
              style={twMerge(
                "w-15",
                "h-15",
                "rounded-xl",
                "items-center",
                "justify-center",
                "mr-4",
                "border-3",
                "border-border",
                "bg-textInverse"
              )}>
              <Ionicons name="play-circle" size={32} color={colors.secondary} />
            </View>

            <View style={tw["flex-1"]}>
              <Text
                variant="h3"
                color={colors.textInverse}
                style={twMerge("tracking-wider", "mb-1", "font-bold")}>
                {t("startNewGame")}
              </Text>
              <Text
                variant="body"
                color={colors.textInverse}
                style={twMerge("leading-5", "opacity-90")}>
                {t("startGameDescription")}
              </Text>
            </View>

            <View style={tw["ml-3"]}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.textInverse}
              />
            </View>
          </TouchableOpacity>
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
});
