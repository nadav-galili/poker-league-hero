import { colors, getTheme } from '@/colors';
import type { ValidationState } from '@/components/forms/BrutalistFormField';
import {
   BrutalistFormField,
   ClearButton,
} from '@/components/forms/BrutalistFormField';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
// BASE_URL import removed - using relative URLs with fetchWithAuth
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
   Platform,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function CreateLeague() {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();
   const [isLoading, setIsLoading] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      image: null as string | null,
      adminUserEmail: '',
   });
   const [validationStates, setValidationStates] = useState<{
      name: ValidationState;
   }>({
      name: 'idle',
   });
   const [errors, setErrors] = useState<{
      name?: string;
   }>({});
   //get user data from auth context
   const { user, fetchWithAuth } = useAuth();

   // Validation functions
   const validateLeagueName = useCallback((name: string): string | null => {
      if (!name.trim()) {
         return 'League name is required';
      }
      if (name.trim().length < 3) {
         return 'League name must be at least 3 characters';
      }
      if (name.trim().length > 50) {
         return 'League name must be less than 50 characters';
      }
      if (!/^[a-zA-Z0-9\s\-_']+$/.test(name.trim())) {
         return 'League name contains invalid characters';
      }
      return null;
   }, []);

   const handleNameChange = useCallback(
      (text: string) => {
         setFormData((prev) => ({ ...prev, name: text }));

         // Real-time validation
         const error = validateLeagueName(text);
         if (text.length === 0) {
            setValidationStates((prev) => ({ ...prev, name: 'idle' }));
            setErrors((prev) => ({ ...prev, name: undefined }));
         } else if (error) {
            setValidationStates((prev) => ({ ...prev, name: 'error' }));
            setErrors((prev) => ({ ...prev, name: error }));
         } else {
            setValidationStates((prev) => ({ ...prev, name: 'valid' }));
            setErrors((prev) => ({ ...prev, name: undefined }));
         }
      },
      [validateLeagueName]
   );

   const validateForm = useCallback((): boolean => {
      const nameError = validateLeagueName(formData.name);

      setValidationStates({
         name: nameError ? 'error' : 'valid',
      });

      setErrors({
         name: nameError || undefined,
      });

      return !nameError;
   }, [formData.name, validateLeagueName]);
   const handleCreateLeague = async () => {
      try {
         console.log('🏆 Starting league creation...');
         setIsLoading(true);

         if (!user) {
            console.log('❌ No user found');
            captureException(new Error('No user found when creating league'), {
               function: 'handleCreateLeague',
               screen: 'CreateLeague',
            });
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: 'Please login to create a league',
            });
            return;
         }

         console.log('✅ User found:', { email: user.email, id: user.id });

         // Validate form before submission
         if (!validateForm()) {
            console.log('❌ Form validation failed');
            captureException(new Error('Form validation failed'), {
               function: 'handleCreateLeague',
               screen: 'CreateLeague',
               formData: { name: formData.name, hasImage: !!formData.image },
               errors,
            });
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: 'Please fix the form errors',
            });
            return;
         }

         console.log('✅ Form validation passed');
         formData.adminUserEmail = user.email;

         // Upload image to R2 if it's a local file path
         let imageUrl = formData.image;
         console.log('🖼️ Image handling:', { originalImage: imageUrl });

         if (imageUrl && imageUrl.startsWith('file://')) {
            try {
               console.log('📤 Starting image upload...');
               Toast.show({
                  type: 'info',
                  text1: t('uploadingImage'),
                  text2: 'Please wait...',
               });

               const uploadFormData = new FormData();
               const filename = imageUrl.split('/').pop() || 'league-image.jpg';
               const match = /\.(\w+)$/.exec(filename);
               const type = match ? `image/${match[1]}` : `image/jpeg`;

               // On mobile, React Native's fetch can handle file URIs directly
               // when passed in this specific object format.
               if (Platform.OS === 'android' || Platform.OS === 'ios') {
                  const fileData = {
                     uri: imageUrl,
                     name: filename,
                     type,
                  };
                  // The type assertion is necessary because the default FormData type
                  // doesn't account for React Native's file upload object.
                  uploadFormData.append('file', fileData as any);
                  console.log(
                     '📱 Preparing FormData for React Native with file object:',
                     fileData
                  );
               } else {
                  // On web, we fetch the URI to get a Blob, which is the standard way.
                  console.log('🌐 Reading file using fetch (Web)...');
                  const response = await fetch(imageUrl);
                  if (!response.ok) {
                     throw new Error(
                        `Failed to read file for web: ${response.status}`
                     );
                  }
                  const blob = await response.blob();
                  uploadFormData.append('file', blob, filename);
                  console.log('🌐 FormData prepared with blob for web');
               }

               console.log('📤 Uploading to: /api/upload/image');

               // Upload image to R2
               const uploadResponse = await fetchWithAuth('/api/upload/image', {
                  method: 'POST',
                  body: uploadFormData,
                  // Don't set Content-Type for FormData - let the browser/RN handle it
                  // headers: { 'Content-Type': 'multipart/form-data' }, // This can cause issues in RN
               });

               console.log('📤 Upload response status:', uploadResponse.status);

               if (!uploadResponse.ok) {
                  const uploadErrorData = await uploadResponse
                     .json()
                     .catch(() => ({}));
                  console.error('❌ Image upload failed:', {
                     status: uploadResponse.status,
                     error: uploadErrorData,
                  });
                  captureException(new Error('Image upload failed'), {
                     function: 'handleCreateLeague',
                     screen: 'CreateLeague',
                     step: 'image_upload',
                     status: uploadResponse.status,
                     error: uploadErrorData,
                     platform: Platform.OS,
                  });
                  throw new Error(
                     `Failed to upload image: ${uploadErrorData.error || uploadResponse.statusText}`
                  );
               }

               const uploadData = await uploadResponse.json();
               imageUrl = uploadData.url; // Use the R2 URL
               console.log('✅ Image uploaded successfully:', imageUrl);
            } catch (uploadError) {
               console.error('❌ Image upload error:', uploadError);
               captureException(uploadError as Error, {
                  function: 'handleCreateLeague',
                  screen: 'CreateLeague',
                  step: 'image_upload',
                  originalImageUri: formData.image,
                  platform: Platform.OS,
               });
               Toast.show({
                  type: 'error',
                  text1: t('error'),
                  text2: `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`,
               });
               throw uploadError;
            }
         }

         // Clean up form data - use uploaded image URL
         const cleanFormData = {
            ...formData,
            image: imageUrl && imageUrl.trim() ? imageUrl : undefined,
         };

         console.log('🚀 Sending league creation request:', {
            name: cleanFormData.name,
            hasImage: !!cleanFormData.image,
            adminUserEmail: cleanFormData.adminUserEmail,
         });

         //send data to backend using authenticated fetch
         const response = await fetchWithAuth('/api/leagues/create', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanFormData),
         });

         console.log('🚀 League creation response status:', response.status);

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ League creation failed:', {
               status: response.status,
               statusText: response.statusText,
               error: errorData,
            });
            captureException(new Error('League creation API failed'), {
               function: 'handleCreateLeague',
               screen: 'CreateLeague',
               step: 'api_call',
               status: response.status,
               error: errorData,
               requestData: {
                  name: cleanFormData.name,
                  hasImage: !!cleanFormData.image,
                  adminUserEmail: cleanFormData.adminUserEmail,
               },
            });
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: errorData.error || 'Failed to create league',
            });
            throw new Error(
               `Failed to create league: ${errorData.error || response.statusText}`
            );
         }

         const data = await response.json();
         console.log('✅ League created successfully:', data);
         captureException(new Error('League created successfully'), {
            function: 'handleCreateLeague',
            screen: 'CreateLeague',
            step: 'success',
            leagueId: data.league?.id,
            level: 'info',
         });
         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: 'League created successfully',
         });
         router.back();
      } catch (error) {
         console.error('❌ Create league error:', error);
         captureException(error as Error, {
            function: 'handleCreateLeague',
            screen: 'CreateLeague',
            step: 'general_error',
            errorMessage:
               error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
            formData: {
               name: formData.name,
               hasImage: !!formData.image,
               adminUserEmail: formData.adminUserEmail,
            },
         });
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: `Failed to create league: ${error instanceof Error ? error.message : 'Unknown error'}`,
         });
      } finally {
         setIsLoading(false);
      }
   };

   const handleBack = () => {
      router.back();
   };

   const pickImage = async () => {
      try {
         console.log('🖼️ Starting image picker...');

         // According to Expo docs: "No permissions request is necessary for launching the image library"

         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Use the modern format from docs
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
         });

         console.log('📸 Image picker result:', {
            canceled: result.canceled,
            assetsLength: result.assets?.length,
            firstAssetUri: result.assets?.[0]?.uri,
         });

         if (!result.canceled && result.assets[0]) {
            const imageUri = result.assets[0].uri;
            console.log('✅ Image selected:', imageUri);
            setFormData({ ...formData, image: imageUri });

            // Log successful image selection to Sentry
            captureException(new Error('Image selected successfully'), {
               function: 'pickImage',
               screen: 'CreateLeague',
               imageUri,
               level: 'info',
            });
         } else {
            console.log('📸 Image picker canceled or no assets');
         }
      } catch (error) {
         console.error('❌ Error in pickImage:', error);

         // Check if this is the common simulator gallery issue
         const isSimulatorGalleryIssue =
            error instanceof Error &&
            error.message.includes('ActivityNotFoundException') &&
            error.message.includes('android.provider.action.PICK_IMAGES');

         if (isSimulatorGalleryIssue) {
            console.log('🔍 Detected simulator gallery issue');
            Toast.show({
               type: 'info',
               text1: 'Simulator Limitation',
               text2: 'Image picker requires a real device or emulator with Google Play Store',
               visibilityTime: 5000,
            });
         } else {
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: `Failed to pick image: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
         }

         captureException(error as Error, {
            function: 'pickImage',
            screen: 'CreateLeague',
            errorMessage:
               error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
            isSimulatorIssue: isSimulatorGalleryIssue,
         });
      }
   };

   const removeImage = () => {
      setFormData({ ...formData, image: null });
   };
   if (isLoading) {
      return <LoadingState />;
   }

   return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
         {/* Header */}
         <View style={[styles.header, { backgroundColor: colors.secondary }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={colors.text}
               />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
               {t('createLeague')}
            </Text>
            <View style={styles.placeholder} />
         </View>

         <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
         >
            {/* League Name */}
            <BrutalistFormField
               label={t('leagueName')}
               icon="trophy"
               value={formData.name}
               onChangeText={handleNameChange}
               validationState={validationStates.name}
               errorMessage={errors.name}
               successMessage={
                  validationStates.name === 'valid' ? 'Perfect!' : undefined
               }
               placeholder="Enter league name"
               maxLength={50}
               showCharacterCount={true}
               required={true}
               helpText="Choose a unique name for your poker league"
               variant="large"
               rightComponent={
                  formData.name.length > 0 ? (
                     <ClearButton
                        onPress={() => handleNameChange('')}
                        visible={formData.name.length > 0}
                     />
                  ) : undefined
               }
            />

            {/* League Image */}
            <View style={styles.inputGroup}>
               <Text style={[styles.label, { color: theme.text }]}>
                  {t('leagueImage')} (Optional)
               </Text>
               <View style={styles.imageContainer}>
                  {formData.image ? (
                     <View style={styles.imagePreviewContainer}>
                        <Image
                           source={{ uri: formData.image }}
                           style={styles.imagePreview}
                           contentFit="cover"
                        />
                        <TouchableOpacity
                           style={styles.removeImageButton}
                           onPress={removeImage}
                        >
                           <Ionicons
                              name="close-circle"
                              size={24}
                              color={colors.error}
                           />
                        </TouchableOpacity>
                     </View>
                  ) : (
                     <TouchableOpacity
                        style={[
                           styles.imagePickerButton,
                           {
                              backgroundColor: colors.text,
                              borderColor: colors.text,
                           },
                        ]}
                        onPress={pickImage}
                     >
                        <Ionicons
                           name="camera"
                           size={32}
                           color={colors.backgroundGradientEnd}
                        />
                        <Text
                           style={[
                              styles.imagePickerText,
                              { color: colors.backgroundGradientEnd },
                           ]}
                        >
                           {t('selectImage')}
                        </Text>
                     </TouchableOpacity>
                  )}
               </View>
            </View>

            {/* Create Button */}
            <View style={styles.buttonContainer}>
               <AppButton
                  title={t('createLeagueButton')}
                  onPress={handleCreateLeague}
                  color="success"
                  width="100%"
                  icon="add-circle"
               />
            </View>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 6,
      borderBottomColor: colors.text,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
   },
   backButton: {
      padding: 8,
   },
   headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
   },
   placeholder: {
      width: 40,
   },
   content: {
      flex: 1,
   },
   contentContainer: {
      padding: 20,
      paddingBottom: 40,
   },
   inputGroup: {
      marginBottom: 24,
   },
   label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
   },
   input: {
      flex: 1,
      height: 50,
      borderWidth: 4,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingLeft: 48,
      fontSize: 16,
      fontWeight: '600',
      shadowColor: colors.text,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },
   inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
   },
   inputIcon: {
      position: 'absolute',
      left: 16,
      zIndex: 1,
   },

   buttonContainer: {
      marginTop: 32,
   },
   createButton: {
      height: 56,
      shadowColor: colors.text,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
   },
   imageContainer: {
      alignItems: 'center',
   },
   imagePreviewContainer: {
      position: 'relative',
      alignItems: 'center',
   },
   imagePreview: {
      width: 120,
      height: 120,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
   },
   removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.text,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
   },
   imagePickerButton: {
      width: 120,
      height: 120,
      borderRadius: 12,
      borderWidth: 4,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: colors.text,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },
   imagePickerText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
});
