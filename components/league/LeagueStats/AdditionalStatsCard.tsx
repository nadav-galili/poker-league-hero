import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { LeagueData } from '@/hooks/useLeagueStats';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AdditionalStatsCardProps {
   league: LeagueData;
   t: (key: string) => string;
}

export default function AdditionalStatsCard({
   league,
   t,
}: AdditionalStatsCardProps) {
   const theme = getTheme('light');

   return (
      <View
         style={[
            styles.additionalCard,
            { backgroundColor: theme.surfaceElevated },
         ]}
      >
         <View style={styles.additionalRow}>
            <Text variant="body" color={theme.textSecondary}>
               {t('leagueCreated')}
            </Text>
            <Text
               variant="body"
               color={theme.text}
               style={{ fontWeight: '600' }}
            >
               {new Date(league.createdAt).toLocaleDateString()}
            </Text>
         </View>
         <View style={styles.additionalRow}>
            <Text variant="body" color={theme.textSecondary}>
               {t('leagueStatus')}
            </Text>
            <View
               style={[
                  styles.statusBadge,
                  {
                     backgroundColor:
                        league.status === 'active'
                           ? colors.success + '20'
                           : colors.warning + '20',
                  },
               ]}
            >
               <Text
                  variant="captionSmall"
                  color={
                     league.status === 'active'
                        ? colors.success
                        : colors.warning
                  }
                  style={styles.statusText}
               >
                  {league.status}
               </Text>
            </View>
         </View>
         {league.description && (
            <View style={styles.divider}>
               <Text
                  variant="body"
                  color={theme.textSecondary}
                  style={{ marginBottom: 8 }}
               >
                  {t('description')}
               </Text>
               <Text variant="body" color={theme.text}>
                  {league.description}
               </Text>
            </View>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   additionalCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },
   additionalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
   },
   statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
   },
   statusText: {
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
   },
   divider: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
   },
});
