import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { TopPlayer } from '@/utils/leagueStatsHelpers';
import { formatCurrency } from '@/utils/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PlayerCardProps {
   item: TopPlayer;
   t: (key: string) => string;
}

export default function PlayerCard({ item, t }: PlayerCardProps) {
   const theme = getTheme('light');

   return (
      <View
         style={[styles.playerCard, { backgroundColor: theme.surfaceElevated }]}
      >
         <View style={styles.playerCardContent}>
            <View style={styles.playerInfo}>
               <Text variant="h4" color={theme.text} style={styles.playerTitle}>
                  {item.title}
               </Text>
               <Text variant="h3" color={item.color} style={styles.playerName}>
                  {item.player.name}
               </Text>
               <Text
                  variant="body"
                  color={theme.textSecondary}
                  style={styles.playerStats}
               >
                  {item.title === t('mostProfitablePlayer')
                     ? formatCurrency((item.player as any).profit)
                     : `${(item.player as any).gamesPlayed} ${t('games')}`}
               </Text>
            </View>
            <View
               style={[
                  styles.playerIconContainer,
                  { backgroundColor: item.color + '20' },
               ]}
            >
               <Ionicons name={item.icon as any} size={32} color={item.color} />
            </View>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   playerCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.border,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
   },
   playerCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
   },
   playerInfo: {
      flex: 1,
   },
   playerTitle: {
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
   },
   playerName: {
      fontWeight: '700',
   },
   playerStats: {
      marginTop: 4,
   },
   playerIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.border,
   },
});
