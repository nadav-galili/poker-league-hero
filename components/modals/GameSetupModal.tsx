/**
 * GameSetupModal component for configuring game settings before creation
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { AppButton } from '@/components/ui/AppButton';
import { BuyInSelector } from '@/components/ui/BuyInSelector';
import { useLocalization } from '@/context/localization';
import { LeagueMember } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
   Modal,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';

interface GameSetupModalProps {
   visible: boolean;
   selectedPlayers: LeagueMember[];
   buyIn: string;
   isCreatingGame: boolean;
   availableBuyIns?: string[];
   onClose: () => void;
   onCreateGame: () => void;
   onBuyInChange: (value: string) => void;
   leagueName?: string;
   theme?: 'light' | 'dark';
}

export function GameSetupModal({
   visible,
   selectedPlayers,
   buyIn,
   isCreatingGame,
   availableBuyIns = ['50', '100'],
   onClose,
   onCreateGame,
   onBuyInChange,
   leagueName,
   theme: themeProp = 'light',
}: GameSetupModalProps) {
   const theme = getTheme(themeProp);
   const { t } = useLocalization();

   const buyInOptions = availableBuyIns.map((value) => ({
      value,
      label: `₪${value}`,
      displayValue: value,
   }));

   return (
      <Modal
         visible={visible}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <View
            style={[
               styles.modalContainer,
               { backgroundColor: theme.background },
            ]}
         >
            {/* Modal Header */}
            <View
               style={[styles.modalHeader, { backgroundColor: colors.primary }]}
            >
               <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalBackButton}
               >
                  <Ionicons name="close" size={24} color={colors.textInverse} />
               </TouchableOpacity>
               <Text
                  style={[
                     styles.modalHeaderTitle,
                     { color: colors.textInverse },
                  ]}
               >
                  {t('gameSetup')}
               </Text>
               <View style={styles.placeholder} />
            </View>

            <ScrollView
               style={styles.modalContent}
               showsVerticalScrollIndicator={false}
            >
               {/* League Info */}
               {leagueName && (
                  <View
                     style={[
                        styles.infoCard,
                        { backgroundColor: theme.surfaceElevated },
                     ]}
                  >
                     <Text
                        variant="h4"
                        color={theme.text}
                        style={styles.infoLabel}
                     >
                        {t('league')}
                     </Text>
                     <Text variant="body" color={theme.textMuted}>
                        {leagueName}
                     </Text>
                  </View>
               )}

               {/* Selected Players Summary */}
               <View
                  style={[
                     styles.summaryCard,
                     { backgroundColor: theme.surfaceElevated },
                  ]}
               >
                  <Text
                     variant="h3"
                     color={theme.text}
                     style={styles.summaryTitle}
                  >
                     {t('selectedPlayers')} ({selectedPlayers.length})
                  </Text>
                  <View style={styles.selectedPlayersList}>
                     {selectedPlayers.map((member) => (
                        <View key={member.id} style={styles.selectedPlayerItem}>
                           <Image
                              source={{
                                 uri:
                                    member.profileImageUrl ||
                                    'https://via.placeholder.com/30x30/cccccc/666666?text=?',
                              }}
                              style={styles.selectedPlayerImage}
                              contentFit="cover"
                           />
                           <Text
                              variant="body"
                              color={theme.text}
                              style={styles.selectedPlayerName}
                           >
                              {member.fullName}
                           </Text>
                        </View>
                     ))}
                  </View>
               </View>

               {/* Buy-in Selector */}
               <View
                  style={[
                     styles.inputCard,
                     { backgroundColor: theme.surfaceElevated },
                  ]}
               >
                  <Text
                     variant="h4"
                     color={theme.text}
                     style={styles.inputLabel}
                  >
                     {t('buyInAmount')} *
                  </Text>
                  <BuyInSelector
                     selectedBuyIn={buyIn}
                     onBuyInChange={onBuyInChange}
                     options={buyInOptions}
                     variant="horizontal"
                     disabled={isCreatingGame}
                  />
               </View>

               {/* Game Summary */}
               <View
                  style={[
                     styles.summaryCard,
                     { backgroundColor: theme.surfaceElevated },
                  ]}
               >
                  <Text
                     variant="h4"
                     color={theme.text}
                     style={styles.summaryTitle}
                  >
                     {t('gameSummary')}
                  </Text>
                  <View style={styles.summaryRow}>
                     <Text variant="body" color={theme.textMuted}>
                        {t('totalPlayers')}:
                     </Text>
                     <Text
                        variant="body"
                        color={theme.text}
                        style={styles.summaryValue}
                     >
                        {selectedPlayers.length}
                     </Text>
                  </View>
                  <View style={styles.summaryRow}>
                     <Text variant="body" color={theme.textMuted}>
                        {t('buyInPerPlayer')}:
                     </Text>
                     <Text
                        variant="body"
                        color={theme.text}
                        style={styles.summaryValue}
                     >
                        ₪{buyIn}
                     </Text>
                  </View>
                  <View style={styles.summaryRow}>
                     <Text variant="body" color={theme.textMuted}>
                        {t('totalPot')}:
                     </Text>
                     <Text
                        variant="h4"
                        color={colors.primary}
                        style={styles.summaryValue}
                     >
                        ₪{parseInt(buyIn) * selectedPlayers.length}
                     </Text>
                  </View>
               </View>
            </ScrollView>

            {/* Create Game Button */}
            <View className="flex justify-center items-center pb-10 pt-4">
               <AppButton
                  title={isCreatingGame ? t('creatingGame') : t('createGame')}
                  onPress={() => {
                     onCreateGame();
                  }}
                  textColor={colors.text}
                  bgColor={colors.success}
                  disabled={isCreatingGame}
                  width="80%"
               />
            </View>
         </View>
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
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 6,
      borderBottomColor: colors.text,
   },

   modalBackButton: {
      padding: 8,
   },

   modalHeaderTitle: {
      fontSize: 20,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
   },

   placeholder: {
      width: 40,
   },

   modalContent: {
      flex: 1,
      padding: 16,
   },

   infoCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },

   infoLabel: {
      letterSpacing: 1.2,
      marginBottom: 4,
   },

   summaryCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },

   summaryTitle: {
      letterSpacing: 1.2,
      marginBottom: 12,
   },

   selectedPlayersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
   },

   selectedPlayerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryTint,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.primary,
      position: 'relative',
   },

   selectedPlayerImage: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
   },

   selectedPlayerName: {
      letterSpacing: 0.5,
      fontWeight: '600',
   },

   adminBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.warning,
   },

   inputCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },

   inputLabel: {
      letterSpacing: 1,
      marginBottom: 12,
   },

   summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
   },

   summaryValue: {
      fontWeight: '600',
   },

   modalFooter: {
      padding: 16,
      paddingBottom: 32,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 16,
   },
});
