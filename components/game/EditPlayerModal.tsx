import { colors, getTheme } from '@/colors';
import { useLocalization } from '@/context/localization';
import { GamePlayer } from '@/hooks/useGameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
   Image,
   Modal,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from 'react-native';
import { CyberpunkButton } from '../ui/CyberpunkButton';

interface EditPlayerModalProps {
   visible: boolean;
   selectedPlayer: GamePlayer | null;
   buyInAmount: string;
   cashOutAmount: string;
   isProcessing: boolean;
   errorMessage?: string;
   onClose: () => void;
   onBuyInAmountChange: (amount: string) => void;
   onCashOutAmountChange: (amount: string) => void;
   onConfirm: () => void;
}

const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
   visible,
   selectedPlayer,
   buyInAmount,
   cashOutAmount,
   isProcessing,
   errorMessage,
   onClose,
   onBuyInAmountChange,
   onCashOutAmountChange,
   onConfirm,
}) => {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <View
            className="flex-1"
            style={{ backgroundColor: colors.cyberBackground }}
         >
            {/* Cyberpunk Header */}
            <LinearGradient
               colors={[
                  colors.cyberBackground,
                  colors.cyberDarkBlue,
                  colors.cyberBackground,
               ]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.headerGradient}
            >
               <View style={styles.cornerTopLeft} />
               <View style={styles.cornerTopRight} />

               <View className="flex-row items-center justify-between px-5 pt-15 pb-4">
                  <TouchableOpacity
                     onPress={onClose}
                     style={styles.cyberpunkButton}
                  >
                     <LinearGradient
                        colors={[colors.neonBlue, colors.neonCyan]}
                        style={styles.buttonGradient}
                     >
                        <Ionicons
                           name="close"
                           size={24}
                           color={colors.neonCyan}
                        />
                     </LinearGradient>
                     <View
                        style={[
                           styles.buttonGlow,
                           { shadowColor: colors.neonBlue },
                        ]}
                     />
                  </TouchableOpacity>

                  <View style={styles.titleContainer}>
                     <Text
                        className="text-lg font-mono font-bold uppercase tracking-widest"
                        style={{
                           color: colors.neonCyan,
                           textShadowColor: colors.shadowNeonCyan,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 10,
                        }}
                     >
                        {t('editPlayerAmounts')}
                     </Text>
                     <View style={styles.scanLine} />
                  </View>

                  <View className="w-10" />
               </View>

               <View style={styles.headerBorder} />
            </LinearGradient>

            <ScrollView className="flex-1 p-4">
               {selectedPlayer && (
                  <>
                     <View
                        className="items-center p-4 rounded-xl border-3 border-neonCyan mb-4"
                        style={{
                           backgroundColor: colors.cyberDarkBlue,
                           borderColor: colors.neonCyan,
                        }}
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
                           className="rounded-lg border-2 border-neonCyan mb-2 w-24 h-24"
                           style={{ borderColor: colors.neonCyan }}
                        />
                        <Text
                           className="text-xl tracking-wide font-mono font-bold uppercase"
                           style={{ color: colors.neonCyan }}
                        >
                           {selectedPlayer.fullName}
                        </Text>
                     </View>

                     <Text
                        className="text-center mb-4 leading-5 text-base font-mono"
                        style={{ color: colors.textMuted }}
                     >
                        {t('editPlayerAmountsDescription')}
                     </Text>

                     {/* Buy-In Amount */}
                     <View
                        className="p-4 rounded-xl border-3 mb-4"
                        style={{
                           backgroundColor: colors.cyberDarkBlue,
                           borderColor: colors.neonBlue,
                        }}
                     >
                        <Text
                           className="text-lg tracking-wide mb-2 font-mono font-bold uppercase"
                           style={{ color: colors.neonBlue }}
                        >
                           {t('totalBuyIns')}
                        </Text>
                        <TextInput
                           className="border-2 rounded-lg px-3 py-4 text-lg font-mono font-bold text-center mb-2"
                           style={{
                              borderColor: colors.neonBlue,
                              backgroundColor: colors.cyberBackground,
                              color: colors.neonCyan,
                           }}
                           value={buyInAmount}
                           onChangeText={onBuyInAmountChange}
                           placeholder="0.00"
                           placeholderTextColor={colors.textMuted}
                           keyboardType="numeric"
                           autoFocus
                        />
                        <Text
                           className="text-center text-sm font-mono"
                           style={{ color: colors.textMuted }}
                        >
                           {t('currentAmount')}: {t('currency')}
                           {selectedPlayer.totalBuyIns}
                        </Text>
                     </View>

                     {/* Buyout Amount */}
                     <View
                        className="p-4 rounded-xl border-3 mb-4"
                        style={{
                           backgroundColor: colors.cyberDarkBlue,
                           borderColor: colors.neonCyan,
                        }}
                     >
                        <Text
                           className="text-lg tracking-wide mb-2 font-mono font-bold uppercase"
                           style={{ color: colors.neonCyan }}
                        >
                           {t('buyout')}
                        </Text>
                        <Text
                           className="text-xs tracking-wide mb-2 font-mono"
                           style={{ color: colors.textMuted }}
                        >
                           {t('buyoutDescription')}
                        </Text>
                        <TextInput
                           className="border-2 rounded-lg px-3 py-4 text-lg font-mono font-bold text-center mb-2"
                           style={{
                              borderColor: colors.neonCyan,
                              backgroundColor: colors.cyberBackground,
                              color: colors.neonCyan,
                           }}
                           value={cashOutAmount}
                           onChangeText={onCashOutAmountChange}
                           placeholder="0.00"
                           placeholderTextColor={colors.textMuted}
                           keyboardType="numeric"
                        />
                        <Text
                           className="text-center text-sm font-mono"
                           style={{ color: colors.textMuted }}
                        >
                           {t('currentAmount')}: {t('currency')}
                           {selectedPlayer.totalBuyOuts}
                        </Text>
                     </View>

                     {errorMessage && (
                        <View
                           className="mb-4 p-3 rounded-lg border-2"
                           style={{
                              borderColor: colors.errorGradientEnd,
                              backgroundColor: colors.cyberDarkBlue,
                           }}
                        >
                           <Text
                              className="text-center font-mono font-semibold"
                              style={{ color: colors.errorGradientEnd }}
                           >
                              {errorMessage}
                           </Text>
                        </View>
                     )}
                  </>
               )}
            </ScrollView>

            <View className="p-4 my-4 pb-8">
               <CyberpunkButton
                  title={
                     isProcessing ? t('processing') : t('updatePlayerAmounts')
                  }
                  onPress={onConfirm}
                  variant="join"
                  size="large"
                  icon="checkmark-circle"
                  disabled={isProcessing || !buyInAmount.trim() || !cashOutAmount.trim()}
                  width="100%"
               />
            </View>
         </View>
      </Modal>
   );
};

const styles = StyleSheet.create({
   headerGradient: {
      borderBottomWidth: 2,
      borderBottomColor: colors.neonBlue,
      position: 'relative',
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 12,
   },
   cornerTopLeft: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 20,
      height: 3,
      backgroundColor: colors.neonCyan,
   },
   cornerTopRight: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 20,
      height: 3,
      backgroundColor: colors.neonCyan,
   },
   titleContainer: {
      alignItems: 'center',
      position: 'relative',
   },
   scanLine: {
      position: 'absolute',
      bottom: -2,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.neonCyan,
      opacity: 0.7,
   },
   cyberpunkButton: {
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
   },
   buttonGradient: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.neonCyan,
   },
   buttonGlow: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
   },
   headerBorder: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.neonBlue,
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 6,
   },
});

export default EditPlayerModal;

