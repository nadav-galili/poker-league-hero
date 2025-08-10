import { useAuth } from "@/context/auth";
import { Button, Text, View } from "react-native";

export default function LoginForm() {
  const { signIn } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login</Text>
      <Button title="Sign In with Google" onPress={signIn} />
    </View>
  );
}
