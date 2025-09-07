/**
 * My Leagues Header Component
 */

import { colors } from '@/colors';
import Button from '@/components/Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import React from 'react';
import { View } from 'react-native';

interface MyLeaguesHeaderProps {
   onJoinLeague: () => void;
   onCreateLeague: () => void;
}

export function MyLeaguesHeader({
   onJoinLeague,
   onCreateLeague,
}: MyLeaguesHeaderProps) {
   const { t, isRTL } = useLocalization();

   return (
      <View className="pt-14 pb-6 px-5 bg-primary">
         {/* Top Row: Title and Language Selector */}
         <View
            className={`flex-row items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
         >
            <Text
               variant="h1"
               color={colors.textInverse}
               className={`text-2xl font-bold tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}
            >
               {t('myLeagues')}
            </Text>
            <LanguageSelector size="small" />
         </View>

         {/* Action Buttons Row */}
         <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="flex-1 ">
               <Button
                  title={t('join')}
                  onPress={onJoinLeague}
                  variant="outline"
                  size="medium"
                  icon="enter"
                  className="bg-secondary"
                  textColor={colors.textInverse}
               />
            </View>
            <View className="flex-1">
               <Button
                  title={t('create')}
                  onPress={onCreateLeague}
                  variant="primary"
                  size="medium"
                  icon="add-circle"
                  className="bg-success"
                  textColor={colors.text}
               />
            </View>
         </View>
      </View>
   );
}
