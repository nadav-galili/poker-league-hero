import { getTheme } from '@/colors';
import LoginForm from '@/components/auth/LoginForm';
import OnboardingSwiper from '@/components/onboarding/OnboardingSwiper';
import { LoadingState } from '@/components/shared/LoadingState';
import { useAuth } from '@/context/auth';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Redirect, usePathname, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';

export default function Index() {
   const { user, isLoading, hasSeenOnboarding } = useAuth();
   const theme = getTheme('light');
   const pathname = usePathname();
   const segments = useSegments();
   const isWeb = Platform.OS === 'web';
   const { trackScreenView } = useMixpanel();

   useEffect(() => {
      if (!isLoading && !user) {
         if (!hasSeenOnboarding) {
            trackScreenView('onboarding_swiper');
         } else {
            trackScreenView('login_screen');
         }
      }
   }, [isLoading, user, hasSeenOnboarding, trackScreenView]);

   // On web, check the actual browser URL synchronously to catch privacy/terms routes
   // This needs to happen before any auth checks to prevent onboarding from showing
   let currentBrowserPath = '';
   if (isWeb && typeof window !== 'undefined') {
      currentBrowserPath = window.location.pathname;
   }

   // On web, skip onboarding for privacy/terms pages (used for store listings)
   // Check pathname, segments, and actual browser URL to catch all scenarios
   const isPrivacyOrTermsRoute =
      pathname === '/privacy' ||
      pathname === '/terms' ||
      currentBrowserPath === '/privacy' ||
      currentBrowserPath === '/terms' ||
      segments[0] === 'privacy' ||
      segments[0] === 'terms';

   // Early return for privacy/terms routes on web - must happen before any auth checks
   if (isWeb && isPrivacyOrTermsRoute) {
      return null; // Let the route handler take over
   }

   if (isLoading) {
      return <LoadingState />;
   }

   // If user is authenticated, redirect to home
   if (user) {
      return <Redirect href={'/(tabs)/my-leagues' as any} />;
   }

   // If user hasn't seen onboarding, show it
   if (!hasSeenOnboarding) {
      return <OnboardingSwiper />;
   }

   // User has seen onboarding but not authenticated, show login
   return (
      <ScrollView
         style={{ flex: 1, backgroundColor: theme.background }}
         contentContainerStyle={{ flexGrow: 1, paddingTop: 20 }}
         showsVerticalScrollIndicator={false}
      >
         <LoginForm />
      </ScrollView>
   );
}
