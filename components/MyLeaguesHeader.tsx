/**
 * My Leagues Header Component
 */

import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MyLeaguesHeaderProps {
  onJoinLeague: () => void;
  onCreateLeague: () => void;
}

export function MyLeaguesHeader({
  onJoinLeague,
  onCreateLeague,
}: MyLeaguesHeaderProps) {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();

  return (
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
          onPress={onJoinLeague}
          variant="outline"
          size="small"
          icon="enter"
          backgroundColor={colors.success}
          textColor={colors.text}
        />
        <Button
          title={t("create")}
          onPress={onCreateLeague}
          variant="primary"
          size="small"
          icon="add-circle"
          backgroundColor={colors.secondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
