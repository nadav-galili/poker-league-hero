import { useLocalization } from '@/context/localization';
import { GameResult } from '@/hooks/useLeagueGames';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import {
   Gesture,
   GestureDetector,
   GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
   runOnJS,
   useAnimatedStyle,
   useSharedValue,
   withSpring,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

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
   const { t } = useLocalization();
   return (
      <View
         className="flex-row items-center justify-between py-3 border-b border-white/5"
         style={{ opacity: index < 3 ? 1 : 0.7 }}
      >
         <View className="flex-row items-center flex-1">
            <Image
               source={
                  item.profileImageUrl
                     ? { uri: item.profileImageUrl }
                     : require('@/assets/images/anonymous.webp')
               }
               style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
               }}
               contentFit="cover"
            />
            <View>
               <Text className="text-white font-medium text-sm">
                  {item.fullName}
               </Text>
               <Text className="text-white/50 text-xs">
                  {t('buyIn')}: {t('currency')}
                  {item.totalBuyIns}
               </Text>
            </View>
         </View>
         <View>
            <Text
               className={`font-bold text-sm ${
                  item.profit > 0
                     ? 'text-green-400'
                     : item.profit < 0
                       ? 'text-red-400'
                       : 'text-gray-400'
               }`}
            >
               {item.profit > 0 ? '+' : ''}
               {t('currency')}
               {item.profit.toFixed(2)}
            </Text>
         </View>
      </View>
   );
};

const GameCard = ({ game }: { game: GameResult }) => {
   const { t } = useLocalization();

   const formatTime = (dateString: string) => {
      return dayjs(dateString).format('HH:mm');
   };

   return (
      <View
         className="w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden"
         style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
         }}
      >
         {/* Game Header */}
         <View className="p-4 bg-white/5 border-b border-white/10 flex-row justify-between items-center">
            <View>
               <Text className="text-white text-xs font-medium mb-1">
                  {dayjs(game.endedAt).format('MMM DD, YYYY')}
               </Text>
               <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={12} color="#ffffff60" />
                  <Text className="text-success text-xs ml-1">
                     {game.startedAt ? formatTime(game.startedAt) : '--:--'} -{' '}
                     {formatTime(game.endedAt)}
                  </Text>
               </View>
            </View>
            <View className="items-end">
               <Text className="text-white/60 text-xs mb-1">
                  {t('gameManager')}
               </Text>
               <View className="flex-row items-center">
                  <Text className="text-white font-medium text-xs mr-2">
                     {game.creatorName}
                  </Text>
                  <Image
                     source={
                        game.creatorImage
                           ? { uri: game.creatorImage }
                           : require('@/assets/images/anonymous.webp')
                     }
                     style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                     }}
                  />
               </View>
            </View>
         </View>

         {/* Players List */}
         <View className="p-4" style={{ minHeight: 200 }}>
            <FlashList
               data={game.players}
               renderItem={({ item, index }) => (
                  <PlayerRow item={item} index={index} />
               )}
               scrollEnabled={false}
               keyExtractor={(item) => item.id.toString()}
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
   const translateX = useSharedValue(0);

   const handleNext = () => {
      if (currentIndex < games.length - 1) {
         setCurrentIndex(currentIndex + 1);
      } else if (hasMore && !isLoading) {
         loadMore();
         // We don't increment index immediately here;
         // the effect below will handle index update if needed or user swipes again
         // But logically we want to show the newly loaded game, so we'll wait for props update
      }
   };

   const handlePrev = () => {
      if (currentIndex > 0) {
         setCurrentIndex(currentIndex - 1);
      }
   };

   // Effect to handle post-loading state: if we just loaded more games, we might want to advance index
   // However, simplest is just letting the user swipe again or stay on current.
   // But we must ensure index is valid if games list shrinks (unlikely here)
   useEffect(() => {
      if (games.length > 0 && currentIndex >= games.length) {
         setCurrentIndex(games.length - 1);
      }
   }, [games.length]);

   // If the user swiped next to trigger a load, and games grew, we can auto-advance
   // For now, let's keep it manual to avoid jarring jumps, or user can swipe again.

   const pan = Gesture.Pan()
      .onUpdate((event) => {
         translateX.value = event.translationX;
      })
      .onEnd((event) => {
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
         {/* Section Header */}
         <View className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-3xl p-6 mb-6">
            <Text className="text-emerald-300 text-center text-xl font-semibold">
               {t('recentGameResults')}
            </Text>
         </View>

         {/* Swipeable Content */}
         <GestureHandlerRootView>
            <GestureDetector gesture={pan}>
               <Animated.View style={animatedStyle}>
                  <GameCard game={games[currentIndex]} />
               </Animated.View>
            </GestureDetector>
         </GestureHandlerRootView>

         {/* Pagination Dots */}
         <View className="flex-row justify-center items-center mt-4 space-x-2 gap-2">
            {games.map((_, index) => (
               <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                     index === currentIndex ? 'bg-emerald-400' : 'bg-white/20'
                  }`}
               />
            ))}
            {isLoading && games.length > 0 && (
               <View className="w-2 h-2 rounded-full bg-emerald-400/50 animate-pulse" />
            )}
         </View>

         <Text className="text-success text-xs text-center mt-2">
            {hasMore
               ? t('swipeForMore')
               : `${currentIndex + 1} / ${games.length}`}
         </Text>
      </View>
   );
}
