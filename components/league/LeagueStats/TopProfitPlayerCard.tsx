import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { useTopProfitPlayer } from '@/hooks/useTopProfitPlayer';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

// @ts-ignore - local image import
import anonymousImage from '@/assets/images/anonymous.webp';

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

   if (isLoading) {
      return (
         <View
            className="bg-cyber-dark border-2 border-neonGreen p-4 mb-4 relative"
            style={[styles.card, styles.cyberpunkCard]}
         >
            {/* Corner Brackets */}
            <View style={styles.cornerBrackets}>
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topLeft,
                     { borderColor: '#00ff88' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.topRight,
                     { borderColor: '#00ff88' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomLeft,
                     { borderColor: '#00ff88' },
                  ]}
               />
               <View
                  style={[
                     styles.cornerBracket,
                     styles.bottomRight,
                     { borderColor: '#00ff88' },
                  ]}
               />
            </View>
            <View className="items-center justify-center py-6">
               <View
                  className="w-10 h-10 bg-neonGreen/20 border-2 border-neonGreen items-center justify-center mb-3"
                  style={styles.cyberpunkIcon}
               >
                  <CyberpunkLoader size="small" variant="green" />
               </View>
               <Text className="text-neonGreen text-xs font-bold tracking-wide">
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
            style={[styles.card, styles.cyberpunkCard]}
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
                  <Ionicons name="trophy-outline" size={18} color="#ff0080" />
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
         className="bg-cyber-dark border-2 border-neonGreen p-4 mb-4 relative"
         style={[styles.card, styles.cyberpunkCard]}
      >
         {/* Corner Brackets */}
         <View style={styles.cornerBrackets}>
            <View
               style={[
                  styles.cornerBracket,
                  styles.topLeft,
                  { borderColor: '#00ff88' },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.topRight,
                  { borderColor: '#00ff88' },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomLeft,
                  { borderColor: '#00ff88' },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomRight,
                  { borderColor: '#00ff88' },
               ]}
            />
         </View>

         {/* Header with Icon */}
         <View className="flex-row items-center justify-between mb-3">
            <View
               className="w-10 h-10 bg-neonGreen/20 border-2 border-neonGreen items-center justify-center"
               style={styles.cyberpunkIcon}
            >
               <Ionicons name="trophy" size={18} color="#00ff88" />
            </View>
            <Text
               className="text-neonGreen text-xs font-bold flex-1 text-right tracking-wide"
               numberOfLines={2}
            >
               {t('topProfitPlayer')}
            </Text>
         </View>

         {/* Player Avatar */}
         <View className="items-center mb-3">
            {data.profileImageUrl || data.userId === -1 ? (
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
                     style={[styles.avatarBorder, { borderColor: '#00ff88' }]}
                  />
               </View>
            ) : (
               <View
                  className="w-14 h-14 bg-neonGreen/20 border-2 border-neonGreen items-center justify-center"
                  style={styles.cyberpunkAvatar}
               >
                  <Ionicons name="person" size={24} color="#00ff88" />
               </View>
            )}
         </View>

         {/* Player Info */}
         <View className="items-center">
            <Text
               className="text-cyber-white text-base font-black text-center mb-1 tracking-wide"
               style={{
                  textShadowColor: '#00ff88',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
               }}
               numberOfLines={1}
            >
               {data.fullName}
            </Text>
            <Text
               className="text-neonGreen text-xl font-black mb-2 tracking-wider"
               style={{
                  textShadowColor: '#00ff88',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
               }}
            >
               {formatCurrency(data.totalProfit)}
            </Text>
            <View
               className="px-3 py-1.5 border-2 border-neonGreen bg-neonGreen/10"
               style={styles.statBadge}
            >
               <Text
                  className="text-neonGreen font-bold text-xs tracking-wide"
                  style={{
                     textShadowColor: '#00ff88',
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 6,
                  }}
               >
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
      minHeight: 240,
   },
   cyberpunkCard: {
      shadowColor: '#00ff88',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 25,
   },
   cyberpunkIcon: {
      shadowColor: '#00ff88',
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
      shadowColor: '#00ff88',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 15,
   },
   statBadge: {
      shadowColor: '#00ff88',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 10,
   },
});
