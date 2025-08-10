// Centralized color system with semantic naming
// Source: design.md (Design Tokens section)
// Use semantic names for easy color scheme changes

// Raw color values (internal use only)
const rawColors = {
  ink: "#131629",
  bone: "#F6F5F2",
  slate200: "#D9DCE3",
  slate400: "#B4BAC8",
  cobalt600: "#3057FF",
  violet700: "#6A00FF",
  saffron500: "#F5B301",
  tangerine600: "#FF7A1A",
  cyan500: "#00C2D8",
  night850: "#1A2134",
  panel800: "#222A3F",
  paper: "#FBFBFA",
  card: "#FFFFFF",
} as const;

// Semantic color tokens (use these in components)
export const colors = {
  // Core semantic colors
  text: rawColors.ink,
  textLight: rawColors.bone,
  background: rawColors.paper,
  surface: rawColors.card,
  border: rawColors.slate200,
  borderDark: rawColors.slate400,

  // Brand colors
  primary: rawColors.cobalt600,
  secondary: rawColors.violet700,
  accent: rawColors.saffron500,
  warning: rawColors.tangerine600,
  info: rawColors.cyan500,

  // Dark theme surfaces
  backgroundDark: rawColors.night850,
  surfaceDark: rawColors.panel800,

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
    accent: colors.accent,
    info: colors.info,
    warning: colors.warning,
  },
  dark: {
    name: "dark",
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: colors.textLight,
    border: colors.borderOpacityDark,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    info: colors.info,
    warning: colors.warning,
  },
};

export const getTheme = (name: ThemeName = "light"): Theme => themes[name];
