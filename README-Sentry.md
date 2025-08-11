# Sentry Error Tracking Implementation

## Overview

Sentry has been successfully integrated into the Poker League Hero app for comprehensive error tracking, crash reporting, and performance monitoring.

## Setup Complete ✅

### 1. Installation & Configuration

- ✅ Installed `@sentry/react-native` package
- ✅ Created Sentry project: `nadav-g/poker-league-hero`
- ✅ Configured DSN and initialization in `app/_layout.tsx`
- ✅ Added Sentry Expo plugin to `app.json`
- ✅ Configured Metro bundler for source maps
- ✅ Set up iOS build phase for symbol upload

### 2. Error Boundary Implementation

- ✅ Created `ErrorBoundary` component that catches React errors
- ✅ Added `LocalizedErrorFallback` component with Hebrew translations
- ✅ Wrapped app with error boundary in root layout
- ✅ Integrated with localization system

### 3. Reusable Utilities

- ✅ Created `utils/sentry.ts` with helper functions:
  - `captureException()` - Enhanced error capturing with context
  - `captureMessage()` - Message logging with severity levels
  - `setUser()` - User context for better debugging
  - `addBreadcrumb()` - Navigation and action tracking
  - `setTag()` / `setTags()` - Filtering and categorization
  - `profileFunction()` - Function-level error tracking

### 4. API Error Handling

- ✅ Created `utils/apiErrorHandler.ts` with:
  - `handleApiError()` - Structured API error reporting
  - `sentryFetch()` - Enhanced fetch wrapper with automatic error tracking
  - `withApiErrorHandling()` - HOC for async function error tracking

### 5. Development Tools

- ✅ Created `SentryDebug` component for testing (development only)
- ✅ Added test buttons for all Sentry features
- ✅ Integrated into login screen for easy access during development

## Configuration Files Modified

### `app.json`

```json
{
  "plugins": [
    // ... other plugins
    [
      "@sentry/react-native/expo",
      {
        "url": "https://sentry.io/",
        "project": "poker-league-hero",
        "organization": "nadav-g"
      }
    ]
  ]
}
```

### `metro.config.js`

```javascript
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const config = getSentryExpoConfig(__dirname);
module.exports = config;
```

### Environment Files

- ✅ `.env.local` created with auth tokens (DO NOT COMMIT)
- ✅ `ios/sentry.properties` and `android/sentry.properties` created

## Usage Examples

### Basic Error Capturing

```typescript
import { captureException, captureMessage } from "@/utils/sentry";

try {
  // risky operation
} catch (error) {
  captureException(error, {
    component: "LoginForm",
    action: "submitLogin",
  });
}

captureMessage("User login attempt", "info", { userId: "123" });
```

### User Context

```typescript
import { setUser } from "@/utils/sentry";

setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### Breadcrumbs for Navigation

```typescript
import { addBreadcrumb } from "@/utils/sentry";

addBreadcrumb("User navigated to leagues", "navigation", {
  from: "home",
  to: "leagues",
});
```

### Function Profiling

```typescript
import { profileFunction } from "@/utils/sentry";

const safeApiCall = profileFunction(apiCall, "fetchUserData");
```

### API Error Handling

```typescript
import { sentryFetch, withApiErrorHandling } from "@/utils/apiErrorHandler";

// Enhanced fetch with automatic error tracking
const response = await sentryFetch("/api/user", { method: "GET" });

// Function wrapper with error handling
const safeFunction = withApiErrorHandling(riskyFunction, "processPayment");
```

## Localization Support

All error messages are localized in Hebrew and English:

- Error titles and descriptions
- Retry button text
- User-facing error messages

Translations are in `context/localization.tsx`:

```typescript
// Error Boundary
errorOccurred: "Oops! Something went wrong" | "אופס! משהו השתבש";
errorMessage: "An unexpected error occurred..." | "אירעה שגיאה בלתי צפויה...";
tryAgain: "Try Again" | "נסה שוב";
```

## Development Testing

The `SentryDebug` component (visible only in development) provides test buttons for:

- ✅ Manual error throwing
- ✅ Message capturing with different severity levels
- ✅ Breadcrumb testing
- ✅ User context setting
- ✅ Tag management
- ✅ Performance monitoring
- ✅ Async error simulation

## Important Notes

### Security

- ⚠️ **DO NOT COMMIT** auth tokens in `.env.local`, `ios/sentry.properties`, or `android/sentry.properties`
- ✅ These files are automatically added to `.gitignore`

### Performance

- Session Replay enabled with conservative sampling:
  - 10% of normal sessions recorded
  - 100% of error sessions recorded
- All text content, images, and webviews are masked by default for privacy

### Build Requirements

Since this app uses `npx expo run:ios` (not Expo Go):

- ✅ Native builds required for full Sentry functionality
- ✅ Source map upload configured for iOS
- ✅ Debug symbol upload configured
- ✅ Metro bundler configured for proper source maps

## Next Steps

1. **Test in Production**: Deploy and verify error reporting in production builds
2. **Custom Dashboards**: Set up Sentry dashboards for monitoring key metrics
3. **Alerts**: Configure alerts for critical errors and performance issues
4. **User Feedback**: Consider implementing Sentry's user feedback widget
5. **Release Tracking**: Add release management for tracking errors by version

## Sentry Dashboard

Access your project at: https://nadav-g.sentry.io/issues/?project=4509824848101456

Monitor:

- Real-time errors and crashes
- Performance metrics
- User sessions with replay
- Release health and adoption
- Custom tags and filtering
