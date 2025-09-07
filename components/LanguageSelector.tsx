import { colors, getTheme } from '@/colors';
import { Language, useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from './Text';

interface LanguageSelectorProps {
   size?: 'small' | 'medium' | 'large';
}

export function LanguageSelector({ size = 'medium' }: LanguageSelectorProps) {
   const { language, setLanguage, t, isRTL } = useLocalization();
   const [isOpen, setIsOpen] = useState(false);
   const theme = getTheme('light');

   const languages = [
      { code: 'en' as Language, label: t('english'), flag: '🇺🇸' },
      { code: 'he' as Language, label: t('hebrew'), flag: '🇮🇱' },
   ];

   const currentLanguage = languages.find((lang) => lang.code === language);

   const getSizeClasses = () => {
      switch (size) {
         case 'small':
            return 'px-1.5 py-1 rounded border-2 min-w-[70px]';
         case 'medium':
            return 'p-3 rounded-lg border-[3px]';
         case 'large':
            return 'p-4 rounded-[10px] border-4';
         default:
            return 'p-3 rounded-lg border-[3px]';
      }
   };

   const handleLanguageSelect = async (langCode: Language) => {
      await setLanguage(langCode);
      setIsOpen(false);
   };

   const sizeClasses = getSizeClasses();

   return (
      <>
         <Pressable
            className={`bg-accent items-center justify-center elevation-2 active:scale-95 active:translate-x-0.5 active:translate-y-0.5 ${sizeClasses}`}
            style={({ pressed }) => ({
               backgroundColor: colors.accent,
               borderColor: theme.border,
               shadowColor: theme.shadow,
               shadowOffset: { width: 4, height: 4 },
               shadowOpacity: 1,
               shadowRadius: 0,
               ...(pressed && {
                  shadowOffset: { width: 2, height: 2 },
               }),
            })}
            onPress={() => setIsOpen(true)}
         >
            <View
               className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
               <Text className="text-base">{currentLanguage?.flag}</Text>
               <Text
                  variant="labelSmall"
                  color={colors.text}
                  className="tracking-wider"
               >
                  {size === 'small'
                     ? language.toUpperCase()
                     : currentLanguage?.label}
               </Text>
               <Ionicons
                  name="chevron-down"
                  size={size === 'small' ? 14 : 16}
                  color={colors.text}
                  className={isRTL ? 'mr-1' : 'ml-1'}
               />
            </View>
         </Pressable>

         <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsOpen(false)}
         >
            <Pressable
               className="flex-1 bg-black/50 items-center justify-center p-5"
               onPress={() => setIsOpen(false)}
            >
               <View
                  className="rounded-xl border-4 p-5 min-w-[200px] elevation-4"
                  style={{
                     backgroundColor: theme.surfaceElevated,
                     borderColor: colors.border,
                     shadowColor: colors.shadow,
                     shadowOffset: { width: 8, height: 8 },
                     shadowOpacity: 1,
                     shadowRadius: 0,
                  }}
               >
                  <Text
                     variant="h4"
                     color={theme.text}
                     className="text-center mb-4 tracking-wide"
                  >
                     {t('language')}
                  </Text>

                  {languages.map((lang) => (
                     <Pressable
                        key={lang.code}
                        className={`rounded-lg border-2 mb-2 p-3 active:scale-[0.98]`}
                        style={({ pressed }) => ({
                           backgroundColor:
                              language === lang.code
                                 ? colors.primaryTint
                                 : 'transparent',
                           borderColor: theme.border,
                        })}
                        onPress={() => handleLanguageSelect(lang.code)}
                     >
                        <View
                           className={`flex-row items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                           <Text className="text-xl">{lang.flag}</Text>
                           <Text
                              variant="body"
                              color={
                                 language === lang.code
                                    ? colors.primary
                                    : theme.text
                              }
                              className="flex-1 tracking-wider"
                           >
                              {lang.label}
                           </Text>
                           {language === lang.code && (
                              <Ionicons
                                 name="checkmark-circle"
                                 size={20}
                                 color={colors.primary}
                                 className={isRTL ? 'mr-2' : 'ml-2'}
                              />
                           )}
                        </View>
                     </Pressable>
                  ))}
               </View>
            </Pressable>
         </Modal>
      </>
   );
}

export default LanguageSelector;
