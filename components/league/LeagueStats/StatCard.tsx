import { StatCard as StatCardType } from '@/services/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

// Define cyberpunk color variants for different cards
const getCyberpunkColor = (index: number, fallbackColor: string) => {
   const cyberpunkColors = [
      '#FF1493', // Hot Pink
      '#00FFFF', // Cyan
      '#8A2BE2', // Blue Violet
      '#FF6B35', // Orange
      '#39FF14', // Electric Green
      '#00FFFF', // Cyan
   ];

   // Use the index to assign different colors to different cards
   // Fall back to card.color if index is out of range
   return cyberpunkColors[index % cyberpunkColors.length] || fallbackColor;
};

export default function StatCard({ card }: StatCardProps) {
   // Generate a stable index based on card title for consistent coloring
   const cardIndex = React.useMemo(() => {
      return (
         card.title
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6
      );
   }, [card.title]);

   const cyberpunkColor = getCyberpunkColor(cardIndex, card.color);

   const cardStyle = React.useMemo(
      () => ({
         shadowColor: cyberpunkColor,
         shadowOffset: { width: 0, height: 0 },
         shadowOpacity: 0.6,
         shadowRadius: 12,
         elevation: 12,
      }),
      [cyberpunkColor]
   );

   const iconContainerStyle = React.useMemo(
      () => ({
         shadowColor: cyberpunkColor,
         shadowOffset: { width: 0, height: 0 },
         shadowOpacity: 0.8,
         shadowRadius: 8,
         elevation: 8,
      }),
      [cyberpunkColor]
   );

   return (
      <View
         className="bg-black/90 border-2 p-4 mb-4 relative overflow-hidden"
         style={[styles.card, cardStyle, { borderColor: cyberpunkColor }]}
      >
         {/* Corner brackets for cyberpunk aesthetic */}
         <View
            className="absolute top-1.5 left-1.5 w-3 h-3 border-l-2 border-t-2"
            style={{ borderColor: cyberpunkColor }}
         />
         <View
            className="absolute top-1.5 right-1.5 w-3 h-3 border-r-2 border-t-2"
            style={{ borderColor: '#00FFFF' }}
         />
         <View
            className="absolute bottom-1.5 left-1.5 w-3 h-3 border-l-2 border-b-2"
            style={{ borderColor: '#00FFFF' }}
         />
         <View
            className="absolute bottom-1.5 right-1.5 w-3 h-3 border-r-2 border-b-2"
            style={{ borderColor: cyberpunkColor }}
         />

         {/* Holographic overlay effect */}
         <LinearGradient
            colors={[`${cyberpunkColor}10`, 'transparent', '#00FFFF08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               opacity: 0.7,
            }}
         />

         {/* Scan lines for digital effect */}
         <View
            className="absolute top-2 left-0 right-0 h-px"
            style={{ backgroundColor: cyberpunkColor, opacity: 0.3 }}
         />
         <View
            className="absolute bottom-2 left-0 right-0 h-px"
            style={{ backgroundColor: '#00FFFF', opacity: 0.3 }}
         />

         <View className="items-center relative z-10">
            {/* Angular icon container with neon glow */}
            <View
               className="w-14 h-14 items-center justify-center mb-3 border-2 relative"
               style={[
                  {
                     backgroundColor: `${cyberpunkColor}20`,
                     borderColor: cyberpunkColor,
                  },
                  iconContainerStyle,
               ]}
            >
               {/* Inner corner brackets for icon */}
               <View
                  className="absolute top-1 left-1 w-2 h-2 border-l border-t"
                  style={{ borderColor: '#00FFFF' }}
               />
               <View
                  className="absolute top-1 right-1 w-2 h-2 border-r border-t"
                  style={{ borderColor: '#00FFFF' }}
               />
               <View
                  className="absolute bottom-1 left-1 w-2 h-2 border-l border-b"
                  style={{ borderColor: '#00FFFF' }}
               />
               <View
                  className="absolute bottom-1 right-1 w-2 h-2 border-r border-b"
                  style={{ borderColor: '#00FFFF' }}
               />

               <Ionicons
                  name={card.icon as any}
                  size={24}
                  color={cyberpunkColor}
               />
            </View>

            {/* Value - bright and cyberpunk styled */}
            <Text
               className="text-center font-mono font-bold text-2xl mb-1"
               style={{
                  color: cyberpunkColor,
                  textShadowColor: cyberpunkColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
               }}
            >
               {card.value}
            </Text>

            {/* Title - bright cyberpunk font */}
            <Text
               className="text-center mb-2 font-mono font-bold text-sm tracking-wider uppercase"
               style={{
                  color: '#FFFFFF',
                  textShadowColor: '#FFFFFF',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
               }}
            >
               {card.title}
            </Text>

            {/* Subtitle - cyan accent for contrast */}
            <Text
               className="text-center text-xs font-mono tracking-wide"
               style={{
                  color: '#00FFFF',
                  textShadowColor: '#00FFFF',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 2,
               }}
            >
               {card.subtitle}
            </Text>
         </View>
      </View>
   );
}
