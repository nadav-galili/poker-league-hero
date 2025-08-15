# Screen Organization

This document outlines the organized screen structure for the Poker League Hero app.

## Directory Structure

```
app/
├── (tabs)/                    # Tab-based navigation screens
│   ├── _layout.tsx           # Tab layout configuration
│   ├── my-leagues.tsx        # My Leagues tab
│   └── account.tsx           # Account tab
├── leagues/                   # League-related screens
│   ├── index.tsx             # League module exports
│   └── create-league.tsx     # Create League screen
├── games/                     # Game-related screens
│   └── index.tsx             # Games screen (placeholder)
├── stats/                     # League statistics screens
│   └── index.tsx             # Stats screen (placeholder)
├── personal-stats/            # Personal statistics screens
│   └── index.tsx             # Personal Stats screen (placeholder)
├── _layout.tsx                # Root layout configuration
└── index.tsx                  # Root index
```

## Navigation Paths

- **My Leagues**: `/` (tab)
- **Create League**: `/leagues/create-league`
- **Games**: `/games`
- **Stats**: `/stats`
- **Personal Stats**: `/personal-stats`
- **Account**: `/account` (tab)

## Screen Features

### Leagues

- **create-league.tsx**: Form for creating new poker leagues with name, description, max members, and privacy settings

### Placeholder Screens

- **games/index.tsx**: Future implementation for game management
- **stats/index.tsx**: Future implementation for league statistics
- **personal-stats/index.tsx**: Future implementation for personal player statistics

## Design System

All screens follow the app's neo-brutalist design system:

- Consistent color scheme using `@/colors`
- Typography using `@/components/Text`
- Localization support (English/Hebrew)
- RTL-aware layouts
- Consistent spacing and shadows

## Localization

New screen titles are localized:

- English: GAMES, STATS, PERSONAL STATS
- Hebrew: משחקים, סטטיסטיקות, סטטיסטיקות אישיות
