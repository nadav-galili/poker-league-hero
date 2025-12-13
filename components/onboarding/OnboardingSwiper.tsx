import { colors, getCyberpunkGradient } from '@/colors';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
   Animated,
   Dimensions,
   Image,
   Platform,
   Pressable,
   Text,
   View,
} from 'react-native';

export default function OnboardingSwiper() {
   // react-native-onboarding-swiper references a global `Platform` in its compiled JS.
   // Hermes doesn't provide that global, so we polyfill before loading the module.
   const [OnboardingComponent, setOnboardingComponent] =
      React.useState<React.ComponentType<any> | null>(null);
   const onboardingRef = React.useRef<any>(null);

   const { markOnboardingComplete } = useAuth();
   const { t } = useLocalization();
   const { track } = useMixpanel();
   const [activeIndex, setActiveIndex] = useState(0);

   // Get screen dimensions for responsive layout
   const { width: screenWidth, height: screenHeight } =
      Dimensions.get('window');
   // Calculate responsive image height (40% of screen height, leaving room for text and buttons)
   const imageHeight = Math.min(screenHeight * 0.4, 450);

   // Cyberpunk animations
   const scanlineAnim = React.useRef(new Animated.Value(0)).current;
   const glowAnim = React.useRef(new Animated.Value(0)).current;
   const matrixFade = React.useRef(new Animated.Value(0.1)).current;
   const titleGlow = React.useRef(new Animated.Value(0)).current;
   const hologramFlicker = React.useRef(new Animated.Value(0)).current;

   useEffect(() => {
      track('onboarding_started');
   }, [track]);

   // Cyberpunk animations setup
   React.useEffect(() => {
      // Continuous scan line animation
      const scanlineAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(scanlineAnim, {
               toValue: 1,
               duration: 3000,
               useNativeDriver: true,
            }),
            Animated.timing(scanlineAnim, {
               toValue: 0,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.delay(2000),
         ])
      );

      // Pulsing glow animation
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 2000,
               useNativeDriver: true,
            }),
         ])
      );

      // Matrix fade animation
      const matrixAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(matrixFade, {
               toValue: 0.3,
               duration: 4000,
               useNativeDriver: true,
            }),
            Animated.timing(matrixFade, {
               toValue: 0.1,
               duration: 4000,
               useNativeDriver: true,
            }),
         ])
      );

      // Title glow animation
      const titleAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(titleGlow, {
               toValue: 1,
               duration: 3000,
               useNativeDriver: false,
            }),
            Animated.timing(titleGlow, {
               toValue: 0,
               duration: 3000,
               useNativeDriver: false,
            }),
         ])
      );

      // Hologram flicker animation
      const hologramAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(hologramFlicker, {
               toValue: 1,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.timing(hologramFlicker, {
               toValue: 0,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.delay(4000),
         ])
      );

      scanlineAnimation.start();
      glowAnimation.start();
      matrixAnimation.start();
      titleAnimation.start();
      hologramAnimation.start();

      return () => {
         scanlineAnimation.stop();
         glowAnimation.stop();
         matrixAnimation.stop();
         titleAnimation.stop();
         hologramAnimation.stop();
      };
   }, [scanlineAnim, glowAnim, matrixFade, titleGlow, hologramFlicker]);

   React.useEffect(() => {
      let isMounted = true;
      if (!(globalThis as any).Platform) {
         (globalThis as any).Platform = Platform;
      }

      import('react-native-onboarding-swiper')
         .then((mod) => {
            if (!isMounted) return;
            const Component = (mod as any)?.default ?? (mod as any);
            setOnboardingComponent(() => Component);
         })
         .catch((e) => {
            console.warn('Failed to load onboarding swiper module:', e);
         });

      return () => {
         isMounted = false;
      };
   }, []);

   const handleDone = async () => {
      console.log('Done button pressed');
      track('onboarding_completed');
      await markOnboardingComplete();
      router.replace('/');
   };

   const handleSkip = async () => {
      console.log('Skip button pressed');
      track('onboarding_skipped');
      await markOnboardingComplete();
      router.replace('/');
   };

   const handlePageChange = (index: number) => {
      console.log('Page changed to:', index);
      setActiveIndex(index);
      track('onboarding_slide_viewed', {
         slide_index: index,
      });
   };

   const PAGES_COUNT = 6;

   const DoneButton = ({ ...props }) => {
      return (
         <Animated.View
            style={{
               marginRight: 20,
               marginLeft: 20,
               opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
               }),
               transform: [
                  {
                     scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                     }),
                  },
               ],
            }}
         >
            <Pressable
               style={({ pressed }) => ({
                  transform: pressed ? [{ scale: 0.96 }] : [{ scale: 1 }],
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: '#000000',
                  borderWidth: 3,
                  borderColor: '#00FF41',
                  position: 'relative',
                  shadowColor: '#00FF41',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 20,
               })}
               {...props}
               onPress={(e) => {
                  console.log('Done button internal press');
                  props.onPress?.(e);
               }}
            >
               {/* Multiple corner brackets for extra cyberpunk feel */}
               <View
                  className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4"
                  style={{ borderColor: '#00FF41' }}
               />
               <View
                  className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4"
                  style={{ borderColor: '#00FF41' }}
               />
               <View
                  className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4"
                  style={{ borderColor: '#00FF41' }}
               />
               <View
                  className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4"
                  style={{ borderColor: '#00FF41' }}
               />

               {/* Inner corner accents */}
               <View className="absolute top-1 left-1 w-2 h-2 bg-green-400" />
               <View className="absolute top-1 right-1 w-2 h-2 bg-green-400" />
               <View className="absolute bottom-1 left-1 w-2 h-2 bg-green-400" />
               <View className="absolute bottom-1 right-1 w-2 h-2 bg-green-400" />

               <Text
                  className="font-mono font-black text-center tracking-widest uppercase"
                  style={{
                     color: '#00FF41',
                     fontSize: 18,
                     textShadowColor: '#000000',
                     textShadowOffset: { width: 2, height: 2 },
                     textShadowRadius: 4,
                     letterSpacing: 3,
                  }}
               >
                  {t('onboardingDone')}
               </Text>
            </Pressable>
         </Animated.View>
      );
   };

   const NextButton = ({ ...props }) => {
      // Debug: Log if onPress is present
      if (!props.onPress) {
         console.warn('NextButton missing onPress prop!');
      }

      return (
         <Animated.View
            style={{
               marginRight: 20,
               marginLeft: 20,
               opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.9],
               }),
            }}
         >
            <Pressable
               style={({ pressed }) => ({
                  transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderWidth: 3,
                  borderColor: '#ffffff',
                  borderRadius: 8,
                  backgroundColor: '#000000',
                  position: 'relative',
                  shadowColor: '#ffffff',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 15,
               })}
               {...props}
               onPress={(e) => {
                  console.log(
                     'Next button pressed. Props:',
                     Object.keys(props)
                  );

                  // ANDROID FIX: Manually force scroll and state update
                  // This bypasses the library's internal goNext() which fails on Android
                  // if the momentum scroll event was missed or delayed.
                  if (onboardingRef.current && onboardingRef.current.flatList) {
                     const nextIndex = activeIndex + 1;
                     console.log('Forcing scroll to index:', nextIndex);

                     // 1. Force the scroll
                     onboardingRef.current.flatList.scrollToOffset({
                        offset: nextIndex * screenWidth,
                        animated: true,
                     });

                     // 2. Force the library's internal state update
                     // (This ensures the Done button shows up at the end)
                     if (onboardingRef.current.setState) {
                        onboardingRef.current.setState({
                           currentPage: nextIndex,
                        });
                     }

                     // 3. Update our local state
                     handlePageChange(nextIndex);
                  } else {
                     // Fallback for iOS/Web or if ref is missing
                     if (props.onPress) {
                        props.onPress(e);
                     } else {
                        console.error(
                           'NextButton onPress prop is missing/undefined'
                        );
                     }
                  }
               }}
            >
               {/* Corner brackets in white for maximum contrast */}
               <View
                  className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2"
                  style={{ borderColor: '#ffffff' }}
               />
               <View
                  className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2"
                  style={{ borderColor: '#ffffff' }}
               />
               <View
                  className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2"
                  style={{ borderColor: '#ffffff' }}
               />
               <View
                  className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2"
                  style={{ borderColor: '#ffffff' }}
               />

               {/* Dark overlay for better contrast */}
               <Animated.View
                  className="absolute inset-0 rounded-lg"
                  style={{
                     backgroundColor: 'rgba(0, 0, 0, 0.3)',
                     opacity: hologramFlicker.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.5],
                     }),
                  }}
               />

               <Text
                  className="font-mono font-black text-center tracking-widest uppercase"
                  style={{
                     color: '#ffffff',
                     fontSize: 15,
                     textShadowColor: '#000000',
                     textShadowOffset: { width: 1, height: 1 },
                     textShadowRadius: 3,
                  }}
               >
                  {t('onboardingNext')}
               </Text>
            </Pressable>
         </Animated.View>
      );
   };

   const SkipButton = ({ ...props }) => {
      return (
         <Animated.View
            style={{
               marginLeft: 20,
               marginRight: 20,
               opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 0.7],
               }),
            }}
         >
            <Pressable
               style={({ pressed }) => ({
                  transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderWidth: 2,
                  borderColor: colors.neonPink,
                  borderRadius: 6,
                  backgroundColor: colors.cyberBackground,
                  position: 'relative',
                  shadowColor: colors.neonPink,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
               })}
               {...props}
               onPress={(e) => {
                  console.log('Skip button internal press');
                  // Try to force skip via ref first
                  if (onboardingRef.current?.skip) {
                     console.log('Forcing skip via ref');
                     onboardingRef.current.skip();
                  } else {
                     props.onPress?.(e);
                  }
               }}
            >
               {/* Corner accents */}
               <View className="absolute top-0 left-0 w-2 h-2 border-l border-t border-neonPink" />
               <View className="absolute top-0 right-0 w-2 h-2 border-r border-t border-neonPink" />
               <View className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-neonPink" />
               <View className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-neonPink" />

               {/* Holographic overlay */}
               <Animated.View
                  className="absolute inset-0 bg-neonPink/15 rounded-lg"
                  style={{
                     opacity: hologramFlicker.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.1, 0.3],
                     }),
                  }}
               />

               <Text
                  className="font-mono font-bold tracking-widest uppercase"
                  style={{
                     color: colors.neonPink,
                     fontSize: 13,
                     textShadowColor: colors.neonPink,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 6,
                  }}
               >
                  {t('onboardingSkip')}
               </Text>
            </Pressable>
         </Animated.View>
      );
   };

   const Dot = ({ selected }: { selected: boolean }) => {
      return (
         <Animated.View
            style={{
               marginHorizontal: 4,
               opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
               }),
            }}
         >
            <View className="relative">
               {/* Outer glow for selected dot */}
               {selected && (
                  <Animated.View
                     style={{
                        position: 'absolute',
                        width: 20,
                        height: 12,
                        left: -4,
                        top: -3,
                        borderRadius: 6,
                        backgroundColor: colors.neonCyan,
                        opacity: glowAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0.2, 0.4],
                        }),
                        shadowColor: colors.neonCyan,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 8,
                     }}
                  />
               )}

               {/* Main dot with cyberpunk design */}
               <View
                  style={{
                     width: selected ? 12 : 6,
                     height: 6,
                     position: 'relative',
                  }}
               >
                  {/* Main shape */}
                  <LinearGradient
                     colors={
                        selected
                           ? [colors.neonCyan, colors.neonBlue]
                           : [colors.textMuted, colors.cyberGray]
                     }
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: selected ? 2 : 3,
                        borderWidth: 1,
                        borderColor: selected
                           ? colors.neonCyan
                           : colors.textMuted,
                     }}
                  />

                  {/* Corner accents for selected */}
                  {selected && (
                     <>
                        <View className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-neonCyan" />
                        <View className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-neonCyan" />
                        <View className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-neonCyan" />
                        <View className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-neonCyan" />
                     </>
                  )}
               </View>
            </View>
         </Animated.View>
      );
   };

   const getCyberpunkVariant = (index: number) => {
      const variants = ['neon', 'cyber', 'matrix', 'holo', 'dark', 'neon'];
      return variants[index] as 'neon' | 'cyber' | 'matrix' | 'holo' | 'dark';
   };

   const CyberpunkBackground = ({
      variant,
   }: {
      variant: 'neon' | 'cyber' | 'matrix' | 'holo' | 'dark';
   }) => (
      <View pointerEvents="none" className="absolute inset-0">
         {/* Cyberpunk gradient background */}
         <LinearGradient
            colors={getCyberpunkGradient(variant)}
            style={{
               flex: 1,
               position: 'absolute',
               width: '100%',
               height: '100%',
            }}
         />

         {/* Matrix grid overlay */}
         <Animated.View
            className="absolute inset-0"
            style={{ opacity: matrixFade }}
         >
            {/* Optimized Grid pattern */}
            <View className="absolute inset-0">
               {Array.from({ length: 10 }).map((_, i) => (
                  <View
                     key={`v-${i}`}
                     className="absolute w-px bg-neonCyan/3"
                     style={{
                        left: (i * screenWidth) / 10,
                        top: 0,
                        bottom: 0,
                     }}
                  />
               ))}
               {Array.from({ length: 15 }).map((_, i) => (
                  <View
                     key={`h-${i}`}
                     className="absolute h-px bg-neonCyan/3"
                     style={{
                        top: (i * screenHeight) / 15,
                        left: 0,
                        right: 0,
                     }}
                  />
               ))}
            </View>
         </Animated.View>

         {/* Corner frame elements */}
         <View className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-neonCyan/60" />
         <View className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-neonPink/60" />
         <View className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-neonGreen/60" />
         <View className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-neonBlue/60" />
      </View>
   );

   const CyberpunkImageFrame = ({
      children,
      variant,
   }: {
      children: React.ReactNode;
      variant: 'neon' | 'cyber' | 'matrix' | 'holo' | 'dark';
   }) => {
      const getFrameColor = () => {
         switch (variant) {
            case 'matrix':
               return colors.neonGreen;
            case 'cyber':
               return colors.neonPink;
            case 'neon':
               return colors.neonCyan;
            case 'holo':
               return colors.neonBlue;
            default:
               return colors.neonPurple;
         }
      };

      return (
         <View className="relative">
            {/* Static corner brackets - no animation */}
            <View
               className="absolute -top-2 -left-2 w-4 h-4"
               style={{
                  borderLeftWidth: 2,
                  borderTopWidth: 2,
                  borderColor: getFrameColor(),
               }}
            />
            <View
               className="absolute -top-2 -right-2 w-4 h-4"
               style={{
                  borderRightWidth: 2,
                  borderTopWidth: 2,
                  borderColor: getFrameColor(),
               }}
            />
            <View
               className="absolute -bottom-2 -left-2 w-4 h-4"
               style={{
                  borderLeftWidth: 2,
                  borderBottomWidth: 2,
                  borderColor: getFrameColor(),
               }}
            />
            <View
               className="absolute -bottom-2 -right-2 w-4 h-4"
               style={{
                  borderRightWidth: 2,
                  borderBottomWidth: 2,
                  borderColor: getFrameColor(),
               }}
            />

            {/* Simplified main frame */}
            <View
               className="relative border-2 bg-cyberBackground/60 rounded-lg"
               style={{
                  borderColor: getFrameColor() + '80',
                  shadowColor: getFrameColor(),
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
               }}
            >
               {children}
            </View>
         </View>
      );
   };

   return (
      <View className="flex-1 relative bg-cyberBackground">
         {OnboardingComponent ? (
            <OnboardingComponent
               ref={onboardingRef}
               pages={[
                  {
                     backgroundColor: 'transparent',
                     image: (
                        <>
                           <CyberpunkBackground
                              variant={getCyberpunkVariant(0)}
                           />
                           <View className="items-center justify-center w-full relative">
                              <CyberpunkImageFrame
                                 variant={getCyberpunkVariant(0)}
                              >
                                 <Image
                                    source={require('@/assets/images/onboarding/cyberss1.webp')}
                                    style={{
                                       width: screenWidth * 0.85,
                                       height: imageHeight,
                                    }}
                                    resizeMode="contain"
                                 />
                              </CyberpunkImageFrame>
                           </View>
                        </>
                     ),
                     title: t('onboardingWelcomeTitle'),
                     subtitle: t('onboardingWelcomeSubtitle'),
                  },
                  {
                     backgroundColor: 'transparent',
                     image: (
                        <>
                           <CyberpunkBackground
                              variant={getCyberpunkVariant(1)}
                           />
                           <View className="items-center justify-center w-full relative">
                              <CyberpunkImageFrame
                                 variant={getCyberpunkVariant(1)}
                              >
                                 <Image
                                    source={require('@/assets/images/onboarding/cyberss2.webp')}
                                    style={{
                                       width: screenWidth * 0.85,
                                       height: imageHeight,
                                    }}
                                    resizeMode="contain"
                                 />
                              </CyberpunkImageFrame>
                           </View>
                        </>
                     ),
                     title: t('onboardingLeaguesTitle'),
                     subtitle: t('onboardingLeaguesSubtitle'),
                  },
                  {
                     backgroundColor: 'transparent',
                     image: (
                        <>
                           <CyberpunkBackground
                              variant={getCyberpunkVariant(2)}
                           />
                           <View className="items-center justify-center w-full relative">
                              <CyberpunkImageFrame
                                 variant={getCyberpunkVariant(2)}
                              >
                                 <Image
                                    source={require('@/assets/images/onboarding/cyberss3.webp')}
                                    style={{
                                       width: screenWidth * 0.85,
                                       height: imageHeight,
                                    }}
                                    resizeMode="contain"
                                 />
                              </CyberpunkImageFrame>
                           </View>
                        </>
                     ),
                     title: t('onboardingStatsTitle'),
                     subtitle: t('onboardingStatsSubtitle'),
                  },
                  {
                     backgroundColor: 'transparent',
                     image: (
                        <>
                           <CyberpunkBackground
                              variant={getCyberpunkVariant(3)}
                           />
                           <View className="items-center justify-center w-full relative">
                              <CyberpunkImageFrame
                                 variant={getCyberpunkVariant(3)}
                              >
                                 <Image
                                    source={require('@/assets/images/onboarding/cyberss4.webp')}
                                    style={{
                                       width: screenWidth * 0.85,
                                       height: imageHeight,
                                    }}
                                    resizeMode="contain"
                                 />
                              </CyberpunkImageFrame>
                           </View>
                        </>
                     ),
                     title: t('onboardingGamesTitle'),
                     subtitle: t('onboardingGamesSubtitle'),
                  },
                  {
                     backgroundColor: 'transparent',
                     image: (
                        <>
                           <CyberpunkBackground
                              variant={getCyberpunkVariant(4)}
                           />
                           <View className="items-center justify-center w-full relative">
                              <CyberpunkImageFrame
                                 variant={getCyberpunkVariant(4)}
                              >
                                 <Image
                                    source={require('@/assets/images/onboarding/cyberss5.webp')}
                                    style={{
                                       width: screenWidth * 0.85,
                                       height: imageHeight,
                                    }}
                                    resizeMode="contain"
                                 />
                              </CyberpunkImageFrame>
                           </View>
                        </>
                     ),
                     title: t('onboardingAiTitle'),
                     subtitle: t('onboardingAiSubtitle'),
                  },
                  {
                     backgroundColor: 'transparent',
                     image: (
                        <>
                           <CyberpunkBackground
                              variant={getCyberpunkVariant(5)}
                           />
                           <View className="items-center justify-center w-full relative">
                              <CyberpunkImageFrame
                                 variant={getCyberpunkVariant(5)}
                              >
                                 <View className="items-center justify-center p-8">
                                    {/* App icon with simplified styling */}
                                    <View
                                       className="relative mb-4"
                                       style={{
                                          shadowColor: colors.neonCyan,
                                          shadowOffset: { width: 0, height: 0 },
                                          shadowOpacity: 0.8,
                                          shadowRadius: 20,
                                       }}
                                    >
                                       <Image
                                          source={require('@/assets/images/icon.png')}
                                          style={{
                                             width: screenWidth * 0.5,
                                             height: screenWidth * 0.5,
                                             borderRadius: 24,
                                          }}
                                          resizeMode="contain"
                                       />
                                    </View>

                                    {/* Cyberpunk feature tags */}
                                    <View className="flex-row gap-3 mt-4">
                                       <Animated.View
                                          className="relative"
                                          style={{
                                             transform: [
                                                {
                                                   scale: glowAnim.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [1, 1.05],
                                                   }),
                                                },
                                             ],
                                          }}
                                       >
                                          <View className="px-3 py-2 border border-neonCyan bg-neonCyan/15 relative rounded">
                                             <Text className="text-neonCyan font-mono font-bold text-xs tracking-wider">
                                                LEAGUES
                                             </Text>
                                             <View className="absolute top-0 left-0 w-1 h-1 bg-neonCyan" />
                                             <View className="absolute top-0 right-0 w-1 h-1 bg-neonCyan" />
                                          </View>
                                       </Animated.View>

                                       <Animated.View
                                          className="relative"
                                          style={{
                                             transform: [
                                                {
                                                   scale: glowAnim.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [1.05, 1],
                                                   }),
                                                },
                                             ],
                                          }}
                                       >
                                          <View className="px-3 py-2 border border-neonGreen bg-neonGreen/15 relative rounded">
                                             <Text className="text-neonGreen font-mono font-bold text-xs tracking-wider">
                                                STATS
                                             </Text>
                                             <View className="absolute bottom-0 left-0 w-1 h-1 bg-neonGreen" />
                                             <View className="absolute bottom-0 right-0 w-1 h-1 bg-neonGreen" />
                                          </View>
                                       </Animated.View>

                                       <Animated.View
                                          className="relative"
                                          style={{
                                             transform: [
                                                {
                                                   scale: glowAnim.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [1, 1.05],
                                                   }),
                                                },
                                             ],
                                          }}
                                       >
                                          <View className="px-3 py-2 border border-neonPink bg-neonPink/15 relative rounded">
                                             <Text className="text-neonPink font-mono font-bold text-xs tracking-wider">
                                                AI
                                             </Text>
                                             <View className="absolute top-0 left-0 w-1 h-1 bg-neonPink" />
                                             <View className="absolute bottom-0 right-0 w-1 h-1 bg-neonPink" />
                                          </View>
                                       </Animated.View>
                                    </View>
                                 </View>
                              </CyberpunkImageFrame>
                           </View>
                        </>
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
                  fontSize: Math.min(screenHeight * 0.032, 28),
                  fontWeight: '900',
                  color: colors.text,
                  marginBottom: 12,
                  paddingHorizontal: 24,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  textShadowColor: colors.neonCyan,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
               }}
               subTitleStyles={{
                  fontSize: Math.min(screenHeight * 0.02, 17),
                  color: colors.textSecondary,
                  paddingHorizontal: 32,
                  lineHeight: Math.min(screenHeight * 0.028, 26),
                  textAlign: 'center',
                  marginTop: 8,
                  fontFamily: 'monospace',
                  textShadowColor: colors.neonPink,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
               }}
               containerStyles={{
                  paddingBottom: 100,
                  backgroundColor: 'transparent',
               }}
               imageContainerStyles={{
                  paddingBottom: 30,
                  flex: 0,
                  backgroundColor: 'transparent',
               }}
            />
         ) : null}

         {/* Bottom cyberpunk status bar */}
         <Animated.View
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neonCyan via-neonPink to-neonGreen"
            style={{
               opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
               }),
               shadowColor: colors.neonCyan,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 1,
               shadowRadius: 8,
            }}
         />
      </View>
   );
}
