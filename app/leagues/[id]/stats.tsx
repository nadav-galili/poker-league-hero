import { colors, getTheme } from '@/colors';
import Button from '@/components/Button';
import { LoadingState } from '@/components/LoadingState';
import { Text } from '@/components/Text';
import { BASE_URL } from '@/constants';
import { useLocalization } from '@/context/localization';

import { addBreadcrumb, captureException } from '@/utils/sentry';
import { Ionicons } from '@expo/vector-icons';

import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';

interface LeagueData {
   id: string;
   name: string;
   imageUrl: string;
   inviteCode: string;
   memberCount: number;
   isActive: boolean;
   createdAt: string;
}

export default function LeagueStats() {
   const theme = getTheme('light');
   const { t, isRTL } = useLocalization();
   const { id } = useLocalSearchParams<{ id: string }>();

   const [league, setLeague] = React.useState<LeagueData | null>(null);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);

   // Function to load league details
   const loadLeagueDetails = React.useCallback(async () => {
      if (!id) return;

      try {
         setIsLoading(true);
         setError(null);

         const response = await fetch(`${BASE_URL}/api/leagues/${id}`);

         if (!response.ok) {
            throw new Error('Failed to fetch league details');
         }

         const data = await response.json();
         setLeague(data.league);

         addBreadcrumb('League details loaded', 'data', {
            screen: 'LeagueStats',
            leagueId: id,
            leagueName: data.league?.name,
         });
      } catch (err) {
         const errorMessage =
            err instanceof Error
               ? err.message
               : 'Failed to load league details';
         setError(errorMessage);
         captureException(err as Error, {
            function: 'loadLeagueDetails',
            screen: 'LeagueStats',
            leagueId: id,
         });
      } finally {
         setIsLoading(false);
      }
   }, [id]);

   // Load league details on mount
   React.useEffect(() => {
      loadLeagueDetails();
   }, [loadLeagueDetails]);

   const handleBack = () => {
      router.back();
   };

   if (isLoading) {
      return <LoadingState />;
   }

   if (error || !league) {
      return (
         <View className="flex-1 bg-background">
            <View className="flex-row items-center justify-between p-5 bg-primary">
               <TouchableOpacity onPress={handleBack} className="p-8">
                  <Ionicons
                     name={isRTL ? 'arrow-forward' : 'arrow-back'}
                     size={24}
                     color={colors.textInverse}
                  />
               </TouchableOpacity>
               <Text className="text-textInverse">{t('leagueStats')}</Text>
               <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center p-5">
               <Text
                  variant="h3"
                  color={theme.error}
                  className="text-center mb-4"
               >
                  {t('error')}
               </Text>
               <Text
                  variant="body"
                  color={theme.textMuted}
                  className="text-center mb-4"
               >
                  {error || t('leagueNotFound')}
               </Text>
               <Button
                  title={t('retry')}
                  onPress={loadLeagueDetails}
                  variant="outline"
                  size="small"
               />
            </View>
         </View>
      );
   }

   return (
      <View className="flex-1 bg-background">
         {/* Header */}
         <View className="flex-row items-center justify-between p-5 bg-primary">
            <TouchableOpacity onPress={handleBack} className="p-8">
               <Ionicons
                  name={isRTL ? 'arrow-forward' : 'arrow-back'}
                  size={24}
                  color={colors.textInverse}
               />
            </TouchableOpacity>
            <Text className="text-textInverse">{t('leagueStats')}</Text>
            <View className="w-10" />
         </View>

         <ScrollView
            className="flex-1"
            contentContainerClassName="p-5 pb-20"
            showsVerticalScrollIndicator={false}
         >
            {/* League Header */}
            <View className="flex-row p-5 rounded-xl mb-5 bg-primaryTint border-[3px] border-primary  shadow-border">
               <View className="mr-5">
                  <Image
                     source={{ uri: league.imageUrl }}
                     width={100}
                     height={100}
                     className="w-25 h-25 rounded-xl border-6 border-primary object-cover"
                     onError={(error) => {
                        captureException(
                           new Error('League image loading failed'),
                           {
                              function: 'Image.onError',
                              screen: 'LeagueStats',
                              leagueId: league.id,
                              imageUri: league.imageUrl,
                              error: error.toString(),
                           }
                        );
                     }}
                  />
               </View>

               <View className="flex-1 justify-center">
                  <Text
                     variant="h2"
                     color={theme.text}
                     className="tracking-wider mb-3"
                  >
                     {league.name}
                  </Text>

                  <View className="gap-2">
                     <View className="self-start px-3 py-1.5 rounded-md border-3 bg-primaryTint  border-3  border-primary">
                        <Text
                           variant="labelSmall"
                           color={colors.primary}
                           className="tracking-wide font-bold"
                        >
                           {league.inviteCode}
                        </Text>
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
            </View>

            {/* Main Action Cards */}
            <View className="gap-8">
               {/* View Detailed Stats Card */}
               <TouchableOpacity
                  className="relative border-6 border-4 bg-white border-primary  rounded-xl p-6  shadow-border 
                  
                  active:scale-[0.97] active:translate-x-0.5 active:translate-y-0.5
                  "
                  onPress={() => {
                     // Navigate to detailed stats screen
                     router.push(`/leagues/${league.id}/league-stats-screen`);
                  }}
                  style={{
                     shadowColor: colors.border,
                     shadowOffset: { width: -6, height: -6 },
                     shadowOpacity: 1,
                     shadowRadius: 0,
                     elevation: 0,
                  }}
               >
                  <View className="absolute inset-0 bg-secondary rounded-xl -z-10" />

                  <View className="flex-row items-center">
                     <View className="w-18 h-18 bg-primary border-6 border-border rounded-xl items-center justify-center mr-5 transform rotate-6">
                        <Ionicons
                           name="stats-chart"
                           size={34}
                           color={colors.textInverse}
                        />
                     </View>

                     <View className="flex-1">
                        <Text
                           variant="h3"
                           color={colors.textInverse}
                           className="tracking-widest mb-2  uppercase transform -rotate-1"
                        >
                           {t('viewDetailedStats')}
                        </Text>
                        <Text
                           variant="body"
                           color={colors.textInverse}
                           className="leading-5 font-bold opacity-90"
                        >
                           {t('viewStatsDescription')}
                        </Text>
                     </View>

                     <View className="ml-3 transform rotate-12">
                        <Ionicons
                           name="chevron-back"
                           size={28}
                           color={colors.textInverse}
                        />
                     </View>
                  </View>
               </TouchableOpacity>

               {/* Start New Game Card */}
               <TouchableOpacity
                  className="relative  border-6 border-border rounded-xl p-6"
                  onPress={() => {
                     // Navigate to select players screen
                     router.push(`/games/${league.id}/select-players`);
                  }}
                  style={{
                     shadowColor: colors.border,
                     shadowOffset: { width: -6, height: -6 },
                     shadowOpacity: 1,
                     shadowRadius: 0,
                     elevation: 0,
                  }}
               >
                  <View className="absolute inset-0 bg-success rounded-xl -z-10" />

                  <View className="flex-row items-center">
                     <View className="w-18 h-18 bg-textInverse border-6 border-border rounded-xl items-center justify-center mr-5 transform -rotate-6">
                        <Ionicons
                           name="play-circle"
                           size={34}
                           color={colors.secondary}
                        />
                     </View>

                     <View className="flex-1">
                        <Text
                           variant="h3"
                           color={colors.textInverse}
                           className="tracking-widest mb-2 font-black uppercase transform rotate-1"
                        >
                           {t('startNewGame')}
                        </Text>
                        <Text
                           variant="body"
                           color={colors.textInverse}
                           className="leading-5 font-bold opacity-90"
                        >
                           {t('startGameDescription')}
                        </Text>
                     </View>

                     <View className="ml-3 transform -rotate-12">
                        <Ionicons
                           name="chevron-back"
                           size={28}
                           color={colors.textInverse}
                        />
                     </View>
                  </View>
               </TouchableOpacity>
            </View>
         </ScrollView>
      </View>
   );
}

// const styles = StyleSheet.create({
//    container: {
//       flex: 1,
//    },
//    header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       paddingHorizontal: 20,
//       paddingTop: 60,
//       paddingBottom: 16,
//       borderBottomWidth: 6,
//       borderBottomColor: colors.text,
//       shadowColor: colors.text,
//       shadowOffset: { width: 0, height: 8 },
//       shadowOpacity: 1,
//       shadowRadius: 0,
//       elevation: 12,
//    },
//    backButton: {
//       padding: 8,
//    },
//    headerTitle: {
//       fontSize: 20,
//       fontWeight: '700',
//       textTransform: 'uppercase',
//       letterSpacing: 1,
//    },
//    placeholder: {
//       width: 40,
//    },
//    loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingVertical: 60,
//    },
//    loadingText: {
//       marginTop: 16,
//       textAlign: 'center',
//    },
//    errorContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingHorizontal: 40,
//       paddingVertical: 60,
//    },
//    errorTitle: {
//       textAlign: 'center',
//       marginBottom: 12,
//    },
//    errorMessage: {
//       textAlign: 'center',
//       marginBottom: 24,
//    },
// });
