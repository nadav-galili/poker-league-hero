/**
 * Empty State Component for My Leagues
 */

import { getTheme } from '@/colors';
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
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();

   return (
      <View style={styles.emptyState}>
         <Text
            variant="h2"
            color={theme.text}
            style={[styles.emptyTitle, isRTL && styles.rtlText]}
         >
            {t('noLeaguesYet')}
         </Text>
         <Text
            variant="body"
            color={theme.textMuted}
            style={[styles.emptySubtitle, isRTL && styles.rtlText]}
         >
            {t('createFirstLeague')}
         </Text>

         <View className=" gap-3 flex-col">
            <Button
               title={t('createLeague')}
               onPress={onCreateLeague}
               variant="primary"
               size="large"
               icon="add-circle"
               fullWidth
            />
            <Button
               title={t('joinLeague')}
               onPress={onJoinLeague}
               variant="outline"
               size="large"
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
