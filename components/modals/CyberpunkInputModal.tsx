/**
 * Ultra-simple, reliable Cyberpunk Input Modal
 * Minimal implementation focused on input reliability
 */

import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
   Modal,
   Platform,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';

interface CyberpunkInputModalProps {
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
}

export function CyberpunkInputModal({
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
}: CyberpunkInputModalProps) {
   const [isFocused, setIsFocused] = useState(false);

   return (
      <Modal
         visible={visible}
         transparent
         animationType="fade"
         onRequestClose={onClose}
      >
         <View style={styles.backdrop}>
            <View style={styles.modal}>
               {/* Header */}
               <View style={styles.header}>
                  <Text style={styles.title}>{title.toUpperCase()}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                     <Ionicons name="close" size={24} color="#ff073a" />
                  </TouchableOpacity>
               </View>

               {/* Input */}
               <View style={styles.inputSection}>
                  <TextInput
                     style={[
                        styles.textInput,
                        isFocused && styles.textInputFocused,
                     ]}
                     value={value}
                     onChangeText={onChangeText}
                     placeholder={placeholder}
                     placeholderTextColor="#666666"
                     onFocus={() => setIsFocused(true)}
                     onBlur={() => setIsFocused(false)}
                     autoCapitalize="characters"
                     autoCorrect={false}
                     autoFocus={true}
                  />
               </View>

               {/* Buttons */}
               <View style={styles.buttonSection}>
                  <View style={styles.buttonContainer}>
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
                  <View style={styles.buttonContainer}>
                     <AppButton
                        title={isLoading ? 'Loading...' : submitText}
                        onPress={onSubmit}
                        color="success"
                        variant="gradient"
                        disabled={isLoading || !value.trim()}
                        loading={isLoading}
                        width="100%"
                        size="medium"
                     />
                  </View>
               </View>
            </View>
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
   modal: {
      backgroundColor: '#0a0a0a',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      borderWidth: 2,
      borderColor: '#00ffff',
      shadowColor: '#00ffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 20,
   },
   header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
   },
   title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#00ffff',
      letterSpacing: 2,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      flex: 1,
      textAlign: 'center',
   },
   closeButton: {
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ff073a',
   },
   inputSection: {
      marginBottom: 24,
   },
   textInput: {
      backgroundColor: 'rgba(0, 255, 255, 0.1)',
      borderWidth: 2,
      borderColor: '#00ffff',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: '#ffffff',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      textAlign: 'center',
      letterSpacing: 1,
      minHeight: 56,
   },
   textInputFocused: {
      borderColor: '#ff073a',
      backgroundColor: 'rgba(255, 7, 58, 0.1)',
      shadowColor: '#ff073a',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
   },
   buttonSection: {
      flexDirection: 'row',
      gap: 12,
   },
   buttonContainer: {
      flex: 1,
   },
});

CyberpunkInputModal.displayName = 'CyberpunkInputModal';