import { colors, getCyberpunkGradient } from '@/colors';
import { EditLeagueModal } from '@/components/modals/EditLeagueModal';
import { BASE_URL } from '@/constants';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useEditLeague } from '@/hooks/useEditLeague';

import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';

import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import {
   Animated,
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

// Cyberpunk loader component
const CyberpunkLoaderScreen = React.memo<GlassmorphismLoaderProps>(
   ({ message = 'Loading...' }) => {
      return (
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            style={styles.loaderContainer}
         >
            <View style={styles.loaderContent}>
               <View style={styles.loaderInner}>
                  <CyberpunkLoader size="large" variant="cyan" text={message} />
               </View>
            </View>
         </LinearGradient>
      );
   }
);

CyberpunkLoaderScreen.displayName = 'CyberpunkLoaderScreen';

// Cyberpunk Header Component with corner brackets and neon effects
const CyberpunkHeader = React.memo<{
   title: string;
   onBack: () => void;
   isRTL: boolean;
   backButtonLabel: string;
   backButtonHint: string;
}>(({ title, onBack, isRTL, backButtonLabel, backButtonHint }) => {
   const glowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
               toValue: 0.3,
               duration: 2000,
               useNativeDriver: false,
            }),
         ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
   }, [glowAnim]);

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
   });

   return (
      <View style={styles.cyberpunkHeader}>
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
         >
            {/* Corner brackets */}
            <View
               style={[
                  styles.cornerBracket,
                  styles.topLeft,
                  { borderColor: colors.matrixGreen },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.topRight,
                  { borderColor: colors.neonCyan },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomLeft,
                  { borderColor: colors.neonPink },
               ]}
            />
            <View
               style={[
                  styles.cornerBracket,
                  styles.bottomRight,
                  { borderColor: colors.matrixGreen },
               ]}
            />

            {/* Holographic overlay */}
            <LinearGradient
               colors={[colors.holoBlue, 'transparent', colors.holoPink]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={styles.holoOverlay}
            />

            {/* Scan lines */}
            {Array.from({ length: 4 }).map((_, i) => (
               <Animated.View
                  key={i}
                  style={[
                     styles.scanLine,
                     {
                        top: 16 + i * 12,
                        opacity: glowOpacity.interpolate({
                           inputRange: [0.3, 0.8],
                           outputRange: [0.05, 0.15],
                        }),
                     },
                  ]}
               />
            ))}

            {/* Header Content */}
            <View style={styles.headerContent}>
               <Pressable
                  onPress={onBack}
                  style={styles.cyberpunkBackButton}
                  accessibilityRole="button"
                  accessibilityLabel={backButtonLabel}
                  accessibilityHint={backButtonHint}
               >
                  <LinearGradient
                     colors={[colors.holoBlue, colors.holoWhite]}
                     style={styles.backButtonGradient}
                  >
                     <Animated.View
                        style={[
                           styles.backButtonGlow,
                           {
                              shadowOpacity: glowOpacity,
                              shadowColor: colors.neonCyan,
                           },
                        ]}
                     >
                        <Ionicons
                           name={isRTL ? 'arrow-forward' : 'arrow-back'}
                           size={20}
                           color={colors.neonCyan}
                           style={{
                              textShadowColor: colors.neonCyan,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 8,
                           }}
                        />
                     </Animated.View>
                  </LinearGradient>
               </Pressable>

               <View style={styles.titleContainer}>
                  <Text style={styles.cyberpunkTitle}>{title}</Text>
                  <Animated.View
                     style={[
                        styles.titleUnderline,
                        {
                           shadowOpacity: glowOpacity,
                           backgroundColor: colors.neonCyan,
                        },
                     ]}
                  />
               </View>

               <View style={styles.headerSpacer} />
            </View>
         </LinearGradient>
      </View>
   );
});

CyberpunkHeader.displayName = 'CyberpunkHeader';

// Reusable ActionCard component with cyberpunk design
const ActionCard = React.memo<ActionCardProps>(
   ({
      title,
      description,
      iconName,
      iconColor,
      onPress,
      isRTL,
      accessibilityLabel,
      accessibilityHint,
   }) => {
      const glowAnim = useRef(new Animated.Value(0)).current;

      useEffect(() => {
         const glowAnimation = Animated.loop(
            Animated.sequence([
               Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 2500,
                  useNativeDriver: false,
               }),
               Animated.timing(glowAnim, {
                  toValue: 0.4,
                  duration: 2500,
                  useNativeDriver: false,
               }),
            ])
         );
         glowAnimation.start();

         return () => glowAnimation.stop();
      }, [glowAnim]);

      const glowOpacity = glowAnim.interpolate({
         inputRange: [0, 1],
         outputRange: [0.3, 0.8],
      });

      return (
         <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint || description}
            style={[styles.actionCardPressable, { opacity: 1 }]}
         >
            <Animated.View
               style={[
                  styles.cyberpunkActionCard,
                  {
                     shadowColor: iconColor,
                     shadowOpacity: glowOpacity.interpolate({
                        inputRange: [0.3, 0.8],
                        outputRange: [0.3, 0.6],
                     }),
                     borderColor: iconColor,
                  },
               ]}
            >
               <LinearGradient
                  colors={[
                     colors.cyberBackground,
                     colors.holoBlue,
                     'transparent',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCardGradient}
               >
                  {/* Corner brackets */}
                  <View
                     style={[
                        styles.actionCornerBracket,
                        styles.actionTopLeft,
                        { borderColor: colors.matrixGreen },
                     ]}
                  />
                  <View
                     style={[
                        styles.actionCornerBracket,
                        styles.actionTopRight,
                        { borderColor: iconColor },
                     ]}
                  />
                  <View
                     style={[
                        styles.actionCornerBracket,
                        styles.actionBottomLeft,
                        { borderColor: colors.neonPink },
                     ]}
                  />
                  <View
                     style={[
                        styles.actionCornerBracket,
                        styles.actionBottomRight,
                        { borderColor: colors.matrixGreen },
                     ]}
                  />

                  {/* Holographic overlay */}
                  <LinearGradient
                     colors={[
                        hexToRgba(iconColor, 0.1),
                        'transparent',
                        hexToRgba(iconColor, 0.05),
                     ]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={styles.actionHoloOverlay}
                  />

                  {/* Scan lines */}
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Animated.View
                        key={i}
                        style={[
                           styles.actionScanLine,
                           {
                              top: 20 + i * 15,
                              backgroundColor: iconColor,
                              opacity: glowOpacity.interpolate({
                                 inputRange: [0.3, 0.8],
                                 outputRange: [0.03, 0.08],
                              }),
                           },
                        ]}
                     />
                  ))}

                  <View style={styles.actionCardContent}>
                     <Animated.View
                        style={[
                           styles.cyberpunkIconContainer,
                           {
                              backgroundColor: hexToRgba(iconColor, 0.15),
                              borderColor: iconColor,
                              shadowColor: iconColor,
                              shadowOpacity: glowOpacity,
                           },
                        ]}
                     >
                        <Ionicons
                           name={iconName}
                           size={24}
                           color="black"
                           style={{
                              textShadowColor: iconColor,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 6,
                           }}
                        />
                     </Animated.View>

                     <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{title}</Text>
                        <Text style={styles.actionDescription}>
                           {description}
                        </Text>
                     </View>

                     <Animated.View
                        style={[
                           styles.actionChevron,
                           {
                              shadowColor: colors.neonCyan,
                              shadowOpacity: glowOpacity.interpolate({
                                 inputRange: [0.3, 0.8],
                                 outputRange: [0.2, 0.4],
                              }),
                           },
                        ]}
                     >
                        <Ionicons
                           name={isRTL ? 'chevron-back' : 'chevron-forward'}
                           size={20}
                           color={colors.neonCyan}
                           style={{
                              textShadowColor: colors.neonCyan,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 4,
                           }}
                        />
                     </Animated.View>
                  </View>
               </LinearGradient>
            </Animated.View>
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
      return <CyberpunkLoaderScreen message={t('loadingLeagueDetails')} />;
   }

   if (error || !league) {
      return (
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            style={{ flex: 1 }}
         >
            <CyberpunkHeader
               title={t('leagueStats')}
               onBack={handleBack}
               isRTL={isRTL}
               backButtonLabel={t('goBack')}
               backButtonHint={t('navigateBackToPreviousScreen')}
            />

            <View className="flex-1 items-center justify-center p-8">
               <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>{t('error')}</Text>
                  <Text style={styles.errorMessage}>
                     {error || t('leagueNotFound')}
                  </Text>
                  <Pressable
                     onPress={handleRetry}
                     style={styles.retryButton}
                     accessibilityRole="button"
                     accessibilityLabel={t('retry')}
                     accessibilityHint={t('retryLoadingLeagueDetails')}
                  >
                     <LinearGradient
                        colors={[colors.errorDark, colors.error]}
                        style={styles.retryButtonGradient}
                     >
                        <Text style={styles.retryButtonText}>{t('retry')}</Text>
                     </LinearGradient>
                  </Pressable>
               </View>
            </View>
         </LinearGradient>
      );
   }

   return (
      <LinearGradient colors={getCyberpunkGradient('dark')} style={{ flex: 1 }}>
         <CyberpunkHeader
            title={t('leagueStats')}
            onBack={handleBack}
            isRTL={isRTL}
            backButtonLabel={t('goBack')}
            backButtonHint={t('navigateBackToPreviousScreen')}
         />

         <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
         >
            {/* League Header - Cyberpunk Neon Magenta Style */}
            <View
               className="rounded-2xl mb-6 overflow-hidden"
               style={styles.leagueHeaderCard}
               accessibilityRole="summary"
               accessibilityLabel={`${t('leagueDetails')}: ${league.name}`}
            >
               <LinearGradient
                  colors={[colors.cyberBackground, colors.holoPink, colors.neonPink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.leagueHeaderGradient}
               >
                  {/* Corner brackets for league header - Neon Magenta Theme */}
                  <View
                     style={[
                        styles.cornerBracket,
                        styles.cardTopLeft,
                        { borderColor: colors.neonPink },
                     ]}
                  />
                  <View
                     style={[
                        styles.cornerBracket,
                        styles.cardTopRight,
                        { borderColor: colors.neonCyan },
                     ]}
                  />
                  <View
                     style={[
                        styles.cornerBracket,
                        styles.cardBottomLeft,
                        { borderColor: colors.neonPink },
                     ]}
                  />
                  <View
                     style={[
                        styles.cornerBracket,
                        styles.cardBottomRight,
                        { borderColor: colors.neonPink },
                     ]}
                  />

                  {/* Holographic overlay for league header - Neon Magenta */}
                  <LinearGradient
                     colors={[colors.holoPink, 'transparent', colors.neonPink]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={styles.headerHoloOverlay}
                  />

                  {/* League Image + Edit Button Section */}
                  <View className="flex-row">
                     {/* Image + Edit Button Column */}
                     <View className="items-center p-3">
                        <View style={styles.leagueImageContainer}>
                           {league.imageUrl ? (
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
                           ) : (
                              <View
                                 style={styles.leagueImagePlaceholder}
                                 className="items-center justify-center"
                              >
                                 <Ionicons
                                    name="trophy"
                                    size={40}
                                    color={colors.neonPink}
                                    style={{
                                       textShadowColor: colors.neonPink,
                                       textShadowOffset: { width: 0, height: 0 },
                                       textShadowRadius: 8,
                                    }}
                                 />
                              </View>
                           )}
                        </View>

                        {isMember && (
                           <Pressable
                              onPress={() => setIsEditModalVisible(true)}
                              style={styles.cyberpunkEditButton}
                              accessibilityRole="button"
                              accessibilityLabel={t('editLeague')}
                              accessibilityHint={t('editLeagueDetails')}
                           >
                              <LinearGradient
                                 colors={[colors.cyberBackground, colors.holoPink]}
                                 start={{ x: 0, y: 0 }}
                                 end={{ x: 1, y: 1 }}
                                 style={styles.editButtonGradient}
                              >
                                 {/* Corner brackets for edit button */}
                                 <View
                                    style={[
                                       styles.editCornerBracket,
                                       styles.editTopLeft,
                                       { borderColor: colors.neonPink },
                                    ]}
                                 />
                                 <View
                                    style={[
                                       styles.editCornerBracket,
                                       styles.editBottomRight,
                                       { borderColor: colors.neonPink },
                                    ]}
                                 />

                                 <View style={styles.editButtonContent}>
                                    <Ionicons
                                       name="pencil"
                                       size={12}
                                       color={colors.neonPink}
                                       style={{
                                          textShadowColor: colors.neonPink,
                                          textShadowOffset: { width: 0, height: 0 },
                                          textShadowRadius: 4,
                                       }}
                                    />
                                    <Text style={styles.editButtonText}>
                                       {t('editLeague')}
                                    </Text>
                                 </View>
                              </LinearGradient>
                           </Pressable>
                        )}
                     </View>

                     {/* League Info Column */}
                     <View className="flex-1 ml-4 justify-center">
                        <Text style={styles.leagueNameNeonMagenta}>{league.name}</Text>
                        <View className="flex-row items-center">
                           <Text style={styles.leagueCodeLabel}>
                              {t('leagueCode')}
                           </Text>
                           <View
                              className="px-3 py-1 rounded-md mr-3"
                              style={styles.inviteCodeBadge}
                              accessibilityRole="text"
                              accessibilityLabel={`${t('inviteCode')}: ${league.inviteCode}`}
                           >
                              <Text style={styles.inviteCodeText}>
                                 {league.inviteCode}
                              </Text>
                           </View>
                           {/* <Text className="text-white/50 text-xs">
                              {league.memberCount} {t('members')}
                           </Text> */}
                        </View>
                     </View>
                  </View>

                  {/* Cyberpunk divider with neon magenta glow */}
                  <View style={styles.cyberpunkDividerMagenta}>
                     <LinearGradient
                        colors={[
                           colors.neonPink,
                           colors.neonCyan,
                           colors.neonPink,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.dividerGradientMagenta}
                     />
                  </View>

                  {/* Members Section */}
                  {league.members && league.members.length > 0 && (
                     <View>
                        <Text style={styles.membersLabel}>{t('members')}</Text>
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

            {/* Main Action Cards with cyberpunk container */}
            <View style={styles.actionCardsContainer}>
               {/* View Detailed Stats Card */}
               <ActionCard
                  title={t('viewDetailedStats')}
                  description={t('viewStatsDescription')}
                  iconName="stats-chart"
                  iconColor={colors.neonCyan}
                  onPress={handleViewStats}
                  isRTL={isRTL}
                  accessibilityLabel={t('viewDetailedStats')}
                  accessibilityHint={t('navigateToDetailedStatsScreen')}
               />

               {/* Conditional Game Action Card */}
               {isCheckingActiveGame ? (
                  <View
                     style={[
                        styles.cyberpunkActionCard,
                        {
                           shadowColor: colors.neonCyan,
                           shadowOpacity: 0.4,
                           borderColor: colors.neonCyan,
                        },
                     ]}
                     accessibilityRole="text"
                     accessibilityLabel={t('checkingGames')}
                  >
                     <LinearGradient
                        colors={[
                           colors.cyberBackground,
                           colors.holoBlue,
                           'transparent',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.actionCardGradient}
                     >
                        <View style={styles.actionCardContent}>
                           <View
                              style={[
                                 styles.cyberpunkIconContainer,
                                 {
                                    backgroundColor: colors.holoBlue,
                                    borderColor: colors.neonCyan,
                                    shadowColor: colors.neonCyan,
                                    shadowOpacity: 0.6,
                                 },
                              ]}
                           >
                              <CyberpunkLoader size="small" variant="cyan" />
                           </View>

                           <View style={styles.actionTextContainer}>
                              <Text style={styles.actionTitle}>
                                 {t('checkingGames')}
                              </Text>
                              <Text style={styles.actionDescription}>
                                 {t('checkingGamesDescription')}
                              </Text>
                           </View>
                        </View>
                     </LinearGradient>
                  </View>
               ) : activeGame ? (
                  /* Continue Active Game Card */
                  <ActionCard
                     title={t('continueGame')}
                     description={t('continueGameDescription')}
                     iconName="play-circle"
                     iconColor={colors.neonOrange}
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
                     iconColor={colors.matrixGreen}
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

// Cyberpunk-themed style objects
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
      backgroundColor: colors.holoBlue,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
   } as ViewStyle,
   // Cyberpunk Header Styles
   cyberpunkHeader: {
      height: 100,
      position: 'relative',
   } as ViewStyle,
   headerGradient: {
      flex: 1,
      borderBottomWidth: 2,
      borderBottomColor: colors.neonCyan,
      position: 'relative',
   } as ViewStyle,
   cornerBracket: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderWidth: 3,
      zIndex: 10,
   } as ViewStyle,
   topLeft: {
      top: 8,
      left: 8,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   topRight: {
      top: 8,
      right: 8,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   bottomLeft: {
      bottom: 8,
      left: 8,
      borderRightWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   bottomRight: {
      bottom: 8,
      right: 8,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   holoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.15,
   } as ViewStyle,
   scanLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.scanlineCyan,
   } as ViewStyle,
   headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 10,
      zIndex: 5,
   } as ViewStyle,
   cyberpunkBackButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.neonCyan,
   } as ViewStyle,
   backButtonGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   } as ViewStyle,
   backButtonGlow: {
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 8,
      elevation: 8,
   } as ViewStyle,
   titleContainer: {
      alignItems: 'center',
      position: 'relative',
   } as ViewStyle,
   cyberpunkTitle: {
      color: colors.neonCyan,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   },
   titleUnderline: {
      height: 2,
      width: 60,
      marginTop: 4,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 4,
      elevation: 4,
   } as ViewStyle,
   headerSpacer: {
      width: 44,
   } as ViewStyle,
   // League Header Card Styles
   leagueHeaderCard: {
      borderWidth: 2,
      borderColor: colors.neonPink,
      shadowColor: colors.neonPink,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
      position: 'relative',
   } as ViewStyle,
   leagueHeaderGradient: {
      padding: 20,
      position: 'relative',
   } as ViewStyle,
   headerHoloOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
   } as ViewStyle,
   // League Card Corner Brackets
   cardTopLeft: {
      top: 4,
      left: 4,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   cardTopRight: {
      top: 4,
      right: 4,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   cardBottomLeft: {
      bottom: 4,
      left: 4,
      borderRightWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   cardBottomRight: {
      bottom: 4,
      right: 4,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   cardHoloOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
   } as ViewStyle,
   leagueCard: {
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
      position: 'relative',
   } as ViewStyle,
   leagueCardGradient: {
      padding: 20,
      borderRadius: 14,
      position: 'relative',
   } as ViewStyle,
   leagueNameNeonMagenta: {
      color: colors.neonPink,
      fontWeight: 'bold',
      fontSize: 24,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textTransform: 'uppercase',
      textShadowColor: colors.neonPink,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      marginBottom: 8,
   },
   leagueName: {
      color: colors.neonCyan,
      fontWeight: 'bold',
      fontSize: 24,
      fontFamily: 'monospace',
      letterSpacing: 1,
      textTransform: 'uppercase',
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      marginBottom: 8,
   },
   leagueCodeLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: 'monospace',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
   },
   inviteCodeText: {
      color: colors.matrixGreen,
      fontWeight: 'bold',
      fontSize: 14,
      fontFamily: 'monospace',
      letterSpacing: 1.5,
      textShadowColor: colors.matrixGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 1,
   },
   membersLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: 'monospace',
      fontWeight: '600',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
   },
   leagueImageContainer: {
      width: 80,
      height: 80,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.neonPink,
      shadowColor: colors.neonPink,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
      position: 'relative',
   } as ViewStyle,
   leagueImage: {
      width: 80,
      height: 80,
   },
   leagueImagePlaceholder: {
      width: 80,
      height: 80,
      backgroundColor: colors.cyberBackground,
      borderWidth: 2,
      borderColor: colors.neonPink,
      borderRadius: 16,
      shadowColor: colors.neonPink,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
   } as ViewStyle,
   imageContainer: {
      width: 64,
      height: 64,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
   } as ViewStyle,
   cyberpunkEditButton: {
      marginTop: 12,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.neonPink,
      shadowColor: colors.neonPink,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
      position: 'relative',
   } as ViewStyle,
   editButtonGradient: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      position: 'relative',
   } as ViewStyle,
   editCornerBracket: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderWidth: 1.5,
      zIndex: 10,
   } as ViewStyle,
   editTopLeft: {
      top: 2,
      left: 2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   editBottomRight: {
      bottom: 2,
      right: 2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   editButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 5,
   } as ViewStyle,
   editButtonText: {
      color: colors.neonPink,
      fontSize: 11,
      fontFamily: 'monospace',
      fontWeight: '600',
      letterSpacing: 0.5,
      marginLeft: 4,
      textShadowColor: colors.neonPink,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 2,
   },
   editButton: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
   } as ViewStyle,
   inviteCodeBadge: {
      backgroundColor: colors.holoGreen,
      borderWidth: 1,
      borderColor: colors.matrixGreen,
      shadowColor: colors.matrixGreen,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
   } as ViewStyle,
   actionCardPressable: {
      marginBottom: 16,
   } as ViewStyle,
   // Cyberpunk Action Card Styles
   cyberpunkActionCard: {
      borderRadius: 16,
      borderWidth: 2,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 16,
      elevation: 12,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   actionCardGradient: {
      padding: 20,
      position: 'relative',
   } as ViewStyle,
   actionCornerBracket: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderWidth: 2,
      zIndex: 10,
   } as ViewStyle,
   actionTopLeft: {
      top: 4,
      left: 4,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   actionTopRight: {
      top: 4,
      right: 4,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   actionBottomLeft: {
      bottom: 4,
      left: 4,
      borderRightWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   actionBottomRight: {
      bottom: 4,
      right: 4,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   actionHoloOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.8,
   } as ViewStyle,
   actionScanLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
   } as ViewStyle,
   actionCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 5,
   } as ViewStyle,
   cyberpunkIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 8,
      elevation: 6,
   } as ViewStyle,
   actionTextContainer: {
      flex: 1,
   } as ViewStyle,
   actionTitle: {
      color: colors.textNeonGreen,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 6,
      textShadowColor: 'black',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 2,
   },
   actionDescription: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      lineHeight: 20,
   },
   actionChevron: {
      marginLeft: 12,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 4,
      elevation: 4,
   } as ViewStyle,
   errorCard: {
      backgroundColor: colors.holoBlue,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.error,
      padding: 32,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
      position: 'relative',
   } as ViewStyle,
   errorTitle: {
      color: colors.error,
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: 16,
      textShadowColor: colors.error,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   },
   errorMessage: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
   },
   retryButton: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.error,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
   } as ViewStyle,
   retryButtonGradient: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
   } as ViewStyle,
   retryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
   },
   // Cyberpunk divider styles
   cyberpunkDivider: {
      height: 2,
      marginVertical: 16,
      position: 'relative',
   } as ViewStyle,
   dividerGradient: {
      height: 2,
      opacity: 0.6,
   } as ViewStyle,
   // Cyberpunk divider styles - Neon Magenta Theme
   cyberpunkDividerMagenta: {
      height: 2,
      marginVertical: 16,
      position: 'relative',
      shadowColor: colors.neonPink,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 4,
   } as ViewStyle,
   dividerGradientMagenta: {
      height: 2,
      opacity: 0.8,
   } as ViewStyle,
   // Action cards container
   actionCardsContainer: {
      gap: 16,
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
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
   },
});

// Add React.memo to prevent unnecessary re-renders
const LeagueStats = React.memo(LeagueStatsComponent);
LeagueStats.displayName = 'LeagueStats';

export default LeagueStats;
