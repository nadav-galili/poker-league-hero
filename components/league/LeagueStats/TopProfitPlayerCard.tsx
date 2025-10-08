import { useTopProfitPlayer } from '@/hooks/useTopProfitPlayer';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';

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
            className="bg-green-500/10 backdrop-blur-xl border-green-400/30 rounded-3xl p-6 mb-4"
            style={[styles.card, cardStyle]}
         >
            <View className="items-center justify-center py-8">
               <View
                  className="w-12 h-12 bg-green-500/20 border border-green-400/40 rounded-2xl items-center justify-center mb-3"
                  style={iconContainerStyle}
               >
                  <ActivityIndicator size="small" color="#4ADE80" />
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
                  <Ionicons name="trophy-outline" size={24} color="#F87171" />
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
         className="bg-green-500/10 backdrop-blur-xl border-green-400/30 rounded-3xl p-6 mb-4"
         style={[styles.card, cardStyle]}
      >
         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-4">
            <View
               className="w-12 h-12 bg-green-500/20 border border-green-400/40 rounded-2xl items-center justify-center"
               style={iconContainerStyle}
            >
               <Ionicons name="trophy" size={20} color="#4ADE80" />
            </View>
            <Text
               className="text-white/90 text-sm font-semibold flex-1 text-right"
               numberOfLines={2}
            >
               {t('topProfitPlayer')}
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
                     shadowColor: '#4ADE80',
                     shadowOffset: { width: 0, height: 4 },
                     shadowOpacity: 0.3,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  <Ionicons name="person" size={28} color="#4ADE80" />
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
            <Text className="text-green-400 text-2xl font-bold mb-3">
               {formatCurrency(data.totalProfit)}
            </Text>
            <View
               className="px-4 py-2 rounded-2xl border border-green-400/40"
               style={{ backgroundColor: '#4ADE8020' }}
            >
               <Text className="text-green-300 font-medium text-sm">
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
