import {
   PlayerStatCard,
   StatCard,
   TopProfitPlayerCard,
} from '@/components/league/LeagueStats';
import Summary from '@/components/summary/summary';
import { useLocalization } from '@/context/localization';
import { useLeagueStats } from '@/hooks/useLeagueStats';
import { createStatCards } from '@/services/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
   ActivityIndicator,
   Pressable,
   RefreshControl,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from 'react-native';

// GlassmorphismLoader component for consistent loading state
const GlassmorphismLoader = React.memo<{ message?: string }>(({ message = 'Loading...' }) => {
   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={styles.loaderContainer}
      >
         <View style={styles.loaderContent}>
            <View style={styles.loaderInner}>
               <ActivityIndicator size="large" color="#60A5FA" />
               <Text style={styles.loaderText}>{message}</Text>
            </View>
         </View>
      </LinearGradient>
   );
});

GlassmorphismLoader.displayName = 'GlassmorphismLoader';

export default function LeagueStatsScreen() {
   const { t, isRTL } = useLocalization();
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

   const handleBack = React.useCallback(() => {
      router.back();
   }, []);

   // Memoized style objects to prevent recreation on every render
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

   const leagueHeaderStyle = React.useMemo(
      () => ({
         shadowColor: '#FFFFFF',
         shadowOffset: { width: 0, height: 8 },
         shadowOpacity: 0.1,
         shadowRadius: 16,
         elevation: 16,
      }),
      []
   );

   const imageStyle = React.useMemo(
      () => ({
         width: 100,
         height: 100,
         borderRadius: 20,
         shadowColor: '#FFFFFF',
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.2,
         shadowRadius: 8,
      }),
      []
   );

   if (isLoading) {
      return <GlassmorphismLoader message={t('loadingLeagueStats')} />;
   }

   if (error || !league || !stats) {
      return (
         <LinearGradient
            colors={['#1a0033', '#0f001a', '#000000']}
            style={{ flex: 1 }}
         >
            {/* Modern Dark Header */}
            <View className="flex-row items-center justify-between px-6 py-12 pt-16 bg-transparent">
               <Pressable
                  onPress={handleBack}
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center active:scale-95"
                  style={headerButtonStyle}
                  accessibilityRole="button"
                  accessibilityLabel={t('goBack')}
               >
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={20}
                     color="white"
                  />
               </Pressable>
               <Text className="text-white text-xl font-semibold">
                  {t('leagueStats')}
               </Text>
               <View className="w-12" />
            </View>

            <View className="flex-1 items-center justify-center p-8">
               <View
                  className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8"
                  style={{
                     shadowColor: '#FF0000',
                     shadowOffset: { width: 0, height: 8 },
                     shadowOpacity: 0.2,
                     shadowRadius: 16,
                     elevation: 16,
                  }}
               >
                  <Text className="text-red-400 text-center mb-6 font-semibold text-lg">
                     {t('error')}
                  </Text>
                  <Text className="text-white/80 text-center mb-8 font-medium">
                     {error || t('statsNotFound')}
                  </Text>
                  <Pressable
                     onPress={loadLeagueData}
                     className="bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-2xl px-6 py-3 active:scale-95"
                     accessibilityRole="button"
                     accessibilityLabel={t('retry')}
                  >
                     <Text className="text-red-400 text-center font-semibold">
                        {t('retry')}
                     </Text>
                  </Pressable>
               </View>
            </View>
         </LinearGradient>
      );
   }

   const statCards = createStatCards(stats, t);
   //   const topPlayers = createTopPlayers(stats, t);

   return (
      <LinearGradient
         colors={['#1a0033', '#0f001a', '#000000']}
         style={{ flex: 1 }}
      >
         {/* Modern Dark Header */}
         <View className="flex-row items-center justify-between px-6 py-12 pt-16 bg-transparent">
            <Pressable
               onPress={handleBack}
               className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center active:scale-95"
               style={headerButtonStyle}
               accessibilityRole="button"
               accessibilityLabel={t('goBack')}
            >
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={20}
                  color="white"
               />
            </Pressable>
            <Text className="text-white text-xl font-semibold">
               {t('leagueStats')}
            </Text>
            <View className="w-12" />
         </View>

         <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#FF1493']}
                  tintColor="#FF1493"
                  progressBackgroundColor="rgba(255, 255, 255, 0.1)"
               />
            }
         >
            {/* League Header with modern glass effect */}
            <View className="px-6 mb-6">
               <View
                  className="flex-row p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/20"
                  style={leagueHeaderStyle}
                  accessibilityRole="summary"
                  accessibilityLabel={`${t('leagueDetails')}: ${league.name}`}
               >
                  {league.imageUrl && (
                     <View className="mr-6">
                        <Image
                           source={{ uri: league.imageUrl }}
                           style={imageStyle}
                           contentFit="cover"
                           cachePolicy="memory-disk"
                           priority="high"
                           accessible={true}
                           accessibilityLabel={`${t('leagueImage')}: ${league.name}`}
                        />
                     </View>
                  )}

                  <View className="flex-1 justify-center">
                     <Text className="text-white mb-4 font-semibold text-xl">
                        {league.name}
                     </Text>
                     <Text className="text-white/70 font-medium">
                        {t('leagueStatistics')}
                     </Text>
                  </View>
               </View>
            </View>

            <Summary leagueId={parseInt(leagueId!)} />

            {/* Player Stats Cards Grid */}
            <View className="mb-8 px-6">
               <View
                  className="bg-blue-500/10 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6 mb-6"
                  style={{
                     shadowColor: '#3B82F6',
                     shadowOffset: { width: 0, height: 8 },
                     shadowOpacity: 0.2,
                     shadowRadius: 16,
                     elevation: 16,
                  }}
               >
                  <Text className="text-blue-300 text-center mb-4 text-xl font-semibold">
                     {t('playerStats')}
                  </Text>
                  <Text className="text-white/70 text-center font-medium">
                     {t('topPerformingPlayers')}
                  </Text>
               </View>

               <View className="flex-row flex-wrap justify-center items-start w-full gap-4">
                  <TopProfitPlayerCard leagueId={leagueId!} t={t} />
                  <PlayerStatCard
                     leagueId={leagueId!}
                     statType="most-active-player"
                     t={t}
                  />
                  <PlayerStatCard
                     leagueId={leagueId!}
                     statType="highest-single-game-profit"
                     t={t}
                  />
                  <PlayerStatCard
                     leagueId={leagueId!}
                     statType="most-consistent-player"
                     t={t}
                  />
                  <PlayerStatCard
                     leagueId={leagueId!}
                     statType="biggest-loser"
                     t={t}
                  />
               </View>
            </View>

            {/* Main Stats Grid */}
            <View className="mb-8 px-6">
               <View
                  className="bg-purple-500/10 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-6 mb-6"
                  style={{
                     shadowColor: '#8B5CF6',
                     shadowOffset: { width: 0, height: 8 },
                     shadowOpacity: 0.2,
                     shadowRadius: 16,
                     elevation: 16,
                  }}
               >
                  <Text className="text-purple-300 text-center mb-4 text-xl font-semibold">
                     {t('leagueOverview')}
                  </Text>
                  <Text className="text-white/70 text-center font-medium">
                     {t('generalStatistics')}
                  </Text>
               </View>

               <View className="flex-row flex-wrap justify-center items-start w-full gap-4">
                  {statCards.map((card, index) => (
                     <StatCard key={index} card={card} />
                  ))}
               </View>
            </View>

         </ScrollView>
      </LinearGradient>
   );
}

const styles = StyleSheet.create({
   loaderContainer: {
      flex: 1,
   },
   loaderContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
   },
   loaderInner: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 16,
   },
   loaderText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
   },
});
