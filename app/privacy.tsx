import { AppButton } from '@/components/ui/AppButton';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
export default function PrivacyPolicy() {
   return (
      <SafeAreaView className="flex-1">
         <LinearGradient colors={['#3730a3', '#581c87']} className="flex-1">
            <ScrollView
               contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 30,
               }}
            >
               <Text className="text-3xl font-bold text-white mb-6 text-center">
                  Privacy Policy
               </Text>
               <View className="mb-6 items-end">
                  <AppButton
                     color="info"
                     size="small"
                     icon="arrow-back"
                     title="Back"
                     onPress={() => router.back()}
                  />
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     1. Information We Collect
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     HomeStack collects the following data: - Google OAuth user
                     profile information (email, name, profile picture) - Game
                     statistics and league data you create - Device and usage
                     information for app performance
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     2. How We Use Your Data
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     We use collected data to: - Provide and improve the
                     HomeStack service - Personalize user experience - Send
                     optional app-related communications - Track anonymous usage
                     analytics
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     3. Data Sharing and Disclosure
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     We do NOT sell your personal data. We may share data with:
                     - Google OAuth for authentication - Mixpanel for anonymous
                     usage analytics - Sentry for error tracking - Legal
                     requirements as mandated by law
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     4. User Rights (GDPR)
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     EU users have the right to: - Access your personal data -
                     Request data deletion - Opt-out of analytics tracking -
                     Correct inaccurate information
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     5. Data Security
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     We implement industry-standard security measures: -
                     Encrypted data transmission - Secure cloud storage -
                     Regular security audits - OAuth token management
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     6. Cookies and Tracking
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     We use minimal tracking: - Anonymous usage analytics -
                     Performance monitoring - No third-party advertising
                     trackers
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     7. Children&apos;s Privacy
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     HomeStack is not intended for children under 18. We do not
                     knowingly collect data from minors.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     8. International Data Transfers
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     User data may be transferred and processed in the United
                     States, ensuring GDPR and international privacy standards
                     compliance.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     9. Contact Information
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     For privacy concerns, contact: nadavg1000@gmail.com
                  </Text>
               </View>

               <Text className="text-white/60 italic text-right mt-6">
                  Last Updated: October 2025
               </Text>
            </ScrollView>
         </LinearGradient>
      </SafeAreaView>
   );
}
