/**
 * Enhanced Screen Header with Breadcrumbs and Visual Context
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { BreadcrumbItem, BrutalistBreadcrumbs } from './BrutalistBreadcrumbs';
import { useNavigation } from '@/context/navigation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
   View,
   TouchableOpacity,
   SafeAreaView,
   I18nManager,
} from 'react-native';

interface ScreenHeaderProps {
   title?: string;
   subtitle?: string;
   showBack?: boolean;
   showBreadcrumbs?: boolean;
   onBack?: () => void;
   rightComponent?: React.ReactNode;
   backgroundColor?: string;
   variant?: 'default' | 'minimal' | 'hero';
}

export function ScreenHeader({
   title,
   subtitle,
   showBack = false,
   showBreadcrumbs = true,
   onBack,
   rightComponent,
   backgroundColor,
   variant = 'default',
}: ScreenHeaderProps) {
   const theme = getTheme('light');
   const { breadcrumbs, stackDepth } = useNavigation();

   const handleBack = () => {
      if (onBack) {
         onBack();
      } else {
         router.back();
      }
   };

   const handleHomePress = () => {
      router.push('/(tabs)/my-leagues');
   };

   const getHeaderHeight = () => {
      switch (variant) {
         case 'minimal': return 60;
         case 'hero': return 120;
         default: return 80;
      }
   };

   const getHeaderStyle = () => {
      const baseStyle = {
         backgroundColor: backgroundColor || theme.surface,
         borderBottomWidth: variant === 'minimal' ? 2 : 6,
         borderBottomColor: theme.border,
         shadowColor: theme.shadow,
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 1,
         shadowRadius: 0,
         elevation: 8,
      };

      if (variant === 'hero') {
         return {
            ...baseStyle,
            backgroundColor: theme.primary,
            borderBottomColor: theme.accent,
         };
      }

      return baseStyle;
   };

   const getTitleColor = () => {
      return variant === 'hero' ? colors.textInverse : theme.text;
   };

   const getSubtitleColor = () => {
      return variant === 'hero' ? 'rgba(255,255,255,0.8)' : theme.textSecondary;
   };

   return (
      <>
         <SafeAreaView style={{ backgroundColor: backgroundColor || theme.surface }} />

         <View style={getHeaderStyle()}>
            {/* Main header content */}
            <View
               className="flex-row items-center justify-between px-4"
               style={{ minHeight: getHeaderHeight() }}
            >
               {/* Left side - Back button and title */}
               <View className="flex-row items-center flex-1">
                  {showBack && (
                     <TouchableOpacity
                        onPress={handleBack}
                        className="mr-4 p-2 -ml-2 rounded-lg border-2"
                        style={{
                           borderColor: variant === 'hero' ? colors.textInverse : theme.border,
                           backgroundColor: variant === 'hero' ? 'rgba(255,255,255,0.1)' : theme.background,
                        }}
                        activeOpacity={0.7}
                     >
                        <Ionicons
                           name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                           size={20}
                           color={variant === 'hero' ? colors.textInverse : theme.text}
                        />
                     </TouchableOpacity>
                  )}

                  <View className="flex-1">
                     {title && (
                        <Text
                           variant={variant === 'hero' ? 'h2' : 'h3'}
                           className="font-bold uppercase tracking-wide"
                           style={{ color: getTitleColor() }}
                           numberOfLines={1}
                        >
                           {title}
                        </Text>
                     )}

                     {subtitle && (
                        <Text
                           variant="caption"
                           className="mt-1 uppercase tracking-wider opacity-75"
                           style={{ color: getSubtitleColor() }}
                           numberOfLines={1}
                        >
                           {subtitle}
                        </Text>
                     )}
                  </View>
               </View>

               {/* Right component */}
               {rightComponent && (
                  <View className="ml-4">
                     {rightComponent}
                  </View>
               )}
            </View>

            {/* Hero variant decorative elements */}
            {variant === 'hero' && (
               <View className="absolute bottom-0 left-0 right-0">
                  <View className="flex-row justify-between">
                     <View
                        className="w-8 h-2"
                        style={{ backgroundColor: theme.accent }}
                     />
                     <View
                        className="w-12 h-2"
                        style={{ backgroundColor: theme.secondary }}
                     />
                     <View
                        className="w-6 h-2"
                        style={{ backgroundColor: theme.accent }}
                     />
                  </View>
               </View>
            )}
         </View>

         {/* Breadcrumbs */}
         {showBreadcrumbs && breadcrumbs.length > 0 && (
            <BrutalistBreadcrumbs
               items={breadcrumbs}
               showHome={true}
               showStackIndicator={true}
               stackDepth={stackDepth}
               onHomePress={handleHomePress}
               variant={variant === 'minimal' ? 'compact' : 'default'}
            />
         )}
      </>
   );
}

// Convenience hook for setting up screen headers with breadcrumbs
export function useScreenHeader(
   title: string,
   breadcrumbItems?: BreadcrumbItem[]
) {
   const { setBreadcrumbs } = useNavigation();

   React.useEffect(() => {
      if (breadcrumbItems) {
         // Add the current screen as the last breadcrumb
         const allItems = [
            ...breadcrumbItems,
            {
               id: 'current',
               label: title,
               isActive: true,
            },
         ];
         setBreadcrumbs(allItems);
      } else {
         setBreadcrumbs([]);
      }
   }, [title, breadcrumbItems, setBreadcrumbs]);
}