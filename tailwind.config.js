const { colors } = require('./colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
      './app/**/*.{js,jsx,ts,tsx}',
      './components/**/*.{js,jsx,ts,tsx}',
      './(tabs)/**/*.{js,jsx,ts,tsx}',
   ],
   presets: [require('nativewind/preset')],
   plugins: [],
   theme: {
      extend: {
         colors: {
            // Neo-brutalist color palette from colors.ts
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,

            // Text colors
            text: colors.text,
            textSecondary: colors.textSecondary,
            textMuted: colors.textMuted,
            textNeonCyan: colors.textNeonCyan,
            textNeonPink: colors.textNeonPink,
            textNeonGreen: colors.textNeonGreen,

            // Background colors
            background: colors.background,
            cyberBackground: colors.cyberBackground,
            cyberDarkBlue: colors.cyberDarkBlue,
            cyberDarkPurple: colors.cyberDarkPurple,
            cyberGray: colors.cyberGray,

            // Surface colors
            surface: colors.surface,
            surfaceElevated: colors.surfaceElevated,
            surfaceCyan: colors.surfaceCyan,
            surfacePink: colors.surfacePink,

            // Border colors
            border: colors.border,
            borderNeonCyan: colors.borderNeonCyan,
            borderNeonPink: colors.borderNeonPink,
            borderNeonGreen: colors.borderNeonGreen,
            borderNeonYellow: '#FFFF00',
            borderNeonOrange: '#FF8800',
            borderNeonMagenta: '#FF00FF',
            borderNeonRed: '#FF0080',

            // Cyberpunk neon colors
            neonCyan: colors.neonCyan,
            neonPink: colors.neonPink,
            neonGreen: colors.neonGreen,
            neonBlue: colors.neonBlue,
            neonPurple: colors.neonPurple,
            neonOrange: colors.neonOrange,
            neonYellow: '#FFFF00', // Bright neon yellow
            neonMagenta: '#FF00FF', // Bright neon magenta
            neonRed: '#FF0080', // Bright neon red

            // Cyberpunk specific colors for better readability
            'cyber-dark': '#000000', // Pure black for dark cyberpunk backgrounds
            'cyber-white': '#FFFFFF', // Pure white for maximum contrast
            'cyber-light': '#E0E0E0', // Light gray for secondary text

            // Holographic effects
            holoBlue: colors.holoBlue,
            holoPink: colors.holoPink,
            holoGreen: colors.holoGreen,
            holoWhite: colors.holoWhite,

            // Matrix effects
            matrixGreen: colors.matrixGreen,
            matrixGreenDark: colors.matrixGreenDark,
            matrixGreenGlow: colors.matrixGreenGlow,

            // Scan line effects
            scanlineBlue: colors.scanlineBlue,
            scanlineCyan: colors.scanlineCyan,

            // Status colors
            error: colors.error,
            success: colors.success,
            warning: colors.warning,
            info: colors.info,

            // Shadow colors
            shadow: colors.shadow,
            shadowNeonCyan: colors.shadowNeonCyan,
            shadowNeonPink: colors.shadowNeonPink,
            shadowNeonGreen: colors.shadowNeonGreen,
         },
      },
   },
};
