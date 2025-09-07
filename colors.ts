// Centralized color system with semantic naming
// Source: design.md (Design Tokens section)
// Use semantic names for easy color scheme changes

// Neo-Brutalist Color Palette
const rawColors = {
  // Base neutrals - high contrast
  ink: "#000000", // Pure black for maximum contrast
  paper: "#FFFFFF", // Pure white for stark contrast
  bone: "#F8F8F8", // Off-white for subtle backgrounds
  concrete: "#c4c2c2", // Light gray for cards
  shadow: "#000000", // Black shadows for depth

  // Neo-brutalist accent colors - bold and electric
  electricBlue: "#0066FF", // Primary brand - vivid blue
  hotPink: "#FF1493", // Secondary - shocking pink
  neonYellow: "#FFFF00", // Warning/highlight - pure yellow
  acidGreen: "#32FF32", // Success - bright green
  blazeOrange: "#FF4500", // Error/danger - red-orange

  // Supporting vibrant colors
  cyberPurple: "#8A2BE2", // Purple accent
  toxicLime: "#CCFF00", // Lime accent
  shockRed: "#FF0000", // Pure red

  // Toned versions for backgrounds
  electricBlue20: "rgba(0, 102, 255, 0.2)",
  hotPink20: "rgba(255, 20, 147, 0.2)",
  neonYellow20: "rgba(255, 255, 0, 0.2)",
  acidGreen20: "rgba(50, 255, 50, 0.2)",
  blazeOrange20: "rgba(255, 69, 0, 0.2)",

  // Text colors
  textPrimary: "#000000", // Black text on light
  textSecondary: "#333333", // Dark gray for secondary
  textMuted: "#666666", // Medium gray for muted
  textInverse: "#FFFFFF", // White text on dark
} as const;

// Semantic color tokens (use these in components)
export const colors = {
  // Core semantic colors - Neo-brutalist style
  text: rawColors.textPrimary,
  textSecondary: rawColors.textSecondary,
  textMuted: rawColors.textMuted,
  textInverse: rawColors.textInverse,

  background: rawColors.paper, // Pure white background
  surface: rawColors.concrete, // Light gray for cards
  surfaceElevated: rawColors.paper, // White for elevated surfaces

  border: rawColors.ink, // Black borders for brutalist style
  shadow: rawColors.shadow, // Black shadows

  // Neo-brutalist brand colors - bold and electric
  primary: rawColors.electricBlue, // Electric blue primary
  primaryTint: rawColors.electricBlue20,

  secondary: rawColors.hotPink, // Hot pink secondary
  secondaryTint: rawColors.hotPink20,

  accent: rawColors.neonYellow, // Neon yellow accent
  accentTint: rawColors.neonYellow20,

  // Status colors - vibrant and bold
  success: rawColors.acidGreen, // Acid green for success
  successTint: rawColors.acidGreen20,

  warning: rawColors.neonYellow, // Neon yellow for warnings
  warningTint: rawColors.neonYellow20,

  error: rawColors.blazeOrange, // Blaze orange for errors
  errorTint: rawColors.blazeOrange20,

  info: rawColors.cyberPurple, // Cyber purple for info
  infoTint: "rgba(138, 43, 226, 0.2)",

  // Additional accents for variety
  highlight: rawColors.toxicLime, // Toxic lime for highlights
  highlightTint: "rgba(204, 255, 0, 0.2)",

  danger: rawColors.shockRed, // Shock red for danger
  dangerTint: "rgba(255, 0, 0, 0.2)",

  // Dark theme
  backgroundDark: rawColors.ink,
  surfaceDark: "#1A1A1A",
  textDark: rawColors.textInverse,
} as const;

export type ThemeName = "light" | "dark";

export type Theme = {
  name: ThemeName;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  shadow: string;
  primary: string;
  primaryTint: string;
  secondary: string;
  secondaryTint: string;
  accent: string;
  accentTint: string;
  info: string;
  infoTint: string;
  warning: string;
  warningTint: string;
  error: string;
  errorTint: string;
  success: string;
  successTint: string;
  highlight: string;
  highlightTint: string;
};

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    background: colors.background,
    surface: colors.surface,
    surfaceElevated: colors.surfaceElevated,
    text: colors.text,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    border: colors.border,
    shadow: colors.shadow,
    primary: colors.primary,
    primaryTint: colors.primaryTint,
    secondary: colors.secondary,
    secondaryTint: colors.secondaryTint,
    accent: colors.accent,
    accentTint: colors.accentTint,
    info: colors.info,
    infoTint: colors.infoTint,
    warning: colors.warning,
    warningTint: colors.warningTint,
    error: colors.error,
    errorTint: colors.errorTint,
    success: colors.success,
    successTint: colors.successTint,
    highlight: colors.highlight,
    highlightTint: colors.highlightTint,
  },
  dark: {
    name: "dark",
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    surfaceElevated: colors.backgroundDark,
    text: colors.textDark,
    textSecondary: colors.textMuted,
    textMuted: colors.textMuted,
    border: colors.border,
    shadow: colors.shadow,
    primary: colors.primary,
    primaryTint: colors.primaryTint,
    secondary: colors.secondary,
    secondaryTint: colors.secondaryTint,
    accent: colors.accent,
    accentTint: colors.accentTint,
    info: colors.info,
    infoTint: colors.infoTint,
    warning: colors.warning,
    warningTint: colors.warningTint,
    error: colors.error,
    errorTint: colors.errorTint,
    success: colors.success,
    successTint: colors.successTint,
    highlight: colors.highlight,
    highlightTint: colors.highlightTint,
  },
};

export const getTheme = (name: ThemeName = "dark"): Theme => themes[name];
