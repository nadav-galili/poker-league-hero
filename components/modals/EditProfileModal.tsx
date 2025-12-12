import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

interface EditProfileModalProps {
   visible: boolean;
   onClose: () => void;
   onSubmit: (name: string, imageUri: string | null) => Promise<void>;
   currentName: string;
   currentImage: string | null;
   isLoading?: boolean;
}

export function EditProfileModal({
   visible,
   onClose,
   onSubmit,
   currentName,
   currentImage,
   isLoading = false,
}: EditProfileModalProps) {
   const theme = getTheme('light');
   const { t } = useLocalization();

   const [name, setName] = useState(currentName);
   const [image, setImage] = useState<string | null>(currentImage);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (visible) {
         console.log('🖼️ Modal opened with image:', currentImage);
         setName(currentName);
         setImage(currentImage);
         setError(null);
      }
   }, [visible, currentName, currentImage]);

   const handlePickImage = async () => {
      try {
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
         });

         if (!result.canceled) {
            const newImageUri = result.assets[0].uri;
            console.log('📸 New image picked:', newImageUri);
            setImage(newImageUri);
         }
      } catch (err) {
         console.error('Error picking image:', err);
      }
   };

   const handleSubmit = async () => {
      if (!name.trim()) {
         setError('Name is required');
         return;
      }
      if (name.length < 3) {
         setError('Name must be at least 3 characters');
         return;
      }
      if (name.length > 50) {
         setError('Name must be less than 50 characters');
         return;
      }

      await onSubmit(name, image);
   };

   return (
      <Modal
         visible={visible}
         animationType="fade"
         transparent
         onRequestClose={onClose}
      >
         <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <View className="w-full max-w-sm bg-background border-3 border-border rounded-2xl shadow-shadow shadow-lg overflow-hidden">
               {/* Header */}
               <View className="flex-row items-center justify-between p-4 border-b-3 border-border bg-primary">
                  <Pressable
                     onPress={onClose}
                     disabled={isLoading}
                     className="p-1 active:opacity-70"
                  >
                     <Ionicons name="close" size={24} color={colors.text} />
                  </Pressable>
                  <Text className="text-lg font-bold text-text uppercase tracking-wider">
                     {t('editProfile')}
                  </Text>
                  <View className="w-8" />
               </View>

               {/* Content */}
               <View className="p-6 gap-6 bg-surface">
                  {/* Image Picker */}
                  <View className="items-center gap-4">
                     <View className="relative">
                        <Pressable
                           onPress={handlePickImage}
                           disabled={isLoading}
                           className="w-[150px] h-[150px] rounded-full border-4 border-border overflow-hidden active:opacity-90"
                        >
                           {image ? (
                              <Image
                                 source={{ uri: image }}
                                 style={{ width: '100%', height: '100%' }}
                                 contentFit="cover"
                                 transition={200}
                              />
                           ) : (
                              <View className="w-full h-full items-center justify-center bg-gray-300">
                                 <Ionicons
                                    name="person"
                                    size={48}
                                    color="#9CA3AF"
                                 />
                              </View>
                           )}
                        </Pressable>
                        <Pressable
                           onPress={handlePickImage}
                           disabled={isLoading}
                           className="absolute bottom-0 right-0 bg-primary p-4.5 rounded-full border-3 border-border shadow-sm active:scale-95"
                        >
                           <Ionicons name="camera" size={20} color="#FFFFFF" />
                        </Pressable>
                     </View>
                     <Pressable onPress={handlePickImage} disabled={isLoading}>
                        <Text className="text-sm font-bold text-success underline uppercase tracking-wider">
                           {t('changeImage')}
                        </Text>
                     </Pressable>
                  </View>

                  {/* Name Input */}
                  <View className="gap-2">
                     <Text className="text-xs font-bold text-success uppercase tracking-wider">
                        {t('fullName')}
                     </Text>
                     <TextInput
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-surface text-text font-semibold text-base ${
                           error ? 'border-error' : 'border-border'
                        }`}
                        value={name}
                        onChangeText={(text) => {
                           setName(text);
                           setError(null);
                        }}
                        editable={!isLoading}
                        placeholder={t('fullName')}
                        placeholderTextColor={theme.textMuted}
                     />
                     {error && (
                        <Text className="text-xs text-error mt-1">{error}</Text>
                     )}
                  </View>
               </View>

               {/* Footer */}
               <View className="flex-row justify-between p-4 border-t-2 border-black/5 bg-background gap-4">
                  <View className="flex-1">
                     <AppButton
                        title={t('cancel')}
                        onPress={onClose}
                        color="primary"
                        disabled={isLoading}
                        width="100%"
                        icon="close"
                     />
                  </View>
                  <View className="flex-1">
                     <AppButton
                        title={isLoading ? '...' : t('updateProfile')}
                        onPress={handleSubmit}
                        color="success"
                        disabled={isLoading}
                        width="100%"
                        icon="save"
                     />
                  </View>
               </View>
            </View>
         </View>
      </Modal>
   );
}
