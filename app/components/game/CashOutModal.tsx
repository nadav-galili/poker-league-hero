import React from 'react';
import {
   Modal,
   ScrollView,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';
import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { GamePlayer } from '@/hooks/useGameData';

interface CashOutModalProps {
   visible: boolean;
   selectedPlayer: GamePlayer | null;
   cashOutAmount: string;
   isProcessing: boolean;
   onClose: () => void;
   onCashOutAmountChange: (amount: string) => void;
   onConfirm: () => void;
}

export const CashOutModal: React.FC<CashOutModalProps> = ({
   visible,
   selectedPlayer,
   cashOutAmount,
   isProcessing,
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
            <View
               className="flex-row items-center justify-between px-5 pt-15 pb-4 border-b-6 border-black"
               style={{ backgroundColor: colors.primary }}
            >
               <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons
                     name="close"
                     size={24}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
               <Text
                  className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: colors.textInverse }}
               >
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
                           className="w-15 h-15 rounded-lg border-2 border-black mb-2"
                           contentFit="cover"
                        />
                        <Text
                           variant="h3"
                           color={theme.text}
                           className="tracking-wide"
                        >
                           {selectedPlayer.fullName}
                        </Text>
                     </View>

                     <Text
                        variant="body"
                        color={theme.text}
                        className="text-center mb-4 leading-5"
                     >
                        {t('enterCashOutAmount')}
                     </Text>

                     <View
                        className="p-4 rounded-xl border-3 border-black mb-4"
                        style={{ backgroundColor: theme.surface }}
                     >
                        <Text
                           variant="h4"
                           color={theme.text}
                           className="tracking-wide mb-2"
                        >
                           {t('cashOutAmount')}
                        </Text>
                        <TextInput
                           className="border-2 border-gray-400 rounded-lg px-3 py-4 text-lg font-semibold text-center mb-2"
                           style={{
                              color: theme.text,
                              borderColor: theme.border,
                           }}
                           value={cashOutAmount}
                           onChangeText={onCashOutAmountChange}
                           placeholder="0.00"
                           placeholderTextColor={theme.textMuted}
                           keyboardType="numeric"
                           autoFocus
                        />
                        <Text
                           variant="captionSmall"
                           color={theme.textMuted}
                           className="text-center"
                        >
                           Current Buy-ins: ₪{selectedPlayer.totalBuyIns}
                        </Text>
                     </View>
                  </>
               )}
            </ScrollView>

            <View
               className="p-4 pb-8 shadow-lg elevation-16"
               style={{ backgroundColor: theme.background }}
            >
               <Button
                  title={
                     isProcessing ? 'Processing...' : t('confirmCashOut')
                  }
                  onPress={onConfirm}
                  variant="primary"
                  size="large"
                  backgroundColor={colors.secondary}
                  disabled={isProcessing || !cashOutAmount.trim()}
                  fullWidth
               />
            </View>
         </View>
      </Modal>
   );
};