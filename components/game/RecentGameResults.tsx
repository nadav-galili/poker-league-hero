import { useLocalization } from '@/context/localization';
import { GameResult } from '@/hooks/useLeagueGames';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
   ActivityIndicator,
   Dimensions,
   FlatList,
   Text,
   View,
   ViewToken,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface RecentGameResultsProps {
   games: GameResult[];
   isLoading: boolean;
   error: string | null;
   hasMore: boolean;
   loadMore: () => void;
}

const PlayerRow = React.memo(
   ({ item, index }: { item: GameResult['players'][0]; index: number }) => {
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
                        borderRadius: 4,
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
                  {item.profit > 0 ? '+' : item.profit < 0 ? '-' : ''}
                  {t('currency')}
                  {Math.abs(item.profit).toFixed(2)}
               </Text>
            </View>
         </View>
      );
   }
);

PlayerRow.displayName = 'PlayerRow';

const GameCard = React.memo(
   ({ game, isActive = false }: { game: GameResult; isActive?: boolean }) => {
      const { t } = useLocalization();
      const isGameActive = !game.endedAt;

      const formatTime = (dateString: string | null | undefined) => {
         if (!dateString) return '--:--';
         const date = dayjs(dateString);
         return date.isValid() ? date.format('HH:mm') : '--:--';
      };

      return (
         <View
            className="bg-black/90 border-2 border-[#00BFFF] relative overflow-hidden w-full"
            style={{
               borderColor: isActive ? '#00FFFF' : '#00BFFF',
               shadowColor: '#00BFFF',
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: isActive ? 0.8 : 0.6,
               shadowRadius: isActive ? 16 : 12,
               elevation: isActive ? 16 : 12,
            }}
         >
            {/* Cyberpunk corner brackets */}
            <View className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#00FFFF]" />
            <View className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#00BFFF]" />
            <View className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#00BFFF]" />
            <View className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#00FFFF]" />

            {/* Active Badge - Green Cyberpunk Style - Positioned at top-right of card */}
            {isGameActive && (
               <View
                  className="absolute z-20"
                  style={{
                     top: 12,
                     right: 12,
                     backgroundColor: 'rgba(0, 0, 0, 0.95)',
                     borderWidth: 2,
                     borderColor: '#00FF88',
                     paddingHorizontal: 10,
                     paddingVertical: 6,
                     shadowColor: '#00FF88',
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.9,
                     shadowRadius: 10,
                     elevation: 15,
                  }}
               >
                  {/* Corner brackets for badge */}
                  <View className="absolute -top-0.5 -left-0.5 w-2 h-2 border-l border-t border-[#00FF88]" />
                  <View className="absolute -top-0.5 -right-0.5 w-2 h-2 border-r border-t border-[#00FF88]" />
                  <View className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-l border-b border-[#00FF88]" />
                  <View className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-r border-b border-[#00FF88]" />

                  {/* Badge text */}
                  <Text
                     className="text-[#00FF88] text-xs font-mono font-bold tracking-wider uppercase"
                     style={{
                        textShadowColor: '#00FF88',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                     }}
                  >
                     {t('active').toUpperCase()}
                  </Text>

                  {/* Pulsing glow effect */}
                  <View
                     className="absolute inset-0"
                     style={{
                        backgroundColor: '#00FF88',
                        opacity: 0.15,
                     }}
                  />
               </View>
            )}

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
            <View
               className="p-4 bg-black/80 border-b border-[#00BFFF]/30 flex-row justify-between items-start relative"
               style={{ paddingTop: isGameActive ? 48 : 16 }}
            >
               {/* Header scan line */}
               <View
                  className="absolute top-0 left-0 right-0 h-px bg-[#00FFFF]"
                  style={{ opacity: 0.3 }}
               />

               <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                     className="text-[#00FFFF] text-xs font-mono font-bold mb-1 tracking-wider uppercase"
                     style={{
                        textShadowColor: '#00FFFF',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 4,
                     }}
                  >
                     {dayjs(game?.endedAt || game?.startedAt).format(
                        'MMM DD, YYYY'
                     )}
                  </Text>
                  <View className="flex-row items-center">
                     <Ionicons name="time-outline" size={12} color="#00BFFF" />
                     <Text className="text-[#00FFFF] text-xs ml-1 tracking-wide">
                        {formatTime(game.startedAt)} -{' '}
                        {game.endedAt && game.endedAt !== null
                           ? formatTime(game.endedAt)
                           : t('ongoing')}
                     </Text>
                  </View>
               </View>

               <View
                  className="items-end"
                  style={{ flexShrink: 0, marginTop: isGameActive ? 0 : 0 }}
               >
                  <Text className="text-[#00FFFF] text-xs mb-1 uppercase tracking-wider">
                     {t('gameManager')}
                  </Text>
                  <View className="flex-row items-center">
                     <Text
                        className="text-[#00FFFF] font-mono font-bold text-xs mr-2 tracking-wide"
                        numberOfLines={1}
                        style={{ maxWidth: 100 }}
                     >
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
                              borderRadius: 2,
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
            <View className="p-4 relative">
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
                  // @ts-ignore
                  estimatedItemSize={60}
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
   }
);

GameCard.displayName = 'GameCard';

export default function RecentGameResults({
   games,
   isLoading,
   error,
   hasMore,
   loadMore,
}: RecentGameResultsProps) {
   const { t } = useLocalization();
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isScrolling, setIsScrolling] = useState(false);
   const flatListRef = useRef<FlatList>(null);

   const onViewableItemsChanged = useRef(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
         if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            const newIndex = viewableItems[0].index;
            setCurrentIndex(newIndex);

            // Load more when reaching the last card
            if (newIndex >= games.length - 1 && hasMore && !isLoading) {
               loadMore();
            }
         }
         setIsScrolling(false);
      }
   ).current;

   const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50,
   }).current;

   const handleScrollBeginDrag = () => {
      setIsScrolling(true);
   };

   const handleScrollEnd = () => {
      setIsScrolling(false);
   };

   if (isLoading && games.length === 0) {
      return (
         <View className="w-full h-48 items-center justify-center bg-white/5 rounded-3xl border border-white/10">
            <ActivityIndicator size="large" color="#00FFFF" />
            <Text className="text-white/40 mt-2">{t('loadingGame')}</Text>
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
      <View className="mb-4">
         {/* Cyberpunk Section Header - Blue/Teal Theme */}
         <View className="relative mb-6 overflow-hidden px-6">
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
         {/* Status Text with Cyberpunk Styling */}
         <View className="mt-2 items-center px-6">
            <Text
               className="text-[#00BFFF] text-xs text-center font-mono tracking-wider uppercase"
               style={{
                  textShadowColor: '#00BFFF',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 4,
               }}
            >
               {hasMore
                  ? t('swipeForMore')
                  : t('gameXofY')
                       .replace('{current}', String(currentIndex + 1))
                       .replace('{total}', String(games.length))}
            </Text>

            {/* Indicator line */}
            <View
               className="mt-2 h-px bg-[#00BFFF] animate-pulse"
               style={{ width: 120, opacity: 0.6 }}
            />
         </View>
         {/* Enhanced Pagination with Cyberpunk Styling */}
         <View className="flex-row justify-center items-center my-3 space-x-3 px-6">
            {games.map((_, index) => {
               const isActive = index === currentIndex;
               const isPast = index < currentIndex;

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
                           borderRadius: 2,
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

         {/* FlatList for swipeable cards */}
         <View style={{ minHeight: 300 }}>
            <FlatList
               ref={flatListRef}
               data={games}
               horizontal
               showsHorizontalScrollIndicator={false}
               onViewableItemsChanged={onViewableItemsChanged}
               viewabilityConfig={viewabilityConfig}
               onScrollBeginDrag={handleScrollBeginDrag}
               onMomentumScrollEnd={handleScrollEnd}
               onScrollEndDrag={handleScrollEnd}
               snapToInterval={SCREEN_WIDTH}
               snapToAlignment="center"
               decelerationRate="fast"
               disableIntervalMomentum={true}
               keyExtractor={(item, index) => `game-${item.id}-${index}`}
               getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
               })}
               contentContainerStyle={{ paddingVertical: 8 }}
               renderItem={({ item, index }) => (
                  <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}>
                     <GameCard game={item} isActive={index === currentIndex} />
                     {isScrolling && index === currentIndex && (
                        <View
                           className="absolute inset-0 items-center justify-center z-20 mx-4"
                           style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.85)',
                              borderRadius: 2,
                           }}
                        >
                           <ActivityIndicator size="large" color="#00FFFF" />
                           <Text
                              className="text-[#00FFFF] text-sm font-mono mt-3 tracking-wider"
                              style={{
                                 textShadowColor: '#00FFFF',
                                 textShadowOffset: { width: 0, height: 0 },
                                 textShadowRadius: 6,
                              }}
                           >
                              {t('loading')}...
                           </Text>
                        </View>
                     )}
                  </View>
               )}
            />
         </View>
      </View>
   );
}
