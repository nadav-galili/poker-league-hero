import { colors } from '@/colors';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

export default function OnboardingSwiper() {
   const { markOnboardingComplete } = useAuth();
   const { t } = useLocalization();
   const { track } = useMixpanel();
   const [activeIndex, setActiveIndex] = useState(0);

   // Get screen dimensions for responsive layout
   const { width: screenWidth, height: screenHeight } =
      Dimensions.get('window');
   // Calculate responsive image height (40% of screen height, leaving room for text and buttons)
   const imageHeight = Math.min(screenHeight * 0.4, 450);

   useEffect(() => {
      track('onboarding_started');
   }, [track]);

   const handleDone = async () => {
      track('onboarding_completed');
      await markOnboardingComplete();
      router.replace('/');
   };

   const handleSkip = async () => {
      track('onboarding_skipped');
      await markOnboardingComplete();
      router.replace('/');
   };

   const handlePageChange = (index: number) => {
      setActiveIndex(index);
      track('onboarding_slide_viewed', {
         slide_index: index,
      });
   };

   const PAGES_COUNT = 6;

   const DoneButton = ({ ...props }) => {
      // Only show done button on the last slide
      if (activeIndex !== PAGES_COUNT - 1) return null;

      return (
         <TouchableOpacity
            style={{
               marginRight: 20,
               backgroundColor: colors.primary,
               paddingHorizontal: 20,
               paddingVertical: 10,
               borderRadius: 25,
               marginLeft: 20,
            }}
            {...props}
         >
            <Text
               style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 16,
               }}
            >
               {t('onboardingDone')}
            </Text>
         </TouchableOpacity>
      );
   };

   const NextButton = ({ ...props }) => {
      // Don't show next button on the last slide
      if (activeIndex === PAGES_COUNT - 1) return null;

      return (
         <TouchableOpacity
            style={{
               marginRight: 20,
               marginLeft: 20,
            }}
            {...props}
         >
            <Text
               style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16,
               }}
            >
               {t('onboardingNext')}
            </Text>
         </TouchableOpacity>
      );
   };

   const SkipButton = ({ ...props }) => {
      // Don't show skip button on the last slide
      if (activeIndex === PAGES_COUNT - 1) return null;

      return (
         <TouchableOpacity
            style={{
               marginLeft: 20,
               marginRight: 20,
            }}
            {...props}
         >
            <Text
               style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 16,
               }}
            >
               {t('onboardingSkip')}
            </Text>
         </TouchableOpacity>
      );
   };

   const Dot = ({ selected }: { selected: boolean }) => {
      return (
         <View
            style={{
               width: selected ? 12 : 6,
               height: 6,
               marginHorizontal: 3,
               backgroundColor: selected
                  ? colors.primary
                  : 'rgba(255,255,255,0.3)',
               borderRadius: 3,
            }}
         />
      );
   };

   return (
      <View className="flex-1 bg-background">
         <Onboarding
            pages={[
               {
                  backgroundColor: 'transparent',
                  image: (
                     <View className="items-center justify-center w-full">
                        <Image
                           source={require('@/assets/images/new_onboarding/screen_shot1.webp')}
                           style={{
                              width: screenWidth * 0.92,
                              height: imageHeight,
                           }}
                           resizeMode="contain"
                        />
                     </View>
                  ),
                  title: t('onboardingWelcomeTitle'),
                  subtitle: t('onboardingWelcomeSubtitle'),
               },
               {
                  backgroundColor: '#2e1065', // dark purple
                  image: (
                     <View className="items-center justify-center w-full">
                        <Image
                           source={require('@/assets/images/new_onboarding/screen_shot2.webp')}
                           style={{
                              width: screenWidth * 1,
                              height: 400,
                           }}
                           resizeMode="contain"
                        />
                     </View>
                  ),
                  title: t('onboardingLeaguesTitle'),
                  subtitle: t('onboardingLeaguesSubtitle'),
               },
               {
                  backgroundColor: '#0f172a', // slate 900
                  image: (
                     <View className="items-center justify-center w-full">
                        <Image
                           source={require('@/assets/images/new_onboarding/screen_shot3.webp')}
                           style={{
                              width: screenWidth * 1,
                              height: 400,
                           }}
                           resizeMode="contain"
                        />
                     </View>
                  ),
                  title: t('onboardingStatsTitle'),
                  subtitle: t('onboardingStatsSubtitle'),
               },
               {
                  backgroundColor: '#1e1b4b', // indigo 950
                  image: (
                     <View className="items-center justify-center w-full">
                        <View className="items-center justify-center w-full">
                           <Image
                              source={require('@/assets/images/new_onboarding/screen_shot4.webp')}
                              style={{
                                 width: screenWidth * 1,
                                 height: 400,
                              }}
                              resizeMode="contain"
                           />
                        </View>
                     </View>
                  ),
                  title: t('onboardingGamesTitle'),
                  subtitle: t('onboardingGamesSubtitle'),
               },
               {
                  backgroundColor: '#4c0519', // rose 950
                  image: (
                     <View
                        style={{
                           width: 150,
                           height: 150,
                           borderRadius: 75,
                           backgroundColor: 'rgba(56, 189, 248, 0.2)', // blue with opacity
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderWidth: 2,
                           borderColor: colors.info,
                        }}
                     >
                        <Ionicons
                           name="analytics"
                           size={80}
                           color={colors.info}
                        />
                     </View>
                  ),
                  title: t('onboardingAiTitle'),
                  subtitle: t('onboardingAiSubtitle'),
               },
               {
                  backgroundColor: colors.background,
                  image: (
                     <View
                        style={{
                           width: 150,
                           height: 150,
                           borderRadius: 75,
                           backgroundColor: 'rgba(255, 255, 255, 0.1)',
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderWidth: 2,
                           borderColor: 'white',
                        }}
                     >
                        <Ionicons name="rocket" size={80} color="white" />
                     </View>
                  ),
                  title: t('onboardingGetStartedTitle'),
                  subtitle: t('onboardingGetStartedSubtitle'),
               },
            ]}
            onDone={handleDone}
            onSkip={handleSkip}
            pageIndexCallback={handlePageChange}
            DoneButtonComponent={DoneButton}
            NextButtonComponent={NextButton}
            SkipButtonComponent={SkipButton}
            DotComponent={Dot}
            bottomBarHighlight={false}
            titleStyles={{
               fontSize: Math.min(screenHeight * 0.028, 26),
               fontWeight: 'bold',
               color: 'white',
               marginBottom: 12,
               paddingHorizontal: 24,
               textAlign: 'center',
            }}
            subTitleStyles={{
               fontSize: Math.min(screenHeight * 0.019, 16),
               color: 'rgba(255,255,255,0.8)',
               paddingHorizontal: 32,
               lineHeight: Math.min(screenHeight * 0.026, 24),
               textAlign: 'center',
               marginTop: 0,
            }}
            containerStyles={{
               paddingBottom: 80,
            }}
            imageContainerStyles={{
               paddingBottom: 20,
               flex: 0,
            }}
         />
      </View>
   );
}
