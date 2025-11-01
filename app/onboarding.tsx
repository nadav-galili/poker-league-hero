import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useAuth } from '@/context/auth';
import { Redirect } from 'expo-router';

export default function OnboardingScreen() {
   const { user } = useAuth();

   // Only allow authenticated users to access this screen
   if (!user) {
      return <Redirect href="/" />;
   }

   return <OnboardingFlow />;
}
