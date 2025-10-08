import { usePlayerStat } from '@/hooks/usePlayerStat';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
   ActivityIndicator,
   Dimensions,
   StyleSheet,
   Text,
   View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PlayerStatCardProps {
   leagueId: string;
   statType: StatType;
   year?: number;
   t: (key: string) => string;
}

// Stat type configurations with modern colors
const STAT_CONFIGS = {
   'top-profit-player': {
      title: 'topProfitPlayer',
      icon: 'trophy',
      color: '#4ADE80', // Green
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-active-player': {
      title: 'mostActivePlayer',
      icon: 'star',
      color: '#60A5FA', // Blue
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
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
      color: '#FB923C', // Orange
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-400/30',
      formatValue: (value: number | string | undefined | null) =>
         formatCurrency(value),
   },
   'most-consistent-player': {
      title: 'mostConsistentPlayer',
      icon: 'checkmark-circle',
      color: '#A78BFA', // Purple
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30',
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
      color: '#F87171', // Red
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-400/30',
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
   const { data, isLoading, error } = usePlayerStat(leagueId, statType, year);
   const config = STAT_CONFIGS[statType];

   const cardStyle = React.useMemo(
      () => ({
         shadowColor: config.color,
         shadowOffset: { width: 0, height: 8 },
         shadowOpacity: 0.2,
         shadowRadius: 16,
         elevation: 16,
      }),
      [config.color]
   );

   const iconContainerStyle = React.useMemo(
      () => ({
         shadowColor: config.color,
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 8,
         elevation: 8,
      }),
      [config.color]
   );

   if (isLoading) {
      return (
         <View
            className={`${config.bgColor} backdrop-blur-xl ${config.borderColor} rounded-3xl p-6 mb-4`}
            style={[styles.card, cardStyle]}
         >
            <View className="items-center justify-center py-8">
               <View
                  className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl items-center justify-center mb-3"
                  style={iconContainerStyle}
               >
                  <ActivityIndicator size="small" color={config.color} />
               </View>
               <Text className="text-white/70 text-sm font-medium">
                  {t('loading')}...
               </Text>
            </View>
         </View>
      );
   }

   if (error || !data) {
      return (
         <View
            className="bg-red-500/10 backdrop-blur-xl border-red-400/30 rounded-3xl p-6 mb-4"
            style={[
               styles.card,
               {
                  shadowColor: '#F87171',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                  elevation: 16,
               },
            ]}
         >
            <View className="items-center justify-center py-8">
               <View
                  className="w-12 h-12 bg-red-500/20 border border-red-400/40 rounded-2xl items-center justify-center mb-3"
                  style={{
                     shadowColor: '#F87171',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  <Ionicons
                     name={config.icon as any}
                     size={24}
                     color="#F87171"
                  />
               </View>
               <Text className="text-red-400 text-sm font-medium text-center">
                  {error || t('noCompletedGames')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View
         className={`${config.bgColor} backdrop-blur-xl ${config.borderColor} rounded-3xl p-6 mb-4`}
         style={[styles.card, cardStyle]}
      >
         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-4">
            <View
               className="w-12 h-12 border border-white/30 rounded-2xl items-center justify-center"
               style={[
                  {
                     backgroundColor: `${config.color}20`,
                  },
                  iconContainerStyle,
               ]}
            >
               <Ionicons
                  name={config.icon as any}
                  size={20}
                  color={config.color}
               />
            </View>
            <Text
               className="text-white/90 text-sm font-semibold flex-1 text-right"
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
                  style={{
                     width: 64,
                     height: 64,
                     borderRadius: 32,
                     shadowColor: '#FFFFFF',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.2,
                     shadowRadius: 8,
                  }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
               />
            ) : (
               <View
                  className="w-16 h-16 bg-white/10 border border-white/20 rounded-full items-center justify-center"
                  style={{
                     shadowColor: config.color,
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  <Ionicons name="person" size={28} color={config.color} />
               </View>
            )}
         </View>

         {/* Player Info */}
         <View className="items-center">
            <Text
               className="text-white text-lg font-semibold text-center mb-2"
               numberOfLines={1}
            >
               {data.fullName}
            </Text>
            <Text
               className="text-2xl font-bold mb-3"
               style={{ color: config.color }}
            >
               {config.formatValue(data.value)}
            </Text>

            {/* Additional Data - Modern Design */}
            {data.additionalData && (
               <View className="items-center">
                  {data.additionalData.gamesPlayed && (
                     <View
                        className="px-4 py-2 rounded-2xl mb-2 border border-white/20"
                        style={{ backgroundColor: `${config.color}20` }}
                     >
                        <Text className="text-white font-medium text-sm">
                           {data.additionalData.gamesPlayed} {t('gamesPlayed')}
                        </Text>
                     </View>
                  )}
                  {data.additionalData.totalProfit !== undefined && (
                     <Text className="text-white/70 text-sm font-medium text-center">
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
   },
});
