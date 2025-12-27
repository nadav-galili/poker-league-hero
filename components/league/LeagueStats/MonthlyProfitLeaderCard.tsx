import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { usePlayerStat } from '@/hooks/usePlayerStat';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

const { width: screenWidth } = Dimensions.get('window');

interface MonthlyProfitLeaderCardProps {
   leagueId: string;
   t: (key: string) => string;
}

export default function MonthlyProfitLeaderCard({
   leagueId,
   t,
}: MonthlyProfitLeaderCardProps) {
   const { data, isLoading, error } = usePlayerStat(
      leagueId,
      'monthly-profit-leader'
   );

   // Pulsing dot animation
   const [pulseAnim] = useState(new Animated.Value(1));

   useEffect(() => {
      const pulse = Animated.loop(
         Animated.sequence([
            Animated.timing(pulseAnim, {
               toValue: 1.3,
               duration: 800,
               useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
               toValue: 1,
               duration: 800,
               useNativeDriver: true,
            }),
         ])
      );
      pulse.start();
      return () => pulse.stop();
   }, []);

   // Get current month and year
   const currentMonth = dayjs().format('MMM YYYY').toUpperCase();

   // Determine profit color based on value
   const getProfitColor = (profit: number | string | undefined | null) => {
      if (profit === null || profit === undefined) return '#00FFFF'; // Cyan for no data
      const numProfit = typeof profit === 'string' ? parseFloat(profit) : profit;
      return numProfit >= 0 ? '#00FF00' : '#FF1493'; // Green for positive, Magenta for negative
   };

   const profitColor = getProfitColor(data?.value);

   if (isLoading) {
      return (
         <View
            className="bg-black/90 border-2 border-[#00FFFF] p-4 mb-4 relative"
            style={[styles.card, getCyberpunkCardStyle('#00FFFF')]}
         >
            {/* Holographic Gradient Overlay */}
            <LinearGradient
               colors={['rgba(0, 255, 255, 0.1)', 'rgba(255, 20, 147, 0.05)', 'rgba(0, 255, 0, 0.1)']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={styles.holographicOverlay}
            />

            {/* Corner Brackets */}
            <View style={styles.cornerBrackets}>
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topLeft,
                     { borderColor: '#00FFFF' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topRight,
                     { borderColor: '#00FFFF' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomLeft,
                     { borderColor: '#00FFFF' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomRight,
                     { borderColor: '#00FFFF' },
                  ]}
               />
            </View>

            <View className="items-center justify-center py-6">
               <View
                  className="w-10 h-10 border-2 items-center justify-center mb-3"
                  style={[
                     styles.cyberpunkIcon,
                     {
                        backgroundColor: 'rgba(0, 255, 255, 0.2)',
                        borderColor: '#00FFFF',
                     },
                  ]}
               >
                  <CyberpunkLoader size="small" variant="cyan" />
               </View>
               <Text
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{
                     color: '#00FFFF',
                     letterSpacing: 2,
                  }}
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
            className="bg-black/90 border-2 border-[#FF1493] p-4 mb-4 relative"
            style={[styles.card, getCyberpunkCardStyle('#FF1493')]}
         >
            {/* Holographic Gradient Overlay */}
            <LinearGradient
               colors={['rgba(255, 20, 147, 0.1)', 'rgba(255, 0, 128, 0.05)']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={styles.holographicOverlay}
            />

            {/* Corner Brackets */}
            <View style={styles.cornerBrackets}>
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topLeft,
                     { borderColor: '#FF1493' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topRight,
                     { borderColor: '#FF1493' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomLeft,
                     { borderColor: '#FF1493' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomRight,
                     { borderColor: '#FF1493' },
                  ]}
               />
            </View>

            <View className="items-center justify-center py-6">
               <View
                  className="w-10 h-10 border-2 items-center justify-center mb-3"
                  style={[
                     styles.cyberpunkIcon,
                     {
                        backgroundColor: 'rgba(255, 20, 147, 0.2)',
                        borderColor: '#FF1493',
                     },
                  ]}
               >
                  <Ionicons name="calendar-outline" size={18} color="#FF1493" />
               </View>
               <Text
                  className="text-xs font-bold text-center tracking-widest uppercase"
                  style={{
                     color: '#FF1493',
                     letterSpacing: 2,
                  }}
               >
                  {error || t('noGamesThisMonth')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View
         className="bg-black/90 border-2 p-4 mb-4 relative"
         style={[
            styles.card,
            getCyberpunkCardStyle(profitColor),
            { borderColor: profitColor },
         ]}
      >
         {/* Holographic Gradient Overlay */}
         <LinearGradient
            colors={[
               `${profitColor}15`,
               'rgba(0, 0, 0, 0)',
               `${profitColor}10`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.holographicOverlay}
         />

         {/* Corner Brackets */}
         <View style={styles.cornerBrackets}>
            <View
               style={[
                  styles.cornerBracket,
                  styles.topLeft,
                  { borderColor: profitColor },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.topRight,
                  { borderColor: profitColor },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomLeft,
                  { borderColor: profitColor },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomRight,
                  { borderColor: profitColor },
               ]}
            />
         </View>

         {/* Header with Icon and Title */}
         <View className="flex-row items-center justify-between mb-3">
            <View
               className="w-10 h-10 border-2 items-center justify-center"
               style={[
                  styles.cyberpunkIcon,
                  {
                     backgroundColor: `${profitColor}20`,
                     borderColor: profitColor,
                  },
               ]}
            >
               <Ionicons name="calendar" size={18} color={profitColor} />
            </View>
            <Text
               className="text-xs font-bold flex-1 text-right tracking-widest uppercase"
               style={{
                  color: profitColor,
                  letterSpacing: 2,
                  textShadowColor: profitColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
               }}
               numberOfLines={2}
            >
               {t('monthlyProfitLeader')}
            </Text>
         </View>

         {/* Current Month with Pulsing Dot */}
         <View className="flex-row items-center justify-center mb-3">
            <Animated.View
               style={[
                  styles.pulsingDot,
                  {
                     backgroundColor: profitColor,
                     transform: [{ scale: pulseAnim }],
                  },
               ]}
            />
            <Text
               className="text-xs font-bold tracking-widest uppercase ml-2"
               style={{
                  color: profitColor,
                  letterSpacing: 3,
                  textShadowColor: profitColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
               }}
            >
               {currentMonth}
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
                        { borderColor: profitColor },
                     ]}
                  />
               </View>
            ) : (
               <View
                  className="w-14 h-14 border-2 items-center justify-center"
                  style={[
                     styles.cyberpunkAvatar,
                     {
                        backgroundColor: `${profitColor}20`,
                        borderColor: profitColor,
                     },
                  ]}
               >
                  <Ionicons name="person" size={24} color={profitColor} />
               </View>
            )}
         </View>

         {/* Player Info */}
         <View className="items-center">
            <Text
               className="text-base font-black text-center mb-1 tracking-wide uppercase"
               style={{
                  color: '#FFFFFF',
                  letterSpacing: 1.5,
                  textShadowColor: profitColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
               }}
               numberOfLines={1}
            >
               {data.fullName}
            </Text>
            <Text
               className="text-xl font-black mb-2 tracking-wider"
               style={{
                  color: profitColor,
                  letterSpacing: 2,
                  textShadowColor: profitColor,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
               }}
            >
               {formatCurrency(data.value)}
            </Text>

            {/* Games Played Badge */}
            {data.additionalData?.gamesPlayed && (
               <View
                  className="px-3 py-1.5 border-2"
                  style={[
                     styles.statBadge,
                     {
                        backgroundColor: `${profitColor}10`,
                        borderColor: profitColor,
                     },
                  ]}
               >
                  <Text
                     className="font-bold text-xs tracking-widest uppercase"
                     style={{
                        color: profitColor,
                        letterSpacing: 1.5,
                        textShadowColor: profitColor,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 6,
                     }}
                  >
                     {data.additionalData.gamesPlayed} {t('gamesPlayed')}
                  </Text>
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

// Cyberpunk style generator with neon glow
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
   },
   holographicOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
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
      pointerEvents: 'none',
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
   pulsingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 10,
   },
});
