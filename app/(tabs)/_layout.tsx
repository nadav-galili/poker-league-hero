import { colors } from '@/colors';
import { useLocalization } from '@/context/localization';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';

// Custom cyberpunk tab icon component with glowing effects
function CyberpunkTabIcon({
   iconName,
   focusedIconName,
   focused,
   color,
   label,
}: {
   iconName: string;
   focusedIconName: string;
   focused: boolean;
   color: string;
   label: string;
}) {
   const glowAnim = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      if (focused) {
         // Start pulsing glow animation when active
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

         const scaleAnimation = Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
         });

         glowAnimation.start();
         scaleAnimation.start();

         return () => {
            glowAnimation.stop();
         };
      } else {
         Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
         }).start();
      }
   }, [focused, glowAnim, scaleAnim]);

   const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
   });

   const shadowRadius = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 16],
   });

   return (
      <Animated.View
         style={{
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transform: [{ scale: scaleAnim }],
            width: 140,
            height: 60,
            paddingHorizontal: 12,
         }}
      >
         {/* Holographic background for active state */}
         {focused && (
            <Animated.View
               style={{
                  position: 'absolute',
                  width: 130,
                  height: 55,
                  backgroundColor: colors.holoBlue,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.neonCyan,
                  opacity: glowOpacity,
                  top: 2.5,
                  left: 5,
               }}
            />
         )}

         {/* Corner brackets for active state */}
         {focused && (
            <>
               <View
                  style={{
                     position: 'absolute',
                     top: 0,
                     left: 2,
                     width: 8,
                     height: 8,
                     borderTopWidth: 2,
                     borderLeftWidth: 2,
                     borderColor: colors.matrixGreen,
                  }}
               />
               <View
                  style={{
                     position: 'absolute',
                     top: 0,
                     right: 2,
                     width: 8,
                     height: 8,
                     borderTopWidth: 2,
                     borderRightWidth: 2,
                     borderColor: colors.matrixGreen,
                  }}
               />
               <View
                  style={{
                     position: 'absolute',
                     bottom: 0,
                     left: 2,
                     width: 8,
                     height: 8,
                     borderBottomWidth: 2,
                     borderLeftWidth: 2,
                     borderColor: colors.matrixGreen,
                  }}
               />
               <View
                  style={{
                     position: 'absolute',
                     bottom: 0,
                     right: 2,
                     width: 8,
                     height: 8,
                     borderBottomWidth: 2,
                     borderRightWidth: 2,
                     borderColor: colors.matrixGreen,
                  }}
               />
            </>
         )}

         {/* Content Container for perfect centering */}
         <View
            style={{
               alignItems: 'center',
               justifyContent: 'center',
               flex: 1,
               width: '100%',
            }}
         >
            {/* Icon with glow effect */}
            <Animated.View
               style={{
                  shadowColor: focused ? colors.neonCyan : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: focused ? glowOpacity : 0,
                  shadowRadius: focused ? shadowRadius : 0,
                  elevation: focused ? 10 : 0,
                  marginBottom: 2,
               }}
            >
               <Ionicons
                  name={focused ? focusedIconName : iconName}
                  size={20}
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
                  fontSize: 8,
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  letterSpacing: 0.3,
                  color: focused ? colors.neonCyan : colors.textMuted,
                  textTransform: 'uppercase',
                  textShadowColor: focused ? colors.neonCyan : 'transparent',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: focused ? 4 : 0,
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: 120,
               }}
               numberOfLines={2}
               ellipsizeMode="tail"
            >
               {label}
            </Text>
         </View>
      </Animated.View>
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
            },
            tabBarBackground: () => (
               <LinearGradient
                  colors={['#000011', '#001122', '#000000']}
                  style={{
                     flex: 1,
                     borderRadius: 24,
                     overflow: 'hidden',
                     position: 'relative',
                  }}
               >
                  {/* Corner brackets for the tab bar */}
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
                        borderColor: colors.matrixGreen,
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
                        borderColor: colors.matrixGreen,
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
               </LinearGradient>
            ),
            tabBarShowLabel: false, // We're handling labels in our custom component
            tabBarActiveTintColor: colors.neonCyan,
            tabBarInactiveTintColor: colors.textMuted,
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
