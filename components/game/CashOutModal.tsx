import { colors, getTheme } from '@/colors';
import { useLocalization } from '@/context/localization';
import { GamePlayer } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
   Image,
   Modal,
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
   cashOutAmount: string;
   isProcessing: boolean;
   errorMessage?: string;
   onClose: () => void;
   onCashOutAmountChange: (amount: string) => void;
   onConfirm: () => void;
}

const CashOutModal: React.FC<CashOutModalProps> = ({
   visible,
   selectedPlayer,
   cashOutAmount,
   isProcessing,
   errorMessage,
   onClose,
   onCashOutAmountChange,
   onConfirm,
}) => {
   const theme = getTheme('light');
   const { t } = useLocalization();

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-6 border-black bg-[#A78BFA]">
               <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
               <Text className="text-xl font-bold uppercase tracking-wide text-text">
                  {t('confirmCashOut')}
               </Text>
               <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-4">
               {selectedPlayer && (
                  <>
                     <View
                        className="items-center p-4 rounded-xl border-3 border-black mb-4"
                        style={{ backgroundColor: theme.surfaceElevated }}
                     >
                        <Image
                           source={{
                              uri:
                                 selectedPlayer.profileImageUrl ||
                                 'https://via.placeholder.com/50x50/cccccc/666666?text=?',
                           }}
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
                           value={cashOutAmount}
                           onChangeText={onCashOutAmountChange}
                           placeholder="0.00"
                           placeholderTextColor={colors.text}
                           keyboardType="numeric"
                           autoFocus
                        />
                        {errorMessage && (
                           <View className="mb-2 p-2 rounded-lg border-2 border-red-500 bg-red-50">
                              <Text className="text-center font-semibold text-black">
                                 {errorMessage}
                              </Text>
                           </View>
                        )}
                        <Text className="text-center text-text text-md font-bold">
                           Current Buy-ins: {t('currency')}
                           {selectedPlayer.totalBuyIns}
                        </Text>
                     </View>
                  </>
               )}
            </ScrollView>

            <View className="p-4 my-4 pb-8 shadow-lg elevation-16 bg-background">
               {/* <Button
                  title={isProcessing ? 'Processing...' : t('confirmCashOut')}
                  onPress={onConfirm}
                  variant="secondary"
                  size="large"
                  icon="cash-outline"
                  disabled={isProcessing || !cashOutAmount.trim()}
                  fullWidth
                  className="bg-primary"
                  textColor={colors.textInverse}
               /> */}
               <AppButton
                  title={isProcessing ? t('processing') : t('confirmCashOut')}
                  onPress={onConfirm}
                  color="primary"
                  icon="cash-outline"
                  disabled={isProcessing || !cashOutAmount.trim()}
                  width="100%"
               />
            </View>
         </View>
      </Modal>
   );
};

export default CashOutModal;
