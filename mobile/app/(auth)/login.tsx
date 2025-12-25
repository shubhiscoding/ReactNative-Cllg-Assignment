import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { login } from "@/store/authSlice";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      router.replace("/(main)/feed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-cream px-6 pt-20 pb-8">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="bg-primary border-3 border-secondary rounded-2xl p-4 mb-4 shadow-brutal">
              <Text className="text-4xl">🗣️</Text>
            </View>
            <Text className="font-bold text-4xl text-secondary">Yappers</Text>
            <Text className="font-sans text-muted mt-2 text-center">
              Your college's anonymous space
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <Input
              label="School Email"
              placeholder="you@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && (
              <View className="bg-danger/10 border-2 border-danger rounded-xl p-3">
                <Text className="font-sans text-danger text-center">{error}</Text>
              </View>
            )}

            <Button
              title={isLoading ? "Signing in..." : "Sign In"}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            />
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="font-sans text-muted">
                Don't have an account?{" "}
                <Text className="font-bold text-primary">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

