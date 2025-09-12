import { getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { StatCard as StatCardType } from '@/utils/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StatCardProps {
   card: StatCardType;
}

export default function StatCard({ card }: StatCardProps) {
   const theme = getTheme('light');

   return (
      <View
         style={[styles.statCard, { backgroundColor: theme.surfaceElevated }]}
      >
         <View style={styles.statCardContent}>
            <View
               style={[styles.statIcon, { backgroundColor: card.color + '20' }]}
            >
               <Ionicons name={card.icon as any} size={24} color={card.color} />
            </View>
            <Text variant="h4" color={theme.text} style={styles.statValue}>
               {card.value}
            </Text>
            <Text
               variant="captionSmall"
               color={theme.textSecondary}
               style={styles.statTitle}
            >
               {card.title}
            </Text>
            <Text
               variant="captionSmall"
               color={theme.textMuted}
               style={styles.statSubtitle}
            >
               {card.subtitle}
            </Text>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   statCard: {
      width: '45%',
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#000000',
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
   },
   statCardContent: {
      alignItems: 'center',
   },
   statIcon: {
      width: 48,
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderColor: '#000000',
   },
   statValue: {
      textAlign: 'center',
      fontWeight: '700',
      marginBottom: 4,
   },
   statTitle: {
      textAlign: 'center',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
   },
   statSubtitle: {
      textAlign: 'center',
      fontSize: 11,
   },
});
