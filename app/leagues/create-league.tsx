import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { useLocalization } from "@/context/localization";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateLeague() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "12",
    isPrivate: false,
  });

  const handleCreateLeague = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert(t("error"), "Please enter a league name");
        return;
      }

      // TODO: Implement actual league creation API call
      console.log("Creating league:", formData);

      Alert.alert("Success", "League created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to create league:", error);
      Alert.alert(t("error"), "Failed to create league");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t("createLeague")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* League Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t("leagueName")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter league name"
            placeholderTextColor={theme.textSecondary}
            maxLength={50}
          />
        </View>

        {/* League Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t("leagueDescription")}
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Describe your league..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
        </View>

        {/* Max Members */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            {t("maxMembers")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={formData.maxMembers}
            onChangeText={(text) =>
              setFormData({ ...formData, maxMembers: text })
            }
            placeholder="12"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Private League Toggle */}
        <View style={styles.inputGroup}>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() =>
              setFormData({ ...formData, isPrivate: !formData.isPrivate })
            }>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: formData.isPrivate
                    ? theme.primary
                    : theme.border,
                },
              ]}>
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: theme.background,
                    transform: [
                      {
                        translateX: formData.isPrivate ? 20 : 0,
                      },
                    ],
                  },
                ]}
              />
            </View>
            <Text style={[styles.toggleLabel, { color: theme.text }]}>
              {t("privateLeague")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={t("createLeagueButton")}
            onPress={handleCreateLeague}
            variant="primary"
            style={styles.createButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  textArea: {
    height: 100,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlignVertical: "top",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    marginRight: 16,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 32,
  },
  createButton: {
    height: 56,
  },
});
