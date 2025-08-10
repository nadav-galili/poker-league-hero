import { colors, getTheme } from "@/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Mock data for leagues with color themes
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
    accentColor: colors.accent,
    gradientColors: [colors.primary, colors.secondary],
  },
  {
    id: "2",
    name: "WEEKEND WARRIORS",
    code: "WW2024",
    image:
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop&crop=center",
    memberCount: 12,
    status: "active" as const,
    themeColor: colors.warning,
    accentColor: colors.info,
    gradientColors: [colors.warning, colors.secondary],
  },
];

type League = (typeof mockLeagues)[0];

export default function MyLeagues() {
  const theme = getTheme("light");

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
        <Text style={[styles.leagueName, { color: theme.primary }]}>
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
            <Text style={[styles.codeText, { color: theme.text }]}>
              LEAGUE CODE: {item.code}
            </Text>
          </View>

          <Pressable
            style={[styles.shareButton, { backgroundColor: item.themeColor }]}
            onPress={() => shareLeagueCode(item)}>
            <Ionicons name="share" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={[styles.memberCount, { color: colors.borderDark }]}>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          MY LEAGUES
        </Text>
      </View>

      {/* Leagues List */}
      <FlatList
        data={mockLeagues}
        renderItem={renderLeagueCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
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
    borderRadius: 20,
    borderWidth: 4,
    position: "relative",
    overflow: "hidden",
  },

  brutalistShadow: {
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 16,
  },

  pressedCard: {
    transform: [{ scale: 0.97 }, { translateX: 3 }, { translateY: 3 }],
    shadowOffset: { width: 4, height: 4 },
  },

  // Clean image styling
  imageContainer: {
    position: "relative",
    marginRight: 20,
  },

  leagueImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  imageFrame: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderWidth: 4,
    borderRadius: 28,
    opacity: 0.9,
  },

  // Clean info styling
  leagueInfo: {
    flex: 1,
    gap: 12,
  },

  leagueName: {
    fontSize: 19,
    color: colors.primary,
    fontWeight: "800",
    letterSpacing: 1.2,
    lineHeight: 24,
  },

  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  codeBadge: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 3,
  },

  codeText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
  },

  memberCount: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
