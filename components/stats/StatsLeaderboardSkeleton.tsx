import { colors } from '@/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withRepeat,
   withSequence,
   withTiming,
} from 'react-native-reanimated';


const CyberpunkSkeletonItem = ({ style, gradientColors = [colors.neonCyan, colors.neonBlue] }: { style: any; gradientColors?: string[] }) => {
   const opacity = useSharedValue(0.2);
   const glowIntensity = useSharedValue(0.4);

   useEffect(() => {
      // Cyberpunk pulsing effect
      opacity.value = withRepeat(
         withSequence(
            withTiming(0.6, { duration: 1200 }),
            withTiming(0.2, { duration: 800 })
         ),
         -1,
         true
      );

      // Glow intensity animation
      glowIntensity.value = withRepeat(
         withSequence(
            withTiming(0.8, { duration: 1500 }),
            withTiming(0.4, { duration: 1000 })
         ),
         -1,
         true
      );
   }, [opacity, glowIntensity]);

   const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      shadowOpacity: glowIntensity.value,
   }));

   return (
      <Animated.View style={[style, animatedStyle]}>
         <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
         />
         {/* Corner brackets for cyberpunk effect */}
         <View style={[styles.skeletonBracket, styles.topLeft, { borderColor: gradientColors[0] }]} />
         <View style={[styles.skeletonBracket, styles.bottomRight, { borderColor: gradientColors[0] }]} />
      </Animated.View>
   );
};

export default function StatsLeaderboardSkeleton() {
   return (
      <View style={styles.container}>
         {/* Hero Skeleton */}
         <View style={styles.heroContainer}>
            <View style={styles.heroCard}>
               <CyberpunkSkeletonItem
                  style={styles.heroCardBg}
                  gradientColors={[colors.neonCyan, colors.neonBlue, colors.holoBlue]}
               />
               {/* Hero content placeholders */}
               <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                     <CyberpunkSkeletonItem
                        style={styles.heroBadgeBg}
                        gradientColors={[colors.neonGreen, colors.matrixGreen]}
                     />
                  </View>
                  <View style={styles.heroRow}>
                     <View style={styles.heroAvatar}>
                        <CyberpunkSkeletonItem
                           style={styles.heroAvatarBg}
                           gradientColors={[colors.neonCyan, colors.neonBlue]}
                        />
                     </View>
                     <View style={styles.heroInfo}>
                        <CyberpunkSkeletonItem
                           style={styles.heroName}
                           gradientColors={[colors.textPrimary, colors.textSecondary]}
                        />
                        <CyberpunkSkeletonItem
                           style={styles.heroValue}
                           gradientColors={[colors.neonCyan, colors.neonBlue]}
                        />
                     </View>
                  </View>
               </View>
            </View>
         </View>

         {/* List Skeletons */}
         <View style={styles.listContainer}>
            {[1, 2, 3, 4, 5].map((key, index) => (
               <View key={key} style={styles.listItem}>
                  <LinearGradient
                     colors={[colors.holoBlue, colors.cyberGray]}
                     style={styles.listItemBg}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 0 }}
                  />

                  {/* Side accent */}
                  <View style={[styles.listSideAccent, { backgroundColor: index === 0 ? colors.neonCyan : colors.textSecondary }]} />

                  <CyberpunkSkeletonItem
                     style={styles.rankBadge}
                     gradientColors={index === 0 ? [colors.neonCyan, colors.neonBlue] : [colors.textSecondary, colors.cyberGray]}
                  />
                  <CyberpunkSkeletonItem
                     style={styles.avatar}
                     gradientColors={[colors.neonCyan, colors.holoBlue]}
                  />
                  <View style={styles.textContainer}>
                     <CyberpunkSkeletonItem
                        style={styles.nameText}
                        gradientColors={[colors.textPrimary, colors.textSecondary]}
                     />
                     <CyberpunkSkeletonItem
                        style={styles.statText}
                        gradientColors={[colors.textSecondary, colors.textMuted]}
                     />
                  </View>
                  <CyberpunkSkeletonItem
                     style={styles.value}
                     gradientColors={index === 0 ? [colors.neonCyan, colors.neonBlue] : [colors.textSecondary, colors.textMuted]}
                  />
               </View>
            ))}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      paddingTop: 20,
   },
   heroContainer: {
      alignItems: 'center',
      marginBottom: 40,
      paddingHorizontal: 20,
   },
   heroCard: {
      width: '100%',
      height: 220,
      position: 'relative',
      borderWidth: 2,
      borderColor: colors.neonCyan,
      backgroundColor: colors.holoBlue,
      // Angular design
      borderRadius: 0,
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
   },
   heroCardBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
   heroContent: {
      position: 'relative',
      zIndex: 2,
      padding: 24,
      height: '100%',
   },
   heroBadge: {
      position: 'absolute',
      top: -16,
      alignSelf: 'center',
      width: 120,
      height: 32,
      zIndex: 3,
   },
   heroBadgeBg: {
      width: '100%',
      height: '100%',
      borderRadius: 0, // Angular
   },
   heroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
      gap: 24,
   },
   heroAvatar: {
      width: 72,
      height: 72,
      position: 'relative',
   },
   heroAvatarBg: {
      width: '100%',
      height: '100%',
      borderRadius: 36,
      borderWidth: 3,
      borderColor: colors.neonCyan,
   },
   heroInfo: {
      flex: 1,
   },
   heroName: {
      width: '80%',
      height: 20,
      marginBottom: 12,
      borderRadius: 0, // Angular
   },
   heroValue: {
      width: '60%',
      height: 28,
      borderRadius: 0, // Angular
   },
   listContainer: {
      paddingHorizontal: 20,
   },
   listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.borderNeonCyan,
      backgroundColor: colors.holoBlue,
      // Angular design
      borderRadius: 0,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: colors.shadowNeonCyan,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
   },
   listItemBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.6,
   },
   listSideAccent: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 3,
      opacity: 0.8,
   },
   rankBadge: {
      width: 36,
      height: 36,
      borderRadius: 0, // Angular design
      marginRight: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      position: 'relative',
      overflow: 'hidden',
   },
   avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      borderWidth: 2,
      borderColor: colors.neonCyan,
      position: 'relative',
      overflow: 'hidden',
   },
   textContainer: {
      flex: 1,
      zIndex: 2,
   },
   nameText: {
      width: 120,
      height: 16,
      borderRadius: 0, // Angular
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      position: 'relative',
      overflow: 'hidden',
   },
   statText: {
      width: 80,
      height: 12,
      borderRadius: 0, // Angular
      borderWidth: 1,
      borderColor: colors.textMuted,
      position: 'relative',
      overflow: 'hidden',
   },
   value: {
      width: 60,
      height: 24,
      borderRadius: 0, // Angular
      borderWidth: 1,
      borderColor: colors.neonCyan,
      position: 'relative',
      overflow: 'hidden',
   },
   // Skeleton brackets
   skeletonBracket: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderWidth: 1,
   },
   topLeft: {
      top: 0,
      left: 0,
      borderBottomWidth: 0,
      borderRightWidth: 0,
   },
   bottomRight: {
      bottom: 0,
      right: 0,
      borderTopWidth: 0,
      borderLeftWidth: 0,
   },
});

