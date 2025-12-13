import RecentGameResults from '@/components/game/RecentGameResults';
import {
   PlayerStatCard,
   StatCard,
   TopProfitPlayerCard,
} from '@/components/league/LeagueStats';
import { EditLeagueModal } from '@/components/modals/EditLeagueModal';
import Summary from '@/components/summary/summary';
import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useEditLeague } from '@/hooks/useEditLeague';
import { useLeagueGames } from '@/hooks/useLeagueGames';
import { useLeagueStats } from '@/hooks/useLeagueStats';
import { createStatCards } from '@/services/leagueStatsHelpers';
import { StatType } from '@/services/leagueStatsService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
   Pressable,
   RefreshControl,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from 'react-native';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableStatCard = ({
   children,
   onPress,
}: {
   children: React.ReactNode;
   onPress: () => void;
}) => {
   const scale = useSharedValue(1);

   const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
   }));

   return (
      <AnimatedPressable
         onPress={onPress}
         onPressIn={() => (scale.value = withSpring(0.95))}
         onPressOut={() => (scale.value = withSpring(1))}
         style={animatedStyle}
      >
         {children}
      </AnimatedPressable>
   );
};

// CyberpunkStatsLoader component for league stats screen
const CyberpunkStatsLoader = React.memo<{ message?: string }>(
   ({ message = 'Loading...' }) => {
      return (
         <LinearGradient
            colors={['#000000', '#1A0B2E', '#FF1493']}
            locations={[0, 0.7, 1]}
            style={styles.loaderContainer}
         >
            <View style={styles.loaderContent}>
               <View style={styles.loaderInner}>
                  <CyberpunkLoader size="large" variant="pink" text={message} />
               </View>
            </View>
         </LinearGradient>
      );
   }
);

CyberpunkStatsLoader.displayName = 'CyberpunkStatsLoader';

export default function LeagueStatsScreen() {
   const { t, isRTL } = useLocalization();
   const { id: leagueId } = useLocalSearchParams<{ id: string }>();
   const { user } = useAuth();

   const {
      league,
      stats,
      isLoading,
      error,
      refreshing,
      loadLeagueData,
      handleRefresh: refreshStats,
   } = useLeagueStats(leagueId);

   const {
      games,
      isLoading: gamesLoading,
      error: gamesError,
      loadGames,
      hasMore: gamesHasMore,
   } = useLeagueGames(leagueId);

   // Use the custom hook for edit logic
   const {
      isEditModalVisible,
      setIsEditModalVisible,
      isUpdatingLeague,
      handleUpdateLeague,
   } = useEditLeague({
      leagueId,
      currentLeague: league,
      onSuccess: loadLeagueData,
   });

   const handleBack = React.useCallback(() => {
      router.back();
   }, []);

   const handleRefresh = React.useCallback(() => {
      refreshStats();
      loadGames(1); // Reset to page 1
   }, [refreshStats, loadGames]);

   const handleLoadMoreGames = React.useCallback(() => {
      if (!gamesLoading && gamesHasMore) {
         // Calculate next page based on current length and limit (default 3)
         const nextPage = Math.ceil(games.length / 3) + 1;
         loadGames(nextPage);
      }
   }, [gamesLoading, gamesHasMore, games.length, loadGames]);

   const handleStatPress = React.useCallback(
      (statType: StatType) => {
         router.push({
            pathname: '/leagues/[id]/stats/[statType]',
            params: { id: leagueId!, statType },
         });
      },
      [leagueId]
   );

   // Check if user is a member of the league
   const isMember = React.useMemo(() => {
      if (!user || !league?.members) return false;
      return league.members.some((member) => member.id === user.userId);
   }, [user, league]);

   // Memoized style objects to prevent recreation on every render
   // const headerButtonStyle = React.useMemo(
   //    () => ({
   //       shadowColor: '#000000',
   //       shadowOffset: { width: 0, height: 4 },
   //       shadowOpacity: 0.3,
   //       shadowRadius: 8,
   //       elevation: 8,
   //    }),
   //    []
   // );

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
         elevation: 8,
      }),
      []
   );

   if (isLoading) {
      return <CyberpunkStatsLoader message={t('loadingLeagueStats')} />;
   }

   if (error || !league || !stats) {
      return (
         <LinearGradient
            colors={['#000000', '#1A0B2E', '#FF1493']}
            locations={[0, 0.7, 1]}
            style={{ flex: 1 }}
         >
            {/* Cyberpunk Header with Corner Brackets */}
            <View className="flex-row items-center justify-between px-6 py-12 pt-16 bg-transparent">
               {/* Corner bracket decoration */}
               <View className="absolute top-12 left-6 w-6 h-6 border-l-2 border-t-2 border-[#FF1493]" />
               <View className="absolute top-12 right-6 w-6 h-6 border-r-2 border-t-2 border-[#FF1493]" />

               <Pressable
                  onPress={handleBack}
                  className="w-12 h-12 bg-black/90 border border-[#FF1493] items-center justify-center active:scale-95 relative overflow-hidden"
                  style={{
                     shadowColor: '#FF1493',
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.6,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('goBack')}
               >
                  {/* Corner brackets for button */}
                  <View className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[#00FFFF]" />
                  <View className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[#00FFFF]" />
                  <View className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-[#00FFFF]" />
                  <View className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-[#00FFFF]" />

                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={20}
                     color="#00FFFF"
                  />
               </Pressable>

               <Text
                  className="text-[#FF1493] text-xl font-mono font-bold tracking-widest uppercase"
                  style={{
                     textShadowColor: '#FF1493',
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 10,
                  }}
               >
                  {t('leagueStats')}
               </Text>

               <View className="w-12" />
            </View>

            <View className="flex-1 items-center justify-center p-8">
               <View
                  className="bg-black/80 border border-red-500 p-8 relative"
                  style={{
                     shadowColor: '#FF0000',
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.8,
                     shadowRadius: 16,
                     elevation: 16,
                  }}
               >
                  {/* Cyberpunk corner brackets for error container */}
                  <View className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-red-500" />
                  <View className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-red-500" />
                  <View className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-red-500" />
                  <View className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-red-500" />

                  <Text
                     className="text-red-500 text-center mb-6 font-mono font-bold text-lg tracking-wider uppercase"
                     style={{
                        textShadowColor: '#FF0000',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 10,
                     }}
                  >
                     {t('error')}
                  </Text>
                  <Text className="text-[#00FFFF] text-center mb-8 font-mono tracking-wide">
                     {error || t('statsNotFound')}
                  </Text>
                  <Pressable
                     onPress={loadLeagueData}
                     className="bg-black/90 border border-red-500 px-6 py-3 active:scale-95 relative"
                     style={{
                        shadowColor: '#FF0000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 8,
                        elevation: 8,
                     }}
                     accessibilityRole="button"
                     accessibilityLabel={t('retry')}
                  >
                     {/* Corner brackets for button */}
                     <View className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[#00FFFF]" />
                     <View className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[#00FFFF]" />
                     <View className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-[#00FFFF]" />
                     <View className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-[#00FFFF]" />

                     <Text className="text-red-500 text-center font-mono font-bold tracking-wider uppercase">
                        {t('retry')}
                     </Text>
                  </Pressable>
               </View>
            </View>
         </LinearGradient>
      );
   }

   const statCards = createStatCards(stats, t);

   return (
      <LinearGradient
         colors={['#000000', '#1A0B2E', '#FF1493']}
         locations={[0, 0.7, 1]}
         style={{ flex: 1 }}
      >
         {/* Cyberpunk Header with Corner Brackets */}
         <View className="flex-row items-center justify-between px-6 py-12 pt-16 bg-transparent">
            {/* Corner bracket decoration */}
            <View className="absolute top-12 left-6 w-6 h-6 border-l-2 border-t-2 border-[#FF1493]" />
            <View className="absolute top-12 right-6 w-6 h-6 border-r-2 border-t-2 border-[#FF1493]" />

            <Pressable
               onPress={handleBack}
               className="w-12 h-12 bg-black/90 border border-[#FF1493] items-center justify-center active:scale-95 relative overflow-hidden"
               style={{
                  shadowColor: '#FF1493',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 8,
               }}
               accessibilityRole="button"
               accessibilityLabel={t('goBack')}
            >
               {/* Corner brackets for button */}
               <View className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[#00FFFF]" />
               <View className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[#00FFFF]" />
               <View className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-[#00FFFF]" />
               <View className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-[#00FFFF]" />

               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={20}
                  color="#00FFFF"
               />
            </Pressable>

            <Text
               className="text-[#FF1493] text-xl font-mono font-bold tracking-widest uppercase"
               style={{
                  textShadowColor: '#FF1493',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
               }}
            >
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
                  colors={['#FF1493', '#00FFFF']}
                  tintColor="#FF1493"
                  progressBackgroundColor="rgba(0, 0, 0, 0.9)"
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
                  <View className="mr-6 items-center">
                     {league.imageUrl ? (
                        <Image
                           source={{ uri: league.imageUrl }}
                           style={imageStyle}
                           contentFit="cover"
                           cachePolicy="memory-disk"
                           priority="high"
                           accessible={true}
                           accessibilityLabel={`${t('leagueImage')}: ${league.name}`}
                        />
                     ) : (
                        <View
                           style={imageStyle}
                           className="bg-white/10 items-center justify-center border border-white/20"
                        >
                           <Ionicons
                              name="trophy"
                              size={40}
                              color="rgba(255,255,255,0.5)"
                           />
                        </View>
                     )}

                     {isMember && (
                        <Pressable
                           onPress={() => setIsEditModalVisible(true)}
                           className="flex-row items-center mt-3 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 active:bg-white/20"
                        >
                           <Ionicons name="pencil" size={12} color="white" />
                           <Text className="text-neonGreen text-xs ml-1.5 font-medium">
                              {t('editLeague')}
                           </Text>
                        </Pressable>
                     )}
                  </View>

                  <View className="flex-1 justify-center">
                     <Text className="text-neonGreen mb-4 font-semibold text-xl">
                        {league.name}
                     </Text>
                  </View>
               </View>
            </View>

            <Summary leagueId={parseInt(leagueId!)} />

            {/* Player Stats Cards Grid - Cyberpunk Transformation */}
            <View className="mb-8 px-6">
               {/* Cyberpunk Section Header - Neon Magenta Theme */}
               <View className="relative mb-6 overflow-hidden">
                  <View
                     className="bg-black/90 border border-[#FF1493] px-6 py-4 relative"
                     style={{
                        shadowColor: '#FF1493',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 12,
                        elevation: 12,
                     }}
                  >
                     {/* Corner Brackets for Section Header */}
                     <View className="absolute top-1.5 left-1.5 w-4 h-4 border-l-2 border-t-2 border-[#FF1493]" />
                     <View className="absolute top-1.5 right-1.5 w-4 h-4 border-r-2 border-t-2 border-[#00FFFF]" />
                     <View className="absolute bottom-1.5 left-1.5 w-4 h-4 border-l-2 border-b-2 border-[#00FFFF]" />
                     <View className="absolute bottom-1.5 right-1.5 w-4 h-4 border-r-2 border-b-2 border-[#FF1493]" />

                     {/* Holographic Overlay */}
                     <LinearGradient
                        colors={[
                           'rgba(255, 20, 147, 0.1)',
                           'transparent',
                           'rgba(0, 255, 255, 0.1)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           opacity: 0.8,
                        }}
                     />

                     {/* Cyberpunk Title */}
                     <Text
                        className="text-center text-[#FF1493] text-xl font-mono font-bold tracking-[3px] uppercase"
                        style={{
                           textShadowColor: '#FF1493',
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 8,
                        }}
                     >
                        {t('playerStats')}
                     </Text>

                     {/* Scan Lines */}
                     <View
                        className="absolute top-2 left-0 right-0 h-px bg-[#FF1493]"
                        style={{ opacity: 0.3 }}
                     />
                     <View
                        className="absolute bottom-2 left-0 right-0 h-px bg-[#00FFFF]"
                        style={{ opacity: 0.3 }}
                     />
                  </View>
               </View>

               {/* Enhanced Stats Cards Grid with Cyberpunk Accents */}
               <View className="flex-row flex-wrap justify-center items-start w-full gap-4 relative">
                  {/* Subtle Grid Background Effect */}
                  <LinearGradient
                     colors={[
                        'transparent',
                        'rgba(255, 20, 147, 0.02)',
                        'transparent',
                     ]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 20, 147, 0.1)',
                        borderRadius: 12,
                     }}
                  />

                  <View
                     className="relative"
                     style={{
                        shadowColor: '#FF1493',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                     }}
                  >
                     <PressableStatCard
                        onPress={() => handleStatPress('top-profit-player')}
                     >
                        <TopProfitPlayerCard leagueId={leagueId!} t={t} />
                     </PressableStatCard>
                  </View>

                  <View
                     className="relative"
                     style={{
                        shadowColor: '#00FFFF',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                     }}
                  >
                     <PressableStatCard
                        onPress={() => handleStatPress('most-active-player')}
                     >
                        <PlayerStatCard
                           leagueId={leagueId!}
                           statType="most-active-player"
                           t={t}
                        />
                     </PressableStatCard>
                  </View>

                  <View
                     className="relative"
                     style={{
                        shadowColor: '#FF1493',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                     }}
                  >
                     <PressableStatCard
                        onPress={() =>
                           handleStatPress('highest-single-game-profit')
                        }
                     >
                        <PlayerStatCard
                           leagueId={leagueId!}
                           statType="highest-single-game-profit"
                           t={t}
                        />
                     </PressableStatCard>
                  </View>

                  <View
                     className="relative"
                     style={{
                        shadowColor: '#00FFFF',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                     }}
                  >
                     <PressableStatCard
                        onPress={() => handleStatPress('best-winning-streak')}
                     >
                        <PlayerStatCard
                           leagueId={leagueId!}
                           statType="best-winning-streak"
                           t={t}
                        />
                     </PressableStatCard>
                  </View>
               </View>
            </View>

            {/* League Overview Section - Cyberpunk Neon Purple Theme */}
            <View className="mb-8 px-6">
               {/* Cyberpunk League Overview Header */}
               <View className="relative mb-6 overflow-hidden">
                  <View
                     className="bg-black/90 border-2 border-[#8A2BE2] px-6 py-4 relative"
                     style={{
                        shadowColor: '#8A2BE2',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.7,
                        shadowRadius: 16,
                        elevation: 16,
                     }}
                  >
                     {/* Corner Brackets - Purple/Cyan Theme */}
                     <View className="absolute top-1.5 left-1.5 w-5 h-5 border-l-2 border-t-2 border-[#8A2BE2]" />
                     <View className="absolute top-1.5 right-1.5 w-5 h-5 border-r-2 border-t-2 border-[#00FFFF]" />
                     <View className="absolute bottom-1.5 left-1.5 w-5 h-5 border-l-2 border-b-2 border-[#00FFFF]" />
                     <View className="absolute bottom-1.5 right-1.5 w-5 h-5 border-r-2 border-b-2 border-[#8A2BE2]" />

                     {/* Holographic Overlay - Purple Theme */}
                     <LinearGradient
                        colors={[
                           'rgba(138, 43, 226, 0.1)',
                           'transparent',
                           'rgba(0, 255, 255, 0.08)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           opacity: 0.9,
                        }}
                     />

                     {/* Cyberpunk Title */}
                     <Text
                        className="text-center text-[#8A2BE2] text-xl font-mono font-bold tracking-[4px] uppercase"
                        style={{
                           textShadowColor: '#8A2BE2',
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 10,
                        }}
                     >
                        {t('leagueOverview')}
                     </Text>

                     {/* Scan Lines - Dual Color */}
                     <View
                        className="absolute top-2 left-0 right-0 h-px bg-[#8A2BE2]"
                        style={{ opacity: 0.4 }}
                     />
                     <View
                        className="absolute bottom-2 left-0 right-0 h-px bg-[#00FFFF]"
                        style={{ opacity: 0.4 }}
                     />
                  </View>
               </View>

               {/* Enhanced Stats Grid with Cyberpunk Container */}
               <View className="relative">
                  {/* Cyberpunk Grid Background with Purple Accent */}
                  <LinearGradient
                     colors={[
                        'transparent',
                        'rgba(138, 43, 226, 0.03)',
                        'transparent',
                     ]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={{
                        position: 'absolute',
                        top: -12,
                        left: -12,
                        right: -12,
                        bottom: -12,
                        borderWidth: 1,
                        borderColor: 'rgba(138, 43, 226, 0.15)',
                        borderRadius: 16,
                        shadowColor: '#8A2BE2',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                     }}
                  />

                  {/* Corner Accents for Grid */}
                  <View className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-[#8A2BE2]" />
                  <View className="absolute -top-1 -right-1 w-3 h-3 border-r border-t border-[#00FFFF]" />
                  <View className="absolute -bottom-1 -left-1 w-3 h-3 border-l border-b border-[#00FFFF]" />
                  <View className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-[#8A2BE2]" />

                  {/* Stats Cards Grid */}
                  <View className="flex-row flex-wrap justify-center items-start w-full gap-4">
                     {statCards.map((card, index) => (
                        <View
                           key={index}
                           className="relative"
                           style={{
                              shadowColor: index % 2 === 0 ? '#8A2BE2' : '#00FFFF',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.25,
                              shadowRadius: 6,
                              elevation: 6,
                           }}
                        >
                           <StatCard card={card} />
                        </View>
                     ))}
                  </View>
               </View>
            </View>

            {/* Recent Game Results */}
            <View className="px-6">
               <RecentGameResults
                  games={games}
                  isLoading={gamesLoading}
                  error={gamesError}
                  hasMore={gamesHasMore}
                  loadMore={handleLoadMoreGames}
               />
            </View>
         </ScrollView>

         <EditLeagueModal
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            onSubmit={handleUpdateLeague}
            currentName={league.name}
            currentImage={league.imageUrl || null}
            isLoading={isUpdatingLeague}
         />
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
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: 32,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FF1493',
      shadowColor: '#FF1493',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 16,
      elevation: 16,
      position: 'relative',
   },
   loaderText: {
      color: '#00FFFF',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
      fontFamily: 'monospace',
      letterSpacing: 1,
   },
});
