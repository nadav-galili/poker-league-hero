import { getCyberpunkGradient } from '@/colors';
import { CyberpunkFormField } from '@/components/forms/CyberpunkFormField';
import { Text as CustomText } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
   Animated,
   Dimensions,
   KeyboardAvoidingView,
   Modal,
   Platform,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';

interface AnonymousPlayerModalProps {
   visible: boolean;
   onClose: () => void;
   onAdd: (name: string) => void;
   theme?: 'light' | 'dark';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Matrix Rain Component
function MatrixRain() {
   const animatedValues = useRef(
      Array.from({ length: 8 }, () => new Animated.Value(0))
   ).current;

   useEffect(() => {
      const animations = animatedValues.map((value, index) =>
         Animated.loop(
            Animated.sequence([
               Animated.delay(index * 200),
               Animated.timing(value, {
                  toValue: 1,
                  duration: 3000 + Math.random() * 2000,
                  useNativeDriver: true,
               }),
            ])
         )
      );

      animations.forEach((anim) => anim.start());
      return () => animations.forEach((anim) => anim.stop());
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {animatedValues.map((animValue, index) => (
            <Animated.View
               key={index}
               style={[
                  {
                     position: 'absolute',
                     left: (index * screenWidth) / 8,
                     width: 2,
                     height: screenHeight,
                     backgroundColor: '#FF5722', // Neon orange for anonymous
                     opacity: animValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.3, 0],
                     }),
                     transform: [
                        {
                           translateY: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-screenHeight, screenHeight],
                           }),
                        },
                     ],
                  },
               ]}
            />
         ))}
      </View>
   );
}

// Corner Brackets Component
function CornerBrackets({ color = '#FF5722' }: { color?: string }) {
   return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {/* Top Left */}
         <View
            style={[
               styles.cornerBracket,
               styles.topLeft,
               { borderColor: color },
            ]}
         />
         {/* Top Right */}
         <View
            style={[
               styles.cornerBracket,
               styles.topRight,
               { borderColor: color },
            ]}
         />
         {/* Bottom Left */}
         <View
            style={[
               styles.cornerBracket,
               styles.bottomLeft,
               { borderColor: color },
            ]}
         />
         {/* Bottom Right */}
         <View
            style={[
               styles.cornerBracket,
               styles.bottomRight,
               { borderColor: color },
            ]}
         />
      </View>
   );
}

// Holographic Overlay Component
function HolographicOverlay() {
   const scanLineAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      Animated.loop(
         Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
         })
      ).start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {/* Scan Lines */}
         <Animated.View
            style={[
               {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: '#FF5722',
                  opacity: 0.6,
                  shadowColor: '#FF5722',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  transform: [
                     {
                        translateY: scanLineAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0, screenHeight],
                        }),
                     },
                  ],
               },
            ]}
         />

         {/* Static horizontal lines */}
         {Array.from({ length: 20 }, (_, i) => (
            <View
               key={i}
               style={[
                  {
                     position: 'absolute',
                     left: 0,
                     right: 0,
                     height: 1,
                     top: (i * screenHeight) / 20,
                     backgroundColor: '#FF5722',
                     opacity: 0.05,
                  },
               ]}
            />
         ))}
      </View>
   );
}

export function AnonymousPlayerModal({
   visible,
   onClose,
   onAdd,
   theme: themeProp = 'light',
}: AnonymousPlayerModalProps) {
   const { t } = useLocalization();
   const [name, setName] = useState('');
   const [error, setError] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const glowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      if (visible) {
         Animated.loop(
            Animated.sequence([
               Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 1000,
                  useNativeDriver: false,
               }),
               Animated.timing(glowAnim, {
                  toValue: 0,
                  duration: 1000,
                  useNativeDriver: false,
               }),
            ])
         ).start();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [visible]);

   const handleAdd = async () => {
      if (!name.trim()) {
         setError(t('nameRequired'));
         return;
      }

      if (name.trim().length < 2) {
         setError(t('nameTooShort'));
         return;
      }

      setIsProcessing(true);
      setError('');

      try {
         await new Promise((resolve) => setTimeout(resolve, 300)); // Brief processing animation
         onAdd(name.trim());
         setName('');
         onClose();
      } catch {
         setError(t('errorAddingPlayer'));
      } finally {
         setIsProcessing(false);
      }
   };

   const handleClose = () => {
      setName('');
      setError('');
      setIsProcessing(false);
      onClose();
   };

   const handleNameChange = (text: string) => {
      setName(text);
      if (error) setError('');
   };

   return (
      <Modal
         visible={visible}
         animationType="fade"
         transparent={true}
         onRequestClose={handleClose}
      >
         <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
         >
            <View style={modalStyles.backdrop}>
               <ScrollView
                  contentContainerStyle={modalStyles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
               >
                  <View style={modalStyles.modalContainer}>
                     <LinearGradient
                        colors={getCyberpunkGradient('dark')}
                        style={modalStyles.gradientContainer}
                     >
                        <MatrixRain />
                        <HolographicOverlay />
                        <CornerBrackets color="#FF5722" />

                        {/* Header */}
                        <View style={modalStyles.header}>
                           <TouchableOpacity
                              onPress={handleClose}
                              style={modalStyles.closeButton}
                              disabled={isProcessing}
                           >
                              <LinearGradient
                                 colors={['#FF5722', '#FF7043']}
                                 style={modalStyles.closeButtonGradient}
                              >
                                 <Ionicons
                                    name="close"
                                    size={20}
                                    color="#000000"
                                 />
                              </LinearGradient>
                           </TouchableOpacity>

                           <Animated.View
                              style={[
                                 modalStyles.titleContainer,
                                 {
                                    shadowOpacity: glowAnim.interpolate({
                                       inputRange: [0, 1],
                                       outputRange: [0.3, 0.8],
                                    }),
                                 },
                              ]}
                           >
                              <CustomText
                                 variant="h3"
                                 style={modalStyles.title}
                              >
                                 {t('addAnonymousPlayer')}
                              </CustomText>
                           </Animated.View>
                        </View>

                        {/* Content */}
                        <View style={modalStyles.content}>
                           {/* Anonymous Player Icon */}
                           <View style={modalStyles.iconContainer}>
                              <LinearGradient
                                 colors={['#FF5722', '#FF7043']}
                                 style={modalStyles.iconGradient}
                              >
                                 <Ionicons
                                    name="person-add"
                                    size={32}
                                    color="#000000"
                                 />
                              </LinearGradient>
                           </View>

                           <CyberpunkFormField
                              label={t('anonymousPlayerName')}
                              placeholder={t('enterPlayerName')}
                              value={name}
                              onChangeText={handleNameChange}
                              autoFocus
                              required
                              returnKeyType="done"
                              onSubmitEditing={handleAdd}
                              maxLength={50}
                              errorMessage={error}
                              validationState={error ? 'error' : 'idle'}
                              editable={!isProcessing}
                              keyboardType="default"
                              autoCapitalize="words"
                              autoCorrect={false}
                           />

                           <AppButton
                              title={
                                 isProcessing
                                    ? t('processing')
                                    : t('addAnonymousPlayer')
                              }
                              onPress={handleAdd}
                              disabled={!name.trim() || isProcessing}
                              color="primary"
                              variant="gradient"
                              size="large"
                              loading={isProcessing}
                           />
                        </View>
                     </LinearGradient>
                  </View>
               </ScrollView>
            </View>
         </KeyboardAvoidingView>
      </Modal>
   );
}

const modalStyles = StyleSheet.create({
   backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
   },
   scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
   },
   modalContainer: {
      width: '100%',
      maxWidth: 380,
   },
   gradientContainer: {
      borderRadius: 0,
      borderWidth: 2,
      borderColor: '#FF5722',
      shadowColor: '#FF5722',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
      position: 'relative',
      overflow: 'hidden',
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: '#FF5722',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
   },
   closeButton: {
      borderRadius: 0,
      borderWidth: 1,
      borderColor: '#FF5722',
      overflow: 'hidden',
   },
   closeButtonGradient: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
   },
   titleContainer: {
      flex: 1,
      alignItems: 'center',
      shadowColor: '#FF5722',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 8,
      elevation: 5,
   },
   title: {
      fontSize: 16,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      textAlign: 'center',
      color: '#FF5722',
      textShadowColor: '#FF5722',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   },
   content: {
      padding: 24,
      alignItems: 'center',
      gap: 20,
   },
   iconContainer: {
      borderRadius: 50,
      borderWidth: 2,
      borderColor: '#FF5722',
      overflow: 'hidden',
      shadowColor: '#FF5722',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 8,
   },
   iconGradient: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
   },
   input: {
      width: '100%',
   },
   addButton: {
      width: '100%',
      marginTop: 8,
   },
});

const styles = StyleSheet.create({
   cornerBracket: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderWidth: 2,
   },
   topLeft: {
      top: 10,
      left: 10,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   },
   topRight: {
      top: 10,
      right: 10,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   },
   bottomLeft: {
      bottom: 10,
      left: 10,
      borderRightWidth: 0,
      borderTopWidth: 0,
   },
   bottomRight: {
      bottom: 10,
      right: 10,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   },
});
