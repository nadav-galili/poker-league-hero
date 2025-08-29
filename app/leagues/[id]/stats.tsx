import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { BASE_URL } from "@/constants";
import { useLocalization } from "@/context/localization";
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
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* League Header */}
        <View
          style={[
            styles.leagueHeader,
            { backgroundColor: theme.surfaceElevated },
          ]}>
          <View style={styles.leagueImageContainer}>
            <Image
              source={{ uri: league.imageUrl }}
              style={styles.leagueImage}
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

          <View style={styles.leagueInfo}>
            <Text variant="h2" color={theme.text} style={styles.leagueName}>
              {league.name}
            </Text>

            <View style={styles.leagueMetaContainer}>
              <View
                style={[
                  styles.codeBadge,
                  {
                    backgroundColor: colors.primaryTint,
                    borderColor: colors.primary,
                  },
                ]}>
                <Text
                  variant="labelSmall"
                  color={colors.primary}
                  style={styles.codeText}>
                  {league.inviteCode}
                </Text>
              </View>

              <Text
                variant="captionSmall"
                color={theme.textMuted}
                style={styles.memberCount}>
                {league.memberCount} {t("members")}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Placeholder - TODO: Add actual stats */}
        <View
          style={[
            styles.statsContainer,
            { backgroundColor: theme.surfaceElevated },
          ]}>
          <Text variant="h3" color={theme.text} style={styles.sectionTitle}>
            {t("statistics")}
          </Text>

          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.comingSoon}>
            {t("statsComingSoon")}
          </Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
  leagueHeader: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  leagueImageContainer: {
    marginRight: 20,
  },
  leagueImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: colors.primary,
  },
  leagueInfo: {
    flex: 1,
    justifyContent: "center",
  },
  leagueName: {
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  leagueMetaContainer: {
    gap: 8,
  },
  codeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 3,
  },
  codeText: {
    letterSpacing: 1,
    fontWeight: "700",
  },
  memberCount: {
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  sectionTitle: {
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  comingSoon: {
    textAlign: "center",
    fontStyle: "italic",
  },
});
