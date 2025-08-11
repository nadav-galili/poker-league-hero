import { getTheme } from "@/colors";
import LoginForm from "@/components/LoginForm";
import SentryDebug from "@/components/SentryDebug";
import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();
  const theme = getTheme("light");

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <LoginForm />
        <SentryDebug />
      </ScrollView>
    );
  }

  // Redirect to home tabs when user is logged in
  return <Redirect href="/(tabs)/my-leagues" />;
}
