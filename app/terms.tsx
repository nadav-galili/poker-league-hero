import { AppButton } from '@/components/ui/AppButton';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function TermsOfService() {
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
                  Terms of Service
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
                     1. Acceptance of Terms
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     By accessing or using HomeStack (&quot;the App&quot;), you
                     agree to these Terms of Service. If you do not agree, do
                     not use the App.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     2. About HomeStack
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     HomeStack is a statistical tracking application for home
                     poker games. It is NOT a gambling application. Users track
                     game results, player statistics, and league information for
                     personal and social purposes only.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     3. User Eligibility
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     - Users must be at least 18 years old - You may not use
                     this App for any illegal activities - Each user is
                     responsible for their own game tracking and statistical
                     records
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     4. Data and Privacy
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     We collect minimal user data required to provide the
                     App&apos;s services. Detailed information is available in
                     our Privacy Policy. By using HomeStack, you consent to our
                     data practices.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     5. Prohibited Activities
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     Users may NOT: - Use the App for actual gambling purposes -
                     Create false or misleading game records - Harass or
                     intimidate other users - Violate local laws or regulations
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     6. Intellectual Property
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     All content, design, and functionality of HomeStack are
                     owned by the developers. Users grant a limited,
                     non-exclusive license to use their game data within the
                     App.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     7. Limitation of Liability
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     HomeStack is provided &quot;as is&quot; without warranties.
                     We are not responsible for any disputes arising from game
                     tracking or user interactions.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4 text-right">
                     8. Modifications
                  </Text>
                  <Text className="text-white/80 mb-4 text-right">
                     We may update these Terms of Service. Continued use of the
                     App after changes constitutes acceptance of new terms.
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
