import { BASE_URL } from '@/constants';
import { captureException } from '@/utils/sentry';
import { GamePlayer, LeagueMember } from '@/hooks/useGameData';

export interface GameServiceDependencies {
   fetchWithAuth: (url: string, options: any) => Promise<Response>;
   gameId: string;
   t: (key: string) => string;
}

export class GameService {
   constructor(private deps: GameServiceDependencies) {}

   async buyIn(player: GamePlayer, buyInAmount: string): Promise<void> {
      try {
         const response = await this.deps.fetchWithAuth(
            `${BASE_URL}/api/games/${this.deps.gameId}/buy-in`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  playerId: player.userId,
                  amount: buyInAmount,
               }),
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process buy-in');
         }
      } catch (error) {
         captureException(error as Error, {
            function: 'handleBuyIn',
            screen: 'GameScreen',
            gameId: this.deps.gameId,
            playerId: player.userId,
         });
         throw error;
      }
   }

   async cashOut(
      player: GamePlayer,
      amount: string
   ): Promise<{ profit: string }> {
      try {
         const response = await this.deps.fetchWithAuth(
            `${BASE_URL}/api/games/${this.deps.gameId}/buy-out`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  playerId: player.userId,
                  amount: amount,
               }),
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process cash out');
         }

         return await response.json();
      } catch (error) {
         captureException(error as Error, {
            function: 'processCashOut',
            screen: 'GameScreen',
            gameId: this.deps.gameId,
            playerId: player.userId,
         });
         throw error;
      }
   }

   async addPlayer(member: LeagueMember, buyInAmount: string): Promise<void> {
      try {
         const response = await this.deps.fetchWithAuth(
            `${BASE_URL}/api/games/${this.deps.gameId}/add-player`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  playerId: member.id,
                  buyInAmount: buyInAmount,
               }),
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add player');
         }
      } catch (error) {
         captureException(error as Error, {
            function: 'handleAddPlayer',
            screen: 'GameScreen',
            gameId: this.deps.gameId,
            playerId: member.id,
         });
         throw error;
      }
   }

   async removePlayer(player: GamePlayer): Promise<void> {
      try {
         const response = await this.deps.fetchWithAuth(
            `${BASE_URL}/api/games/${this.deps.gameId}/remove-player`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  playerId: player.userId,
               }),
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove player');
         }
      } catch (error) {
         captureException(error as Error, {
            function: 'removePlayer',
            screen: 'GameScreen',
            gameId: this.deps.gameId,
            playerId: player.userId,
         });
         throw error;
      }
   }

   async endGame(): Promise<void> {
      try {
         const response = await this.deps.fetchWithAuth(
            `${BASE_URL}/api/games/${this.deps.gameId}/end-game`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
            }
         );

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to end game');
         }
      } catch (error) {
         captureException(error as Error, {
            function: 'handleEndGame',
            screen: 'GameScreen',
            gameId: this.deps.gameId,
         });
         throw error;
      }
   }
}
