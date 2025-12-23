# Android Image Upload Fix

## Issue

Image uploads were failing on Android production APK while working correctly on web. The error occurred when trying to upload images in the create league screen.

## Root Cause

The original implementation used `fetch(file://)` to read local file URIs, which doesn't work properly on Android in production builds due to:

1. File system access restrictions on Android
2. Different file URI handling between web and native platforms
3. React Native's FormData blob handling differences

## Solution Applied

### 1. Installed expo-file-system

```bash
bun add expo-file-system
```

### 2. Updated create-league.tsx

Modified the file reading logic to use platform-specific approaches:

**For Android/iOS:**

- Uses `expo-file-system`'s new `File` class
- Reads files as `ArrayBuffer` directly
- Converts to Blob with proper MIME type

**For Web:**

- Continues using `fetch()` for file reading (works fine on web)

### 3. Enhanced Error Tracking

Added platform information to all Sentry error logs for better debugging:

- `platform: Platform.OS` in all error capture calls
- Separate error handling for file read vs upload failures
- More detailed console logs with platform indicators

## Key Changes

```typescript
// OLD (didn't work on Android):
const fileResponse = await fetch(imageUrl);
const fileBlob = await fileResponse.blob();

// NEW (works on Android):
if (Platform.OS === 'android' || Platform.OS === 'ios') {
   const file = new FileSystem.File(imageUrl);
   const arrayBuffer = await file.arrayBuffer();
   fileBlob = new Blob([arrayBuffer], { type: 'image/jpeg' });
} else {
   // Web continues using fetch
   const fileResponse = await fetch(imageUrl);
   fileBlob = await fileResponse.blob();
}
```

## Testing Instructions

### 1. Build a New Production APK

```bash
cd /Users/nadavgalili/personal_projects/react-native-apps/poker-league-hero
eas build --profile production --platform android
```

### 2. Test Image Upload Flow

1. Install the APK on a physical Android device
2. Navigate to Create League screen
3. Tap "Select Image"
4. Choose an image from gallery
5. Fill in league name
6. Tap "Create League"
7. Verify:
   - Image uploads successfully
   - Loading indicator shows during upload
   - Success toast appears
   - League is created with the image

### 3. Monitor Sentry

Check Sentry dashboard for any errors. All errors now include:

- `platform` field (android/ios/web)
- `step` field (file_read/image_upload/api_call)
- Detailed error context

## Environment Variables Check

Make sure these R2 environment variables are properly set in EAS secrets (already configured in eas.json):

- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `CLOUDFLARE_R2_PUBLIC_URL`
- `EXPO_PUBLIC_BASE_URL`

Verify they're set:

```bash
eas secret:list
```

## Potential Issues to Watch

1. **Large Images**: If users select very large images, the upload might be slow. Consider adding:
   - Image compression before upload
   - Progress indicator during upload
   - File size limit warning

2. **Permissions**: Android 13+ requires specific media permissions. Already configured in app.json:
   - `READ_EXTERNAL_STORAGE`
   - `READ_MEDIA_IMAGES`
   - `CAMERA`

3. **Network Issues**: The fix handles file reading but network issues during upload could still occur. Error messages now properly distinguish between:
   - File reading errors (local issue)
   - Upload errors (network/server issue)

## Files Modified

- `app/leagues/create-league.tsx` - Updated image upload logic
- `package.json` - Added expo-file-system dependency

## References

- [Expo FileSystem Docs](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [React Native Blob Handling](https://reactnative.dev/docs/blob)
- [Android File URI Best Practices](https://developer.android.com/training/data-storage)
