/**
 * CyberpunkEditLeagueModal - A futuristic holographic modal for editing league details
 * Features matrix rain, scan lines, neon glow effects, corner brackets, and cyberpunk image picker
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
   Modal,
   TextInput,
   TouchableOpacity,
   View,
   StyleSheet,
} from 'react-native';

interface EditLeagueModalProps {
   visible: boolean;
   onClose: () => void;
   onSubmit: (name: string, imageUri: string | null) => Promise<void>;
   currentName: string;
   currentImage: string | null;
   isLoading?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
   const [isInputFocused, setIsInputFocused] = useState(false);

   // Cyberpunk animations
   const glowAnim = useRef(new Animated.Value(0)).current;
   const matrixAnim = useRef(new Animated.Value(0)).current;
   const scanlineAnim = useRef(new Animated.Value(0)).current;
   const hologramAnim = useRef(new Animated.Value(0)).current;
   const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
   const modalOpacityAnim = useRef(new Animated.Value(0)).current;
   const inputFocusAnim = useRef(new Animated.Value(0)).current;
   const imageGlowAnim = useRef(new Animated.Value(0)).current;
   const errorAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      if (visible) {
         console.log('🖼️ League Modal opened with image:', currentImage);
         setName(currentName);
         setImage(currentImage);
         setError(null);

         // Modal entrance animation
         Animated.parallel([
            Animated.spring(modalScaleAnim, {
               toValue: 1,
               useNativeDriver: true,
               tension: 100,
               friction: 8,
            }),
            Animated.timing(modalOpacityAnim, {
               toValue: 1,
               duration: 300,
               useNativeDriver: true,
            }),
         ]).start();

         // Continuous glow animation
         const glowAnimation = Animated.loop(
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
         );

         // Matrix rain effect
         const matrixAnimation = Animated.loop(
            Animated.sequence([
               Animated.timing(matrixAnim, {
                  toValue: 1,
                  duration: 100,
                  useNativeDriver: true,
               }),
               Animated.timing(matrixAnim, {
                  toValue: 0,
                  duration: 100,
                  useNativeDriver: true,
               }),
               Animated.delay(3000),
            ])
         );

         // Scan line animation
         const scanAnimation = Animated.loop(
            Animated.sequence([
               Animated.timing(scanlineAnim, {
                  toValue: 1,
                  duration: 1500,
                  useNativeDriver: true,
               }),
               Animated.delay(1000),
               Animated.timing(scanlineAnim, {
                  toValue: 0,
                  duration: 100,
                  useNativeDriver: true,
               }),
               Animated.delay(2000),
            ])
         );

         // Holographic flicker
         const hologramAnimation = Animated.loop(
            Animated.sequence([
               Animated.timing(hologramAnim, {
                  toValue: 1,
                  duration: 80,
                  useNativeDriver: true,
               }),
               Animated.timing(hologramAnim, {
                  toValue: 0,
                  duration: 80,
                  useNativeDriver: true,
               }),
               Animated.delay(5000 + Math.random() * 3000),
            ])
         );

         // Image glow animation
         const imageGlowAnimation = Animated.loop(
            Animated.sequence([
               Animated.timing(imageGlowAnim, {
                  toValue: 1,
                  duration: 3000,
                  useNativeDriver: false,
               }),
               Animated.timing(imageGlowAnim, {
                  toValue: 0,
                  duration: 3000,
                  useNativeDriver: false,
               }),
            ])
         );

         glowAnimation.start();
         matrixAnimation.start();
         scanAnimation.start();
         hologramAnimation.start();
         imageGlowAnimation.start();

         return () => {
            glowAnimation.stop();
            matrixAnimation.stop();
            scanAnimation.stop();
            hologramAnimation.stop();
            imageGlowAnimation.stop();
         };
      } else {
         // Reset animations when modal closes
         modalScaleAnim.setValue(0.8);
         modalOpacityAnim.setValue(0);
      }
   }, [visible, currentName, currentImage]);

   useEffect(() => {
      if (error) {
         Animated.sequence([
            Animated.timing(errorAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: false,
            }),
            Animated.timing(errorAnim, {
               toValue: 0,
               duration: 200,
               useNativeDriver: false,
            }),
            Animated.timing(errorAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: false,
            }),
         ]).start();
      }
   }, [error]);

   const handleInputFocus = () => {
      setIsInputFocused(true);
      Animated.timing(inputFocusAnim, {
         toValue: 1,
         duration: 300,
         useNativeDriver: false,
      }).start();
   };

   const handleInputBlur = () => {
      setIsInputFocused(false);
      Animated.timing(inputFocusAnim, {
         toValue: 0,
         duration: 300,
         useNativeDriver: false,
      }).start();
   };

   const handlePickImage = async () => {
      try {
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
         });

         if (!result.canceled) {
            const newImageUri = result.assets[0].uri;
            console.log('📸 New league image picked:', newImageUri);
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
         animationType="none"
         transparent
         onRequestClose={onClose}
      >
         {/* Cyberpunk backdrop with matrix rain */}
         <View style={modalStyles.backdrop}>
            {/* Matrix rain background */}
            <View
               style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
               }}
            >
               {Array.from({ length: 12 }).map((_, i) => (
                  <Animated.View
                     key={`matrix-${i}`}
                     style={{
                        position: 'absolute',
                        left: (i * screenWidth) / 12,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        opacity: matrixAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0.1, 0.8],
                        }),
                     }}
                  >
                     {Array.from({ length: Math.floor(screenHeight / 20) }).map((_, j) => (
                        <Text
                           key={`char-${j}`}
                           style={{
                              position: 'absolute',
                              top: j * 20,
                              color: colors.matrixGreen,
                              fontSize: 12,
                              fontFamily: 'monospace',
                              opacity: Math.random() * 0.8 + 0.2,
                           }}
                        >
                           {String.fromCharCode(Math.floor(Math.random() * 94) + 33)}
                        </Text>
                     ))}
                  </Animated.View>
               ))}
            </View>

            {/* Scan lines overlay */}
            <View
               style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.05,
               }}
            >
               {Array.from({ length: Math.floor(screenHeight / 4) }).map((_, i) => (
                  <View
                     key={`scanline-${i}`}
                     style={{
                        position: 'absolute',
                        top: i * 4,
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: colors.neonCyan,
                     }}
                  />
               ))}
            </View>

            {/* Modal container */}
            <Animated.View
               style={[
                  modalStyles.modalContainer,
                  {
                     transform: [{ scale: modalScaleAnim }],
                     opacity: modalOpacityAnim,
                  },
               ]}
            >
               {/* Outer glow effect */}
               <Animated.View
                  style={{
                     position: 'absolute',
                     inset: -20,
                     borderRadius: 20,
                     shadowColor: colors.neonCyan,
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                     }),
                     shadowRadius: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 35],
                     }),
                     elevation: 25,
                  }}
               />

               {/* Main modal container with holographic glass effect */}
               <LinearGradient
                  colors={[colors.cyberBackground, colors.holoBlue, colors.cyberBackground]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={modalStyles.modalContent}
               >
                  {/* Background glass effect */}
                  <View style={modalStyles.backgroundGlass} />

                  {/* Holographic flicker overlay */}
                  <Animated.View
                     style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: colors.neonPink,
                        opacity: hologramAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0, 0.05],
                        }),
                     }}
                  />

                  {/* Animated scan line */}
                  <Animated.View
                     style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: colors.neonBlue,
                        transform: [{
                           translateY: scanlineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-2, 500],
                           }),
                        }],
                        shadowColor: colors.neonBlue,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        opacity: 0.8,
                     }}
                  />

                  {/* Header */}
                  <View style={modalStyles.header}>
                     {/* Close button with cyberpunk styling */}
                     <TouchableOpacity
                        onPress={onClose}
                        disabled={isLoading}
                        style={modalStyles.closeButton}
                     >
                        <Ionicons
                           name="close"
                           size={20}
                           color={colors.error}
                           style={{
                              textShadowColor: colors.error,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 8,
                           }}
                        />
                        {/* Corner brackets for close button */}
                        <View style={[modalStyles.cornerBracket, modalStyles.closeButtonTopLeft]} />
                        <View style={[modalStyles.cornerBracket, modalStyles.closeButtonTopRight]} />
                        <View style={[modalStyles.cornerBracket, modalStyles.closeButtonBottomLeft]} />
                        <View style={[modalStyles.cornerBracket, modalStyles.closeButtonBottomRight]} />
                     </TouchableOpacity>

                     {/* Title with neon glow */}
                     <Text style={modalStyles.title}>
                        {t('editLeague')}
                     </Text>

                     {/* Data stream indicators */}
                     <View style={modalStyles.dataStream}>
                        <View style={[modalStyles.streamLine, { backgroundColor: colors.neonCyan, width: 20, opacity: 0.6 }]} />
                        <View style={[modalStyles.streamLine, { backgroundColor: colors.neonPink, width: 12, opacity: 0.4, marginTop: 2 }]} />
                        <View style={[modalStyles.streamLine, { backgroundColor: colors.neonGreen, width: 16, opacity: 0.5, marginTop: 2 }]} />
                     </View>
                  </View>

                  {/* Content section */}
                  <View style={modalStyles.contentSection}>
                     {/* Cyberpunk Image Picker */}
                     <View style={{ alignItems: 'center', gap: 16 }}>
                        <View style={{ position: 'relative' }}>
                           {/* Image container with outer glow */}
                           <Animated.View
                              style={{
                                 position: 'absolute',
                                 inset: -6,
                                 borderRadius: 100,
                                 shadowColor: colors.neonCyan,
                                 shadowOffset: { width: 0, height: 0 },
                                 shadowOpacity: imageGlowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.3, 0.8],
                                 }),
                                 shadowRadius: imageGlowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [15, 30],
                                 }),
                                 elevation: 20,
                              }}
                           />

                           {/* Main image container */}
                           <TouchableOpacity
                              onPress={handlePickImage}
                              disabled={isLoading}
                              style={{
                                 width: 160,
                                 height: 160,
                                 borderRadius: 80,
                                 borderWidth: 3,
                                 borderColor: colors.neonCyan,
                                 overflow: 'hidden',
                                 backgroundColor: colors.cyberBackground,
                                 position: 'relative',
                              }}
                           >
                              {image ? (
                                 <Image
                                    source={{ uri: image }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                    transition={200}
                                 />
                              ) : (
                                 <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons
                                       name="trophy"
                                       size={56}
                                       color={colors.neonCyan}
                                       style={{
                                          textShadowColor: colors.shadowNeonCyan,
                                          textShadowOffset: { width: 0, height: 0 },
                                          textShadowRadius: 10,
                                       }}
                                    />
                                 </View>
                              )}

                              {/* Holographic overlay */}
                              <View
                                 style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: colors.holoBlue,
                                    opacity: 0.1,
                                 }}
                              />

                              {/* Corner brackets */}
                              <View style={{ position: 'absolute', top: 8, left: 8 }}>
                                 <View style={{ width: 16, height: 3, backgroundColor: colors.neonCyan }} />
                                 <View style={{ width: 3, height: 16, backgroundColor: colors.neonCyan, marginTop: -3 }} />
                              </View>
                              <View style={{ position: 'absolute', top: 8, right: 8 }}>
                                 <View style={{ width: 16, height: 3, backgroundColor: colors.neonCyan }} />
                                 <View style={{ width: 3, height: 16, backgroundColor: colors.neonCyan, alignSelf: 'flex-end', marginTop: -3 }} />
                              </View>
                              <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
                                 <View style={{ width: 3, height: 16, backgroundColor: colors.neonCyan, marginBottom: -3 }} />
                                 <View style={{ width: 16, height: 3, backgroundColor: colors.neonCyan }} />
                              </View>
                              <View style={{ position: 'absolute', bottom: 8, right: 8 }}>
                                 <View style={{ width: 3, height: 16, backgroundColor: colors.neonCyan, alignSelf: 'flex-end', marginBottom: -3 }} />
                                 <View style={{ width: 16, height: 3, backgroundColor: colors.neonCyan }} />
                              </View>
                           </TouchableOpacity>

                           {/* Cyberpunk camera button */}
                           <TouchableOpacity
                              onPress={handlePickImage}
                              disabled={isLoading}
                              style={{
                                 position: 'absolute',
                                 bottom: 8,
                                 right: 8,
                                 width: 50,
                                 height: 50,
                                 borderRadius: 8,
                                 backgroundColor: colors.cyberBackground,
                                 borderWidth: 2,
                                 borderColor: colors.neonPink,
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 shadowColor: colors.neonPink,
                                 shadowOffset: { width: 0, height: 0 },
                                 shadowOpacity: 0.8,
                                 shadowRadius: 10,
                                 elevation: 15,
                              }}
                           >
                              <Ionicons
                                 name="camera"
                                 size={24}
                                 color={colors.neonPink}
                                 style={{
                                    textShadowColor: colors.shadowNeonPink,
                                    textShadowOffset: { width: 0, height: 0 },
                                    textShadowRadius: 8,
                                 }}
                              />
                              {/* Corner brackets for camera button */}
                              <View style={{ position: 'absolute', top: -2, left: -2, width: 8, height: 2, backgroundColor: colors.neonPink }} />
                              <View style={{ position: 'absolute', top: -2, left: -2, width: 2, height: 8, backgroundColor: colors.neonPink }} />
                              <View style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 2, backgroundColor: colors.neonPink }} />
                              <View style={{ position: 'absolute', top: -2, right: -2, width: 2, height: 8, backgroundColor: colors.neonPink }} />
                           </TouchableOpacity>
                        </View>

                        {/* Change image text */}
                        <TouchableOpacity onPress={handlePickImage} disabled={isLoading}>
                           <Text
                              style={{
                                 fontSize: 14,
                                 fontFamily: 'monospace',
                                 fontWeight: '700',
                                 color: colors.neonGreen,
                                 textTransform: 'uppercase',
                                 letterSpacing: 1.5,
                                 textDecorationLine: 'underline',
                                 textShadowColor: colors.shadowNeonGreen,
                                 textShadowOffset: { width: 0, height: 0 },
                                 textShadowRadius: 8,
                              }}
                           >
                              {t('changeLeagueImage')}
                           </Text>
                        </TouchableOpacity>
                     </View>

                     {/* Cyberpunk Name Input */}
                     <View style={{ gap: 12 }}>
                        {/* Input label */}
                        <Text
                           style={{
                              fontSize: 12,
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              color: colors.neonCyan,
                              textTransform: 'uppercase',
                              letterSpacing: 2,
                              textShadowColor: colors.shadowNeonCyan,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 6,
                           }}
                        >
                           {t('leagueName')}
                        </Text>

                        <View style={{ position: 'relative' }}>
                           {/* Input field outer glow */}
                           <Animated.View
                              style={{
                                 position: 'absolute',
                                 inset: -4,
                                 borderRadius: 16,
                                 shadowColor: error ? colors.error : (isInputFocused ? colors.shadowNeonCyan : colors.shadowNeonGreen),
                                 shadowOffset: { width: 0, height: 0 },
                                 shadowOpacity: error ? errorAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 1.0],
                                 }) : inputFocusAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.3, 0.8],
                                 }),
                                 shadowRadius: inputFocusAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [8, 20],
                                 }),
                                 elevation: 15,
                              }}
                           />

                           {/* Input background gradient */}
                           <LinearGradient
                              colors={[colors.cyberBackground, colors.holoBlue, colors.cyberBackground]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                 position: 'absolute',
                                 inset: 0,
                                 borderRadius: 12,
                                 opacity: 0.2,
                              }}
                           />

                           {/* Input container */}
                           <View
                              style={{
                                 height: 56,
                                 borderWidth: 2,
                                 borderColor: error ? colors.error : (isInputFocused ? colors.neonCyan : colors.borderNeonCyan),
                                 borderRadius: 12,
                                 backgroundColor: colors.cyberBackground,
                                 position: 'relative',
                                 overflow: 'hidden',
                              }}
                           >
                              {/* TextInput */}
                              <TextInput
                                 value={name}
                                 onChangeText={(text) => {
                                    setName(text);
                                    setError(null);
                                 }}
                                 onFocus={handleInputFocus}
                                 onBlur={handleInputBlur}
                                 placeholder={t('leagueName')}
                                 placeholderTextColor={colors.textMuted}
                                 editable={!isLoading}
                                 style={{
                                    flex: 1,
                                    paddingHorizontal: 18,
                                    fontSize: 16,
                                    color: colors.neonCyan,
                                    fontFamily: 'monospace',
                                    fontWeight: '600',
                                    letterSpacing: 1,
                                    textShadowColor: colors.shadowNeonCyan,
                                    textShadowOffset: { width: 0, height: 0 },
                                    textShadowRadius: 8,
                                 }}
                                 selectionColor={colors.neonCyan}
                              />

                              {/* Corner brackets */}
                              <View style={{ position: 'absolute', top: 0, left: 0 }}>
                                 <View style={{ width: 12, height: 3, backgroundColor: error ? colors.error : colors.neonCyan }} />
                                 <View style={{ width: 3, height: 12, backgroundColor: error ? colors.error : colors.neonCyan, marginTop: -3 }} />
                              </View>
                              <View style={{ position: 'absolute', top: 0, right: 0 }}>
                                 <View style={{ width: 12, height: 3, backgroundColor: error ? colors.error : colors.neonCyan }} />
                                 <View style={{ width: 3, height: 12, backgroundColor: error ? colors.error : colors.neonCyan, alignSelf: 'flex-end', marginTop: -3 }} />
                              </View>
                              <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
                                 <View style={{ width: 3, height: 12, backgroundColor: error ? colors.error : colors.neonCyan, marginBottom: -3 }} />
                                 <View style={{ width: 12, height: 3, backgroundColor: error ? colors.error : colors.neonCyan }} />
                              </View>
                              <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
                                 <View style={{ width: 3, height: 12, backgroundColor: error ? colors.error : colors.neonCyan, alignSelf: 'flex-end', marginBottom: -3 }} />
                                 <View style={{ width: 12, height: 3, backgroundColor: error ? colors.error : colors.neonCyan }} />
                              </View>

                              {/* Focus scan line */}
                              {isInputFocused && (
                                 <Animated.View
                                    style={{
                                       position: 'absolute',
                                       left: 0,
                                       right: 0,
                                       height: 1,
                                       backgroundColor: colors.neonBlue,
                                       transform: [{
                                          translateY: inputFocusAnim.interpolate({
                                             inputRange: [0, 1],
                                             outputRange: [0, 56],
                                          }),
                                       }],
                                       shadowColor: colors.neonBlue,
                                       shadowOffset: { width: 0, height: 0 },
                                       shadowOpacity: 1,
                                       shadowRadius: 8,
                                    }}
                                 />
                              )}
                           </View>

                           {/* Side accent indicators */}
                           <View style={{ position: 'absolute', left: -8, top: '50%', width: 4, height: 1, backgroundColor: colors.neonPink, opacity: 0.6 }} />
                           <View style={{ position: 'absolute', right: -8, top: '50%', width: 4, height: 1, backgroundColor: colors.neonGreen, opacity: 0.6 }} />
                        </View>

                        {/* Error message */}
                        {error && (
                           <Animated.View
                              style={{
                                 opacity: errorAnim,
                                 transform: [{
                                    translateX: errorAnim.interpolate({
                                       inputRange: [0, 1],
                                       outputRange: [0, -2],
                                    }),
                                 }],
                              }}
                           >
                              <Text
                                 style={{
                                    fontSize: 12,
                                    color: colors.error,
                                    fontFamily: 'monospace',
                                    fontWeight: '600',
                                    textShadowColor: colors.error,
                                    textShadowOffset: { width: 0, height: 0 },
                                    textShadowRadius: 6,
                                 }}
                              >
                                 {error}
                              </Text>
                           </Animated.View>
                        )}
                     </View>
                  </View>

                  {/* Footer with cyberpunk buttons */}
                  <View
                     style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 20,
                        gap: 16,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderNeonCyan,
                     }}
                  >
                     <AppButton
                        title={t('cancel')}
                        onPress={onClose}
                        color="error"
                        variant="outline"
                        disabled={isLoading}
                        width="48%"
                     />
                     <AppButton
                        title={t('updateLeague')}
                        onPress={handleSubmit}
                        color="success"
                        variant="gradient"
                        disabled={isLoading || !name.trim()}
                        loading={isLoading}
                        width="48%"
                     />
                  </View>

                  {/* Main corner brackets */}
                  <View style={{ position: 'absolute', top: -2, left: -2 }}>
                     <View style={{ width: 20, height: 4, backgroundColor: colors.neonCyan }} />
                     <View style={{ width: 4, height: 20, backgroundColor: colors.neonCyan, marginTop: -4 }} />
                  </View>
                  <View style={{ position: 'absolute', top: -2, right: -2 }}>
                     <View style={{ width: 20, height: 4, backgroundColor: colors.neonCyan }} />
                     <View style={{ width: 4, height: 20, backgroundColor: colors.neonCyan, alignSelf: 'flex-end', marginTop: -4 }} />
                  </View>
                  <View style={{ position: 'absolute', bottom: -2, left: -2 }}>
                     <View style={{ width: 4, height: 20, backgroundColor: colors.neonCyan, marginBottom: -4 }} />
                     <View style={{ width: 20, height: 4, backgroundColor: colors.neonCyan }} />
                  </View>
                  <View style={{ position: 'absolute', bottom: -2, right: -2 }}>
                     <View style={{ width: 4, height: 20, backgroundColor: colors.neonCyan, alignSelf: 'flex-end', marginBottom: -4 }} />
                     <View style={{ width: 20, height: 4, backgroundColor: colors.neonCyan }} />
                  </View>
               </LinearGradient>
            </Animated.View>
         </View>
      </Modal>
   );
}

// Modal-specific styles
const modalStyles = StyleSheet.create({
   backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      paddingHorizontal: 20,
   },
   modalContainer: {
      width: '100%',
      maxWidth: 420,
   },
   modalContent: {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      overflow: 'hidden',
      position: 'relative',
   },
   backgroundGlass: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.cyberBackground,
      opacity: 0.9,
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderNeonCyan,
      position: 'relative',
   },
   closeButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.cyberBackground,
      borderWidth: 2,
      borderColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
   },
   cornerBracket: {
      position: 'absolute',
      backgroundColor: colors.error,
   },
   closeButtonTopLeft: {
      top: -2,
      left: -2,
      width: 8,
      height: 2,
   },
   closeButtonTopRight: {
      top: -2,
      right: -2,
      width: 8,
      height: 2,
   },
   closeButtonBottomLeft: {
      bottom: -2,
      left: -2,
      width: 8,
      height: 2,
   },
   closeButtonBottomRight: {
      bottom: -2,
      right: -2,
      width: 8,
      height: 2,
   },
   title: {
      fontSize: 18,
      fontFamily: 'monospace',
      fontWeight: '700',
      color: colors.neonCyan,
      textTransform: 'uppercase',
      letterSpacing: 2,
      textAlign: 'center',
      flex: 1,
      marginHorizontal: 16,
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 12,
   },
   dataStream: {
      width: 40,
      alignItems: 'flex-end',
   },
   streamLine: {
      height: 1,
   },
   contentSection: {
      padding: 24,
      gap: 24,
   },
});

