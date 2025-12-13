/**
 * Neo-Brutalist Toast Notification Component
 * Enhanced visual feedback with bold styling
 */

import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, View, Dimensions, Easing, Pressable } from 'react-native';

// Toast context and hook for easy usage
import { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface BrutalistToastProps {
   visible: boolean;
   type: ToastType;
   title: string;
   message: string;
   duration?: number;
   onHide: () => void;
   onPress?: () => void;
}

export function BrutalistToast({
   visible,
   type,
   title,
   message,
   duration = 4000,
   onHide,
   onPress
}: BrutalistToastProps) {
   const theme = getTheme('light');
   const { width } = Dimensions.get('window');

   // Animation values
   const slideAnim = useRef(new Animated.Value(-200)).current;
   const scaleAnim = useRef(new Animated.Value(0.8)).current;
   const rotateAnim = useRef(new Animated.Value(0)).current;
   const pulseAnim = useRef(new Animated.Value(1)).current;

   useEffect(() => {
      if (visible) {
         // Entry animation
         Animated.parallel([
            Animated.spring(slideAnim, {
               toValue: 0,
               useNativeDriver: true,
               tension: 100,
               friction: 8,
            }),
            Animated.spring(scaleAnim, {
               toValue: 1,
               useNativeDriver: true,
               tension: 100,
               friction: 8,
            }),
         ]).start();

         // Icon rotation animation
         const iconRotation = Animated.loop(
            Animated.timing(rotateAnim, {
               toValue: 1,
               duration: 2000,
               easing: Easing.linear,
               useNativeDriver: true,
            })
         );

         // Pulse animation for urgent types
         const pulseAnimation = (type === 'error' || type === 'warning') && Animated.loop(
            Animated.sequence([
               Animated.timing(pulseAnim, {
                  toValue: 1.05,
                  duration: 600,
                  easing: Easing.inOut(Easing.sine),
                  useNativeDriver: true,
               }),
               Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 600,
                  easing: Easing.inOut(Easing.sine),
                  useNativeDriver: true,
               }),
            ])
         );

         if (type === 'success') {
            iconRotation.start();
         }
         if (pulseAnimation) {
            pulseAnimation.start();
         }

         // Auto hide
         const timer = setTimeout(() => {
            handleHide();
         }, duration);

         return () => {
            clearTimeout(timer);
            iconRotation.stop();
            if (pulseAnimation) {
               pulseAnimation.stop();
            }
         };
      } else {
         // Reset animations when not visible
         slideAnim.setValue(-200);
         scaleAnim.setValue(0.8);
         rotateAnim.setValue(0);
         pulseAnim.setValue(1);
      }
   }, [visible, type, duration]);

   const handleHide = () => {
      Animated.parallel([
         Animated.timing(slideAnim, {
            toValue: -200,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
         }),
         Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
         }),
      ]).start(() => {
         onHide();
      });
   };

   const getToastStyles = () => {
      switch (type) {
         case 'success':
            return {
               backgroundColor: theme.success,
               borderColor: theme.border,
               iconName: 'checkmark-circle' as const,
               iconColor: theme.textInverse,
            };
         case 'error':
            return {
               backgroundColor: theme.error,
               borderColor: theme.border,
               iconName: 'close-circle' as const,
               iconColor: theme.textInverse,
            };
         case 'warning':
            return {
               backgroundColor: theme.warning,
               borderColor: theme.border,
               iconName: 'warning' as const,
               iconColor: theme.text,
            };
         case 'info':
            return {
               backgroundColor: theme.info,
               borderColor: theme.border,
               iconName: 'information-circle' as const,
               iconColor: theme.textInverse,
            };
         default:
            return {
               backgroundColor: theme.primary,
               borderColor: theme.border,
               iconName: 'information-circle' as const,
               iconColor: theme.textInverse,
            };
      }
   };

   const styles = getToastStyles();
   const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
   });

   if (!visible) return null;

   return (
      <Animated.View
         className="absolute top-16 left-4 right-4 z-50"
         style={{
            transform: [
               { translateY: slideAnim },
               { scale: scaleAnim },
               { scale: pulseAnim },
            ],
         }}
      >
         <Pressable
            className="flex-row items-center p-4 border-6 rounded-2xl relative overflow-hidden"
            style={{
               backgroundColor: styles.backgroundColor,
               borderColor: styles.borderColor,
               shadowColor: colors.shadow,
               shadowOffset: { width: 8, height: 8 },
               shadowOpacity: 1,
               shadowRadius: 0,
               elevation: 20,
            }}
            onPress={onPress}
         >
            {/* Background pattern */}
            <View className="absolute inset-0 opacity-10">
               <View className="flex-row flex-wrap">
                  {Array.from({ length: 20 }).map((_, i) => (
                     <View
                        key={i}
                        className="w-4 h-4 border border-white/20 m-1"
                        style={{
                           transform: [{ rotate: `${i * 18}deg` }],
                        }}
                     />
                  ))}
               </View>
            </View>

            {/* Icon */}
            <Animated.View
               className="w-12 h-12 border-4 border-border rounded-xl items-center justify-center mr-4"
               style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: type === 'success' ? [{ rotate: rotation }] : undefined,
               }}
            >
               <Ionicons
                  name={styles.iconName}
                  size={24}
                  color={styles.iconColor}
               />
            </Animated.View>

            {/* Content */}
            <View className="flex-1">
               <Text
                  variant="h4"
                  color={type === 'warning' ? theme.text : theme.textInverse}
                  className="font-black uppercase tracking-wide mb-1"
               >
                  {title}
               </Text>
               <Text
                  variant="body"
                  color={type === 'warning' ? theme.textSecondary : 'rgba(255,255,255,0.9)'}
                  className="font-medium leading-5"
               >
                  {message}
               </Text>
            </View>

            {/* Close button */}
            <Pressable
               className="w-8 h-8 border-2 border-border items-center justify-center ml-3"
               style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
               }}
               onPress={handleHide}
            >
               <Ionicons
                  name="close"
                  size={16}
                  color={styles.iconColor}
               />
            </Pressable>

            {/* Corner accents */}
            <View
               className="absolute -top-1 -right-1 w-6 h-6 border-2 border-border"
               style={{
                  backgroundColor: theme.accent,
                  transform: [{ rotate: '45deg' }],
               }}
            />

            {/* Progress bar for duration */}
            <Animated.View
               className="absolute bottom-0 left-0 h-1"
               style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  width: slideAnim.interpolate({
                     inputRange: [-200, 0],
                     outputRange: [0, width - 32],
                  }),
               }}
            />
         </Pressable>
      </Animated.View>
   );
}

interface ToastContextType {
   showToast: (props: Omit<BrutalistToastProps, 'visible' | 'onHide'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
   const [toast, setToast] = useState<{
      visible: boolean;
      props?: Omit<BrutalistToastProps, 'visible' | 'onHide'>;
   }>({ visible: false });

   const showToast = (props: Omit<BrutalistToastProps, 'visible' | 'onHide'>) => {
      setToast({ visible: true, props });
   };

   const hideToast = () => {
      setToast({ visible: false });
   };

   return (
      <ToastContext.Provider value={{ showToast }}>
         {children}
         {toast.visible && toast.props && (
            <BrutalistToast
               {...toast.props}
               visible={toast.visible}
               onHide={hideToast}
            />
         )}
      </ToastContext.Provider>
   );
}

export function useToast() {
   const context = useContext(ToastContext);
   if (!context) {
      throw new Error('useToast must be used within ToastProvider');
   }
   return context;
}