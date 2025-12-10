import { colors, getTheme } from '@/colors';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { uploadImageToR2 } from '@/utils/cloudflareR2';
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
import Toast from 'react-native-toast-message';

export default function Account() {
   const theme = getTheme('light');
   const { user, signOut, fetchWithAuth, refreshUser } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();
   const [isDeletingData, setIsDeletingData] = useState(false);
   const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
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

   const handleUpdateProfile = async (
      name: string,
      imageUri: string | null
   ) => {
      try {
         setIsUpdatingProfile(true);

         // 1. Upload image if changed
         let uploadedImageUrl = imageUri;
         if (
            imageUri &&
            imageUri !== user?.picture &&
            !imageUri.startsWith('http')
         ) {
            try {
               uploadedImageUrl = await uploadImageToR2(
                  imageUri,
                  'profile-images'
               );
            } catch (error) {
               console.error('Failed to upload image:', error);
               Alert.alert('Error', 'Failed to upload image');
               setIsUpdatingProfile(false);
               return;
            }
         }

         // 2. Call update API
         const response = await fetchWithAuth('/api/user/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               fullName: name,
               profileImageUrl: uploadedImageUrl,
            }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
         }

         // 3. Refresh user context
         await refreshUser();

         setIsEditProfileVisible(false);
         Toast.show({
            type: 'success',
            text1: t('profileUpdated'),
         });
      } catch (error) {
         console.error('Error updating profile:', error);
         Toast.show({
            type: 'error',
            text1: t('profileUpdateFailed'),
         });
      } finally {
         setIsUpdatingProfile(false);
      }
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
            <View className="bg-surfaceElevated rounded-2xl p-6 border border-border/50 backdrop-blur-sm">
               <View className="flex-row items-center gap-4">
                  {/* Profile Image */}
                  <View className="relative">
                     <Image
                        source={{
                           uri:
                              user.picture ||
                              'https://via.placeholder.com/80x80/3057FF/FFFFFF?text=?',
                        }}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                        contentFit="cover"
                     />
                  </View>

                  {/* User Info */}
                  <View className="flex-1 gap-2">
                     <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-semibold text-info capitalize">
                           {user.name || 'Unknown User'}
                        </Text>
                        <Pressable
                           onPress={() => setIsEditProfileVisible(true)}
                           className="flex-row items-center gap-1.5 bg-primary/20 px-3 py-1.5 rounded-lg active:opacity-70"
                        >
                           <Ionicons
                              name="pencil"
                              size={14}
                              color={colors.success}
                           />
                           <Text className="text-xs font-medium text-success">
                              Edit
                           </Text>
                        </Pressable>
                     </View>

                     <View className="flex-row items-center gap-2">
                        <Ionicons
                           name="mail-outline"
                           size={16}
                           color={colors.textMuted}
                        />
                        <Text className="text-sm text-textMuted">
                           {user.email || 'No email'}
                        </Text>
                     </View>
                  </View>
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
         </ScrollView>
         <EditProfileModal
            visible={isEditProfileVisible}
            onClose={() => setIsEditProfileVisible(false)}
            onSubmit={handleUpdateProfile}
            currentName={user?.name || ''}
            currentImage={user?.picture || null}
            isLoading={isUpdatingProfile}
         />
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
