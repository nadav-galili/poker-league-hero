/**
 * Custom hook for managing user leagues
 */

import { addThemeToLeagues } from '@/constants/leagueThemes';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { joinLeagueWithCode, shareLeague } from '@/services';
import { fetchUserLeagues } from '@/services/leagueService';
import { LeagueWithTheme } from '@/types/league';
import {
   addBreadcrumb,
   captureException,
   captureMessage,
   setTag,
} from '@/utils/sentry';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

export function useMyLeagues() {
   const { t } = useLocalization();
   const { fetchWithAuth } = useAuth();

   const [leagues, setLeagues] = React.useState<LeagueWithTheme[]>([]);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [refreshing, setRefreshing] = React.useState(false);

   // Function to load leagues with abort controller for cleanup
   const loadLeagues = React.useCallback(
      async (abortSignal?: AbortSignal, isRefresh = false) => {
         try {
            if (abortSignal?.aborted) return;

            if (!isRefresh) {
               setIsLoading(true);
            } else {
               setRefreshing(true);
            }
            setError(null);
            const userLeagues = await fetchUserLeagues(
               fetchWithAuth,
               abortSignal
            );

            if (abortSignal?.aborted) return;

            const leaguesWithTheme = addThemeToLeagues(userLeagues);
            setLeagues(leaguesWithTheme);
         } catch (err) {
            if (abortSignal?.aborted) return;

            const errorMessage =
               err instanceof Error ? err.message : 'Failed to load leagues';
            setError(errorMessage);
            captureException(err as Error, {
               function: 'loadLeagues',
               screen: 'MyLeagues',
            });
         } finally {
            if (!abortSignal?.aborted) {
               setIsLoading(false);
               setRefreshing(false);
            }
         }
      },
      [fetchWithAuth]
   );

   // Load leagues on mount with proper cleanup
   React.useEffect(() => {
      const abortController = new AbortController();
      loadLeagues(abortController.signal);

      return () => {
         abortController.abort();
      };
   }, [loadLeagues]);

   // Refresh leagues when screen comes into focus (e.g., after creating a league)
   useFocusEffect(
      React.useCallback(() => {
         const abortController = new AbortController();
         loadLeagues(abortController.signal);

         return () => {
            abortController.abort();
         };
      }, [loadLeagues])
   );

   // Track screen visit
   React.useEffect(() => {
      addBreadcrumb('User visited My Leagues screen', 'navigation', {
         screen: 'MyLeagues',
         timestamp: new Date().toISOString(),
      });
      setTag('current_screen', 'my_leagues');
   }, []);

   // Navigation handlers
   const handleCreateLeague = React.useCallback(() => {
      try {
         addBreadcrumb('User clicked Create League', 'user_action', {
            screen: 'MyLeagues',
            action: 'create_league',
         });

         router.push('/leagues/create-league');
      } catch (error) {
         captureException(error as Error, {
            function: 'handleCreateLeague',
            screen: 'MyLeagues',
         });
         Alert.alert(t('error'), 'Failed to open create league dialog');
      }
   }, [t]);

   const handleJoinLeague = React.useCallback(() => {
      try {
         Alert.prompt(
            t('joinLeague'),
            t('enterLeagueCode'),
            [
               { text: t('cancel'), style: 'cancel' },
               {
                  text: t('join'),
                  onPress: async (code) => {
                     await handleJoinLeagueWithCode(code);
                  },
               },
            ],
            'plain-text'
         );
      } catch (error) {
         captureException(error as Error, {
            function: 'handleJoinLeague',
            screen: 'MyLeagues',
         });
         Alert.alert(t('error'), 'Failed to open join league dialog');
      }
   }, [t]);

   const handleJoinLeagueWithCode = React.useCallback(
      async (code?: string) => {
         try {
            if (!code) {
               Alert.alert(t('error'), 'Please enter a league code');
               return;
            }

            // Show loading state
            setIsLoading(true);

            const result = await joinLeagueWithCode(code, fetchWithAuth, t);

            if (result.success && result.league) {
               // Optimistic update: Add the league to the list immediately
               const leagueWithTheme = addThemeToLeagues([result.league])[0];
               setLeagues((prevLeagues) => [...prevLeagues, leagueWithTheme]);

               // Success! Show success message
               Alert.alert(
                  t('success'),
                  `${t('joinedLeagueSuccess')} "${result.league.name}"`,
                  [
                     {
                        text: t('ok'),
                        onPress: () => {
                           // Refresh the leagues list to ensure consistency
                           const abortController = new AbortController();
                           loadLeagues(abortController.signal);
                        },
                     },
                  ]
               );
            } else {
               Alert.alert(t('error'), result.error || 'Failed to join league');
            }
         } catch (error) {
            const errorMessage =
               error instanceof Error ? error.message : 'Failed to join league';
            Alert.alert(t('error'), errorMessage);

            // Refresh leagues on error to ensure consistency
            const abortController = new AbortController();
            loadLeagues(abortController.signal);
         } finally {
            setIsLoading(false);
         }
      },
      [fetchWithAuth, t, loadLeagues]
   );

   const handleShareLeague = React.useCallback(
      async (league: LeagueWithTheme) => {
         const result = await shareLeague(league, t);

         if (!result.success && !result.cancelled && result.error) {
            Alert.alert(t('error'), t('failedToShare'));
         }
      },
      [t]
   );

   const handleLeaguePress = React.useCallback((league: LeagueWithTheme) => {
      try {
         // Navigate to league stats
         router.push(`/leagues/${league.id}/stats`);

         captureMessage('User viewed league details', 'info', {
            screen: 'MyLeagues',
            leagueId: league.id,
            leagueName: league.name,
         });
      } catch (error) {
         captureException(error as Error, {
            function: 'handleLeaguePress',
            screen: 'MyLeagues',
            leagueId: league.id,
         });
      }
   }, []);

   // Handle refresh functionality
   const handleRefresh = React.useCallback(() => {
      const abortController = new AbortController();
      loadLeagues(abortController.signal, true);
   }, [loadLeagues]);

   // Memoize the returned object to prevent unnecessary re-renders
   return React.useMemo(
      () => ({
         leagues,
         isLoading,
         error,
         refreshing,
         loadLeagues,
         handleCreateLeague,
         handleJoinLeague,
         handleShareLeague,
         handleLeaguePress,
         handleRefresh,
      }),
      [
         leagues,
         isLoading,
         error,
         refreshing,
         loadLeagues,
         handleCreateLeague,
         handleJoinLeague,
         handleShareLeague,
         handleLeaguePress,
         handleRefresh,
      ]
   );
}
