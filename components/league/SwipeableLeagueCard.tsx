/**
 * Enhanced Swipeable League Card with Gesture Interactions
 * Features swipe-to-delete, long-press actions, and pull-to-refresh
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { LeagueWithTheme } from '@/types/league';
import { captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import React, { useRef, useCallback, useEffect } from 'react';
import {
   Animated,
   View,
   Alert,
   Dimensions,
   I18nManager,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
   PanGestureHandler,
   LongPressGestureHandler,
   State,
   GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const DELETE_THRESHOLD = 150;

interface SwipeableLeagueCardProps {
   league: LeagueWithTheme;
   onPress: (league: LeagueWithTheme) => void;
   onShare: (league: LeagueWithTheme) => void;
   onDelete?: (league: LeagueWithTheme) => void;
   onEdit?: (league: LeagueWithTheme) => void;
   onViewStats?: (league: LeagueWithTheme) => void;
   disabled?: boolean;
}

export const SwipeableLeagueCard = ({
   league,
   onPress,
   onShare,
   onDelete,
   onEdit,
   onViewStats,
   disabled = false,
}: SwipeableLeagueCardProps) => {
   const theme = getTheme('light');
   const { t } = useLocalization();

   // Animation values
   const translateX = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(1)).current;
   const opacityAnim = useRef(new Animated.Value(1)).current;
   const deleteOpacityAnim = useRef(new Animated.Value(0)).current;
   const editOpacityAnim = useRef(new Animated.Value(0)).current;

   const panRef = useRef(null);
   const longPressRef = useRef(null);

   // Cleanup animations and gesture handlers on unmount
   useEffect(() => {
      return () => {
         // Stop all ongoing animations to prevent memory leaks
         translateX.stopAnimation();
         scaleAnim.stopAnimation();
         opacityAnim.stopAnimation();
         deleteOpacityAnim.stopAnimation();
         editOpacityAnim.stopAnimation();

         // Reset animation values
         translateX.setValue(0);
         scaleAnim.setValue(1);
         opacityAnim.setValue(1);
         deleteOpacityAnim.setValue(0);
         editOpacityAnim.setValue(0);
      };
   }, [translateX, scaleAnim, opacityAnim, deleteOpacityAnim, editOpacityAnim]);

   const resetCard = useCallback(() => {
      Animated.parallel([
         Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
         }),
         Animated.timing(deleteOpacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
         }),
         Animated.timing(editOpacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
         }),
      ]).start();
   }, [translateX, deleteOpacityAnim, editOpacityAnim]);

   const handlePanGesture = useCallback((event: any) => {
      const { translationX, velocityX, state } = event.nativeEvent;

      if (disabled) return;

      if (state === State.ACTIVE) {
         const direction = I18nManager.isRTL ? -1 : 1;
         const adjustedTranslationX = translationX * direction;

         // Limit the swipe distance
         const maxSwipe = SCREEN_WIDTH * 0.4;
         const clampedTranslation = Math.max(-maxSwipe, Math.min(maxSwipe, adjustedTranslationX));

         translateX.setValue(clampedTranslation);

         // Show/hide action buttons based on swipe distance
         const deleteThreshold = DELETE_THRESHOLD * direction;
         const editThreshold = -DELETE_THRESHOLD * direction;

         if (Math.abs(clampedTranslation) > SWIPE_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
         }

         // Update button opacity based on swipe distance
         if (clampedTranslation > SWIPE_THRESHOLD && onDelete) {
            const opacity = Math.min(1, (clampedTranslation - SWIPE_THRESHOLD) / (DELETE_THRESHOLD - SWIPE_THRESHOLD));
            deleteOpacityAnim.setValue(opacity);
         } else {
            deleteOpacityAnim.setValue(0);
         }

         if (clampedTranslation < -SWIPE_THRESHOLD && onEdit) {
            const opacity = Math.min(1, (Math.abs(clampedTranslation) - SWIPE_THRESHOLD) / (DELETE_THRESHOLD - SWIPE_THRESHOLD));
            editOpacityAnim.setValue(opacity);
         } else {
            editOpacityAnim.setValue(0);
         }

      } else if (state === State.END) {
         const direction = I18nManager.isRTL ? -1 : 1;
         const adjustedTranslationX = translationX * direction;
         const adjustedVelocityX = velocityX * direction;

         // Determine action based on swipe distance and velocity
         if (adjustedTranslationX > DELETE_THRESHOLD && adjustedVelocityX > 0 && onDelete) {
            // Swipe right to delete
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            handleDelete();
         } else if (adjustedTranslationX < -DELETE_THRESHOLD && adjustedVelocityX < 0 && onEdit) {
            // Swipe left to edit
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleEdit();
         } else {
            // Reset to original position
            resetCard();
         }
      }
   }, [disabled, translateX, deleteOpacityAnim, editOpacityAnim, onDelete, onEdit, resetCard]);

   const handleLongPress = useCallback((event: any) => {
      if (disabled || event.nativeEvent.state !== State.ACTIVE) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Show action menu
      const actions = [];

      if (onViewStats) actions.push({ text: t('viewStats'), onPress: () => onViewStats(league) });
      if (onEdit) actions.push({ text: t('editLeague'), onPress: () => onEdit(league) });
      actions.push({ text: t('shareLeague'), onPress: () => handleShare() });
      if (onDelete) actions.push({ text: t('deleteLeague'), style: 'destructive', onPress: () => handleDelete() });

      const actionTitles = actions.map(action => action.text);
      const actionHandlers = actions.map(action => action.onPress);

      Alert.alert(
         league.name,
         t('selectAction'),
         [
            ...actions.map((action, index) => ({
               text: action.text,
               style: action.style as any,
               onPress: actionHandlers[index],
            })),
            { text: t('cancel'), style: 'cancel' },
         ]
      );
   }, [disabled, league, onViewStats, onEdit, onDelete, t]);

   const handlePress = useCallback(() => {
      if (disabled) return;

      try {
         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

         Animated.sequence([
            Animated.timing(scaleAnim, {
               toValue: 0.95,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
               toValue: 1,
               duration: 100,
               useNativeDriver: true,
            }),
         ]).start();

         onPress(league);
      } catch (error) {
         captureException(error as Error, {
            function: 'SwipeableLeagueCard.onPress',
            screen: 'MyLeagues',
            leagueId: league.id,
         });
      }
   }, [disabled, league, onPress, scaleAnim]);

   const handleShare = useCallback(() => {
      try {
         onShare(league);
         resetCard();
      } catch (error) {
         captureException(error as Error, {
            function: 'SwipeableLeagueCard.onShare',
            screen: 'MyLeagues',
            leagueId: league.id,
         });
         Toast.show({
            type: 'error',
            text1: t('error'),
            text2: 'Failed to initiate share',
         });
      }
   }, [league, onShare, resetCard, t]);

   const handleDelete = useCallback(() => {
      if (!onDelete) return;

      Alert.alert(
         t('deleteLeague'),
         t('deleteLeagueConfirmation', { name: league.name }),
         [
            { text: t('cancel'), style: 'cancel', onPress: resetCard },
            {
               text: t('delete'),
               style: 'destructive',
               onPress: () => {
                  // Animate out then delete
                  Animated.parallel([
                     Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                     }),
                     Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 300,
                        useNativeDriver: true,
                     }),
                  ]).start(() => {
                     onDelete(league);
                  });
               },
            },
         ]
      );
   }, [onDelete, league, t, resetCard, opacityAnim, scaleAnim]);

   const handleEdit = useCallback(() => {
      if (!onEdit) return;

      onEdit(league);
      resetCard();
   }, [onEdit, league, resetCard]);

   return (
      <GestureHandlerRootView>
         <View className="relative">
            {/* Background Action Buttons */}
            <View className="absolute inset-0 flex-row">
               {/* Delete button (right side) */}
               {onDelete && (
                  <Animated.View
                     className="flex-1 justify-center items-start pl-8"
                     style={{
                        backgroundColor: theme.error,
                        opacity: deleteOpacityAnim,
                     }}
                  >
                     <View className="items-center">
                        <Ionicons name="trash" size={24} color={colors.textInverse} />
                        <Text
                           variant="captionSmall"
                           className="mt-1 font-bold uppercase tracking-wide"
                           style={{ color: colors.textInverse }}
                        >
                           {t('delete')}
                        </Text>
                     </View>
                  </Animated.View>
               )}

               {/* Edit button (left side) */}
               {onEdit && (
                  <Animated.View
                     className="flex-1 justify-center items-end pr-8"
                     style={{
                        backgroundColor: theme.accent,
                        opacity: editOpacityAnim,
                     }}
                  >
                     <View className="items-center">
                        <Ionicons name="create" size={24} color={theme.text} />
                        <Text
                           variant="captionSmall"
                           className="mt-1 font-bold uppercase tracking-wide"
                           style={{ color: theme.text }}
                        >
                           {t('edit')}
                        </Text>
                     </View>
                  </Animated.View>
               )}
            </View>

            {/* Main Card */}
            <PanGestureHandler
               ref={panRef}
               onGestureEvent={handlePanGesture}
               onHandlerStateChange={handlePanGesture}
               simultaneousHandlers={[longPressRef]}
               enabled={!disabled}
            >
               <Animated.View
                  style={{
                     transform: [
                        { translateX: translateX },
                        { scale: scaleAnim }
                     ],
                     opacity: opacityAnim,
                  }}
               >
                  <LongPressGestureHandler
                     ref={longPressRef}
                     onHandlerStateChange={handleLongPress}
                     minDurationMs={500}
                     simultaneousHandlers={[panRef]}
                     enabled={!disabled}
                  >
                     <Animated.View>
                        <View
                           className="flex-row items-center p-5 rounded-xl border-[6px] bg-surfaceElevated relative overflow-hidden mx-4"
                           style={{
                              borderColor: theme.primary,
                              backgroundColor: theme.surfaceElevated,
                              shadowColor: theme.shadow,
                              shadowOffset: { width: 8, height: 8 },
                              shadowOpacity: 1,
                              shadowRadius: 0,
                              elevation: 12,
                           }}
                        >
                           {/* League Image with colored frame */}
                           <View className="relative mr-5">
                              {league.image && league.image.trim() !== '' ? (
                                 <Image
                                    source={{ uri: league.image }}
                                    style={{
                                       width: 80,
                                       height: 80,
                                       borderRadius: 12,
                                       borderWidth: 6,
                                       borderColor: '#E5E7EB',
                                    }}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    priority="high" // Optimize loading for league cards
                                    placeholder={{
                                       // More efficient placeholder using minimal base64 image
                                       uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA1MC42NjY3QzQ2LjYyNzQgNTAuNjY2NyA1MiA0NS4yOTQxIDUyIDM4LjY2NjdDNTIgMzIuMDM5MiA0Ni42Mjc0IDI2LjY2NjcgNDAgMjYuNjY2N0MzMy4zNzI2IDI2LjY2NjcgMjggMzIuMDM5MiAyOCAzOC42NjY3QzI4IDQ1LjI5NDEgMzMuMzcyNiA1MC42NjY3IDQwIDUwLjY2NjdaIiBmaWxsPSIjRDFENUNCIi8+CjxwYXRoIGQ9Ik0yMCA2MEMyMCA1NS41ODE3IDIzLjU4MTcgNTIgMjggNTJINTJDNTYuNDE4MyA1MiA2MCA1NS41ODE3IDYwIDYwVjY0SDIwVjYwWiIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K'
                                    }}
                                    placeholderContentFit="cover"
                                    transition={300}
                                    // Error fallback - show default icon if image fails to load
                                    onError={() => {
                                       console.warn(`Failed to load league image: ${league.image}`);
                                    }}
                                    recyclingKey={league.id} // Optimize memory by reusing components
                                 />
                              ) : (
                                 <View
                                    className="w-20 h-20 rounded-xl border-[6px] border-border bg-primary/20 items-center justify-center"
                                    style={{
                                       // Enhanced styling for default image container
                                       shadowColor: theme.shadow,
                                       shadowOffset: { width: 2, height: 2 },
                                       shadowOpacity: 0.1,
                                       shadowRadius: 4,
                                       elevation: 2,
                                    }}
                                 >
                                    <Ionicons name="people" size={32} color={theme.primary} />
                                 </View>
                              )}
                              <View
                                 className="absolute -top-2 -left-2 -right-2 -bottom-2 border-[6px] rounded-[20px] opacity-90"
                                 style={{ borderColor: league.themeColor }}
                              />
                           </View>

                           {/* League Info */}
                           <View className="flex-1 gap-3" onTouchEnd={handlePress}>
                              <Text
                                 variant="h4"
                                 className="tracking-widest font-bold uppercase text-base text-primary underline"
                              >
                                 {league.name}
                              </Text>

                              <View className="flex-row items-center gap-3">
                                 <View
                                    className="flex-1 px-3 py-2 rounded-md border-[3px]"
                                    style={{
                                       backgroundColor: league.accentColor,
                                       borderColor: league.themeColor,
                                    }}
                                 >
                                    <Text variant="labelSmall" color={league.themeColor}>
                                       {t('leagueCode')}
                                    </Text>
                                    <Text
                                       variant="body"
                                       color={league.themeColor}
                                       className="tracking-wide"
                                    >
                                       {league.code}
                                    </Text>
                                 </View>

                                 <View
                                    className="w-10 h-10 rounded-md border-[3px] border-border items-center justify-center"
                                    style={{ backgroundColor: league.themeColor }}
                                    onTouchEnd={handleShare}
                                 >
                                    <Ionicons name="share" size={16} color="#FFFFFF" />
                                 </View>
                              </View>

                              <Text
                                 variant="captionSmall"
                                 color={theme.textMuted}
                                 className="tracking-wide uppercase"
                              >
                                 {league.memberCount} {t('members')}
                              </Text>
                           </View>
                        </View>
                     </Animated.View>
                  </LongPressGestureHandler>
               </Animated.View>
            </PanGestureHandler>
         </View>
      </GestureHandlerRootView>
   );
};