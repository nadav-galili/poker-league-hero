/**
 * League Card Component
 */

import React from "react";
import { Pressable, View, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getTheme, colors } from "@/colors";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import { LeagueWithTheme } from "@/app/types/league";
import { captureException } from "@/utils/sentry";

interface LeagueCardProps {
  league: LeagueWithTheme;
  onPress: (league: LeagueWithTheme) => void;
  onShare: (league: LeagueWithTheme) => void;
}

export function LeagueCard({ league, onPress, onShare }: LeagueCardProps) {
  const theme = getTheme("light");
  const { t } = useLocalization();

  const handlePress = () => {
    try {
      onPress(league);
    } catch (error) {
      captureException(error as Error, {
        function: "LeagueCard.onPress",
        screen: "MyLeagues",
        leagueId: league.id,
      });
    }
  };

  const handleShare = () => {
    try {
      onShare(league);
    } catch (error) {
      captureException(error as Error, {
        function: "LeagueCard.onShare",
        screen: "MyLeagues",
        leagueId: league.id,
      });
      Alert.alert(t("error"), "Failed to initiate share");
    }
  };

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
      onPress={handlePress}>
      {/* League Image with colored frame */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: league.image }}
          style={styles.leagueImage as any}
          contentFit="cover"
          onError={(error) => {
            captureException(new Error("Image loading failed"), {
              function: "LeagueCard.Image.onError",
              screen: "MyLeagues",
              leagueId: league.id,
              imageUri: league.image,
              error: error.toString(),
            });
          }}
        />
        <View
          style={[styles.imageFrame, { borderColor: league.themeColor }]}
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
                backgroundColor: league.accentColor,
                borderColor: league.themeColor,
              },
            ]}>
            <Text variant="labelSmall" color={league.themeColor}>
              {t("leagueCode")}
            </Text>
            <Text
              variant="body"
              color={league.themeColor}
              style={styles.codeText}>
              {league.code}
            </Text>
          </View>

          <Pressable
            style={[
              styles.shareButton,
              { backgroundColor: league.themeColor },
            ]}
            onPress={handleShare}>
            <Ionicons name="share" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text
          variant="captionSmall"
          color={theme.textMuted}
          style={styles.memberCount}>
          {league.memberCount} {t("members")}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: "underline",
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
});
