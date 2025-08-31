import { Platform } from "react-native";

export const FontWeights = {
  Light: "300",
  Regular: "400",
  Medium: "500",
  SemiBold: "600",
  Bold: "700",
} as const;

export const FontFamily = {
  Light: Platform.select({
    ios: "SpaceGrotesk_300Light",
    android: "SpaceGrotesk_300Light",
    web: "SpaceGrotesk_300Light, system-ui, sans-serif",
  }),
  Regular: Platform.select({
    ios: "SpaceGrotesk_400Regular",
    android: "SpaceGrotesk_400Regular",
    web: "SpaceGrotesk_400Regular, system-ui, sans-serif",
  }),
  Medium: Platform.select({
    ios: "SpaceGrotesk_500Medium",
    android: "SpaceGrotesk_500Medium",
    web: "SpaceGrotesk_500Medium, system-ui, sans-serif",
  }),
  SemiBold: Platform.select({
    ios: "SpaceGrotesk_600SemiBold",
    android: "SpaceGrotesk_600SemiBold",
    web: "SpaceGrotesk_600SemiBold, system-ui, sans-serif",
  }),
  Bold: Platform.select({
    ios: "SpaceGrotesk_700Bold",
    android: "SpaceGrotesk_700Bold",
    web: "SpaceGrotesk_700Bold, system-ui, sans-serif",
  }),
} as const;

export const Typography = {
  // Display styles
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: FontFamily.Bold,
    fontWeight: FontWeights.Bold,
  },

  // Heading styles
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: FontFamily.Bold,
    fontWeight: FontWeights.Bold,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: FontFamily.SemiBold,
    fontWeight: FontWeights.SemiBold,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: FontFamily.SemiBold,
    fontWeight: FontWeights.SemiBold,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FontFamily.Medium,
    fontWeight: FontWeights.Medium,
  },
  h5: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: FontFamily.Medium,
    fontWeight: FontWeights.Medium,
  },

  // Body text styles
  bodyLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeights.Regular,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeights.Regular,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeights.Regular,
  },

  // Label styles
  labelLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FontFamily.Medium,
    fontWeight: FontWeights.Medium,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.Medium,
    fontWeight: FontWeights.Medium,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.Medium,
    fontWeight: FontWeights.Medium,
  },

  // Caption styles
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeights.Regular,
  },
  captionSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeights.Regular,
  },

  // Button styles
  buttonLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FontFamily.SemiBold,
    fontWeight: FontWeights.SemiBold,
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.SemiBold,
    fontWeight: FontWeights.SemiBold,
  },
  buttonSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.Medium,
    fontWeight: FontWeights.Medium,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
