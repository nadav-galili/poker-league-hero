import { AppButton } from '@/components/ui/AppButton';
import { useMixpanel } from '@/hooks/useMixpanel';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function TermsOfService() {
   const { trackScreenView } = useMixpanel();

   useEffect(() => {
      trackScreenView('terms_of_service_screen');
   }, [trackScreenView]);

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

               <Text className="text-sm text-white/60 mb-6">
                  Last Updated: November 2025
               </Text>

               <View className="mb-6 items-start">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     1. Agreement & Acceptance
                  </Text>
                  <Text className="text-white/80 mb-4">
                     By downloading, installing, accessing, or using HomeStack
                     (&quot;Application,&quot; &quot;App,&quot;
                     &quot;Service,&quot; &quot;we,&quot; &quot;us,&quot; or
                     &quot;our&quot;), you agree to be bound by these Terms of
                     Service. If you do not agree to any part of these terms,
                     you may not use the Application. We reserve the right to
                     modify these terms at any time. Your continued use
                     constitutes acceptance.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     2. Description of Service
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack is a statistical tracking application for home
                     poker games. It is explicitly NOT a gambling application,
                     gambling platform, or real-money gaming service. Users may
                     only track game results, player statistics, and league
                     information for personal, social, and entertainment
                     purposes. HomeStack does not:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Facilitate actual gambling, wagering, or money exchanges
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Process payments, deposits, or withdrawals
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Offer real-money betting or gaming services
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Operate as a licensed gaming operator in any jurisdiction
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     3. User Eligibility & Age Requirements
                  </Text>
                  <Text className="text-white/80 mb-4">
                     By using HomeStack, you represent and warrant that:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • You are at least 18 years old (or the legal age of
                     majority in your jurisdiction)
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • You have the legal authority to enter into this agreement
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • You will not use the App for any illegal purposes
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • You are not prohibited from using digital services by any
                     law or regulation
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • You are not residing in or accessing the App from a
                     jurisdiction where such use is prohibited
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     4. User Responsibilities & Conduct
                  </Text>
                  <Text className="text-white/80 mb-4">You agree NOT to:</Text>
                  <Text className="text-white/80 mb-2">
                     • Use HomeStack for actual gambling, wagering, or any
                     illegal activities
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Create false, misleading, or fraudulent game records
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Harass, intimidate, threaten, or abuse other users
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Engage in fraud, cheating, or manipulation within the
                     application
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Reverse engineer, decompile, or attempt to hack the
                     Application
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Violate any applicable laws, regulations, or third-party
                     rights
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Use the App for commercial purposes without prior written
                     consent
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Spam, spam-like, or otherwise conduct harmful activities
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     5. Accounts & Security
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • You are responsible for maintaining the confidentiality
                     of your account credentials
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • You are solely responsible for all activity that occurs
                     under your account
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • You agree to notify us immediately of any unauthorized
                     access or breach
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • We reserve the right to suspend or terminate accounts
                     suspected of abuse
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     6. Intellectual Property Rights
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack, including all content, design, code, features,
                     and functionality, is owned by the developers and protected
                     by copyright, trademark, and other intellectual property
                     laws. By using the App, you are granted a limited,
                     non-exclusive, non-transferable license to use HomeStack
                     for personal purposes only.
                  </Text>
                  <Text className="text-white/80 mb-4">
                     You grant HomeStack a perpetual, irrevocable license to any
                     game data you create within the application for service
                     improvement and analytics purposes.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     7. Privacy & Data
                  </Text>
                  <Text className="text-white/80 mb-4">
                     Your use of HomeStack is governed by our Privacy Policy.
                     Please review it carefully. By using the Application, you
                     consent to our collection and use of your information as
                     outlined in the Privacy Policy.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     8. Third-Party Services & Links
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack may include links to third-party websites or
                     services. We are not responsible for the content, accuracy,
                     or practices of external websites. Your use of third-party
                     services is governed by their terms and privacy policies.
                     We are not liable for any damages or losses arising from
                     your use of third-party services.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     9. Disclaimer of Warranties
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack is provided on an &quot;AS IS&quot; and &quot;AS
                     AVAILABLE&quot; basis without any warranties. We make no
                     representations that the Application is:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Free of errors or bugs
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Uninterrupted or always available
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Secure or protected from unauthorized access
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Suitable for any particular purpose
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     10. Limitation of Liability
                  </Text>
                  <Text className="text-white/80 mb-4">
                     To the fullest extent permitted by law, HomeStack, its
                     developers, and affiliates shall not be liable for:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Any disputes, claims, or damages arising from game
                     tracking or user interactions
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Loss of data, revenue, profits, or business opportunities
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Indirect, incidental, special, consequential, or punitive
                     damages
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Service interruptions, errors, or data loss
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Issues arising from unauthorized account access or user
                     negligence
                  </Text>
                  <Text className="text-white/80 mb-4">
                     In no event shall our total liability exceed the amount
                     paid by you (if any) for using the Application.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     11. Indemnification
                  </Text>
                  <Text className="text-white/80 mb-4">
                     You agree to indemnify, defend, and hold harmless
                     HomeStack, its developers, and affiliates from any claims,
                     liabilities, damages, losses, or costs (including legal
                     fees) arising from:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Your violation of these Terms
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Your violation of any applicable law or regulation
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Your violation of third-party rights
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Your use of the Application or any conduct on your
                     account
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     12. User-Generated Content
                  </Text>
                  <Text className="text-white/80 mb-4">
                     Game data, player information, and other content you enter
                     is considered user-generated. You retain ownership of your
                     data. HomeStack may use aggregated, anonymized data for
                     analytics and service improvement. You are solely
                     responsible for the accuracy and legality of your input
                     data.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     13. Content Moderation & Enforcement
                  </Text>
                  <Text className="text-white/80 mb-4">
                     We reserve the right to:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Suspend or terminate accounts violating these Terms
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Remove or modify user-generated content
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Cooperate with law enforcement investigations
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Block or restrict access from specific IP addresses or
                     jurisdictions
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     14. App Store Compliance
                  </Text>
                  <Text className="text-white/80 mb-4">
                     These Terms comply with Apple App Store and Google Play
                     Store policies. HomeStack is not a gambling or real-money
                     gaming application. Users must not use the Application for
                     illegal gambling or gaming purposes in any jurisdiction.
                     Violation of App Store policies may result in account
                     termination or app removal.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     15. Dispute Resolution & Governing Law
                  </Text>
                  <Text className="text-white/80 mb-4">
                     These Terms are governed by the laws of the State of
                     California (if applicable) or your local jurisdiction,
                     excluding conflict of law provisions. Any disputes shall be
                     resolved through:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Good faith negotiation
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Mediation (if negotiation fails)
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Binding arbitration (as a last resort)
                  </Text>
                  <Text className="text-white/80 mb-4">
                     You agree to submit to arbitration rather than litigation
                     in court. Any class action claims are waived, and disputes
                     must be brought individually.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     16. Termination of Service
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack may terminate or suspend your account and service
                     access at any time, with or without cause, with or without
                     notice. Upon termination, your right to use the Application
                     ceases immediately.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     17. Severability
                  </Text>
                  <Text className="text-white/80 mb-4">
                     If any provision of these Terms is found to be invalid,
                     illegal, or unenforceable, such provision shall be modified
                     to the minimum extent necessary or severed, and the
                     remaining provisions shall continue in full force.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     18. Contact & Support
                  </Text>
                  <Text className="text-white/80 mb-2">
                     For questions or support regarding these Terms:
                  </Text>
                  <Text className="text-white/80 mb-4">
                     Email: nadavg1000@gmail.com
                  </Text>
               </View>

               <Text className="text-white/60 italic mt-6 mb-4">
                  This Terms of Service is compliant with Apple App Store,
                  Google Play Store, and international legal standards.
               </Text>
            </ScrollView>
         </LinearGradient>
      </SafeAreaView>
   );
}
