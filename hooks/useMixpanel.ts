/**
 * Mixpanel Hook
 * Provides easy access to Mixpanel tracking functions in React components
 */

import { useAuth } from '@/context/auth';
import mixpanel, {
   MixpanelEventName,
   MixpanelEventProperties,
   MixpanelUserProperties,
} from '@/services/mixpanel';
import { useCallback, useEffect } from 'react';

export const useMixpanel = () => {
   const { user } = useAuth();

   // Initialize Mixpanel and identify user when auth changes
   useEffect(() => {
      const initializeMixpanel = async () => {
         try {
            // Ensure Mixpanel is initialized
            await mixpanel.init();

            // Always identify the user if we have one, even without strict type checking
            if (user) {
               // Enhanced user identification strategy
               let identificationUserId: string | undefined = undefined;

               // Try multiple paths to find a valid userId
               const possibleUserIds: (string | number | undefined)[] = [
                  user.id,
                  user.userId,
               ];

               // Find the first truthy user ID and convert to string
               const foundId = possibleUserIds.find((id) => id != null);
               identificationUserId =
                  foundId !== undefined ? String(foundId) : undefined;

               // If no valid user ID is found, log a warning and skip identification
               if (!identificationUserId) {
                  console.warn(
                     'Could not find a valid userId for Mixpanel identification',
                     {
                        userObject: JSON.stringify(
                           {
                              id: user.id,
                              userId: user.userId,
                              name: user.name,
                              email: user.email,
                           },
                           null,
                           2
                        ),
                     }
                  );
                  return;
               }

               const userIdentifyData: Record<string, any> = {
                  name: user.name || 'Unknown',
                  email: user.email || '',
                  userId: identificationUserId,
                  picture: user.picture,
                  provider: user.provider,
                  databaseUserId: user.userId,
               };

               // Remove undefined values
               Object.keys(userIdentifyData).forEach(
                  (key) =>
                     userIdentifyData[key] === undefined &&
                     delete userIdentifyData[key]
               );

               await mixpanel.identify(identificationUserId, userIdentifyData);
            } else {
               console.warn('No user available for Mixpanel identification');
            }
         } catch (error) {
            console.error(
               'Failed to initialize or identify in Mixpanel:',
               error
            );
         }
      };

      initializeMixpanel();
   }, [user]);

   // Track event wrapper
   const track = useCallback(
      async (
         eventName: MixpanelEventName,
         properties?: MixpanelEventProperties
      ) => {
         await mixpanel.track(eventName, properties);
      },
      []
   );

   // Track screen view wrapper
   const trackScreenView = useCallback(
      async (screenName: string, properties?: MixpanelEventProperties) => {
         await mixpanel.trackScreenView(screenName, properties);
      },
      []
   );

   // Track game event with game-specific properties
   const trackGameEvent = useCallback(
      async (
         eventName: MixpanelEventName,
         gameId: string,
         leagueId: string,
         properties?: MixpanelEventProperties
      ) => {
         await mixpanel.track(eventName, {
            game_id: gameId,
            league_id: leagueId,
            ...properties,
         });
      },
      []
   );

   // Track league event with league-specific properties
   const trackLeagueEvent = useCallback(
      async (
         eventName: MixpanelEventName,
         leagueId: string,
         leagueName?: string,
         properties?: MixpanelEventProperties
      ) => {
         await mixpanel.track(eventName, {
            league_id: leagueId,
            league_name: leagueName,
            ...properties,
         });
      },
      []
   );

   // Track error event
   const trackError = useCallback(
      async (
         error: Error | string,
         screen?: string,
         properties?: MixpanelEventProperties
      ) => {
         await mixpanel.track('error_occurred', {
            error_message: error instanceof Error ? error.message : error,
            error_stack: error instanceof Error ? error.stack : undefined,
            screen_name: screen,
            ...properties,
         });
      },
      []
   );

   // Update user properties
   const updateUserProperties = useCallback(
      async (properties: MixpanelUserProperties) => {
         await mixpanel.updateUserProperties(properties);
      },
      []
   );

   // Increment user property
   const incrementUserProperty = useCallback(
      async (propertyName: string, value: number = 1) => {
         await mixpanel.incrementUserProperty(propertyName, value);
      },
      []
   );

   // Track timing event
   const trackTiming = useCallback(
      async (
         eventName: MixpanelEventName,
         seconds: number,
         properties?: MixpanelEventProperties
      ) => {
         await mixpanel.trackTiming(eventName, seconds, properties);
      },
      []
   );

   // Track revenue
   const trackRevenue = useCallback(
      async (amount: number, properties?: MixpanelEventProperties) => {
         await mixpanel.trackRevenue(amount, properties);
      },
      []
   );

   // Reset on logout
   const reset = useCallback(async () => {
      await mixpanel.reset();
   }, []);

   return {
      track,
      trackScreenView,
      trackGameEvent,
      trackLeagueEvent,
      trackError,
      updateUserProperties,
      incrementUserProperty,
      trackTiming,
      trackRevenue,
      reset,
   };
};

export default useMixpanel;
