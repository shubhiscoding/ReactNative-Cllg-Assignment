import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { verifyOTP, resendOTP } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";

export default function VerifyOTP() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      if (pastedOtp.length + index >= 6) {
        inputRefs.current[5]?.blur();
      } else {
        inputRefs.current[index + pastedOtp.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6 || !email) return;

    const result = await dispatch(verifyOTP({ email, otp: otpString }));
    if (verifyOTP.fulfilled.match(result)) {
      router.replace("/(main)/feed");
    }
  };

  const handleResend = async () => {
    if (!email || resendTimer > 0) return;
    await dispatch(resendOTP(email));
    setResendTimer(60);
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <View className="flex-1 px-6 pt-16">
        {/* Header */}
        <View className="mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="font-bold text-secondary text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="font-bold text-3xl text-secondary">Verify Email</Text>
          <Text className="font-sans text-muted mt-2">
            Enter the 6-digit code sent to
          </Text>
          <Text className="font-medium text-secondary">{email}</Text>
        </View>

        {/* OTP Input */}
        <View className="flex-row justify-between mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className="w-12 h-14 bg-white border-3 border-secondary rounded-xl text-center text-2xl font-bold shadow-brutal-sm"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && (
          <View className="bg-danger/10 border-2 border-danger rounded-xl p-3 mb-4">
            <Text className="font-sans text-danger text-center">{error}</Text>
          </View>
        )}

        <Button
          title={isLoading ? "Verifying..." : "Verify Email"}
          onPress={handleVerify}
          disabled={isLoading || !isComplete}
        />

        {/* Resend */}
        <View className="mt-6 items-center">
          {resendTimer > 0 ? (
            <Text className="font-sans text-muted">
              Resend code in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text className="font-bold text-primary">Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

