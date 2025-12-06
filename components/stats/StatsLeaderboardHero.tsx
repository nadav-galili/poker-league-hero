import { formatCurrency } from '@/services/leagueStatsFormatters';
import { PlayerStat, StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withSpring,
   withTiming,
} from 'react-native-reanimated';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

interface StatsLeaderboardHeroProps {
   player: PlayerStat;
   statType: StatType;
   t: (key: string) => string;
}

// Stat type configurations
const STAT_CONFIGS = {
   'top-profit-player': {
      title: 'topProfitPlayer',
      icon: 'trophy',
      color: '#4ADE80', // Green
      bgColor: 'rgba(74, 222, 128, 0.1)',
      borderColor: 'rgba(74, 222, 128, 0.3)',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      title: 'mostActivePlayer',
      icon: 'star',
      color: '#60A5FA', // Blue
      bgColor: 'rgba(96, 165, 250, 0.1)',
      borderColor: 'rgba(96, 165, 250, 0.3)',
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
   'highest-single-game-profit': {
      title: 'highestSingleGameProfit',
      icon: 'trending-up',
      color: '#FB923C', // Orange
      bgColor: 'rgba(251, 146, 60, 0.1)',
      borderColor: 'rgba(251, 146, 60, 0.3)',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-consistent-player': {
      title: 'mostConsistentPlayer',
      icon: 'checkmark-circle',
      color: '#A78BFA', // Purple
      bgColor: 'rgba(167, 139, 250, 0.1)',
      borderColor: 'rgba(167, 139, 250, 0.3)',
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         const numValue = typeof value === 'string' ? parseFloat(value) : value;
         if (isNaN(numValue)) return 'N/A';
         return numValue.toFixed(2);
      },
   },
   'biggest-loser': {
      title: 'biggestLoser',
      icon: 'sad',
      color: '#F87171', // Red
      bgColor: 'rgba(248, 113, 113, 0.1)',
      borderColor: 'rgba(248, 113, 113, 0.3)',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
} as const;

export default function StatsLeaderboardHero({
   player,
   statType,
   t,
}: StatsLeaderboardHeroProps) {
   const config = STAT_CONFIGS[statType];
   const scale = useSharedValue(0.8);
   const opacity = useSharedValue(0);

   useEffect(() => {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 500 });
   }, []);

   const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
   }));

   const cardStyle = {
      backgroundColor: config.bgColor,
      borderColor: config.borderColor,
      shadowColor: config.color,
   };

   return (
      <View style={styles.container}>
         <Animated.View style={[styles.card, cardStyle, animatedStyle]}>
            {/* Champion Badge */}
            <View
               style={[
                  styles.badge,
                  { backgroundColor: config.color, shadowColor: config.color },
               ]}
            >
               <Ionicons name="trophy" size={12} color="#000000" />
               <Text style={styles.badgeText}>{t('champion')}</Text>
            </View>

            {/* Content Row - Side by Side Layout */}
            <View style={styles.contentRow}>
               {/* Avatar with Glow */}
               <View style={styles.avatarContainer}>
                  <View
                     style={[
                        styles.avatarGlow,
                        {
                           backgroundColor: config.color,
                           shadowColor: config.color,
                        },
                     ]}
                  />
                  {player.profileImageUrl ||
                  player.additionalData?.isAnonymous ? (
                     <Image
                        source={
                           player.profileImageUrl
                              ? { uri: player.profileImageUrl }
                              : anonymousImage
                        }
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                     />
                  ) : (
                     <Image
                        source={anonymousImage}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                     />
                  )}
               </View>

               {/* Player Info */}
               <View style={styles.infoContainer}>
                  <Text style={styles.name} numberOfLines={1}>
                     {player.fullName}
                  </Text>

                  <Text style={[styles.value, { color: config.color }]}>
                     {config.formatValue(player.value)}
                  </Text>

                  {/* Additional Stats */}
                  {player.additionalData && (
                     <View style={styles.additionalStats}>
                        {player.additionalData.gamesPlayed && (
                           <View
                              style={[
                                 styles.pill,
                                 {
                                    backgroundColor: `${config.color}20`,
                                    borderColor: `${config.color}40`,
                                 },
                              ]}
                           >
                              <Text style={styles.pillText}>
                                 {player.additionalData.gamesPlayed}{' '}
                                 {t('gamesPlayed')}
                              </Text>
                           </View>
                        )}
                     </View>
                  )}
               </View>
            </View>
         </Animated.View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
      paddingHorizontal: 20,
      zIndex: 10,
   },
   card: {
      width: '100%',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 24,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
   },
   contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
   },
   badge: {
      position: 'absolute',
      top: -12,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      gap: 4,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
      zIndex: 20,
   },
   badgeText: {
      color: '#000000',
      fontWeight: 'bold',
      fontSize: 11,
      textTransform: 'uppercase',
   },
   avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
   },
   avatarGlow: {
      position: 'absolute',
      width: 68,
      height: 68,
      borderRadius: 34,
      opacity: 0.2,
      transform: [{ scale: 1.1 }],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
   },
   avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: '#FFFFFF',
   },
   avatarPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
   },
   infoContainer: {
      flex: 1,
      justifyContent: 'center',
   },
   name: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
      textAlign: 'left',
   },
   value: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 6,
      textAlign: 'left',
   },
   additionalStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
   },
   pill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
   },
   pillText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
   },
   label: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 10,
      fontWeight: '500',
   },
});
