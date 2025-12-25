import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="font-bold text-secondary mb-2">{label}</Text>
      )}
      <TextInput
        className={`bg-white border-3 ${
          error ? "border-danger" : "border-secondary"
        } rounded-xl px-4 py-3 font-sans text-secondary shadow-brutal-sm`}
        placeholderTextColor="#6B7280"
        {...props}
      />
      {error && (
        <Text className="font-sans text-danger text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}

