/**
 * League Service - Handles all league-related API operations
 */

import { BASE_URL } from '@/constants';
import { League, LeagueData, LeagueStats } from '@/types';

export class LeagueService {
   constructor(
      private fetchWithAuth: (
         url: string,
         options: RequestInit
      ) => Promise<Response>
   ) {}

   /**
    * Fetch league details with members
    */
   async getLeagueWithMembers(leagueId: string): Promise<LeagueData> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/${leagueId}`,
         {}
      );

      if (!response.ok) {
         throw new Error('Failed to fetch league details');
      }

      const data = await response.json();

      if (!data.success || !data.league) {
         throw new Error(data.message || 'Failed to load league details');
      }

      return data.league;
   }

   /**
    * Get basic league information
    */
   async getLeague(leagueId: string): Promise<League> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/${leagueId}/info`,
         {}
      );

      if (!response.ok) {
         throw new Error('Failed to fetch league information');
      }

      const data = await response.json();

      if (!data.success || !data.league) {
         throw new Error(data.message || 'Failed to load league information');
      }

      return data.league;
   }

   /**
    * Get user's leagues
    */
   async getUserLeagues(): Promise<League[]> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/my`,
         {}
      );

      if (!response.ok) {
         throw new Error('Failed to fetch user leagues');
      }

      const data = await response.json();

      if (!data.success) {
         throw new Error(data.message || 'Failed to load user leagues');
      }

      return data.leagues || [];
   }

   /**
    * Create a new league
    */
   async createLeague(leagueData: {
      name: string;
      description?: string;
      imageUrl?: string;
      settings?: any;
   }): Promise<League> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/create`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(leagueData),
         }
      );

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to create league');
      }

      const data = await response.json();

      if (!data.success || !data.league) {
         throw new Error(data.message || 'Failed to create league');
      }

      return data.league;
   }

   /**
    * Join a league
    */
   async joinLeague(leagueId: string): Promise<void> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/${leagueId}/join`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to join league');
      }

      const data = await response.json();

      if (!data.success) {
         throw new Error(data.message || 'Failed to join league');
      }
   }

   /**
    * Leave a league
    */
   async leaveLeague(leagueId: string): Promise<void> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/${leagueId}/leave`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to leave league');
      }

      const data = await response.json();

      if (!data.success) {
         throw new Error(data.message || 'Failed to leave league');
      }
   }

   /**
    * Get league statistics
    */
   async getLeagueStats(leagueId: string): Promise<LeagueStats> {
      const response = await this.fetchWithAuth(
         `${BASE_URL}/api/leagues/${leagueId}/stats`,
         {}
      );

      if (!response.ok) {
         throw new Error('Failed to fetch league statistics');
      }

      const data = await response.json();

      if (!data.success || !data.stats) {
         throw new Error(data.message || 'Failed to load league statistics');
      }

      return data.stats;
   }
}

/**
 * Fetch user leagues (standalone function for hooks)
 */
export async function fetchUserLeagues(
   fetchWithAuth: (url: string, options: RequestInit) => Promise<Response>,
   abortSignal?: AbortSignal
): Promise<League[]> {
   try {
      const options: RequestInit = {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      };
      if (abortSignal) {
         options.signal = abortSignal;
      }
      const response = await fetchWithAuth(
         `${BASE_URL}/api/leagues/user`,
         options
      );

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Failed to fetch leagues');
      }

      const data = await response.json();
      return data.leagues || [];
   } catch (error) {
      // Don't log error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
         throw error;
      }
      console.error('Error fetching user leagues:', error);
      throw error;
   }
}

/**
 * Factory function to create LeagueService instance
 */
export const createLeagueService = (
   fetchWithAuth: (url: string, options: RequestInit) => Promise<Response>
) => {
   return new LeagueService(fetchWithAuth);
};
