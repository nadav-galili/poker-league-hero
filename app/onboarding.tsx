import OnboardingSwiper from '@/components/onboarding/OnboardingSwiper';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function OnboardingScreen() {
   const { trackScreenView } = useMixpanel();

   useEffect(() => {
      trackScreenView('onboarding_root_screen');
   }, [trackScreenView]);

   return (
      <>
         <Stack.Screen options={{ headerShown: false }} />
         <OnboardingSwiper />
      </>
   );
}

