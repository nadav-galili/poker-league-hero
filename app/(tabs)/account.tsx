import { colors, getTheme } from "@/colors";
import { Text } from "@/components/Text";
import { useAuth } from "@/context/auth";
import { useLocalization } from "@/context/localization";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function Account() {
  const theme = getTheme("light");
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLocalization();

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.header,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}>
          <Text
            variant="h1"
            color={theme.text}
            style={[styles.headerTitle, isRTL && styles.rtlText]}>
            {t("account")}
          </Text>
        </View>
        <View style={styles.content}>
          <Text
            variant="body"
            color={colors.borderDark}
            style={styles.placeholder}>
            Please sign in to view account details
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}>
        <Text
          variant="h1"
          color={theme.text}
          style={[styles.headerTitle, isRTL && styles.rtlText]}>
          {t("account")}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            styles.brutalistShadow,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  user.picture ||
                  "https://via.placeholder.com/120x120/3057FF/FFFFFF?text=?",
              }}
              style={styles.profileImage}
              contentFit="cover"
            />
            <View
              style={[styles.imageFrame, { borderColor: colors.primary }]}
            />
            <View
              style={[
                styles.imageCornerAccent,
                { backgroundColor: colors.accent },
              ]}
            />
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text variant="h3" color={theme.text} style={styles.userName}>
                {user.name || "Unknown User"}
              </Text>
              <View
                style={[
                  styles.nameUnderline,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>

            <View style={styles.emailContainer}>
              <Ionicons name="mail" size={16} color={colors.info} />
              <Text
                variant="body"
                color={colors.borderDark}
                style={styles.userEmail}>
                {user.email || "No email"}
              </Text>
            </View>

            {user.email_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  variant="labelSmall"
                  color={colors.primary}
                  style={styles.verifiedText}>
                  VERIFIED
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsContainer}>
          <Text
            variant="h4"
            color={theme.text}
            style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t("accountActions")}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.brutalistShadow,
              { backgroundColor: colors.warning, borderColor: theme.border },
              pressed && styles.pressedButton,
            ]}
            onPress={signOut}>
            <View style={styles.actionContent}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}>
                <Ionicons name="log-out" size={20} color="#FFFFFF" />
              </View>
              <Text
                variant="button"
                color="#FFFFFF"
                style={[styles.actionText, isRTL && styles.rtlText]}>
                {t("signOut")}
              </Text>
            </View>
            <View style={[styles.actionBorder, { borderColor: colors.text }]} />
          </Pressable>
        </View>

        {/* User Details */}
        <View style={styles.detailsContainer}>
          <Text
            variant="h4"
            color={theme.text}
            style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t("userDetails")}
          </Text>

          <View
            style={[
              styles.detailCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <View style={styles.detailRow}>
              <Text
                variant="labelSmall"
                color={colors.borderDark}
                style={styles.detailLabel}>
                USER ID
              </Text>
              <Text
                variant="body"
                color={theme.text}
                style={styles.detailValue}>
                {user.id}
              </Text>
            </View>

            {user.given_name && (
              <View style={styles.detailRow}>
                <Text
                  variant="labelSmall"
                  color={colors.borderDark}
                  style={styles.detailLabel}>
                  FIRST NAME
                </Text>
                <Text
                  variant="body"
                  color={theme.text}
                  style={styles.detailValue}>
                  {user.given_name}
                </Text>
              </View>
            )}

            {user.family_name && (
              <View style={styles.detailRow}>
                <Text
                  variant="labelSmall"
                  color={colors.borderDark}
                  style={styles.detailLabel}>
                  LAST NAME
                </Text>
                <Text
                  variant="body"
                  color={theme.text}
                  style={styles.detailValue}>
                  {user.family_name}
                </Text>
              </View>
            )}

            {user.provider && (
              <View style={styles.detailRow}>
                <Text
                  variant="labelSmall"
                  color={colors.borderDark}
                  style={styles.detailLabel}>
                  PROVIDER
                </Text>
                <Text
                  variant="body"
                  color={theme.text}
                  style={styles.detailValue}>
                  {user.provider.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  },

  scrollContainer: {
    flex: 1,
  },

  content: {
    padding: 20,
    gap: 24,
  },

  placeholder: {
    textAlign: "center",
    marginTop: 40,
  },

  // Profile Card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 4,
  },

  brutalistShadow: {
    shadowColor: colors.text,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 16,
  },

  imageContainer: {
    position: "relative",
    marginRight: 20,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  imageFrame: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderWidth: 4,
    borderRadius: 36,
    opacity: 0.8,
  },

  imageCornerAccent: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  userInfo: {
    flex: 1,
    gap: 12,
  },

  nameContainer: {
    position: "relative",
  },

  userName: {
    letterSpacing: 1.2,
  },

  nameUnderline: {
    position: "absolute",
    bottom: -4,
    left: 0,
    width: "80%",
    height: 4,
    opacity: 0.8,
  },

  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  userEmail: {
    letterSpacing: 0.5,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  verifiedText: {
    letterSpacing: 1,
  },

  // Sections
  actionsContainer: {
    gap: 16,
  },

  detailsContainer: {
    gap: 16,
  },

  sectionTitle: {
    letterSpacing: 1.5,
  },

  // Action Button
  actionButton: {
    borderRadius: 16,
    borderWidth: 4,
    overflow: "hidden",
  },

  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },

  actionText: {
    letterSpacing: 1.2,
  },

  actionBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderRadius: 16,
    opacity: 0.8,
  },

  pressedButton: {
    transform: [{ scale: 0.97 }, { translateX: 3 }, { translateY: 3 }],
    shadowOffset: { width: 4, height: 4 },
  },

  // Details Card
  detailCard: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 20,
    gap: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(19,22,41,0.1)",
  },

  detailLabel: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  detailValue: {
    letterSpacing: 0.5,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },

  rtlText: {
    textAlign: "right",
  },
});
