# Sentry Integration - My Leagues Screen

## Overview

Comprehensive error tracking and user behavior monitoring has been implemented in the My Leagues screen (`app/(tabs)/my-leagues.tsx`).

## Implemented Tracking Features

### 🎯 **Screen-Level Tracking**

- **Screen Visit Tracking**: Automatically logs when users enter the My Leagues screen
- **Screen Tagging**: Sets `current_screen: my_leagues` tag for filtering in Sentry dashboard
- **Navigation Breadcrumbs**: Tracks user navigation to this screen

```typescript
React.useEffect(() => {
   addBreadcrumb('User visited My Leagues screen', 'navigation', {
      screen: 'MyLeagues',
      timestamp: new Date().toISOString(),
   });
   setTag('current_screen', 'my_leagues');
}, []);
```

### 🎮 **User Action Tracking**

#### Create League Button

- Tracks button clicks with context
- Monitors feature usage patterns
- Captures errors in dialog opening

#### Join League Button

- Tracks join attempts with code validation
- Monitors user input patterns (code length)
- Captures join completion/failure rates

#### League Card Interactions

- Tracks league card taps with league details
- Monitors user engagement with specific leagues
- Captures league viewing patterns

#### Share Functionality

- Tracks share initiation and completion
- Monitors share cancellations vs. successful shares
- Captures share method analytics

### 🔍 **Error Handling & Recovery**

#### Image Loading Errors

```typescript
<Image
  source={{ uri: item.image }}
  onError={(error) => {
    captureException(new Error("Image loading failed"), {
      function: "Image.onError",
      screen: "MyLeagues",
      leagueId: item.id,
      imageUri: item.image,
      error: error.toString(),
    });
  }}
/>
```

#### FlatList Scroll Errors

```typescript
onScrollToIndexFailed={(info) => {
  captureException(new Error('FlatList scroll to index failed'), {
    function: 'FlatList.onScrollToIndexFailed',
    screen: 'MyLeagues',
    index: info.index,
    highestMeasuredFrameIndex: info.highestMeasuredFrameIndex,
    averageItemLength: info.averageItemLength
  });
}}
```

#### Component Render Errors

- Wrapped league card rendering with error boundaries
- Fallback UI for failed league cards
- Error context with league-specific data

### 📊 **Advanced Tracking Context**

Each tracked event includes rich context:

```typescript
// Example: League Share Tracking
{
  screen: 'MyLeagues',
  action: 'share_league',
  leagueId: league.id,
  leagueName: league.name,
  leagueCode: league.code,
  shareMethod: 'native_share'
}
```

### 🎯 **Breadcrumb Trail Examples**

1. **User Journey**:

   ```
   Navigation → User visited My Leagues screen
   User Action → User clicked Create League
   User Action → User clicked Join League
   User Input → User entered league code
   ```

2. **Share Flow**:
   ```
   User Action → User tapped league card
   User Action → User tapped share button
   User Action → User initiated league share
   Info → League share completed successfully
   ```

### 🚨 **Error Scenarios Covered**

1. **Network Errors**: Image loading failures with URL tracking
2. **UI Errors**: Component rendering failures with fallback UI
3. **Navigation Errors**: FlatList scroll failures with index context
4. **Share Errors**: Native share API failures vs. user cancellations
5. **Input Errors**: Invalid league codes with validation context

### 📈 **Performance Monitoring**

- **Component Render Performance**: Wrapped render functions with error tracking
- **Image Loading Performance**: Tracks image loading failures
- **List Performance**: Monitors scroll performance issues

### 🎚️ **Sentry Dashboard Filters**

Use these tags and contexts to filter in Sentry:

**Tags:**

- `current_screen: my_leagues`
- `environment: development|production`

**Breadcrumb Categories:**

- `navigation` - Screen visits and navigation
- `user_action` - Button clicks and interactions
- `user_input` - Form inputs and text entry
- `http` - Network requests (if added later)

**Functions Tracked:**

- `handleCreateLeague`
- `handleJoinLeague`
- `shareLeagueCode`
- `renderLeagueCard`
- `Image.onError`
- `FlatList.onScrollToIndexFailed`

### 🔧 **Usage Analytics Available**

1. **Feature Adoption**: Track which buttons are clicked most
2. **League Engagement**: Monitor which leagues are viewed/shared most
3. **Error Patterns**: Identify common failure points
4. **User Flow**: Understand navigation patterns
5. **Performance Issues**: Monitor rendering and loading problems

### 🛠️ **Future Enhancements**

Consider adding:

- API call tracking when connecting to backend
- User session replay for complex errors
- Custom performance metrics
- A/B testing event tracking
- Deep link handling analytics

## Testing the Implementation

Use the app and:

1. Navigate to My Leagues screen
2. Click Create/Join buttons
3. Tap league cards
4. Use share functionality
5. Trigger errors (invalid URLs, network issues)

Check your Sentry dashboard for the tracked events and errors!
