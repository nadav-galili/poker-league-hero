import { colors, getTheme } from "@/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
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

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: 2,
        };
      case "medium":
        return {
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 14,
          borderWidth: 3,
        };
      case "large":
        return {
          paddingVertical: 20,
          paddingHorizontal: 24,
          borderRadius: 16,
          borderWidth: 4,
        };
      default:
        return {
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 14,
          borderWidth: 3,
        };
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
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        sizeStyles,
        variantStyles,
        styles.brutalistShadow,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.content}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}>
            <Ionicons name={icon} size={getIconSize()} color={getTextColor()} />
          </View>
        )}
        <Text
          variant={getTypographyVariant()}
          color={getTextColor()}
          style={styles.text}>
          {title.toUpperCase()}
        </Text>
      </View>

      {/* Neo-brutalist border overlay */}
      <View
        style={[styles.border, { borderColor: variantStyles.borderColor }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },

  text: {
    letterSpacing: 1.2,
    textAlign: "center",
  },

  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 14,
    opacity: 0.8,
    pointerEvents: "none",
  },

  brutalistShadow: {
    shadowColor: colors.text,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 12,
  },

  fullWidth: {
    width: "100%",
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    transform: [{ scale: 0.97 }, { translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 3, height: 3 },
  },
});
