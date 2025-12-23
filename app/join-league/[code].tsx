import CyberpunkLoader from '@/components/ui/CyberpunkLoader';
import { useAuth } from '@/context/auth';
import { useLocalization } from '@/context/localization';
import { useMixpanel } from '@/hooks/useMixpanel';
import { joinLeagueWithCode } from '@/services/leagueOperationsService';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function JoinLeagueHandler() {
   const { user, isLoading: authLoading, fetchWithAuth } = useAuth();
   const { t } = useLocalization();
   const router = useRouter();
   const { code, name, id } = useLocalSearchParams();
   const { track, trackScreenView, trackLeagueEvent } = useMixpanel();

   useEffect(() => {
      trackScreenView('join_league_handler_screen', {
         league_code: code,
         league_name: name,
         league_id: id,
      });
   }, [code, name, id, trackScreenView]);

   useFocusEffect(
      useCallback(() => {
         const handleJoinLeague = async () => {
            try {
               // ... (auth checks)
               
               // ... (code checks)

               // Call the API to join the league
               const result = await joinLeagueWithCode(
                  code as string,
                  fetchWithAuth,
                  t
               );

               if (result.success) {
                  // Track successful join
                  if (result.league?.id) {
                     trackLeagueEvent('league_joined', result.league.id, result.league.name, {
                        method: 'invite_code',
                        invite_code: code,
                     });
                  }

                  Toast.show({
                     // ...
                  });

                  // ... (redirect)
               } else {
                  // Track failure
                  track('api_error', {
                     error: result.error || 'Failed to join league',
                     endpoint: 'joinLeagueWithCode',
                     league_code: code,
                  });

                  Toast.show({
                     // ...
                  });
                  router.replace('/');
               }
            } catch (error) {
               console.error('Error joining league:', error);
               track('error_occurred', {
                  error_message: error instanceof Error ? error.message : String(error),
                  screen_name: 'JoinLeagueHandler',
                  league_code: code,
               });
               // ...
            }
         };

         handleJoinLeague();
      }, [code, user, authLoading, router, t, fetchWithAuth, id, name, track, trackLeagueEvent])
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
