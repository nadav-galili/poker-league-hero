import { PlayerStat, StatType } from '@/services/leagueStatsService';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

interface StatsLeaderboardRowProps {
   player: PlayerStat;
   statType: StatType;
   index: number;
   t: (key: string) => string;
}

// Stat type configurations
const STAT_CONFIGS = {
   'top-profit-player': {
      color: '#4ADE80', // Green
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      color: '#60A5FA', // Blue
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
   'highest-single-game-profit': {
      color: '#FB923C', // Orange
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'biggest-loser': {
      color: '#F87171', // Red
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
} as const;

export default function StatsLeaderboardRow({
   player,
   statType,
   index,
   t,
}: StatsLeaderboardRowProps) {
   const config = STAT_CONFIGS[statType];
   const rank = player.rank || index + 2; // Default rank if not provided (assuming hero is #1)

   // Rank badge color logic
   const getRankColor = (r: number) => {
      switch (r) {
         case 1:
            return '#FFD700'; // Gold
         case 2:
            return '#C0C0C0'; // Silver
         default:
            return 'rgba(255, 255, 255, 0.5)';
      }
   };

   const rankColor = getRankColor(rank);

   return (
      <Animated.View
         entering={FadeInRight.delay(index * 50).springify()}
         style={styles.container}
      >
         {/* Rank Badge */}
         <View style={[styles.rankBadge, { borderColor: rankColor }]}>
            <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
         </View>

         {/* Avatar */}
         {player.profileImageUrl || player.additionalData?.isAnonymous ? (
            <Image
               source={
                  player.profileImageUrl
                     ? { uri: player.profileImageUrl }
                     : anonymousImage
               }
               style={styles.avatar}
               contentFit="cover"
            />
         ) : (
            <Image
               source={anonymousImage}
               style={styles.avatar}
               contentFit="cover"
            />
         )}

         {/* Player Name */}
         <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>
               {player.fullName}
            </Text>
            {player.additionalData?.gamesPlayed && (
               <Text style={styles.subtext}>
                  {player.additionalData.gamesPlayed} {t('gamesPlayed')}
               </Text>
            )}
         </View>

         {/* Stat Value */}
         <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: config.color }]}>
               {config.formatValue(player.value)}
            </Text>
         </View>
      </Animated.View>
   );
}

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      padding: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
   },
   rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
   },
   rankText: {
      fontSize: 14,
      fontWeight: 'bold',
   },
   avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
   },
   avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
   },
   infoContainer: {
      flex: 1,
      marginRight: 16,
   },
   name: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
   },
   subtext: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 12,
   },
   valueContainer: {
      alignItems: 'flex-end',
   },
   value: {
      fontSize: 18,
      fontWeight: 'bold',
   },
});
