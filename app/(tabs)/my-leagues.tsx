import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";

// Mock data for leagues with neo-brutalist color themes
const mockLeagues = [
  {
    id: "1",
    name: "FRIDAY NIGHT POKER",
    code: "FNP2024",
    image:
      "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=400&fit=crop&crop=center",
    memberCount: 8,
    status: "active" as const,
    themeColor: colors.primary, // Electric blue
    accentColor: colors.primaryTint, // Light blue
    variant: "primary" as const,
  },
  {
    id: "2",
    name: "WEEKEND WARRIORS",
    code: "WW2024",
    image:
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop&crop=center",
    memberCount: 12,
    status: "active" as const,
    themeColor: colors.secondary, // Hot pink
    accentColor: colors.secondaryTint, // Light pink
    variant: "secondary" as const,
  },
  {
    id: "3",
    name: "ROYAL FLUSH CLUB",
    code: "RFC2024",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center",
    memberCount: 15,
    status: "active" as const,
    themeColor: colors.highlight, // Toxic lime
    accentColor: colors.highlightTint, // Light lime
    variant: "highlight" as const,
  },
  {
    id: "4",
    name: "HIGH STAKES HEROES",
    code: "HSH2024",
    image:
      "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=400&fit=crop&crop=center",
    memberCount: 6,
    status: "active" as const,
    themeColor: colors.accent, // Neon yellow
    accentColor: colors.accentTint, // Light yellow
    variant: "accent" as const,
  },
];

type League = (typeof mockLeagues)[0];

export default function MyLeagues() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();

  const handleCreateLeague = () => {
    console.log("Create League pressed");
    // TODO: Navigate to create league form
    Alert.alert(t("createLeague"), t("createLeaguePrompt"));
  };

  const handleJoinLeague = () => {
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
            console.log("Joining league with code:", code);
            // TODO: Implement join league logic
          },
        },
      ],
      "plain-text"
    );
  };

  const shareLeagueCode = async (league: League) => {
    try {
      // Create deep link URL for joining the league
      const deepLinkUrl = Linking.createURL(`/join-league/${league.code}`, {
        queryParams: {
          name: league.name,
          id: league.id,
        },
      });

      const shareMessage = `${t("joinMyLeague")} "${league.name}"\n\n${t(
        "leagueCode"
      )} ${league.code}\n\n${t("joinHere")} ${deepLinkUrl}`;

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
    } catch (error) {
      console.error("Error sharing league:", error);
      // Check if user cancelled the share
      if (error instanceof Error && error.message === "User did not share") {
        // User cancelled, don't show error
        return;
      }
      Alert.alert(t("error"), t("failedToShare"));
    }
  };

  const renderLeagueCard = ({ item }: { item: League }) => (
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
        console.log("League pressed:", item.name);
      }}>
      {/* League Image with colored frame */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.leagueImage}
          contentFit="cover"
        />
        <View style={[styles.imageFrame, { borderColor: item.themeColor }]} />
      </View>

      {/* League Info with enhanced styling */}
      <View style={styles.leagueInfo}>
        <Text variant="h4" color={theme.text} style={styles.leagueName}>
          {item.name}
        </Text>

        <View style={styles.codeContainer}>
          <View
            style={[
              styles.codeBadge,
              {
                backgroundColor: item.accentColor,
                borderColor: item.themeColor,
              },
            ]}>
            <Text
              variant="labelSmall"
              color={item.themeColor}
              style={styles.codeText}>
              {item.code}
            </Text>
          </View>

          <Pressable
            style={[styles.shareButton, { backgroundColor: item.themeColor }]}
            onPress={() => shareLeagueCode(item)}>
            <Ionicons name="share" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text
          variant="captionSmall"
          color={theme.textMuted}
          style={styles.memberCount}>
          {item.memberCount} {t("members")}
        </Text>
      </View>
    </Pressable>
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
      <FlatList
        data={mockLeagues}
        renderItem={renderLeagueCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          mockLeagues.length === 0 && styles.emptyListContainer,
        ]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 4,
    position: "relative",
    overflow: "hidden",
  },

  brutalistShadow: {
    shadowOffset: { width: 16, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 32,
  },

  pressedCard: {
    transform: [{ scale: 0.96 }, { translateX: 8 }, { translateY: 8 }],
    shadowOffset: { width: 8, height: 8 },
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
    borderWidth: 4,
    borderColor: colors.border,
  },

  imageFrame: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderWidth: 4,
    borderRadius: 18,
    opacity: 0.8,
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
