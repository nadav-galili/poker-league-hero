import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { joinLeagueWithCode } from '@/services/leagueOperationsService';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function JoinLeagueHandler() {
   const { user, isLoading: authLoading, fetchWithAuth } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();
   const { code, name, id } = useLocalSearchParams();

   useFocusEffect(
      useCallback(() => {
         const handleJoinLeague = async () => {
            try {
               // Wait for auth to load
               if (authLoading) {
                  return;
               }

               // If user is not authenticated, redirect to login
               if (!user) {
                  Toast.show({
                     type: 'error',
                     text1: t('error'),
                     text2:
                        t('joinLeagueRequiresLogin') ||
                        'You must sign in to join a league',
                  });
                  router.replace('/');
                  return;
               }

               if (!code) {
                  Toast.show({
                     type: 'error',
                     text1: t('error'),
                     text2: 'Invalid league code',
                  });
                  router.replace('/');
                  return;
               }

               // Call the API to join the league
               const result = await joinLeagueWithCode(
                  code as string,
                  fetchWithAuth,
                  t
               );

               if (result.success) {
                  Toast.show({
                     type: 'success',
                     text1: t('success'),
                     text2:
                        t('joinedLeagueSuccess') ||
                        `Successfully joined ${name || 'league'}`,
                  });

                  // Redirect to the league page
                  const leagueId = result.league?.id || id;
                  if (leagueId) {
                     router.replace(`/(tabs)/my-leagues/${leagueId}` as any);
                  } else {
                     router.replace('/(tabs)/my-leagues');
                  }
               } else {
                  Toast.show({
                     type: 'error',
                     text1: t('error'),
                     text2: result.error || 'Failed to join league',
                  });
                  router.replace('/');
               }
            } catch (error) {
               console.error('Error joining league:', error);
               Toast.show({
                  type: 'error',
                  text1: t('error'),
                  text2: 'An error occurred while joining the league',
               });
               router.replace('/');
            }
         };

         handleJoinLeague();
      }, [code, user, authLoading, router, t, fetchWithAuth, id, name])
   );

   return (
      <View className="flex-1 justify-center items-center bg-cyberBackground">
         <CyberpunkLoader
            size="large"
            variant="pink"
            text="JOINING LEAGUE..."
         />
      </View>
   );
}
