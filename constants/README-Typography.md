# Space Grotesk Typography System

This project uses Space Grotesk as the primary font family with a comprehensive typography system.

## Font Weights Available

- **Light** (300) - SpaceGrotesk-Light.ttf
- **Regular** (400) - SpaceGrotesk-Regular.ttf
- **Medium** (500) - SpaceGrotesk-Medium.ttf
- **SemiBold** (600) - SpaceGrotesk-SemiBold.ttf
- **Bold** (700) - SpaceGrotesk-Bold.ttf

## Typography Variants

### Display & Headings

- `display` - Large display text (32px, Bold)
- `h1` - Main heading (28px, Bold)
- `h2` - Section heading (24px, SemiBold)
- `h3` - Subsection heading (20px, SemiBold)
- `h4` - Small heading (18px, Medium)

### Body Text

- `bodyLarge` - Large body text (18px, Regular)
- `body` - Standard body text (16px, Regular)
- `bodySmall` - Small body text (14px, Regular)

### Labels

- `labelLarge` - Large label (16px, Medium)
- `label` - Standard label (14px, Medium)
- `labelSmall` - Small label (12px, Medium)

### Captions

- `caption` - Caption text (12px, Regular)
- `captionSmall` - Small caption (10px, Regular)

### Buttons

- `buttonLarge` - Large button text (16px, SemiBold)
- `button` - Standard button text (14px, SemiBold)
- `buttonSmall` - Small button text (12px, Medium)

## Usage

### Using the Text Component

```tsx
import { Text } from '@/components/Text';

// Basic usage
<Text variant="h1">My Heading</Text>

// With custom color
<Text variant="body" color="#ff0000">Colored text</Text>

// With additional styles
<Text variant="label" style={{ textAlign: 'center' }}>
  Centered label
</Text>
```

### Direct Typography Access

```tsx
import { Typography } from "@/constants/typography";

const styles = StyleSheet.create({
  myText: {
    ...Typography.h2,
    color: "blue",
  },
});
```

### Font Family Access

```tsx
import { FontFamily } from "@/constants/typography";

const styles = StyleSheet.create({
  customText: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 16,
  },
});
```

## Platform Support

The typography system automatically handles platform differences:

- **iOS**: Uses font family names directly
- **Android**: Uses font family names directly
- **Web**: Falls back to system-ui and sans-serif

## Font Loading

Fonts are automatically loaded in `app/_layout.tsx` before the app renders. The loading process:

1. Downloads all font files during build
2. Registers fonts with expo-font
3. Shows splash screen until fonts are loaded
4. Renders app with fonts available

## Demo Component

Use `TypographyDemo` component to see all variants:

```tsx
import TypographyDemo from "@/components/TypographyDemo";

<TypographyDemo />;
```
