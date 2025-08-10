import LoginForm from "@/components/LoginForm";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/context/auth";
import { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function Index() {
  const { user, isLoading, signOut, fetchWithAuth } = useAuth();
  const [data, setData] = useState();

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

  async function getProtectedData() {
    const response = await fetchWithAuth(`${BASE_URL}/api/protected/data`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setData(data);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text>{user.id}</Text>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
      <Text>{JSON.stringify(data)}</Text>
      <Button title="Get Protected Data" onPress={getProtectedData} />
    </View>
  );
}
