import { colors } from '@/colors';
import { StyleSheet } from 'react-native';

// Utility function to create Tailwind-like utility classes
export const tw = StyleSheet.create({
   // Flexbox
   'flex-1': { flex: 1 },
   'flex-row': { flexDirection: 'row' },
   'flex-col': { flexDirection: 'column' },
   'items-center': { alignItems: 'center' },
   'items-start': { alignItems: 'flex-start' },
   'items-end': { alignItems: 'flex-end' },
   'justify-center': { justifyContent: 'center' },
   'justify-between': { justifyContent: 'space-between' },
   'justify-start': { justifyContent: 'flex-start' },
   'justify-end': { justifyContent: 'flex-end' },
   'self-start': { alignSelf: 'flex-start' },
   'self-center': { alignSelf: 'center' },
   'self-end': { alignSelf: 'flex-end' },

   // Spacing - Padding
   'p-1': { padding: 4 },
   'p-2': { padding: 8 },
   'p-3': { padding: 12 },
   'p-4': { padding: 16 },
   'p-5': { padding: 20 },
   'p-6': { padding: 24 },
   'px-2': { paddingHorizontal: 8 },
   'px-3': { paddingHorizontal: 12 },
   'px-4': { paddingHorizontal: 16 },
   'px-5': { paddingHorizontal: 20 },
   'py-1': { paddingVertical: 4 },
   'py-1.5': { paddingVertical: 6 },
   'py-2': { paddingVertical: 8 },
   'py-3': { paddingVertical: 12 },
   'py-4': { paddingVertical: 16 },
   'pt-15': { paddingTop: 60 },
   'pb-4': { paddingBottom: 16 },

   // Spacing - Margin
   'mb-1': { marginBottom: 4 },
   'mb-2': { marginBottom: 8 },
   'mb-3': { marginBottom: 12 },
   'mb-4': { marginBottom: 16 },
   'mb-5': { marginBottom: 20 },
   'mb-6': { marginBottom: 24 },
   'mr-4': { marginRight: 16 },
   'mr-5': { marginRight: 20 },
   'ml-3': { marginLeft: 12 },
   'mt-4': { marginTop: 16 },

   // Width & Height
   'w-10': { width: 40 },
   'w-15': { width: 60 },
   'w-24': { width: 96 },
   'w-25': { width: 100 },
   'h-15': { height: 60 },
   'h-24': { height: 96 },
   'h-25': { height: 100 },

   // Colors - Background
   'bg-background': { backgroundColor: colors.background },
   'bg-surface': { backgroundColor: colors.surface },
   'bg-surfaceElevated': { backgroundColor: colors.surfaceElevated },
   'bg-primary': { backgroundColor: colors.primary },
   'bg-secondary': { backgroundColor: colors.secondary },
   'bg-accent': { backgroundColor: colors.accent },
   'bg-highlight': { backgroundColor: colors.highlight },
   'bg-primaryTint': { backgroundColor: colors.primaryTint },
   'bg-secondaryTint': { backgroundColor: colors.secondaryTint },
   'bg-accentTint': { backgroundColor: colors.accentTint },
   'bg-highlightTint': { backgroundColor: colors.highlightTint },
   'bg-successTint': { backgroundColor: colors.successTint },
   'bg-warningTint': { backgroundColor: colors.warningTint },
   'bg-errorTint': { backgroundColor: colors.errorTint },
   'bg-infoTint': { backgroundColor: colors.infoTint },
   'bg-dangerTint': { backgroundColor: colors.dangerTint },
   'bg-white': { backgroundColor: '#FFFFFF' },
   'bg-textInverse': { backgroundColor: colors.textInverse },
   'bg-success': { backgroundColor: colors.success },
   'bg-warning': { backgroundColor: colors.warning },
   'bg-error': { backgroundColor: colors.error },
   'bg-info': { backgroundColor: colors.info },
   'bg-danger': { backgroundColor: colors.danger },

   // Colors - Text
   'text-textInverse': { color: colors.textInverse },
   'text-textSecondary': { color: colors.textSecondary },
   'text-textMuted': { color: colors.textMuted },
   'text-primary': { color: colors.primary },
   'text-secondary': { color: colors.secondary },
   'text-accent': { color: colors.accent },
   'text-highlight': { color: colors.highlight },
   'text-success': { color: colors.success },
   'text-warning': { color: colors.warning },
   'text-error': { color: colors.error },
   'text-info': { color: colors.info },
   'text-danger': { color: colors.danger },

   // Typography
   'text-xl': { fontSize: 20 },
   'text-3xl': { fontSize: 30 },
   'font-bold': { fontWeight: '700' },
   'font-extrabold': { fontWeight: '800' },
   'font-semibold': { fontWeight: '600' },
   uppercase: { textTransform: 'uppercase' },
   'tracking-wide': { letterSpacing: 1 },
   'tracking-wider': { letterSpacing: 1.2 },
   'text-center': { textAlign: 'center' },
   'leading-5': { lineHeight: 20 },

   // Border
   'rounded-lg': { borderRadius: 8 },
   'rounded-xl': { borderRadius: 12 },
   'rounded-md': { borderRadius: 6 },
   'border-3': { borderWidth: 3 },
   'border-6': { borderWidth: 6 },
   'border-b-6': { borderBottomWidth: 6 },
   'border-primary': { borderColor: colors.primary },
   'border-secondary': { borderColor: colors.secondary },
   'border-accent': { borderColor: colors.accent },
   'border-highlight': { borderColor: colors.highlight },
   'border-success': { borderColor: colors.success },
   'border-warning': { borderColor: colors.warning },
   'border-error': { borderColor: colors.error },
   'border-info': { borderColor: colors.info },
   'border-danger': { borderColor: colors.danger },
   'border-border': { borderColor: colors.border },
   'border-text': { borderColor: colors.text },

   // Shadow
   'shadow-lg': {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
   },
   'shadow-md': {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
   },
   'shadow-shadow': {
      shadowColor: colors.shadow,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
   },

   // Layout
   'gap-2': { gap: 8 },
   'gap-3': { gap: 12 },
   'gap-4': { gap: 16 },
   'min-w-[45%]': { minWidth: '45%' },
   'flex-wrap': { flexWrap: 'wrap' },

   // Opacity
   'opacity-90': { opacity: 0.9 },
});

// Helper function to combine multiple tw styles
export const twMerge = (...styles: (keyof typeof tw)[]): any => {
   return styles.map((style) => tw[style]);
};
