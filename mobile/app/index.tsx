import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function Index() {
  const router = useRouter();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace("/(main)/feed");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [token, isLoading]);

  return (
    <View className="flex-1 bg-cream items-center justify-center">
      <Text className="font-bold text-3xl text-secondary">Yappers</Text>
      <Text className="font-sans text-muted mt-2">Loading...</Text>
    </View>
  );
}

