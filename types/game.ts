/**
 * Game related types
 */

import { Player } from './player';

export interface Game {
   id: string;
   leagueId: string;
   name?: string;
   buyIn: number;
   status: GameStatus;
   createdAt: string;
   startedAt?: string;
   endedAt?: string;
   createdBy: string;
   players: GamePlayer[];
   settings: GameSettings;
}

export interface GamePlayer {
   id: string;
   gameId: string;
   playerId: string;
   player: Player;
   buyIn: number;
   currentChips: number;
   position?: number;
   cashOutAmount?: number;
   cashOutAt?: string;
   isActive: boolean;
   joinedAt: string;
}

export interface GameSettings {
   blindStructure: BlindLevel[];
   startingChips: number;
   blindIncrement: number; // minutes
   allowRebuys: boolean;
   rebuyPeriod: number; // minutes
   maxRebuys: number;
}

export interface BlindLevel {
   level: number;
   smallBlind: number;
   bigBlind: number;
   ante?: number;
   duration: number; // minutes
}

export interface CreateGameRequest {
   leagueId: string;
   selectedPlayerIds: number[];
   buyIn: string;
   name?: string;
   settings?: Partial<GameSettings>;
}

export interface CreateGameResponse {
   success: boolean;
   gameId: string;
   message?: string;
   game?: Game;
}

export interface GameStats {
   gameId: string;
   duration: number; // minutes
   totalBuyIns: number;
   totalPayouts: number;
   playerCount: number;
   rebuyCount: number;
   averageChipStack: number;
}

export type GameStatus = 'active' | 'completed';
export type GameType = 'tournament' | 'cash' | 'sit-n-go';
export type PlayerAction =
   | 'fold'
   | 'call'
   | 'raise'
   | 'check'
   | 'all-in'
   | 'cash-out';
