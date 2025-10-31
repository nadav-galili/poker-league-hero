# Onboarding Feature Implementation

## Overview

Add an onboarding flow that new, unauthenticated users can view from the home screen without signing in. The onboarding showcases app benefits before redirecting to login.

## User Flow

```
index.tsx
├─ User not authenticated
│  ├─ Has NOT seen onboarding → OnboardingFlow (swipeable slides)
│  │  └─ Complete/Skip → LoginForm
│  └─ Has seen onboarding → LoginForm
└─ User authenticated → Redirect to /(tabs)/my-leagues
```

## Task Checklist

### Phase 1: State Management

- [x] **Task 1: Add onboarding state to auth context**
   - Add `hasSeenOnboarding` boolean state
   - Add `markOnboardingComplete()` method
   - Add `resetOnboarding()` method (for testing/dev)
   - Persist to SecureStore like tokens
   - Restore on app startup

### Phase 2: Localization

- [x] **Task 2: Add onboarding translations**
   - Add to `context/localization.tsx` (Hebrew + English)
   - Keys: `onboarding.slide1Title`, `onboarding.slide1Description`, etc.
   - Keys: `onboarding.skipButton`, `onboarding.nextButton`, `onboarding.completeButton`

### Phase 3: Onboarding Content

- [x] **Task 3: Create onboarding constants**
   - Create `constants/onboarding.ts`
   - Define 5 slide objects with: title, description, icon/image
   - Slides:
      1. Welcome/Hero slide
      2. "Manage Your Leagues" slide
      3. "Track Player Stats" slide
      4. "AI Analysis & Insights" slide
      5. "Get Started" CTA slide

### Phase 4: UI Components

- [x] **Task 4: Create OnboardingFlow component**
   - Location: `components/onboarding/OnboardingFlow.tsx`
   - Use FlashList for smooth slide transitions
   - Features:
      - Swipeable carousel between slides
      - Pagination dots (show current slide)
      - Skip button (visible on slides 1-4, hidden on 5)
      - Next/Complete button
      - Press gesture to navigate
   - Styling: Match neo-brutalism from LoginForm (gradients, borders, blur effects)
   - On complete: call `markOnboardingComplete()` and redirect to LoginForm

### Phase 5: Navigation Integration

- [x] **Task 5: Update index.tsx routing**
   - Add conditional check for `hasSeenOnboarding`
   - If false && no user → show OnboardingFlow
   - If true && no user → show LoginForm
   - If user → redirect to tabs
   - Pass auth methods to OnboardingFlow component

### Phase 6: Testing & Polish

- [x] **Task 6: Test and refine**
   - Test persistence across app restart
   - Test skip functionality from different slides
   - Test complete flow
   - Add dev reset button (optional: in account settings)
   - Verify NativeWind styling works on both platforms
   - Verify Hebrew translations display correctly
   - Replaced emoji icons with actual onboarding images (350x350px)
   - Dev flag (DEV_FORCE_ONBOARDING) added for testing, now disabled

---

## Technical Details

### Onboarding State Persistence

- Key: `hasSeenOnboarding` in SecureStore
- Scope: Per device (separate from auth tokens)
- On signout: DO NOT reset (user still saw the onboarding)
- On fresh install: Not set (undefined), show onboarding

### Styling Approach

- Use neo-brutalism design (consistent with LoginForm)
- Color palette: From `colors.ts`
- Components: LinearGradient, BlurView (from existing imports)
- Animations: Simple slide transitions with React Native Animated
- Font: Space Grotesk (already loaded)

### Localization Strategy

- English + Hebrew support
- All UI strings in `context/localization.tsx`
- Slide content (title/description) in both languages
- Right-to-left layout for Hebrew (use `I18nManager` if needed)

---

## File Changes Summary

```
NEW FILES:
- components/onboarding/OnboardingFlow.tsx
- constants/onboarding.ts

MODIFIED FILES:
- context/auth.tsx (add state + methods)
- context/localization.tsx (add strings)
- app/index.tsx (add routing logic)
```

---

## Notes

- [[memory:7720864]] Use NativeWind classes for styling (not StyleSheet)
- [[memory:8198880]] Use `bun` commands instead of npm
- All components localized to Hebrew

---

## ✅ Feature Complete!
