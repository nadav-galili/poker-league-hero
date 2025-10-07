import { StatCard as StatCardType } from '@/services/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
   card: StatCardType;
}

// Memoized style objects to prevent recreation on every render
const styles = StyleSheet.create({
   // Add any static styles here if needed in the future
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
         className="w-[45%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-4"
         style={cardStyle}
      >
         <View className="items-center">
            {/* Icon with glassmorphism effect */}
            <View
               className="w-16 h-16 rounded-2xl items-center justify-center mb-4 border border-white/30"
               style={[
                  {
                     backgroundColor: `${card.color}20`,
                  },
                  iconContainerStyle,
               ]}
            >
               <Ionicons name={card.icon as any} size={28} color={card.color} />
            </View>

            {/* Value - large and prominent with modern styling */}
            <Text className="text-white text-center font-bold text-3xl mb-2">
               {card.value}
            </Text>

            {/* Title - clean modern font without uppercase */}
            <Text className="text-white/90 text-center mb-3 font-semibold text-base">
               {card.title}
            </Text>

            {/* Subtitle - subtle and clean */}
            <Text className="text-white/70 text-center text-sm font-medium leading-relaxed">
               {card.subtitle}
            </Text>
         </View>
      </View>
   );
}
