import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  size = "md",
  loading = false,
  style,
}: ButtonProps) {
  const baseClasses = "border-3 border-secondary rounded-xl items-center justify-center";
  
  const variantClasses = {
    primary: "bg-primary shadow-brutal",
    secondary: "bg-secondary shadow-brutal",
    outline: "bg-white shadow-brutal-sm",
    danger: "bg-danger shadow-brutal",
  };

  const sizeClasses = {
    sm: "py-2 px-4",
    md: "py-3 px-6",
    lg: "py-4 px-8",
  };

  const textVariantClasses = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-secondary",
    danger: "text-white",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? "opacity-50" : ""
      }`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? "#1E1E1E" : "#FFFFFF"}
        />
      ) : (
        <Text
          className={`font-bold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

