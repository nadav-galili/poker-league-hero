/**
 * Select Players Screen - Full Cyberpunk Design
 * Features neon colors, holographic overlays, corner brackets, and Matrix-style effects
 * Colors: #00FFFF (cyan), #FF073A (neon red/pink), #00FF41 (matrix green)
 */

import { colors, getCyberpunkGradient } from '@/colors';
import { GameSetupModal } from '@/components/modals';
import { AnonymousPlayerModal } from '@/components/modals/AnonymousPlayerModal';
import { Text } from '@/components/Text';
import { PlayerGrid } from '@/components/ui';
import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { useLocalization } from '@/context/localization';
import { useGameCreation, useLeagueMembers, usePlayerSelection } from '@/hooks';
import { useMixpanel } from '@/hooks/useMixpanel';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

// Cyberpunk Header Component with corner brackets and neon effects
const CyberpunkHeader = React.memo<{
   title: string;
   onBack: () => void;
   backButtonLabel: string;
   backButtonHint: string;
}>(({ title, onBack, backButtonLabel, backButtonHint }) => {
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
      <View style={cyberpunkStyles.header}>
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={cyberpunkStyles.headerGradient}
         >
            {/* Corner brackets */}
            <View
               style={[
                  cyberpunkStyles.cornerBracket,
                  cyberpunkStyles.topLeft,
                  { borderColor: colors.matrixGreen },
               ]}
            />
            <View
               style={[
                  cyberpunkStyles.cornerBracket,
                  cyberpunkStyles.topRight,
                  { borderColor: colors.neonCyan },
               ]}
            />
            <View
               style={[
                  cyberpunkStyles.cornerBracket,
                  cyberpunkStyles.bottomLeft,
                  { borderColor: colors.neonPink },
               ]}
            />
            <View
               style={[
                  cyberpunkStyles.cornerBracket,
                  cyberpunkStyles.bottomRight,
                  { borderColor: colors.matrixGreen },
               ]}
            />

            {/* Holographic overlay */}
            <LinearGradient
               colors={[colors.holoBlue, 'transparent', colors.holoPink]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={cyberpunkStyles.holoOverlay}
            />

            {/* Scan lines */}
            {Array.from({ length: 4 }).map((_, i) => (
               <Animated.View
                  key={i}
                  style={[
                     cyberpunkStyles.scanLine,
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
            <View style={cyberpunkStyles.headerContent}>
               <Pressable
                  onPress={onBack}
                  style={cyberpunkStyles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel={backButtonLabel}
                  accessibilityHint={backButtonHint}
               >
                  <LinearGradient
                     colors={[colors.holoBlue, colors.holoWhite]}
                     style={cyberpunkStyles.backButtonGradient}
                  >
                     <Animated.View
                        style={[
                           cyberpunkStyles.backButtonGlow,
                           {
                              shadowOpacity: glowOpacity,
                              shadowColor: colors.neonCyan,
                           },
                        ]}
                     >
                        <Ionicons
                           name="arrow-back"
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

               <View style={cyberpunkStyles.titleContainer}>
                  <Text variant="h3" style={cyberpunkStyles.title}>
                     {title}
                  </Text>
                  <Animated.View
                     style={[
                        cyberpunkStyles.titleUnderline,
                        {
                           shadowOpacity: glowOpacity,
                           backgroundColor: colors.neonCyan,
                        },
                     ]}
                  />
               </View>

               <View style={cyberpunkStyles.headerSpacer} />
            </View>
         </LinearGradient>
      </View>
   );
});

CyberpunkHeader.displayName = 'CyberpunkHeader';

// Cyberpunk Selection Summary Component with neon glow effects
const CyberpunkSelectionSummary = React.memo<{
   totalSelectedCount: number;
   t: any;
}>(({ totalSelectedCount, t }) => {
   const selectionGlowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(selectionGlowAnim, {
               toValue: 1,
               duration: 2000,
               useNativeDriver: false,
            }),
            Animated.timing(selectionGlowAnim, {
               toValue: 0.4,
               duration: 2000,
               useNativeDriver: false,
            }),
         ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
   }, [selectionGlowAnim]);

   const glowOpacity = selectionGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.8],
   });

   return (
      <View style={cyberpunkStyles.selectionSummaryCard}>
         <Animated.View
            style={[
               cyberpunkStyles.selectionSummaryContainer,
               {
                  shadowColor: colors.matrixGreen,
                  shadowOpacity: glowOpacity,
                  borderColor: colors.matrixGreen,
               },
            ]}
         >
            <LinearGradient
               colors={[
                  colors.cyberBackground,
                  colors.holoGreen,
                  'transparent',
               ]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={cyberpunkStyles.selectionSummaryGradient}
            >
               {/* Corner brackets */}
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.cardTopLeft,
                     { borderColor: colors.matrixGreen },
                  ]}
               />
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.cardTopRight,
                     { borderColor: colors.neonCyan },
                  ]}
               />
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.cardBottomLeft,
                     { borderColor: colors.neonPink },
                  ]}
               />
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.cardBottomRight,
                     { borderColor: colors.matrixGreen },
                  ]}
               />

               {/* Matrix-style scan lines */}
               {Array.from({ length: 2 }).map((_, i) => (
                  <Animated.View
                     key={i}
                     style={[
                        cyberpunkStyles.scanLine,
                        {
                           top: 10 + i * 20,
                           backgroundColor: colors.matrixGreen,
                           opacity: glowOpacity.interpolate({
                              inputRange: [0.4, 0.8],
                              outputRange: [0.1, 0.2],
                           }),
                        },
                     ]}
                  />
               ))}

               <View
                  accessibilityRole="text"
                  accessibilityLabel={`${totalSelectedCount} ${totalSelectedCount === 1 ? t('playerSelected') : t('playersSelected')}`}
               >
                  <Text
                     variant="h4"
                     style={cyberpunkStyles.selectionSummaryText}
                  >
                     {totalSelectedCount}{' '}
                     {totalSelectedCount === 1
                        ? t('playerSelected')
                        : t('playersSelected')}
                  </Text>
               </View>
            </LinearGradient>
         </Animated.View>
      </View>
   );
});

CyberpunkSelectionSummary.displayName = 'CyberpunkSelectionSummary';

// Cyberpunk Anonymous Player Tag with scan lines and neon effects
const CyberpunkAnonymousPlayerTag = React.memo<{
   player: any;
   onRemove: () => void;
}>(({ player, onRemove }) => {
   const tagGlowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(tagGlowAnim, {
               toValue: 1,
               duration: 3000,
               useNativeDriver: false,
            }),
            Animated.timing(tagGlowAnim, {
               toValue: 0.3,
               duration: 3000,
               useNativeDriver: false,
            }),
         ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
   }, [tagGlowAnim]);

   const glowOpacity = tagGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
   });

   return (
      <Pressable
         onPress={onRemove}
         style={cyberpunkStyles.anonymousPlayerTag}
         accessibilityRole="button"
         accessibilityLabel={`Remove ${player.name}`}
      >
         <Animated.View
            style={[
               cyberpunkStyles.anonymousTagContainer,
               {
                  shadowColor: colors.neonCyan,
                  shadowOpacity: glowOpacity,
                  borderColor: colors.neonCyan,
               },
            ]}
         >
            <LinearGradient
               colors={[colors.cyberBackground, colors.neonCyan, 'transparent']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={cyberpunkStyles.anonymousTagGradient}
            >
               {/* Mini scan line */}
               <Animated.View
                  style={[
                     cyberpunkStyles.miniScanLine,
                     {
                        backgroundColor: colors.neonPink,
                        opacity: glowOpacity.interpolate({
                           inputRange: [0.3, 0.7],
                           outputRange: [0.1, 0.3],
                        }),
                     },
                  ]}
               />

               <Image
                  source={require('@/assets/images/anonymous.webp')}
                  style={cyberpunkStyles.anonymousAvatar}
                  contentFit="cover"
               />
               <Text variant="body" style={cyberpunkStyles.anonymousPlayerName}>
                  {player.name}
               </Text>
               <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.neonPink}
                  style={{
                     textShadowColor: colors.neonOrange,
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: 4,
                  }}
               />
            </LinearGradient>
         </Animated.View>
      </Pressable>
   );
});

CyberpunkAnonymousPlayerTag.displayName = 'CyberpunkAnonymousPlayerTag';

// Cyberpunk Add Anonymous Player Button
const CyberpunkAddButton = React.memo<{
   title: string;
   onPress: () => void;
   icon: string;
}>(({ title, onPress, icon }) => {
   const addButtonGlowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(addButtonGlowAnim, {
               toValue: 1,
               duration: 2500,
               useNativeDriver: false,
            }),
            Animated.timing(addButtonGlowAnim, {
               toValue: 0.4,
               duration: 2500,
               useNativeDriver: false,
            }),
         ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
   }, [addButtonGlowAnim]);

   const glowOpacity = addButtonGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.8],
   });

   return (
      <Pressable
         onPress={onPress}
         style={cyberpunkStyles.addButton}
         accessibilityRole="button"
         accessibilityLabel={title}
      >
         <Animated.View
            style={[
               cyberpunkStyles.addButtonContainer,
               {
                  shadowColor: colors.neonBlue,
                  shadowOpacity: glowOpacity,
                  borderColor: colors.neonBlue,
               },
            ]}
         >
            <LinearGradient
               colors={getCyberpunkGradient('neon')}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={cyberpunkStyles.addButtonGradient}
            >
               {/* Corner brackets */}
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.buttonTopLeft,
                     { borderColor: colors.neonBlue },
                  ]}
               />
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.buttonTopRight,
                     { borderColor: colors.neonCyan },
                  ]}
               />
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.buttonBottomLeft,
                     { borderColor: colors.neonCyan },
                  ]}
               />
               <View
                  style={[
                     cyberpunkStyles.cornerBracket,
                     cyberpunkStyles.buttonBottomRight,
                     { borderColor: colors.neonBlue },
                  ]}
               />

               <View style={cyberpunkStyles.addButtonContent}>
                  <Ionicons
                     name={icon as any}
                     size={24}
                     color={colors.neonCyan}
                     style={{
                        textShadowColor: colors.neonCyan,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                     }}
                  />
                  <Text variant="button" style={cyberpunkStyles.addButtonText}>
                     {title}
                  </Text>
               </View>
            </LinearGradient>
         </Animated.View>
      </Pressable>
   );
});

CyberpunkAddButton.displayName = 'CyberpunkAddButton';

// Cyberpunk Start Game Button with holographic glow
const CyberpunkStartGameButton = React.memo<{
   title: string;
   onPress: () => void;
   totalSelectedCount: number;
}>(({ title, onPress, totalSelectedCount }) => {
   const startButtonGlowAnim = useRef(new Animated.Value(0)).current;
   const pulseAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      const glowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(startButtonGlowAnim, {
               toValue: 1,
               duration: 1500,
               useNativeDriver: false,
            }),
            Animated.timing(startButtonGlowAnim, {
               toValue: 0.5,
               duration: 1500,
               useNativeDriver: false,
            }),
         ])
      );

      const pulseAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(pulseAnim, {
               toValue: 1.05,
               duration: 1000,
               useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
               toValue: 1,
               duration: 1000,
               useNativeDriver: true,
            }),
         ])
      );

      glowAnimation.start();
      pulseAnimation.start();

      return () => {
         glowAnimation.stop();
         pulseAnimation.stop();
      };
   }, [startButtonGlowAnim, pulseAnim]);

   const glowOpacity = startButtonGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
   });

   return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
         <Pressable
            onPress={onPress}
            style={cyberpunkStyles.startGameButton}
            accessibilityRole="button"
            accessibilityLabel={`${title} with ${totalSelectedCount} players`}
         >
            <Animated.View
               style={[
                  cyberpunkStyles.startGameContainer,
                  {
                     shadowColor: colors.matrixGreen,
                     shadowOpacity: glowOpacity,
                     borderColor: colors.matrixGreen,
                  },
               ]}
            >
               <LinearGradient
                  colors={getCyberpunkGradient('matrix')}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={cyberpunkStyles.startGameGradient}
               >
                  {/* Corner brackets */}
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.buttonTopLeft,
                        { borderColor: colors.matrixGreen },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.buttonTopRight,
                        { borderColor: colors.neonCyan },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.buttonBottomLeft,
                        { borderColor: colors.neonCyan },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.buttonBottomRight,
                        { borderColor: colors.matrixGreen },
                     ]}
                  />

                  {/* Holographic overlay */}
                  <LinearGradient
                     colors={[
                        colors.matrixGreenGlow,
                        'transparent',
                        colors.holoGreen,
                     ]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={cyberpunkStyles.startGameHoloOverlay}
                  />

                  {/* Scan lines */}
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Animated.View
                        key={i}
                        style={[
                           cyberpunkStyles.scanLine,
                           {
                              top: 15 + i * 15,
                              backgroundColor: colors.matrixGreen,
                              opacity: glowOpacity.interpolate({
                                 inputRange: [0.5, 1],
                                 outputRange: [0.1, 0.2],
                              }),
                           },
                        ]}
                     />
                  ))}

                  <View style={cyberpunkStyles.startGameContent}>
                     <Ionicons
                        name="play-circle"
                        size={28}
                        color={colors.matrixGreen}
                        style={{
                           textShadowColor: colors.matrixGreen,
                           textShadowOffset: { width: 0, height: 0 },
                           textShadowRadius: 12,
                        }}
                     />
                     <Text
                        variant="button"
                        style={cyberpunkStyles.startGameText}
                     >
                        {title}
                     </Text>
                  </View>
               </LinearGradient>
            </Animated.View>
         </Pressable>
      </Animated.View>
   );
});

CyberpunkStartGameButton.displayName = 'CyberpunkStartGameButton';

// Cyberpunk Error State Component
const CyberpunkErrorState = React.memo<{
   error: string;
   onBack: () => void;
   onRetry: () => void;
   t: any;
}>(({ error, onBack, onRetry, t }) => {
   const errorGlowAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const errorGlowAnimation = Animated.loop(
         Animated.sequence([
            Animated.timing(errorGlowAnim, {
               toValue: 1,
               duration: 1500,
               useNativeDriver: false,
            }),
            Animated.timing(errorGlowAnim, {
               toValue: 0.3,
               duration: 1500,
               useNativeDriver: false,
            }),
         ])
      );
      errorGlowAnimation.start();
      return () => errorGlowAnimation.stop();
   }, [errorGlowAnim]);

   return (
      <LinearGradient colors={getCyberpunkGradient('dark')} style={{ flex: 1 }}>
         <CyberpunkHeader
            title={t('selectPlayers')}
            onBack={onBack}
            backButtonLabel={t('goBack')}
            backButtonHint={t('navigateBackToPreviousScreen')}
         />

         <View className="flex-1 justify-center items-center px-8">
            <View style={cyberpunkStyles.errorCard}>
               <LinearGradient
                  colors={[
                     colors.cyberBackground,
                     colors.errorDark,
                     'transparent',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={cyberpunkStyles.errorCardGradient}
               >
                  {/* Corner brackets with error red color */}
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardTopLeft,
                        { borderColor: colors.neonPink },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardTopRight,
                        { borderColor: colors.error },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardBottomLeft,
                        { borderColor: colors.error },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardBottomRight,
                        { borderColor: colors.neonPink },
                     ]}
                  />

                  {/* Error holographic overlay */}
                  <LinearGradient
                     colors={[colors.error, 'transparent', colors.neonPink]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={[cyberpunkStyles.cardHoloOverlay, { opacity: 0.2 }]}
                  />

                  {/* Scan lines with error color */}
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Animated.View
                        key={i}
                        style={[
                           cyberpunkStyles.scanLine,
                           {
                              top: 20 + i * 15,
                              backgroundColor: colors.error,
                              opacity: errorGlowAnim.interpolate({
                                 inputRange: [0.3, 1],
                                 outputRange: [0.03, 0.1],
                              }),
                           },
                        ]}
                     />
                  ))}

                  <View className="items-center">
                     {/* Cyberpunk error icon with glow */}
                     <Animated.View
                        style={[
                           cyberpunkStyles.errorIconContainer,
                           {
                              shadowColor: colors.neonPink,
                              shadowOpacity: errorGlowAnim.interpolate({
                                 inputRange: [0.3, 1],
                                 outputRange: [0.3, 0.7],
                              }),
                           },
                        ]}
                     >
                        <Ionicons
                           name="warning-outline"
                           size={48}
                           color={colors.neonPink}
                           style={{
                              textShadowColor: colors.neonPink,
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 8,
                           }}
                        />
                     </Animated.View>

                     <Text variant="h3" style={cyberpunkStyles.errorTitle}>
                        {t('errorLoadingPlayers')}
                     </Text>
                     <Text variant="body" style={cyberpunkStyles.errorMessage}>
                        {error}
                     </Text>

                     {/* Cyberpunk retry button */}
                     <Pressable
                        onPress={onRetry}
                        style={cyberpunkStyles.retryButton}
                        accessibilityLabel={t('tryAgain')}
                        accessibilityRole="button"
                     >
                        <LinearGradient
                           colors={[colors.errorDark, colors.neonPink]}
                           style={cyberpunkStyles.retryButtonGradient}
                        >
                           <Text
                              variant="button"
                              style={cyberpunkStyles.retryButtonText}
                           >
                              {t('tryAgain')}
                           </Text>
                        </LinearGradient>
                     </Pressable>
                  </View>
               </LinearGradient>
            </View>
         </View>
      </LinearGradient>
   );
});

CyberpunkErrorState.displayName = 'CyberpunkErrorState';

export default function SelectPlayers() {
   const { t } = useLocalization();
   const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
   const { track, trackScreenView } = useMixpanel();
   const [showAnonymousModal, setShowAnonymousModal] = React.useState(false);

   // Custom hooks for clean separation of concerns
   const { league, isLoading, error, refetch } = useLeagueMembers(leagueId!);
   const {
      selectedPlayerIds,
      selectedCount,
      togglePlayerSelection,
      clearSelection,
      anonymousPlayers,
      addAnonymousPlayer,
      removeAnonymousPlayer,
      totalSelectedCount,
   } = usePlayerSelection(leagueId!);

   const {
      showGameSetup,
      buyIn,
      isCreatingGame,
      availableBuyIns,
      setBuyIn,
      handleStartGame,
      handleCreateGame,
      handleCancelGameSetup,
   } = useGameCreation({
      leagueId: leagueId!,
      selectedPlayerIds,
      selectedCount: totalSelectedCount,
      anonymousPlayers,
   });

   const handleBack = () => {
      if (totalSelectedCount > 0) {
         clearSelection();
      }
      router.back();
   };

   const selectedPlayers = React.useMemo(() => {
      return (
         league?.members.filter((member) =>
            selectedPlayerIds.includes(member.id)
         ) || []
      );
   }, [league?.members, selectedPlayerIds]);

   // Track screen view
   React.useEffect(() => {
      trackScreenView('Select Players', {
         league_id: leagueId,
         available_players: league?.members?.length || 0,
      });
   }, [league, leagueId, trackScreenView]);

   // Track player selection changes
   React.useEffect(() => {
      if (totalSelectedCount > 0) {
         track('players_selected', {
            league_id: leagueId,
            selected_count: totalSelectedCount,
            regular_count: selectedCount,
            anonymous_count: anonymousPlayers.length,
            player_ids: selectedPlayerIds,
         });
      }
   }, [
      totalSelectedCount,
      selectedCount,
      anonymousPlayers.length,
      selectedPlayerIds,
      leagueId,
      track,
   ]);

   // Cyberpunk loading state with matrix effects and neon colors
   if (isLoading) {
      return (
         <LinearGradient
            colors={getCyberpunkGradient('dark')}
            style={{ flex: 1 }}
         >
            <CyberpunkHeader
               title={t('selectPlayers')}
               onBack={handleBack}
               backButtonLabel={t('goBack')}
               backButtonHint={t('navigateBackToPreviousScreen')}
            />

            {/* Cyberpunk Loading Animation */}
            <View className="flex-1 justify-center items-center px-8">
               <View style={cyberpunkStyles.loadingCard}>
                  <LinearGradient
                     colors={getCyberpunkGradient('holo')}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={cyberpunkStyles.loadingCardGradient}
                  >
                     {/* Corner brackets */}
                     <View
                        style={[
                           cyberpunkStyles.cornerBracket,
                           cyberpunkStyles.cardTopLeft,
                           { borderColor: colors.matrixGreen },
                        ]}
                     />
                     <View
                        style={[
                           cyberpunkStyles.cornerBracket,
                           cyberpunkStyles.cardTopRight,
                           { borderColor: colors.neonCyan },
                        ]}
                     />
                     <View
                        style={[
                           cyberpunkStyles.cornerBracket,
                           cyberpunkStyles.cardBottomLeft,
                           { borderColor: colors.neonPink },
                        ]}
                     />
                     <View
                        style={[
                           cyberpunkStyles.cornerBracket,
                           cyberpunkStyles.cardBottomRight,
                           { borderColor: colors.matrixGreen },
                        ]}
                     />

                     {/* Holographic overlay */}
                     <LinearGradient
                        colors={[
                           colors.holoBlue,
                           'transparent',
                           colors.holoPink,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={cyberpunkStyles.cardHoloOverlay}
                     />

                     <CyberpunkLoader
                        size="large"
                        variant="matrix"
                        text={t('loadingPlayers')}
                     />
                  </LinearGradient>
               </View>
            </View>
         </LinearGradient>
      );
   }

   // Cyberpunk error state with neon red effects and matrix styling
   if (error) {
      return (
         <CyberpunkErrorState
            error={error}
            onBack={handleBack}
            onRetry={refetch}
            t={t}
         />
      );
   }

   return (
      <LinearGradient colors={getCyberpunkGradient('dark')} style={{ flex: 1 }}>
         {/* Cyberpunk Header with corner brackets and neon effects */}
         <CyberpunkHeader
            title={t('selectPlayers')}
            onBack={handleBack}
            backButtonLabel={t('goBack')}
            backButtonHint={t('navigateBackToPreviousScreen')}
         />

         {/* Cyberpunk League Info Card with holographic overlays */}
         {league && (
            <View style={cyberpunkStyles.leagueInfoCard}>
               <LinearGradient
                  colors={getCyberpunkGradient('holo')}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={cyberpunkStyles.leagueInfoGradient}
               >
                  {/* Corner brackets */}
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardTopLeft,
                        { borderColor: colors.matrixGreen },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardTopRight,
                        { borderColor: colors.neonCyan },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardBottomLeft,
                        { borderColor: colors.neonPink },
                     ]}
                  />
                  <View
                     style={[
                        cyberpunkStyles.cornerBracket,
                        cyberpunkStyles.cardBottomRight,
                        { borderColor: colors.matrixGreen },
                     ]}
                  />

                  {/* Holographic overlay */}
                  <LinearGradient
                     colors={[colors.holoBlue, 'transparent', colors.holoPink]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={cyberpunkStyles.cardHoloOverlay}
                  />

                  <View
                     accessibilityRole="text"
                     accessibilityLabel={`${league.name}. ${t('selectPlayersToStartGame')}`}
                  >
                     <Text
                        variant="body"
                        style={cyberpunkStyles.leagueDescription}
                     >
                        {t('selectPlayersToStartGame')}
                     </Text>
                  </View>
               </LinearGradient>
            </View>
         )}

         {/* Cyberpunk Selection Summary with neon glow effects */}
         {totalSelectedCount > 0 && (
            <CyberpunkSelectionSummary
               totalSelectedCount={totalSelectedCount}
               t={t}
            />
         )}

         {/* Player Grid */}
         <PlayerGrid
            members={league?.members || []}
            selectedPlayerIds={selectedPlayerIds}
            onPlayerToggle={togglePlayerSelection}
            variant="grid"
            numColumns={3}
            loading={isLoading}
            error={error}
            theme="dark"
         />

         {/* Cyberpunk Anonymous Players List */}
         {anonymousPlayers.length > 0 && (
            <View style={cyberpunkStyles.anonymousPlayersSection}>
               <Text variant="h4" style={cyberpunkStyles.anonymousSectionTitle}>
                  {t('anonymousPlayersSection')} ({anonymousPlayers.length})
               </Text>
               <View className="flex-row flex-wrap gap-2">
                  {anonymousPlayers.map((player, index) => (
                     <CyberpunkAnonymousPlayerTag
                        key={`anon-${index}`}
                        player={player}
                        onRemove={() => removeAnonymousPlayer(index)}
                     />
                  ))}
               </View>
            </View>
         )}

         {/* Cyberpunk Add Anonymous Button */}
         <View style={cyberpunkStyles.addButtonSection}>
            <CyberpunkAddButton
               title={t('addAnonymousPlayer')}
               onPress={() => setShowAnonymousModal(true)}
               icon="person-add-outline"
            />
         </View>

         {/* Cyberpunk Start Game Button */}
         {totalSelectedCount > 0 && (
            <View style={cyberpunkStyles.startGameSection}>
               <CyberpunkStartGameButton
                  title={t('startGame')}
                  onPress={handleStartGame}
                  totalSelectedCount={totalSelectedCount}
               />
            </View>
         )}

         {/* Game Setup Modal */}
         <GameSetupModal
            visible={showGameSetup}
            selectedPlayers={selectedPlayers}
            anonymousPlayers={anonymousPlayers}
            buyIn={buyIn}
            isCreatingGame={isCreatingGame}
            availableBuyIns={availableBuyIns}
            onClose={handleCancelGameSetup}
            onCreateGame={handleCreateGame}
            onBuyInChange={setBuyIn}
            leagueName={league?.name}
            theme="dark"
         />

         {/* Anonymous Player Modal */}
         <AnonymousPlayerModal
            visible={showAnonymousModal}
            onClose={() => setShowAnonymousModal(false)}
            onAdd={addAnonymousPlayer}
            theme="dark"
         />
      </LinearGradient>
   );
}

// Comprehensive Cyberpunk StyleSheet with neon colors and futuristic effects
const cyberpunkStyles = StyleSheet.create({
   // Header Styles
   header: {
      height: 100,
      position: 'relative',
   } as ViewStyle,
   headerGradient: {
      flex: 1,
      borderBottomWidth: 2,
      borderBottomColor: colors.neonCyan,
      position: 'relative',
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
   backButton: {
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
   title: {
      color: colors.neonCyan,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
   } as TextStyle,
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

   // Corner Brackets
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

   // Card Corner Brackets (smaller)
   cardTopLeft: {
      top: 4,
      left: 4,
      width: 12,
      height: 12,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   cardTopRight: {
      top: 4,
      right: 4,
      width: 12,
      height: 12,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   cardBottomLeft: {
      bottom: 4,
      left: 4,
      width: 12,
      height: 12,
      borderRightWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   cardBottomRight: {
      bottom: 4,
      right: 4,
      width: 12,
      height: 12,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,

   // Button Corner Brackets (even smaller)
   buttonTopLeft: {
      top: 2,
      left: 2,
      width: 8,
      height: 8,
      borderWidth: 2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   buttonTopRight: {
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderWidth: 2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
   } as ViewStyle,
   buttonBottomLeft: {
      bottom: 2,
      left: 2,
      width: 8,
      height: 8,
      borderWidth: 2,
      borderRightWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,
   buttonBottomRight: {
      bottom: 2,
      right: 2,
      width: 8,
      height: 8,
      borderWidth: 2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
   } as ViewStyle,

   // Holographic Overlay
   holoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.15,
   } as ViewStyle,
   cardHoloOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
   } as ViewStyle,

   // Scan Lines
   scanLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.scanlineCyan,
   } as ViewStyle,
   miniScanLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 5,
      height: 1,
   } as ViewStyle,

   // Loading Card
   loadingCard: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   loadingCardGradient: {
      padding: 32,
      alignItems: 'center',
      borderRadius: 18,
      position: 'relative',
   } as ViewStyle,

   // Error Card
   errorCard: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.error,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   errorCardGradient: {
      padding: 32,
      borderRadius: 18,
      position: 'relative',
   } as ViewStyle,
   errorIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: colors.neonPink,
      backgroundColor: colors.holoPink,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 12,
      elevation: 8,
   } as ViewStyle,
   errorTitle: {
      color: colors.neonPink,
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: 16,
      textShadowColor: colors.neonPink,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   } as TextStyle,
   errorMessage: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
   } as TextStyle,
   retryButton: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.neonPink,
      shadowColor: colors.neonPink,
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
   } as TextStyle,

   // League Info Card
   leagueInfoCard: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      shadowColor: colors.neonCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   leagueInfoGradient: {
      padding: 20,
      borderRadius: 14,
      position: 'relative',
   } as ViewStyle,
   leagueName: {
      color: colors.neonCyan,
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1,
      textTransform: 'uppercase',
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      marginBottom: 8,
   } as TextStyle,
   leagueDescription: {
      color: colors.textMuted,
      fontSize: 14,
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      lineHeight: 20,
   } as TextStyle,

   // Selection Summary
   selectionSummaryCard: {
      marginHorizontal: 20,
      marginBottom: 16,
   } as ViewStyle,
   selectionSummaryContainer: {
      borderRadius: 16,
      borderWidth: 2,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   selectionSummaryGradient: {
      padding: 16,
      borderRadius: 14,
      position: 'relative',
   } as ViewStyle,
   selectionSummaryText: {
      color: colors.matrixGreen,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1,
      textAlign: 'center',
      textTransform: 'uppercase',
      textShadowColor: colors.matrixGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   } as TextStyle,

   // Anonymous Players Section
   anonymousPlayersSection: {
      marginHorizontal: 20,
      marginTop: 16,
   } as ViewStyle,
   anonymousSectionTitle: {
      color: colors.neonOrange,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 12,
      textShadowColor: colors.neonOrange,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 4,
   } as TextStyle,
   anonymousPlayerTag: {
      marginRight: 8,
      marginBottom: 8,
   } as ViewStyle,
   anonymousTagContainer: {
      borderRadius: 20,
      borderWidth: 1,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 8,
      elevation: 6,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   anonymousTagGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      position: 'relative',
   } as ViewStyle,
   anonymousAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 6,
   },
   anonymousPlayerName: {
      color: colors.neonOrange,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 0.5,
      marginRight: 8,
      textShadowColor: colors.neonOrange,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 2,
   } as TextStyle,

   // Add Button
   addButtonSection: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 120,
   } as ViewStyle,
   addButton: {
      width: '100%',
   } as ViewStyle,
   addButtonContainer: {
      borderRadius: 16,
      borderWidth: 2,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   addButtonGradient: {
      padding: 16,
      borderRadius: 14,
      position: 'relative',
   } as ViewStyle,
   addButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
   } as ViewStyle,
   addButtonText: {
      color: colors.neonCyan,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1,
      marginLeft: 12,
      textTransform: 'uppercase',
      textShadowColor: colors.neonCyan,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
   } as TextStyle,

   // Start Game Button
   startGameSection: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 24,
      paddingBottom: 40,
   } as ViewStyle,
   startGameButton: {
      width: '100%',
   } as ViewStyle,
   startGameContainer: {
      borderRadius: 20,
      borderWidth: 3,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
      elevation: 15,
      overflow: 'hidden',
      position: 'relative',
   } as ViewStyle,
   startGameGradient: {
      padding: 20,
      borderRadius: 17,
      position: 'relative',
   } as ViewStyle,
   startGameHoloOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
   } as ViewStyle,
   startGameContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
   } as ViewStyle,
   startGameText: {
      color: colors.background,
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
      marginLeft: 16,
      textTransform: 'uppercase',
      textShadowColor: colors.matrixGreen,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
   } as TextStyle,
});
