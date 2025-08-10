import { colors, getTheme } from "@/colors";
import { StyleSheet, Text, View } from "react-native";

export default function MyLeagues() {
  const theme = getTheme("light");

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

      {/* Content will go here */}
      <View style={styles.content}>
        <Text style={[styles.placeholder, { color: colors.borderDark }]}>
          Leagues content coming soon...
        </Text>
      </View>
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

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  placeholder: {
    fontSize: 16,
    fontWeight: "500",
  },
});
