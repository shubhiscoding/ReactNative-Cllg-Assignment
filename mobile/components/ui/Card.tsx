import { View, ViewStyle } from "react-native";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "flat";
  className?: string;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "default",
  className = "",
  style,
}: CardProps) {
  const variantClasses = {
    default: "bg-white border-3 border-secondary rounded-2xl shadow-brutal",
    elevated: "bg-white border-3 border-secondary rounded-2xl shadow-brutal",
    flat: "bg-white border-2 border-secondary rounded-xl",
  };

  return (
    <View className={`${variantClasses[variant]} ${className}`} style={style}>
      {children}
    </View>
  );
}

