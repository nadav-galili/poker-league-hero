/**
 * EditLeagueModal - Clean cyberpunk modal for editing league details
 */

import { colors } from '@/colors';
import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
   Animated,
   Dimensions,
   KeyboardAvoidingView,
   Modal,
   Platform,
   Pressable,
   ScrollView,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';

interface EditLeagueModalProps {
   visible: boolean;
   onClose: () => void;
   onSubmit: (name: string, imageUri: string | null) => Promise<void>;
   currentName: string;
   currentImage: string | null;
   isLoading?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function EditLeagueModal({
   visible,
   onClose,
   onSubmit,
   currentName,
   currentImage,
   isLoading = false,
}: EditLeagueModalProps) {
   const { t } = useLocalization();

   const [name, setName] = useState(currentName);
   const [image, setImage] = useState<string | null>(currentImage);
   const [error, setError] = useState<string | null>(null);

   // Animations
   const scaleAnim = useRef(new Animated.Value(0.9)).current;
   const fadeAnim = useRef(new Animated.Value(0)).current;
   const glowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      if (visible) {
         setName(currentName);
         setImage(currentImage);
         setError(null);

         // Entrance animation
         Animated.parallel([
            Animated.spring(scaleAnim, {
               toValue: 1,
               tension: 100,
               friction: 10,
               useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: true,
            }),
         ]).start();

         // Glow animation
         Animated.loop(
            Animated.sequence([
               Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 2000,
                  useNativeDriver: false,
               }),
               Animated.timing(glowAnim, {
                  toValue: 0,
                  duration: 2000,
                  useNativeDriver: false,
               }),
            ])
         ).start();
      } else {
         scaleAnim.setValue(0.9);
         fadeAnim.setValue(0);
      }
   }, [visible, currentName, currentImage, scaleAnim, fadeAnim, glowAnim]);

   const handlePickImage = async () => {
      try {
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
         });

         if (!result.canceled) {
            setImage(result.assets[0].uri);
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

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
   });

   return (
      <Modal
         visible={visible}
         animationType="none"
         transparent
         onRequestClose={onClose}
      >
         <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
         >
            <Pressable
               style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
               }}
               onPress={onClose}
            >
               <Animated.View
                  style={{
                     width: '100%',
                     maxWidth: 420,
                     maxHeight: SCREEN_HEIGHT * 0.85,
                     transform: [{ scale: scaleAnim }],
                     opacity: fadeAnim,
                  }}
               >
                  <Pressable onPress={(e) => e.stopPropagation()}>
                     {/* Outer glow */}
                     <Animated.View
                        style={{
                           position: 'absolute',
                           inset: -15,
                           borderRadius: 20,
                           shadowColor: colors.neonCyan,
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: glowOpacity,
                           shadowRadius: 25,
                           elevation: 20,
                        }}
                     />

                     {/* Modal content */}
                     <LinearGradient
                        colors={[
                           colors.cyberDarkBlue,
                           colors.cyberDarkPurple,
                           colors.cyberBackground,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                           borderRadius: 16,
                           borderWidth: 2,
                           borderColor: colors.neonCyan,
                           overflow: 'hidden',
                           alignSelf: 'stretch',
                        }}
                     >
                        {/* Corner brackets */}
                        <View
                           style={{
                              position: 'absolute',
                              top: -2,
                              left: -2,
                              width: 16,
                              height: 16,
                              borderTopWidth: 3,
                              borderLeftWidth: 3,
                              borderColor: colors.matrixGreen,
                           }}
                        />
                        <View
                           style={{
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              width: 16,
                              height: 16,
                              borderTopWidth: 3,
                              borderRightWidth: 3,
                              borderColor: colors.neonCyan,
                           }}
                        />
                        <View
                           style={{
                              position: 'absolute',
                              bottom: -2,
                              left: -2,
                              width: 16,
                              height: 16,
                              borderBottomWidth: 3,
                              borderLeftWidth: 3,
                              borderColor: colors.neonPink,
                           }}
                        />
                        <View
                           style={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              width: 16,
                              height: 16,
                              borderBottomWidth: 3,
                              borderRightWidth: 3,
                              borderColor: colors.matrixGreen,
                           }}
                        />

                        {/* Header */}
                        <View
                           style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingHorizontal: 20,
                              paddingVertical: 16,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.borderNeonCyan,
                           }}
                        >
                           <TouchableOpacity
                              onPress={onClose}
                              disabled={isLoading}
                              style={{
                                 width: 36,
                                 height: 36,
                                 borderRadius: 8,
                                 backgroundColor: colors.cyberBackground,
                                 borderWidth: 2,
                                 borderColor: colors.error,
                                 alignItems: 'center',
                                 justifyContent: 'center',
                              }}
                           >
                              <Ionicons
                                 name="close"
                                 size={20}
                                 color={colors.error}
                              />
                           </TouchableOpacity>

                           <Text
                              style={{
                                 flex: 1,
                                 fontSize: 18,
                                 fontFamily: 'monospace',
                                 fontWeight: '700',
                                 color: colors.neonCyan,
                                 textTransform: 'uppercase',
                                 letterSpacing: 2,
                                 textAlign: 'center',
                                 marginHorizontal: 16,
                                 textShadowColor: colors.neonCyan,
                                 textShadowOffset: { width: 0, height: 0 },
                                 textShadowRadius: 10,
                              }}
                           >
                              {t('editLeague')}
                           </Text>

                           <View style={{ width: 36 }} />
                        </View>

                        {/* Scrollable content */}
                        <ScrollView
                           style={{
                              maxHeight: SCREEN_HEIGHT * 0.5,
                              flexGrow: 0,
                              flexShrink: 1,
                           }}
                           contentContainerStyle={{
                              padding: 24,
                              gap: 24,
                           }}
                           showsVerticalScrollIndicator={false}
                        >
                           {/* Image picker */}
                           <View style={{ alignItems: 'center', gap: 16 }}>
                              <TouchableOpacity
                                 onPress={handlePickImage}
                                 disabled={isLoading}
                                 style={{ position: 'relative' }}
                              >
                                 {/* Image container */}
                                 <View
                                    style={{
                                       width: 140,
                                       height: 140,
                                       borderRadius: 70,
                                       borderWidth: 3,
                                       borderColor: colors.neonCyan,
                                       overflow: 'hidden',
                                       backgroundColor: colors.cyberBackground,
                                    }}
                                 >
                                    {image ? (
                                       <Image
                                          source={{ uri: image }}
                                          style={{
                                             width: '100%',
                                             height: '100%',
                                          }}
                                          contentFit="cover"
                                          transition={200}
                                       />
                                    ) : (
                                       <View
                                          style={{
                                             flex: 1,
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                          }}
                                       >
                                          <Ionicons
                                             name="trophy"
                                             size={48}
                                             color={colors.neonCyan}
                                          />
                                       </View>
                                    )}
                                 </View>

                                 {/* Camera button */}
                                 <View
                                    style={{
                                       position: 'absolute',
                                       bottom: 4,
                                       right: 4,
                                       width: 40,
                                       height: 40,
                                       borderRadius: 8,
                                       backgroundColor: colors.cyberBackground,
                                       borderWidth: 2,
                                       borderColor: colors.neonPink,
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                    }}
                                 >
                                    <Ionicons
                                       name="camera"
                                       size={20}
                                       color={colors.neonPink}
                                    />
                                 </View>
                              </TouchableOpacity>

                              <TouchableOpacity
                                 onPress={handlePickImage}
                                 disabled={isLoading}
                              >
                                 <Text
                                    style={{
                                       fontSize: 13,
                                       fontFamily: 'monospace',
                                       fontWeight: '700',
                                       color: colors.neonGreen,
                                       textTransform: 'uppercase',
                                       letterSpacing: 1,
                                       textDecorationLine: 'underline',
                                    }}
                                 >
                                    {t('changeLeagueImage')}
                                 </Text>
                              </TouchableOpacity>
                           </View>

                           {/* Name input */}
                           <View style={{ gap: 12 }}>
                              <Text
                                 style={{
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                    fontWeight: '700',
                                    color: colors.neonCyan,
                                    textTransform: 'uppercase',
                                    letterSpacing: 2,
                                 }}
                              >
                                 {t('leagueName')}
                              </Text>

                              <View
                                 style={{
                                    borderWidth: 2,
                                    borderColor: error
                                       ? colors.error
                                       : colors.neonCyan,
                                    borderRadius: 12,
                                    backgroundColor: colors.cyberBackground,
                                    overflow: 'hidden',
                                 }}
                              >
                                 <TextInput
                                    value={name}
                                    onChangeText={(text) => {
                                       setName(text);
                                       setError(null);
                                    }}
                                    placeholder={t('leagueName')}
                                    placeholderTextColor={colors.textMuted}
                                    editable={!isLoading}
                                    style={{
                                       height: 52,
                                       paddingHorizontal: 16,
                                       fontSize: 16,
                                       color: colors.neonCyan,
                                       fontFamily: 'monospace',
                                       fontWeight: '600',
                                    }}
                                    selectionColor={colors.neonCyan}
                                 />

                                 {/* Corner accents */}
                                 <View
                                    style={{
                                       position: 'absolute',
                                       top: 0,
                                       left: 0,
                                       width: 10,
                                       height: 2,
                                       backgroundColor: error
                                          ? colors.error
                                          : colors.matrixGreen,
                                    }}
                                 />
                                 <View
                                    style={{
                                       position: 'absolute',
                                       top: 0,
                                       right: 0,
                                       width: 10,
                                       height: 2,
                                       backgroundColor: error
                                          ? colors.error
                                          : colors.neonCyan,
                                    }}
                                 />
                              </View>

                              {error && (
                                 <Text
                                    style={{
                                       fontSize: 12,
                                       color: colors.error,
                                       fontFamily: 'monospace',
                                       fontWeight: '600',
                                    }}
                                 >
                                    {error}
                                 </Text>
                              )}
                           </View>
                        </ScrollView>

                        {/* Footer */}
                        <View
                           style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 16,
                              gap: 12,
                              borderTopWidth: 1,
                              borderTopColor: colors.borderNeonCyan,
                           }}
                        >
                           <View style={{ flex: 1 }}>
                              <AppButton
                                 title={t('cancel')}
                                 onPress={onClose}
                                 color="error"
                                 variant="outline"
                                 disabled={isLoading}
                                 width="100%"
                                 size="medium"
                              />
                           </View>
                           <View style={{ flex: 1 }}>
                              <AppButton
                                 title={t('updateLeague')}
                                 onPress={handleSubmit}
                                 color="success"
                                 variant="gradient"
                                 disabled={isLoading || !name.trim()}
                                 loading={isLoading}
                                 width="100%"
                                 size="medium"
                              />
                           </View>
                        </View>
                     </LinearGradient>
                  </Pressable>
               </Animated.View>
            </Pressable>
         </KeyboardAvoidingView>
      </Modal>
   );
}
