/**
 * Reusable BuyInSelector component for selecting buy-in amounts
 */

import { colors, getTheme } from "@/colors";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface BuyInOption {
  value: string;
  label: string;
  displayValue?: string;
}

interface BuyInSelectorProps {
  selectedBuyIn: string;
  onBuyInChange: (value: string) => void;
  options?: BuyInOption[];
  variant?: "horizontal" | "vertical" | "grid";
  disabled?: boolean;
  showHint?: boolean;
  customHint?: string;
}

const DEFAULT_OPTIONS: BuyInOption[] = [
  { value: "50", label: "₪50", displayValue: "50" },
  { value: "100", label: "₪100", displayValue: "100" },
];

export function BuyInSelector({
  selectedBuyIn,
  onBuyInChange,
  options = DEFAULT_OPTIONS,
  variant = "horizontal",
  disabled = false,
  showHint = true,
  customHint,
}: BuyInSelectorProps) {
  const theme = getTheme("light");
  const { t } = useLocalization();

  const getContainerStyle = () => {
    const baseStyle = [styles.container];

    if (variant === "horizontal") {
      baseStyle.push(styles.horizontalContainer);
    } else if (variant === "vertical") {
      baseStyle.push(styles.verticalContainer);
    } else if (variant === "grid") {
      baseStyle.push(styles.gridContainer);
    }

    return baseStyle;
  };

  const renderOption = (option: BuyInOption) => {
    const isSelected = selectedBuyIn === option.value;

    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.buyInOption,
          variant === "horizontal" && styles.horizontalOption,
          variant === "vertical" && styles.verticalOption,
          variant === "grid" && styles.gridOption,
          {
            backgroundColor: isSelected ? colors.primary : theme.background,
            borderColor: isSelected ? colors.primary : theme.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !disabled && onBuyInChange(option.value)}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}>
        <Text
          variant="h4"
          color={isSelected ? colors.textInverse : theme.text}
          style={styles.buyInOptionText}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={getContainerStyle()}>{options.map(renderOption)}</View>

      {showHint && (
        <Text
          variant="captionSmall"
          color={theme.textMuted}
          style={styles.hint}>
          {customHint || t("buyInHint")}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  container: {
    marginBottom: 8,
  },

  horizontalContainer: {
    flexDirection: "row",
    gap: 12,
  },

  verticalContainer: {
    gap: 8,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  buyInOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },

  horizontalOption: {
    flex: 1,
    minHeight: 56,
  },

  verticalOption: {
    width: "100%",
    minHeight: 56,
  },

  gridOption: {
    flex: 1,
    minWidth: 100,
    minHeight: 56,
  },

  buyInOptionText: {
    letterSpacing: 1,
    fontWeight: "700",
    textAlign: "center",
  },

  hint: {
    marginTop: 6,
    lineHeight: 16,
    textAlign: "center",
  },
});
