import { colors } from "@/colors";
import ErrorBoundary from "@/components/ErrorBoundary";
import LocalizedErrorFallback from "@/components/LocalizedErrorFallback";
import { AuthProvider } from "@/context/auth";
import { LocalizationProvider } from "@/context/localization";
import { loadFonts } from "@/utils/fonts";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
} from "react-native-toast-message";
import "../global.css";

Sentry.init({
  dsn: "https://80a1df1974c168c03b552dea7be0c3ed@o4508240875618304.ingest.de.sentry.io/4509824848101456",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom Toast configuration
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.success,
        shadowColor: colors.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "500",
        color: colors.textSecondary,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.error, // Blaze orange
        borderLeftWidth: 6,
        borderBottomColor: colors.border,
        borderBottomWidth: 3,
        borderRightColor: colors.border,
        borderRightWidth: 3,
        borderTopColor: colors.border,
        borderTopWidth: 3,
        backgroundColor: colors.background,
        shadowColor: colors.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "500",
        color: colors.textSecondary,
      }}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={{
        borderLeftColor: colors.info, // Cyber purple
        borderLeftWidth: 6,
        borderBottomColor: colors.border,
        borderBottomWidth: 3,
        borderRightColor: colors.border,
        borderRightWidth: 3,
        borderTopColor: colors.border,
        borderTopWidth: 3,
        backgroundColor: colors.background,
        shadowColor: colors.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "500",
        color: colors.textSecondary,
      }}
    />
  ),
};

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [retryKey]);

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LocalizationProvider>
        <ErrorBoundary
          fallback={<LocalizedErrorFallback onRetry={handleRetry} />}>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </AuthProvider>
        </ErrorBoundary>
      </LocalizationProvider>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
});
