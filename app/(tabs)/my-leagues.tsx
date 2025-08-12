import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import { useAuth } from "@/context/auth";
import { League, leagueMembers } from "@/db/schema";
import { getUserLeagues } from "@/utils/leagueUtils";
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  setTag,
} from "@/utils/sentry";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";

type LeagueData = {
  league: League;
  memberRole: "admin" | "member" | "moderator";
  joinedAt: Date;
  memberCount?: number;
  themeColor?: string;
  accentColor?: string;
};

export default function MyLeagues() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();
  const router = useRouter();
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<LeagueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeagues = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const userLeagues = await getUserLeagues(user.id);
      const themedLeagues = userLeagues.map((l, index) => {
        const themeColors = [
          colors.primary,
          colors.secondary,
          colors.highlight,
          colors.accent,
        ];
        const accentColors = [
          colors.primaryTint,
          colors.secondaryTint,
          colors.highlightTint,
          colors.accentTint,
        ];
        return {
          ...l,
          themeColor: themeColors[index % themeColors.length],
          accentColor: accentColors[index % accentColors.length],
        };
      });
      setLeagues(themedLeagues);
    } catch (error) {
      captureException(error, {
        extra: { message: "Failed to fetch user leagues" },
      });
      Alert.alert(t("error"), t("failedToFetchLeagues"));
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useFocusEffect(
    useCallback(() => {
      addBreadcrumb("User visited My Leagues screen", "navigation", {
        screen: "MyLeagues",
        timestamp: new Date().toISOString(),
      });
      setTag("current_screen", "my_leagues");
      fetchLeagues();
    }, [fetchLeagues])
  );

  const handleCreateLeague = () => {
    try {
      addBreadcrumb("User clicked Create League", "user_action", {
        screen: "MyLeagues",
        action: "create_league",
      });

      router.push("/create-league");
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
      addBreadcrumb("User clicked Join League", "user_action", {
        screen: "MyLeagues",
        action: "join_league",
      });

      console.log("Join League pressed");
      // TODO: Show join league modal with code input
      Alert.prompt(
        t("joinLeague"),
        t("enterLeagueCode"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("join"),
            onPress: (code) => {
              try {
                console.log("Joining league with code:", code);
                addBreadcrumb("User entered league code", "user_input", {
                  screen: "MyLeagues",
                  action: "join_league_code_entered",
                  codeLength: code?.length || 0,
                });
                // TODO: Implement join league logic
                captureMessage("User attempted to join league", "info", {
                  screen: "MyLeagues",
                  codeProvided: !!code,
                  codeLength: code?.length || 0,
                });
              } catch (error) {
                captureException(error as Error, {
                  function: "handleJoinLeague.onPress",
                  screen: "MyLeagues",
                  code: code || "empty",
                });
                Alert.alert(t("error"), "Failed to process league code");
              }
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

  const shareLeagueCode = async (leagueData: LeagueData) => {
    const { league } = leagueData;
    try {
      addBreadcrumb("User initiated league share", "user_action", {
        screen: "MyLeagues",
        action: "share_league",
        leagueId: league.id,
        leagueName: league.name,
        leagueCode: league.inviteCode,
      });

      // Create deep link URL for joining the league
      const deepLinkUrl = Linking.createURL(
        `/join-league/${league.inviteCode}`,
        {
          queryParams: {
            name: league.name,
            id: league.id,
          },
        }
      );

      const shareMessage = `${t("joinMyLeague")} "${league.name}"\n\n${t(
        "leagueCode"
      )} ${league.inviteCode}\n\n${t("joinHere")} ${deepLinkUrl}`;

      // Use React Native's built-in Share API which works with text/URLs
      await Share.share(
        {
          message: shareMessage,
          url: deepLinkUrl, // iOS will use this
          title: `${t("joinLeague")} ${league.name}`,
        },
        {
          dialogTitle: `${t("shareLeague")} ${league.name}`,
        }
      );

      // Track successful share
      captureMessage("League share completed successfully", "info", {
        screen: "MyLeagues",
        leagueId: league.id,
        leagueName: league.name,
        shareMethod: "native_share",
      });
    } catch (error) {
      console.error("Error sharing league:", error);

      // Check if user cancelled the share
      if (error instanceof Error && error.message === "User did not share") {
        addBreadcrumb("User cancelled league share", "user_action", {
          screen: "MyLeagues",
          action: "share_cancelled",
          leagueId: league.id,
        });
        return;
      }

      // Capture actual errors
      captureException(error as Error, {
        function: "shareLeagueCode",
        screen: "MyLeagues",
        leagueId: league.id,
        leagueName: league.name,
        leagueCode: league.inviteCode,
        deepLinkUrl: `join-league/${league.inviteCode}`,
      });

      Alert.alert(t("error"), t("failedToShare"));
    }
  };

  // Create a profiled version of the render function for performance monitoring
  const renderLeagueCardInternal = ({ item }: { item: LeagueData }) => {
    const { league, memberCount, themeColor, accentColor } = item;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.leagueCard,
          styles.brutalistShadow,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.primary,
            shadowColor: theme.shadow,
          },
          pressed && styles.pressedCard,
        ]}
        onPress={() => {
          try {
            addBreadcrumb("User tapped league card", "user_action", {
              screen: "MyLeagues",
              action: "league_card_tap",
              leagueId: league.id,
              leagueName: league.name,
            });

            console.log("League pressed:", league.name);
            // TODO: Navigate to league details

            captureMessage("User viewed league details", "info", {
              screen: "MyLeagues",
              leagueId: league.id,
              leagueName: league.name,
            });
          } catch (error) {
            captureException(error as Error, {
              function: "renderLeagueCard.onPress",
              screen: "MyLeagues",
              leagueId: league.id,
            });
          }
        }}>
        {/* League Image with colored frame */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: league.imageUrl || undefined }}
            style={styles.leagueImage}
            contentFit="cover"
            onError={(error) => {
              captureException(new Error("Image loading failed"), {
                function: "Image.onError",
                screen: "MyLeagues",
                leagueId: league.id,
                imageUri: league.imageUrl,
                error: error.toString(),
              });
            }}
          />
          <View
            style={[styles.imageFrame, { borderColor: themeColor }]}
          />
        </View>

        {/* League Info with enhanced styling */}
        <View style={styles.leagueInfo}>
          <Text variant="h4" color={theme.text} style={styles.leagueName}>
            {league.name}
          </Text>

          <View style={styles.codeContainer}>
            <View
              style={[
                styles.codeBadge,
                {
                  backgroundColor: accentColor,
                  borderColor: themeColor,
                },
              ]}>
              <Text
                variant="labelSmall"
                color={themeColor}
                style={styles.codeText}>
                {league.inviteCode}
              </Text>
            </View>

            <Pressable
              style={[styles.shareButton, { backgroundColor: themeColor }]}
              onPress={() => {
                try {
                  addBreadcrumb("User tapped share button", "user_action", {
                    screen: "MyLeagues",
                    action: "share_button_tap",
                    leagueId: league.id,
                    leagueName: league.name,
                  });
                  shareLeagueCode(item);
                } catch (error) {
                  captureException(error as Error, {
                    function: "shareButton.onPress",
                    screen: "MyLeagues",
                    leagueId: league.id,
                  });
                  Alert.alert(t("error"), "Failed to initiate share");
                }
              }}>
              <Ionicons name="share" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text
            variant="captionSmall"
            color={theme.textMuted}
            style={styles.memberCount}>
            {memberCount || 1} {t("members")}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Wrap the render function with error tracking
  const renderLeagueCard = React.useCallback(
    ({ item }: { item: LeagueData }) => {
      try {
        return renderLeagueCardInternal({ item });
      } catch (error) {
        captureException(error as Error, {
          function: "renderLeagueCard",
          screen: "MyLeagues",
          leagueId: item.league.id,
          leagueName: item.league.name,
        });
        // Return a fallback UI
        return (
          <View style={styles.errorCard}>
            <Text>Error loading league card</Text>
          </View>
        );
      }
    },
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.primary, borderBottomColor: theme.border },
        ]}>
        {/* Header Title with Language Selector */}
        <View
          style={[
            styles.headerTitleContainer,
            isRTL && styles.rtlContainer,
            isRTL && styles.rtlHeaderTitleContainer,
          ]}>
          <Text
            variant="h1"
            color={colors.textInverse}
            style={[
              styles.headerTitle,
              isRTL && styles.rtlText,
              isRTL && styles.rtlHeaderTitle,
            ]}>
            {t("myLeagues")}
          </Text>
          <View style={styles.languageSelectorWrapper}>
            <LanguageSelector size="small" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, isRTL && styles.rtlContainer]}>
          <Button
            title={t("join")}
            onPress={handleJoinLeague}
            variant="outline"
            size="small"
            icon="enter"
            backgroundColor={colors.accent}
            textColor={colors.text}
          />
          <Button
            title={t("create")}
            onPress={handleCreateLeague}
            variant="primary"
            size="small"
            icon="add-circle"
            backgroundColor={colors.secondary}
          />
        </View>
      </View>

      {/* Leagues List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
      <FlatList
        data={leagues}
        renderItem={renderLeagueCard}
        keyExtractor={(item) => item.league.id}
        contentContainerStyle={[
          styles.listContainer,
          leagues.length === 0 && styles.emptyListContainer,
        ]}
        onScrollToIndexFailed={(info) => {
          captureException(new Error("FlatList scroll to index failed"), {
            function: "FlatList.onScrollToIndexFailed",
            screen: "MyLeagues",
            index: info.index,
            highestMeasuredFrameIndex: info.highestMeasuredFrameIndex,
            averageItemLength: info.averageItemLength,
          });
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text
              variant="h2"
              color={theme.text}
              style={[styles.emptyTitle, isRTL && styles.rtlText]}>
              {t("noLeaguesYet")}
            </Text>
            <Text
              variant="body"
              color={theme.textMuted}
              style={[styles.emptySubtitle, isRTL && styles.rtlText]}>
              {t("createFirstLeague")}
            </Text>

            <View style={styles.emptyButtons}>
              <Button
                title={t("createLeague")}
                onPress={handleCreateLeague}
                variant="primary"
                size="large"
                icon="add-circle"
                fullWidth
              />
              <Button
                title={t("joinLeague")}
                onPress={handleJoinLeague}
                variant="outline"
                size="large"
                icon="enter"
                fullWidth
              />
            </View>
          </View>
        }
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorCard: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },

  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingRight: 8,
  },

  headerTitle: {
    letterSpacing: 1,
    flex: 1,
    marginRight: 12,
  },

  languageSelectorWrapper: {
    flexShrink: 0,
    minWidth: 80,
    maxWidth: 100,
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },

  rtlContainer: {
    flexDirection: "row-reverse",
  },

  rtlText: {
    textAlign: "right",
  },

  rtlHeaderTitleContainer: {
    paddingRight: 0,
    paddingLeft: 8,
  },

  rtlHeaderTitle: {
    marginRight: 0,
    marginLeft: 12,
    textAlign: "center",
  },

  listContainer: {
    padding: 20,
    gap: 16,
  },

  leagueCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    borderWidth: 6,
    position: "relative",
    overflow: "hidden",
  },

  brutalistShadow: {
    shadowOffset: { width: 32, height: 32 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 60,
  },

  pressedCard: {
    transform: [{ scale: 0.96 }, { translateX: 16 }, { translateY: 16 }],
    shadowOffset: { width: 16, height: 16 },
  },

  // Clean image styling
  imageContainer: {
    position: "relative",
    marginRight: 20,
  },

  leagueImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: colors.border,
  },

  imageFrame: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderWidth: 6,
    borderRadius: 20,
    opacity: 0.9,
  },

  // Clean info styling
  leagueInfo: {
    flex: 1,
    gap: 12,
  },

  leagueName: {
    letterSpacing: 1.2,
  },

  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  codeBadge: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 3,
  },

  codeText: {
    letterSpacing: 1,
  },

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },

  memberCount: {
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Empty State
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  emptyTitle: {
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 12,
  },

  emptySubtitle: {
    textAlign: "center",
    marginBottom: 40,
  },

  emptyButtons: {
    width: "100%",
    gap: 16,
  },
});
