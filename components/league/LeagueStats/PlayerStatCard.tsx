import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { usePlayerStat } from '@/hooks/usePlayerStat';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

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
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      title: 'mostActivePlayer',
      icon: 'star',
      color: colors.primary,
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) {
            return 'N/A';
         }
         return value.toString();
      },
   },
   'highest-single-game-profit': {
      title: 'highestSingleGameProfit',
      icon: 'trending-up',
      color: colors.accent,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-consistent-player': {
      title: 'mostConsistentPlayer',
      icon: 'checkmark-circle',
      color: colors.info,
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) {
            return 'N/A';
         }
         const numValue = typeof value === 'string' ? parseFloat(value) : value;
         if (isNaN(numValue)) {
            return 'N/A';
         }
         return numValue.toFixed(2);
      },
   },
   'biggest-loser': {
      title: 'biggestLoser',
      icon: 'sad',
      color: colors.error,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
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
         <View style={styles.card}>
            <View className="items-center justify-center py-8">
               <View className="w-12 h-12 bg-concrete border-4 border-ink rounded-lg items-center justify-center mb-3">
                  <Ionicons
                     name={config.icon as any}
                     size={24}
                     color={colors.textMuted}
                  />
               </View>
               <Text className="text-textMuted text-xs font-bold uppercase tracking-wider">
                  {t('loading')}...
               </Text>
            </View>
         </View>
      );
   }

   if (error || !data) {
      return (
         <View style={styles.card}>
            <View className="items-center justify-center py-8">
               <View className="w-12 h-12 bg-errorTint border-4 border-ink rounded-lg items-center justify-center mb-3">
                  <Ionicons
                     name={config.icon as any}
                     size={24}
                     color={colors.error}
                  />
               </View>
               <Text className="text-error text-xs font-bold uppercase tracking-wider text-center">
                  {error || t('noCompletedGames')}
               </Text>
            </View>
         </View>
      );
   }

   const cardBackgroundColor = config.color + '10'; // Very light tint
   const iconBackgroundColor = config.color + '20'; // Light tint

   return (
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-4">
            <View
               className="w-10 h-10 border-3 border-ink rounded-lg items-center justify-center"
               style={{ backgroundColor: iconBackgroundColor }}
            >
               <Ionicons
                  name={config.icon as any}
                  size={20}
                  color={config.color}
               />
            </View>
            <Text
               className="text-textSecondary text-xs font-black uppercase tracking-widest flex-1 text-right"
               numberOfLines={2}
            >
               {t(config.title)}
            </Text>
         </View>

         {/* Player Avatar */}
         <View className="items-center mb-4">
            {data.profileImageUrl ? (
               <Image
                  source={{ uri: data.profileImageUrl }}
                  className="w-16 h-16 rounded-full border-4 border-ink"
                  defaultSource={require('@/assets/images/icon.png')}
               />
            ) : (
               <View className="w-16 h-16 bg-primaryTint border-4 border-ink rounded-full items-center justify-center">
                  <Ionicons name="person" size={28} color={colors.primary} />
               </View>
            )}
         </View>

         {/* Player Info */}
         <View className="items-center">
            <Text
               className="text-ink text-lg font-black uppercase tracking-wide text-center mb-1"
               numberOfLines={1}
            >
               {data.fullName}
            </Text>
            <Text
               className="text-2xl font-black mb-2"
               style={{ color: config.color }}
            >
               {config.formatValue(data.value)}
            </Text>

            {/* Additional Data - Compact */}
            {data.additionalData && (
               <View className="items-center">
                  {data.additionalData.gamesPlayed && (
                     <View
                        className="px-3 py-1 border-2 border-ink mb-1"
                        style={{ backgroundColor: config.color }}
                     >
                        <Text className="text-ink text-xs font-black uppercase tracking-wider">
                           {data.additionalData.gamesPlayed} {t('gamesPlayed')}
                        </Text>
                     </View>
                  )}
                  {data.additionalData.totalProfit !== undefined && (
                     <Text className="text-textMuted text-xs font-bold text-center">
                        {t('totalProfit')}:{' '}
                        {formatCurrency(data.additionalData.totalProfit)}
                     </Text>
                  )}
               </View>
            )}
         </View>
      </View>
   );
}

// Responsive card width calculation
const getCardWidth = () => {
   const padding = 48; // Total horizontal padding
   const gap = 16; // Gap between cards
   const cardsPerRow = screenWidth > 768 ? 3 : 2; // 3 cards on tablets, 2 on phones
   return (screenWidth - padding - gap * (cardsPerRow - 1)) / cardsPerRow;
};

const styles = StyleSheet.create({
   card: {
      width: getCardWidth(),
      minWidth: 160,
      maxWidth: 220,
      padding: 16,
      borderRadius: 0, // Sharp corners for brutalist style
      borderWidth: 4,
      borderColor: colors.ink,
      shadowColor: colors.ink,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
      marginBottom: 16,
   },
});
