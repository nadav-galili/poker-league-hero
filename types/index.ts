/**
 * Centralized type exports
 */

// Player types
export type {
   LeagueMember,
   Player,
   PlayerRole,
   PlayerSelection,
   PlayerStats,
   PlayerStatus,
} from './player';

// League types
export type {
   League,
   LeagueData,
   LeagueSettings,
   LeagueStats,
   LeagueStatus,
   LeagueVisibility,
} from './league';

// Game types
export type {
   BlindLevel,
   CreateGameRequest,
   CreateGameResponse,
   Game,
   GamePlayer,
   GameSettings,
   GameStats,
   GameStatus,
   GameType,
   PlayerAction,
} from './game';

// API Response types
export interface ApiResponse<T = any> {
   success: boolean;
   data?: T;
   message?: string;
   error?: string;
}

export interface ApiError {
   message: string;
   code?: string;
   status?: number;
   details?: any;
}

// Common UI types
export interface SelectOption {
   label: string;
   value: string;
   disabled?: boolean;
}

export interface LoadingState {
   isLoading: boolean;
   error: string | null;
}

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   limit: number;
   hasMore: boolean;
}
