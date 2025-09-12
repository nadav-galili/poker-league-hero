import { colors, getTheme } from '@/colors';
import {
   AdditionalStatsCard,
   LeagueHeader,
   PlayerCard,
   PlayerStatCard,
   StatCard,
   TopProfitPlayerCard,
} from '@/components/LeagueStats';
import { LoadingState } from '@/components/LoadingState';
import { Text } from '@/components/Text';
import { useLocalization } from '@/context/localization';
import { useLeagueStats } from '@/hooks/useLeagueStats';
import { createStatCards, createTopPlayers } from '@/utils/leagueStatsHelpers';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
   RefreshControl,
   Text as RNText,
   ScrollView,
   StyleSheet,
   TouchableOpacity,
   View,
} from 'react-native';

export default function LeagueStatsScreen() {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();
   const { id: leagueId } = useLocalSearchParams<{ id: string }>();

   const {
      league,
      stats,
      isLoading,
      error,
      refreshing,
      loadLeagueData,
      handleRefresh,
   } = useLeagueStats(leagueId);

   const handleBack = () => {
      router.back();
   };

   if (isLoading) {
      return <LoadingState />;
   }

   if (error || !league || !stats) {
      return (
         <View
            style={[styles.container, { backgroundColor: theme.background }]}
         >
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
               <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={24}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
            </View>
            <View style={styles.errorContainer}>
               <Text variant="h3" color={theme.error} style={styles.errorTitle}>
                  {t('error')}
               </Text>
               <Text
                  variant="body"
                  color={theme.textMuted}
                  style={styles.errorMessage}
               >
                  {error || t('statsNotFound')}
               </Text>
               <TouchableOpacity
                  onPress={loadLeagueData}
                  style={[
                     styles.retryButton,
                     { backgroundColor: colors.primary },
                  ]}
               >
                  <Text variant="labelSmall" color={colors.textInverse}>
                     {t('retry')}
                  </Text>
               </TouchableOpacity>
            </View>
         </View>
      );
   }

   const statCards = createStatCards(stats, t);
   const topPlayers = createTopPlayers(stats, t);

   return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
         <LeagueHeader league={league} isRTL={isRTL} onBack={handleBack} />

         <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
               />
            }
         >
            {/* Dynamic Player Stats Cards */}
            <View style={styles.section}>
               <TopProfitPlayerCard leagueId={leagueId!} t={t} />
            </View>

            {/* Example: Most Active Player using the new generic component */}
            <View style={styles.section}>
               <PlayerStatCard
                  leagueId={leagueId!}
                  statType="most-active-player"
                  t={t}
               />
            </View>

            {/* Main Stats Grid */}
            <View style={styles.section}>
               <RNText className="text-primary text-center mb-4 text-2xl font-bold uppercase tracking-widest">
                  {t('league Overview')}
               </RNText>
               <View style={styles.statsGrid}>
                  {statCards.map((card, index) => (
                     <StatCard key={index} card={card} />
                  ))}
               </View>
            </View>

            {/* Top Players */}
            <View style={styles.section}>
               <Text
                  variant="h3"
                  color={theme.text}
                  style={styles.sectionTitle}
               >
                  {t('topPerformers')}
               </Text>
               {topPlayers.map((item, index) => (
                  <PlayerCard key={index} item={item} t={t} />
               ))}
            </View>

            {/* Additional Stats */}
            <View style={[styles.section, { marginBottom: 32 }]}>
               <Text
                  variant="h3"
                  color={theme.text}
                  style={styles.sectionTitle}
               >
                  {t('additionalStats')}
               </Text>
               <AdditionalStatsCard league={league} t={t} />
            </View>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 6,
      borderBottomColor: colors.text,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 12,
   },
   backButton: {
      padding: 8,
   },
   scrollView: {
      flex: 1,
   },
   section: {
      marginBottom: 24,
      alignItems: 'center',
      paddingHorizontal: 24,
   },
   sectionTitle: {
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
   },
   statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: '100%',
      gap: 16,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
   },
   loadingText: {
      marginTop: 16,
      textAlign: 'center',
   },
   errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
   },
   errorTitle: {
      textAlign: 'center',
      marginBottom: 12,
   },
   errorMessage: {
      textAlign: 'center',
      marginBottom: 24,
   },
   retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 3,
      borderColor: colors.text,
   },
});
