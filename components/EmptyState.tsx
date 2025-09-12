/**
 * Empty State Component for My Leagues
 */

import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EmptyStateProps {
   onCreateLeague: () => void;
   onJoinLeague: () => void;
}

export function EmptyState({ onCreateLeague, onJoinLeague }: EmptyStateProps) {
   const { t } = useLocalization();

   return (
      <View className="items-center justify-center gap-3 flex-col px-4 py-6">
         <Text className="text-4xl font-extrabold  tracking-wide">
            {t('noLeaguesYet')}
         </Text>
         <Text
            variant="body"
            className="text-base font-medium tracking-wide 
         text-center
         "
         >
            {t('createFirstLeague')}
         </Text>

         <View className="gap-3 flex-col w-full">
            <Button
               title={t('createLeague')}
               onPress={onCreateLeague}
               variant="primary"
               size="large"
               className="bg-secondary w-full text-center"
               icon="add-circle"
               fullWidth
            />
            <Button
               title={t('joinLeague')}
               onPress={onJoinLeague}
               variant="secondary"
               size="large"
               className="bg-primary w-full text-center"
               icon="enter"
               fullWidth
            />
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   emptyState: {
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
   },

   emptyTitle: {
      letterSpacing: 2,
      textAlign: 'center',
      marginBottom: 12,
   },

   emptySubtitle: {
      textAlign: 'center',
      marginBottom: 40,
   },

   emptyButtons: {
      width: '100%',
      gap: 16,
   },

   rtlText: {
      textAlign: 'right',
   },
});
