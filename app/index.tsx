import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function Index() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text>{user.sub}</Text>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
}
