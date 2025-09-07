import { colors, getTheme } from "@/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "outline" | "warning";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  fullWidth?: boolean;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  fullWidth = false,
  backgroundColor,
  textColor,
  style,
  className,
}: ButtonProps) {
  const theme = getTheme("light");

  const getVariantStyles = () => {
    if (backgroundColor) {
      return {
        backgroundColor,
        borderColor: colors.text,
      };
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.primary,
          borderColor: colors.text,
        };
      case "secondary":
        return {
          backgroundColor: theme.secondary,
          borderColor: colors.text,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: theme.primary,
        };
      case "warning":
        return {
          backgroundColor: colors.warning,
          borderColor: colors.text,
        };
      default:
        return {
          backgroundColor: theme.primary,
          borderColor: colors.text,
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "py-3 px-4 rounded-xl border-2";
      case "medium":
        return "py-4 px-5 rounded-[14px] border-[3px]";
      case "large":
        return "py-5 px-6 rounded-2xl border-4";
      default:
        return "py-4 px-5 rounded-[14px] border-[3px]";
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    if (variant === "outline") return theme.primary;
    return "#FFFFFF";
  };

  const getTypographyVariant = () => {
    switch (size) {
      case "small":
        return "buttonSmall" as const;
      case "medium":
        return "button" as const;
      case "large":
        return "buttonLarge" as const;
      default:
        return "button" as const;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 18;
      case "medium":
        return 20;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeClasses = getSizeClasses();

  return (
    <Pressable
      className={`relative items-center justify-center overflow-hidden elevation-3 active:scale-[0.97] active:translate-x-0.5 active:translate-y-0.5 ${sizeClasses} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""} ${className || ""}`}
      style={({ pressed }) => ({
        ...variantStyles,
        shadowColor: colors.text,
        shadowOffset: { width: pressed ? 3 : 6, height: pressed ? 3 : 6 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        ...style,
      })}
      onPress={onPress}
      disabled={disabled}>
      <View className="flex-row items-center gap-3">
        {icon && (
          <View className="w-8 h-8 rounded-lg items-center justify-center border-2 border-white/30 bg-white/20">
            <Ionicons name={icon} size={getIconSize()} color={getTextColor()} />
          </View>
        )}
        <Text
          variant={getTypographyVariant()}
          color={getTextColor()}
          className="tracking-widest text-center">
          {title.toUpperCase()}
        </Text>
      </View>

      {/* Neo-brutalist border overlay */}
      <View
        className="absolute top-0 left-0 right-0 bottom-0 border-[3px] rounded-[14px] opacity-80 pointer-events-none"
        style={{ borderColor: variantStyles.borderColor }}
      />
    </Pressable>
  );
}
