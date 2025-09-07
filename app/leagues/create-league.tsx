import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { Text } from '@/components/Text';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
   ScrollView,
   StyleSheet,
   TextInput,
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
   //get user data from auth context
   const { user } = useAuth();
   const handleCreateLeague = async () => {
      try {
         setIsLoading(true);
         if (!user) {
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: 'Please login to create a league',
            });
            return;
         }

         formData.adminUserEmail = user.email;
         if (!formData.name.trim()) {
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: 'Please enter a league name',
            });
            return;
         }

         // TODO: Implement actual league creation API call
         console.log('Creating league:', formData);

         //send data to backend
         const response = await fetch(`${BASE_URL}/api/leagues/create`, {
            method: 'POST',
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            Toast.show({
               type: 'error',
               text1: t('error'),
               text2: 'Failed to create league',
            });
            throw new Error('Failed to create league');
         }

         const data = await response.json();
         console.log('League created:', data);
         Toast.show({
            type: 'success',
            text1: t('success'),
            text2: 'League created successfully',
         });
         router.back();
      } catch (error) {
         console.error('Failed to create league', error);
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: 'Failed to create league',
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
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
         });

         if (!result.canceled && result.assets[0]) {
            setFormData({ ...formData, image: result.assets[0].uri });
         }
      } catch (error) {
         console.error('Error picking image:', error);
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: 'Failed to pick image',
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
                  color={colors.textInverse}
               />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
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
            <View style={styles.inputGroup}>
               <Text style={[styles.label, { color: colors.secondary }]}>
                  {t('leagueName')}
               </Text>
               <View style={styles.inputContainer}>
                  <Ionicons
                     name="trophy"
                     size={20}
                     color={colors.secondary}
                     style={styles.inputIcon}
                  />
                  <TextInput
                     style={[
                        styles.input,
                        {
                           backgroundColor: colors.background,
                           borderColor: colors.secondary,
                           color: theme.text,
                        },
                     ]}
                     value={formData.name}
                     onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                     }
                     placeholder="Enter league name"
                     placeholderTextColor={colors.secondaryTint}
                     maxLength={50}
                  />
               </View>
            </View>

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
                              backgroundColor: colors.highlightTint,
                              borderColor: colors.highlight,
                           },
                        ]}
                        onPress={pickImage}
                     >
                        <Ionicons
                           name="camera"
                           size={32}
                           color={colors.highlight}
                        />
                        <Text
                           style={[
                              styles.imagePickerText,
                              { color: colors.highlight },
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
               <Button
                  title={t('createLeagueButton')}
                  onPress={handleCreateLeague}
                  variant="primary"
                  style={styles.createButton}
                  backgroundColor={colors.accent}
                  textColor={colors.text}
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
      backgroundColor: colors.background,
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
