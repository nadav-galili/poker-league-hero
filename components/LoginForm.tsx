import { colors, getTheme } from "@/colors";
import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

export default function LoginForm() {
  const { signIn } = useAuth();
  const theme = getTheme("light");

  const handleGuest = () => {
    console.log("Guest login clicked");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero section with app icon */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.appIcon}
            contentFit="contain"
          />
          {/* Neo-brutalist frame around icon */}
          <View style={styles.iconFrame} />
        </View>

        <Text variant="display" color={theme.text} style={styles.appTitle}>
          POKER LEAGUE
        </Text>
        <Text
          variant="display"
          color={theme.primary}
          style={styles.appSubtitle}>
          HERO
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={signIn}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.brutalistShadow,
            { backgroundColor: theme.primary },
            pressed && styles.pressedButton,
          ]}>
          <View style={styles.buttonContent}>
            <View style={styles.iconBadge}>
              <Ionicons name="logo-google" size={24} color="#FFFFFF" />
            </View>
            <Text variant="button" color="#FFFFFF" style={styles.buttonText}>
              SIGN IN WITH GOOGLE
            </Text>
          </View>
          {/* Neo-brutalist button border */}
          <View style={styles.buttonBorder} />
        </Pressable>

        <Pressable
          onPress={handleGuest}
          style={({ pressed }) => [
            styles.secondaryButton,
            styles.brutalistShadow,
            { backgroundColor: theme.info },
            pressed && styles.pressedButton,
          ]}>
          <View style={styles.buttonContent}>
            <View style={styles.iconBadge}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
            <Text variant="button" color="#FFFFFF" style={styles.buttonText}>
              CONTINUE AS GUEST
            </Text>
          </View>
          <View style={styles.buttonBorder} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 48,
    position: "relative",
    paddingTop: 16, // Add padding to prevent icon frame from being cut off
  },

  iconContainer: {
    position: "relative",
    marginBottom: 24,
    padding: 8, // Add padding to accommodate the frame
  },

  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 28,
  },

  iconFrame: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderWidth: 4,
    borderColor: colors.text,
    borderRadius: 36,
    opacity: 0.8,
  },

  appTitle: {
    letterSpacing: 2,
    textAlign: "center",
  },

  appSubtitle: {
    letterSpacing: 2,
    textAlign: "center",
    marginTop: -8,
  },

  buttonContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 20,
  },

  primaryButton: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },

  secondaryButton: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
  },

  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },

  buttonText: {
    letterSpacing: 1,
  },

  buttonBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: colors.text,
    borderRadius: 16,
    opacity: 0.8,
  },

  brutalistShadow: {
    shadowColor: colors.text,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 12,
  },

  pressedButton: {
    transform: [{ scale: 0.98 }, { translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 3, height: 3 },
  },
});
