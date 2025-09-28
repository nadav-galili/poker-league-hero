import { colors } from '@/colors';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StatusBar, View } from 'react-native';
import { Text } from '../Text';

export default function LoginForm() {
   const { signIn } = useAuth();
   const { t } = useLocalization();

   const handleGuest = () => {
      console.log('Guest login clicked');
   };

   return (
      <>
         <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
         />
         <View className="flex-1 bg-slate-200">
            <View className="flex-1 justify-center items-center px-6 py-12">
               {/* Hero section with app icon */}
               <View className="items-center mb-16">
                  {/* App Icon Container - Neo-brutalist style */}
                  <View className="mb-10 relative">
                     <View
                        className="w-52 h-52 rounded-2xl items-center justify-center border-4"
                        style={{
                           backgroundColor: colors.surfaceElevated,
                           borderColor: colors.border,
                           shadowColor: colors.shadow,
                           shadowOffset: { width: 8, height: 8 },
                           shadowOpacity: 1,
                           shadowRadius: 0,
                           elevation: 8,
                        }}
                     >
                        <Image
                           source={require('@/assets/images/icon.png')}
                           style={{
                              width: 150,
                              height: 150,
                              borderRadius: 16,
                           }}
                           resizeMode="contain"
                        />
                     </View>
                  </View>

                  {/* App Title - Bold Neo-brutalist Typography */}
                  <View className="items-center mb-6">
                     <Text
                        className=" tracking-wider mb-2"
                        style={{
                           color: colors.text,
                           fontSize: 24,
                           fontWeight: '900',
                           letterSpacing: 1.2,
                           lineHeight: 32,
                        }}
                     >
                        POKER LEAGUE
                     </Text>
                     <Text
                        className=" tracking-wider mb-6"
                        style={{
                           color: colors.primary,
                           fontSize: 32,
                           fontWeight: '900',
                           letterSpacing: 1.2,
                           lineHeight: 32,
                        }}
                     >
                        HERO
                     </Text>
                     <Text
                        className="font-bold text-center uppercase tracking-wide px-4"
                        style={{
                           color: colors.text,
                           fontSize: 16,
                           fontWeight: '700',
                        }}
                     >
                        TRACK • COMPETE • DOMINATE
                     </Text>
                  </View>
               </View>

               {/* Action buttons - Neo-brutalist style */}
               <View className="w-full max-w-sm">
                  {/* Google Sign In Button */}
                  <Pressable
                     onPress={signIn}
                     className="mb-6 relative"
                     style={({ pressed }) => ({
                        transform: pressed
                           ? [{ translateX: 4 }, { translateY: 4 }]
                           : [],
                     })}
                  >
                     <View
                        className="flex-row items-center justify-center py-6 px-8 rounded-2xl border-4"
                        style={{
                           backgroundColor: colors.primary,
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
                              backgroundColor: colors.textInverse,
                              borderColor: colors.border,
                           }}
                        >
                           <Ionicons
                              name="logo-google"
                              size={20}
                              color={colors.primary}
                           />
                        </View>
                        <Text
                           className="font-black text-xl tracking-wider uppercase"
                           style={{ color: colors.textInverse }}
                        >
                           {t('signInWithGoogle')}
                        </Text>
                     </View>
                  </Pressable>

                  {/* Guest Button */}
                  <Pressable
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
                              backgroundColor: colors.textInverse,
                              borderColor: colors.border,
                           }}
                        >
                           <Ionicons
                              name="person-outline"
                              size={20}
                              color={colors.secondary}
                           />
                        </View>
                        <Text
                           className="font-black text-xl tracking-wider uppercase"
                           style={{ color: colors.textInverse }}
                        >
                           {t('continueAsGuest')}
                        </Text>
                     </View>
                  </Pressable>

                  {/* Divider - Neo-brutalist style */}
                  <View className="flex-row items-center mb-8">
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
                  </View>

                  {/* Additional Options */}
                  <View className="items-center space-y-6">
                     <Pressable
                        className="py-3 px-6 rounded-xl border-3"
                        style={({ pressed }) => ({
                           backgroundColor: pressed
                              ? colors.highlightTint
                              : colors.highlight,
                           borderColor: colors.border,
                           transform: pressed
                              ? [{ translateX: 2 }, { translateY: 2 }]
                              : [],
                        })}
                     >
                        <Text
                           className="font-bold text-base tracking-wide uppercase"
                           style={{ color: colors.border }}
                        >
                           NEED HELP?
                        </Text>
                     </Pressable>

                     <View
                        className="p-4 rounded-xl border-3 mx-4"
                        style={{
                           backgroundColor: colors.surface,
                           borderColor: colors.border,
                        }}
                     >
                        <Text
                           className="text-sm text-center font-bold leading-relaxed tracking-wide"
                           style={{ color: colors.textSecondary }}
                        >
                           BY CONTINUING, YOU AGREE TO OUR{' '}
                           <Text style={{ color: colors.primary }}>TERMS</Text>{' '}
                           AND{' '}
                           <Text style={{ color: colors.primary }}>
                              PRIVACY POLICY
                           </Text>
                        </Text>
                     </View>
                  </View>
               </View>
            </View>

            {/* Bottom brutalist decoration */}
            <View
               className="absolute bottom-0 left-0 right-0 h-8 border-t-4"
               style={{
                  backgroundColor: colors.accent,
                  borderColor: colors.border,
               }}
            />
         </View>
      </>
   );
}
