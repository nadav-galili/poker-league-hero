import { colors, getCyberpunkGradient } from '@/colors';
import {
   CyberpunkClearButton,
   CyberpunkFormField,
   type ValidationState,
} from '@/components/forms/CyberpunkFormField';
import { CyberpunkImagePicker } from '@/components/forms/CyberpunkImagePicker';
import { CyberpunkButton } from '@/components/ui/CyberpunkButton';
import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
   Animated,
   Dimensions,
   Platform,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const { height: screenHeight } = Dimensions.get('window');

export default function CreateLeague() {
   const { t, isRTL } = useLocalization();
   const [isLoading, setIsLoading] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      image: null as string | null,
      adminUserEmail: '',
   });
   // Use a ref for image to avoid stale closure issues
   const imageRef = useRef<string | null>(null);
   const [validationStates, setValidationStates] = useState<{
      name: ValidationState;
   }>({
      name: 'idle',
   });
   const [errors, setErrors] = useState<{
      name?: string;
   }>({});

   // Animation refs
   const matrixAnim = useRef(new Animated.Value(0)).current;
   const scanlineAnim = useRef(new Animated.Value(0)).current;
   const hologramAnim = useRef(new Animated.Value(0)).current;
   const glowAnim = useRef(new Animated.Value(0)).current;

   //get user data from auth context
   const { user, fetchWithAuth } = useAuth();

   // Initialize cyberpunk animations
   useEffect(() => {
      // Matrix rain effect
      const matrixAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(matrixAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: true,
            }),
            Animated.timing(matrixAnim, {
               toValue: 0,
               duration: 200,
               useNativeDriver: true,
            }),
            Animated.delay(3000),
         ])
      );

      // Scan line effect
      const scanlineAnimation = Animated.loop(
         Animated.timing(scanlineAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
         })
      );

      // Hologram flicker
      const hologramAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(hologramAnim, {
               toValue: 1,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.timing(hologramAnim, {
               toValue: 0,
               duration: 150,
               useNativeDriver: true,
            }),
            Animated.delay(5000),
         ])
      );

      // Continuous glow
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 3000,
               useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 3000,
               useNativeDriver: false,
            }),
         ])
      );

      matrixAnimation.start();
      scanlineAnimation.start();
      hologramAnimation.start();
      glowAnimation.start();

      return () => {
         matrixAnimation.stop();
         scanlineAnimation.stop();
         hologramAnimation.stop();
         glowAnimation.stop();
      };
   }, [matrixAnim, scanlineAnim, hologramAnim, glowAnim]);

   // Validation functions
   const validateLeagueName = useCallback((name: string): string | null => {
      if (!name || !name.trim()) {
         return 'League name is required';
      }
      const trimmedName = name.trim();
      console.log('🚀 ~ CreateLeague ~ trimmedName:', trimmedName);
      if (trimmedName.length < 3) {
         return 'League name must be at least 3 characters';
      }
      if (trimmedName.length > 50) {
         return 'League name must be less than 50 characters';
      }
      // Allow letters, numbers, spaces, hyphens, underscores, periods, commas, apostrophes, ampersands, and parentheses
      if (!/^[a-zA-Z0-9 \-_.,'&()]+$/.test(trimmedName)) {
         return 'League name contains invalid characters';
      }
      return null;
   }, []);

   const handleNameChange = useCallback(
      (text: string) => {
         setFormData((prev) => ({ ...prev, name: text }));

         // Real-time validation
         // Only validate if the trimmed text has content (don't validate intermediate states like single space)
         if (text.trim().length === 0) {
            setValidationStates((prev) => ({ ...prev, name: 'idle' }));
            setErrors((prev) => ({ ...prev, name: undefined }));
         } else {
            const error = validateLeagueName(text);
            if (error) {
               setValidationStates((prev) => ({ ...prev, name: 'error' }));
               setErrors((prev) => ({ ...prev, name: error }));
            } else {
               setValidationStates((prev) => ({ ...prev, name: 'valid' }));
               setErrors((prev) => ({ ...prev, name: undefined }));
            }
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

         // Upload image to R2 if it's a local file path
         // Use ref to get the current image (avoids stale closure issues)
         let imageUrl = imageRef.current;
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

         // Clean up form data - use uploaded image URL and add admin email
         const cleanFormData = {
            name: formData.name,
            image: imageUrl && imageUrl.trim() ? imageUrl : undefined,
            adminUserEmail: user.email,
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
         // Navigate to the leagues list
         router.replace('/(tabs)/my-leagues');
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
      // Navigate to the leagues list if there's no previous screen
      router.replace('/(tabs)/my-leagues');
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
            imageRef.current = imageUri; // Store in ref for immediate access
            setFormData((prev) => ({ ...prev, image: imageUri }));

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
      imageRef.current = null;
      setFormData((prev) => ({ ...prev, image: null }));
   };
   if (isLoading) {
      return (
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            style={{ flex: 1 }}
         >
            <View className="flex-1 items-center justify-center">
               <CyberpunkLoader size="large" variant="matrix" />
               <Text
                  className="font-mono font-bold text-lg tracking-widest uppercase mt-6"
                  style={{
                     color: colors.textNeonGreen,
                     textShadowColor: colors.shadowNeonGreen,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 10,
                  }}
               >
                  INITIALIZING LEAGUE PROTOCOL...
               </Text>
            </View>
         </LinearGradient>
      );
   }

   return (
      <View className="flex-1">
         {/* Cyberpunk Background */}
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            style={{ position: 'absolute', inset: 0 }}
         />

         {/* Matrix Grid Overlay */}
         <View
            className="absolute inset-0 opacity-10"
            style={{
               backgroundColor: 'transparent',
               backgroundImage: `linear-gradient(${colors.neonCyan}22 1px, transparent 1px), linear-gradient(90deg, ${colors.neonCyan}22 1px, transparent 1px)`,
               backgroundSize: '20px 20px',
            }}
         />

         {/* Scan Lines */}
         <Animated.View
            className="absolute left-0 right-0 h-0.5"
            style={{
               backgroundColor: colors.neonCyan,
               opacity: 0.3,
               transform: [
                  {
                     translateY: scanlineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, screenHeight],
                     }),
                  },
               ],
               shadowColor: colors.shadowNeonCyan,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 1,
               shadowRadius: 10,
            }}
         />

         {/* Holographic Flicker Overlay */}
         <Animated.View
            className="absolute inset-0 bg-white"
            style={{
               opacity: hologramAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.03],
               }),
            }}
         />

         {/* Header */}
         <Animated.View
            className="flex-row items-center justify-between px-5 py-4 border-b-2"
            style={{
               borderBottomColor: colors.neonCyan,
               backgroundColor: colors.cyberBackground,
               shadowColor: colors.shadowNeonCyan,
               shadowOffset: { width: 0, height: 8 },
               shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
               }),
               shadowRadius: 20,
               elevation: 20,
            }}
         >
            {/* Back Button */}
            <TouchableOpacity
               onPress={handleBack}
               className="p-2 rounded-xl border-2"
               style={{
                  backgroundColor: colors.cyberBackground,
                  borderColor: colors.neonCyan,
               }}
            >
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={colors.neonCyan}
                  style={{
                     textShadowColor: colors.shadowNeonCyan,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 10,
                  }}
               />
               {/* Corner brackets for back button */}
               <View className="absolute -top-1 -left-1">
                  <View
                     style={{
                        width: 12,
                        height: 3,
                        backgroundColor: colors.neonCyan,
                     }}
                  />
                  <View
                     style={{
                        width: 3,
                        height: 12,
                        backgroundColor: colors.neonCyan,
                        marginTop: -3,
                     }}
                  />
               </View>
               <View className="absolute -top-1 -right-1">
                  <View
                     style={{
                        width: 12,
                        height: 3,
                        backgroundColor: colors.neonCyan,
                     }}
                  />
                  <View
                     style={{
                        width: 3,
                        height: 12,
                        backgroundColor: colors.neonCyan,
                        alignSelf: 'flex-end',
                        marginTop: -3,
                     }}
                  />
               </View>
            </TouchableOpacity>

            {/* Header Title */}
            <View className="flex-row items-center">
               <Text
                  className="font-mono font-bold text-xl tracking-widest uppercase"
                  style={{
                     color: colors.textNeonCyan,
                     textShadowColor: colors.shadowNeonCyan,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 15,
                  }}
               >
                  {t('createLeague')}
               </Text>
               {/* Header corner brackets */}
               <View className="ml-3 flex-row">
                  <View
                     style={{
                        width: 16,
                        height: 3,
                        backgroundColor: colors.neonCyan,
                     }}
                  />
                  <View
                     style={{
                        width: 3,
                        height: 16,
                        backgroundColor: colors.neonCyan,
                        marginTop: -3,
                        marginLeft: -3,
                     }}
                  />
               </View>
            </View>

            {/* Placeholder for symmetry */}
            <View style={{ width: 48 }} />
         </Animated.View>

         <ScrollView
            className="flex-1"
            contentContainerStyle={{
               padding: 20,
               paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
         >
            {/* League Name Field */}
            <CyberpunkFormField
               label={t('leagueName')}
               icon="trophy"
               value={formData.name}
               onChangeText={handleNameChange}
               validationState={validationStates.name}
               errorMessage={errors.name}
               successMessage={
                  validationStates.name === 'valid'
                     ? 'PROTOCOL VERIFIED!'
                     : undefined
               }
               placeholder="Enter league designation..."
               maxLength={50}
               showCharacterCount={true}
               required={true}
               helpText="Choose a unique identifier for your poker league matrix"
               variant="large"
               rightComponent={
                  formData.name.length > 0 ? (
                     <CyberpunkClearButton
                        onPress={() => handleNameChange('')}
                        visible={formData.name.length > 0}
                     />
                  ) : undefined
               }
            />

            {/* League Image Picker */}
            <CyberpunkImagePicker
               imageUri={formData.image}
               onPickImage={pickImage}
               onRemoveImage={removeImage}
               label={`${t('leagueImage')} (Optional)`}
               size="large"
               style={{ marginBottom: 32 }}
            />

            {/* Create Button */}
            <View className="mt-8">
               <CyberpunkButton
                  title={t('createLeagueButton')}
                  onPress={handleCreateLeague}
                  variant="create"
                  size="large"
                  icon="add-circle"
                  loading={isLoading}
                  width="100%"
               />
            </View>
         </ScrollView>

         {/* Matrix Rain Effects */}
         <Animated.View
            className="absolute top-0 left-4 w-px h-full opacity-20"
            style={{
               backgroundColor: colors.matrixGreen,
               opacity: matrixAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
               }),
               shadowColor: colors.shadowNeonGreen,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 1,
               shadowRadius: 8,
            }}
         />
         <Animated.View
            className="absolute top-0 right-8 w-px h-full opacity-20"
            style={{
               backgroundColor: colors.neonCyan,
               opacity: matrixAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
               }),
               shadowColor: colors.shadowNeonCyan,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 1,
               shadowRadius: 8,
            }}
         />

         {/* Corner Interface Elements */}
         <View className="absolute top-20 left-5">
            <View
               style={{
                  width: 20,
                  height: 4,
                  backgroundColor: colors.neonPink,
                  opacity: 0.6,
               }}
            />
            <View
               style={{
                  width: 4,
                  height: 20,
                  backgroundColor: colors.neonPink,
                  marginTop: -4,
                  opacity: 0.6,
               }}
            />
         </View>

         <View className="absolute top-20 right-5">
            <View
               style={{
                  width: 20,
                  height: 4,
                  backgroundColor: colors.neonBlue,
                  opacity: 0.6,
               }}
            />
            <View
               style={{
                  width: 4,
                  height: 20,
                  backgroundColor: colors.neonBlue,
                  alignSelf: 'flex-end',
                  marginTop: -4,
                  opacity: 0.6,
               }}
            />
         </View>

         <View className="absolute bottom-20 left-5">
            <View
               style={{
                  width: 4,
                  height: 20,
                  backgroundColor: colors.neonOrange,
                  marginBottom: -4,
                  opacity: 0.6,
               }}
            />
            <View
               style={{
                  width: 20,
                  height: 4,
                  backgroundColor: colors.neonOrange,
                  opacity: 0.6,
               }}
            />
         </View>

         <View className="absolute bottom-20 right-5">
            <View
               style={{
                  width: 4,
                  height: 20,
                  backgroundColor: colors.neonGreen,
                  alignSelf: 'flex-end',
                  marginBottom: -4,
                  opacity: 0.6,
               }}
            />
            <View
               style={{
                  width: 20,
                  height: 4,
                  backgroundColor: colors.neonGreen,
                  opacity: 0.6,
               }}
            />
         </View>
      </View>
   );
}

// All styles are now implemented using NativeWind classes and inline styles
// for the cyberpunk aesthetic with proper corner brackets, matrix effects,
// and neon glow animations
