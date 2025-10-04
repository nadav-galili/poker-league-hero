import { colors } from '@/colors';
import { Text } from '@/components/Text';
import { StatCard as StatCardType } from '@/services/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface StatCardProps {
   card: StatCardType;
}

export default function StatCard({ card }: StatCardProps) {
   return (
      <View className="w-[45%] bg-white p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000000] mb-4">
         <View className="items-center">
            {/* Icon with dynamic background color */}
            <View
               className="w-14 h-14 rounded-lg items-center justify-center mb-3 border-2 border-black"
               style={{ backgroundColor: card.color + '20' }}
            >
               <Ionicons name={card.icon as any} size={28} color={card.color} />
            </View>

            {/* Value - large and bold */}
            <Text
               variant="h3"
               color={colors.text}
               className="text-center font-black mb-1"
            >
               {card.value}
            </Text>

            {/* Title - uppercase and prominent */}
            <Text
               variant="labelSmall"
               color={colors.textSecondary}
               className="text-center mb-2 uppercase tracking-widest font-bold"
            >
               {card.title}
            </Text>

            {/* Subtitle - smaller and muted */}
            <Text
               variant="captionSmall"
               color={colors.textMuted}
               className="text-center text-xs leading-tight"
            >
               {card.subtitle}
            </Text>
         </View>
      </View>
   );
}
