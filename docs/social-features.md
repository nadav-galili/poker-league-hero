# Social Feature Ideas

## 1) League Feed + Reactions
- Per-league activity feed with auto posts after each game (buy-in, winners, biggest pot) and quick emoji reactions.
- Use AI summaries to generate short recaps; expose via `/api/leagues/[id]/feed` and show on league home screen.

## 2) Shareable Stat Cards
- Let players share nightly/weekly “brag cards” (top profit, comeback, luckiest hand) as images to social apps.
- Build cards from existing stats and reuse native share flow.

## 3) Head-to-Head Challenges & Bounties
- Members issue side challenges (e.g., outlast me, most knockouts) that award badges/points.
- Store lightweight challenge records; show during game setup and resolve when results post.

---

# How to Implement: Shareable Stat Cards

## Goal
Give players a one-tap way to export/shares a visual card summarizing a game or weekly highlight (top profit, biggest comeback, luckiest hand) to social apps.

## High-Level Flow
1) User taps “Share highlight” on game results or personal stats.
2) App builds a `StatCardData` object from existing stats services.
3) Render a themed `StatCard` component to an offscreen canvas/view and snapshot it to an image.
4) Invoke the existing native share flow (reuse `services/leagueSharingService.ts` pattern) with the generated image.

## Data Sources
- `services/leagueStatsService.ts` / `leagueStatsApiService.ts`: totals, profit, streaks.
- `services/leagueStatsHelpers.ts`: formatting helpers.
- `services/gameService.ts`: per-game results if sharing a single game.
- `services/llmService.ts` (optional): generate short captions.

## Proposed Types
```ts
export type StatCardType = 'game_top_profit' | 'game_comeback' | 'weekly_highlight';

export interface StatCardData {
  type: StatCardType;
  title: string;
  subtitle?: string;
  leagueName: string;
  playerName: string;
  metricLabel: string;
  metricValue: string;
  footer?: string;
  avatarUrl?: string;
  themeColor?: string;
}
```

## UI Components (React Native)
- `components/StatCard.tsx`: Pure UI view with prop `data: StatCardData` (no business logic). Include a variant prop for cyberpunk theme.
- `components/ShareStatCardButton.tsx`: fetches data, renders `StatCard` offscreen, snapshots, and calls share.

## Implementation Steps
1) **Assemble data**
   - Add helper in `services/leagueStatsService.ts` like `buildGameTopProfitCard(gameId, userId)` that returns `StatCardData` using existing stats.
   - Include short subtitle (e.g., “Game on Jan 12”) and metric (“+345”).

2) **Render to image**
   - Use `expo-view-shot` (or `react-native-view-shot`) to wrap `StatCard` in a hidden view, call `captureRef` to get a PNG URI.
   - Add the package to `package.json` and configure for Expo if not present.

3) **Share image**
   - Create `services/statCardSharingService.ts` mirroring `services/leagueSharingService.ts` but sharing `url`/`message` with an image URI from step 2.
   - On iOS, include `UIImageWriteToSavedPhotosAlbum` permission text if needed; on Android, ensure file URI permissions via share API.

4) **Trigger points**
   - Game results screen (likely in `app/games/[gameId]/`): add CTA “Share highlight”.
   - Personal stats (`app/personal-stats/index.tsx`): weekly highlight card.
   - Optionally add a small toast after sharing success/failure using existing error states.

5) **Styling/Branding**
   - Pull colors/gradients from cyberpunk theme (`colors.ts` / `styles`).
   - Include league logo and player avatar if available.

6) **Captions/Copy** (optional)
   - Use `llmService` to generate a short caption (“Nadav crushed with +420 in HomeStack”). Cache per league to avoid churn.

7) **Analytics**
   - Mirror `leagueSharingService` telemetry: add breadcrumbs and `captureMessage` with fields `{ screen, cardType, leagueId, gameId }`.

8) **Testing**
   - Snapshot rendering locally to verify layout in both light/dark themes.
   - Confirm share works on iOS/Android; mock `captureRef` in unit tests if you have Jest setup.

## Rough Usage Example
```tsx
const handleShare = async () => {
  const data = await buildGameTopProfitCard(gameId, userId);
  const uri = await renderStatCardToImage(data); // wraps view-shot captureRef
  await shareStatCard({ uri, title: data.title, message: data.subtitle });
};
```
