// Modern Dark Theme Color System
// Optimized for glass-morphism effects and gradient backgrounds

// Modern Color Palette - Dark Theme Focus
const rawColors = {
   // Deep purple gradient backgrounds
   deepPurple: '#1a0033', // Primary dark purple
   midPurple: '#0f001a', // Mid gradient purple
   voidBlack: '#000000', // Pure black for deepest areas

   // Glass-morphism colors
   glassWhite: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
   glassWhiteMedium: 'rgba(255, 255, 255, 0.15)', // Medium opacity glass
   glassWhiteHigh: 'rgba(255, 255, 255, 0.2)', // Higher opacity glass
   glassBlur: 'rgba(255, 255, 255, 0.05)', // Very subtle glass effect

   // Modern accent colors
   primaryPurple: '#8B5CF6', // Purple primary
   primaryPurpleLight: '#A78BFA', // Lighter purple
   primaryPurpleDark: '#7C3AED', // Darker purple

   // Status colors - modern and accessible
   successGreen: '#4ADE80', // Modern success green
   successGreenDark: '#10B981', // Darker success green
   errorRed: '#F87171', // Modern error red
   errorRedDark: '#EF4444', // Darker error red
   warningOrange: '#FB923C', // Modern warning orange
   warningOrangeDark: '#F59E0B', // Darker warning orange
   infoBlue: '#60A5FA', // Modern info blue
   infoBlueDark: '#3B82F6', // Darker info blue

   // Accent color for special states like 'validating'
   accent: '#c026d3', // A vibrant fuchsia for standout highlights

   // Special accent
   pinkAccent: '#FF1493', // Bright pink accent
   pinkAccentDark: '#E1306C', // Darker pink accent

   // Text colors for dark theme
   textPrimary: '#FFFFFF', // Pure white text
   textSecondary: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
   textMuted: 'rgba(255, 255, 255, 0.6)', // More transparent white
   textDisabled: 'rgba(255, 255, 255, 0.4)', // Disabled text

   // Shadow colors with tints
   shadowPurple: 'rgba(139, 92, 246, 0.3)', // Purple tinted shadow
   shadowPink: 'rgba(255, 20, 147, 0.3)', // Pink tinted shadow
   shadowBlack: 'rgba(0, 0, 0, 0.5)', // Standard black shadow

   // Gradient stops
   gradientStart: '#8B5CF6', // Purple gradient start
   gradientEnd: '#A78BFA', // Purple gradient end
   successGradientStart: '#4ADE80',
   successGradientEnd: '#10B981',
   errorGradientStart: '#F87171',
   errorGradientEnd: '#EF4444',
   warningGradientStart: '#FB923C',
   warningGradientEnd: '#F59E0B',
   infoGradientStart: '#60A5FA',
   infoGradientEnd: '#3B82F6',
} as const;

// Semantic color tokens optimized for modern dark theme
export const colors = {
   // Text colors - optimized for dark backgrounds
   text: rawColors.textPrimary,
   textSecondary: rawColors.textSecondary,
   textMuted: rawColors.textMuted,
   textDisabled: rawColors.textDisabled,

   // Background system - dark theme first
   background: rawColors.deepPurple, // Deep purple background
   backgroundGradientStart: rawColors.deepPurple,
   backgroundGradientMid: rawColors.midPurple,
   backgroundGradientEnd: rawColors.voidBlack,

   // Surface system with glass-morphism
   surface: rawColors.glassWhite, // Semi-transparent surfaces
   surfaceElevated: rawColors.glassWhiteMedium, // Elevated surfaces
   surfaceHighlight: rawColors.glassWhiteHigh, // Highlighted surfaces
   surfaceBlur: rawColors.glassBlur, // Subtle surface tint

   // Border system - subtle and modern
   border: rawColors.glassWhite, // Semi-transparent borders
   borderMuted: rawColors.glassBlur, // Very subtle borders

   // Primary color system
   primary: rawColors.primaryPurple,
   primaryLight: rawColors.primaryPurpleLight,
   primaryDark: rawColors.primaryPurpleDark,
   primaryGradientStart: rawColors.gradientStart,
   primaryGradientEnd: rawColors.gradientEnd,

   // Secondary/accent system
   secondary: rawColors.pinkAccent,
   secondaryDark: rawColors.pinkAccentDark,
   accent: rawColors.accent, // Add accent color

   // Status colors with gradients
   success: rawColors.successGreen,
   successDark: rawColors.successGreenDark,
   successGradientStart: rawColors.successGradientStart,
   successGradientEnd: rawColors.successGradientEnd,

   warning: rawColors.warningOrange,
   warningDark: rawColors.warningOrangeDark,
   warningGradientStart: rawColors.warningGradientStart,
   warningGradientEnd: rawColors.warningGradientEnd,

   error: rawColors.errorRed,
   errorDark: rawColors.errorRedDark,
   errorGradientStart: rawColors.errorGradientStart,
   errorGradientEnd: rawColors.errorGradientEnd,

   info: rawColors.infoBlue,
   infoDark: rawColors.infoBlueDark,
   infoGradientStart: rawColors.infoGradientStart,
   infoGradientEnd: rawColors.infoGradientEnd,

   // Shadow system with color tints
   shadow: rawColors.shadowBlack,
   shadowPurple: rawColors.shadowPurple,
   shadowPink: rawColors.shadowPink,
} as const;

export type ThemeName = 'light' | 'dark';

export type Theme = {
   name: ThemeName;
   // Backgrounds
   background: string;
   backgroundGradientStart: string;
   backgroundGradientMid: string;
   backgroundGradientEnd: string;
   // Surfaces
   surface: string;
   surfaceElevated: string;
   surfaceHighlight: string;
   surfaceBlur: string;
   // Text
   text: string;
   textSecondary: string;
   textMuted: string;
   textDisabled: string;
   // Borders
   border: string;
   borderMuted: string;
   // Shadows
   shadow: string;
   shadowPurple: string;
   shadowPink: string;
   // Primary colors
   primary: string;
   primaryLight: string;
   primaryDark: string;
   primaryGradientStart: string;
   primaryGradientEnd: string;
   // Secondary colors
   secondary: string;
   secondaryDark: string;
   accent: string; // Add accent type

   // Status colors with gradients
   info: string;
   infoDark: string;
   infoGradientStart: string;
   infoGradientEnd: string;
   warning: string;
   warningDark: string;
   warningGradientStart: string;
   warningGradientEnd: string;
   error: string;
   errorDark: string;
   errorGradientStart: string;
   errorGradientEnd: string;
   success: string;
   successDark: string;
   successGradientStart: string;
   successGradientEnd: string;
};

export const themes: Record<ThemeName, Theme> = {
   // Dark theme is now the primary theme
   dark: {
      name: 'dark',
      // Backgrounds
      background: colors.background,
      backgroundGradientStart: colors.backgroundGradientStart,
      backgroundGradientMid: colors.backgroundGradientMid,
      backgroundGradientEnd: colors.backgroundGradientEnd,
      // Surfaces
      surface: colors.surface,
      surfaceElevated: colors.surfaceElevated,
      surfaceHighlight: colors.surfaceHighlight,
      surfaceBlur: colors.surfaceBlur,
      // Text
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      textDisabled: colors.textDisabled,
      // Borders
      border: colors.border,
      borderMuted: colors.borderMuted,
      // Shadows
      shadow: colors.shadow,
      shadowPurple: colors.shadowPurple,
      shadowPink: colors.shadowPink,
      // Primary
      primary: colors.primary,
      primaryLight: colors.primaryLight,
      primaryDark: colors.primaryDark,
      primaryGradientStart: colors.primaryGradientStart,
      primaryGradientEnd: colors.primaryGradientEnd,
      // Secondary
      secondary: colors.secondary,
      secondaryDark: colors.secondaryDark,
      accent: colors.accent,

      // Status colors
      info: colors.info,
      infoDark: colors.infoDark,
      infoGradientStart: colors.infoGradientStart,
      infoGradientEnd: colors.infoGradientEnd,
      warning: colors.warning,
      warningDark: colors.warningDark,
      warningGradientStart: colors.warningGradientStart,
      warningGradientEnd: colors.warningGradientEnd,
      error: colors.error,
      errorDark: colors.errorDark,
      errorGradientStart: colors.errorGradientStart,
      errorGradientEnd: colors.errorGradientEnd,
      success: colors.success,
      successDark: colors.successDark,
      successGradientStart: colors.successGradientStart,
      successGradientEnd: colors.successGradientEnd,
   },
   // Light theme kept for compatibility but uses dark theme colors
   light: {
      name: 'light',
      // Use same colors as dark theme since app is designed for dark
      background: colors.background,
      backgroundGradientStart: colors.backgroundGradientStart,
      backgroundGradientMid: colors.backgroundGradientMid,
      backgroundGradientEnd: colors.backgroundGradientEnd,
      surface: colors.surface,
      surfaceElevated: colors.surfaceElevated,
      surfaceHighlight: colors.surfaceHighlight,
      surfaceBlur: colors.surfaceBlur,
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      textDisabled: colors.textDisabled,
      border: colors.border,
      borderMuted: colors.borderMuted,
      shadow: colors.shadow,
      shadowPurple: colors.shadowPurple,
      shadowPink: colors.shadowPink,
      primary: colors.primary,
      primaryLight: colors.primaryLight,
      primaryDark: colors.primaryDark,
      primaryGradientStart: colors.primaryGradientStart,
      primaryGradientEnd: colors.primaryGradientEnd,
      secondary: colors.secondary,
      secondaryDark: colors.secondaryDark,
      accent: colors.accent,
      info: colors.info,
      infoDark: colors.infoDark,
      infoGradientStart: colors.infoGradientStart,
      infoGradientEnd: colors.infoGradientEnd,
      warning: colors.warning,
      warningDark: colors.warningDark,
      warningGradientStart: colors.warningGradientStart,
      warningGradientEnd: colors.warningGradientEnd,
      error: colors.error,
      errorDark: colors.errorDark,
      errorGradientStart: colors.errorGradientStart,
      errorGradientEnd: colors.errorGradientEnd,
      success: colors.success,
      successDark: colors.successDark,
      successGradientStart: colors.successGradientStart,
      successGradientEnd: colors.successGradientEnd,
   },
};

export const getTheme = (name: ThemeName = 'dark'): Theme => themes[name];

// Utility function to create gradient arrays for React Native LinearGradient
export const getGradient = (
   type: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'background'
) => {
   const theme = getTheme();
   switch (type) {
      case 'primary':
         return [theme.primaryGradientStart, theme.primaryGradientEnd];
      case 'success':
         return [theme.successGradientStart, theme.successGradientEnd];
      case 'error':
         return [theme.errorGradientStart, theme.errorGradientEnd];
      case 'warning':
         return [theme.warningGradientStart, theme.warningGradientEnd];
      case 'info':
         return [theme.infoGradientStart, theme.infoGradientEnd];
      case 'background':
         return [
            theme.backgroundGradientStart,
            theme.backgroundGradientMid,
            theme.backgroundGradientEnd,
         ];
      default:
         return [theme.primaryGradientStart, theme.primaryGradientEnd];
   }
};
