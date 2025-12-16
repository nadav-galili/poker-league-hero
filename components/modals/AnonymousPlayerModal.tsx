import { colors, getCyberpunkGradient } from '@/colors';
import { Text as CustomText } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
   Animated,
   Keyboard,
   KeyboardAvoidingView,
   Modal,
   Platform,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   TouchableWithoutFeedback,
   View,
} from 'react-native';

interface AnonymousPlayerModalProps {
   visible: boolean;
   onClose: () => void;
   onAdd: (name: string) => void;
   theme?: 'light' | 'dark';
}

export function AnonymousPlayerModal({
   visible,
   onClose,
   onAdd,
}: AnonymousPlayerModalProps) {
   const { t } = useLocalization();
   const [name, setName] = useState('');
   const [error, setError] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const [isFocused, setIsFocused] = useState(false);
   const inputRef = useRef<TextInput>(null);
   const glowAnim = useRef(new Animated.Value(0)).current;

   // Programmatically focus the input when modal becomes visible
   // This is the reliable way to show keyboard on real devices
   useEffect(() => {
      if (visible) {
         // Small delay to ensure modal is fully rendered before focusing
         const timer = setTimeout(() => {
            inputRef.current?.focus();
         }, 300);
         return () => clearTimeout(timer);
      }
   }, [visible]);

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
         await new Promise((resolve) => setTimeout(resolve, 300));
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
      Keyboard.dismiss();
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
         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
               behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
               style={styles.container}
            >
               <View style={styles.backdrop}>
                  <View style={styles.modalContainer}>
                     <LinearGradient
                        colors={getCyberpunkGradient('dark')}
                        style={styles.gradientContainer}
                     >
                        {/* Header */}
                        <View style={styles.header}>
                           <TouchableOpacity
                              onPress={handleClose}
                              style={styles.closeButton}
                              disabled={isProcessing}
                           >
                              <LinearGradient
                                 colors={['#FF5722', '#FF7043']}
                                 style={styles.closeButtonGradient}
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
                                 styles.titleContainer,
                                 {
                                    shadowOpacity: glowAnim.interpolate({
                                       inputRange: [0, 1],
                                       outputRange: [0.3, 0.8],
                                    }),
                                 },
                              ]}
                           >
                              <CustomText variant="h3" style={styles.title}>
                                 {t('addAnonymousPlayer')}
                              </CustomText>
                           </Animated.View>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                           {/* Anonymous Player Icon */}
                           <View style={styles.iconContainer}>
                              <LinearGradient
                                 colors={['#FF5722', '#FF7043']}
                                 style={styles.iconGradient}
                              >
                                 <Ionicons
                                    name="person-add"
                                    size={32}
                                    color="#000000"
                                 />
                              </LinearGradient>
                           </View>

                           {/* Input Field - Simplified for reliable keyboard behavior */}
                           <View style={styles.inputWrapper}>
                              <Text style={styles.label}>
                                 {t('anonymousPlayerName')}{' '}
                                 <Text style={styles.required}>*</Text>
                              </Text>
                              <View
                                 style={[
                                    styles.inputContainer,
                                    isFocused && styles.inputContainerFocused,
                                    error && styles.inputContainerError,
                                 ]}
                              >
                                 <TextInput
                                    ref={inputRef}
                                    style={styles.input}
                                    value={name}
                                    onChangeText={handleNameChange}
                                    placeholder={t('enterPlayerName')}
                                    placeholderTextColor={colors.textMuted}
                                    returnKeyType="done"
                                    onSubmitEditing={handleAdd}
                                    maxLength={50}
                                    editable={!isProcessing}
                                    keyboardType="default"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    selectionColor={colors.neonCyan}
                                 />
                              </View>
                              {error ? (
                                 <Text style={styles.errorText}>⚠ {error}</Text>
                              ) : null}
                           </View>

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
               </View>
            </KeyboardAvoidingView>
         </TouchableWithoutFeedback>
      </Modal>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
   },
   modalContainer: {
      width: '100%',
      maxWidth: 380,
   },
   gradientContainer: {
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#FF5722',
      shadowColor: '#FF5722',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
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
      borderRadius: 4,
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
   inputWrapper: {
      width: '100%',
   },
   label: {
      color: colors.neonCyan,
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      textShadowColor: colors.shadowNeonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   },
   required: {
      color: colors.error,
   },
   inputContainer: {
      height: 56,
      borderWidth: 2,
      borderColor: colors.borderNeonCyan,
      borderRadius: 8,
      backgroundColor: colors.cyberBackground,
      justifyContent: 'center',
   },
   inputContainerFocused: {
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
   },
   inputContainerError: {
      borderColor: colors.error,
   },
   input: {
      flex: 1,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.neonCyan,
      fontWeight: '600',
   },
   errorText: {
      color: colors.error,
      fontSize: 13,
      marginTop: 8,
      textShadowColor: colors.shadowPink,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
   },
});
