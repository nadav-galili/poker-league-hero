import OnboardingSwiper from '@/components/onboarding/OnboardingSwiper';
import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingScreen() {
   return (
      <>
         <Stack.Screen options={{ headerShown: false }} />
         <OnboardingSwiper />
      </>
   );
}

