import { colors } from '@/colors';
import StatsLeaderboardHero from '@/components/stats/StatsLeaderboardHero';
import StatsLeaderboardRow from '@/components/stats/StatsLeaderboardRow';
import StatsLeaderboardSkeleton from '@/components/stats/StatsLeaderboardSkeleton';
import { useLocalization } from '@/context/localization';
import { useStatsRankings } from '@/hooks/useStatsRankings';
import { StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
   Pressable,
   RefreshControl,
   StyleSheet,
   Text,
   View,
} from 'react-native';

export default function StatsLeaderboardScreen() {
   const { t, isRTL } = useLocalization();
   const { id: leagueId, statType } = useLocalSearchParams<{
      id: string;
      statType: StatType;
   }>();

   const { data, isLoading, refetch } = useStatsRankings(leagueId, statType);

   const [refreshing, setRefreshing] = React.useState(false);

   const onRefresh = React.useCallback(async () => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
   }, [refetch]);

   const handleBack = React.useCallback(() => {
      router.back();
   }, []);

   // Split data into hero (first player) and list (rest)
   const { heroPlayer, listData } = useMemo(() => {
      if (!data?.data || data.data.length === 0) {
         return { heroPlayer: null, listData: [] };
      }

      // If we already have a topPlayer in response, we could use that,
      // but let's just take the first one from data for consistency
      const [first, ...rest] = data.data;
      return { heroPlayer: first, listData: rest };
   }, [data]);

   // Title mapping
   const screenTitle = useMemo(() => {
      const titles: Record<StatType, string> = {
         'top-profit-player': 'topProfitPlayer',
         'most-active-player': 'mostActivePlayer',
         'highest-single-game-profit': 'highestSingleGameProfit',
         'best-winning-streak': 'bestWinningStreak',
      };
      return t(titles[statType] || 'leaderboard');
   }, [statType, t]);

   // Render item for FlashList
   const renderItem = React.useCallback(
      ({ item, index }: { item: any; index: number }) => (
         <StatsLeaderboardRow
            player={item}
            statType={statType}
            index={index}
            t={t}
         />
      ),
      [statType, t]
   );

   if (isLoading && !data) {
      return (
         <LinearGradient
            colors={[
               colors.cyberBackground,
               colors.cyberDarkBlue,
               colors.neonBlue,
            ]}
            style={styles.container}
         >
            <Stack.Screen options={{ headerShown: false }} />
            {/* Scan Lines Overlay */}
            <View style={styles.scanLinesOverlay} />
            {/* Corner Brackets */}
            <View style={styles.topLeftBracket} />
            <View style={styles.topRightBracket} />
            <View style={styles.bottomLeftBracket} />
            <View style={styles.bottomRightBracket} />
            {/* Header */}
            <View style={styles.header}>
               <Pressable onPress={handleBack} style={[styles.backButton]}>
                  <View style={styles.backButtonBrackets} />
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={24}
                     color={colors.neonCyan}
                  />
               </Pressable>
               <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>{screenTitle}</Text>
                  <View style={styles.headerTitleUnderline} />
               </View>
               <View style={styles.placeholder} />
            </View>
            <StatsLeaderboardSkeleton />
         </LinearGradient>
      );
   }

   return (
      <LinearGradient
         colors={[
            colors.cyberBackground,
            colors.cyberDarkBlue,
            colors.neonBlue,
         ]}
         style={styles.container}
      >
         <Stack.Screen options={{ headerShown: false }} />

         {/* Scan Lines Overlay */}
         <View style={styles.scanLinesOverlay} />
         {/* Corner Brackets */}
         <View style={styles.topLeftBracket} />
         <View style={styles.topRightBracket} />
         <View style={styles.bottomLeftBracket} />
         <View style={styles.bottomRightBracket} />

         {/* Header */}
         <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
               <View style={styles.backButtonBrackets} />
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={colors.neonCyan}
               />
            </Pressable>
            <View style={styles.headerTitleContainer}>
               <Text style={styles.headerTitle} numberOfLines={1}>
                  {screenTitle}
               </Text>
               <View style={styles.headerTitleUnderline} />
            </View>
            <View style={styles.placeholder} />
         </View>

         {/* Content */}
         <View style={styles.contentContainer}>
            <FlashList
               data={listData}
               renderItem={renderItem}
               contentContainerStyle={styles.listContent}
               ListHeaderComponent={
                  heroPlayer ? (
                     <StatsLeaderboardHero
                        player={heroPlayer}
                        statType={statType}
                        t={t}
                     />
                  ) : null
               }
               ListEmptyComponent={
                  !isLoading ? (
                     <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                           <Ionicons
                              name="stats-chart"
                              size={64}
                              color={colors.neonCyan}
                           />
                           <View style={styles.emptyIconGlow} />
                        </View>
                        <Text style={styles.emptyText}>
                           {t('noPlayersFound')}
                        </Text>
                        <Text style={styles.emptySubtext}>
                           SYSTEM STATUS: NO DATA DETECTED
                        </Text>
                     </View>
                  ) : null
               }
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={onRefresh}
                     tintColor={colors.neonCyan}
                     colors={[colors.neonCyan, colors.neonBlue]}
                     progressBackgroundColor={colors.cyberGray}
                  />
               }
               showsVerticalScrollIndicator={false}
            />
         </View>
      </LinearGradient>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   // Cyberpunk background effects
   scanLinesOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      opacity: 0.1,
      // Scan lines effect using repeating gradient
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
   },
   // Corner brackets
   topLeftBracket: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 20,
      height: 20,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      zIndex: 20,
   },
   topRightBracket: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 20,
      height: 20,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      zIndex: 20,
   },
   bottomLeftBracket: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      width: 20,
      height: 20,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      zIndex: 20,
   },
   bottomRightBracket: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      width: 20,
      height: 20,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      zIndex: 20,
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 24,
      zIndex: 15,
   },
   backButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
   },
   backButtonBrackets: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      backgroundColor: colors.holoBlue,
      // Corner cuts for angular look
      borderTopLeftRadius: 0,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 0,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
   },
   headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
   },
   headerTitle: {
      color: colors.neonCyan,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontFamily: 'monospace',
      textShadowColor: colors.shadowNeonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   },
   headerTitleUnderline: {
      marginTop: 4,
      height: 1,
      width: '60%',
      backgroundColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
   },
   placeholder: {
      width: 48,
   },
   contentContainer: {
      flex: 1,
      position: 'relative',
   },
   listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
   },
   emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
   },
   emptyIconContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
   },
   emptyIconGlow: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.neonCyan,
      opacity: 0.2,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
   },
   emptyText: {
      color: colors.neonCyan,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: 'monospace',
      textShadowColor: colors.shadowNeonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
   },
   emptySubtext: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '400',
      textAlign: 'center',
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
   },
});
