import { colors, getTheme } from '@/colors';
import { useLocalization } from '@/context/localization';
import { GamePlayer } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
   Image,
   Keyboard,
   KeyboardAvoidingView,
   Modal,
   Platform,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';
import { AppButton } from '../ui/AppButton';

interface CashOutModalProps {
   visible: boolean;
   selectedPlayer: GamePlayer | null;
   cashOutAmount: string; // Initial value from parent
   isProcessing: boolean;
   errorMessage?: string;
   onClose: () => void;
   onConfirm: (amount: string) => void;
}

const CashOutModal: React.FC<CashOutModalProps> = ({
   visible,
   selectedPlayer,
   cashOutAmount: initialCashOutAmount,
   isProcessing,
   errorMessage,
   onClose,
   onConfirm,
}) => {
   const theme = getTheme('light');
   const { t } = useLocalization();
   const [localAmount, setLocalAmount] = useState(initialCashOutAmount);
   const [isLocalProcessing, setIsLocalProcessing] = useState(false);

   // Sync local state when modal becomes visible or initial value changes
   useEffect(() => {
      if (visible) {
         setLocalAmount(initialCashOutAmount);
         setIsLocalProcessing(false);
      }
   }, [visible, initialCashOutAmount]);

   // Reset local loading if an error occurs
   useEffect(() => {
      if (errorMessage) {
         setIsLocalProcessing(false);
      }
   }, [errorMessage]);

   const handleConfirm = () => {
      if (!localAmount.trim() || isLocalProcessing || isProcessing) return;

      // Set local processing first for instant UI feedback
      setIsLocalProcessing(true);

      // Dismiss keyboard immediately
      Keyboard.dismiss();

      // Use a small delay before calling the parent confirm.
      // This allows the local state update (setIsLocalProcessing) to render
      // before the heavy parent GameScreen re-render blocks the JS thread.
      setTimeout(() => {
         onConfirm(localAmount);
      }, 100);
   };

   const effectiveProcessing = isProcessing || isLocalProcessing;

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.background }}
         >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-6 border-black bg-[#A78BFA]">
               <TouchableOpacity
                  onPress={onClose}
                  className="p-2"
                  disabled={effectiveProcessing}
               >
                  <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
               <Text className="text-xl font-bold uppercase tracking-wide text-text">
                  {t('confirmCashOut')}
               </Text>
               <View className="w-10" />
            </View>

            <ScrollView className="p-4" keyboardShouldPersistTaps="always">
               {selectedPlayer && (
                  <>
                     <View
                        className="items-center p-4 rounded-xl border-3 border-black mb-4"
                        style={{ backgroundColor: theme.surfaceElevated }}
                     >
                        <Image
                           source={
                              !selectedPlayer.userId
                                 ? require('@/assets/images/anonymous.webp')
                                 : {
                                      uri:
                                         selectedPlayer.profileImageUrl ||
                                         'https://via.placeholder.com/50x50/cccccc/666666?text=?',
                                   }
                           }
                           className="rounded-lg border-2 border-primary mb-2 w-24 h-24"
                        />
                        <Text className="text-xl tracking-wide text-text">
                           {selectedPlayer.fullName}
                        </Text>
                     </View>

                     <Text className="text-center mb-4 leading-5 text-xl text-text">
                        {t('enterCashOutAmount')}
                     </Text>

                     <View className="p-4 rounded-xl border-3 border-primary mb-4 bg-primaryTint">
                        <Text className="text-xl tracking-wide mb-2 text-text font-bold">
                           {t('cashOutAmount')}
                        </Text>
                        <TextInput
                           className="border-2 border-gray-400 rounded-lg px-3 py-8 text-md font-semibold text-center mb-2 text-text"
                           value={localAmount}
                           onChangeText={setLocalAmount}
                           placeholder="0.00"
                           placeholderTextColor={colors.text}
                           keyboardType="numeric"
                           autoFocus
                           returnKeyType="done"
                           onSubmitEditing={handleConfirm}
                           editable={!effectiveProcessing}
                        />
                        {errorMessage && (
                           <View className="mb-2 p-2 rounded-lg border-2 border-red-500 bg-red-50">
                              <Text className="text-center font-semibold text-black">
                                 {errorMessage}
                              </Text>
                           </View>
                        )}
                        <Text className="text-center text-text text-md font-bold mb-4">
                           Current Buy-ins: {t('currency')}
                           {selectedPlayer.totalBuyIns}
                        </Text>

                        <AppButton
                           title={
                              effectiveProcessing
                                 ? t('processing')
                                 : t('confirmCashOut')
                           }
                           onPress={handleConfirm}
                           color="primary"
                           icon="cash-outline"
                           disabled={effectiveProcessing || !localAmount.trim()}
                           loading={effectiveProcessing}
                           width="100%"
                        />
                     </View>
                  </>
               )}
            </ScrollView>
         </KeyboardAvoidingView>
      </Modal>
   );
};

export default CashOutModal;
