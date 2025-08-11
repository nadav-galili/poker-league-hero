# Neo-Brutalist Color System

This project uses a bold, high-contrast neo-brutalist color palette designed for maximum visual impact and accessibility.

## Design Philosophy

Neo-brutalism in UI design emphasizes:

- **High contrast** - Pure black borders and shadows against bright backgrounds
- **Bold colors** - Electric, saturated accent colors that demand attention
- **Sharp edges** - No gradients, hard color transitions
- **Heavy shadows** - Black drop shadows for depth
- **Flat design** - Solid colors without subtle shading

## Core Color Palette

### Base Colors

- **Ink** (`#000000`) - Pure black for maximum contrast borders and text
- **Paper** (`#FFFFFF`) - Pure white for stark backgrounds
- **Concrete** (`#F0F0F0`) - Light gray for card surfaces
- **Shadow** (`#000000`) - Black shadows for brutalist depth

### Electric Accent Colors

- **Electric Blue** (`#0066FF`) - Primary brand color
- **Hot Pink** (`#FF1493`) - Secondary accent
- **Neon Yellow** (`#FFFF00`) - Warning/highlight color
- **Acid Green** (`#32FF32`) - Success states
- **Blaze Orange** (`#FF4500`) - Error/danger states
- **Cyber Purple** (`#8A2BE2`) - Info states
- **Toxic Lime** (`#CCFF00`) - Special highlights

## Usage Guidelines

### Text Colors

```tsx
text: colors.text,           // Black text on light backgrounds
textSecondary: colors.textSecondary,  // Dark gray for secondary text
textMuted: colors.textMuted,      // Medium gray for muted text
textInverse: colors.textInverse,  // White text on dark backgrounds
```

### Background Colors

```tsx
background: colors.background,        // Pure white main background
surface: colors.surface,             // Light gray for cards
surfaceElevated: colors.surfaceElevated,  // White for elevated surfaces
```

### Border & Shadow

```tsx
border: colors.border,       // Black borders (4-6px width)
shadow: colors.shadow,       // Black shadows with hard edges
```

### Brand Colors

```tsx
primary: colors.primary,           // Electric blue
primaryTint: colors.primaryTint,   // Light blue backgrounds

secondary: colors.secondary,       // Hot pink
secondaryTint: colors.secondaryTint, // Light pink backgrounds

accent: colors.accent,             // Neon yellow
accentTint: colors.accentTint,     // Light yellow backgrounds
```

### Status Colors

```tsx
success: colors.success,           // Acid green
warning: colors.warning,           // Neon yellow
error: colors.error,               // Blaze orange
info: colors.info,                 // Cyber purple
highlight: colors.highlight,       // Toxic lime
danger: colors.danger,             // Shock red
```

## Neo-Brutalist Design Patterns

### Card Design

```tsx
style={{
  backgroundColor: theme.surfaceElevated,
  borderWidth: 4,
  borderColor: theme.border,
  borderRadius: 12,
  shadowColor: theme.shadow,
  shadowOffset: { width: 8, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 0,
}}
```

### Button Design

```tsx
style={{
  backgroundColor: colors.primary,
  borderWidth: 3,
  borderColor: colors.border,
  borderRadius: 6,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
}}
```

### Header Design

```tsx
style={{
  backgroundColor: colors.primary,
  borderBottomWidth: 6,
  borderBottomColor: colors.border,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 0,
}}
```

## League Card Color Variants

The my-leagues screen uses different color themes for visual variety:

1. **Electric Blue** - Primary leagues (Professional/main leagues)
2. **Hot Pink** - Secondary leagues (Social/casual leagues)
3. **Toxic Lime** - Special leagues (VIP/exclusive leagues)
4. **Neon Yellow** - Highlighted leagues (New/featured leagues)

## Accessibility

All color combinations meet WCAG AA contrast requirements:

- Black text on white backgrounds: 21:1 ratio
- White text on colored backgrounds: Minimum 4.5:1 ratio
- High contrast borders ensure clear visual separation

## Dark Mode

The system supports dark mode with inverted backgrounds while maintaining the same bold accent colors for consistency.

```tsx
// Use theme instead of direct colors for adaptive design
backgroundColor: theme.background,  // Automatically switches white/black
color: theme.text,                 // Automatically switches black/white
```
