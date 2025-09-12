import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { usePlayerStat } from '@/hooks/usePlayerStat';
import { StatType } from '@/services/leagueStatsService';
import { formatCurrency } from '@/utils/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

interface PlayerStatCardProps {
   leagueId: string;
   statType: StatType;
   year?: number;
   t: (key: string) => string;
}

// Stat type configurations
const STAT_CONFIGS = {
   'top-profit-player': {
      title: 'topProfitPlayer',
      icon: 'trophy',
      color: colors.success,
      formatValue: (value: number) => formatCurrency(value),
   },
   'most-active-player': {
      title: 'mostActivePlayer',
      icon: 'star',
      color: colors.primary,
      formatValue: (value: number) => value.toString(),
   },
   'highest-single-game-profit': {
      title: 'highestSingleGameProfit',
      icon: 'trending-up',
      color: colors.accent,
      formatValue: (value: number) => formatCurrency(value),
   },
   'most-consistent-player': {
      title: 'mostConsistentPlayer',
      icon: 'checkmark-circle',
      color: colors.info,
      formatValue: (value: number) => value.toFixed(2),
   },
   'biggest-loser': {
      title: 'biggestLoser',
      icon: 'sad',
      color: colors.error,
      formatValue: (value: number) => formatCurrency(value),
   },
} as const;

export default function PlayerStatCard({
   leagueId,
   statType,
   year,
   t,
}: PlayerStatCardProps) {
   const theme = getTheme('light');
   const { data, isLoading, error } = usePlayerStat(leagueId, statType, year);
   const config = STAT_CONFIGS[statType];

   if (isLoading) {
      return (
         <View
            style={[styles.card, { backgroundColor: theme.surfaceElevated }]}
         >
            <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={colors.primary} />
               <Text
                  variant="captionSmall"
                  color={theme.textMuted}
                  style={styles.loadingText}
               >
                  {t('loadingPlayerStat')}
               </Text>
            </View>
         </View>
      );
   }

   if (error || !data) {
      return (
         <View
            style={[styles.card, { backgroundColor: theme.surfaceElevated }]}
         >
            <View style={styles.errorContainer}>
               <Ionicons
                  name="trophy-outline"
                  size={32}
                  color={theme.textMuted}
               />
               <Text
                  variant="captionSmall"
                  color={theme.textMuted}
                  style={styles.errorText}
               >
                  {error || t('noCompletedGames')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
         <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
               <View
                  style={[
                     styles.iconContainer,
                     { backgroundColor: config.color + '20' },
                  ]}
               >
                  <Ionicons
                     name={config.icon as any}
                     size={24}
                     color={config.color}
                  />
               </View>
               <Text
                  variant="captionSmall"
                  color={theme.textSecondary}
                  style={styles.cardTitle}
               >
                  {t(config.title)} {year || new Date().getFullYear()}
               </Text>
            </View>

            {/* Player Info */}
            <View style={styles.playerContainer}>
               {/* Profile Image */}
               <View style={styles.imageContainer}>
                  {data.profileImageUrl ? (
                     <Image
                        source={{ uri: data.profileImageUrl }}
                        style={styles.profileImage}
                        defaultSource={require('@/assets/images/icon.png')}
                     />
                  ) : (
                     <View
                        style={[
                           styles.placeholderImage,
                           { backgroundColor: colors.primary + '20' },
                        ]}
                     >
                        <Ionicons
                           name="person"
                           size={32}
                           color={colors.primary}
                        />
                     </View>
                  )}
               </View>

               {/* Player Details */}
               <View style={styles.playerInfo}>
                  <Text
                     variant="h4"
                     color={theme.text}
                     style={styles.playerName}
                  >
                     {data.fullName}
                  </Text>
                  <Text
                     variant="h3"
                     color={config.color}
                     style={styles.statValue}
                  >
                     {config.formatValue(data.value)}
                  </Text>

                  {/* Additional Data */}
                  {data.additionalData && (
                     <View style={styles.additionalInfo}>
                        {data.additionalData.gamesPlayed && (
                           <Text
                              variant="captionSmall"
                              color={theme.textMuted}
                              style={styles.additionalText}
                           >
                              {data.additionalData.gamesPlayed}{' '}
                              {t('gamesPlayed')}
                           </Text>
                        )}
                        {data.additionalData.totalProfit !== undefined && (
                           <Text
                              variant="captionSmall"
                              color={theme.textMuted}
                              style={styles.additionalText}
                           >
                              {t('totalProfit')}:{' '}
                              {formatCurrency(data.additionalData.totalProfit)}
                           </Text>
                        )}
                        {data.additionalData.avgProfit !== undefined && (
                           <Text
                              variant="captionSmall"
                              color={theme.textMuted}
                              style={styles.additionalText}
                           >
                              {t('avgProfit')}:{' '}
                              {formatCurrency(data.additionalData.avgProfit)}
                           </Text>
                        )}
                     </View>
                  )}
               </View>
            </View>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   card: {
      width: '100%',
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#000000',
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
      marginBottom: 16,
   },
   cardContent: {
      alignItems: 'center',
   },
   header: {
      alignItems: 'center',
      marginBottom: 16,
   },
   iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      borderWidth: 2,
      borderColor: '#000000',
   },
   cardTitle: {
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
   },
   playerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
   },
   imageContainer: {
      marginRight: 16,
   },
   profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      borderColor: '#000000',
   },
   placeholderImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      borderColor: '#000000',
      alignItems: 'center',
      justifyContent: 'center',
   },
   playerInfo: {
      flex: 1,
      alignItems: 'flex-start',
   },
   playerName: {
      fontWeight: '700',
      marginBottom: 4,
   },
   statValue: {
      fontWeight: '700',
      marginBottom: 4,
   },
   additionalInfo: {
      gap: 2,
   },
   additionalText: {
      fontSize: 11,
   },
   loadingContainer: {
      alignItems: 'center',
      paddingVertical: 32,
   },
   loadingText: {
      marginTop: 12,
      textAlign: 'center',
   },
   errorContainer: {
      alignItems: 'center',
      paddingVertical: 32,
   },
   errorText: {
      marginTop: 12,
      textAlign: 'center',
   },
});
