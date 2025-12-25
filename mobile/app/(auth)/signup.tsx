import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { register } from "@/store/authSlice";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Signup() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValidEmail = (email: string) => {
    // Check if it's a valid email format (basic .edu check can be added)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) return;
    if (!isValidEmail(email)) return;

    const result = await dispatch(register({ email, password, displayName }));
    if (register.fulfilled.match(result)) {
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email },
      });
    }
  };

  const passwordsMatch = password === confirmPassword || confirmPassword === "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-cream px-6 pt-16 pb-8">
          {/* Header */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-4"
            >
              <Text className="font-bold text-secondary text-lg">← Back</Text>
            </TouchableOpacity>
            <Text className="font-bold text-3xl text-secondary">
              Create Account
            </Text>
            <Text className="font-sans text-muted mt-2">
              Join your college community
            </Text>
          </View>

          {/* Signup Form */}
          <View className="space-y-4">
            <Input
              label="Display Name"
              placeholder="How others will see you"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />

            <Input
              label="School Email"
              placeholder="you@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {email && !isValidEmail(email) && (
              <Text className="font-sans text-danger text-sm -mt-2">
                Please enter a valid email address
              </Text>
            )}

            <Input
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            {!passwordsMatch && (
              <Text className="font-sans text-danger text-sm -mt-2">
                Passwords don't match
              </Text>
            )}

            {error && (
              <View className="bg-danger/10 border-2 border-danger rounded-xl p-3">
                <Text className="font-sans text-danger text-center">{error}</Text>
              </View>
            )}

            <Button
              title={isLoading ? "Creating account..." : "Sign Up"}
              onPress={handleSignup}
              disabled={
                isLoading ||
                !displayName ||
                !email ||
                !password ||
                !confirmPassword ||
                !passwordsMatch ||
                !isValidEmail(email)
              }
            />
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="font-sans text-muted">
                Already have an account?{" "}
                <Text className="font-bold text-primary">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

