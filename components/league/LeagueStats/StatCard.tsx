import { StatCard as StatCardType } from '@/services/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface StatCardProps {
   card: StatCardType;
}

// Responsive card width calculation
const getCardWidth = () => {
   const padding = 48; // Total horizontal padding
   const gap = 16; // Gap between cards
   const cardsPerRow = 2; // Always 2 columns
   return (screenWidth - padding - gap * (cardsPerRow - 1)) / cardsPerRow;
};

// Memoized style objects to prevent recreation on every render
const styles = StyleSheet.create({
   card: {
      width: getCardWidth(),
      minWidth: 140,
      maxWidth: 170,
   },
});

export default function StatCard({ card }: StatCardProps) {
   const cardStyle = React.useMemo(
      () => ({
         shadowColor: card.color,
         shadowOffset: { width: 0, height: 8 },
         shadowOpacity: 0.2,
         shadowRadius: 16,
         elevation: 16,
      }),
      [card.color]
   );

   const iconContainerStyle = React.useMemo(
      () => ({
         shadowColor: card.color,
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 8,
         elevation: 8,
      }),
      [card.color]
   );

   return (
      <View
         className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 mb-4"
         style={[styles.card, cardStyle]}
      >
         <View className="items-center">
            {/* Icon with glassmorphism effect */}
            <View
               className="w-12 h-12 rounded-xl items-center justify-center mb-3 border border-white/30"
               style={[
                  {
                     backgroundColor: `${card.color}20`,
                  },
                  iconContainerStyle,
               ]}
            >
               <Ionicons name={card.icon as any} size={22} color={card.color} />
            </View>

            {/* Value - large and prominent with modern styling */}
            <Text className="text-white text-center font-bold text-2xl mb-1">
               {card.value}
            </Text>

            {/* Title - clean modern font without uppercase */}
            <Text className="text-white/90 text-center mb-2 font-semibold text-sm">
               {card.title}
            </Text>

            {/* Subtitle - subtle and clean */}
            <Text className="text-white/70 text-center text-xs font-medium leading-relaxed">
               {card.subtitle}
            </Text>
         </View>
      </View>
   );
}
