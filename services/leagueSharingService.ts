/**
 * League sharing service
 */

import { Share } from 'react-native';
import {
   addBreadcrumb,
   captureException,
   captureMessage,
} from '@/utils/sentry';

export interface ShareableLeague {
   id: string;
   name: string;
   code: string;
}

export interface ShareResult {
   success: boolean;
   cancelled?: boolean;
   error?: string;
}

/**
 * Share a league with other users
 */
export async function shareLeague(
   league: ShareableLeague,
   t: (key: string) => string
): Promise<ShareResult> {
   try {
      addBreadcrumb('User initiated league share', 'user_action', {
         screen: 'MyLeagues',
         action: 'share_league',
         leagueId: league.id,
         leagueName: league.name,
         leagueCode: league.code,
      });

      // Create deep link URL using the expo.app domain for production
      const baseUrl =
         process.env.EXPO_PUBLIC_BASE_URL ||
         'https://poker-ai-homestack.expo.app';
      const deepLinkUrl = `${baseUrl}/join-league/${league.code}?name=${encodeURIComponent(league.name)}&id=${league.id}`;

      const shareMessage = `${t('joinMyLeague')} "${league.name}"\n\n${t(
         'leagueCode'
      )} ${league.code}\n\n${t('joinHere')} ${deepLinkUrl}`;

      // Use React Native's built-in Share API which works with text/URLs
      await Share.share(
         {
            message: shareMessage,
            url: deepLinkUrl,
            title: `${t('joinLeague')} ${league.name}`,
         },
         {
            dialogTitle: `${t('shareLeague')} ${league.name}`,
         }
      );

      // Track successful share
      captureMessage('League share completed successfully', 'info', {
         screen: 'MyLeagues',
         leagueId: league.id,
         leagueName: league.name,
         shareMethod: 'native_share',
      });

      return { success: true };
   } catch (error) {
      console.error('Error sharing league:', error);

      // Check if user cancelled the share
      if (error instanceof Error && error.message === 'User did not share') {
         addBreadcrumb('User cancelled league share', 'user_action', {
            screen: 'MyLeagues',
            action: 'share_cancelled',
            leagueId: league.id,
         });
         return { success: false, cancelled: true };
      }

      // Capture actual errors
      captureException(error as Error, {
         function: 'shareLeague',
         screen: 'MyLeagues',
         leagueId: league.id,
         leagueName: league.name,
         leagueCode: league.code,
         deepLinkUrl: `join-league/${league.code}`,
      });

      return {
         success: false,
         error:
            error instanceof Error ? error.message : 'Failed to share league',
      };
   }
}
