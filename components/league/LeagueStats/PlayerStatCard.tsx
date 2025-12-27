import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { usePlayerStat } from '@/hooks/usePlayerStat';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

const { width: screenWidth } = Dimensions.get('window');

interface PlayerStatCardProps {
   leagueId: string;
   statType: StatType;
   year?: number;
   t: (key: string) => string;
}

// Cyberpunk stat type configurations with neon colors
const STAT_CONFIGS = {
   'top-profit-player': {
      title: 'topProfitPlayer',
      icon: 'trophy',
      color: '#00FF88', // Bright Neon Green
      borderClass: 'border-neonGreen',
      textClass: 'text-neonGreen',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      title: 'mostActivePlayer',
      icon: 'star',
      color: '#88FFFF', // Bright Neon Cyan
      borderClass: 'border-neonCyan',
      textClass: 'text-neonCyan',
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
      color: '#FFAA44', // Bright Neon Orange
      borderClass: 'border-neonOrange',
      textClass: 'text-neonOrange',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'biggest-loser': {
      title: 'biggestLoser',
      icon: 'sad',
      color: '#FF00FF', // Neon Magenta
      borderClass: 'border-neonMagenta',
      textClass: 'text-neonMagenta',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'best-winning-streak': {
      title: 'bestWinningStreak',
      icon: 'flame',
      color: '#FFFF88', // Bright Neon Yellow
      borderClass: 'border-neonYellow',
      textClass: 'text-neonYellow',
      formatValue: (value: number | string | undefined | null) => {
         if (value === null || value === undefined) return 'N/A';
         return value.toString();
      },
   },
} as const;

export default function PlayerStatCard({
   leagueId,
   statType,
   year,
   t,
}: PlayerStatCardProps) {
   const { data, isLoading, error } = usePlayerStat(leagueId, statType, year);
   const config = STAT_CONFIGS[statType];

   if (isLoading) {
      return (
         <View
            className={`bg-cyber-dark border-2 ${config.borderClass} p-4 mb-4 relative`}
            style={[styles.card, getCyberpunkCardStyle(config.color)]}
         >
            {/* Corner Brackets */}
            <View style={styles.cornerBrackets}>
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
            </View>
            <View className="items-center justify-center py-6">
               <View
                  className={`w-10 h-10 border-2 ${config.borderClass} items-center justify-center mb-3`}
                  style={[
                     styles.cyberpunkIcon,
                     { backgroundColor: `${config.color}20` },
                  ]}
               >
                  <CyberpunkLoader size="small" variant="cyan" />
               </View>
               <Text
                  className={`${config.textClass} text-xs font-bold tracking-wide`}
               >
                  {t('loading')}...
               </Text>
            </View>
         </View>
      );
   }

   if (error || !data) {
      return (
         <View
            className="bg-cyber-dark border-2 border-neonRed p-4 mb-4 relative"
            style={[styles.card, getCyberpunkCardStyle('#ff0080')]}
         >
            {/* Corner Brackets */}
            <View style={styles.cornerBrackets}>
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topLeft,
                     { borderColor: '#ff0080' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topRight,
                     { borderColor: '#ff0080' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomLeft,
                     { borderColor: '#ff0080' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomRight,
                     { borderColor: '#ff0080' },
                  ]}
               />
            </View>
            <View className="items-center justify-center py-6">
               <View
                  className="w-10 h-10 bg-neonRed/20 border-2 border-neonRed items-center justify-center mb-3"
                  style={styles.cyberpunkIcon}
               >
                  <Ionicons
                     name={config.icon as any}
                     size={18}
                     color="#ff0080"
                  />
               </View>
               <Text className="text-neonRed text-xs font-bold text-center tracking-wide">
                  {error || t('noCompletedGames')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View
         className={`bg-cyber-dark border-2 ${config.borderClass} p-4 mb-4 relative`}
         style={[styles.card, getCyberpunkCardStyle(config.color)]}
      >
         {/* Corner Brackets */}
         <View style={styles.cornerBrackets}>
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
         </View>

         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-3">
            <View
               className={`w-10 h-10 border-2 ${config.borderClass} items-center justify-center`}
               style={[
                  styles.cyberpunkIcon,
                  {
                     backgroundColor: `${config.color}20`,
                  },
               ]}
            >
               <Ionicons
                  name={config.icon as any}
                  size={18}
                  color={config.color}
               />
            </View>
            <Text
               className={`${config.textClass} text-xs font-bold flex-1 text-right tracking-wide`}
               numberOfLines={2}
            >
               {t(config.title)}
            </Text>
         </View>

         {/* Player Avatar */}
         <View className="items-center mb-3">
            {data.profileImageUrl || data.additionalData?.isAnonymous ? (
               <View style={styles.avatarContainer}>
                  <Image
                     source={
                        data.profileImageUrl
                           ? { uri: data.profileImageUrl }
                           : anonymousImage
                     }
                     style={styles.avatar}
                     contentFit="cover"
                     cachePolicy="memory-disk"
                  />
                  <View
                     style={[
                        styles.avatarBorder,
                        { borderColor: config.color },
                     ]}
                  />
               </View>
            ) : (
               <View
                  className={`w-14 h-14 border-2 ${config.borderClass} items-center justify-center`}
                  style={[
                     styles.cyberpunkAvatar,
                     { backgroundColor: `${config.color}20` },
                  ]}
               >
                  <Ionicons name="person" size={24} color={config.color} />
               </View>
            )}
         </View>

         {/* Player Info */}
         <View className="items-center">
            <Text
               className="text-cyber-white text-base font-black text-center mb-1 tracking-wide"
               style={{
                  textShadowColor: config.color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
               }}
               numberOfLines={1}
            >
               {data.fullName}
            </Text>
            <Text
               className={`${config.textClass} text-xl font-black mb-2 tracking-wider`}
               style={{
                  textShadowColor: config.color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
               }}
            >
               {config.formatValue(data.value)}
            </Text>

            {/* Additional Data - Cyberpunk Design */}
            {data.additionalData && (
               <View className="items-center">
                  {data.additionalData.gamesPlayed && (
                     <View
                        className={`px-3 py-1.5 mb-1.5 border-2 ${config.borderClass}`}
                        style={[
                           styles.statBadge,
                           { backgroundColor: `${config.color}10` },
                        ]}
                     >
                        <Text
                           className={`${config.textClass} font-bold text-xs tracking-wide`}
                           style={{
                              textShadowColor: config.color,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 6,
                           }}
                        >
                           {data.additionalData.gamesPlayed} {t('gamesPlayed')}
                        </Text>
                     </View>
                  )}
                  {data.additionalData.totalProfit !== undefined && (
                     <Text
                        className="text-cyber-white text-xs font-bold text-center tracking-wide"
                        style={{
                           textShadowColor: '#FFFFFF',
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 4,
                        }}
                     >
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
   const cardsPerRow = 2; // Always 2 columns
   return (screenWidth - padding - gap * (cardsPerRow - 1)) / cardsPerRow;
};

// Cyberpunk style generator
const getCyberpunkCardStyle = (color: string) => ({
   shadowColor: color,
   shadowOffset: { width: 0, height: 0 } as const,
   shadowOpacity: 0.8,
   shadowRadius: 15,
   elevation: 25,
});

const styles = StyleSheet.create({
   card: {
      width: getCardWidth(),
      minWidth: 140,
      maxWidth: 170,
      minHeight: 240,
   },
   cyberpunkIcon: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 15,
   },
   cornerBrackets: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
   },
   cornerBracket: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderWidth: 2,
   },
   topLeft: {
      top: -2,
      left: -2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   },
   topRight: {
      top: -2,
      right: -2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   },
   bottomLeft: {
      bottom: -2,
      left: -2,
      borderRightWidth: 0,
      borderTopWidth: 0,
   },
   bottomRight: {
      bottom: -2,
      right: -2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   },
   avatarContainer: {
      position: 'relative',
      width: 56,
      height: 56,
   },
   avatar: {
      width: 56,
      height: 56,
      borderRadius: 6,
   },
   avatarBorder: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderWidth: 2,
      borderRadius: 8,
   },
   cyberpunkAvatar: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 15,
   },
   statBadge: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 10,
   },
});
