import { colors } from '@/colors';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { PlayerStat, StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

interface StatsLeaderboardHeroProps {
   player: PlayerStat;
   statType: StatType;
   t: (key: string) => string;
}

// Cyberpunk Stat type configurations
const STAT_CONFIGS = {
   'top-profit-player': {
      title: 'topProfitPlayer',
      icon: 'trophy',
      color: colors.neonGreen, // Matrix green for profit
      secondaryColor: colors.matrixGreen,
      shadowColor: colors.shadowNeonGreen,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      title: 'mostActivePlayer',
      icon: 'star',
      color: colors.neonCyan, // Cyan for activity
      secondaryColor: colors.neonBlue,
      shadowColor: colors.shadowNeonCyan,
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
   'highest-single-game-profit': {
      title: 'highestSingleGameProfit',
      icon: 'trending-up',
      color: colors.neonOrange, // Orange for peaks
      secondaryColor: colors.neonPink,
      shadowColor: colors.shadowNeonPink,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'biggest-loser': {
      title: 'biggestLoser',
      icon: 'sad',
      color: colors.neonPink, // Pink for danger
      secondaryColor: colors.neonOrange,
      shadowColor: colors.shadowNeonPink,
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'best-winning-streak': {
      title: 'bestWinningStreak',
      icon: 'flame',
      color: colors.neonOrange, // Orange for streaks
      secondaryColor: colors.neonGreen,
      shadowColor: colors.shadowNeonGreen,
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
   'monthly-profit-leader': {
      title: 'monthlyProfitLeader',
      icon: 'calendar',
      color: colors.neonGreen, // Green for monthly profit
      secondaryColor: colors.matrixGreen,
      shadowColor: colors.shadowNeonGreen,
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
   const scaleAnim = useRef(new Animated.Value(0.8)).current;
   const opacityAnim = useRef(new Animated.Value(0)).current;
   const glowPulseAnim = useRef(new Animated.Value(0.8)).current;

   useEffect(() => {
      // Scale and fade in animation
      Animated.parallel([
         Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            useNativeDriver: true,
         }),
         Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
         }),
      ]).start();

      // Pulse glow effect
      Animated.loop(
         Animated.sequence([
            Animated.timing(glowPulseAnim, {
               toValue: 1.2,
               duration: 1500,
               useNativeDriver: true,
            }),
            Animated.timing(glowPulseAnim, {
               toValue: 0.8,
               duration: 1500,
               useNativeDriver: true,
            }),
         ])
      ).start();
   }, [scaleAnim, opacityAnim, glowPulseAnim]);

   return (
      <View style={styles.container}>
         <Animated.View
            style={[
               styles.card,
               {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
               },
            ]}
         >
            {/* Cyberpunk background gradient */}
            <LinearGradient
               colors={[
                  colors.cyberBackground,
                  colors.holoBlue,
                  colors.cyberGray,
               ]}
               style={styles.cardGradient}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
            />

            {/* Corner brackets */}
            <View
               style={[
                  styles.cornerBracket,
                  styles.topLeft,
                  { borderColor: config.color },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.topRight,
                  { borderColor: config.color },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomLeft,
                  { borderColor: config.color },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomRight,
                  { borderColor: config.color },
               ]}
            />

            {/* Champion Badge */}
            <View style={styles.badgeContainer}>
               <LinearGradient
                  colors={[config.color, config.secondaryColor]}
                  style={styles.badge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
               >
                  <Ionicons
                     name="trophy"
                     size={14}
                     color={colors.cyberBackground}
                  />
                  <Text style={styles.badgeText}>CHAMPION</Text>
               </LinearGradient>
               <View
                  style={[styles.badgeGlow, { backgroundColor: config.color }]}
               />
            </View>

            {/* Content Row - Side by Side Layout */}
            <View style={styles.contentRow}>
               {/* Avatar with Cyberpunk Glow */}
               <View style={styles.avatarContainer}>
                  <Animated.View
                     style={[
                        styles.avatarGlow,
                        {
                           transform: [{ scale: glowPulseAnim }],
                           backgroundColor: config.color,
                        },
                     ]}
                  />
                  <View
                     style={[
                        styles.avatarBorder,
                        { borderColor: config.color },
                     ]}
                  >
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
                  {/* Holographic overlay */}
                  <View
                     style={[styles.avatarHolo, { borderColor: config.color }]}
                  />
               </View>

               {/* Player Info */}
               <View style={styles.infoContainer}>
                  <View style={styles.nameContainer}>
                     <Text style={styles.name} numberOfLines={1}>
                        {player.fullName}
                     </Text>
                     <View
                        style={[
                           styles.nameUnderline,
                           { backgroundColor: config.color },
                        ]}
                     />
                  </View>

                  <Text
                     className="text-xl font-bold"
                     style={[
                        {
                           color:
                              statType === 'top-profit-player' ||
                              statType === 'highest-single-game-profit' ||
                              statType === 'biggest-loser'
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

                  <Text style={styles.statLabel}>RANK #1</Text>

                  {/* Additional Stats */}
                  {player.additionalData && (
                     <View style={styles.additionalStats}>
                        {player.additionalData.gamesPlayed && (
                           <View
                              style={[
                                 styles.pill,
                                 { borderColor: config.color },
                              ]}
                           >
                              <View
                                 style={[
                                    styles.pillGlow,
                                    { backgroundColor: config.color },
                                 ]}
                              />
                              <Text style={styles.pillText}>
                                 {player.additionalData.gamesPlayed} GAMES
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
      marginTop: 50,
      marginBottom: 30,
      paddingHorizontal: 20,
      zIndex: 10,
   },
   card: {
      width: '100%',
      paddingTop: 32,
      paddingBottom: 24,
      paddingHorizontal: 24,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      backgroundColor: colors.holoBlue,
      // Angular cyberpunk design - no rounded corners
      borderRadius: 0,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
   },
   cardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.8,
   },
   // Corner brackets for cyberpunk aesthetic
   cornerBracket: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderWidth: 2,
      zIndex: 5,
   },
   topLeft: {
      top: -1,
      left: -1,
      borderBottomWidth: 0,
      borderRightWidth: 0,
   },
   topRight: {
      top: -1,
      right: -1,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
   },
   bottomLeft: {
      bottom: -1,
      left: -1,
      borderTopWidth: 0,
      borderRightWidth: 0,
   },
   bottomRight: {
      bottom: -1,
      right: -1,
      borderTopWidth: 0,
      borderLeftWidth: 0,
   },
   contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      zIndex: 4,
   },
   badgeContainer: {
      position: 'absolute',
      top: 0,
      alignSelf: 'center',
      zIndex: 10,
   },
   badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 6,
      gap: 6,
      borderRadius: 0, // Angular design
   },
   badgeText: {
      color: colors.cyberBackground,
      fontWeight: '800',
      fontSize: 11,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textTransform: 'uppercase',
   },
   badgeGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.4,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 8,
   },
   avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
   },
   avatarGlow: {
      position: 'absolute',
      width: 52,
      height: 52,
      borderRadius: 26,
      opacity: 0.3,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      zIndex: 1,
   },
   avatarBorder: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 3,
   },
   avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
   },
   avatarHolo: {
      position: 'absolute',
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 1,
      opacity: 0.4,
      zIndex: 4,
   },
   avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.holoBlue,
      borderColor: colors.neonCyan,
   },
   infoContainer: {
      flex: 1,
      justifyContent: 'center',
   },
   nameContainer: {
      marginBottom: 8,
   },
   name: {
      color: colors.neonCyan,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'left',
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      textShadowColor: colors.shadowNeonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   },
   nameUnderline: {
      height: 2,
      width: '80%',
      marginTop: 4,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
   },
   value: {
      fontSize: 28,
      fontWeight: '900',
      marginBottom: 4,
      textAlign: 'left',
      fontFamily: 'monospace',
      letterSpacing: 1,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   },
   statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'left',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 8,
   },
   additionalStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: 4,
   },
   pill: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 0, // Angular design
      borderWidth: 1,
      backgroundColor: colors.holoBlue,
      position: 'relative',
      overflow: 'hidden',
   },
   pillGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.2,
   },
   pillText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      zIndex: 2,
   },
   label: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '500',
      fontFamily: 'monospace',
   },
});
