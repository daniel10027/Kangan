import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: Variant;
  loading?: boolean;
  children: string;
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: "bg-vert-kangan", text: "text-creme" },
  secondary: { bg: "bg-ocre", text: "text-vert-kangan" },
  ghost: { bg: "bg-encre/5", text: "text-vert-kangan" },
  danger: { bg: "bg-piment", text: "text-creme" },
};

export function Button({ variant = "primary", loading, disabled, children, className = "", ...props }: ButtonProps & { className?: string }) {
  const style = VARIANT_STYLES[variant];
  return (
    <Pressable
      disabled={disabled || loading}
      className={`min-h-[48px] flex-row items-center justify-center rounded-field px-5 ${style.bg} ${disabled ? "opacity-40" : ""} ${className}`}
      {...props}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text className={`text-base font-semibold ${style.text}`}>{children}</Text>}
    </Pressable>
  );
}
