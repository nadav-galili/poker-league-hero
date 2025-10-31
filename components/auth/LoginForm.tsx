import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, StatusBar, Text, View } from 'react-native';
import { SignInWithAppleButton } from '../SignInWithAppleButton';
import SignInWithGoogleButton from '../SigninWithGoogleButton';

export default function LoginForm() {
   const { signIn, resetOnboarding, isLoading } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();

   return (
      <>
         <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
         />
         <LinearGradient
            colors={['#3730a3', '#581c87', '#3730a3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1"
         >
            <View className="flex-1 justify-center items-center px-5 py-12">
               {/* Hero section with app icon */}
               <View className="items-center mb-12">
                  {/* App Icon Container - Glassmorphism style */}
                  <View className="mb-10 relative">
                     <BlurView
                        intensity={80}
                        tint="dark"
                        className="w-48 h-48 rounded-3xl items-center justify-center overflow-hidden border"
                        style={{
                           backgroundColor: 'rgba(30, 41, 59, 0.5)',
                           borderColor: 'rgba(255, 255, 255, 0.1)',
                           shadowColor: '#ec4899',
                           shadowOffset: { width: 0, height: 12 },
                           shadowOpacity: 0.3,
                           shadowRadius: 20,
                           elevation: 12,
                        }}
                     >
                        <Image
                           source={require('@/assets/images/icon.png')}
                           style={{
                              width: 140,
                              height: 140,
                              borderRadius: 24,
                           }}
                           resizeMode="contain"
                        />
                     </BlurView>
                  </View>

                  {/* App Title - Glassmorphism Typography */}
                  <View className="items-center mb-8">
                     <LinearGradient
                        colors={['#ec4899', '#f43f5e']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-1 py-0.5 mb-3"
                     >
                        <Text className="text-4xl font-black text-white tracking-wide">
                           POKER AI
                        </Text>
                     </LinearGradient>
                     <Text className="text-3xl font-bold text-white/90 tracking-wider mb-4">
                        HomeStack
                     </Text>
                     <View className="flex-row gap-2">
                        <View className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30">
                           <Text className="text-cyan-300 font-semibold text-sm">
                              TRACK
                           </Text>
                        </View>
                        <View className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                           <Text className="text-emerald-300 font-semibold text-sm">
                              COMPETE
                           </Text>
                        </View>
                        <View className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30">
                           <Text className="text-pink-300 font-semibold text-sm">
                              DOMINATE
                           </Text>
                        </View>
                     </View>
                  </View>
               </View>

               {/* Action buttons - Glassmorphism style */}
               <View className="w-3/4 gap-12 ">
                  {/* Google Sign In Button */}
                  {/* <Pressable
                     onPress={signIn}
                     className="mb-6 relative"
                     style={({ pressed }) => ({
                        transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                     })}
                  >
                     <View
                        className="flex-row items-center justify-center py-3 px-6 rounded-lg overflow-hidden border-[1px]"
                        style={{
                           backgroundColor: '#ffffff',
                           borderColor: '#dadce0',
                           shadowColor: '#000000',
                           shadowOffset: { width: 0, height: 1 },
                           shadowOpacity: 0.12,
                           shadowRadius: 2,
                           elevation: 2,
                        }}
                     >
                        <View className="w-5 h-5 rounded items-center justify-center mr-3">
                           <Ionicons
                              name="logo-google"
                              size={20}
                              color={colors.primary}
                           />
                        </View>
                        <Text
                           className="font-medium text-base"
                           style={{ color: colors.primary }}
                        >
                           {t('signInWithGoogle')}
                        </Text>
                     </View>
                  </Pressable> */}
                  <SignInWithGoogleButton
                     onPress={signIn}
                     disabled={isLoading}
                  />
                  <SignInWithAppleButton />

                  {/* Additional Options */}
                  <View className="items-center mt-8">
                     {/* View Onboarding Again Button */}
                     <Pressable
                        onPress={async () => {
                           await resetOnboarding();
                           router.replace('/');
                        }}
                        className="mb-6"
                        style={({ pressed }) => ({
                           transform: pressed
                              ? [{ scale: 0.95 }]
                              : [{ scale: 1 }],
                        })}
                     >
                        <BlurView
                           intensity={60}
                           tint="dark"
                           className="py-3 px-6 rounded-2xl overflow-hidden border"
                           style={{
                              backgroundColor: 'rgba(30, 41, 59, 0.4)',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                           }}
                        >
                           <Text className="font-semibold text-white/80 text-sm tracking-wide">
                              {t('onboardingViewAgain')}
                           </Text>
                        </BlurView>
                     </Pressable>

                     <BlurView
                        intensity={40}
                        tint="dark"
                        className="p-4 rounded-2xl mx-4 border overflow-hidden"
                        style={{
                           backgroundColor: 'rgba(30, 41, 59, 0.3)',
                           borderColor: 'rgba(255, 255, 255, 0.05)',
                        }}
                     >
                        <Text className="text-xs text-center text-white/60 leading-relaxed">
                           By continuing, you agree to our{' '}
                           <Text
                              className="text-cyan-400"
                              onPress={() => router.push('/terms')}
                           >
                              Terms
                           </Text>{' '}
                           and{' '}
                           <Text
                              className="text-cyan-400"
                              onPress={() => router.push('/privacy')}
                           >
                              Privacy Policy
                           </Text>
                        </Text>
                     </BlurView>
                  </View>
               </View>
            </View>

            {/* Bottom gradient accent */}
            <LinearGradient
               colors={['transparent', 'rgba(236, 72, 153, 0.1)']}
               className="absolute bottom-0 left-0 right-0 h-32"
               pointerEvents="none"
            />
         </LinearGradient>
      </>
   );
}
