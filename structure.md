# Poker League Hero - Project Structure

```
poker-league-hero/
│
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry point / home screen
│   ├── onboarding.tsx           # Onboarding screen
│   ├── privacy.tsx              # Privacy policy page
│   ├── terms.tsx                # Terms of service page
│   │
│   ├── (tabs)/                  # Tab navigation layout
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── account.tsx         # Account/profile screen
│   │   └── my-leagues.tsx      # Main leagues screen
│   │
│   ├── api/                     # API route handlers
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── apple/         # Apple OAuth endpoints
│   │   │   │   ├── apple-native+api.ts
│   │   │   │   ├── authorize+api.ts
│   │   │   │   ├── callback+api.ts
│   │   │   │   └── token+api.ts
│   │   │   ├── authorize+api.ts
│   │   │   ├── callback+api.ts
│   │   │   ├── logout+api.ts
│   │   │   ├── refresh+api.ts
│   │   │   ├── session+api.ts
│   │   │   └── token+api.ts
│   │   │
│   │   ├── games/              # Game management endpoints
│   │   │   ├── [gameId]/      # Game-specific endpoints
│   │   │   │   ├── add-player+api.ts
│   │   │   │   ├── buy-in+api.ts
│   │   │   │   ├── buy-out+api.ts
│   │   │   │   ├── end-game+api.ts
│   │   │   │   ├── remove-player+api.ts
│   │   │   │   └── undo-buy-in+api.ts
│   │   │   ├── [gameId]+api.ts
│   │   │   ├── active/
│   │   │   │   └── [leagueId]+api.ts
│   │   │   └── create+api.ts
│   │   │
│   │   ├── leagues/            # League management endpoints
│   │   │   ├── [id]+api.ts
│   │   │   ├── [leagueId]/
│   │   │   │   ├── ai-summary+api.ts
│   │   │   │   ├── available-players+api.ts
│   │   │   │   ├── games+api.ts
│   │   │   │   ├── stats/
│   │   │   │   │   └── rankings+api.ts
│   │   │   │   ├── stats+api.ts
│   │   │   │   └── store-summary+api.ts
│   │   │   ├── create+api.ts
│   │   │   ├── join+api.ts
│   │   │   └── user+api.ts
│   │   │
│   │   ├── protected/          # Protected routes
│   │   │   └── data+api.ts
│   │   │
│   │   ├── upload/             # File upload endpoints
│   │   │   └── image+api.ts
│   │   │
│   │   ├── user/               # User management endpoints
│   │   │   ├── delete+api.ts
│   │   │   └── update+api.ts
│   │   │
│   │   └── users/              # User operations
│   │       └── upsert+api.ts
│   │
│   ├── games/                  # Game-related screens
│   │   ├── [gameId]/
│   │   │   └── index.tsx      # Game detail screen
│   │   └── [leagueId]/
│   │       └── select-players.tsx
│   │
│   ├── join-league/            # Join league flow
│   │   └── [code].tsx         # Join by code screen
│   │
│   ├── leagues/                # League-related screens
│   │   ├── [id]/
│   │   │   ├── league-stats-screen.tsx
│   │   │   ├── stats/
│   │   │   │   └── [statType].tsx
│   │   │   └── stats.tsx
│   │   ├── create-league.tsx
│   │   └── index.tsx
│   │
│   ├── personal-stats/         # Personal statistics
│   │   └── index.tsx
│   │
│   └── stats/                   # Statistics screens
│       └── index.tsx
│
├── assets/                      # Static assets
│   ├── AppleIcon.png
│   ├── GoogleIcon.png
│   │
│   ├── fonts/                   # Custom fonts
│   │   ├── SpaceGrotesk-Bold.ttf
│   │   ├── SpaceGrotesk-Light.ttf
│   │   ├── SpaceGrotesk-Medium.ttf
│   │   ├── SpaceGrotesk-Regular.ttf
│   │   ├── SpaceGrotesk-SemiBold.ttf
│   │   └── SpaceMono-Regular.ttf
│   │
│   └── images/                  # Image assets
│       ├── adaptive-icon.png
│       ├── anonymous.webp
│       ├── favicon.png
│       ├── icon.png
│       ├── icon3.png
│       ├── onboarding/         # Onboarding images
│       │   ├── cyberss1.webp
│       │   ├── cyberss2.webp
│       │   ├── cyberss3.webp
│       │   ├── cyberss4.webp
│       │   └── cyberss5.webp
│       ├── partial-react-logo.png
│       └── splash-icon.png
│
├── components/                  # Reusable UI components
│   ├── auth/                   # Authentication components
│   │   └── LoginForm.tsx
│   │
│   ├── cards/                  # Card components
│   │
│   ├── charts/                 # Chart
│   ├── forms/                  # Form components
│   │   ├── CyberpunkFormField.tsx
│   │   └── CyberpunkImagePicker.tsx
│   │
│   ├── game/                   # Game-specific components
│   │   ├── AddPlayerModal.tsx
│   │   ├── CashOutModal.tsx
│   │   ├── GameEventsList.tsx
│   │   ├── GameSummary.tsx
│   │   ├── PlayerCard.tsx
│   │   └── RecentGameResults.tsx
│   │
│   ├── league/                 # League-specific components
│   │   ├── LeagueCard.tsx
│   │   ├── LeagueStats/
│   │   │   ├── AdditionalStatsCard.tsx
│   │   │   ├── index.ts
│   │   │   ├── LeagueHeader.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PlayerStatCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── TopProfitPlayerCard.tsx
│   │   ├── MyLeaguesHeader.tsx
│   │   └── SwipeableLeagueCard.tsx
│   │
│   ├── modals/                 # Modal components
│   │   ├── AnonymousPlayerModal.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── CyberpunkInputModal.tsx
│   │   ├── EditLeagueModal.tsx
│   │   ├── EditProfileModal.tsx
│   │   ├── GameSetupModal.tsx
│   │   ├── index.ts
│   │   └── InputModal.tsx
│   │
│   ├── navigation/             # Navigation components
│   │
│   ├── notifications/          # Notification components
│   │   └── BrutalistToast.tsx
│   │
│   ├── onboarding/            # Onboarding components
│   │   └── OnboardingSwiper.tsx
│   │
│   ├── shared/                 # Shared/common components
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LeagueCardSkeleton.tsx
│   │   ├── LoadingState.tsx
│   │   ├── LocalizedErrorFallback.tsx
│   │   ├── SentryDebug.tsx
│   │   └── TypographyDemo.tsx
│   │
│   ├── stats/                  # Statistics components
│   │   ├── StatsLeaderboardHero.tsx
│   │   ├── StatsLeaderboardRow.tsx
│   │   └── StatsLeaderboardSkeleton.tsx
│   │
│   ├── summary/                # Summary components
│   │   └── summary.tsx
│   │
│   ├── ui/                     # Basic UI components
│   │   ├── AppButton.tsx
│   │   ├── BuyInSelector.tsx
│   │   ├── CyberpunkButton.tsx
│   │   ├── CyberpunkLoader.tsx
│   │   ├── index.ts
│   │   ├── PlayerCard.tsx
│   │   └── PlayerGrid.tsx
│   │
│   ├── Button.tsx
│   ├── SignInWithAppleButton.tsx
│   ├── SignInWithAppleButton.ios.tsx
│   ├── SigninWithGoogleButton.tsx
│   └── Text.tsx
│
├── constants/                   # Constants and configuration
│   ├── leagueThemes.ts
│   ├── typography.ts
│   ├── README-Colors.md
│   ├── README-Localization.md
│   └── README-Typography.md
│
├── context/                     # React contexts
│   ├── auth.tsx                # Authentication state
│   └── localization.tsx        # i18n with Hebrew support
│
├── db/                          # Database layer
│   ├── connection.ts           # Database connection (web)
│   ├── connection.mobile.ts   # Database connection (mobile)
│   ├── index.ts                # Database exports (web)
│   ├── index.mobile.ts         # Database exports (mobile)
│   ├── schema.ts               # Drizzle schema (web)
│   ├── schema.mobile.ts        # Drizzle schema (mobile)
│   │
│   └── migrations/             # Database migrations
│       ├── 0000_abandoned_satana.sql
│       ├── 0001_awesome_vin_gonzales.sql
│       ├── 0002_add_apple_id.sql
│       ├── 0002_strong_master_mold.sql
│       ├── 0003_strange_menace.sql
│       ├── 0004_tranquil_the_spike.sql
│       ├── relations.ts
│       └── meta/               # Migration metadata
│           ├── _journal.json
│           ├── 0000_snapshot.json
│           ├── 0001_snapshot.json
│           ├── 0002_snapshot.json
│           ├── 0003_snapshot.json
│           └── 0004_snapshot.json
│
├── docs/                        # Documentation
│   └── social-features.md
│
├── hooks/                       # Custom React hooks
│   ├── index.ts
│   ├── useEditLeague.ts
│   ├── useGameCreation.ts
│   ├── useGameData.ts
│   ├── useLeagueGames.ts
│   ├── useLeagueMembers.ts
│   ├── useLeagueStats.ts
│   ├── useMixpanel.ts
│   ├── useMyLeagues.ts
│   ├── usePlayerSelection.ts
│   ├── usePlayerStat.ts
│   ├── useStatsRankings.ts
│   └── useTopProfitPlayer.ts
│
├── rules/                       # Cursor rules
│   └── brand_identity.md
│
├── scripts/                     # Utility scripts
│   └── debug_game.ts
│
├── services/                    # Business logic services
│   ├── aiSummarySchema.ts
│   ├── gameService.ts
│   ├── index.ts
│   ├── leagueOperationsService.ts
│   ├── leagueService.ts
│   ├── leagueSharingService.ts
│   ├── leagueStatsApiService.ts
│   ├── leagueStatsFormatters.ts
│   ├── leagueStatsHelpers.ts
│   ├── leagueStatsService.ts
│   ├── leagueUtils.ts
│   ├── leagueValidationService.ts
│   ├── llmClient.ts
│   ├── llmService.ts
│   └── mixpanel.ts
│
├── styles/                      # Style utilities
│   └── tw.ts
│
├── types/                       # TypeScript type definitions
│   ├── game.ts
│   ├── index.ts
│   ├── league.ts
│   └── player.ts
│
├── utils/                       # Utility functions
│   ├── apiErrorHandler.ts
│   ├── apple-auth.ts
│   ├── authorization.ts
│   ├── cache.ts
│   ├── cloudflareImages.ts
│   ├── cloudflareR2.ts
│   ├── fonts.ts
│   ├── middleware.ts
│   ├── rateLimiting.ts
│   ├── sentry.ts
│   └── validation.ts
│
├── .gitignore                   # Git ignore rules
├── babel.config.js              # Babel configuration
├── bun.lock                     # Bun lockfile
├── CLAUDE.md                    # Claude AI coding guidelines
├── colors.ts                    # Color definitions
├── constants.ts                 # App constants
├── drizzle.config.ts            # Drizzle ORM configuration
├── eas.json                     # EAS Build configuration
├── eslint.config.js             # ESLint configuration
├── expo-env.d.ts                # Expo TypeScript definitions
├── global.css                   # Global styles
├── metro.config.js              # Metro bundler configuration
├── nativewind-env.d.ts          # NativeWind TypeScript definitions
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
│
└── Documentation files:
    ├── ANDROID-IMAGE-UPLOAD-FIX.md
    ├── CYBERPUNK_LOADER_SHOWCASE.md
    ├── README.md
    ├── README-MyLeagues-Sentry.md
    └── README-Sentry.md
```

## Key Directories

- **`app/`** - Expo Router file-based routing (pages and API routes)
- **`components/`** - Reusable UI components organized by feature
- **`context/`** - React Context providers (auth, localization)
- **`db/`** - Database schema and migrations (Drizzle ORM)
- **`hooks/`** - Custom React hooks for data fetching and state management
- **`services/`** - Business logic and API service layers
- **`utils/`** - Utility functions and helpers
- **`types/`** - TypeScript type definitions
- **`assets/`** - Static assets (images, fonts)

## Excluded Directories

The following directories are excluded from this structure:

- `node_modules/` - Dependencies
- `dist/` - Build output
- `ios/build/` - iOS build artifacts
- `ios/Pods/` - CocoaPods dependencies
- `.expo/` - Expo cache
- `.git/` - Git repository data
- Any other build/cache directories
