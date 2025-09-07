/**
 * Error State Component
 */

import { getTheme } from '@/colors';
import Button from '@/components/Button';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ErrorStateProps {
   error: string;
   onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
   const theme = getTheme('light');
   const { t } = useLocalization();

   return (
      <View style={styles.errorContainer}>
         <Text variant="h3" color={theme.error} style={styles.errorTitle}>
            {t('error')}
         </Text>
         <Text
            variant="body"
            color={theme.textMuted}
            style={styles.errorMessage}
         >
            {error}
         </Text>
         <Button
            title={t('retry')}
            onPress={onRetry}
            variant="outline"
            size="small"
         />
      </View>
   );
}

const styles = StyleSheet.create({
   errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
   },

   errorTitle: {
      textAlign: 'center',
      marginBottom: 12,
   },

   errorMessage: {
      textAlign: 'center',
      marginBottom: 24,
   },
});
