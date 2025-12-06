// Generic player stat interface
export interface PlayerStat {
   userId: number;
   fullName: string;
   profileImageUrl: string | null;
   value: number | string;
   additionalData?: Record<string, any>;
}

export interface StatResponse {
   type: string;
   year: number;
   data: PlayerStat | null;
   message?: string;
}

export interface RankingsResponse {
   type: string;
   year: number;
   data: PlayerStat[];
   topPlayer: PlayerStat | null;
   message?: string;
}

// Available stat types
export type StatType =
   | 'top-profit-player'
   | 'most-active-player'
   | 'highest-single-game-profit'
   | 'biggest-loser';

// Legacy interface for backward compatibility
export interface TopProfitPlayer {
   userId: number;
   fullName: string;
   profileImageUrl: string | null;
   totalProfit: number | string;
   gamesPlayed: number;
   year: number;
}

export interface TopProfitPlayerResponse {
   data: TopProfitPlayer | null;
   message?: string;
}

export class LeagueStatsService {
   constructor(
      private fetchWithAuth: (
         url: string,
         options: RequestInit
      ) => Promise<Response>
   ) {}

   // Generic method to get any stat type
   async getPlayerStat(
      leagueId: string,
      statType: StatType,
      year?: number
   ): Promise<StatResponse> {
      try {
         const params = new URLSearchParams([['type', statType]]);

         if (year) params.append('year', year.toString());

         const url = `/api/leagues/${leagueId}/stats?${params.toString()}`;

         const response = await this.fetchWithAuth(url, {});

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const result = await response.json();

         return result;
      } catch (error) {
         console.error(`Error fetching ${statType} stat:`, error);
         throw error;
      }
   }

   // Convenience methods for specific stats
   async getTopProfitPlayer(
      leagueId: string,
      year?: number
   ): Promise<TopProfitPlayerResponse> {
      try {
         const response = await this.getPlayerStat(
            leagueId,
            'top-profit-player',
            year
         );

         // Transform to legacy format for backward compatibility
         if (response.data) {
            const legacyData: TopProfitPlayer = {
               userId: response.data.userId,
               fullName: response.data.fullName,
               profileImageUrl: response.data.profileImageUrl,
               totalProfit: response.data.value,
               gamesPlayed: response.data.additionalData?.gamesPlayed || 0,
               year: response.year,
            };
            return { data: legacyData, message: response.message };
         }

         return { data: null, message: response.message };
      } catch (error) {
         console.error('Error fetching top profit player:', error);
         throw error;
      }
   }

   async getMostActivePlayer(
      leagueId: string,
      year?: number
   ): Promise<StatResponse> {
      return this.getPlayerStat(leagueId, 'most-active-player', year);
   }

   async getHighestSingleGameProfit(
      leagueId: string,
      year?: number
   ): Promise<StatResponse> {
      return this.getPlayerStat(leagueId, 'highest-single-game-profit', year);
   }

   async getBiggestLoser(
      leagueId: string,
      year?: number
   ): Promise<StatResponse> {
      return this.getPlayerStat(leagueId, 'biggest-loser', year);
   }

   // Get full rankings for a stat type
   async getRankings(
      leagueId: string,
      statType: StatType,
      year?: number
   ): Promise<RankingsResponse> {
      try {
         const params = new URLSearchParams([['type', statType]]);

         if (year) params.append('year', year.toString());

         const url = `/api/leagues/${leagueId}/stats/rankings?${params.toString()}`;

         const response = await this.fetchWithAuth(url, {});

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const result = await response.json();

         return result;
      } catch (error) {
         console.error(`Error fetching ${statType} rankings:`, error);
         throw error;
      }
   }
}

// Factory function to create service instance
export const createLeagueStatsService = (
   fetchWithAuth: (url: string, options: RequestInit) => Promise<Response>
) => new LeagueStatsService(fetchWithAuth);
