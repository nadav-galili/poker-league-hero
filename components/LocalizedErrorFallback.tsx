import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  onRetry: () => void;
}

/**
 * Localized error fallback component for use with ErrorBoundary
 */
const LocalizedErrorFallback: React.FC<Props> = ({ onRetry }) => {
  const { t } = useLocalization();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.errorOccurred}</Text>
      <Text style={styles.message}>{t.errorMessage}</Text>
      <Button title={t.tryAgain} onPress={onRetry} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  retryButton: {
    marginTop: 16,
  },
});

export default LocalizedErrorFallback;
