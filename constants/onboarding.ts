// Onboarding slide definitions
// Each slide contains the translation keys and image path

export interface OnboardingSlide {
   id: number;
   titleKey: string;
   descriptionKey: string;
   image: any; // Image require path
   color: string; // Gradient start color
   colorEnd: string; // Gradient end color
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
   {
      id: 1,
      titleKey: 'onboardingSlide1Title',
      descriptionKey: 'onboardingSlide1Description',
      image: require('@/assets/images/onboarding/onboarding1.png'),
      color: '#ec4899',
      colorEnd: '#f43f5e',
   },
   {
      id: 2,
      titleKey: 'onboardingSlide2Title',
      descriptionKey: 'onboardingSlide2Description',
      image: require('@/assets/images/onboarding/onboarding2.png'),
      color: '#8B5CF6',
      colorEnd: '#a78bfa',
   },
   {
      id: 3,
      titleKey: 'onboardingSlide3Title',
      descriptionKey: 'onboardingSlide3Description',
      image: require('@/assets/images/onboarding/onboarding3.png'),
      color: '#06b6d4',
      colorEnd: '#22d3ee',
   },
   {
      id: 4,
      titleKey: 'onboardingSlide4Title',
      descriptionKey: 'onboardingSlide4Description',
      image: require('@/assets/images/onboarding/onboarding4.png'),
      color: '#10b981',
      colorEnd: '#34d399',
   },
   {
      id: 5,
      titleKey: 'onboardingSlide5Title',
      descriptionKey: 'onboardingSlide5Description',
      image: require('@/assets/images/onboarding/onboarding1.png'),
      color: '#f59e0b',
      colorEnd: '#fbbf24',
   },
];

export const TOTAL_ONBOARDING_SLIDES = ONBOARDING_SLIDES.length;
