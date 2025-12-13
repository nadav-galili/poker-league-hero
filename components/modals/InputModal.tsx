/**
 * InputModal component with clean cyberpunk design
 */

import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
   Animated,
   Modal,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';

interface InputModalProps {
   visible: boolean;
   title: string;
   placeholder: string;
   value: string;
   onChangeText: (text: string) => void;
   onClose: () => void;
   onSubmit: () => void;
   submitText: string;
   cancelText: string;
   isLoading?: boolean;
   theme?: 'light' | 'dark';
}

export function InputModal({
   visible,
   title,
   placeholder,
   value,
   onChangeText,
   onClose,
   onSubmit,
   submitText,
   cancelText,
   isLoading = false,
}: InputModalProps) {
   const glowAnim = useRef(new Animated.Value(0)).current;
   const [isFocused, setIsFocused] = useState(false);

   useEffect(() => {
      if (visible) {
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
         glowAnimation.start();
         return () => glowAnimation.stop();
      }
   }, [visible, glowAnim]);

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
   });

   const glowRadius = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 20],
   });

   return (
      <Modal
         visible={visible}
         animationType="fade"
         transparent
         onRequestClose={onClose}
      >
         <View style={styles.backdrop}>
            {/* Cyberpunk Modal Container */}
            <Animated.View
               style={[
                  styles.modalContainer,
                  {
                     shadowOpacity: glowOpacity,
                     shadowRadius: glowRadius,
                  },
               ]}
            >
               <LinearGradient
                  colors={['#001122', '#000011', '#000000']}
                  style={styles.modalContent}
               >
                  {/* Corner Brackets */}
                  <View style={styles.cornerTopLeft} pointerEvents="none" />
                  <View style={styles.cornerTopRight} pointerEvents="none" />
                  <View style={styles.cornerBottomLeft} pointerEvents="none" />
                  <View style={styles.cornerBottomRight} pointerEvents="none" />

                  {/* Header */}
                  <View style={styles.header}>
                     <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        disabled={isLoading}
                     >
                        <Ionicons name="close" size={24} color="#FF0040" />
                     </TouchableOpacity>
                     <Text style={styles.title}>{title.toUpperCase()}</Text>
                     <View style={styles.headerSpacer} />
                  </View>

                  {/* Input Section */}
                  <View style={styles.inputSection}>
                     <View
                        style={[
                           styles.inputContainer,
                           isFocused && styles.inputContainerFocused,
                        ]}
                     >
                        <TextInput
                           style={styles.input}
                           placeholder={placeholder}
                           placeholderTextColor="#666"
                           value={value}
                           onChangeText={onChangeText}
                           onFocus={() => setIsFocused(true)}
                           onBlur={() => setIsFocused(false)}
                           editable={!isLoading}
                           autoCapitalize="none"
                           blurOnSubmit={false}
                           keyboardType="default"
                           returnKeyType="done"
                        />
                        {/* Input Corner Brackets */}
                        <View
                           style={styles.inputCornerTL}
                           pointerEvents="none"
                        />
                        <View
                           style={styles.inputCornerTR}
                           pointerEvents="none"
                        />
                        <View
                           style={styles.inputCornerBL}
                           pointerEvents="none"
                        />
                        <View
                           style={styles.inputCornerBR}
                           pointerEvents="none"
                        />
                     </View>
                  </View>

                  {/* Buttons */}
                  <View style={styles.buttonsContainer}>
                     <View style={styles.buttonWrapper}>
                        <AppButton
                           title={cancelText}
                           onPress={onClose}
                           color="error"
                           variant="outline"
                           disabled={isLoading}
                           width="100%"
                           size="medium"
                        />
                     </View>
                     <View style={styles.buttonWrapper}>
                        <AppButton
                           title={isLoading ? 'Loading...' : submitText}
                           onPress={onSubmit}
                           color="success"
                           variant="gradient"
                           disabled={isLoading || !value.trim()}
                           width="100%"
                           loading={isLoading}
                           size="medium"
                        />
                     </View>
                  </View>
               </LinearGradient>
            </Animated.View>
         </View>
      </Modal>
   );
}

const styles = StyleSheet.create({
   backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
   },
   modalContainer: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#00FFFF',
      shadowColor: '#00FFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 20,
   },
   modalContent: {
      borderRadius: 14,
      padding: 24,
      position: 'relative',
   },
   // Corner brackets
   cornerTopLeft: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 20,
      height: 20,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderColor: '#00FFFF',
   },
   cornerTopRight: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 20,
      height: 20,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderColor: '#00FFFF',
   },
   cornerBottomLeft: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 20,
      height: 20,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderColor: '#00FFFF',
   },
   cornerBottomRight: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 20,
      height: 20,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderColor: '#00FFFF',
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
   },
   closeButton: {
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FF0040',
   },
   title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#00FFFF',
      fontFamily: 'monospace',
      letterSpacing: 2,
      textShadowColor: '#00FFFF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
   },
   headerSpacer: {
      width: 40,
   },
   inputSection: {
      marginBottom: 24,
   },
   inputContainer: {
      position: 'relative',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#00FFFF',
      backgroundColor: 'rgba(0, 255, 255, 0.05)',
      paddingHorizontal: 16,
      paddingVertical: 12,
   },
   inputContainerFocused: {
      borderColor: '#FF00FF',
      backgroundColor: 'rgba(255, 0, 255, 0.05)',
      shadowColor: '#FF00FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
   },
   input: {
      fontSize: 16,
      color: '#00FFFF',
      fontFamily: 'monospace',
      fontWeight: '600',
      letterSpacing: 1,
      textAlign: 'center',
      minHeight: 40,
      height: 40,
      padding: 0,
      margin: 0,
      backgroundColor: 'transparent',
      borderWidth: 0,
   },
   // Input corner brackets
   inputCornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: '#00FF41',
   },
   inputCornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: '#00FF41',
   },
   inputCornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: '#00FF41',
   },
   inputCornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: '#00FF41',
   },
   buttonsContainer: {
      flexDirection: 'row',
      gap: 12,
   },
   buttonWrapper: {
      flex: 1,
   },
});
