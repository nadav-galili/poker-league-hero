import { colors, getTheme } from '@/colors';
import { Text } from '@/components/Text';
import { useTopProfitPlayer } from '@/hooks/useTopProfitPlayer';
import { formatCurrency } from '@/services/leagueStatsFormatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LoadingState } from '../../shared/LoadingState';

interface TopProfitPlayerCardProps {
   leagueId: string;
   t: (key: string) => string;
}

export default function TopProfitPlayerCard({
   leagueId,
   t,
}: TopProfitPlayerCardProps) {
   const theme = getTheme('light');
   const { data, isLoading, error } = useTopProfitPlayer(leagueId);

   if (isLoading) {
      return <LoadingState />;
   }

   if (error || !data) {
      return (
         <View
            style={[styles.card, { backgroundColor: theme.surfaceElevated }]}
         >
            <View style={styles.errorContainer}>
               <Ionicons
                  name="trophy-outline"
                  size={32}
                  color={theme.textMuted}
               />
               <Text
                  variant="captionSmall"
                  color={theme.textMuted}
                  style={styles.errorText}
               >
                  {error || t('noCompletedGames')}
               </Text>
            </View>
         </View>
      );
   }

   return (
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
         <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
               <View
                  style={[
                     styles.iconContainer,
                     { backgroundColor: colors.success + '20' },
                  ]}
               >
                  <Ionicons name="trophy" size={24} color={colors.success} />
               </View>
               <Text
                  variant="captionSmall"
                  color={theme.textSecondary}
                  style={styles.cardTitle}
               >
                  {t('topProfitPlayer')} {data.year}
               </Text>
            </View>

            {/* Player Info */}
            <View style={styles.playerContainer}>
               {/* Profile Image */}
               <View style={styles.imageContainer}>
                  {data.profileImageUrl ? (
                     <Image
                        source={{ uri: data.profileImageUrl }}
                        style={styles.profileImage}
                        defaultSource={require('@/assets/images/icon.png')}
                     />
                  ) : (
                     <View
                        style={[
                           styles.placeholderImage,
                           { backgroundColor: colors.primary + '20' },
                        ]}
                     >
                        <Ionicons
                           name="person"
                           size={32}
                           color={colors.primary}
                        />
                     </View>
                  )}
               </View>

               {/* Player Details */}
               <View style={styles.playerInfo}>
                  <Text
                     variant="h4"
                     color={theme.text}
                     style={styles.playerName}
                  >
                     {data.fullName}
                  </Text>
                  <Text
                     variant="h3"
                     color={colors.success}
                     style={styles.profitAmount}
                  >
                     {formatCurrency(data.totalProfit)}
                  </Text>
                  <Text
                     variant="captionSmall"
                     color={theme.textMuted}
                     style={styles.gamesPlayed}
                  >
                     {data.gamesPlayed} {t('gamesPlayed')}
                  </Text>
               </View>
            </View>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   card: {
      width: '100%',
      padding: 16,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#000000',
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8,
      marginBottom: 16,
   },
   cardContent: {
      alignItems: 'center',
   },
   header: {
      alignItems: 'center',
      marginBottom: 16,
   },
   iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      borderWidth: 2,
      borderColor: '#000000',
   },
   cardTitle: {
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
   },
   playerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
   },
   imageContainer: {
      marginRight: 16,
   },
   profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      borderColor: '#000000',
   },
   placeholderImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      borderColor: '#000000',
      alignItems: 'center',
      justifyContent: 'center',
   },
   playerInfo: {
      flex: 1,
      alignItems: 'flex-start',
   },
   playerName: {
      fontWeight: '700',
      marginBottom: 4,
   },
   profitAmount: {
      fontWeight: '700',
      marginBottom: 4,
   },
   gamesPlayed: {
      fontSize: 11,
   },
   loadingContainer: {
      alignItems: 'center',
      paddingVertical: 32,
   },
   loadingText: {
      marginTop: 12,
      textAlign: 'center',
   },
   errorContainer: {
      alignItems: 'center',
      paddingVertical: 32,
   },
   errorText: {
      marginTop: 12,
      textAlign: 'center',
   },
});
