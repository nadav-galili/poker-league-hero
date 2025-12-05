import { colors, getTheme } from '@/colors';
import { BrutalistFormField } from '@/components/forms/BrutalistFormField';
import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
   KeyboardAvoidingView,
   Modal,
   Platform,
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

export function AnonymousPlayerModal({
   visible,
   onClose,
   onAdd,
   theme: themeProp = 'light',
}: AnonymousPlayerModalProps) {
   const theme = getTheme(themeProp);
   const { t } = useLocalization();
   const [name, setName] = useState('');

   const handleAdd = () => {
      if (name.trim()) {
         onAdd(name.trim());
         setName('');
         onClose();
      }
   };

   const handleClose = () => {
      setName('');
      onClose();
   };

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={handleClose}
      >
         <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[
               styles.modalContainer,
               { backgroundColor: theme.background },
            ]}
         >
            {/* Header */}
            <View
               style={[styles.modalHeader, { backgroundColor: colors.primary }]}
            >
               <TouchableOpacity
                  onPress={handleClose}
                  style={styles.modalBackButton}
               >
                  <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
               <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                  {t('addAnonymousPlayer')}
               </Text>
               <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
               <BrutalistFormField
                  label={t('anonymousPlayerName')}
                  placeholder={t('enterPlayerName')}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  required
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                  maxLength={50}
               />

               <AppButton
                  title={t('addAnonymousPlayer')}
                  onPress={handleAdd}
                  disabled={!name.trim()}
                  color="success"
                  size="large"
                  icon="add-circle-outline"
               />
            </View>
         </KeyboardAvoidingView>
      </Modal>
   );
}

const styles = StyleSheet.create({
   modalContainer: {
      flex: 1,
   },
   modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 6,
      borderBottomColor: colors.text,
   },
   modalBackButton: {
      padding: 8,
   },
   modalHeaderTitle: {
      fontSize: 18,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
   },
   placeholder: {
      width: 40,
   },
   content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
   },
});

