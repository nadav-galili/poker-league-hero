import { colors, getTheme } from "@/colors";
import { Language, useLocalization } from "@/context/localization";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

interface LanguageSelectorProps {
  size?: "small" | "medium" | "large";
}

export function LanguageSelector({ size = "medium" }: LanguageSelectorProps) {
  const { language, setLanguage, t, isRTL } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const theme = getTheme("light");

  const languages = [
    { code: "en" as Language, label: t("english"), flag: "🇺🇸" },
    { code: "he" as Language, label: t("hebrew"), flag: "🇮🇱" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: 6,
          paddingVertical: 4,
          borderRadius: 4,
          borderWidth: 2,
          minWidth: 70,
        };
      case "medium":
        return {
          padding: 12,
          borderRadius: 8,
          borderWidth: 3,
        };
      case "large":
        return {
          padding: 16,
          borderRadius: 10,
          borderWidth: 4,
        };
      default:
        return {
          padding: 12,
          borderRadius: 8,
          borderWidth: 3,
        };
    }
  };

  const handleLanguageSelect = async (langCode: Language) => {
    await setLanguage(langCode);
    setIsOpen(false);
  };

  const sizeStyles = getSizeStyles();

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.selector,
          sizeStyles,
          {
            backgroundColor: colors.accent,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
          pressed && styles.pressed,
        ]}
        onPress={() => setIsOpen(true)}>
        <View style={[styles.content, isRTL && styles.rtlContent]}>
          <Text style={styles.flag}>{currentLanguage?.flag}</Text>
          <Text variant="labelSmall" color={colors.text} style={styles.label}>
            {size === "small" ? language.toUpperCase() : currentLanguage?.label}
          </Text>
          <Ionicons
            name="chevron-down"
            size={size === "small" ? 14 : 16}
            color={colors.text}
            style={[styles.icon, isRTL && styles.rtlIcon]}
          />
        </View>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View
            style={[styles.modal, { backgroundColor: theme.surfaceElevated }]}>
            <Text variant="h4" color={theme.text} style={styles.modalTitle}>
              {t("language")}
            </Text>

            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor:
                      language === lang.code
                        ? colors.primaryTint
                        : "transparent",
                    borderColor: theme.border,
                  },
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}>
                <View
                  style={[styles.optionContent, isRTL && styles.rtlContent]}>
                  <Text style={styles.optionFlag}>{lang.flag}</Text>
                  <Text
                    variant="body"
                    color={language === lang.code ? colors.primary : theme.text}
                    style={styles.optionLabel}>
                    {lang.label}
                  </Text>
                  {language === lang.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                      style={[styles.checkIcon, isRTL && styles.rtlIcon]}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },

  pressed: {
    transform: [{ scale: 0.96 }, { translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  rtlContent: {
    flexDirection: "row-reverse",
  },

  flag: {
    fontSize: 16,
  },

  label: {
    letterSpacing: 0.5,
  },

  icon: {
    marginLeft: 4,
  },

  rtlIcon: {
    marginLeft: 0,
    marginRight: 4,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    borderRadius: 12,
    borderWidth: 4,
    borderColor: colors.border,
    padding: 20,
    minWidth: 200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },

  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },

  option: {
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
    padding: 12,
  },

  optionPressed: {
    transform: [{ scale: 0.98 }],
  },

  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  optionFlag: {
    fontSize: 20,
  },

  optionLabel: {
    flex: 1,
    letterSpacing: 0.5,
  },

  checkIcon: {
    marginLeft: 8,
  },
});

export default LanguageSelector;
