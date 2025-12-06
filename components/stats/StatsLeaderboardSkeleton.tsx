import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withRepeat,
   withSequence,
   withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const SkeletonItem = ({ style }: { style: any }) => {
   const opacity = useSharedValue(0.3);

   useEffect(() => {
      opacity.value = withRepeat(
         withSequence(
            withTiming(0.7, { duration: 1000 }),
            withTiming(0.3, { duration: 1000 })
         ),
         -1,
         true
      );
   }, []);

   const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
   }));

   return <Animated.View style={[style, animatedStyle]} />;
};

export default function StatsLeaderboardSkeleton() {
   return (
      <View style={styles.container}>
         {/* Hero Skeleton */}
         <View style={styles.heroContainer}>
            <SkeletonItem style={styles.heroCard} />
         </View>

         {/* List Skeletons */}
         <View style={styles.listContainer}>
            {[1, 2, 3, 4, 5].map((key) => (
               <View key={key} style={styles.listItem}>
                  <SkeletonItem style={styles.rankBadge} />
                  <SkeletonItem style={styles.avatar} />
                  <View style={styles.textContainer}>
                     <SkeletonItem style={styles.nameText} />
                     <SkeletonItem style={styles.statText} />
                  </View>
                  <SkeletonItem style={styles.value} />
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
      marginBottom: 32,
      paddingHorizontal: 20,
   },
   heroCard: {
      width: '100%',
      height: 200,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
   },
   listContainer: {
      paddingHorizontal: 20,
   },
   listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      padding: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
   },
   rankBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginRight: 12,
   },
   avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginRight: 12,
   },
   textContainer: {
      flex: 1,
   },
   nameText: {
      width: 120,
      height: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      marginBottom: 8,
   },
   statText: {
      width: 80,
      height: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 4,
   },
   value: {
      width: 60,
      height: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
   },
});

