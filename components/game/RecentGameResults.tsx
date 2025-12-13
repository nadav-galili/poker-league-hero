import { useLocalization } from '@/context/localization';
import { GameResult } from '@/hooks/useLeagueGames';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
   runOnJS,
   useAnimatedStyle,
   useSharedValue,
   withSpring,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const CARD_OFFSET = 20; // For layered card effect

interface RecentGameResultsProps {
   games: GameResult[];
   isLoading: boolean;
   error: string | null;
   hasMore: boolean;
   loadMore: () => void;
}

const PlayerRow = ({
   item,
   index,
}: {
   item: GameResult['players'][0];
   index: number;
}) => {
   const { t, isRTL } = useLocalization();
   const isTopThree = index < 3;

   return (
      <View
         className="flex-row items-center justify-between py-3 relative"
         style={{
            opacity: isTopThree ? 1 : 0.7,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 255, 255, 0.1)',
         }}
      >
         {/* Cyberpunk rank indicator for top 3 */}
         {isTopThree && (
            <View
               className="absolute left-0 w-1 h-full bg-gradient-to-b"
               style={{
                  backgroundColor:
                     index === 0
                        ? '#00FFFF'
                        : index === 1
                          ? '#00BFFF'
                          : '#0099FF',
               }}
            />
         )}

         <View
            className="flex-row items-center flex-1 ml-2"
            style={{ marginEnd: 16 }}
         >
            <View className="relative">
               <Image
                  source={
                     item.profileImageUrl
                        ? { uri: item.profileImageUrl }
                        : require('@/assets/images/anonymous.webp')
                  }
                  style={{
                     width: 32,
                     height: 32,
                     borderRadius: 4, // Sharp cyberpunk edges
                     [isRTL ? 'marginLeft' : 'marginRight']: 12,
                     borderWidth: isTopThree ? 2 : 1,
                     borderColor: isTopThree
                        ? '#00FFFF'
                        : 'rgba(0, 255, 255, 0.3)',
                  }}
                  contentFit="cover"
               />

               {/* Cyberpunk corner brackets for top players */}
               {isTopThree && (
                  <>
                     <View className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-[#00FFFF]" />
                     <View className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-[#00FFFF]" />
                     <View className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-[#00FFFF]" />
                     <View className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-[#00FFFF]" />
                  </>
               )}
            </View>

            <View
               style={{
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                  flex: 1,
               }}
            >
               <Text
                  className={`font-medium text-sm font-mono tracking-wider ${
                     isTopThree ? 'text-[#00FFFF]' : 'text-white'
                  }`}
                  style={{
                     textAlign: isRTL ? 'right' : 'left',
                     textShadowColor: isTopThree ? '#00FFFF' : 'transparent',
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: isTopThree ? 4 : 0,
                  }}
                  numberOfLines={1}
               >
                  {item.fullName}
               </Text>
               <Text
                  className="text-[#00BFFF]/70 text-xs font-mono"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
               >
                  {t('buyIn')}: {t('currency')}
                  {item.totalBuyIns}
               </Text>
            </View>
         </View>

         <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
            <Text
               className={`font-bold text-sm font-mono tracking-wider ${
                  item.profit > 0
                     ? 'text-[#00FF88]'
                     : item.profit < 0
                       ? 'text-[#FF4444]'
                       : 'text-gray-400'
               }`}
               style={{
                  textShadowColor:
                     item.profit > 0
                        ? '#00FF88'
                        : item.profit < 0
                          ? '#FF4444'
                          : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: item.profit !== 0 ? 4 : 0,
               }}
            >
               {item.profit > 0 ? '+' : ''}
               {t('currency')}
               {item.profit.toFixed(2)}
            </Text>
         </View>
      </View>
   );
};

const GameCard = ({
   game,
   isActive = false,
}: {
   game: GameResult;
   isActive?: boolean;
}) => {
   const { t } = useLocalization();

   const formatTime = (dateString: string) => {
      return dayjs(dateString).format('HH:mm');
   };

   return (
      <View
         className="w-full bg-black/90 border-2 border-[#00BFFF] relative overflow-hidden"
         style={{
            borderColor: isActive ? '#00FFFF' : '#00BFFF',
            shadowColor: '#00BFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isActive ? 0.8 : 0.6,
            shadowRadius: isActive ? 16 : 12,
            elevation: isActive ? 16 : 12,
            transform: [{ scale: isActive ? 1.02 : 1 }],
         }}
      >
         {/* Cyberpunk corner brackets */}
         <View className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#00FFFF]" />
         <View className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#00BFFF]" />
         <View className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#00BFFF]" />
         <View className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#00FFFF]" />

         {/* Holographic overlay */}
         <LinearGradient
            colors={[
               'rgba(0, 255, 255, 0.05)',
               'transparent',
               'rgba(0, 191, 255, 0.05)',
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

         {/* Game Header - Cyberpunk styled */}
         <View className="p-4 bg-black/80 border-b border-[#00BFFF]/30 flex-row justify-between items-center relative">
            {/* Header scan line */}
            <View
               className="absolute top-0 left-0 right-0 h-px bg-[#00FFFF]"
               style={{ opacity: 0.3 }}
            />

            <View>
               <Text
                  className="text-[#00FFFF] text-xs font-mono font-bold mb-1 tracking-wider uppercase"
                  style={{
                     textShadowColor: '#00FFFF',
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 4,
                  }}
               >
                  {dayjs(game.endedAt).format('MMM DD, YYYY')}
               </Text>
               <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={12} color="#00BFFF" />
                  <Text className="text-[#00FFFF] text-xs ml-1  tracking-wide">
                     {game.startedAt ? formatTime(game.startedAt) : '--:--'} -{' '}
                     {formatTime(game.endedAt)}
                  </Text>
               </View>
            </View>

            <View className="items-end">
               <Text className="text-[#00FFFF] text-xs mb-1  uppercase tracking-wider">
                  {t('gameManager')}
               </Text>
               <View className="flex-row items-center">
                  <Text className="text-[#00FFFF] font-mono font-bold text-xs mr-2 tracking-wide">
                     {game.creatorName}
                  </Text>
                  <View className="relative">
                     <Image
                        source={
                           game.creatorImage
                              ? { uri: game.creatorImage }
                              : require('@/assets/images/anonymous.webp')
                        }
                        style={{
                           width: 20,
                           height: 20,
                           borderRadius: 2, // Sharp cyberpunk edges
                           borderWidth: 1,
                           borderColor: '#00BFFF',
                        }}
                     />
                     {/* Mini corner brackets */}
                     <View className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-l border-t border-[#00FFFF]" />
                     <View className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-r border-t border-[#00FFFF]" />
                     <View className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-l border-b border-[#00FFFF]" />
                     <View className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-r border-b border-[#00FFFF]" />
                  </View>
               </View>
            </View>
         </View>

         {/* Players List - Cyberpunk styled */}
         <View className="p-4 relative" style={{ minHeight: 200 }}>
            {/* Background grid pattern */}
            <View
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage:
                     'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
               }}
            />

            <FlashList
               data={game.players}
               renderItem={({ item, index }) => (
                  <PlayerRow item={item} index={index} />
               )}
               scrollEnabled={false}
               keyExtractor={(item) => item.id.toString()}
            />

            {/* Bottom scan line */}
            <View
               className="absolute bottom-0 left-0 right-0 h-px bg-[#00BFFF]"
               style={{ opacity: 0.3 }}
            />
         </View>
      </View>
   );
};

export default function RecentGameResults({
   games,
   isLoading,
   error,
   hasMore,
   loadMore,
}: RecentGameResultsProps) {
   const { t } = useLocalization();
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isTransitioning, setIsTransitioning] = useState(false);
   const translateX = useSharedValue(0);

   const handleNext = () => {
      if (currentIndex < games.length - 1) {
         setIsTransitioning(true);
         setCurrentIndex(currentIndex + 1);
         setTimeout(() => setIsTransitioning(false), 200);
      } else if (hasMore && !isLoading) {
         loadMore();
         // We don't increment index immediately here;
         // the effect below will handle index update if needed or user swipes again
         // But logically we want to show the newly loaded game, so we'll wait for props update
      }
   };

   const handlePrev = () => {
      if (currentIndex > 0) {
         setIsTransitioning(true);
         setCurrentIndex(currentIndex - 1);
         setTimeout(() => setIsTransitioning(false), 200);
      }
   };

   // Effect to handle post-loading state: if we just loaded more games, we might want to advance index
   // However, simplest is just letting the user swipe again or stay on current.
   // But we must ensure index is valid if games list shrinks (unlikely here)
   useEffect(() => {
      if (games.length > 0 && currentIndex >= games.length) {
         setCurrentIndex(games.length - 1);
      }
   }, [games.length, currentIndex]);

   // If the user swiped next to trigger a load, and games grew, we can auto-advance
   // For now, let's keep it manual to avoid jarring jumps, or user can swipe again.

   const pan = Gesture.Pan()
      .onUpdate((event) => {
         'worklet';
         // Constrain the translation to prevent excessive movement
         const maxTranslation = 100; // Limit translation to 100px
         translateX.value = Math.max(
            -maxTranslation,
            Math.min(maxTranslation, event.translationX)
         );
      })
      .onEnd((event) => {
         'worklet';
         if (event.translationX < -SWIPE_THRESHOLD) {
            runOnJS(handleNext)();
         } else if (event.translationX > SWIPE_THRESHOLD) {
            runOnJS(handlePrev)();
         }
         translateX.value = withSpring(0);
      });

   const animatedStyle = useAnimatedStyle(() => {
      return {
         transform: [{ translateX: translateX.value }],
      };
   });

   if (isLoading && games.length === 0) {
      return (
         <View className="w-full h-48 items-center justify-center bg-white/5 rounded-3xl border border-white/10">
            <Text className="text-white/40">{t('loadingGame')}</Text>
         </View>
      );
   }

   if (error && games.length === 0) {
      return (
         <View className="w-full h-48 items-center justify-center bg-red-500/10 rounded-3xl border border-red-500/20">
            <Text className="text-red-400">{error}</Text>
         </View>
      );
   }

   if (!games || games.length === 0) {
      return (
         <View className="w-full h-48 items-center justify-center bg-white/5 rounded-3xl border border-white/10">
            <Text className="text-white/40">{t('noGamesYet')}</Text>
         </View>
      );
   }

   return (
      <View className="mb-8">
         {/* Cyberpunk Section Header - Blue/Teal Theme */}
         <View className="relative mb-6 overflow-hidden">
            <View
               className="bg-black/90 border-2 border-[#00BFFF] px-6 py-4 relative"
               style={{
                  shadowColor: '#00BFFF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.7,
                  shadowRadius: 16,
                  elevation: 16,
               }}
            >
               {/* Corner Brackets - Blue/Cyan Theme */}
               <View className="absolute top-1.5 left-1.5 w-5 h-5 border-l-2 border-t-2 border-[#00FFFF]" />
               <View className="absolute top-1.5 right-1.5 w-5 h-5 border-r-2 border-t-2 border-[#00BFFF]" />
               <View className="absolute bottom-1.5 left-1.5 w-5 h-5 border-l-2 border-b-2 border-[#00BFFF]" />
               <View className="absolute bottom-1.5 right-1.5 w-5 h-5 border-r-2 border-b-2 border-[#00FFFF]" />

               {/* Holographic Overlay - Blue Theme */}
               <LinearGradient
                  colors={[
                     'rgba(0, 255, 255, 0.08)',
                     'transparent',
                     'rgba(0, 191, 255, 0.06)',
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
                  className="text-center text-[#00BFFF] text-xl font-mono font-bold tracking-[4px] uppercase"
                  style={{
                     textShadowColor: '#00BFFF',
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 10,
                  }}
               >
                  {t('recentGameResults')}
               </Text>

               {/* Scan Lines - Dual Color */}
               <View
                  className="absolute top-2 left-0 right-0 h-px bg-[#00BFFF]"
                  style={{ opacity: 0.4 }}
               />
               <View
                  className="absolute bottom-2 left-0 right-0 h-px bg-[#00FFFF]"
                  style={{ opacity: 0.4 }}
               />
            </View>
         </View>

         {/* Enhanced Swipeable Content with Visual Feedback */}
         <View className="relative">
            {/* Background cards for depth effect */}
            {currentIndex < games.length - 1 && (
               <View
                  className="absolute inset-0 z-0"
                  style={{
                     transform: [{ translateX: CARD_OFFSET }, { scale: 0.95 }],
                     opacity: 0.3,
                  }}
               >
                  <GameCard game={games[currentIndex + 1]} />
               </View>
            )}

            {/* Active card */}
            <GestureDetector gesture={pan}>
               <Animated.View style={[animatedStyle, { zIndex: 10 }]}>
                  <GameCard game={games[currentIndex]} isActive={true} />
               </Animated.View>
            </GestureDetector>
         </View>

         {/* Enhanced Pagination with Cyberpunk Styling */}
         <View className="flex-row justify-center items-center mt-6 space-x-3">
            {games.map((_, index) => {
               const isActive = index === currentIndex;
               const isPast = index < currentIndex;
               const isFuture = index > currentIndex;

               return (
                  <View key={index} className="relative">
                     {/* Main dot */}
                     <View
                        className={`w-3 h-3 border ${
                           isActive
                              ? 'bg-[#00FFFF] border-[#00FFFF]'
                              : isPast
                                ? 'bg-[#00BFFF]/60 border-[#00BFFF]'
                                : 'bg-transparent border-[#00BFFF]/40'
                        }`}
                        style={{
                           borderRadius: 2, // Square cyberpunk style
                           shadowColor: isActive ? '#00FFFF' : 'transparent',
                           shadowOffset: { width: 0, height: 0 },
                           shadowOpacity: 0.8,
                           shadowRadius: isActive ? 6 : 0,
                           elevation: isActive ? 6 : 0,
                        }}
                     />

                     {/* Corner brackets for active dot */}
                     {isActive && (
                        <>
                           <View className="absolute -top-1 -left-1 w-1.5 h-1.5 border-l border-t border-[#00FFFF]" />
                           <View className="absolute -top-1 -right-1 w-1.5 h-1.5 border-r border-t border-[#00FFFF]" />
                           <View className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border-l border-b border-[#00FFFF]" />
                           <View className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-r border-b border-[#00FFFF]" />
                        </>
                     )}
                  </View>
               );
            })}

            {/* Loading indicator */}
            {isLoading && games.length > 0 && (
               <View className="relative">
                  <View
                     className="w-3 h-3 bg-[#00BFFF]/30 border border-[#00BFFF] animate-pulse"
                     style={{ borderRadius: 2 }}
                  />
                  <View className="absolute -top-1 -left-1 w-1.5 h-1.5 border-l border-t border-[#00BFFF] animate-pulse" />
                  <View className="absolute -top-1 -right-1 w-1.5 h-1.5 border-r border-t border-[#00BFFF] animate-pulse" />
                  <View className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border-l border-b border-[#00BFFF] animate-pulse" />
                  <View className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-r border-b border-[#00BFFF] animate-pulse" />
               </View>
            )}
         </View>

         {/* Status Text with Cyberpunk Styling */}
         <View className="mt-4 items-center">
            <Text
               className="text-[#00BFFF] text-xs text-center font-mono tracking-wider uppercase"
               style={{
                  textShadowColor: '#00BFFF',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
               }}
            >
               {isTransitioning
                  ? 'SWITCHING DATA...'
                  : hasMore
                    ? t('swipeForMore')
                    : `GAME ${currentIndex + 1} OF ${games.length}`}
            </Text>

            {/* Indicator line */}
            <View
               className="mt-2 h-px bg-[#00BFFF] animate-pulse"
               style={{ width: 120, opacity: 0.6 }}
            />
         </View>
      </View>
   );
}
