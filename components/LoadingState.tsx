/**
 * Loading State Component
 */

import { getTheme } from "@/colors";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingState() {
  const theme = getTheme("light");
  const { t } = useLocalization();

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text variant="body" color={theme.textMuted} style={styles.loadingText}>
        {t("loadingLeagues")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
