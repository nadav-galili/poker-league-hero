import { colors, getGradient } from '@/colors';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

export default function OnboardingSwiper() {
   const { markOnboardingComplete } = useAuth();
   const { t, isRTL } = useLocalization();
   const { track } = useMixpanel();
   const [activeIndex, setActiveIndex] = useState(0);

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
               backgroundColor: selected ? colors.primary : 'rgba(255,255,255,0.3)',
               borderRadius: 3,
            }}
         />
      );
   };

   // Common background component with gradient
   const Background = ({ colorStart, colorEnd }: { colorStart: string; colorEnd: string }) => (
      <LinearGradient
         colors={[colorStart, colorEnd]}
         style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
         }}
      />
   );

   return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
         <Onboarding
            pages={[
               {
                  backgroundColor: colors.background,
                  image: (
                     <View
                        style={{
                           width: 150,
                           height: 150,
                           borderRadius: 75,
                           backgroundColor: 'rgba(139, 92, 246, 0.2)', // primary with opacity
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderWidth: 2,
                           borderColor: colors.primary,
                        }}
                     >
                        <Ionicons name="card" size={80} color={colors.primary} />
                     </View>
                  ),
                  title: t('onboardingWelcomeTitle'),
                  subtitle: t('onboardingWelcomeSubtitle'),
               },
               {
                  backgroundColor: '#2e1065', // dark purple
                  image: (
                     <View
                        style={{
                           width: 150,
                           height: 150,
                           borderRadius: 75,
                           backgroundColor: 'rgba(236, 72, 153, 0.2)', // pink with opacity
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderWidth: 2,
                           borderColor: colors.secondary,
                        }}
                     >
                        <Ionicons name="trophy" size={80} color={colors.secondary} />
                     </View>
                  ),
                  title: t('onboardingLeaguesTitle'),
                  subtitle: t('onboardingLeaguesSubtitle'),
               },
               {
                  backgroundColor: '#0f172a', // slate 900
                  image: (
                     <View
                        style={{
                           width: 150,
                           height: 150,
                           borderRadius: 75,
                           backgroundColor: 'rgba(16, 185, 129, 0.2)', // green with opacity
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderWidth: 2,
                           borderColor: colors.success,
                        }}
                     >
                        <Ionicons name="stats-chart" size={80} color={colors.success} />
                     </View>
                  ),
                  title: t('onboardingStatsTitle'),
                  subtitle: t('onboardingStatsSubtitle'),
               },
               {
                  backgroundColor: '#1e1b4b', // indigo 950
                  image: (
                     <View
                        style={{
                           width: 150,
                           height: 150,
                           borderRadius: 75,
                           backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber with opacity
                           alignItems: 'center',
                           justifyContent: 'center',
                           borderWidth: 2,
                           borderColor: colors.warning,
                        }}
                     >
                        <Ionicons name="game-controller" size={80} color={colors.warning} />
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
                        <Ionicons name="analytics" size={80} color={colors.info} />
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
               fontSize: 28,
               fontWeight: 'bold',
               color: 'white',
               marginBottom: 10,
            }}
            subTitleStyles={{
               fontSize: 16,
               color: 'rgba(255,255,255,0.8)',
               paddingHorizontal: 20,
            }}
            containerStyles={{
               paddingBottom: 20,
            }}
         />
      </View>
   );
}
