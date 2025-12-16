import { colors, getCyberpunkGradient } from '@/colors';
import { LeagueCard } from '@/components/league/LeagueCard';
import { MyLeaguesHeader } from '@/components/league/MyLeaguesHeader';
import { InputModal } from '@/components/modals';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LeagueCardSkeleton } from '@/components/shared/LeagueCardSkeleton';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { useMyLeagues } from '@/hooks';
import { useMixpanel } from '@/hooks/useMixpanel';
import { LeagueWithTheme } from '@/types/league';
import { captureException } from '@/utils/sentry';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, RefreshControl, View } from 'react-native';

export default function MyLeagues() {
   const {
      leagues,
      isLoading,
      error,
      refreshing,
      loadLeagues,
      handleCreateLeague,
      handleJoinLeague,
      handleShareLeague,
      handleLeaguePress,
      handleRefresh,
      // Join modal state
      joinModalVisible,
      joinCode,
      setJoinCode,
      handleCloseJoinModal,
      handleSubmitJoinCode,
   } = useMyLeagues();

   const { trackScreenView } = useMixpanel();
   const { t } = useLocalization();

   // Cyberpunk animations
   const scanlineAnim = React.useRef(new Animated.Value(0)).current;
   const glowAnim = React.useRef(new Animated.Value(0)).current;
   const matrixFade = React.useRef(new Animated.Value(0.1)).current;

   // Track screen view on mount
   React.useEffect(() => {
      trackScreenView('My Leagues', {
         leagues_count: leagues?.length || 0,
      });
   }, [leagues, trackScreenView]);

   // Cyberpunk animations setup
   React.useEffect(() => {
      // Single scan line animation on mount
      const scanlineAnimation = Animated.timing(scanlineAnim, {
         toValue: 1,
         duration: 2000,
         useNativeDriver: true,
      });

      // Pulsing glow animation
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(glowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
               toValue: 0,
               duration: 2000,
               useNativeDriver: true,
            }),
         ])
      );

      // Matrix fade animation
      const matrixAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(matrixFade, {
               toValue: 0.3,
               duration: 4000,
               useNativeDriver: true,
            }),
            Animated.timing(matrixFade, {
               toValue: 0.1,
               duration: 4000,
               useNativeDriver: true,
            }),
         ])
      );

      scanlineAnimation.start();
      glowAnimation.start();
      matrixAnimation.start();

      return () => {
         glowAnimation.stop();
         matrixAnimation.stop();
      };
   }, []);

   // Render function for league cards with cyberpunk wrapper
   const renderLeagueCard = React.useCallback(
      ({ item }: { item: LeagueWithTheme }) => {
         try {
            return (
               <View className="relative">
                  {/* Holographic glow effect */}
                  <Animated.View
                     className="absolute inset-0 rounded-2xl opacity-20"
                     style={{
                        backgroundColor: colors.neonCyan,
                        opacity: glowAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [0.1, 0.3],
                        }),
                        transform: [
                           {
                              scale: glowAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [1, 1.02],
                              }),
                           },
                        ],
                     }}
                  />

                  {/* Main card */}
                  <LeagueCard
                     league={item}
                     onPress={handleLeaguePress}
                     onShare={handleShareLeague}
                  />

                  {/* Matrix scan line overlay */}
                  <Animated.View
                     className="absolute left-0 right-0 h-0.5 bg-neonCyan opacity-60"
                     style={{
                        transform: [
                           {
                              translateY: scanlineAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [0, 120],
                              }),
                           },
                        ],
                     }}
                  />
               </View>
            );
         } catch (error) {
            captureException(error as Error, {
               function: 'renderLeagueCard',
               screen: 'MyLeagues',
               leagueId: item.id,
               leagueName: item.name,
            });
            // Return a cyberpunk-styled fallback UI
            return (
               <View className="bg-red-500/20 border border-red-500 rounded-xl p-5 mx-4 items-center justify-center min-h-[100px] relative">
                  <View className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse" />
                  <Text className="text-red-400 font-mono">
                     ERROR: NEURAL_LINK_FAILED
                  </Text>
               </View>
            );
         }
      },
      [handleLeaguePress, handleShareLeague, glowAnim, scanlineAnim]
   );

   const scanlineTranslateY = scanlineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 800],
   });

   return (
      <View className="flex-1 relative">
         {/* Cyberpunk background with multiple layers */}
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            style={{
               flex: 1,
               position: 'absolute',
               width: '100%',
               height: '100%',
            }}
         />

         {/* Matrix grid overlay */}
         <Animated.View
            className="absolute inset-0 opacity-20"
            style={{ opacity: matrixFade }}
         >
            <View className="flex-1 bg-gradient-to-br from-transparent via-neonCyan/5 to-neonPink/5" />

            {/* Grid pattern */}
            <View className="absolute inset-0">
               {Array.from({ length: 20 }).map((_, i) => (
                  <View
                     key={`v-${i}`}
                     className="absolute w-px bg-neonCyan/10"
                     style={{
                        left: i * 20,
                        top: 0,
                        bottom: 0,
                     }}
                  />
               ))}
               {Array.from({ length: 40 }).map((_, i) => (
                  <View
                     key={`h-${i}`}
                     className="absolute h-px bg-neonCyan/10"
                     style={{
                        top: i * 20,
                        left: 0,
                        right: 0,
                     }}
                  />
               ))}
            </View>
         </Animated.View>

         {/* Scan line effect */}
         <Animated.View
            className="absolute left-0 right-0 h-1 bg-neonCyan opacity-80"
            style={{
               transform: [{ translateY: scanlineTranslateY }],
               shadowColor: colors.neonCyan,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: 1,
               shadowRadius: 10,
            }}
         />

         {/* Corner frame elements */}
         <View className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-neonCyan" />
         <View className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-neonPink" />
         <View className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-neonGreen" />
         <View className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-neonBlue" />

         {/* Enhanced header with cyberpunk styling */}
         <View className="relative">
            <MyLeaguesHeader
               onJoinLeague={handleJoinLeague}
               onCreateLeague={handleCreateLeague}
            />

            {/* Header underline glow */}
            <Animated.View
               className="absolute bottom-0 left-4 right-4 h-px bg-neonCyan"
               style={{
                  opacity: glowAnim.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0.3, 1],
                  }),
                  shadowColor: colors.neonCyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
               }}
            />
         </View>

         {/* Loading State with cyberpunk theme */}
         {isLoading && (
            <View className="p-5 gap-4 relative">
               {Array.from({ length: 3 }).map((_, index) => (
                  <View key={index} className="relative">
                     <LeagueCardSkeleton />
                     <Animated.View
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-neonCyan/20 to-transparent"
                        style={{
                           transform: [
                              {
                                 translateX: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-300, 300],
                                 }),
                              },
                           ],
                        }}
                     />
                  </View>
               ))}
            </View>
         )}

         {/* Error State with cyberpunk styling */}
         {error && !isLoading && (
            <View className="relative">
               <ErrorState error={error} onRetry={loadLeagues} />
               {/* Error glitch effect */}
               <Animated.View
                  className="absolute inset-0 bg-red-500/10"
                  style={{
                     opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.5],
                     }),
                  }}
               />
            </View>
         )}

         {/* Enhanced Leagues List */}
         {!isLoading && !error && (
            <View className="flex-1 mb-3 pb-32 relative">
               {/* Side panel indicators */}
               <View className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-neonCyan via-neonPink to-neonGreen opacity-60" />
               <View className="absolute right-0 top-4 bottom-4 w-1 bg-gradient-to-b from-neonGreen via-neonBlue to-neonPink opacity-60" />

               <FlashList
                  data={leagues}
                  renderItem={renderLeagueCard}
                  keyExtractor={(item) => item.id}
                  estimatedItemSize={140}
                  contentContainerStyle={{
                     padding: 20,
                     paddingLeft: 24,
                     paddingRight: 24,
                  }}
                  ItemSeparatorComponent={() => (
                     <View className="h-4 relative">
                        {/* Separator line with neon glow */}
                        <View className="absolute left-8 right-8 top-2 h-px bg-gradient-to-r from-transparent via-neonCyan/30 to-transparent" />
                     </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                     <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.neonCyan, colors.neonPink]}
                        tintColor={colors.neonCyan}
                        progressBackgroundColor={colors.cyberBackground}
                     />
                  }
                  ListEmptyComponent={
                     <EmptyState
                        onCreateLeague={handleCreateLeague}
                        onJoinLeague={handleJoinLeague}
                     />
                  }
               />
            </View>
         )}

         {/* Enhanced Join League Modal */}
         <InputModal
            visible={joinModalVisible}
            title={t('joinLeague')}
            placeholder={t('enterLeagueCode')}
            value={joinCode}
            onChangeText={setJoinCode}
            onClose={handleCloseJoinModal}
            onSubmit={handleSubmitJoinCode}
            submitText={t('join')}
            cancelText={t('cancel')}
            isLoading={isLoading}
         />

         {/* Bottom status bar */}
         <Animated.View
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neonCyan via-neonPink to-neonGreen"
            style={{
               opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
               }),
            }}
         />
      </View>
   );
}
