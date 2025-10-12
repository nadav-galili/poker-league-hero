import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StatusBar, Text, View } from 'react-native';

export default function LoginForm() {
   const { signIn } = useAuth();
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
               <View className="w-full max-w-sm ">
                  {/* Google Sign In Button */}
                  <Pressable
                     onPress={signIn}
                     className="mb-6 relative "
                     style={({ pressed }) => ({
                        transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                     })}
                  >
                     <LinearGradient
                        colors={['#ec4899', '#f43f5e']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="p-[1px] overflow-hidden rounded-full"
                        style={{
                           shadowColor: '#ec4899',
                           shadowOffset: { width: 0, height: 8 },
                           shadowOpacity: 0.4,
                           shadowRadius: 16,
                           elevation: 10,
                        }}
                     >
                        <BlurView
                           intensity={30}
                           tint="dark"
                           className="flex-row items-center justify-center py-5 px-8 rounded-full overflow-hidden"
                           style={{
                              backgroundColor: 'rgba(236, 72, 153, 0.15)',
                           }}
                        >
                           <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-white/10 border border-white/20">
                              <Ionicons
                                 name="logo-google"
                                 size={24}
                                 color="#ffffff"
                              />
                           </View>
                           <Text className="font-bold text-lg text-white uppercase tracking-wide">
                              {t('signInWithGoogle')}
                           </Text>
                        </BlurView>
                     </LinearGradient>
                  </Pressable>

                  {/* Guest Button */}
                  {/* <Pressable
                     onPress={handleGuest}
                     className="mb-8 relative"
                     style={({ pressed }) => ({
                        transform: pressed
                           ? [{ translateX: 4 }, { translateY: 4 }]
                           : [],
                     })}
                  >
                     <View
                        className="flex-row items-center justify-center py-6 px-8 rounded-2xl border-4"
                        style={{
                           backgroundColor: colors.secondary,
                           borderColor: colors.border,
                           shadowColor: colors.shadow,
                           shadowOffset: { width: 6, height: 6 },
                           shadowOpacity: 1,
                           shadowRadius: 0,
                           elevation: 6,
                        }}
                     >
                        <View
                           className="w-8 h-8 rounded-xl items-center justify-center mr-4 border-3"
                           style={{
                              backgroundColor: colors.text,
                              borderColor: colors.border,
                           }}
                        >
                           <Ionicons
                              name="person-outline"
                              size={20}
                              color={colors.secondary}
                           />
                        </View>
                        <Text className="font-black text-xl tracking-wider uppercase">
                           {t('continueAsGuest')}
                        </Text>
                     </View>
                  </Pressable> */}

                  {/* Divider - Neo-brutalist style */}
                  {/* <View className="flex-row items-center mb-8">
                     <View
                        className="flex-1 h-1"
                        style={{ backgroundColor: colors.border }}
                     />
                     <View
                        className="mx-6 px-4 py-2 rounded-xl border-3"
                        style={{
                           backgroundColor: colors.accent,
                           borderColor: colors.border,
                        }}
                     >
                        <Text
                           className="font-black text-sm tracking-widest"
                           style={{ color: colors.border }}
                        >
                           OR
                        </Text>
                     </View>
                     <View
                        className="flex-1 h-1"
                        style={{ backgroundColor: colors.border }}
                     />
                  </View> */}

                  {/* Additional Options */}
                  <View className="items-center mt-8">
                     <Pressable
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
                              NEED HELP?
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
                           >Terms</Text> and{' '}
                           <Text
                              className="text-cyan-400"
                              onPress={() => router.push('/privacy')}
                           >Privacy Policy</Text>
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
