import { ONBOARDING_SLIDES } from '@/constants/onboarding';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import useMixpanel from '@/hooks/useMixpanel';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
   Dimensions,
   Image,
   NativeScrollEvent,
   NativeSyntheticEvent,
   Pressable,
   ScrollView,
   StatusBar,
   Text,
   View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function OnboardingFlow() {
   const { markOnboardingComplete } = useAuth();
   const { t } = useLocalization();
   const { track } = useMixpanel();
   const [currentIndex, setCurrentIndex] = useState(0);
   const scrollViewRef = useRef<ScrollView>(null);
   const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

   React.useEffect(() => {
      // Track onboarding started
      track('onboarding_started', {
         total_slides: ONBOARDING_SLIDES.length,
      });

      // Initialize to first slide
      setTimeout(() => {
         if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
               x: 0,
               animated: false,
            });
            setCurrentIndex(0);
         }
      }, 100);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   React.useEffect(() => {
      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({
            x: currentIndex * screenWidth,
            animated: false,
         });
      }

      // Track slide view when slide index changes
      const slide = ONBOARDING_SLIDES[currentIndex];
      if (slide) {
         track('onboarding_slide_viewed', {
            slide_index: currentIndex,
            slide_id: slide.id,
            slide_title: t(slide.titleKey),
            total_slides: ONBOARDING_SLIDES.length,
         });
      }
   }, [currentIndex, t, track]);

   const handleNext = () => {
      if (isLastSlide) {
         handleComplete();
      } else {
         const nextIndex = currentIndex + 1;
         setCurrentIndex(nextIndex);
         scrollViewRef.current?.scrollTo({
            x: nextIndex * screenWidth,
            animated: true,
         });
      }
   };

   const handleSkip = async () => {
      // Track onboarding skipped
      track('onboarding_skipped', {
         slide_index: currentIndex,
         slide_id: ONBOARDING_SLIDES[currentIndex]?.id,
         total_slides: ONBOARDING_SLIDES.length,
      });

      await markOnboardingComplete();
      router.replace('/');
   };

   const handleComplete = async () => {
      // Track onboarding completed
      track('onboarding_completed', {
         total_slides: ONBOARDING_SLIDES.length,
         completed_all_slides: true,
      });

      await markOnboardingComplete();
      router.replace('/');
   };

   const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
      setCurrentIndex(index);
   };

   const renderSlide = (slide: (typeof ONBOARDING_SLIDES)[0]) => {
      const colors = [slide.color, slide.colorEnd];
      // Responsive image size - max 60% of screen width or 320px, whichever is smaller
      const imageSize = Math.min(screenWidth * 0.6, 320);

      return (
         <View
            key={slide.id}
            style={{
               width: screenWidth,
               height: screenHeight - 160,
               justifyContent: 'center',
               alignItems: 'center',
            }}
         >
            <LinearGradient
               colors={colors as any}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
               }}
            />

            {/* Content Container */}
            <View
               style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 32,
                  paddingVertical: 40,
               }}
            >
               {/* Image Container - Professional styling */}
               <View
                  style={{
                     marginBottom: 48,
                     shadowColor: 'rgba(0, 0, 0, 0.3)',
                     shadowOffset: { width: 0, height: 12 },
                     shadowOpacity: 0.5,
                     shadowRadius: 24,
                     elevation: 12,
                  }}
               >
                  <View
                     style={{
                        borderRadius: 28,
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                     }}
                  >
                     <Image
                        source={slide.image}
                        style={{
                           width: imageSize,
                           height: imageSize,
                           borderRadius: 24,
                           resizeMode: 'cover',
                        }}
                     />
                  </View>
               </View>

               {/* Title */}
               <Text
                  style={{
                     fontSize: 36,
                     fontWeight: '900',
                     color: 'white',
                     textAlign: 'center',
                     marginBottom: 16,
                     letterSpacing: -0.5,
                     lineHeight: 42,
                  }}
               >
                  {t(slide.titleKey)}
               </Text>

               {/* Description */}
               <Text
                  style={{
                     fontSize: 17,
                     color: 'rgba(255, 255, 255, 0.85)',
                     textAlign: 'center',
                     lineHeight: 26,
                     fontWeight: '500',
                  }}
               >
                  {t(slide.descriptionKey)}
               </Text>
            </View>

            {/* Bottom gradient accent */}
            <LinearGradient
               colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
               style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  pointerEvents: 'none',
               }}
            />
         </View>
      );
   };

   return (
      <>
         <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
         />

         <View style={{ flex: 1, backgroundColor: 'black' }}>
            {/* ScrollView Carousel */}
            <ScrollView
               ref={scrollViewRef}
               horizontal
               pagingEnabled
               scrollEventThrottle={16}
               onScroll={handleScroll}
               bounces={false}
               scrollsToTop={false}
               showsHorizontalScrollIndicator={false}
            >
               {ONBOARDING_SLIDES.map((slide) => renderSlide(slide))}
            </ScrollView>

            {/* Bottom Controls Container */}
            <View
               style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 24,
                  paddingVertical: 24,
                  paddingBottom: 32,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 255, 255, 0.1)',
               }}
            >
               {/* Pagination Dots */}
               <View
                  style={{
                     flexDirection: 'row',
                     justifyContent: 'center',
                     alignItems: 'center',
                     marginBottom: 24,
                     gap: 8,
                  }}
               >
                  {ONBOARDING_SLIDES.map((_, index) => (
                     <Pressable
                        key={index}
                        onPress={() => {
                           setCurrentIndex(index);
                           scrollViewRef.current?.scrollTo({
                              x: index * screenWidth,
                              animated: true,
                           });
                        }}
                     >
                        <View
                           style={{
                              borderRadius: 999,
                              width: index === currentIndex ? 32 : 12,
                              height: 12,
                              backgroundColor:
                                 index === currentIndex
                                    ? 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(255, 255, 255, 0.3)',
                           }}
                        />
                     </Pressable>
                  ))}
               </View>

               {/* Buttons Container */}
               <View
                  style={{
                     flexDirection: 'row',
                     gap: 16,
                  }}
               >
                  {/* Skip Button - Hidden on last slide */}
                  {!isLastSlide && (
                     <Pressable
                        onPress={handleSkip}
                        style={({ pressed }) => ({
                           flex: 1,
                           transform: pressed
                              ? [{ scale: 0.95 }]
                              : [{ scale: 1 }],
                        })}
                     >
                        <View
                           style={{
                              paddingVertical: 16,
                              paddingHorizontal: 16,
                              borderRadius: 16,
                              borderWidth: 2,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                           }}
                        >
                           <Text
                              style={{
                                 fontWeight: '900',
                                 color: 'white',
                                 fontSize: 14,
                                 textTransform: 'uppercase',
                                 letterSpacing: 1,
                              }}
                           >
                              {t('onboardingSkipButton')}
                           </Text>
                        </View>
                     </Pressable>
                  )}

                  {/* Next/Complete Button */}
                  <Pressable
                     onPress={handleNext}
                     style={({ pressed }) => ({
                        flex: 1,
                        transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                     })}
                  >
                     <LinearGradient
                        colors={['#ec4899', '#f43f5e']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                           borderRadius: 16,
                           paddingVertical: 16,
                           paddingHorizontal: 16,
                           justifyContent: 'center',
                           alignItems: 'center',
                           shadowColor: '#ec4899',
                           shadowOffset: { width: 0, height: 8 },
                           shadowOpacity: 0.4,
                           shadowRadius: 16,
                           elevation: 10,
                        }}
                     >
                        <Text
                           style={{
                              fontWeight: '900',
                              color: 'white',
                              fontSize: 14,
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                           }}
                        >
                           {isLastSlide
                              ? t('onboardingCompleteButton')
                              : t('onboardingNextButton')}
                        </Text>
                     </LinearGradient>
                  </Pressable>
               </View>
            </View>
         </View>
      </>
   );
}
