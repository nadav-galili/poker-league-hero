import { colors } from '@/colors';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { uploadImageToR2 } from '@/utils/cloudflareR2';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
   Alert,
   Animated,
   Dimensions,
   Platform,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Cyberpunk Language Selection Component
function CyberpunkLanguageSelector() {
   const { language, setLanguage, t } = useLocalization();
   const { track } = useMixpanel();
   const glowAnim = useRef(new Animated.Value(0)).current;
   const [isExpanded, setIsExpanded] = useState(false);

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
               toValue: 0.3,
               duration: 2000,
               useNativeDriver: false,
            }),
         ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
   }, [glowAnim]);

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
   });

   const glowRadius = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [6, 12],
   });

   const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
   };

   const selectLanguage = async (lang: 'en' | 'he') => {
      await setLanguage(lang);
      setIsExpanded(false);
      track('user_profile_updated', {
         updated_field: 'language',
         value: lang,
      });
   };

   const languageOptions = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'he', name: 'עברית', flag: '🇮🇱' },
   ];

   const currentLanguage = languageOptions.find(
      (lang) => lang.code === language
   );

   return (
      <View style={cyberpunkStyles.languageContainer}>
         <Text style={cyberpunkStyles.sectionTitle}>
            {t('language').toUpperCase()}
         </Text>
         <Animated.View
            style={[
               cyberpunkStyles.languageSelector,
               {
                  shadowOpacity: glowOpacity,
                  shadowRadius: glowRadius,
               },
            ]}
         >
            <LinearGradient
               colors={['#001122', '#000011', '#000000']}
               style={cyberpunkStyles.languageGradient}
            >
               {/* Corner Brackets */}
               <View style={cyberpunkStyles.cornerTL} />
               <View style={cyberpunkStyles.cornerTR} />
               <View style={cyberpunkStyles.cornerBL} />
               <View style={cyberpunkStyles.cornerBR} />

               <TouchableOpacity
                  onPress={toggleExpanded}
                  style={cyberpunkStyles.languageButton}
               >
                  <Text style={cyberpunkStyles.languageFlag}>
                     {currentLanguage?.flag}
                  </Text>
                  <Text style={cyberpunkStyles.languageText}>
                     {currentLanguage?.name}
                  </Text>
                  <Animated.View
                     style={{
                        transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                     }}
                  >
                     <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.neonCyan}
                        style={{
                           textShadowColor: colors.neonCyan,
                           textShadowRadius: 8,
                        }}
                     />
                  </Animated.View>
               </TouchableOpacity>

               {isExpanded && (
                  <View style={cyberpunkStyles.languageOptions}>
                     {languageOptions.map((lang) => (
                        <TouchableOpacity
                           key={lang.code}
                           onPress={() =>
                              selectLanguage(lang.code as 'en' | 'he')
                           }
                           style={[
                              cyberpunkStyles.languageOption,
                              language === lang.code &&
                                 cyberpunkStyles.activeLanguageOption,
                           ]}
                        >
                           <Text style={cyberpunkStyles.languageFlag}>
                              {lang.flag}
                           </Text>
                           <Text
                              style={[
                                 cyberpunkStyles.languageText,
                                 language === lang.code &&
                                    cyberpunkStyles.activeLanguageText,
                              ]}
                           >
                              {lang.name}
                           </Text>
                           {language === lang.code && (
                              <Ionicons
                                 name="checkmark-circle"
                                 size={18}
                                 color={colors.matrixGreen}
                                 style={{
                                    textShadowColor: colors.matrixGreen,
                                    textShadowRadius: 6,
                                 }}
                              />
                           )}
                        </TouchableOpacity>
                     ))}
                  </View>
               )}
            </LinearGradient>
         </Animated.View>
      </View>
   );
}

export default function Account() {
   const { user, signOut, fetchWithAuth, refreshUser } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();
   const { trackScreenView, track, reset } = useMixpanel();
   const [isDeletingData, setIsDeletingData] = useState(false);
   const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
   const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
   const insets = useSafeAreaInsets();

   useEffect(() => {
      trackScreenView('account_screen');
   }, [trackScreenView]);

   const handleSignOut = useCallback(async () => {
      await track('user_logged_out');
      await reset();
      signOut();
   }, [track, reset, signOut]);
   const { width } = Dimensions.get('window');
   const isIPad =
      Platform.OS === 'ios' && ((Platform as any).isPad || width >= 768);

   // Cyberpunk animations
   const headerGlowAnim = useRef(new Animated.Value(0)).current;
   const profileGlowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const headerGlow = Animated.loop(
         Animated.sequence([
            Animated.timing(headerGlowAnim, {
               toValue: 1,
               duration: 3000,
               useNativeDriver: false,
            }),
            Animated.timing(headerGlowAnim, {
               toValue: 0.2,
               duration: 3000,
               useNativeDriver: false,
            }),
         ])
      );

      const profileGlow = Animated.loop(
         Animated.sequence([
            Animated.timing(profileGlowAnim, {
               toValue: 1,
               duration: 2500,
               useNativeDriver: false,
            }),
            Animated.timing(profileGlowAnim, {
               toValue: 0.4,
               duration: 2500,
               useNativeDriver: false,
            }),
         ])
      );

      headerGlow.start();
      profileGlow.start();

      return () => {
         headerGlow.stop();
         profileGlow.stop();
      };
   }, [headerGlowAnim, profileGlowAnim]);

   const headerGlowOpacity = headerGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.8],
   });

   const profileGlowOpacity = profileGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
   });
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
                     track('user_profile_updated', { action: 'delete_data_start' });
                     const response = await fetchWithAuth('/api/user/delete', {
                        method: 'PUT',
                        headers: {
                           'Content-Type': 'application/json',
                        },
                     });

                     if (!response.ok) {
                        throw new Error('Failed to delete data');
                     }

                     track('user_profile_updated', { action: 'delete_data_success' });
                     Toast.show({
                        type: 'success',
                        text1: t('success'),
                        text2: t('dataDeletedSuccess'),
                     });
                     handleSignOut();
                  } catch (error) {
                     console.error('Error deleting data:', error);
                     track('api_error', { 
                        error: error instanceof Error ? error.message : String(error),
                        endpoint: '/api/user/delete'
                     });
                     Toast.show({
                        type: 'error',
                        text1: t('error'),
                        text2: t('dataDeletionFailed'),
                     });
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
         track('user_profile_updated', { action: 'update_profile_start' });

         // 1. Upload image if changed
         let uploadedImageUrl: string | null = imageUri;
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
               track('api_error', { 
                  error: error instanceof Error ? error.message : String(error),
                  endpoint: 'R2_upload_profile_image'
               });
               Toast.show({
                  type: 'error',
                  text1: t('error'),
                  text2: t('failedToUploadImage'),
               });
               setIsUpdatingProfile(false);
               return;
            }
         }

         // Normalize empty strings to null
         if (uploadedImageUrl === '') {
            uploadedImageUrl = null;
         }

         // 2. Prepare request body - only include fields that changed
         const requestBody: {
            fullName?: string;
            profileImageUrl?: string | null;
         } = {};

         // Only include fullName if it's different from current
         const trimmedName = name.trim();
         if (trimmedName && trimmedName !== user?.name) {
            requestBody.fullName = trimmedName;
         }

         // Only include profileImageUrl if it's different from current
         if (uploadedImageUrl !== user?.picture) {
            requestBody.profileImageUrl = uploadedImageUrl;
         }

         // Validate that at least one field is being updated
         if (!requestBody.fullName && requestBody.profileImageUrl === undefined) {
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: 'No changes to save',
            });
            setIsUpdatingProfile(false);
            return;
         }

         console.log('📤 Sending update request:', JSON.stringify(requestBody, null, 2));

         // 2. Call update API
         const response = await fetchWithAuth('/api/user/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
         });

         if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Profile update error:', errorData);
            const errorMessage = errorData.details
               ? `${errorData.error}: ${JSON.stringify(errorData.details)}`
               : errorData.error || 'Failed to update profile';
            throw new Error(errorMessage);
         }

         track('user_profile_updated', { action: 'update_profile_success' });
         // 3. Refresh user context
         await refreshUser();

         setIsEditProfileVisible(false);
         Toast.show({
            type: 'success',
            text1: t('profileUpdated'),
         });
      } catch (error) {
         console.error('Error updating profile:', error);
         track('api_error', { 
            error: error instanceof Error ? error.message : String(error),
            endpoint: '/api/user/update'
         });
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
         <View style={cyberpunkStyles.container}>
            <LinearGradient
               colors={['#000011', '#001122', '#000000']}
               style={cyberpunkStyles.backgroundGradient}
            >
               {/* Cyberpunk Header */}
               <Animated.View
                  style={[
                     cyberpunkStyles.header,
                     {
                        shadowOpacity: headerGlowOpacity,
                     },
                  ]}
               >
                  <LinearGradient
                     colors={['#001122', '#000011', '#000000']}
                     style={cyberpunkStyles.headerGradient}
                  >
                     {/* Corner Brackets */}
                     <View style={cyberpunkStyles.cornerTL} />
                     <View style={cyberpunkStyles.cornerTR} />
                     <View style={cyberpunkStyles.cornerBL} />
                     <View style={cyberpunkStyles.cornerBR} />
                     <Text style={cyberpunkStyles.headerTitle}>
                        {t('account').toUpperCase()}
                     </Text>
                  </LinearGradient>
               </Animated.View>

               <View style={cyberpunkStyles.content}>
                  <Text style={cyberpunkStyles.signInText}>
                     Please sign in to view account details
                  </Text>
               </View>
            </LinearGradient>
         </View>
      );
   }

   return (
      <View style={cyberpunkStyles.container}>
         <LinearGradient
            colors={['#000011', '#001122', '#000000']}
            style={cyberpunkStyles.backgroundGradient}
         >
            {/* Cyberpunk Header */}
            <Animated.View
               style={[
                  cyberpunkStyles.header,
                  {
                     shadowOpacity: headerGlowOpacity,
                  },
               ]}
            >
               <LinearGradient
                  colors={['#001122', '#000011', '#000000']}
                  style={cyberpunkStyles.headerGradient}
               >
                  {/* Corner Brackets */}
                  <View style={cyberpunkStyles.cornerTL} />
                  <View style={cyberpunkStyles.cornerTR} />
                  <View style={cyberpunkStyles.cornerBL} />
                  <View style={cyberpunkStyles.cornerBR} />
                  <Text style={cyberpunkStyles.headerTitle}>
                     {t('account').toUpperCase()}
                  </Text>
               </LinearGradient>
            </Animated.View>

            <ScrollView
               style={cyberpunkStyles.scrollView}
               contentContainerStyle={[
                  cyberpunkStyles.content,
                  { paddingBottom: Math.max(insets.bottom + 100, 120) },
                  isIPad && styles.ipadContent,
               ]}
               showsVerticalScrollIndicator={false}
            >
               {/* Cyberpunk User Profile Card */}
               <Animated.View
                  style={[
                     cyberpunkStyles.profileCard,
                     {
                        shadowOpacity: profileGlowOpacity,
                     },
                  ]}
               >
                  <LinearGradient
                     colors={['#001122', '#000011', '#000000']}
                     style={cyberpunkStyles.profileGradient}
                  >
                     {/* Corner Brackets */}
                     <View style={cyberpunkStyles.cornerTL} />
                     <View style={cyberpunkStyles.cornerTR} />
                     <View style={cyberpunkStyles.cornerBL} />
                     <View style={cyberpunkStyles.cornerBR} />

                     <View style={cyberpunkStyles.profileContent}>
                        {/* Holographic Profile Image */}
                        <View style={cyberpunkStyles.profileImageContainer}>
                           <View style={cyberpunkStyles.profileImageBorder}>
                              <Image
                                 source={{
                                    uri:
                                       user.picture ||
                                       'https://via.placeholder.com/80x80/00FFFF/000000?text=USER',
                                 }}
                                 style={cyberpunkStyles.profileImage}
                                 contentFit="cover"
                              />
                           </View>
                           {/* Holographic overlay */}
                           <View style={cyberpunkStyles.holoOverlay} />
                           {/* Corner brackets for image */}
                           <View style={cyberpunkStyles.imageCornerTL} />
                           <View style={cyberpunkStyles.imageCornerTR} />
                           <View style={cyberpunkStyles.imageCornerBL} />
                           <View style={cyberpunkStyles.imageCornerBR} />
                        </View>

                        {/* User Info */}
                        <View style={cyberpunkStyles.userInfo}>
                           <View style={cyberpunkStyles.userInfoHeader}>
                              <Text style={cyberpunkStyles.userName}>
                                 {user.name || 'UNKNOWN USER'}
                              </Text>
                              <TouchableOpacity
                                 onPress={() => setIsEditProfileVisible(true)}
                                 style={cyberpunkStyles.editButton}
                              >
                                 <LinearGradient
                                    colors={[colors.neonCyan, colors.neonBlue]}
                                    style={cyberpunkStyles.editButtonGradient}
                                 >
                                    <Ionicons
                                       name="pencil"
                                       size={14}
                                       color={colors.cyberBackground}
                                       style={{ fontWeight: 'bold' }}
                                    />
                                    <Text
                                       style={cyberpunkStyles.editButtonText}
                                    >
                                       EDIT
                                    </Text>
                                 </LinearGradient>
                              </TouchableOpacity>
                           </View>

                           <View style={cyberpunkStyles.userEmail}>
                              <Ionicons
                                 name="mail"
                                 size={16}
                                 color={colors.matrixGreen}
                                 style={{
                                    textShadowColor: colors.matrixGreen,
                                    textShadowRadius: 6,
                                 }}
                              />
                              <Text style={cyberpunkStyles.emailText}>
                                 {user.email || 'NO EMAIL'}
                              </Text>
                           </View>
                        </View>
                     </View>
                  </LinearGradient>
               </Animated.View>

               {/* Language Selection */}
               <CyberpunkLanguageSelector />

               {/* Cyberpunk Account Actions */}
               <View style={cyberpunkStyles.actionsSection}>
                  <Text style={cyberpunkStyles.sectionTitle}>
                     {t('accountActions').toUpperCase()}
                  </Text>

                  {/* Sign Out Button */}
                  <TouchableOpacity
                     onPress={handleSignOut}
                     style={cyberpunkStyles.actionButton}
                  >
                     <LinearGradient
                        colors={[
                           colors.neonPink,
                           colors.errorDark,
                           colors.cyberBackground,
                        ]}
                        style={cyberpunkStyles.actionGradient}
                     >
                        {/* Corner Brackets */}
                        <View style={cyberpunkStyles.actionCornerTL} />
                        <View style={cyberpunkStyles.actionCornerTR} />
                        <View style={cyberpunkStyles.actionCornerBL} />
                        <View style={cyberpunkStyles.actionCornerBR} />

                        <View style={cyberpunkStyles.actionContent}>
                           <View style={cyberpunkStyles.actionIcon}>
                              <Ionicons
                                 style={{ color: '#FFFFFF' }}
                                 name="log-out"
                                 size={20}
                              />
                           </View>
                           <Text
                              style={[
                                 cyberpunkStyles.actionText,
                                 { color: '#FFFFFF' },
                              ]}
                           >
                              {t('signOut').toUpperCase()}
                           </Text>
                        </View>
                     </LinearGradient>
                  </TouchableOpacity>

                  {/* Onboarding Button */}
                  <TouchableOpacity
                     onPress={() => router.push('/onboarding')}
                     style={cyberpunkStyles.actionButton}
                  >
                     <LinearGradient
                        colors={[
                           colors.neonBlue,
                           colors.info,
                           colors.cyberBackground,
                        ]}
                        style={cyberpunkStyles.actionGradient}
                     >
                        {/* Corner Brackets */}
                        <View style={cyberpunkStyles.actionCornerTL} />
                        <View style={cyberpunkStyles.actionCornerTR} />
                        <View style={cyberpunkStyles.actionCornerBL} />
                        <View style={cyberpunkStyles.actionCornerBR} />

                        <View style={cyberpunkStyles.actionContent}>
                           <View style={cyberpunkStyles.actionIcon}>
                              <Ionicons
                                 name="play-circle"
                                 size={20}
                                 style={{
                                    textShadowColor: colors.neonBlue,
                                    textShadowRadius: 8,
                                    color: '#FFFFFF',
                                 }}
                              />
                           </View>
                           <Text
                              style={[
                                 cyberpunkStyles.actionText,
                                 { color: '#FFFFFF' },
                              ]}
                           >
                              RE-WATCH ONBOARDING
                           </Text>
                        </View>
                     </LinearGradient>
                  </TouchableOpacity>
               </View>

               {/* Cyberpunk Legal Links */}
               <View style={cyberpunkStyles.legalSection}>
                  <Text style={cyberpunkStyles.sectionTitle}>LEGAL</Text>

                  <View style={cyberpunkStyles.legalLinks}>
                     <TouchableOpacity
                        onPress={() => {
                           track('screen_viewed', { screen_name: 'terms_of_service' });
                           router.push('/terms');
                        }}
                        style={cyberpunkStyles.legalButton}
                     >
                        <View style={cyberpunkStyles.legalButtonBorder} />
                        <Text style={cyberpunkStyles.legalButtonText}>
                           TERMS OF SERVICE
                        </Text>
                        <Ionicons
                           name="document-text"
                           size={16}
                           color={colors.neonCyan}
                           style={{
                              textShadowColor: colors.neonCyan,
                              textShadowRadius: 6,
                           }}
                        />
                     </TouchableOpacity>

                     <TouchableOpacity
                        onPress={() => {
                           track('screen_viewed', { screen_name: 'privacy_policy' });
                           router.push('/privacy');
                        }}
                        style={cyberpunkStyles.legalButton}
                     >
                        <View style={cyberpunkStyles.legalButtonBorder} />
                        <Text style={cyberpunkStyles.legalButtonText}>
                           PRIVACY POLICY
                        </Text>
                        <Ionicons
                           name="shield-checkmark"
                           size={16}
                           color={colors.neonCyan}
                           style={{
                              textShadowColor: colors.neonCyan,
                              textShadowRadius: 6,
                           }}
                        />
                     </TouchableOpacity>

                     <TouchableOpacity
                        onPress={handleDeleteData}
                        disabled={isDeletingData}
                        style={[
                           cyberpunkStyles.deleteButton,
                           { opacity: isDeletingData ? 0.6 : 1 },
                        ]}
                     >
                        <LinearGradient
                           colors={[colors.errorDark, colors.cyberBackground]}
                           style={cyberpunkStyles.deleteGradient}
                        >
                           <View style={cyberpunkStyles.deleteContent}>
                              <Ionicons
                                 name="trash"
                                 size={16}
                                 color={colors.neonPink}
                                 style={{
                                    textShadowColor: colors.neonPink,
                                    textShadowRadius: 8,
                                 }}
                              />
                              <Text style={cyberpunkStyles.deleteText}>
                                 {isDeletingData
                                    ? 'DELETING DATA...'
                                    : 'DELETE MY DATA'}
                              </Text>
                           </View>
                        </LinearGradient>
                     </TouchableOpacity>
                  </View>
               </View>
            </ScrollView>
         </LinearGradient>
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

// Cyberpunk styles
const cyberpunkStyles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: colors.cyberBackground,
   },
   backgroundGradient: {
      flex: 1,
   },
   header: {
      marginTop: 60,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 20,
      overflow: 'visible',
   },
   headerGradient: {
      borderRadius: 14,
      paddingVertical: 20,
      paddingHorizontal: 24,
      alignItems: 'center',
      position: 'relative',
   },
   headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.neonCyan,
      fontFamily: 'monospace',
      letterSpacing: 4,
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 15,
   },
   signInText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'monospace',
      textAlign: 'center',
      marginTop: 40,
      letterSpacing: 1,
   },
   scrollView: {
      flex: 1,
   },
   content: {
      padding: 20,
      gap: 24,
   },
   // Profile Card
   profileCard: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 15,
      overflow: 'visible',
   },
   profileGradient: {
      borderRadius: 18,
      padding: 20,
      position: 'relative',
   },
   profileContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
   },
   profileImageContainer: {
      position: 'relative',
      width: 90,
      height: 90,
   },
   profileImageBorder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.neonCyan,
      overflow: 'hidden',
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
   },
   profileImage: {
      width: '100%',
      height: '100%',
   },
   holoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.holoBlue,
      borderRadius: 40,
      opacity: 0.2,
   },
   userInfo: {
      flex: 1,
      gap: 12,
   },
   userInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
   },
   userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.neonCyan,
      fontFamily: 'monospace',
      letterSpacing: 2,
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      flex: 1,
   },
   editButton: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
   },
   editButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
   },
   editButtonText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.cyberBackground,
      fontFamily: 'monospace',
      letterSpacing: 1,
   },
   userEmail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   emailText: {
      fontSize: 14,
      color: colors.matrixGreen,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textShadowColor: colors.matrixGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   },
   // Language Selection
   languageContainer: {
      gap: 12,
   },
   languageSelector: {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 12,
      overflow: 'visible',
   },
   languageGradient: {
      borderRadius: 14,
      position: 'relative',
   },
   languageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
   },
   languageFlag: {
      fontSize: 20,
      marginRight: 12,
   },
   languageText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.neonCyan,
      fontFamily: 'monospace',
      letterSpacing: 2,
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      flex: 1,
   },
   languageOptions: {
      borderTopWidth: 1,
      borderTopColor: colors.neonCyan,
      gap: 2,
   },
   languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
   },
   activeLanguageOption: {
      backgroundColor: colors.holoBlue,
   },
   activeLanguageText: {
      color: colors.matrixGreen,
      textShadowColor: colors.matrixGreen,
      textShadowRadius: 6,
   },
   // Sections
   sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.matrixGreen,
      fontFamily: 'monospace',
      letterSpacing: 3,
      textShadowColor: colors.matrixGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      marginBottom: 12,
   },
   // Actions Section
   actionsSection: {
      gap: 16,
   },
   actionButton: {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.neonPink,
      shadowColor: colors.neonPink,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 15,
      overflow: 'visible',
   },
   actionGradient: {
      borderRadius: 14,
      position: 'relative',
   },
   actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
   },
   actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.holoWhite,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      alignItems: 'center',
      justifyContent: 'center',
   },
   actionText: {
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 2,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   },
   // Legal Section
   legalSection: {
      gap: 16,
   },
   legalLinks: {
      gap: 12,
   },
   legalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: colors.holoWhite,
      position: 'relative',
   },
   legalButtonBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 1,
      borderColor: colors.neonCyan,
      borderRadius: 12,
      opacity: 0.6,
   },
   legalButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.neonCyan,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      flex: 1,
   },
   deleteButton: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.neonPink,
      marginTop: 8,
   },
   deleteGradient: {
      borderRadius: 10,
   },
   deleteContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
   },
   deleteText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.neonPink,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textShadowColor: colors.neonPink,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   },
   // Corner Brackets - Main
   cornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 16,
      height: 16,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderColor: colors.matrixGreen,
   },
   cornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderColor: colors.matrixGreen,
   },
   cornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 16,
      height: 16,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderColor: colors.matrixGreen,
   },
   cornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 16,
      height: 16,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderColor: colors.matrixGreen,
   },
   // Image Corner Brackets
   imageCornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.matrixGreen,
   },
   imageCornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.matrixGreen,
   },
   imageCornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.matrixGreen,
   },
   imageCornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.matrixGreen,
   },
   // Action Corner Brackets
   actionCornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 14,
      height: 14,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.matrixGreen,
   },
   actionCornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 14,
      height: 14,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.matrixGreen,
   },
   actionCornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 14,
      height: 14,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.matrixGreen,
   },
   actionCornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 14,
      height: 14,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.matrixGreen,
   },
});

const styles = StyleSheet.create({
   ipadContent: {
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 40,
   },
});
