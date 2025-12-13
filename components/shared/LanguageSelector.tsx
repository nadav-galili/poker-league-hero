import { colors } from '@/colors';
import { Language, useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
   Animated,
   Modal,
   Pressable,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from 'react-native';

interface LanguageSelectorProps {
   size?: 'small' | 'medium' | 'large';
}

export function LanguageSelector({ size = 'medium' }: LanguageSelectorProps) {
   const { language, setLanguage, t, isRTL } = useLocalization();
   const [isOpen, setIsOpen] = useState(false);

   const glowAnim = useRef(new Animated.Value(0)).current;

   const languages = [
      { code: 'en' as Language, label: t('english'), flag: '🇺🇸' },
      { code: 'he' as Language, label: t('hebrew'), flag: '🇮🇱' },
   ];

   const currentLanguage = languages.find((lang) => lang.code === language);

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
               toValue: 0.3,
               duration: 2000,
               useNativeDriver: false,
            }),
         ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
   }, [glowAnim]);

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
   });

   const glowRadius = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 8],
   });

   const handleLanguageSelect = async (langCode: Language) => {
      await setLanguage(langCode);
      setIsOpen(false);
   };

   const getSizeStyles = () => {
      switch (size) {
         case 'small':
            return {
               container: cyberpunkStyles.sizeSmall,
               text: cyberpunkStyles.textSmall,
               icon: 14,
               padding: 8,
            };
         case 'medium':
            return {
               container: cyberpunkStyles.sizeMedium,
               text: cyberpunkStyles.textMedium,
               icon: 16,
               padding: 12,
            };
         case 'large':
            return {
               container: cyberpunkStyles.sizeLarge,
               text: cyberpunkStyles.textLarge,
               icon: 18,
               padding: 16,
            };
         default:
            return {
               container: cyberpunkStyles.sizeMedium,
               text: cyberpunkStyles.textMedium,
               icon: 16,
               padding: 12,
            };
      }
   };

   const sizeConfig = getSizeStyles();

   return (
      <>
         <Animated.View
            style={[
               cyberpunkStyles.selectorContainer,
               sizeConfig.container,
               {
                  shadowOpacity: glowOpacity,
                  shadowRadius: glowRadius,
               },
            ]}
         >
            <TouchableOpacity
               onPress={() => setIsOpen(true)}
               activeOpacity={0.8}
            >
               <LinearGradient
                  colors={['#001122', '#000011', '#000000']}
                  style={[
                     cyberpunkStyles.selectorGradient,
                     { padding: sizeConfig.padding },
                  ]}
               >
                  {/* Corner Brackets */}
                  <View style={cyberpunkStyles.cornerTL} />
                  <View style={cyberpunkStyles.cornerTR} />
                  <View style={cyberpunkStyles.cornerBL} />
                  <View style={cyberpunkStyles.cornerBR} />

                  <View
                     style={[
                        cyberpunkStyles.selectorContent,
                        { flexDirection: isRTL ? 'row-reverse' : 'row' },
                     ]}
                  >
                     <Text style={cyberpunkStyles.flagText}>
                        {currentLanguage?.flag}
                     </Text>
                     <Text style={[cyberpunkStyles.labelText, sizeConfig.text]}>
                        {size === 'small'
                           ? language.toUpperCase()
                           : currentLanguage?.label}
                     </Text>
                     <Ionicons
                        name="chevron-down"
                        size={sizeConfig.icon}
                        color={colors.neonCyan}
                        style={{
                           textShadowColor: colors.neonCyan,
                           textShadowRadius: 6,
                        }}
                     />
                  </View>
               </LinearGradient>
            </TouchableOpacity>
         </Animated.View>

         <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsOpen(false)}
         >
            <Pressable
               style={cyberpunkStyles.modalOverlay}
               onPress={() => setIsOpen(false)}
            >
               <Animated.View
                  style={[
                     cyberpunkStyles.modalContainer,
                     {
                        shadowOpacity: glowOpacity,
                        shadowRadius: glowRadius,
                     },
                  ]}
               >
                  <LinearGradient
                     colors={['#001122', '#000011', '#000000']}
                     style={cyberpunkStyles.modalGradient}
                  >
                     {/* Corner Brackets */}
                     <View style={cyberpunkStyles.modalCornerTL} />
                     <View style={cyberpunkStyles.modalCornerTR} />
                     <View style={cyberpunkStyles.modalCornerBL} />
                     <View style={cyberpunkStyles.modalCornerBR} />

                     <Text style={cyberpunkStyles.modalTitle}>
                        {t('language').toUpperCase()}
                     </Text>

                     <View style={cyberpunkStyles.languageOptions}>
                        {languages.map((lang) => (
                           <TouchableOpacity
                              key={lang.code}
                              onPress={() => handleLanguageSelect(lang.code)}
                              style={[
                                 cyberpunkStyles.languageOption,
                                 language === lang.code &&
                                    cyberpunkStyles.activeLanguageOption,
                              ]}
                              activeOpacity={0.8}
                           >
                              <LinearGradient
                                 colors={
                                    language === lang.code
                                       ? [colors.holoBlue, 'transparent']
                                       : ['transparent', 'transparent']
                                 }
                                 style={cyberpunkStyles.optionGradient}
                              >
                                 <View
                                    style={[
                                       cyberpunkStyles.optionContent,
                                       {
                                          flexDirection: isRTL
                                             ? 'row-reverse'
                                             : 'row',
                                       },
                                    ]}
                                 >
                                    <Text style={cyberpunkStyles.optionFlag}>
                                       {lang.flag}
                                    </Text>
                                    <Text
                                       style={[
                                          cyberpunkStyles.optionText,
                                          language === lang.code &&
                                             cyberpunkStyles.activeOptionText,
                                       ]}
                                    >
                                       {lang.label}
                                    </Text>
                                    {language === lang.code && (
                                       <Ionicons
                                          name="checkmark-circle"
                                          size={18}
                                          color={colors.matrixGreen}
                                          style={{
                                             textShadowColor:
                                                colors.matrixGreen,
                                             textShadowRadius: 6,
                                          }}
                                       />
                                    )}
                                 </View>
                              </LinearGradient>
                           </TouchableOpacity>
                        ))}
                     </View>
                  </LinearGradient>
               </Animated.View>
            </Pressable>
         </Modal>
      </>
   );
}

// Cyberpunk styles
const cyberpunkStyles = StyleSheet.create({
   // Selector Container
   selectorContainer: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 10,
      overflow: 'visible',
   },
   selectorGradient: {
      borderRadius: 10,
      position: 'relative',
   },
   selectorContent: {
      alignItems: 'center',
      gap: 8,
   },

   // Size variants
   sizeSmall: {
      minWidth: 80,
   },
   sizeMedium: {
      minWidth: 120,
   },
   sizeLarge: {
      minWidth: 160,
   },

   // Text sizes
   textSmall: {
      fontSize: 12,
      letterSpacing: 1,
   },
   textMedium: {
      fontSize: 14,
      letterSpacing: 1.5,
   },
   textLarge: {
      fontSize: 16,
      letterSpacing: 2,
   },

   // Text styles
   flagText: {
      fontSize: 16,
   },
   labelText: {
      fontWeight: 'bold',
      color: colors.neonCyan,
      fontFamily: 'monospace',
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      flex: 1,
   },

   // Modal styles
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
   },
   modalContainer: {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 15,
      overflow: 'visible',
      minWidth: 200,
   },
   modalGradient: {
      borderRadius: 14,
      padding: 20,
      position: 'relative',
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.matrixGreen,
      fontFamily: 'monospace',
      letterSpacing: 3,
      textAlign: 'center',
      marginBottom: 16,
      textShadowColor: colors.matrixGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
   },

   // Language options
   languageOptions: {
      gap: 8,
   },
   languageOption: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.neonCyan,
      overflow: 'hidden',
   },
   activeLanguageOption: {
      borderColor: colors.matrixGreen,
   },
   optionGradient: {
      padding: 12,
   },
   optionContent: {
      alignItems: 'center',
      gap: 12,
   },
   optionFlag: {
      fontSize: 18,
   },
   optionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.neonCyan,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
      flex: 1,
   },
   activeOptionText: {
      color: colors.matrixGreen,
      textShadowColor: colors.matrixGreen,
      textShadowRadius: 8,
   },

   // Corner Brackets - Main
   cornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.matrixGreen,
   },
   cornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.matrixGreen,
   },
   cornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.matrixGreen,
   },
   cornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.matrixGreen,
   },

   // Modal Corner Brackets
   modalCornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: 16,
      height: 16,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderColor: colors.matrixGreen,
   },
   modalCornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderColor: colors.matrixGreen,
   },
   modalCornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: 16,
      height: 16,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderColor: colors.matrixGreen,
   },
   modalCornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 16,
      height: 16,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderColor: colors.matrixGreen,
   },
});

export default LanguageSelector;
