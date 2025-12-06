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
import Animated, {
   FadeIn,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';

// Animated Pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StatsLeaderboardScreen() {
   const { t, isRTL } = useLocalization();
   const { id: leagueId, statType } = useLocalSearchParams<{
      id: string;
      statType: StatType;
   }>();

   const { data, isLoading, error, refetch } = useStatsRankings(
      leagueId,
      statType
   );

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
         'most-consistent-player': 'mostConsistentPlayer',
         'biggest-loser': 'biggestLoser',
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

   const headerButtonStyle = React.useMemo(
      () => ({
         shadowColor: '#000000',
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 8,
         elevation: 8,
      }),
      []
   );

   if (isLoading && !data) {
      return (
         <LinearGradient
            colors={['#1a0033', '#0f001a', '#000000']}
            style={styles.container}
         >
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View style={styles.header}>
               <Pressable
                  onPress={handleBack}
                  style={[styles.backButton, headerButtonStyle]}
               >
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={24}
                     color="white"
                  />
               </Pressable>
               <Text style={styles.headerTitle}>{screenTitle}</Text>
               <View style={styles.placeholder} />
            </View>
            <StatsLeaderboardSkeleton />
         </LinearGradient>
      );
   }

   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={styles.container}
      >
         <Stack.Screen options={{ headerShown: false }} />

         {/* Header */}
         <View style={styles.header}>
            <AnimatedPressable
               onPress={handleBack}
               style={[styles.backButton, headerButtonStyle]}
               entering={FadeIn.duration(300)}
            >
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color="white"
               />
            </AnimatedPressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
               {screenTitle}
            </Text>
            <View style={styles.placeholder} />
         </View>

         {/* Content */}
         <FlashList
            data={listData}
            renderItem={renderItem}
            estimatedItemSize={80}
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
                     <Text style={styles.emptyText}>{t('noPlayersFound')}</Text>
                  </View>
               ) : null
            }
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#FFFFFF"
                  colors={['#FFFFFF']}
               />
            }
            showsVerticalScrollIndicator={false}
         />
      </LinearGradient>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 24,
      zIndex: 10,
   },
   backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
   },
   headerTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
   },
   placeholder: {
      width: 44,
   },
   listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
   },
   emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
   },
   emptyText: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 16,
   },
});

