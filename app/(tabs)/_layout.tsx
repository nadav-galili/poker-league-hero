import { colors, getTheme } from "@/colors";
import { useLocalization } from "@/context/localization";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const theme = getTheme("light");
  const { t } = useLocalization();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.primary,
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
        tabBarActiveTintColor: theme.success,
        tabBarInactiveTintColor: theme.border,
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="my-leagues"
        options={{
          title: t("myLeagues"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("account"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
