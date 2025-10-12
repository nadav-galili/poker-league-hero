/**
 * InputModal component for cross-platform text input
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
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
   theme: themeProp = 'light',
}: InputModalProps) {
   const theme = getTheme(themeProp);

   return (
      <Modal
         visible={visible}
         animationType="fade"
         transparent
         onRequestClose={onClose}
      >
         <View style={styles.overlay}>
            <View
               style={[
                  styles.modalContainer,
                  { backgroundColor: theme.background },
               ]}
            >
               {/* Header */}
               <View
                  style={[
                     styles.modalHeader,
                     { backgroundColor: colors.primary },
                  ]}
               >
                  <TouchableOpacity
                     onPress={onClose}
                     style={styles.closeButton}
                     disabled={isLoading}
                  >
                     <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.headerTitle, { color: colors.text }]}>
                     {title}
                  </Text>
                  <View style={styles.placeholder} />
               </View>

               {/* Content */}
               <View style={styles.content}>
                  <TextInput
                     style={[
                        styles.input,
                        {
                           backgroundColor: theme.surface,
                           color: theme.text,
                           borderColor: colors.border,
                        },
                     ]}
                     placeholder={placeholder}
                     placeholderTextColor={theme.textMuted}
                     value={value}
                     onChangeText={onChangeText}
                     autoFocus
                     editable={!isLoading}
                     autoCapitalize="characters"
                  />
               </View>

               {/* Footer */}
               <View style={styles.footer}>
                  <AppButton
                     title={cancelText}
                     onPress={onClose}
                     color="primary"
                     disabled={isLoading}
                     width="100%"
                  />
                  <AppButton
                     title={isLoading ? '...' : submitText}
                     onPress={onSubmit}
                     color="success"
                     disabled={isLoading || !value.trim()}
                     width="100%"
                  />
               </View>
            </View>
         </View>
      </Modal>
   );
}

const styles = StyleSheet.create({
   overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
   },

   modalContainer: {
      width: '85%',
      maxWidth: 400,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
      overflow: 'hidden',
   },

   modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 3,
      borderBottomColor: colors.border,
   },

   closeButton: {
      padding: 4,
   },

   headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
   },

   placeholder: {
      width: 32,
   },

   content: {
      padding: 20,
   },

   input: {
      fontSize: 16,
      fontWeight: '600',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 2,
      textTransform: 'uppercase',
      letterSpacing: 1,
   },

   footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      gap: 12,
   },
});
