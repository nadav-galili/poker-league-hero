const { colors } = require("./colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./(tabs)/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  plugins: [],
  theme: {
    extend: {
      colors: {
        // Neo-brutalist color palette from colors.ts
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        highlight: colors.highlight,

        // Text colors
        text: colors.text,
        textSecondary: colors.textSecondary,
        textMuted: colors.textMuted,
        textInverse: colors.textInverse,

        // Surface colors
        background: colors.background,
        surface: colors.surface,
        surfaceElevated: colors.surfaceElevated,

        // Structure colors
        border: colors.border,
        shadow: colors.shadow,

        // Status colors
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
        info: colors.info,
        danger: colors.danger,

        // Tint colors
        primaryTint: colors.primaryTint,
        secondaryTint: colors.secondaryTint,
        accentTint: colors.accentTint,
        highlightTint: colors.highlightTint,
        errorTint: colors.errorTint,
        successTint: colors.successTint,
        warningTint: colors.warningTint,
        infoTint: colors.infoTint,
        dangerTint: colors.dangerTint,
      },
    },
  },
};
