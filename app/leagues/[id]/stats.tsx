import { EditLeagueModal } from '@/components/modals/EditLeagueModal';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useEditLeague } from '@/hooks/useEditLeague';

import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import type { ViewStyle } from 'react-native';
import {
   ActivityIndicator,
   Pressable,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from 'react-native';

// TypeScript interfaces for better type safety
interface LeagueData {
   id: string;
   name: string;
   imageUrl: string;
   inviteCode: string;
   memberCount: number;
   isActive: boolean;
   createdAt: string;
   members?: { id: number }[];
}

interface ActiveGame {
   id: string;
   leagueId: string;
   status: string;
   createdAt: string;
}

interface ActionCardProps {
   title: string;
   description: string;
   iconName: keyof typeof Ionicons.glyphMap;
   iconColor: string;
   bgColor: string;
   borderColor: string;
   shadowColor: string;
   onPress: () => void;
   isRTL: boolean;
   accessibilityLabel?: string;
   accessibilityHint?: string;
}

interface GlassmorphismLoaderProps {
   message?: string;
}

interface CacheItem {
   data: any;
   timestamp: number;
}

type CacheMap = Map<string, CacheItem>;

// Simple caching for API responses (5 minutes TTL)
const cache: CacheMap = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string): any | null => {
   const item = cache.get(key);
   if (item && Date.now() - item.timestamp < CACHE_TTL) {
      return item.data;
   }
   cache.delete(key);
   return null;
};

const setCachedData = (key: string, data: any): void => {
   cache.set(key, { data, timestamp: Date.now() });
};

// GlassmorphismLoader component for consistent loading state
const GlassmorphismLoader = React.memo<GlassmorphismLoaderProps>(
   ({ message = 'Loading...' }) => {
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
   }
);

GlassmorphismLoader.displayName = 'GlassmorphismLoader';

// Reusable ActionCard component to reduce code duplication
const ActionCard = React.memo<ActionCardProps>(
   ({
      title,
      description,
      iconName,
      iconColor,
      bgColor,
      borderColor,
      shadowColor,
      onPress,
      isRTL,
      accessibilityLabel,
      accessibilityHint,
   }) => {
      return (
         <Pressable
            className="active:scale-[0.98]"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint || description}
         >
            <View
               className={`${bgColor} backdrop-blur-xl ${borderColor} rounded-3xl p-6`}
               style={[styles.actionCard, { shadowColor }]}
            >
               <View className="flex-row items-center">
                  <View
                     className={`w-16 h-16 ${bgColor.replace('/10', '/20')} backdrop-blur-xl ${borderColor.replace('/30', '/40')} rounded-2xl items-center justify-center mr-5`}
                     style={[styles.iconContainer, { shadowColor }]}
                  >
                     <Ionicons name={iconName} size={28} color={iconColor} />
                  </View>

                  <View className="flex-1">
                     <Text className="text-white font-semibold text-lg mb-2">
                        {title}
                     </Text>
                     <Text className="text-white/70 font-medium">
                        {description}
                     </Text>
                  </View>

                  <View className="ml-4">
                     <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={24}
                        color={iconColor}
                     />
                  </View>
               </View>
            </View>
         </Pressable>
      );
   }
);

ActionCard.displayName = 'ActionCard';

function LeagueStatsComponent() {
   const { t, isRTL } = useLocalization();
   const { fetchWithAuth, user } = useAuth();
   const { id } = useLocalSearchParams<{ id: string }>();

   const [league, setLeague] = React.useState<LeagueData | null>(null);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [activeGame, setActiveGame] = React.useState<ActiveGame | null>(null);
   const [isCheckingActiveGame, setIsCheckingActiveGame] =
      React.useState(false);

   // Add mounted ref to prevent memory leaks from state updates after unmount
   const mountedRef = React.useRef(true);

   // Cleanup mounted ref on unmount
   React.useEffect(() => {
      return () => {
         mountedRef.current = false;
      };
   }, []);

   // Function to load league details with abort controller support and caching
   const loadLeagueDetails = React.useCallback(
      async (abortSignal?: AbortSignal, retryCount = 0) => {
         if (!id || abortSignal?.aborted) return;

         // Check cache first
         const cacheKey = `league_${id}`;
         const cachedData = getCachedData(cacheKey);
         if (cachedData && retryCount === 0) {
            if (mountedRef.current) {
               setLeague(cachedData);
               setIsLoading(false);
               return;
            }
         }

         try {
            if (mountedRef.current) {
               setIsLoading(true);
               setError(null);
            }

            const response = await fetchWithAuth(
               `${BASE_URL}/api/leagues/${id}`,
               {
                  signal: abortSignal,
               }
            );

            if (abortSignal?.aborted || !mountedRef.current) return;

            if (!response.ok) {
               throw new Error(
                  `Failed to fetch league details: ${response.status}`
               );
            }

            const data = await response.json();

            if (abortSignal?.aborted || !mountedRef.current) return;

            // Cache the data
            setCachedData(cacheKey, data.league);
            setLeague(data.league);
         } catch (err) {
            if (abortSignal?.aborted || !mountedRef.current) return;

            const errorMessage =
               err instanceof Error
                  ? err.message
                  : 'Failed to load league details';

            // Retry logic for network errors (max 2 retries)
            if (
               retryCount < 2 &&
               (errorMessage.includes('network') ||
                  errorMessage.includes('fetch'))
            ) {
               setTimeout(
                  () => {
                     loadLeagueDetails(abortSignal, retryCount + 1);
                  },
                  1000 * (retryCount + 1)
               ); // Exponential backoff
               return;
            }

            setError(errorMessage);
            captureException(err as Error, {
               function: 'loadLeagueDetails',
               screen: 'LeagueStats',
               leagueId: id,
               retryCount,
            });
         } finally {
            if (!abortSignal?.aborted && mountedRef.current) {
               setIsLoading(false);
            }
         }
      },
      [id, fetchWithAuth]
   );

   // Use the custom hook for edit logic
   const {
      isEditModalVisible,
      setIsEditModalVisible,
      isUpdatingLeague,
      handleUpdateLeague,
   } = useEditLeague({
      leagueId: id,
      currentLeague: league,
      onSuccess: () => {
         // Force reload league details bypassing cache
         const abortController = new AbortController();
         // Clear cache for this league
         if (id) {
            const cacheKey = `league_${id}`;
            cache.delete(cacheKey);
         }
         loadLeagueDetails(abortController.signal);
      },
   });

   // Function to check for active game with abort controller support and caching
   const checkActiveGame = React.useCallback(
      async (abortSignal?: AbortSignal, retryCount = 0) => {
         if (!league || abortSignal?.aborted) return;

         // Check cache first
         const cacheKey = `active_game_${league.id}`;
         const cachedData = getCachedData(cacheKey);
         if (cachedData && retryCount === 0) {
            if (mountedRef.current) {
               setActiveGame(cachedData);
               setIsCheckingActiveGame(false);
               return;
            }
         }

         try {
            if (mountedRef.current) {
               setIsCheckingActiveGame(true);
            }

            const activeGameResponse = await fetchWithAuth(
               `${BASE_URL}/api/games/active/${league.id}`,
               { signal: abortSignal }
            );

            if (abortSignal?.aborted || !mountedRef.current) return;

            if (activeGameResponse.ok) {
               const activeGameData = await activeGameResponse.json();

               if (abortSignal?.aborted || !mountedRef.current) return;

               const gameData =
                  activeGameData.success && activeGameData.game
                     ? activeGameData.game
                     : null;

               // Cache the data
               setCachedData(cacheKey, gameData);
               setActiveGame(gameData);
            } else {
               // Cache null result
               setCachedData(cacheKey, null);
               setActiveGame(null);
            }
         } catch (error) {
            if (abortSignal?.aborted || !mountedRef.current) return;

            // Retry logic for network errors (max 1 retry for active game check)
            if (
               retryCount < 1 &&
               error instanceof Error &&
               (error.message.includes('network') ||
                  error.message.includes('fetch'))
            ) {
               setTimeout(() => {
                  checkActiveGame(abortSignal, retryCount + 1);
               }, 1000);
               return;
            }

            console.error('Error checking for active game:', error);
            captureException(error as Error, {
               function: 'checkActiveGame',
               screen: 'LeagueStats',
               leagueId: league.id,
               retryCount,
            });
            setActiveGame(null);
         } finally {
            if (!abortSignal?.aborted && mountedRef.current) {
               setIsCheckingActiveGame(false);
            }
         }
      },
      [league, fetchWithAuth]
   );

   // Load league details on mount with proper cleanup
   React.useEffect(() => {
      const abortController = new AbortController();
      loadLeagueDetails(abortController.signal);

      return () => {
         abortController.abort();
      };
   }, [loadLeagueDetails]);

   // Check for active game when league is loaded with proper cleanup
   React.useEffect(() => {
      if (!league) return;

      const abortController = new AbortController();
      checkActiveGame(abortController.signal);

      return () => {
         abortController.abort();
      };
   }, [league, checkActiveGame]);

   // Refresh active game state when screen comes into focus (bypasses cache)
   useFocusEffect(
      React.useCallback(() => {
         if (!league) return;

         const abortController = new AbortController();
         // Force a fresh check by clearing cache and retrying
         cache.delete(`active_game_${league.id}`);
         checkActiveGame(abortController.signal);

         return () => {
            abortController.abort();
         };
      }, [league, checkActiveGame])
   );

   // Check if user is a member of the league
   const isMember = React.useMemo(() => {
      if (!user || !league?.members) return false;
      return league.members.some((member) => member.id === user.userId);
   }, [user, league]);

   // Memoize all callback functions to prevent unnecessary re-renders
   const handleBack = React.useCallback(() => {
      router.back();
   }, []);

   const handleStartGame = React.useCallback(() => {
      if (!league) return;
      router.push(`/games/${league.id}/select-players`);
   }, [league]);

   const handleContinueGame = React.useCallback(() => {
      if (activeGame) {
         router.push(`/games/${activeGame.id}`);
      }
   }, [activeGame]);

   const handleViewStats = React.useCallback(() => {
      if (!league) return;
      router.push(`/leagues/${league.id}/league-stats-screen`);
   }, [league]);

   const handleRetry = React.useCallback(() => {
      const abortController = new AbortController();
      loadLeagueDetails(abortController.signal);
   }, [loadLeagueDetails]);

   // Memoize style objects to prevent recreation on every render
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

   const inviteCodeStyle = React.useMemo(
      () => ({
         shadowColor: '#8B5CF6',
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 8,
         elevation: 8,
      }),
      []
   );

   if (isLoading) {
      return <GlassmorphismLoader message={t('loadingLeagueDetails')} />;
   }

   if (error || !league) {
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
                  accessibilityHint={t('navigateBackToPreviousScreen')}
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
                     {error || t('leagueNotFound')}
                  </Text>
                  <Pressable
                     onPress={handleRetry}
                     className="bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-2xl px-6 py-3 active:scale-95"
                     accessibilityRole="button"
                     accessibilityLabel={t('retry')}
                     accessibilityHint={t('retryLoadingLeagueDetails')}
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
               accessibilityHint={t('navigateBackToPreviousScreen')}
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
            contentContainerStyle={{ padding: 24, paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
         >
            {/* League Header with modern glass effect */}
            <View
               className="flex-row p-6 rounded-3xl mb-8 bg-white/5 backdrop-blur-xl border border-white/20"
               style={leagueHeaderStyle}
               accessibilityRole="summary"
               accessibilityLabel={`${t('leagueDetails')}: ${league.name}`}
            >
               <View className="mr-6 items-center">
                  <Image
                     source={{ uri: league.imageUrl }}
                     style={imageStyle}
                     contentFit="cover"
                     cachePolicy="memory-disk"
                     priority="high"
                     placeholder={{
                        uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                     }}
                     placeholderContentFit="cover"
                     transition={300}
                     accessible={true}
                     accessibilityLabel={`${t('leagueImage')}: ${league.name}`}
                     onError={(error) => {
                        captureException(
                           new Error('League image loading failed'),
                           {
                              function: 'Image.onError',
                              screen: 'LeagueStats',
                              leagueId: league.id,
                              imageUri: league.imageUrl,
                              error: error.toString(),
                           }
                        );
                     }}
                  />

                  {isMember && (
                     <Pressable
                        onPress={() => setIsEditModalVisible(true)}
                        className="flex-row items-center mt-3 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 active:bg-white/20"
                     >
                        <Ionicons name="pencil" size={12} color="white" />
                        <Text className="text-white text-xs ml-1.5 font-medium">
                           {t('editLeague')}
                        </Text>
                     </Pressable>
                  )}
               </View>

               <View className="flex-1 justify-center">
                  <Text className="text-white mb-4 font-semibold text-xl">
                     {league.name}
                  </Text>

                  <View className="gap-3">
                     <View
                        className="self-start px-4 py-2 rounded-xl bg-purple-500/20 backdrop-blur-xl border border-purple-400/30"
                        style={inviteCodeStyle}
                        accessibilityRole="text"
                        accessibilityLabel={`${t('inviteCode')}: ${league.inviteCode}`}
                     >
                        <Text className="text-purple-300 font-semibold">
                           {league.inviteCode}
                        </Text>
                     </View>

                     <Text className="text-white/70 font-medium">
                        {league.memberCount} {t('members')}
                     </Text>
                  </View>
               </View>
            </View>

            {/* Main Action Cards */}
            <View className="gap-6">
               {/* View Detailed Stats Card */}
               <ActionCard
                  title={t('viewDetailedStats')}
                  description={t('viewStatsDescription')}
                  iconName="stats-chart"
                  iconColor="#60A5FA"
                  bgColor="bg-blue-500/10"
                  borderColor="border border-blue-400/30"
                  shadowColor="#3B82F6"
                  onPress={handleViewStats}
                  isRTL={isRTL}
                  accessibilityLabel={t('viewDetailedStats')}
                  accessibilityHint={t('navigateToDetailedStatsScreen')}
               />

               {/* Conditional Game Action Card */}
               {isCheckingActiveGame ? (
                  <View
                     className="bg-gray-500/10 backdrop-blur-xl border border-gray-400/30 rounded-3xl p-6"
                     style={[styles.actionCard, { shadowColor: '#6B7280' }]}
                     accessibilityRole="text"
                     accessibilityLabel={t('checkingGames')}
                  >
                     <View className="flex-row items-center">
                        <View
                           className="w-16 h-16 bg-gray-500/20 backdrop-blur-xl border border-gray-400/40 rounded-2xl items-center justify-center mr-5"
                           style={[
                              styles.iconContainer,
                              { shadowColor: '#6B7280' },
                           ]}
                        >
                           <ActivityIndicator size="small" color="#9CA3AF" />
                        </View>

                        <View className="flex-1">
                           <Text className="text-white font-semibold text-lg mb-2">
                              {t('checkingGames')}
                           </Text>
                           <Text className="text-white/70 font-medium">
                              {t('checkingGamesDescription')}
                           </Text>
                        </View>
                     </View>
                  </View>
               ) : activeGame ? (
                  /* Continue Active Game Card */
                  <ActionCard
                     title={t('continueGame')}
                     description={t('continueGameDescription')}
                     iconName="play-circle"
                     iconColor="#FB923C"
                     bgColor="bg-orange-500/10"
                     borderColor="border border-orange-400/30"
                     shadowColor="#F97316"
                     onPress={handleContinueGame}
                     isRTL={isRTL}
                     accessibilityLabel={t('continueGame')}
                     accessibilityHint={t('navigateToContinueActiveGame')}
                  />
               ) : (
                  /* Start New Game Card */
                  <ActionCard
                     title={t('startNewGame')}
                     description={t('startGameDescription')}
                     iconName="play-circle"
                     iconColor="#4ADE80"
                     bgColor="bg-green-500/10"
                     borderColor="border border-green-400/30"
                     shadowColor="#22C55E"
                     onPress={handleStartGame}
                     isRTL={isRTL}
                     accessibilityLabel={t('startNewGame')}
                     accessibilityHint={t('navigateToStartNewGame')}
                  />
               )}
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

// Memoized style objects
const styles = StyleSheet.create({
   loaderContainer: {
      flex: 1,
   } as ViewStyle,
   loaderContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
   } as ViewStyle,
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
   } as ViewStyle,
   loaderText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
   },
   actionCard: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 16,
   } as ViewStyle,
   iconContainer: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
   } as ViewStyle,
});

// Add React.memo to prevent unnecessary re-renders
const LeagueStats = React.memo(LeagueStatsComponent);
LeagueStats.displayName = 'LeagueStats';

export default LeagueStats;
