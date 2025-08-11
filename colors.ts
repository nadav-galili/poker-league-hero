// Centralized color system with semantic naming
// Source: design.md (Design Tokens section)
// Use semantic names for easy color scheme changes

// Raw color values (internal use only)
const rawColors = {
  // Modern neutral palette
  ink: "#131629",
  bone: "#F6F5F2",
  slate200: "#D9DCE3",
  slate400: "#B4BAC8",
  slate600: "#64748B",
  slate800: "#1E293B",

  // // Modern brand colors (cohesive palette)
  // indigo600: "#4F46E5", // Primary - modern indigo
  // indigo500: "#6366F1", // Primary light
  // indigo700: "#4338CA", // Primary dark

  // emerald500: "#10B981", // Success/accent
  // emerald600: "#059669", // Success dark

  // rose500: "#F43F5E", // Warning/error
  // amber500: "#F59E0B", // Info/warning

  // // Surface colors
  // night850: "#1A2134",
  // panel800: "#222A3F",
  // paper: "#FBFBFA",
  // card: "#FFFFFF",

  electricViolet: "#9B5DE5",
  mintGreen: "#00F5D4",
  brightSaffron: "#FEE440",

  violet200: "#A8A6FF",
  violet300: "#918efa",
  violet400: "#807dfa",
  violet500: "#635fc7",
  pink200: "#FFA6F6",
  pink300: "#fa8cef",
  pink400: "#fa7fee",
  red200: "#FF9F9F",
  red300: "#fa7a7a",
  red400: "#f76363",
  orange200: "#FFC29F",
  orange300: "#FF965B",
  orange400: "#fa8543",
  yellow200: "#FFF066",
  yellow300: "#FFE500",
  yellow400: "#FFE500",
  lime200: "#B8FF9F",
  lime300: "#9dfc7c",
  lime400: "#7df752",
  cyan200: "#A6FAFF",
  cyan300: "#79F7FF",
  cyan400: "#53f2fc",
} as const;

// Semantic color tokens (use these in components)
export const colors = {
  // Core semantic colors
  text: rawColors.violet500,
  textLight: rawColors.lime300,
  textMuted: rawColors.slate600,
  background: rawColors.bone,
  surface: rawColors.lime400,
  border: rawColors.slate200,
  borderDark: rawColors.slate400,

  // Modern brand colors
  primary: rawColors.violet400,
  primaryLight: rawColors.violet300,
  primaryDark: rawColors.violet500,
  secondary: rawColors.pink300,

  warning: rawColors.red300,
  error: rawColors.red400,
  info: rawColors.slate600,

  // Subtle background tints for cards
  primaryTint: rawColors.violet200,

  infoTint: rawColors.cyan200,

  // Dark theme surfaces
  backgroundDark: rawColors.ink,

  // Computed colors
  borderOpacity: "rgba(19,22,41,0.20)",
  borderOpacityDark: "rgba(251,251,250,0.10)",
} as const;

export type ThemeName = "light" | "dark";

export type Theme = {
  name: ThemeName;
  background: string;
  surface: string;
  text: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  info: string;
  warning: string;
};

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    border: colors.borderOpacity,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.primary,

    info: colors.info,
    warning: colors.warning,
  },
  dark: {
    name: "dark",
    background: colors.backgroundDark,
    surface: colors.surface,
    text: colors.textLight,
    border: colors.borderOpacityDark,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.primary,
    info: colors.info,
    warning: colors.warning,
  },
};

export const getTheme = (name: ThemeName = "light"): Theme => themes[name];
