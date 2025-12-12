import { useTopProfitPlayer } from '@/hooks/useTopProfitPlayer';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import CyberpunkLoader from '@/components/ui/CyberpunkLoader';

const { width: screenWidth } = Dimensions.get('window');

interface TopProfitPlayerCardProps {
   leagueId: string;
   t: (key: string) => string;
}

export default function TopProfitPlayerCard({
   leagueId,
   t,
}: TopProfitPlayerCardProps) {
   const { data, isLoading, error } = useTopProfitPlayer(leagueId);

   const cardStyle = React.useMemo(
      () => ({
         shadowColor: '#4ADE80', // Green color for top profit
         shadowOffset: { width: 0, height: 8 },
         shadowOpacity: 0.2,
         shadowRadius: 16,
         elevation: 16,
      }),
      []
   );

   const iconContainerStyle = React.useMemo(
      () => ({
         shadowColor: '#4ADE80',
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 8,
         elevation: 8,
      }),
      []
   );

   if (isLoading) {
      return (
         <View
            className="bg-green-500/10 backdrop-blur-xl border-green-400/30 rounded-3xl p-4 mb-4"
            style={[styles.card, cardStyle]}
         >
            <View className="items-center justify-center py-6">
               <View
                  className="w-10 h-10 bg-green-500/20 border border-green-400/40 rounded-xl items-center justify-center mb-3"
                  style={iconContainerStyle}
               >
                  <CyberpunkLoader
                     size="small"
                     variant="green"
                  />
               </View>
               <Text className="text-white/70 text-xs font-medium">
                  {t('loading')}...
               </Text>
            </View>
         </View>
      );
   }

   if (error || !data) {
      return (
         <View
            className="bg-red-500/10 backdrop-blur-xl border-red-400/30 rounded-3xl p-4 mb-4"
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
            <View className="items-center justify-center py-6">
               <View
                  className="w-10 h-10 bg-red-500/20 border border-red-400/40 rounded-xl items-center justify-center mb-3"
                  style={{
                     shadowColor: '#F87171',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  <Ionicons name="trophy-outline" size={18} color="#F87171" />
               </View>
               <Text className="text-red-400 text-xs font-medium text-center">
                  {error || t('noCompletedGames')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View
         className="bg-green-500/10 backdrop-blur-xl border-green-400/30 rounded-3xl p-4 mb-4"
         style={[styles.card, cardStyle]}
      >
         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-3">
            <View
               className="w-10 h-10 bg-green-500/20 border border-green-400/40 rounded-xl items-center justify-center"
               style={iconContainerStyle}
            >
               <Ionicons name="trophy" size={18} color="#4ADE80" />
            </View>
            <Text
               className="text-white/90 text-xs font-semibold flex-1 text-right"
               numberOfLines={2}
            >
               {t('topProfitPlayer')}
            </Text>
         </View>

         {/* Player Avatar */}
         <View className="items-center mb-3">
            {data.profileImageUrl ? (
               <Image
                  source={{ uri: data.profileImageUrl }}
                  style={{
                     width: 56,
                     height: 56,
                     borderRadius: 28,
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
                  className="w-14 h-14 bg-white/10 border border-white/20 rounded-full items-center justify-center"
                  style={{
                     shadowColor: '#4ADE80',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  <Ionicons name="person" size={24} color="#4ADE80" />
               </View>
            )}
         </View>

         {/* Player Info */}
         <View className="items-center">
            <Text
               className="text-white text-base font-semibold text-center mb-1"
               numberOfLines={1}
            >
               {data.fullName}
            </Text>
            <Text className="text-green-400 text-xl font-bold mb-2">
               {formatCurrency(data.totalProfit)}
            </Text>
            <View
               className="px-3 py-1.5 rounded-xl border border-green-400/40"
               style={{ backgroundColor: '#4ADE8020' }}
            >
               <Text className="text-green-300 font-medium text-xs">
                  {data.gamesPlayed} {t('gamesPlayed')}
               </Text>
            </View>
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

const styles = StyleSheet.create({
   card: {
      width: getCardWidth(),
      minWidth: 140,
      maxWidth: 170,
   },
});
