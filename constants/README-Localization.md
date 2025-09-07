# Localization System

This project includes a comprehensive localization system supporting English and Hebrew with RTL (Right-to-Left) text direction support.

## Features

- **Two Languages**: English (default) and Hebrew
- **RTL Support**: Automatic text direction switching for Hebrew
- **Persistent Storage**: Language preference saved locally
- **Type Safety**: Full TypeScript support for translation keys
- **Context-based**: Global state management using React Context
- **Neo-Brutalist UI**: Language selector with bold styling

## Quick Start

### Using Translations

```tsx
import { useLocalization } from '@/context/localization';

function MyComponent() {
   const { t, language, isRTL } = useLocalization();

   return (
      <Text style={[styles.text, isRTL && styles.rtlText]}>
         {t('myLeagues')}
      </Text>
   );
}
```

### Changing Language

```tsx
import { useLocalization } from '@/context/localization';

function LanguageButton() {
   const { setLanguage } = useLocalization();

   const switchToHebrew = async () => {
      await setLanguage('he');
   };

   return <Button onPress={switchToHebrew} title="עברית" />;
}
```

## Available Translation Keys

### Navigation

- `myLeagues` - "MY LEAGUES" / "הליגות שלי"
- `account` - "ACCOUNT" / "חשבון"

### League Screen

- `createLeague` - "Create League" / "צור ליגה"
- `joinLeague` - "Join League" / "הצטרף לליגה"
- `noLeaguesYet` - "NO LEAGUES YET" / "עדיין אין ליגות"
- `members` - "MEMBERS" / "חברים"

### Authentication

- `signInWithGoogle` - "SIGN IN WITH GOOGLE" / "התחבר עם גוגל"
- `continueAsGuest` - "CONTINUE AS GUEST" / "המשך כאורח"
- `signOut` - "SIGN OUT" / "התנתק"

### Account

- `accountActions` - "ACCOUNT ACTIONS" / "פעולות חשבון"
- `userDetails` - "USER DETAILS" / "פרטי משתמש"

### Common

- `language` - "LANGUAGE" / "שפה"
- `english` - "English" / "English"
- `hebrew` - "עברית" / "עברית"

### Actions

- `create` - "Create" / "צור"
- `join` - "Join" / "הצטרף"
- `cancel` - "Cancel" / "ביטול"
- `error` - "Error" / "שגיאה"

## Language Selector Component

The `LanguageSelector` component provides a neo-brutalist styled language picker:

```tsx
import { LanguageSelector } from '@/components/LanguageSelector';

function MyScreen() {
   return (
      <View>
         <LanguageSelector size="medium" />
      </View>
   );
}
```

### Props

- `size`: `'small' | 'medium' | 'large'` - Controls button size

## RTL Support

Hebrew language automatically enables RTL (Right-to-Left) layout:

```tsx
const { isRTL } = useLocalization();

// Apply RTL styles conditionally
<View style={[styles.container, isRTL && styles.rtlContainer]}>
   <Text style={[styles.text, isRTL && styles.rtlText]}>{t('welcome')}</Text>
</View>;

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
   },
   rtlContainer: {
      flexDirection: 'row-reverse',
   },
   text: {
      textAlign: 'left',
   },
   rtlText: {
      textAlign: 'right',
   },
});
```

## Adding New Translations

1. **Add to interfaces**: Update the `Translations` interface in `context/localization.tsx`

```tsx
export interface Translations {
   // ... existing keys
   newKey: string;
}
```

2. **Add to English translations**:

```tsx
const enTranslations: Translations = {
   // ... existing translations
   newKey: 'New Text',
};
```

3. **Add to Hebrew translations**:

```tsx
const heTranslations: Translations = {
   // ... existing translations
   newKey: 'טקסט חדש',
};
```

4. **Use in components**:

```tsx
<Text>{t('newKey')}</Text>
```

## Storage

Language preferences are automatically saved to AsyncStorage using the key `@poker_league_language` and persist across app restarts.

## Context Structure

```tsx
interface LocalizationContextType {
   language: Language; // Current language ('en' | 'he')
   setLanguage: (lang: Language) => Promise<void>; // Change language
   t: (key: string) => string; // Translate function
   isRTL: boolean; // RTL layout flag
}
```

## Implementation Details

- **Provider**: `LocalizationProvider` wraps the entire app
- **Storage**: Uses `@react-native-async-storage/async-storage`
- **RTL Management**: Uses React Native's `I18nManager`
- **Type Safety**: Full TypeScript support with translation key validation
- **Fallback**: Returns the key if translation is missing

## Neo-Brutalist Language Selector

The language selector follows the app's neo-brutalist design:

- Bold borders (2-4px)
- Hard shadows (4px offset)
- High contrast colors
- Flag emojis for visual recognition
- Modal popup with dramatic styling

## Best Practices

1. **Always use RTL conditional styling** for Hebrew support
2. **Use semantic translation keys** (e.g., `signOut` not `button1`)
3. **Test both languages** during development
4. **Consider text expansion** - Hebrew text may be longer
5. **Use the `t()` function** everywhere, never hardcode strings
6. **Provide context** in longer translation keys for translators

## Future Enhancements

- Add more languages (Arabic, Spanish, French)
- Implement pluralization support
- Add date/time localization
- Support for dynamic content translation
- Integration with translation services
