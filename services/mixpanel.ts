/**
 * Mixpanel Analytics Service
 * Provides centralized event tracking for the Poker League Hero app
 */

import Constants from 'expo-constants';
import * as TrackingTransparency from 'expo-tracking-transparency';
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
   | 'game_buy_in_undone'
   | 'game_history_expanded'
   | 'game_history_collapsed'

   // Player Selection Events
   | 'players_selected'
   | 'player_selection_cleared'

   // Navigation Events
   | 'tab_switched'
   | 'screen_viewed'
   | 'modal_opened'
   | 'modal_closed'

   // Onboarding Events
   | 'onboarding_started'
   | 'onboarding_completed'
   | 'onboarding_skipped'
   | 'onboarding_slide_viewed'

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
   private trackingStatus: TrackingTransparency.PermissionStatus | null = null;

   /**
    * Initialize Mixpanel with token
    * Requests App Tracking Transparency permission before initializing on iOS
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

         // Request tracking permission on iOS before initializing Mixpanel
         // This is required by Apple's ATT policy - we ask permission even though
         // we only disable IDFA collection, allowing functional analytics to continue
         try {
            const { status } =
               await TrackingTransparency.requestTrackingPermissionsAsync();
            this.trackingStatus = status;
            console.log(
               `ATT permission status: ${status}. Functional tracking will continue regardless.`
            );
         } catch (error) {
            // If tracking transparency is not available (e.g., on Android or older iOS), continue
            // Default to granted behavior on Android where ATT doesn't exist
            this.trackingStatus = TrackingTransparency.PermissionStatus.GRANTED;
            console.log('Tracking transparency not available:', error);
         }

         this.mixpanel = new Mixpanel(MIXPANEL_TOKEN, false);
         await this.mixpanel.init();

         // Disable advertising ID collection to comply with Apple's ATT policy
         // This ensures we don't collect IDFA (iOS) or AAID (Android)
         // Functional analytics (events, crashes, performance) can still be tracked
         try {
            const mixpanelAny = this.mixpanel as any;
            if (mixpanelAny.setUseAdvertisingId) {
               mixpanelAny.setUseAdvertisingId(false);
            }
         } catch (error) {
            console.log('Could not disable advertising ID in Mixpanel:', error);
         }

         // Configure server URL if specified (for EU/India data residency)
         if (MIXPANEL_SERVER_URL) {
            this.mixpanel.setServerURL(MIXPANEL_SERVER_URL);
         }

         this.isInitialized = true;

         // Always opt in to functional analytics tracking
         // We disabled advertising ID collection above, so we're compliant with ATT
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

         // Handle tracking opt-out: Only send PII if tracking is granted
         let finalProperties: MixpanelUserProperties = {
            ...properties,
            userId: userIdString,
         };

         // If tracking is NOT granted, strip PII fields
         if (
            this.trackingStatus !==
            TrackingTransparency.PermissionStatus.GRANTED
         ) {
            console.log(
               'Tracking permission denied. Stripping PII from user properties.'
            );
            delete finalProperties.name;
            delete finalProperties.email;
            delete finalProperties.picture;
            // Keep generic properties like gamesPlayed, etc.
         }

         // Remove any undefined properties
         Object.keys(finalProperties).forEach(
            (key) =>
               finalProperties[key] === undefined && delete finalProperties[key]
         );

         if (Object.keys(finalProperties).length > 0) {
            this.mixpanel.getPeople().set(finalProperties);
         }

         // Get app version dynamically
         const appVersion =
            Constants.expoConfig?.version ||
            (Constants.manifest2?.extra?.expoClient?.version as
               | string
               | undefined) ||
            '1.0.0';

         // Set super properties that will be sent with every event
         this.mixpanel.registerSuperProperties({
            userId: userIdString,
            platform: 'mobile',
            appVersion: appVersion,
            trackingStatus: this.trackingStatus,
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
         const safeProperties = { ...properties };

         // If tracking is NOT granted, strip PII fields
         if (
            this.trackingStatus !==
            TrackingTransparency.PermissionStatus.GRANTED
         ) {
            delete safeProperties.name;
            delete safeProperties.email;
            delete safeProperties.picture;
         }

         this.mixpanel.getPeople().set(safeProperties);
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
