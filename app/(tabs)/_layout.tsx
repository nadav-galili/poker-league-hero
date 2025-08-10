import { colors, getTheme } from "@/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const theme = getTheme("light");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 3,
          borderTopColor: theme.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
          elevation: 12,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.3,
          shadowRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginTop: 4,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: colors.borderDark,
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="my-leagues"
        options={{
          title: "MY LEAGUES",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "ACCOUNT",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
