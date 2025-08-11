import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
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

// Mock data for leagues with modern color themes
const mockLeagues = [
  {
    id: "1",
    name: "FRIDAY NIGHT POKER",
    code: "FNP2024",
    image:
      "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=400&fit=crop&crop=center",
    memberCount: 8,
    status: "active" as const,
    themeColor: colors.primary,
    accentColor: colors.primaryTint,
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
    themeColor: colors.secondary,
    accentColor: colors.secondary,
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
    themeColor: colors.info,
    accentColor: colors.infoTint,
    variant: "info" as const,
  },
];

type League = (typeof mockLeagues)[0];

export default function MyLeagues() {
  const theme = getTheme("light");

  const handleCreateLeague = () => {
    console.log("Create League pressed");
    // TODO: Navigate to create league form
    Alert.alert(
      "Create League",
      "Navigation to create league form coming soon!"
    );
  };

  const handleJoinLeague = () => {
    console.log("Join League pressed");
    // TODO: Show join league modal with code input
    Alert.prompt(
      "Join League",
      "Enter league code:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join",
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

      const shareMessage = `🎮 Join my poker league: "${league.name}"\n\nLeague Code: ${league.code}\n\nJoin here: ${deepLinkUrl}`;

      // Use React Native's built-in Share API which works with text/URLs
      await Share.share(
        {
          message: shareMessage,
          url: deepLinkUrl, // iOS will use this
          title: `Join ${league.name} League`,
        },
        {
          dialogTitle: `Share ${league.name} League`,
        }
      );
    } catch (error) {
      console.error("Error sharing league:", error);
      // Check if user cancelled the share
      if (error instanceof Error && error.message === "User did not share") {
        // User cancelled, don't show error
        return;
      }
      Alert.alert("Error", "Failed to share league code");
    }
  };

  const renderLeagueCard = ({ item }: { item: League }) => (
    <Pressable
      style={({ pressed }) => [
        styles.leagueCard,
        styles.brutalistShadow,
        {
          backgroundColor: theme.surface,
          borderColor: item.themeColor,
          shadowColor: item.themeColor,
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
          color={colors.textMuted}
          style={styles.memberCount}>
          {item.memberCount} MEMBERS
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}>
        <Text variant="h1" color={theme.text} style={styles.headerTitle}>
          MY LEAGUES
        </Text>

        {/* Top Bar Action Buttons */}
        <View style={styles.topButtonsContainer}>
          <Button
            title="Join"
            onPress={handleJoinLeague}
            variant="outline"
            size="small"
            icon="enter"
            backgroundColor={colors.secondary}
            textColor="#FFFFFF"
          />
          <Button
            title="Create"
            onPress={handleCreateLeague}
            variant="primary"
            size="small"
            icon="add-circle"
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
            <Text variant="h2" color={theme.text} style={styles.emptyTitle}>
              NO LEAGUES YET
            </Text>
            <Text
              variant="body"
              color={colors.textMuted}
              style={styles.emptySubtitle}>
              Create your first league or join an existing one
            </Text>

            <View style={styles.emptyButtons}>
              <Button
                title="Create League"
                onPress={handleCreateLeague}
                variant="primary"
                size="large"
                icon="add-circle"
                fullWidth
              />
              <Button
                title="Join League"
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
    borderBottomWidth: 3,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 8,
  },

  headerTitle: {
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 16,
  },

  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },

  listContainer: {
    padding: 20,
    gap: 16,
  },

  leagueCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
  },

  brutalistShadow: {
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 8,
  },

  pressedCard: {
    transform: [{ scale: 0.98 }, { translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },

  // Clean image styling
  imageContainer: {
    position: "relative",
    marginRight: 20,
  },

  leagueImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  imageFrame: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderRadius: 20,
    opacity: 0.6,
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
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },

  codeText: {
    letterSpacing: 1,
  },

  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 4,
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
