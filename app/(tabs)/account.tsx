import { colors, getTheme } from '@/colors';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
   Alert,
   Dimensions,
   Platform,
   Pressable,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Account() {
   const theme = getTheme('light');
   const { user, signOut, fetchWithAuth } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();
   const [isDeletingData, setIsDeletingData] = useState(false);
   const insets = useSafeAreaInsets();
   const { width } = Dimensions.get('window');
   const isIPad =
      Platform.OS === 'ios' && ((Platform as any).isPad || width >= 768);

   const handleDeleteData = () => {
      Alert.alert(
         'Delete Your Data',
         'This will permanently delete all your personal information (name, email, profile picture) from HomeStack. Your game statistics will be preserved but will show as "Anonymous Player". This action cannot be undone.\n\nAre you sure you want to continue?',
         [
            {
               text: 'Cancel',
               style: 'cancel',
            },
            {
               text: 'Delete My Data',
               style: 'destructive',
               onPress: async () => {
                  setIsDeletingData(true);
                  try {
                     const response = await fetchWithAuth('/api/user/delete', {
                        method: 'PUT',
                        headers: {
                           'Content-Type': 'application/json',
                        },
                     });

                     if (!response.ok) {
                        throw new Error('Failed to delete data');
                     }

                     Alert.alert(
                        'Data Deleted',
                        'Your personal data has been successfully deleted. You will be signed out now.',
                        [
                           {
                              text: 'OK',
                              onPress: () => signOut(),
                           },
                        ]
                     );
                  } catch (error) {
                     console.error('Error deleting data:', error);
                     Alert.alert(
                        'Error',
                        'Failed to delete your data. Please try again later or contact support.'
                     );
                  } finally {
                     setIsDeletingData(false);
                  }
               },
            },
         ]
      );
   };

   if (!user) {
      return (
         <View
            style={[styles.container, { backgroundColor: theme.background }]}
         >
            <View
               style={[
                  styles.header,
                  {
                     backgroundColor: theme.surface,
                     borderBottomColor: theme.border,
                  },
               ]}
            >
               <Text className="text-2xl font-bold text-success">
                  {t('account')}
               </Text>
            </View>
            <View style={styles.content}>
               <Text className="text-base text-white">
                  Please sign in to view account details
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View className="flex-1 bg-background">
         <View className="p-4 border-b-4 border-primary shadow-shadow shadow-lg ">
            <Text className="text-2xl font-bold text-success">
               {t('account')}
            </Text>
         </View>

         <ScrollView
            className="flex-1"
            contentContainerStyle={[
               styles.content,
               { paddingBottom: Math.max(insets.bottom + 100, 120) },
               isIPad && styles.ipadContent,
            ]}
            showsVerticalScrollIndicator={false}
         >
            {/* User Profile Card */}
            <View
               style={[
                  styles.profileCard,
                  styles.brutalistShadow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
               ]}
            >
               {/* Profile Image */}
               <View style={styles.imageContainer}>
                  <Image
                     source={{
                        uri:
                           user.picture ||
                           'https://via.placeholder.com/80x80/3057FF/FFFFFF?text=?',
                     }}
                     style={styles.profileImage}
                     contentFit="cover"
                  />
                  <View
                     style={[
                        styles.imageFrame,
                        { borderColor: colors.primary },
                     ]}
                  />
                  <View
                     style={[
                        styles.imageCornerAccent,
                        { backgroundColor: colors.accent },
                     ]}
                  />
               </View>

               {/* User Info */}
               <View style={styles.userInfo}>
                  <View style={styles.nameContainer}>
                     <Text className="text-lg font-bold text-success">
                        {user.name || 'Unknown User'}
                     </Text>
                     <View
                        style={[
                           styles.nameUnderline,
                           { backgroundColor: colors.primary },
                        ]}
                     />
                  </View>

                  <View style={styles.emailContainer}>
                     <Ionicons name="mail" size={14} color={colors.info} />
                     <Text className="text-sm text-white">
                        {user.email || 'No email'}
                     </Text>
                  </View>

                  {user.email_verified && (
                     <View style={styles.verifiedBadge}>
                        <Ionicons
                           name="checkmark-circle"
                           size={14}
                           color={colors.primary}
                        />
                        <Text className="text-xs text-white">VERIFIED</Text>
                     </View>
                  )}
               </View>
            </View>

            {/* Account Actions */}
            <View className="gap-2">
               <Text className="text-2xl font-bold text-success">
                  {t('accountActions')}
               </Text>

               <Pressable
                  className="rounded-xl border-3 border-primary shadow-shadow shadow-lg active:scale-95 bg-error overflow-hidden"
                  onPress={signOut}
               >
                  <View className="flex-row items-center justify-center gap-2 py-3 px-4 border-4 border-primary overflow-hidden">
                     <View className="w-8 h-8 rounded-xl items-center justify-center mr-2 bg-white/10 border border-white/20">
                        <Ionicons name="log-out" size={16} color="#FFFFFF" />
                     </View>
                     <Text className="text-sm text-white">{t('signOut')}</Text>
                  </View>
                  <View
                     style={[styles.actionBorder, { borderColor: colors.text }]}
                  />
               </Pressable>

               <Pressable
                  className="rounded-xl border-3 border-primary shadow-shadow shadow-lg active:scale-95 bg-info overflow-hidden"
                  onPress={() => router.push('/onboarding')}
               >
                  <View className="flex-row items-center justify-center gap-2 py-3 px-4 border-4 border-primary overflow-hidden">
                     <View className="w-8 h-8 rounded-xl items-center justify-center mr-2 bg-white/10 border border-white/20">
                        <Ionicons
                           name="play-circle"
                           size={16}
                           color="#FFFFFF"
                        />
                     </View>
                     <Text className="text-sm text-white">
                        Re-watch Onboarding
                     </Text>
                  </View>
                  <View
                     style={[styles.actionBorder, { borderColor: colors.text }]}
                  />
               </Pressable>
            </View>

            {/* Legal Links */}
            <View className="gap-4">
               <Text className="text-2xl font-bold text-success">Legal</Text>

               <View className="gap-2">
                  <Pressable
                     onPress={() => router.push('/terms')}
                     className="rounded-xl border-2 border-primary p-4 active:opacity-70"
                  >
                     <Text className="text-base text-white">
                        Terms of Service
                     </Text>
                  </Pressable>

                  <Pressable
                     onPress={() => router.push('/privacy')}
                     className="rounded-xl border-2 border-primary p-4 active:opacity-70"
                  >
                     <Text className="text-base text-white">
                        Privacy Policy
                     </Text>
                  </Pressable>

                  <Pressable
                     onPress={handleDeleteData}
                     disabled={isDeletingData}
                     className="rounded-xl border-2 border-error p-3 active:opacity-70 mt-2"
                     style={{ opacity: isDeletingData ? 0.6 : 1 }}
                  >
                     <View className="flex-row items-center justify-center gap-2">
                        <Ionicons
                           name="trash-outline"
                           size={16}
                           color="#ef4444"
                        />
                        <Text className="text-sm text-error font-semibold">
                           {isDeletingData
                              ? 'Deleting Data...'
                              : 'Delete My Data'}
                        </Text>
                     </View>
                  </Pressable>
               </View>
            </View>

            {/* User Details */}
            {/* <View style={styles.detailsContainer}>
               <Text
                  variant="h4"
                  color={theme.text}
                  style={[styles.sectionTitle, isRTL && styles.rtlText]}
               >
                  {t('userDetails')}
               </Text>

               <View
                  style={[
                     styles.detailCard,
                     {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                     },
                  ]}
               >
                  <View style={styles.detailRow}>
                     <Text
                        variant="labelSmall"
                        color={colors.border}
                        style={styles.detailLabel}
                     >
                        USER ID
                     </Text>
                     <Text
                        variant="body"
                        color={theme.text}
                        style={styles.detailValue}
                     >
                        {user.id}
                     </Text>
                  </View>

                  {user.given_name && (
                     <View style={styles.detailRow}>
                        <Text
                           variant="labelSmall"
                           color={colors.border}
                           style={styles.detailLabel}
                        >
                           FIRST NAME
                        </Text>
                        <Text
                           variant="body"
                           color={theme.text}
                           style={styles.detailValue}
                        >
                           {user.given_name}
                        </Text>
                     </View>
                  )}

                  {user.family_name && (
                     <View style={styles.detailRow}>
                        <Text
                           variant="labelSmall"
                           color={colors.border}
                           style={styles.detailLabel}
                        >
                           LAST NAME
                        </Text>
                        <Text
                           variant="body"
                           color={theme.text}
                           style={styles.detailValue}
                        >
                           {user.family_name}
                        </Text>
                     </View>
                  )}

                  {user.provider && (
                     <View style={styles.detailRow}>
                        <Text
                           variant="labelSmall"
                           color={colors.border}
                           style={styles.detailLabel}
                        >
                           PROVIDER
                        </Text>
                        <Text
                           variant="body"
                           color={theme.text}
                           style={styles.detailValue}
                        >
                           {user.provider.toUpperCase()}
                        </Text>
                     </View>
                  )}
               </View>
            </View>*/}
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },

   header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 24,
      borderBottomWidth: 3,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
      elevation: 8,
   },

   headerTitle: {
      letterSpacing: 2,
      textAlign: 'center',
   },

   scrollContainer: {
      flex: 1,
   },

   content: {
      padding: 20,
      gap: 24,
   },

   ipadContent: {
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 40,
   },

   placeholder: {
      textAlign: 'center',
      marginTop: 40,
   },

   // Profile Card
   profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      borderWidth: 3,
   },

   brutalistShadow: {
      shadowColor: colors.text,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 0,
      elevation: 16,
   },

   imageContainer: {
      position: 'relative',
      marginRight: 12,
   },

   profileImage: {
      width: 80,
      height: 80,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: '#FFFFFF',
   },

   imageFrame: {
      position: 'absolute',
      top: -6,
      left: -6,
      right: -6,
      bottom: -6,
      borderWidth: 3,
      borderRadius: 24,
      opacity: 0.8,
   },

   imageCornerAccent: {
      position: 'absolute',
      top: -3,
      right: -3,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: '#FFFFFF',
   },

   userInfo: {
      flex: 1,
      gap: 8,
   },

   nameContainer: {
      position: 'relative',
   },

   userName: {
      letterSpacing: 1.2,
   },

   nameUnderline: {
      position: 'absolute',
      bottom: -4,
      left: 0,
      width: '80%',
      height: 4,
      opacity: 0.8,
   },

   emailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
   },

   userEmail: {
      letterSpacing: 0.5,
   },

   verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
   },

   verifiedText: {
      letterSpacing: 1,
   },

   // Sections
   actionsContainer: {
      gap: 16,
   },

   detailsContainer: {
      gap: 16,
   },

   sectionTitle: {
      letterSpacing: 1.5,
   },

   // Action Button
   actionButton: {
      borderRadius: 16,
      borderWidth: 4,
      overflow: 'hidden',
   },

   actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingVertical: 20,
      paddingHorizontal: 24,
   },

   actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
   },

   actionText: {
      letterSpacing: 1.2,
   },

   actionBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 4,
      borderRadius: 16,
      opacity: 0.8,
   },

   pressedButton: {
      transform: [{ scale: 0.97 }, { translateX: 3 }, { translateY: 3 }],
      shadowOffset: { width: 4, height: 4 },
   },

   // Details Card
   detailCard: {
      borderRadius: 16,
      borderWidth: 3,
      padding: 20,
      gap: 16,
   },

   detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 2,
      borderBottomColor: 'rgba(19,22,41,0.1)',
   },

   detailLabel: {
      letterSpacing: 1,
      textTransform: 'uppercase',
   },

   detailValue: {
      letterSpacing: 0.5,
      textAlign: 'right',
      flex: 1,
      marginLeft: 16,
   },

   rtlText: {
      textAlign: 'right',
   },
});
