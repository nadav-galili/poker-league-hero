/**
 * Neo-Brutalist Breadcrumbs Navigation Component
 * Provides visual context showing navigation depth and current location
 */

import { getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
   Animated,
   Easing,
   I18nManager,
   ScrollView,
   TouchableOpacity,
   View,
} from 'react-native';

export interface BreadcrumbItem {
   id: string;
   label: string;
   icon?: keyof typeof Ionicons.glyphMap;
   onPress?: () => void;
   isActive?: boolean;
}

interface BrutalistBreadcrumbsProps {
   items: BreadcrumbItem[];
   showHome?: boolean;
   showStackIndicator?: boolean;
   stackDepth?: number;
   maxVisibleItems?: number;
   variant?: 'default' | 'compact' | 'minimal';
   onHomePress?: () => void;
}

export function BrutalistBreadcrumbs({
   items = [],
   showHome = true,
   showStackIndicator = true,
   stackDepth = 0,
   maxVisibleItems = 4,
   variant = 'default',
   onHomePress,
}: BrutalistBreadcrumbsProps) {
   const theme = getTheme('light');
   const slideAnim = useRef(new Animated.Value(0)).current;
   const stackAnim = useRef(new Animated.Value(0)).current;
   const bounceAnim = useRef(new Animated.Value(1)).current;

   // Slide-in animation when component mounts or items change
   useEffect(() => {
      const slideAnimation = Animated.timing(slideAnim, {
         toValue: 1,
         duration: 400,
         easing: Easing.out(Easing.cubic),
         useNativeDriver: true,
      });

      slideAnimation.start();

      // Cleanup animation on unmount
      return () => {
         slideAnimation.stop();
         slideAnim.stopAnimation();
      };
   }, [items, slideAnim]);

   // Stack depth animation
   useEffect(() => {
      const stackAnimation = Animated.timing(stackAnim, {
         toValue: stackDepth,
         duration: 300,
         easing: Easing.out(Easing.back(1.5)),
         useNativeDriver: false,
      });

      stackAnimation.start();

      // Cleanup animation on unmount
      return () => {
         stackAnimation.stop();
         stackAnim.stopAnimation();
      };
   }, [stackDepth, stackAnim]);

   // Bounce animation when new item is added
   useEffect(() => {
      let bounceAnimation: Animated.CompositeAnimation | null = null;

      if (items.length > 0) {
         bounceAnimation = Animated.sequence([
            Animated.timing(bounceAnim, {
               toValue: 1.1,
               duration: 150,
               easing: Easing.out(Easing.quad),
               useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
               toValue: 1,
               duration: 150,
               easing: Easing.elastic(2),
               useNativeDriver: true,
            }),
         ]);

         bounceAnimation.start();
      }

      // Cleanup animation on unmount or when items change
      return () => {
         if (bounceAnimation) {
            bounceAnimation.stop();
         }
         bounceAnim.stopAnimation();
      };
   }, [items.length, bounceAnim]);

   const getItemHeight = () => {
      switch (variant) {
         case 'compact':
            return 32;
         case 'minimal':
            return 24;
         default:
            return 40;
      }
   };

   const getItemPadding = () => {
      switch (variant) {
         case 'compact':
            return 8;
         case 'minimal':
            return 6;
         default:
            return 12;
      }
   };

   const getFontVariant = () => {
      switch (variant) {
         case 'compact':
            return 'captionSmall';
         case 'minimal':
            return 'captionSmall';
         default:
            return 'caption';
      }
   };

   const getIconSize = () => {
      switch (variant) {
         case 'compact':
            return 14;
         case 'minimal':
            return 12;
         default:
            return 16;
      }
   };

   // Memoize expensive computations to prevent unnecessary re-renders
   const getVisibleItems = useCallback(() => {
      if (items.length <= maxVisibleItems) {
         return items;
      }

      const truncatedItems = [];

      // Always show first item if it exists
      if (items.length > 0) {
         truncatedItems.push(items[0]);
      }

      // Add ellipsis if there are hidden items
      if (items.length > maxVisibleItems) {
         truncatedItems.push({
            id: 'ellipsis',
            label: '...',
            onPress: undefined,
         });
      }

      // Add last few items
      const lastItems = items.slice(-(maxVisibleItems - 2));
      truncatedItems.push(...lastItems);

      return truncatedItems;
   }, [items, maxVisibleItems]);

   const visibleItems = useMemo(() => getVisibleItems(), [getVisibleItems]);

   // Memoize stack indicator to prevent unnecessary re-renders
   const renderStackIndicator = useMemo(() => {
      if (!showStackIndicator || stackDepth === 0) return null;

      const stackOffset = stackAnim.interpolate({
         inputRange: [0, 5],
         outputRange: [0, 20],
         extrapolate: 'clamp',
      });

      return (
         <Animated.View
            className="flex-row items-center mr-3"
            style={{
               transform: [{ translateX: stackOffset }],
            }}
         >
            <View className="flex-row items-center">
               {Array.from({ length: Math.min(stackDepth, 3) }).map(
                  (_, index) => (
                     <View
                        key={index}
                        className="w-2 h-6 rounded-sm mr-1"
                        style={{
                           backgroundColor: theme.accent,
                           opacity: 0.6 + index * 0.2,
                           transform: [
                              { translateX: -index * 2 },
                              { rotate: `${index * 2}deg` },
                           ],
                        }}
                     />
                  )
               )}
               {stackDepth > 3 && (
                  <Text
                     variant="captionSmall"
                     className="ml-1 font-bold"
                     style={{ color: theme.accent }}
                  >
                     +{stackDepth - 3}
                  </Text>
               )}
            </View>
         </Animated.View>
      );
   }, [showStackIndicator, stackDepth, stackAnim, theme.accent]);

   // Memoize home button to prevent unnecessary re-renders
   const renderHomeButton = useMemo(() => {
      if (!showHome) return null;

      return (
         <>
            <TouchableOpacity
               onPress={onHomePress}
               activeOpacity={0.7}
               style={{
                  height: getItemHeight(),
                  paddingHorizontal: getItemPadding(),
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 4,
               }}
            >
               <Ionicons
                  name="home"
                  size={getIconSize()}
                  color={theme.primary}
               />
            </TouchableOpacity>

            {visibleItems.length > 0 && (
               <View className="mx-2">
                  <Ionicons
                     name={
                        I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'
                     }
                     size={getIconSize()}
                     color={theme.textMuted}
                  />
               </View>
            )}
         </>
      );
   }, [
      showHome,
      onHomePress,
      getItemHeight,
      getItemPadding,
      theme,
      getIconSize,
      visibleItems.length,
      I18nManager.isRTL,
   ]);

   // Memoize breadcrumb item renderer for better performance
   const renderBreadcrumbItem = useCallback(
      (item: BreadcrumbItem, index: number) => {
         const isLast = index === visibleItems.length - 1;
         const isActive = item.isActive || isLast;

         return (
            <Animated.View
               key={item.id}
               className="flex-row items-center"
               style={{
                  transform: [
                     {
                        translateY: slideAnim.interpolate({
                           inputRange: [0, 1],
                           outputRange: [20, 0],
                        }),
                     },
                     {
                        scale: isLast ? bounceAnim : 1,
                     },
                  ],
                  opacity: slideAnim,
               }}
            >
               <TouchableOpacity
                  onPress={item.onPress}
                  disabled={!item.onPress || isActive}
                  activeOpacity={0.7}
                  style={{
                     height: getItemHeight(),
                     paddingHorizontal: getItemPadding(),
                     borderRadius: 8,
                     borderWidth: 2,
                     borderColor: isActive ? theme.primary : theme.border,
                     backgroundColor: isActive
                        ? theme.primary
                        : theme.primaryLight,
                     flexDirection: 'row',
                     alignItems: 'center',
                     shadowColor: theme.shadow,
                     shadowOffset: { width: 2, height: 2 },
                     shadowOpacity: isActive ? 0.8 : 0.5,
                     shadowRadius: 0,
                     elevation: isActive ? 6 : 3,
                  }}
               >
                  {item.icon && (
                     <Ionicons
                        name={item.icon}
                        size={getIconSize()}
                        color={isActive ? theme.primary : theme.textSecondary}
                        style={{ marginRight: item.label ? 6 : 0 }}
                     />
                  )}

                  {item.label && (
                     <Text
                        variant={getFontVariant() as any}
                        className="font-semibold uppercase tracking-wide"
                        style={{
                           color: isActive
                              ? theme.primary
                              : theme.textSecondary,
                        }}
                        numberOfLines={1}
                     >
                        {item.label}
                     </Text>
                  )}
               </TouchableOpacity>

               {!isLast && item.id !== 'ellipsis' && (
                  <View className="mx-2">
                     <Ionicons
                        name={
                           I18nManager.isRTL
                              ? 'chevron-back'
                              : 'chevron-forward'
                        }
                        size={getIconSize()}
                        color={theme.textMuted}
                     />
                  </View>
               )}

               {item.id === 'ellipsis' && (
                  <View className="mx-2">
                     <Ionicons
                        name={
                           I18nManager.isRTL
                              ? 'chevron-back'
                              : 'chevron-forward'
                        }
                        size={getIconSize()}
                        color={theme.textMuted}
                     />
                  </View>
               )}
            </Animated.View>
         );
      },
      [
         slideAnim,
         bounceAnim,
         getItemHeight,
         getItemPadding,
         theme,
         getIconSize,
         getFontVariant,
         I18nManager.isRTL,
      ]
   );

   if (visibleItems.length === 0 && !showHome) {
      return null;
   }

   return (
      <View
         className="py-3 px-4 border-b-4"
         style={{
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
         }}
      >
         <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
               flexDirection: 'row',
               alignItems: 'center',
               paddingHorizontal: 4,
            }}
         >
            {renderStackIndicator()}
            {renderHomeButton()}

            {visibleItems.map((item, index) =>
               renderBreadcrumbItem(item, index)
            )}
         </ScrollView>
      </View>
   );
}

// Stack depth indicator for showing navigation nesting
export function NavigationStackIndicator({
   depth = 0,
   variant = 'default',
}: {
   depth: number;
   variant?: 'default' | 'minimal';
}) {
   const theme = getTheme('light');

   if (depth === 0) return null;

   return (
      <View className="flex-row items-center px-2">
         <View className="flex-row items-center">
            {Array.from({ length: Math.min(depth, 4) }).map((_, index) => (
               <View
                  key={index}
                  className={`w-1 h-4 rounded-full mr-1 ${variant === 'minimal' ? 'opacity-40' : ''}`}
                  style={{
                     backgroundColor: theme.accent,
                     transform: [{ translateX: -index }],
                  }}
               />
            ))}
            {depth > 4 && (
               <Text
                  variant="captionSmall"
                  className="ml-1 font-bold"
                  style={{ color: theme.accent }}
               >
                  +{depth - 4}
               </Text>
            )}
         </View>
      </View>
   );
}
