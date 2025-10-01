/**
 * Enhanced League Stats Screen with Animations
 * Features animated counters, progress rings, and enhanced visual hierarchy
 */

import { colors, getTheme } from '@/colors';
import { AnimatedStatsCard, AnimatedNumber, BrutalistComparisonChart } from './AnimatedStatsCard';
import { BrutalistProgressBar } from '@/components/feedback/BrutalistProgressBar';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Text } from '@/components/Text';
import { useNavigation } from '@/context/navigation';
import { useLocalization } from '@/context/localization';
import { useLeagueStats } from '@/hooks/useLeagueStats';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useMemo } from 'react';
import {
   Animated,
   Dimensions,
   RefreshControl,
   ScrollView,
   View,
   Easing,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EnhancedLeagueStatsScreen() {
   const theme = getTheme('light');
   const { t } = useLocalization();
   const { setBreadcrumbs } = useNavigation();
   const { id: leagueId } = useLocalSearchParams<{ id: string }>();

   const {
      league,
      stats,
      isLoading,
      error,
      refreshing,
      loadLeagueData,
      handleRefresh,
   } = useLeagueStats(leagueId);

   // Animation refs
   const headerAnim = useRef(new Animated.Value(0)).current;
   const contentAnim = useRef(new Animated.Value(0)).current;

   // Set up breadcrumbs
   useEffect(() => {
      if (league) {
         setBreadcrumbs([
            { id: 'leagues', label: 'My Leagues', onPress: () => router.push('/(tabs)/my-leagues') },
            { id: 'league', label: league.name, onPress: () => router.back() },
            { id: 'stats', label: 'Statistics', isActive: true },
         ]);
      }
   }, [league, setBreadcrumbs]);

   // Entrance animations with proper cleanup
   useEffect(() => {
      let animationSequence: Animated.CompositeAnimation | null = null;

      if (!isLoading && league && stats) {
         animationSequence = Animated.sequence([
            Animated.timing(headerAnim, {
               toValue: 1,
               duration: 600,
               easing: Easing.out(Easing.back(1.2)),
               useNativeDriver: true,
            }),
            Animated.timing(contentAnim, {
               toValue: 1,
               duration: 400,
               easing: Easing.out(Easing.cubic),
               useNativeDriver: true,
            }),
         ]);

         animationSequence.start();
      }

      // Cleanup function to prevent memory leaks
      return () => {
         if (animationSequence) {
            animationSequence.stop();
         }
         headerAnim.stopAnimation();
         contentAnim.stopAnimation();
      };
   }, [isLoading, league, stats, headerAnim, contentAnim]);

   if (isLoading) {
      return <LoadingState message="Loading league statistics..." />;
   }

   if (error || !league || !stats) {
      return (
         <View style={{ flex: 1, backgroundColor: theme.background }}>
            <ScreenHeader
               title="Statistics"
               showBack={true}
               variant="hero"
            />
            <View className="flex-1 items-center justify-center px-8">
               <Ionicons name="stats-chart" size={64} color={theme.error} />
               <Text variant="h3" className="text-center mt-4 mb-2" style={{ color: theme.error }}>
                  {t('error')}
               </Text>
               <Text variant="body" className="text-center mb-6" style={{ color: theme.textMuted }}>
                  {error || 'Unable to load statistics'}
               </Text>
               <View
                  className="px-6 py-3 rounded-xl border-4"
                  style={{
                     backgroundColor: theme.primary,
                     borderColor: theme.border,
                  }}
                  onTouchEnd={loadLeagueData}
               >
                  <Text variant="labelMedium" style={{ color: colors.textInverse }}>
                     {t('retry')}
                  </Text>
               </View>
            </View>
         </View>
      );
   }

   // Memoize expensive stats calculations to prevent unnecessary re-renders
   const transformedStats = useMemo(() => ({
      totalGames: stats?.totalGames || 0,
      totalPlayers: stats?.totalPlayers || 0,
      totalBuyIns: stats?.totalBuyIns || 0,
      averageBuyIn: stats?.averageBuyIn || 0,
      totalProfit: stats?.totalProfit || 0,
      averageGameDuration: stats?.averageGameDuration || 0,
      winRate: stats?.winRate || 0,
      biggestPot: stats?.biggestPot || 0,
   }), [stats]);

   const playerComparisonData = useMemo(() => {
      if (!stats?.playerStats || stats.playerStats.length === 0) return [];

      return [
         { label: 'Most Wins', value: Math.max(...stats.playerStats.map(p => p.wins || 0)), color: theme.success },
         { label: 'Best Profit', value: Math.max(...stats.playerStats.map(p => p.totalProfit || 0)), color: theme.primary },
         { label: 'Games Played', value: Math.max(...stats.playerStats.map(p => p.gamesPlayed || 0)), color: theme.accent },
      ];
   }, [stats?.playerStats, theme]);

   return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
         <ScreenHeader
            title={league.name}
            subtitle="League Statistics"
            showBack={true}
            variant="hero"
            backgroundColor={theme.primary}
         />

         <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.primary]}
                  tintColor={theme.primary}
               />
            }
            contentContainerStyle={{
               paddingBottom: 32,
            }}
         >
            {/* Hero Statistics */}
            <Animated.View
               className="px-6 py-8 items-center"
               style={{
                  backgroundColor: `${theme.primary}10`,
                  transform: [{
                     translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                     }),
                  }],
                  opacity: headerAnim,
               }}
            >
               <View className="flex-row items-center mb-4">
                  <Ionicons name="trophy" size={32} color={theme.primary} />
                  <View className="ml-4">
                     <Text variant="h2" className="font-bold" style={{ color: theme.primary }}>
                        {league.name}
                     </Text>
                     <Text variant="caption" className="uppercase tracking-wide" style={{ color: theme.textMuted }}>
                        League Code: {league.code}
                     </Text>
                  </View>
               </View>

               {/* Quick Stats */}
               <View className="flex-row justify-around w-full">
                  <View className="items-center">
                     <AnimatedNumber
                        value={transformedStats.totalGames}
                        variant="h1"
                        style={{
                           fontSize: 32,
                           fontWeight: 'bold',
                           color: theme.primary,
                        }}
                     />
                     <Text variant="captionSmall" className="uppercase tracking-wide" style={{ color: theme.textMuted }}>
                        Games
                     </Text>
                  </View>
                  <View className="items-center">
                     <AnimatedNumber
                        value={transformedStats.totalPlayers}
                        variant="h1"
                        style={{
                           fontSize: 32,
                           fontWeight: 'bold',
                           color: theme.secondary,
                        }}
                     />
                     <Text variant="captionSmall" className="uppercase tracking-wide" style={{ color: theme.textMuted }}>
                        Players
                     </Text>
                  </View>
                  <View className="items-center">
                     <AnimatedNumber
                        value={transformedStats.totalBuyIns}
                        formatter={(value) => `$${value.toLocaleString()}`}
                        variant="h1"
                        style={{
                           fontSize: 28,
                           fontWeight: 'bold',
                           color: theme.success,
                        }}
                     />
                     <Text variant="captionSmall" className="uppercase tracking-wide" style={{ color: theme.textMuted }}>
                        Total Buy-ins
                     </Text>
                  </View>
               </View>
            </Animated.View>

            {/* Detailed Statistics Grid */}
            <Animated.View
               className="px-4 py-6"
               style={{
                  opacity: contentAnim,
                  transform: [{
                     translateY: contentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                     }),
                  }],
               }}
            >
               <Text
                  variant="h3"
                  className="text-center font-bold uppercase tracking-widest mb-6"
                  style={{ color: theme.text }}
               >
                  Detailed Analytics
               </Text>

               <View className="flex-row flex-wrap justify-between">
                  <AnimatedStatsCard
                     title="Average Buy-in"
                     value={`$${transformedStats.averageBuyIn}`}
                     icon="cash"
                     color={theme.primary}
                     delay={200}
                     animateNumber={false}
                  />

                  <AnimatedStatsCard
                     title="Total Profit"
                     value={`$${transformedStats.totalProfit}`}
                     icon="trending-up"
                     subtitle="All players combined"
                     trend={transformedStats.totalProfit > 0 ? 'up' : 'down'}
                     trendValue={transformedStats.totalProfit > 0 ? '+' : ''}
                     color={transformedStats.totalProfit > 0 ? theme.success : theme.error}
                     delay={400}
                     animateNumber={false}
                  />

                  <AnimatedStatsCard
                     title="Average Duration"
                     value={`${Math.round(transformedStats.averageGameDuration)}min`}
                     icon="time"
                     subtitle="Per game"
                     color={theme.accent}
                     delay={600}
                     animateNumber={true}
                  />

                  <AnimatedStatsCard
                     title="Biggest Pot"
                     value={`$${transformedStats.biggestPot}`}
                     icon="diamond"
                     subtitle="Single game record"
                     color={theme.secondary}
                     delay={800}
                     animateNumber={false}
                  />

                  <AnimatedStatsCard
                     title="Win Rate"
                     value={`${transformedStats.winRate.toFixed(1)}%`}
                     icon="medal"
                     subtitle="Average across players"
                     showProgress={true}
                     progressValue={transformedStats.winRate}
                     maxValue={100}
                     color={theme.info}
                     delay={1000}
                     animateNumber={false}
                  />

                  <AnimatedStatsCard
                     title="Activity Score"
                     value="85"
                     icon="flash"
                     subtitle="League activity level"
                     showProgress={true}
                     progressValue={85}
                     maxValue={100}
                     color={theme.highlight}
                     delay={1200}
                     animateNumber={true}
                  />
               </View>
            </Animated.View>

            {/* Comparison Charts */}
            {playerComparisonData.length > 0 && (
               <Animated.View
                  className="px-4"
                  style={{
                     opacity: contentAnim,
                     transform: [{
                        translateY: contentAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [50, 0],
                        }),
                     }],
                  }}
               >
                  <BrutalistComparisonChart
                     title="Player Performance Comparison"
                     data={playerComparisonData}
                     delay={1400}
                  />
               </Animated.View>
            )}

            {/* League Performance Overview */}
            <Animated.View
               className="px-4 mb-8"
               style={{
                  opacity: contentAnim,
                  transform: [{
                     translateY: contentAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                     }),
                  }],
               }}
            >
               <View
                  className="p-6 rounded-xl border-4 items-center"
                  style={{
                     backgroundColor: theme.surfaceElevated,
                     borderColor: theme.border,
                     shadowColor: theme.shadow,
                     shadowOffset: { width: 4, height: 4 },
                     shadowOpacity: 1,
                     shadowRadius: 0,
                     elevation: 8,
                  }}
               >
                  <Text
                     variant="h4"
                     className="font-bold uppercase tracking-wide text-center mb-6"
                     style={{ color: theme.text }}
                  >
                     League Performance
                  </Text>

                  <View className="w-full">
                     <View className="flex-row justify-between items-center mb-4">
                        <Text variant="caption" style={{ color: theme.textSecondary }}>
                           Games Completed
                        </Text>
                        <Text variant="caption" className="font-bold" style={{ color: theme.primary }}>
                           {transformedStats.totalGames}
                        </Text>
                     </View>

                     <BrutalistProgressBar
                        progress={(transformedStats.totalGames / 50) * 100} // Assuming 50 games is maximum
                        variant="chunky"
                        size="large"
                        showLabel={false}
                        animated={true}
                        color={theme.primary}
                     />

                     <View className="flex-row justify-between mt-6">
                        <View className="items-center">
                           <Text variant="h4" className="font-bold" style={{ color: theme.success }}>
                              {Math.round(transformedStats.winRate)}%
                           </Text>
                           <Text variant="captionSmall" className="uppercase" style={{ color: theme.textMuted }}>
                              Avg Win Rate
                           </Text>
                        </View>

                        <View className="items-center">
                           <Text variant="h4" className="font-bold" style={{ color: theme.accent }}>
                              ${Math.round(transformedStats.averageBuyIn)}
                           </Text>
                           <Text variant="captionSmall" className="uppercase" style={{ color: theme.textMuted }}>
                              Avg Buy-in
                           </Text>
                        </View>

                        <View className="items-center">
                           <Text variant="h4" className="font-bold" style={{ color: theme.secondary }}>
                              {Math.round(transformedStats.averageGameDuration)}m
                           </Text>
                           <Text variant="captionSmall" className="uppercase" style={{ color: theme.textMuted }}>
                              Avg Duration
                           </Text>
                        </View>
                     </View>
                  </View>
               </View>
            </Animated.View>
         </ScrollView>
      </View>
   );
}