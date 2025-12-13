import { colors } from '@/colors';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

// Cyberpunk tab icon component with full design system
function CyberpunkTabIcon({
   iconName,
   focusedIconName,
   focused,
   color,
   label,
}: {
   iconName: React.ComponentProps<typeof Ionicons>['name'];
   focusedIconName: React.ComponentProps<typeof Ionicons>['name'];
   focused: boolean;
   color: string;
   label: string;
}) {
   const glowAnim = useRef(new Animated.Value(0)).current;
   const slideAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

   useEffect(() => {
      if (focused) {
         // Pulsing glow animation
         const glowAnimation = Animated.loop(
            Animated.sequence([
               Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 1500,
                  useNativeDriver: false,
               }),
               Animated.timing(glowAnim, {
                  toValue: 0.3,
                  duration: 1500,
                  useNativeDriver: false,
               }),
            ])
         );

         // Slide in animation for active state
         const slideAnimation = Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
         });

         glowAnimation.start();
         slideAnimation.start();

         return () => {
            glowAnimation.stop();
         };
      } else {
         Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
         }).start();
      }
   }, [focused, glowAnim, slideAnim]);

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
   });

   const activeOpacity = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
   });

   return (
      <View
         style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingHorizontal: 12,
         }}
      >
         {/* Holographic background for active state */}
         {focused && (
            <Animated.View
               style={{
                  position: 'absolute',
                  left: 6,
                  right: 6,
                  top: 6,
                  bottom: 6,
                  borderRadius: 16,
                  backgroundColor: colors.holoBlue,
                  opacity: activeOpacity.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0, 0.4],
                  }),
                  borderWidth: 1,
                  borderColor: colors.neonCyan,
               }}
            />
         )}

         {/* Corner brackets - all 4 corners for cyberpunk style */}
         {focused && (
            <>
               <Animated.View
                  style={{
                     position: 'absolute',
                     top: 4,
                     left: 4,
                     width: 10,
                     height: 10,
                     borderTopWidth: 2,
                     borderLeftWidth: 2,
                     borderColor: colors.matrixGreen,
                     opacity: activeOpacity,
                  }}
               />
               <Animated.View
                  style={{
                     position: 'absolute',
                     top: 4,
                     right: 4,
                     width: 10,
                     height: 10,
                     borderTopWidth: 2,
                     borderRightWidth: 2,
                     borderColor: colors.neonCyan,
                     opacity: activeOpacity,
                  }}
               />
               <Animated.View
                  style={{
                     position: 'absolute',
                     bottom: 4,
                     left: 4,
                     width: 10,
                     height: 10,
                     borderBottomWidth: 2,
                     borderLeftWidth: 2,
                     borderColor: colors.neonPink,
                     opacity: activeOpacity,
                  }}
               />
               <Animated.View
                  style={{
                     position: 'absolute',
                     bottom: 4,
                     right: 4,
                     width: 10,
                     height: 10,
                     borderBottomWidth: 2,
                     borderRightWidth: 2,
                     borderColor: colors.matrixGreen,
                     opacity: activeOpacity,
                  }}
               />
            </>
         )}

         {/* Content container - vertically centered */}
         <View
            style={{
               alignItems: 'center',
               justifyContent: 'center',
               gap: 4,
               zIndex: 2,
            }}
         >
            {/* Icon with glow effect */}
            <Animated.View
               style={{
                  shadowColor: focused ? colors.neonCyan : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: focused ? glowOpacity : 0,
                  shadowRadius: focused ? 12 : 0,
                  elevation: focused ? 10 : 0,
               }}
            >
               <Ionicons
                  name={focused ? focusedIconName : iconName}
                  size={22}
                  color={focused ? colors.neonCyan : colors.textMuted}
                  style={{
                     textShadowColor: focused ? colors.neonCyan : 'transparent',
                     textShadowOffset: { width: 0, height: 0 },
                     textShadowRadius: focused ? 8 : 0,
                  }}
               />
            </Animated.View>

            {/* Label with cyberpunk styling */}
            <Text
               style={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  letterSpacing: 0.5,
                  color: focused ? colors.neonCyan : colors.textMuted,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  textShadowColor: focused ? colors.neonCyan : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: focused ? 4 : 0,
                  lineHeight: 11,
               }}
               numberOfLines={2}
            >
               {label}
            </Text>
         </View>
      </View>
   );
}

export default function TabLayout() {
   const { t } = useLocalization();

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            tabBarStyle: {
               position: 'absolute',
               bottom: 20,
               left: 20,
               right: 20,
               height: 80,
               backgroundColor: 'transparent',
               borderTopWidth: 0,
               borderWidth: 0,
               elevation: 0,
               shadowOpacity: 0,
               paddingBottom: 0,
               paddingTop: 0,
            },
            tabBarBackground: () => (
               <View style={{ flex: 1, position: 'relative' }}>
                  <LinearGradient
                     colors={[
                        colors.cyberDarkBlue,
                        colors.cyberDarkPurple,
                        colors.cyberBackground,
                     ]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 1 }}
                     style={{
                        flex: 1,
                        borderRadius: 24,
                        borderWidth: 2,
                        borderColor: colors.neonCyan,
                        shadowColor: colors.neonCyan,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 16,
                        elevation: 12,
                        overflow: 'hidden',
                     }}
                  >
                     {/* Holographic overlay */}
                     <LinearGradient
                        colors={[
                           colors.holoBlue,
                           'transparent',
                           colors.holoPink,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           opacity: 0.2,
                        }}
                     />

                     {/* Scan lines effect */}
                     {Array.from({ length: 6 }).map((_, i) => (
                        <View
                           key={i}
                           style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              height: 1,
                              backgroundColor: colors.scanlineCyan,
                              top: i * 15,
                              opacity: 0.1,
                           }}
                        />
                     ))}
                  </LinearGradient>

                  {/* Corner brackets - cyberpunk style */}
                  <View
                     style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        width: 16,
                        height: 16,
                        borderTopWidth: 3,
                        borderLeftWidth: 3,
                        borderColor: colors.matrixGreen,
                     }}
                  />
                  <View
                     style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderTopWidth: 3,
                        borderRightWidth: 3,
                        borderColor: colors.neonCyan,
                     }}
                  />
                  <View
                     style={{
                        position: 'absolute',
                        bottom: -2,
                        left: -2,
                        width: 16,
                        height: 16,
                        borderBottomWidth: 3,
                        borderLeftWidth: 3,
                        borderColor: colors.neonPink,
                     }}
                  />
                  <View
                     style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderBottomWidth: 3,
                        borderRightWidth: 3,
                        borderColor: colors.matrixGreen,
                     }}
                  />
               </View>
            ),
            tabBarShowLabel: false,
            tabBarActiveTintColor: colors.neonCyan,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarItemStyle: {
               justifyContent: 'center',
               alignItems: 'center',
            },
            tabBarIconStyle: {
               width: '100%',
               height: '100%',
            },
         }}
      >
         <Tabs.Screen
            name="my-leagues"
            options={{
               title: t('myLeagues'),
               tabBarIcon: ({ color, focused, size }) => (
                  <CyberpunkTabIcon
                     iconName="trophy-outline"
                     focusedIconName="trophy"
                     focused={focused}
                     color={color}
                     label={t('myLeagues')}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="account"
            options={{
               title: t('account'),
               tabBarIcon: ({ color, focused, size }) => (
                  <CyberpunkTabIcon
                     iconName="person-outline"
                     focusedIconName="person"
                     focused={focused}
                     color={color}
                     label={t('account')}
                  />
               ),
            }}
         />
      </Tabs>
   );
}
