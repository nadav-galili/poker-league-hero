import { colors } from "@/colors";
import { Text } from "@/components/Text";
import { LeagueData } from "@/hooks/useLeagueStats";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface LeagueHeaderProps {
  league: LeagueData;
  isRTL: boolean;
  onBack: () => void;
}

export default function LeagueHeader({ league, isRTL, onBack }: LeagueHeaderProps) {
  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
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

      {league.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: league.imageUrl }}
            style={styles.leagueImage}
            contentFit="cover"
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});