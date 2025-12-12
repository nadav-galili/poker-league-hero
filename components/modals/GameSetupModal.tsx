/**
 * GameSetupModal component - Cyberpunk styled modal for configuring game settings
 * Features neon green matrix theme with holographic effects
 */

import { colors, getCyberpunkGradient } from '@/colors';
import { Text as CustomText } from '@/components/Text';
import { BuyInSelector } from '@/components/ui/BuyInSelector';
import { CyberpunkButton } from '@/components/ui/CyberpunkButton';
import { useLocalization } from '@/context/localization';
import { LeagueMember } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
   Animated,
   Dimensions,
   KeyboardAvoidingView,
   Modal,
   Platform,
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
   anonymousPlayers?: { name: string }[];
   theme?: 'light' | 'dark';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Matrix Rain Component - Game Setup themed
function MatrixRain() {
   const animatedValues = useRef(
      Array.from({ length: 12 }, () => new Animated.Value(0))
   ).current;

   useEffect(() => {
      const animations = animatedValues.map((value, index) =>
         Animated.loop(
            Animated.sequence([
               Animated.delay(index * 150),
               Animated.timing(value, {
                  toValue: 1,
                  duration: 2500 + Math.random() * 1500,
                  useNativeDriver: true,
               }),
            ])
         )
      );

      animations.forEach((anim) => anim.start());
      return () => animations.forEach((anim) => anim.stop());
   }, []);

   return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {animatedValues.map((animValue, index) => (
            <Animated.View
               key={index}
               style={[
                  {
                     position: 'absolute',
                     left: (index * screenWidth) / 12,
                     width: 2,
                     height: screenHeight,
                     backgroundColor: colors.neonGreen, // Game setup green theme
                     opacity: animValue.interpolate({
                        inputRange: [0, 0.3, 0.7, 1],
                        outputRange: [0, 0.15, 0.08, 0],
                     }),
                     transform: [
                        {
                           translateY: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-screenHeight, screenHeight * 1.2],
                           }),
                        },
                     ],
                  },
               ]}
            />
         ))}
      </View>
   );
}

// Corner Brackets Component
function CornerBrackets({ color = colors.neonGreen }: { color?: string }) {
   return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {/* Top Left */}
         <View
            style={[
               styles.cornerBracket,
               styles.topLeft,
               { borderColor: color },
            ]}
         />
         {/* Top Right */}
         <View
            style={[
               styles.cornerBracket,
               styles.topRight,
               { borderColor: color },
            ]}
         />
         {/* Bottom Left */}
         <View
            style={[
               styles.cornerBracket,
               styles.bottomLeft,
               { borderColor: color },
            ]}
         />
         {/* Bottom Right */}
         <View
            style={[
               styles.cornerBracket,
               styles.bottomRight,
               { borderColor: color },
            ]}
         />
      </View>
   );
}

// Holographic Overlay Component
function HolographicOverlay() {
   const scanLineAnim = useRef(new Animated.Value(0)).current;
   const flickerAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      // Continuous scan line animation
      Animated.loop(
         Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
         })
      ).start();

      // Occasional flicker effect
      Animated.loop(
         Animated.sequence([
            Animated.timing(flickerAnim, {
               toValue: 1,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.timing(flickerAnim, {
               toValue: 0,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.delay(5000),
         ])
      ).start();
   }, []);

   return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
         {/* Moving scan line */}
         <Animated.View
            style={[
               {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: colors.neonGreen,
                  opacity: 0.4,
                  shadowColor: colors.neonGreen,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  transform: [
                     {
                        translateY: scanLineAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0, screenHeight],
                        }),
                     },
                  ],
               },
            ]}
         />

         {/* Static horizontal scan lines */}
         {Array.from({ length: 15 }, (_, i) => (
            <View
               key={i}
               style={[
                  {
                     position: 'absolute',
                     left: 0,
                     right: 0,
                     height: 1,
                     top: (i * screenHeight) / 15,
                     backgroundColor: colors.neonGreen,
                     opacity: 0.015,
                  },
               ]}
            />
         ))}

         {/* Flicker overlay */}
         <Animated.View
            style={[
               StyleSheet.absoluteFill,
               {
                  backgroundColor: 'rgba(0, 255, 65, 0.02)',
                  opacity: flickerAnim,
               },
            ]}
         />
      </View>
   );
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
   anonymousPlayers = [],
   theme: themeProp = 'light',
}: GameSetupModalProps) {
   const { t } = useLocalization();
   const glowAnim = useRef(new Animated.Value(0)).current;
   const pulseAnim = useRef(new Animated.Value(0)).current;

   const buyInOptions = availableBuyIns.map((value) => ({
      value,
      label: `₪${value}`,
      displayValue: value,
   }));

   useEffect(() => {
      if (visible) {
         // Title glow animation
         Animated.loop(
            Animated.sequence([
               Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 1500,
                  useNativeDriver: false,
               }),
               Animated.timing(glowAnim, {
                  toValue: 0,
                  duration: 1500,
                  useNativeDriver: false,
               }),
            ])
         ).start();

         // Subtle pulse for cards
         Animated.loop(
            Animated.sequence([
               Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 2000,
                  useNativeDriver: true,
               }),
               Animated.timing(pulseAnim, {
                  toValue: 0,
                  duration: 2000,
                  useNativeDriver: true,
               }),
            ])
         ).start();
      }
   }, [visible, glowAnim, pulseAnim]);

   const handleClose = () => {
      onClose();
   };

   return (
      <Modal
         visible={visible}
         animationType="fade"
         transparent={true}
         onRequestClose={handleClose}
      >
         <View style={modalStyles.backdrop}>
            <KeyboardAvoidingView
               behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
               style={modalStyles.modalContainer}
            >
               <LinearGradient
                  colors={getCyberpunkGradient('matrix')}
                  style={modalStyles.gradientContainer}
               >
                  <MatrixRain />
                  <HolographicOverlay />
                  <CornerBrackets color={colors.neonGreen} />

                  {/* Header */}
                  <View style={modalStyles.header}>
                     <TouchableOpacity
                        onPress={handleClose}
                        style={modalStyles.closeButton}
                        disabled={isCreatingGame}
                     >
                        <LinearGradient
                           colors={[colors.neonGreen, colors.matrixGreenDark]}
                           style={modalStyles.closeButtonGradient}
                        >
                           <Ionicons
                              name="close"
                              size={20}
                              color={colors.cyberBackground}
                           />
                        </LinearGradient>
                     </TouchableOpacity>

                     <Animated.View
                        style={[
                           modalStyles.titleContainer,
                           {
                              shadowOpacity: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0.2, 0.6],
                              }),
                           },
                        ]}
                     >
                        <CustomText variant="h2" style={modalStyles.title}>
                           {t('gameSetup')}
                        </CustomText>
                     </Animated.View>
                  </View>

                  {/* Content */}
                  <ScrollView
                     style={modalStyles.scrollContent}
                     showsVerticalScrollIndicator={false}
                     contentContainerStyle={{ paddingBottom: 20 }}
                  >
                     {/* Selected Players Summary */}
                     <Animated.View
                        style={[
                           modalStyles.cyberpunkCard,
                           {
                              transform: [
                                 {
                                    scale: pulseAnim.interpolate({
                                       inputRange: [0, 1],
                                       outputRange: [1, 1.02],
                                    }),
                                 },
                              ],
                           },
                        ]}
                     >
                        <LinearGradient
                           colors={[
                              'rgba(0, 255, 65, 0.1)',
                              'rgba(0, 0, 0, 0.8)',
                           ]}
                           style={modalStyles.cardGradient}
                        >
                           <CustomText
                              variant="h4"
                              style={modalStyles.cardTitle}
                           >
                              {t('selectedPlayers')} (PLAYERS:{' '}
                              {selectedPlayers.length + anonymousPlayers.length}
                              )
                           </CustomText>

                           <View style={modalStyles.playersGrid}>
                              {selectedPlayers.map((member) => (
                                 <View
                                    key={member.id}
                                    style={modalStyles.playerChip}
                                 >
                                    <LinearGradient
                                       colors={[
                                          colors.neonGreen,
                                          colors.matrixGreenDark,
                                       ]}
                                       style={modalStyles.playerChipGradient}
                                    >
                                       <View
                                          style={
                                             modalStyles.playerImageContainer
                                          }
                                       >
                                          <Image
                                             source={{
                                                uri:
                                                   member.profileImageUrl ||
                                                   'https://via.placeholder.com/30x30/cccccc/666666?text=?',
                                             }}
                                             style={modalStyles.playerImage}
                                             contentFit="cover"
                                          />
                                       </View>
                                       <CustomText
                                          variant="caption"
                                          style={modalStyles.playerName}
                                       >
                                          {member.fullName.toUpperCase()}
                                       </CustomText>
                                    </LinearGradient>
                                 </View>
                              ))}
                              {anonymousPlayers.map((player, index) => (
                                 <View
                                    key={`anon-${index}`}
                                    style={modalStyles.playerChip}
                                 >
                                    <LinearGradient
                                       colors={[colors.neonOrange, '#CC4400']}
                                       style={modalStyles.playerChipGradient}
                                    >
                                       <View
                                          style={
                                             modalStyles.playerImageContainer
                                          }
                                       >
                                          <Image
                                             source={require('@/assets/images/anonymous.webp')}
                                             style={modalStyles.playerImage}
                                             contentFit="cover"
                                          />
                                       </View>
                                       <CustomText
                                          variant="caption"
                                          style={
                                             modalStyles.playerNameAnonymous
                                          }
                                       >
                                          {player.name.toUpperCase()}
                                       </CustomText>
                                    </LinearGradient>
                                 </View>
                              ))}
                           </View>
                        </LinearGradient>
                     </Animated.View>

                     {/* Buy-in Selector */}
                     <View style={modalStyles.cyberpunkCard}>
                        <LinearGradient
                           colors={[
                              'rgba(0, 255, 65, 0.1)',
                              'rgba(0, 0, 0, 0.8)',
                           ]}
                           style={modalStyles.cardGradient}
                        >
                           <CustomText
                              variant="h4"
                              style={modalStyles.cardTitle}
                           >
                              BUY-IN AMOUNT *
                           </CustomText>
                           <View style={modalStyles.buyinContainer}>
                              <BuyInSelector
                                 selectedBuyIn={buyIn}
                                 onBuyInChange={onBuyInChange}
                                 options={buyInOptions}
                                 variant="horizontal"
                                 disabled={isCreatingGame}
                              />
                           </View>
                        </LinearGradient>
                     </View>

                     {/* Game Summary */}
                     <View style={modalStyles.cyberpunkCard}>
                        <LinearGradient
                           colors={[
                              'rgba(0, 255, 65, 0.1)',
                              'rgba(0, 0, 0, 0.8)',
                           ]}
                           style={modalStyles.cardGradient}
                        >
                           <CustomText
                              variant="h4"
                              style={modalStyles.cardTitle}
                           >
                              GAME SUMMARY
                           </CustomText>

                           <View style={modalStyles.summaryGrid}>
                              <View style={modalStyles.summaryItem}>
                                 <CustomText
                                    variant="caption"
                                    style={modalStyles.summaryLabel}
                                 >
                                    TOTAL PLAYERS
                                 </CustomText>
                                 <CustomText
                                    variant="h3"
                                    style={modalStyles.summaryValue}
                                 >
                                    {selectedPlayers.length +
                                       anonymousPlayers.length}
                                 </CustomText>
                              </View>

                              <View style={modalStyles.summaryItem}>
                                 <CustomText
                                    variant="caption"
                                    style={modalStyles.summaryLabel}
                                 >
                                    BUY-IN/PLAYER
                                 </CustomText>
                                 <CustomText
                                    variant="h3"
                                    style={modalStyles.summaryValue}
                                 >
                                    ₪{buyIn}
                                 </CustomText>
                              </View>

                              <View style={modalStyles.summaryItemHighlight}>
                                 <CustomText
                                    variant="caption"
                                    style={modalStyles.summaryLabelHighlight}
                                 >
                                    TOTAL POT
                                 </CustomText>
                                 <CustomText
                                    variant="h2"
                                    style={modalStyles.summaryValueHighlight}
                                 >
                                    ₪
                                    {parseInt(buyIn) *
                                       (selectedPlayers.length +
                                          anonymousPlayers.length)}
                                 </CustomText>
                              </View>
                           </View>
                        </LinearGradient>
                     </View>
                  </ScrollView>

                  {/* Create Game Button */}
                  <View style={modalStyles.buttonContainer}>
                     <CyberpunkButton
                        title={
                           isCreatingGame ? t('creatingGame') : t('createGame')
                        }
                        onPress={onCreateGame}
                        variant="create"
                        size="large"
                        icon="play-circle-outline"
                        disabled={isCreatingGame}
                        loading={isCreatingGame}
                        width="100%"
                     />
                  </View>
               </LinearGradient>
            </KeyboardAvoidingView>
         </View>
      </Modal>
   );
}

const modalStyles = StyleSheet.create({
   backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 20,
   },
   modalContainer: {
      width: '100%',
      maxWidth: '95%',
      height: '85%',
   },
   gradientContainer: {
      flex: 1,
      borderRadius: 0,
      borderWidth: 2,
      borderColor: colors.neonGreen,
      shadowColor: colors.neonGreen,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
      position: 'relative',
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
      borderBottomColor: colors.neonGreen,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
   },
   closeButton: {
      borderRadius: 0,
      borderWidth: 1,
      borderColor: colors.neonGreen,
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
      shadowColor: colors.neonGreen,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 10,
      elevation: 8,
   },
   title: {
      fontSize: 18,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 2,
      textAlign: 'center',
      color: colors.neonGreen,
      textShadowColor: colors.neonGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   scrollContent: {
      flex: 1,
      padding: 20,
   },
   cyberpunkCard: {
      marginBottom: 20,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: colors.neonGreen,
      shadowColor: colors.shadowNeonGreen,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
   },
   cardGradient: {
      padding: 16,
      position: 'relative',
   },
   cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      color: colors.text,
      marginBottom: 16,
      textShadowColor: colors.neonGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   playersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   playerChip: {
      borderRadius: 0,
      borderWidth: 1,
      borderColor: colors.neonGreen,
      overflow: 'hidden',
      marginBottom: 8,
   },
   playerChipGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
   },
   playerImageContainer: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cyberBackground,
      overflow: 'hidden',
   },
   playerImage: {
      width: 24,
      height: 24,
   },
   playerName: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.cyberBackground,
      letterSpacing: 0.5,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   playerNameAnonymous: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.cyberBackground,
      letterSpacing: 0.5,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   buyinContainer: {
      alignItems: 'center',
   },
   summaryGrid: {
      gap: 16,
   },
   summaryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 255, 65, 0.1)',
   },
   summaryItemHighlight: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: 'rgba(0, 255, 65, 0.05)',
      borderWidth: 1,
      borderColor: colors.neonGreen,
      paddingHorizontal: 16,
      marginTop: 8,
   },
   summaryLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   summaryLabelHighlight: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.neonGreen,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      textShadowColor: colors.neonGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
   },
   summaryValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.5,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   summaryValueHighlight: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.neonGreen,
      letterSpacing: 1,
      textShadowColor: colors.neonGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
   },
   buttonContainer: {
      padding: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.neonGreen,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
   },
});

const styles = StyleSheet.create({
   cornerBracket: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderWidth: 2,
   },
   topLeft: {
      top: 12,
      left: 12,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   },
   topRight: {
      top: 12,
      right: 12,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   },
   bottomLeft: {
      bottom: 12,
      left: 12,
      borderRightWidth: 0,
      borderTopWidth: 0,
   },
   bottomRight: {
      bottom: 12,
      right: 12,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   },
});
