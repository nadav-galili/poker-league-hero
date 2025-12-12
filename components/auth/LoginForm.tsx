import { colors, getCyberpunkGradient } from '@/colors';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
   Animated,
   Image,
   Pressable,
   StatusBar,
   Text,
   View,
} from 'react-native';
import { SignInWithAppleButton } from '../SignInWithAppleButton';
import SignInWithGoogleButton from '../SigninWithGoogleButton';

export default function LoginForm() {
   const { signIn, resetOnboarding, isLoading } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();

   // Cyberpunk animations
   const scanlineAnim = React.useRef(new Animated.Value(0)).current;
   const glowAnim = React.useRef(new Animated.Value(0)).current;
   const matrixFade = React.useRef(new Animated.Value(0.1)).current;
   const titleGlow = React.useRef(new Animated.Value(0)).current;

   // Cyberpunk animations setup
   React.useEffect(() => {
      // Single scan line animation on mount
      const scanlineAnimation = Animated.timing(scanlineAnim, {
         toValue: 1,
         duration: 3000,
         useNativeDriver: true,
      });

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

      scanlineAnimation.start();
      glowAnimation.start();
      matrixAnimation.start();
      titleAnimation.start();

      return () => {
         glowAnimation.stop();
         matrixAnimation.stop();
         titleAnimation.stop();
      };
   }, []);

   const scanlineTranslateY = scanlineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 900],
   });

   return (
      <>
         <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
         />

         {/* Cyberpunk background with multiple layers */}
         <View className="flex-1 relative">
            <LinearGradient
               colors={getCyberpunkGradient('dark')}
               style={{
                  flex: 1,
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
               }}
            />

            {/* Matrix grid overlay */}
            <Animated.View
               className="absolute inset-0 opacity-20"
               style={{ opacity: matrixFade }}
            >
               <View className="flex-1 bg-gradient-to-br from-transparent via-neonCyan/5 to-neonPink/5" />

               {/* Grid pattern */}
               <View className="absolute inset-0">
                  {Array.from({ length: 20 }).map((_, i) => (
                     <View
                        key={`v-${i}`}
                        className="absolute w-px bg-neonCyan/10"
                        style={{
                           left: i * 20,
                           top: 0,
                           bottom: 0,
                        }}
                     />
                  ))}
                  {Array.from({ length: 50 }).map((_, i) => (
                     <View
                        key={`h-${i}`}
                        className="absolute h-px bg-neonCyan/10"
                        style={{
                           top: i * 20,
                           left: 0,
                           right: 0,
                        }}
                     />
                  ))}
               </View>
            </Animated.View>

            {/* Scan line effect */}
            <Animated.View
               className="absolute left-0 right-0 h-1 bg-neonCyan opacity-80"
               style={{
                  transform: [{ translateY: scanlineTranslateY }],
                  shadowColor: colors.neonCyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 10,
               }}
            />

            {/* Corner frame elements */}
            <View className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-neonCyan" />
            <View className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-neonPink" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-neonGreen" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-neonBlue" />

            <View className="flex-1 justify-center items-center px-5 py-12">
               {/* Hero section with cyberpunk app icon */}
               <View className="items-center mb-12 relative">
                  {/* Cyberpunk App Icon Container */}
                  <View className="mb-10 relative">
                     {/* Outer glow ring */}
                     <Animated.View
                        className="absolute inset-0 w-56 h-56 -m-4 rounded-xl border-2 border-neonCyan/30"
                        style={{
                           opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 0.8],
                           }),
                           transform: [
                              {
                                 scale: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.05],
                                 }),
                              },
                           ],
                           shadowColor: colors.neonCyan,
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 1,
                           shadowRadius: 20,
                        }}
                     />

                     {/* Corner brackets */}
                     <View className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-neonGreen" />
                     <View className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-neonPink" />
                     <View className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-neonBlue" />
                     <View className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-neonOrange" />

                     {/* Main icon container */}
                     <View
                        className="w-48 h-48 items-center justify-center relative border-2 border-neonCyan/50 bg-cyberBackground/80"
                        style={{
                           borderRadius: 12,
                           shadowColor: colors.neonCyan,
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 0.5,
                           shadowRadius: 15,
                        }}
                     >
                        {/* Holographic overlay */}
                        <Animated.View
                           className="absolute inset-0 rounded-xl"
                           style={{
                              backgroundColor: colors.holoBlue,
                              opacity: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0.1, 0.3],
                              }),
                           }}
                        />

                        <Image
                           source={require('@/assets/images/icon.png')}
                           style={{
                              width: 140,
                              height: 140,
                              borderRadius: 24,
                           }}
                           resizeMode="contain"
                        />

                        {/* Scanning line overlay */}
                        <Animated.View
                           className="absolute left-0 right-0 h-1 bg-neonGreen opacity-60"
                           style={{
                              transform: [
                                 {
                                    translateY: scanlineAnim.interpolate({
                                       inputRange: [0, 1],
                                       outputRange: [0, 180],
                                    }),
                                 },
                              ],
                           }}
                        />
                     </View>
                  </View>

                  {/* Cyberpunk App Title */}
                  <View className="items-center mb-8 relative">
                     {/* Title with animated neon glow */}
                     <Animated.View
                        className="mb-3 relative"
                        style={{
                           shadowColor: colors.neonCyan,
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: titleGlow.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                           }),
                           shadowRadius: titleGlow.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 25],
                           }),
                        }}
                     >
                        <Text
                           className="text-4xl font-black text-neonCyan tracking-wide"
                           style={{
                              textShadowColor: colors.neonCyan,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 10,
                           }}
                        >
                           POKER AI
                        </Text>
                        {/* Animated underline */}
                        <Animated.View
                           className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neonCyan"
                           style={{
                              opacity: titleGlow.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0.6, 1],
                              }),
                              shadowColor: colors.neonCyan,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 1,
                              shadowRadius: 8,
                           }}
                        />
                     </Animated.View>

                     <Animated.Text
                        className="text-3xl font-bold tracking-wider mb-4"
                        style={{
                           color: colors.textSecondary,
                           textShadowColor: colors.neonPink,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: titleGlow.interpolate({
                              inputRange: [0, 1],
                              outputRange: [5, 15],
                           }),
                        }}
                     >
                        HomeStack
                     </Animated.Text>

                     {/* Cyberpunk feature tags */}
                     <View className="flex-row gap-2">
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
                           <View className="px-3 py-1 border border-neonCyan bg-neonCyan/10 relative">
                              <Text className="text-neonCyan font-bold text-sm tracking-wider">
                                 TRACK
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
                           <View className="px-3 py-1 border border-neonGreen bg-neonGreen/10 relative">
                              <Text className="text-neonGreen font-bold text-sm tracking-wider">
                                 COMPETE
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
                           <View className="px-3 py-1 border border-neonPink bg-neonPink/10 relative">
                              <Text className="text-neonPink font-bold text-sm tracking-wider">
                                 DOMINATE
                              </Text>
                              <View className="absolute top-0 left-0 w-1 h-1 bg-neonPink" />
                              <View className="absolute bottom-0 right-0 w-1 h-1 bg-neonPink" />
                           </View>
                        </Animated.View>
                     </View>
                  </View>
               </View>

               {/* Cyberpunk Action buttons */}
               <View className="w-3/4 gap-8 relative">
                  {/* Side panel indicators */}
                  <View className="absolute -left-6 top-4 bottom-4 w-1 bg-gradient-to-b from-neonCyan via-neonPink to-neonGreen opacity-60" />
                  <View className="absolute -right-6 top-4 bottom-4 w-1 bg-gradient-to-b from-neonGreen via-neonBlue to-neonPink opacity-60" />

                  <Animated.View
                     style={{
                        opacity: glowAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0.9, 1],
                        }),
                     }}
                  >
                     <SignInWithGoogleButton
                        onPress={signIn}
                        disabled={isLoading}
                     />
                  </Animated.View>

                  <Animated.View
                     style={{
                        opacity: glowAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [1, 0.9],
                        }),
                     }}
                  >
                     <SignInWithAppleButton />
                  </Animated.View>

                  {/* Additional Options with cyberpunk styling */}
                  <View className="items-center mt-8 relative">
                     {/* Enhanced View Onboarding Again Button */}
                     <Pressable
                        onPress={async () => {
                           await resetOnboarding();
                           router.replace('/');
                        }}
                        className="mb-8 relative"
                        style={({ pressed }) => ({
                           transform: pressed
                              ? [{ scale: 0.95 }]
                              : [{ scale: 1 }],
                        })}
                     >
                        {/* Outer glow ring */}
                        <Animated.View
                           className="absolute inset-0 -m-2 border border-neonGreen/30 rounded-lg"
                           style={{
                              opacity: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0.4, 0.9],
                              }),
                              shadowColor: colors.neonGreen,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 15,
                           }}
                        />

                        <Animated.View
                           className="py-4 px-8 border-2 border-neonGreen bg-cyberBackground/80 relative"
                           style={{
                              borderRadius: 12,
                              opacity: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0.9, 1],
                              }),
                              shadowColor: colors.neonGreen,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 1,
                              shadowRadius: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [8, 20],
                              }),
                           }}
                        >
                           {/* Corner brackets - larger and more prominent */}
                           <View className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-neonGreen" />
                           <View className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-neonGreen" />
                           <View className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-neonGreen" />
                           <View className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-neonGreen" />

                           {/* Side accent lines */}
                           <View className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-neonGreen/60" />
                           <View className="absolute right-0 top-1/4 bottom-1/4 w-0.5 bg-neonGreen/60" />

                           {/* Holographic overlay */}
                           <Animated.View
                              className="absolute inset-0 bg-neonGreen/10 rounded-lg"
                              style={{
                                 opacity: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.1, 0.3],
                                 }),
                              }}
                           />

                           <Text
                              className="font-black text-textNeonGreen text-base tracking-widest"
                              style={{
                                 textShadowColor: colors.neonOrange,
                                 textShadowOffset: { width: 0, height: 0 },
                                 textShadowRadius: 8,
                              }}
                           >
                              {t('onboardingViewAgain')}
                           </Text>
                        </Animated.View>
                     </Pressable>

                     {/* Terms and Privacy with cyberpunk styling */}
                     <Animated.View
                        className="p-4 mx-4 border border-neonCyan/20 bg-cyberBackground/40 relative"
                        style={{
                           borderRadius: 8,
                           opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.7, 0.9],
                           }),
                        }}
                     >
                        {/* Holographic overlay */}
                        <Animated.View
                           className="absolute inset-0 rounded-lg"
                           style={{
                              backgroundColor: colors.holoBlue,
                              opacity: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0.05, 0.15],
                              }),
                           }}
                        />

                        <Text className="text-xs text-center text-white/60 leading-relaxed">
                           By continuing, you agree to our{' '}
                           <Text
                              className="text-neonCyan font-semibold"
                              onPress={() => router.push('/terms')}
                              style={{
                                 textShadowColor: colors.neonCyan,
                                 textShadowOffset: { width: 0, height: 0 },
                                 textShadowRadius: 5,
                              }}
                           >
                              Terms
                           </Text>{' '}
                           and{' '}
                           <Text
                              className="text-neonCyan font-semibold"
                              onPress={() => router.push('/privacy')}
                              style={{
                                 textShadowColor: colors.neonCyan,
                                 textShadowOffset: { width: 0, height: 0 },
                                 textShadowRadius: 5,
                              }}
                           >
                              Privacy Policy
                           </Text>
                        </Text>
                     </Animated.View>
                  </View>
               </View>
            </View>

            {/* Bottom status bar with cyberpunk styling */}
            <Animated.View
               className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neonCyan via-neonPink to-neonGreen"
               style={{
                  opacity: glowAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.5, 1],
                  }),
                  shadowColor: colors.neonCyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 10,
               }}
            />
         </View>
      </>
   );
}
