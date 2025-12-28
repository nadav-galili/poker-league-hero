import { colors } from '@/colors';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { PlayerStat, StatType } from '@/services/leagueStatsService';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

interface StatsLeaderboardRowProps {
   player: PlayerStat;
   statType: StatType;
   index: number;
   t: (key: string) => string;
}

// Cyberpunk Stat type configurations
const STAT_CONFIGS = {
   'top-profit-player': {
      color: colors.neonGreen, // Matrix green for profit
      shadowColor: colors.shadowNeonGreen,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      color: colors.neonCyan, // Cyan for activity
      shadowColor: colors.shadowNeonCyan,
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
   'highest-single-game-profit': {
      color: colors.neonOrange, // Orange for peaks
      shadowColor: colors.shadowNeonPink,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'biggest-loser': {
      color: colors.neonPink, // Pink for danger
      shadowColor: colors.shadowNeonPink,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'best-winning-streak': {
      color: colors.neonOrange, // Orange for streaks
      shadowColor: colors.shadowNeonGreen,
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
   'monthly-profit-leader': {
      color: colors.neonGreen, // Green for monthly profit
      shadowColor: colors.shadowNeonGreen,
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
   
   const fadeAnim = useRef(new Animated.Value(0)).current;
   const translateXAnim = useRef(new Animated.Value(50)).current;

   useEffect(() => {
      Animated.parallel([
         Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
         }),
         Animated.spring(translateXAnim, {
            toValue: 0,
            friction: 7,
            delay: index * 50,
            useNativeDriver: true,
         }),
      ]).start();
   }, [fadeAnim, translateXAnim, index]);

   // Cyberpunk rank badge color logic
   const getRankColor = (r: number) => {
      switch (r) {
         case 1:
            return colors.neonGreen; // Matrix green for #1
         case 2:
            return colors.neonCyan; // Cyan for #2
         case 3:
            return colors.neonOrange; // Orange for #3
         default:
            return colors.textSecondary;
      }
   };

   const rankColor = getRankColor(rank);
   const rankShadowColor = rank <= 3 ? config.shadowColor : colors.shadow;

   return (
      <Animated.View
         style={[
            styles.container,
            {
               opacity: fadeAnim,
               transform: [{ translateX: translateXAnim }],
            },
         ]}
      >
         {/* Cyberpunk background gradient */}
         <LinearGradient
            colors={[colors.holoBlue, colors.cyberGray, colors.cyberBackground]}
            style={styles.rowGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
         />

         {/* Corner indicator for top ranks */}
         {rank <= 3 && (
            <View
               style={[styles.topRankIndicator, { borderColor: rankColor }]}
            />
         )}

         {/* Rank Badge */}
         <View
            style={[
               styles.rankBadgeContainer,
               { shadowColor: rankShadowColor },
            ]}
         >
            <View style={[styles.rankBadge, { borderColor: rankColor }]}>
               <LinearGradient
                  colors={
                     rank <= 3
                        ? [rankColor, colors.cyberBackground]
                        : [colors.cyberGray, colors.cyberBackground]
                  }
                  style={styles.rankBadgeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
               />
               <Text
                  style={[
                     styles.rankText,
                     { color: rank <= 3 ? colors.cyberBackground : rankColor },
                  ]}
               >
                  {rank}
               </Text>
            </View>
         </View>

         {/* Avatar with cyberpunk styling */}
         <View style={styles.avatarContainer}>
            <View
               style={[styles.avatarGlow, { backgroundColor: config.color }]}
            />
            <View style={[styles.avatarBorder, { borderColor: config.color }]}>
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
            </View>
            <View style={[styles.avatarHolo, { borderColor: config.color }]} />
         </View>

         {/* Player Info */}
         <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>
               {player.fullName}
            </Text>
            {player.additionalData?.gamesPlayed && (
               <Text style={styles.subtext}>
                  {player.additionalData.gamesPlayed} GAMES
               </Text>
            )}
         </View>

         {/* Stat Value with cyberpunk styling */}
         <View style={styles.valueContainer}>
            <Text
               className="text-lg font-bold"
               style={[
                  {
                     color:
                        statType === 'top-profit-player' ||
                        statType === 'highest-single-game-profit' ||
                        statType === 'biggest-loser' ||
                        statType === 'monthly-profit-leader'
                           ? typeof player.value === 'number' &&
                             player.value < 0
                              ? colors.neonPink
                              : config.color
                           : config.color,
                  },
               ]}
            >
               {config.formatValue(player.value)}
            </Text>
            <View
               style={[
                  styles.valueUnderline,
                  {
                     backgroundColor:
                        statType === 'top-profit-player' ||
                        statType === 'highest-single-game-profit' ||
                        statType === 'biggest-loser' ||
                        statType === 'monthly-profit-leader'
                           ? typeof player.value === 'number' &&
                             player.value < 0
                              ? colors.neonPink
                              : config.color
                           : config.color,
                  },
               ]}
            />
         </View>

         {/* Side accent line */}
         <View style={[styles.sideAccent, { backgroundColor: config.color }]} />
      </Animated.View>
   );
}

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.borderNeonCyan,
      backgroundColor: colors.holoBlue,
      // Angular cyberpunk design - no rounded corners
      borderRadius: 0,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
   },
   rowGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.6,
   },
   topRankIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 12,
      height: 12,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      zIndex: 5,
   },
   rankBadgeContainer: {
      marginRight: 16,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      zIndex: 3,
   },
   rankBadge: {
      width: 36,
      height: 36,
      borderRadius: 0, // Angular design
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
   },
   rankBadgeGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
   rankText: {
      fontSize: 14,
      fontWeight: '800',
      fontFamily: 'monospace',
      zIndex: 2,
   },
   avatarContainer: {
      marginRight: 16,
      position: 'relative',
   },
   avatarGlow: {
      position: 'absolute',
      width: 54,
      height: 54,
      borderRadius: 27,
      opacity: 0.3,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      zIndex: 1,
      top: -3,
      left: -3,
   },
   avatarBorder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      padding: 2,
      zIndex: 3,
   },
   avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
   },
   avatarHolo: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      opacity: 0.4,
      zIndex: 4,
      top: 0,
      left: 0,
   },
   avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.holoBlue,
   },
   infoContainer: {
      flex: 1,
      marginRight: 16,
      zIndex: 3,
   },
   name: {
      color: colors.neonCyan,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
      fontFamily: 'monospace',
      letterSpacing: 0.3,
      textShadowColor: colors.shadowNeonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
   },
   subtext: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
   },
   valueContainer: {
      alignItems: 'flex-end',
      position: 'relative',
      zIndex: 3,
   },
   value: {
      fontSize: 18,
      fontWeight: '800',
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
   },
   valueUnderline: {
      height: 1,
      width: '100%',
      marginTop: 2,
      opacity: 0.6,
   },
   sideAccent: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 3,
      opacity: 0.8,
   },
});
