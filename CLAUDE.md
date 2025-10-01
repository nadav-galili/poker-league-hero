# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development**:
- `bun install` - Install dependencies (use bun, not npm)
- `bun start` - Start Expo development server
- `bun run android` - Run on Android emulator
- `bun run ios` - Run on iOS simulator
- `bun run web` - Run web version

**Code Quality**:
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

**Database (Drizzle ORM + PostgreSQL)**:
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio

## Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Routing**: Expo Router v5 with file-based routing and typed routes
- **Styling**: NativeWind (Tailwind CSS for React Native) + custom neo-brutalist design system
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based auth with Expo AuthSession
- **Package Manager**: Bun (never use npm)
- **Error Tracking**: Sentry with React Native integration
- **Storage**: Expo SecureStore for tokens, AsyncStorage for app state

### Project Structure
```
app/                          # Expo Router file-based routing
├── (tabs)/                  # Tab navigation layout
│   ├── _layout.tsx         # Tab bar configuration
│   ├── my-leagues.tsx      # Main leagues screen
│   └── account.tsx         # Account/profile screen
├── api/                    # API route handlers
│   ├── auth/              # Authentication endpoints
│   ├── games/             # Game management endpoints
│   └── leagues/           # League management endpoints
├── games/                 # Game-related screens
├── leagues/               # League-related screens
├── _layout.tsx            # Root layout with providers
└── index.tsx              # Entry point

components/                   # Reusable UI components
├── shared/                # Common shared components
├── auth/                  # Authentication components
├── game/                  # Game-specific components
├── league/                # League-specific components
└── ui/                    # Basic UI components

context/                     # React contexts
├── auth.tsx               # Authentication state
└── localization.tsx       # i18n with Hebrew support

db/                          # Database layer
├── schema.ts              # Drizzle schema definitions
├── connection.ts          # Database connection
└── migrations/            # Generated migrations

utils/                       # Utility functions
├── fonts.ts               # Font loading
├── sentry.ts              # Error tracking setup
├── cloudflareR2.ts        # File upload to R2
└── apiErrorHandler.ts     # API error handling
```

### Key Patterns

**Authentication Flow**:
- JWT tokens stored in SecureStore
- OAuth integration via Expo AuthSession
- Auth context provides user state across app
- Protected routes check authentication status

**Database Integration**:
- Drizzle ORM with PostgreSQL
- Schema defined in `db/schema.ts`
- API routes handle database operations
- Migrations managed via drizzle-kit

**Styling System**:
- Neo-brutalist design with bold borders, shadows, and bright colors
- Colors defined in `colors.ts` and extended in Tailwind config
- NativeWind for utility-first styling
- Custom theme system with light/dark mode support

**Internationalization**:
- Hebrew and English support via localization context
- All UI text must be localized using `t()` function
- Translation keys defined in `context/localization.tsx`

## Development Guidelines

**Package Management**:
- Always use `bun` instead of `npm` (see `.cursor/rules/bun-install.mdc`)
- Commands: `bun install`, `bun add <package>`, `bun run <script>`

**UI Development**:
- Use FlashList for rendering lists (see `.cursor/rules/render-lists.mdc`)
- All screens must be localized with Hebrew translations
- Follow neo-brutalist design system defined in `colors.ts`
- Use NativeWind classes for styling

**Date Handling**:
- Use dayjs for all date operations instead of native Date object
- Already installed as dependency

**API Integration**:
- API routes follow Expo Router conventions (`+api.ts` files)
- Error handling via custom `apiErrorHandler` utility
- Sentry integration for error tracking

**State Management**:
- React Context for global state (auth, localization)
- Local component state for UI-specific data
- AsyncStorage for persistent app state

**File Organization**:
- Components organized by feature (auth, game, league, shared, ui)
- API routes mirror the app structure
- Utilities kept in dedicated `utils/` directory

## Important Notes

- Project uses Expo SDK 53 with New Architecture enabled
- Custom deep linking scheme: `pokerleaguehero://`
- Sentry DSN configured for error tracking
- EAS Build configured for distribution
- Database connection requires `.env.local` with `DATABASE_URL`