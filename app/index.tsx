import { getTheme } from '@/colors';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import LoginForm from '@/components/auth/LoginForm';
import { LoadingState } from '@/components/shared/LoadingState';
import { useAuth } from '@/context/auth';
import { Redirect } from 'expo-router';
import { ScrollView } from 'react-native';

export default function Index() {
   const { user, isLoading, hasSeenOnboarding } = useAuth();
   const theme = getTheme('light');

   if (isLoading) {
      return <LoadingState />;
   }

   // If user is authenticated, redirect to home
   if (user) {
      return <Redirect href={'/(tabs)/my-leagues' as any} />;
   }

   // If user hasn't seen onboarding, show it
   if (!hasSeenOnboarding) {
      return <OnboardingFlow />;
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
