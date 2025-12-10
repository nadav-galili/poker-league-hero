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
interface LeagueMember {
   id: number;
   fullName?: string;
   profileImageUrl?: string | null;
   role?: string;
   joinedAt?: string;
}

interface LeagueData {
   id: string;
   name: string;
   imageUrl: string;
   inviteCode: string;
   memberCount: number;
   isActive: boolean;
   createdAt: string;
   members?: LeagueMember[];
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

// Helper function to convert hex color to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   if (!result) return `rgba(255, 255, 255, ${opacity})`;
   const r = parseInt(result[1], 16);
   const g = parseInt(result[2], 16);
   const b = parseInt(result[3], 16);
   return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Poker-themed loader component
const GlassmorphismLoader = React.memo<GlassmorphismLoaderProps>(
   ({ message = 'Loading...' }) => {
      return (
         <LinearGradient
            colors={['#1a0033', '#0f001a', '#000000']}
            style={styles.loaderContainer}
         >
            <View style={styles.loaderContent}>
               <View style={styles.loaderInner}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.loaderText}>{message}</Text>
               </View>
            </View>
         </LinearGradient>
      );
   }
);

GlassmorphismLoader.displayName = 'GlassmorphismLoader';

// Reusable ActionCard component with poker-themed design
const ActionCard = React.memo<ActionCardProps>(
   ({
      title,
      description,
      iconName,
      iconColor,
      bgColor,

      shadowColor,
      onPress,
      isRTL,
      accessibilityLabel,
      accessibilityHint,
   }) => {
      return (
         <Pressable
            className="active:opacity-90"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint || description}
            style={styles.actionCardPressable}
         >
            <View
               className={`${bgColor} rounded-2xl py-4 px-4`}
               style={[styles.actionCard, { shadowColor }]}
            >
               <View className="flex-row items-center py-4 px-5">
                  <View
                     style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: hexToRgba(iconColor, 0.15),
                        borderWidth: 1,
                        borderColor: hexToRgba(iconColor, 0.3),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                     }}
                  >
                     <Ionicons name={iconName} size={22} color={iconColor} />
                  </View>

                  <View className="flex-1">
                     <Text className="text-white font-bold text-base mb-1">
                        {title}
                     </Text>
                     <Text className="text-white/60 text-sm leading-5">
                        {description}
                     </Text>
                  </View>

                  <View className="ml-3">
                     <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={20}
                        color="rgba(255, 255, 255, 0.5)"
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

   if (isLoading) {
      return <GlassmorphismLoader message={t('loadingLeagueDetails')} />;
   }

   if (error || !league) {
      return (
         <LinearGradient
            colors={['#1a0033', '#0f001a', '#000000']}
            style={{ flex: 1 }}
         >
            {/* Poker-themed Header */}
            <View className="flex-row items-center justify-between px-5 py-10 pt-16 bg-transparent">
               <Pressable
                  onPress={handleBack}
                  className="w-11 h-11 rounded-full bg-white/8 items-center justify-center active:opacity-70"
                  style={styles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('goBack')}
                  accessibilityHint={t('navigateBackToPreviousScreen')}
               >
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={22}
                     color="white"
                  />
               </Pressable>
               <Text className="text-white text-lg font-bold tracking-wide">
                  {t('leagueStats')}
               </Text>
               <View className="w-11" />
            </View>

            <View className="flex-1 items-center justify-center p-8">
               <View
                  className="bg-red-500/10 rounded-2xl p-8"
                  style={styles.errorCard}
               >
                  <Text className="text-red-400 text-center mb-4 font-bold text-lg">
                     {t('error')}
                  </Text>
                  <Text className="text-white/70 text-center mb-6 text-sm leading-5">
                     {error || t('leagueNotFound')}
                  </Text>
                  <Pressable
                     onPress={handleRetry}
                     className="bg-red-500/20 rounded-xl px-6 py-3 active:opacity-80"
                     style={styles.retryButton}
                     accessibilityRole="button"
                     accessibilityLabel={t('retry')}
                     accessibilityHint={t('retryLoadingLeagueDetails')}
                  >
                     <Text className="text-red-300 text-center font-bold text-sm">
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
         {/* Poker-themed Header */}
         <View className="flex-row items-center justify-between px-5 py-10 pt-16 bg-transparent">
            <Pressable
               onPress={handleBack}
               className="w-11 h-11 rounded-full bg-white/8 items-center justify-center active:opacity-70"
               style={styles.backButton}
               accessibilityRole="button"
               accessibilityLabel={t('goBack')}
               accessibilityHint={t('navigateBackToPreviousScreen')}
            >
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={22}
                  color="white"
               />
            </Pressable>
            <Text className="text-white text-lg font-bold tracking-wide">
               {t('leagueStats')}
            </Text>
            <View className="w-11" />
         </View>

         <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
         >
            {/* League Card - Poker chip style */}
            <View
               className="rounded-2xl mb-6 overflow-hidden"
               style={styles.leagueCard}
               accessibilityRole="summary"
               accessibilityLabel={`${t('leagueDetails')}: ${league.name}`}
            >
               <LinearGradient
                  colors={[
                     'rgba(124, 58, 237, 0.12)',
                     'rgba(124, 58, 237, 0.05)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.leagueCardGradient}
               >
                  {/* Top Section: Image + Info */}
                  <View className="flex-row">
                     {/* Image + Edit Button Column */}
                     <View className="items-center p-3">
                        <View style={styles.imageContainer}>
                           <Image
                              source={{ uri: league.imageUrl }}
                              style={styles.leagueImage}
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
                        </View>

                        {isMember && (
                           <Pressable
                              onPress={() => setIsEditModalVisible(true)}
                              className="flex-row items-center mt-2 bg-white/10 px-2.5 py-1 rounded-full active:opacity-70"
                              style={styles.editButton}
                           >
                              <Ionicons
                                 name="pencil"
                                 size={10}
                                 color="rgba(255,255,255,0.8)"
                              />
                              <Text className="text-white/80 text-[10px] ml-1 font-medium">
                                 {t('editLeague')}
                              </Text>
                           </Pressable>
                        )}
                     </View>

                     {/* Info Column */}
                     <View className="flex-1 ml-4 justify-center">
                        <Text className="text-success font-bold text-2xl mb-1">
                           {league.name}
                        </Text>
                        <View className="flex-row items-center">
                           <Text className="text-white text-xs">
                              {t('leagueCode')}
                           </Text>
                           <View
                              className="px-3 py-1 rounded-md mr-3"
                              style={styles.inviteCodeBadge}
                              accessibilityRole="text"
                              accessibilityLabel={`${t('inviteCode')}: ${league.inviteCode}`}
                           >
                              <Text className="text-purple-200 font-bold text-xs tracking-wider">
                                 {league.inviteCode}
                              </Text>
                           </View>
                           {/* <Text className="text-white/50 text-xs">
                              {league.memberCount} {t('members')}
                           </Text> */}
                        </View>
                     </View>
                  </View>

                  {/* Divider */}
                  <View className="h-px bg-white/10 my-4" />

                  {/* Members Section */}
                  {league.members && league.members.length > 0 && (
                     <View>
                        <Text className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wider">
                           {t('members')}
                        </Text>
                        <View className="flex-row flex-wrap">
                           {league.members.map((item) => (
                              <View
                                 key={item.id}
                                 style={styles.memberAvatarContainer}
                              >
                                 <Image
                                    source={{
                                       uri:
                                          item.profileImageUrl ||
                                          'https://via.placeholder.com/32x32/7C3AED/FFFFFF?text=?',
                                    }}
                                    style={styles.memberAvatar}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    placeholder={{
                                       uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                                    }}
                                    placeholderContentFit="cover"
                                    transition={200}
                                 />
                              </View>
                           ))}
                        </View>
                     </View>
                  )}
               </LinearGradient>
            </View>

            {/* Main Action Cards */}
            <View className="gap-4">
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
                     className="bg-gray-500/10 rounded-2xl"
                     style={[styles.actionCard, { shadowColor: '#6B7280' }]}
                     accessibilityRole="text"
                     accessibilityLabel={t('checkingGames')}
                  >
                     <View className="flex-row items-center py-4 px-5">
                        <View
                           className="w-14 h-14 rounded-full items-center justify-center mr-4"
                           style={[
                              styles.iconContainer,
                              {
                                 backgroundColor: 'rgba(156, 163, 175, 0.15)',
                                 shadowColor: '#9CA3AF',
                              },
                           ]}
                        >
                           <View style={{ padding: 8 }}>
                              <ActivityIndicator size="small" color="#9CA3AF" />
                           </View>
                        </View>

                        <View className="flex-1">
                           <Text className="text-white font-bold text-base mb-1">
                              {t('checkingGames')}
                           </Text>
                           <Text className="text-white/60 text-sm leading-5">
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

// Poker-themed style objects
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
      backgroundColor: 'rgba(124, 58, 237, 0.15)',
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
   } as ViewStyle,
   loaderText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
   },
   backButton: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
   } as ViewStyle,
   leagueCard: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
   } as ViewStyle,
   leagueCardGradient: {
      padding: 16,
      borderRadius: 16,
   } as ViewStyle,
   imageContainer: {
      width: 64,
      height: 64,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(139, 92, 246, 0.4)',
   } as ViewStyle,
   leagueImage: {
      width: 64,
      height: 64,
   },
   editButton: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
   } as ViewStyle,
   inviteCodeBadge: {
      backgroundColor: 'rgba(139, 92, 246, 0.25)',
   } as ViewStyle,
   actionCardPressable: {
      marginBottom: 0,
   } as ViewStyle,
   actionCard: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
   } as ViewStyle,
   iconContainer: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
   } as ViewStyle,
   errorCard: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
   } as ViewStyle,
   retryButton: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
   } as ViewStyle,
   memberAvatarContainer: {
      marginRight: 8,
      marginBottom: 8,
   } as ViewStyle,
   memberAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(139, 92, 246, 0.3)',
   },
});

// Add React.memo to prevent unnecessary re-renders
const LeagueStats = React.memo(LeagueStatsComponent);
LeagueStats.displayName = 'LeagueStats';

export default LeagueStats;
