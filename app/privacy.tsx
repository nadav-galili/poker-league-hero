import { AppButton } from '@/components/ui/AppButton';
import { useMixpanel } from '@/hooks/useMixpanel';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function PrivacyPolicy() {
   const { trackScreenView } = useMixpanel();

   useEffect(() => {
      trackScreenView('privacy_policy_screen');
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

               <Text className="text-sm text-white/60 mb-6">
                  Last Updated: November 2025
               </Text>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     1. Overview
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot;
                     or &quot;Company&quot;) is committed to protecting your
                     privacy. This Privacy Policy explains how we collect, use,
                     disclose, and otherwise handle your information when you
                     use our application and related services.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     2. Information We Collect
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">Authentication Data:</Text>{' '}
                     When you sign in via Apple ID or Google OAuth, we receive
                     your email address, name, and profile picture from the
                     respective provider.
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">Game & League Data:</Text>{' '}
                     All game statistics, player information, league data, and
                     game results that you voluntarily create and enter into the
                     application.
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">
                        Device & Usage Information:
                     </Text>{' '}
                     Device identifiers, operating system type, app version,
                     crash logs, performance metrics, and feature usage patterns
                     for app diagnostics and improvement.
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">Analytics Data:</Text>{' '}
                     Anonymous events about how you interact with the app (page
                     views, button clicks, feature usage).
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">Error Tracking:</Text>{' '}
                     Error logs, stack traces, and debugging information to help
                     us fix bugs and improve stability.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     3. How We Use Your Data
                  </Text>
                  <Text className="text-white/80 mb-4">
                     We use collected data to:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Provide, maintain, and improve the HomeStack service
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Authenticate and secure your account
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Personalize your user experience
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Respond to support inquiries
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Monitor and troubleshoot app performance and stability
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Detect and prevent fraudulent activity or abuse
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Comply with legal obligations and enforce our terms
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Analyze usage patterns to develop new features
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     4. Third-Party Services & Data Sharing
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">
                        We do NOT sell your personal data.
                     </Text>{' '}
                     However, we use the following third-party services:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     •{' '}
                     <Text className="font-semibold">Apple/Google OAuth:</Text>{' '}
                     For secure authentication. Your OAuth provider&apos;s&quot;
                     &quot;privacy policy applies.
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • <Text className="font-semibold">Mixpanel:</Text> For
                     anonymous usage analytics and feature tracking. Data is
                     anonymized and does not include personal identifiers. See
                     their privacy policy at mixpanel.com/privacy.
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • <Text className="font-semibold">Sentry:</Text> For error
                     tracking and performance monitoring. Error reports may
                     include limited system information. See their privacy
                     policy at sentry.io/privacy.
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • <Text className="font-semibold">Cloudflare R2:</Text> For
                     secure data storage and content delivery.
                  </Text>
                  <Text className="text-white/80 mb-4">
                     •{' '}
                     <Text className="font-semibold">Legal Requirements:</Text>{' '}
                     We may disclose information when required by law, court
                     order, or government request.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     5. Data Storage & Security
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Data is encrypted in transit using industry-standard
                     TLS/SSL protocols
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Sensitive data (authentication tokens, passwords) are
                     stored securely in device secure storage or encrypted
                     databases
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • We implement access controls and regular security audits
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • No payment or financial data is stored by HomeStack
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     6. Your Privacy Rights (GDPR & CCPA)
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">
                        For EU/UK residents (GDPR):
                     </Text>
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Right to access your personal data
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Right to correct inaccurate information
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Right to delete your data (&quot;right to be
                     forgotten&quot;)
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Right to restrict processing
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Right to data portability
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Right to opt-out of analytics tracking
                  </Text>
                  <Text className="text-white/80 mb-4">
                     <Text className="font-semibold">
                        For California residents (CCPA):
                     </Text>{' '}
                     You have similar rights including the right to know,
                     delete, and opt-out of data sales.
                  </Text>
                  <Text className="text-white/80 mb-4">
                     To exercise these rights, contact: nadavg1000@gmail.com
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     7. Data Retention
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Account data is retained as long as your account is
                     active
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Game and league data can be deleted at any time by you
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Analytics data is retained for up to 12 months
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Error logs are automatically purged after 30 days
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     8. Children&apos;s Privacy
                  </Text>
                  <Text className="text-white/80 mb-4">
                     HomeStack is intended for users 18 years of age and older.
                     We do not knowingly collect personal information from
                     children under 13. If we become aware of such collection,
                     we will delete it immediately. If you are a parent or
                     guardian and believe your child has provided information to
                     HomeStack, please contact us at nadavg1000@gmail.com.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     9. Analytics & Tracking
                  </Text>
                  <Text className="text-white/80 mb-4">
                     We use Mixpanel for anonymous analytics. This data:
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Does NOT include personal identifiable information
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Is used to understand feature usage and improve the app
                  </Text>
                  <Text className="text-white/80 mb-2">
                     • Can be opted out of by disabling analytics in app
                     settings (if available)
                  </Text>
                  <Text className="text-white/80 mb-4">
                     • Is governed by &quot;Apple&apos;s&quot; App Tracking
                     Transparency (ATT) framework on iOS
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     10. International Data Transfers
                  </Text>
                  <Text className="text-white/80 mb-4">
                     Your data may be transferred, stored, and processed in the
                     United States or other countries. By using HomeStack, you
                     consent to such transfers. We maintain data protection
                     standards compliant with GDPR and other international
                     regulations.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     11. Changes to This Policy
                  </Text>
                  <Text className="text-white/80 mb-4">
                     We may update this Privacy Policy periodically. Continued
                     use of the App after changes constitutes your acceptance of
                     the updated Privacy Policy. We will notify you of material
                     changes.
                  </Text>
               </View>

               <View className="mb-6">
                  <Text className="text-xl font-semibold text-white/90 mb-4">
                     12. Contact Us
                  </Text>
                  <Text className="text-white/80 mb-2">
                     For privacy concerns or to exercise your data rights,
                     contact:
                  </Text>
                  <Text className="text-white/80 mb-4">
                     Email: nadavg1000@gmail.com
                  </Text>
               </View>

               <Text className="text-white/60 italic mt-6 mb-4">
                  This Privacy Policy complies with GDPR, CCPA, and App Store
                  guidelines.
               </Text>
            </ScrollView>
         </LinearGradient>
      </SafeAreaView>
   );
}
