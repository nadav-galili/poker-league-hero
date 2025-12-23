import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function PersonalStats() {
   const theme = getTheme('light');
   const { t } = useLocalization();
   const { trackScreenView } = useMixpanel();

   useEffect(() => {
      trackScreenView('personal_stats_screen');
   }, [trackScreenView]);

   return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
         <View style={[styles.header, { backgroundColor: theme.surface }]}>
            <Text style={[styles.title, { color: theme.text }]}>
               {t('personalStats')}
            </Text>
         </View>

         <View style={styles.content}>
            <Ionicons name="person" size={64} color={theme.text} />
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
               Personal statistics coming soon!
            </Text>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 24,
      borderBottomWidth: 3,
      borderBottomColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 0,
      elevation: 8,
   },
   title: {
      fontSize: 32,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 2,
      textAlign: 'center',
   },
   content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
   },
   subtitle: {
      fontSize: 18,
      fontWeight: '500',
      marginTop: 16,
      textAlign: 'center',
   },
});
