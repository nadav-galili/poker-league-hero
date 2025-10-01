import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useTopProfitPlayer } from '@/hooks/useTopProfitPlayer';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TopProfitPlayerCardProps {
   leagueId: string;
   t: (key: string) => string;
}

export default function TopProfitPlayerCard({
   leagueId,
   t,
}: TopProfitPlayerCardProps) {
   const theme = getTheme('light');
   const { data, isLoading, error } = useTopProfitPlayer(leagueId);

   if (isLoading) {
      return (
         <View style={styles.card}>
            <View className="items-center justify-center py-8">
               <View className="w-12 h-12 bg-concrete border-4 border-ink rounded-lg items-center justify-center mb-3">
                  <Ionicons
                     name="trophy-outline"
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
                     name="trophy-outline"
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

   return (
      <View style={styles.card}>
         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-4">
            <View className="w-10 h-10 bg-successTint border-3 border-ink rounded-lg items-center justify-center">
               <Ionicons name="trophy" size={20} color={colors.success} />
            </View>
            <Text className="text-textSecondary text-xs font-black uppercase tracking-widest flex-1 text-right">
               {t('topProfitPlayer')}
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
            <Text className="text-success text-2xl font-black mb-2">
               {formatCurrency(data.totalProfit)}
            </Text>
            <View className="bg-success px-3 py-1 border-2 border-ink">
               <Text className="text-ink text-xs font-black uppercase tracking-wider">
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
      backgroundColor: colors.paper,
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
