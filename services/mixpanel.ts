/**
 * Mixpanel Analytics Service
 * Provides centralized event tracking for the Poker League Hero app
 */

import { Mixpanel } from 'mixpanel-react-native';

// Get Mixpanel token and server URL from environment variables
const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '';
const MIXPANEL_SERVER_URL = process.env.EXPO_PUBLIC_MIXPANEL_SERVER_URL; // Optional: for EU data residency

// Event types for type safety
export type MixpanelEventName =
   // Authentication Events
   | 'user_signed_up'
   | 'user_logged_in'
   | 'user_logged_out'
   | 'user_profile_updated'

   // League Events
   | 'league_created'
   | 'league_joined'
   | 'league_viewed'
   | 'league_shared'
   | 'league_deleted'
   | 'league_stats_viewed'

   // Game Events
   | 'game_started'
   | 'game_ended'
   | 'game_player_added'
   | 'game_player_removed'
   | 'game_buy_in'
   | 'game_cash_out'
   | 'game_viewed'

   // Player Selection Events
   | 'players_selected'
   | 'player_selection_cleared'

   // Navigation Events
   | 'tab_switched'
   | 'screen_viewed'
   | 'modal_opened'
   | 'modal_closed'

   // Error Events
   | 'error_occurred'
   | 'api_error';

// Event properties interface
export interface MixpanelEventProperties {
   [key: string]: any;
}

// User properties interface
export interface MixpanelUserProperties {
   name?: string;
   email?: string;
   userId?: string;
   leaguesCount?: number;
   gamesPlayed?: number;
   totalWinnings?: number;
   preferredLanguage?: string;
   [key: string]: any;
}

class MixpanelService {
   private mixpanel: Mixpanel | null = null;
   private isInitialized = false;
   private userId: string | null = null;

   /**
    * Initialize Mixpanel with token
    */
   async init(): Promise<void> {
      if (this.isInitialized || !MIXPANEL_TOKEN) {
         if (!MIXPANEL_TOKEN) {
            console.warn('Mixpanel token not found in environment variables');
         }
         return;
      }

      try {
         if (!MIXPANEL_TOKEN) {
            console.error('Mixpanel initialization failed: Token is missing.');
            return;
         }

         this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, false);
         await this.mixpanel.init();

         // Configure server URL if specified (for EU/India data residency)
         if (MIXPANEL_SERVER_URL) {
            this.mixpanel.setServerURL(MIXPANEL_SERVER_URL);
         }

         this.isInitialized = true;
         this.mixpanel.optInTracking();

         console.log('Mixpanel initialized successfully');
      } catch (error) {
         console.error('Failed to initialize Mixpanel:', error);
      }
   }

   /**
    * Identify user for tracking
    */
   async identify(
      userId: string | number | undefined,
      properties?: MixpanelUserProperties
   ): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         return;
      }

      try {
         // Validate userId input
         if (userId === undefined || userId === null) {
            console.warn(
               'Attempted to identify user with undefined/null userId'
            );

            // Optional: Track an error event about failed identification
            await this.track('error_occurred', {
               reason: 'Undefined or null userId',
               attemptedProperties: Object.keys(properties || {}),
            });

            return;
         }

         const userIdString = userId.toString().trim();

         // Additional validation to prevent empty string IDs
         if (!userIdString) {
            console.warn('Attempted to identify user with empty userId');
            return;
         }

         this.userId = userIdString;
         this.mixpanel.identify(userIdString);

         // Ensure we have the userId in the properties
         const finalProperties: MixpanelUserProperties = {
            ...properties,
            userId: userIdString,
         };

         // Remove any undefined properties
         Object.keys(finalProperties).forEach(
            (key) =>
               finalProperties[key] === undefined && delete finalProperties[key]
         );

         if (Object.keys(finalProperties).length > 0) {
            this.mixpanel.getPeople().set(finalProperties);
         }

         // Set super properties that will be sent with every event
         this.mixpanel.registerSuperProperties({
            userId: userIdString,
            platform: 'mobile',
            appVersion: '1.0.0',
         });
      } catch (error) {
         console.error('Failed to identify user in Mixpanel:', error);

         // Optional: Track a detailed error event
         await this.track('error_occurred', {
            error_message:
               error instanceof Error ? error.message : String(error),
            error_stack: error instanceof Error ? error.stack : undefined,
            screen_name: 'Mixpanel Identification',
            userId: String(userId),
            providedProperties: Object.keys(properties || {}),
         });
      }
   }

   /**
    * Track an event
    */
   async track(
      eventName: MixpanelEventName,
      properties?: MixpanelEventProperties
   ): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         // Optional: Track an error event about tracking failure
         return;
      }

      try {
         const eventData: MixpanelEventProperties = {
            ...properties,
            timestamp: new Date().toISOString(),
            userId: this.userId || 'anonymous',
         };

         if (properties?.userId) {
            const providedUserId = properties.userId.toString().trim();
            if (providedUserId) {
               eventData.userId = providedUserId;
               this.userId = providedUserId;
            }
         }

         this.mixpanel.track(eventName, eventData);
         this.mixpanel.flush();
      } catch (error) {
         console.error('Failed to track event in Mixpanel:', error);

         // Optional: Track a detailed error event
         if (this.mixpanel) {
            this.mixpanel.track('mixpanel_tracking_error', {
               eventName,
               errorMessage:
                  error instanceof Error ? error.message : String(error),
               userId: this.userId || 'unknown',
            });
         }
      }
   }

   /**
    * Track screen view
    */
   async trackScreenView(
      screenName: string,
      properties?: MixpanelEventProperties
   ): Promise<void> {
      await this.track('screen_viewed', {
         screen_name: screenName,
         ...properties,
      });
   }

   /**
    * Update user properties
    */
   async updateUserProperties(
      properties: MixpanelUserProperties
   ): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         return;
      }

      try {
         this.mixpanel.getPeople().set(properties);
      } catch (error) {
         console.error('Failed to update user properties in Mixpanel:', error);
      }
   }

   /**
    * Increment a user property (e.g., games_played)
    */
   async incrementUserProperty(
      propertyName: string,
      value: number = 1
   ): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         return;
      }

      try {
         this.mixpanel.getPeople().increment(propertyName, value);
      } catch (error) {
         console.error('Failed to increment user property in Mixpanel:', error);
      }
   }

   /**
    * Track timing (e.g., how long a game lasted)
    */
   async trackTiming(
      eventName: MixpanelEventName,
      seconds: number,
      properties?: MixpanelEventProperties
   ): Promise<void> {
      await this.track(eventName, {
         duration_seconds: seconds,
         ...properties,
      });
   }

   /**
    * Track revenue event
    */
   async trackRevenue(
      amount: number,
      properties?: MixpanelEventProperties
   ): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         return;
      }

      try {
         this.mixpanel.getPeople().trackCharge(amount, properties || {});
         this.mixpanel.flush();
      } catch (error) {
         console.error('Failed to track revenue in Mixpanel:', error);
      }
   }

   /**
    * Reset user (e.g., on logout)
    */
   async reset(): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         return;
      }

      try {
         this.mixpanel.reset();
         this.userId = null;
      } catch (error) {
         console.error('Failed to reset Mixpanel:', error);
      }
   }

   /**
    * Flush any pending events
    */
   async flush(): Promise<void> {
      if (!this.mixpanel || !this.isInitialized) {
         console.warn('Mixpanel not initialized');
         return;
      }

      try {
         this.mixpanel.flush();
      } catch (error) {
         console.error('Failed to flush Mixpanel events:', error);
      }
   }
}

// Export singleton instance
export const mixpanel = new MixpanelService();

// Export default for easier imports
export default mixpanel;
