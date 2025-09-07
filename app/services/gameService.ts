/**
 * Game Service - Handles all game-related API operations
 */

import {
  CreateGameRequest,
  CreateGameResponse,
  Game,
  GameStats,
} from "@/app/types";
import { BASE_URL } from "@/constants";

export class GameService {
  constructor(
    private fetchWithAuth: (
      url: string,
      options: RequestInit
    ) => Promise<Response>
  ) {}

  /**
   * Create a new game with selected players
   */
  async createGame(request: CreateGameRequest): Promise<CreateGameResponse> {
    const response = await this.fetchWithAuth(`${BASE_URL}/api/games/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create game");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to create game");
    }

    return {
      success: true,
      gameId: data.gameId,
      message: data.message,
      game: data.game,
    };
  }

  /**
   * Get game details by ID
   */
  async getGame(gameId: string): Promise<Game> {
    const response = await this.fetchWithAuth(
      `${BASE_URL}/api/games/${gameId}`,
      {}
    );

    if (!response.ok) {
      throw new Error("Failed to fetch game details");
    }

    const data = await response.json();

    if (!data.success || !data.game) {
      throw new Error(data.message || "Failed to load game details");
    }

    return data.game;
  }

  /**
   * Get games for a specific league
   */
  async getLeagueGames(
    leagueId: string,
    page = 1,
    limit = 20
  ): Promise<{
    games: Game[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await this.fetchWithAuth(
      `${BASE_URL}/api/leagues/${leagueId}/games?page=${page}&limit=${limit}`,
      {}
    );

    if (!response.ok) {
      throw new Error("Failed to fetch league games");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load league games");
    }

    return {
      games: data.games || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
    };
  }

  /**
   * Update game status
   */
  async updateGameStatus(gameId: string, status: string): Promise<void> {
    const response = await this.fetchWithAuth(
      `${BASE_URL}/api/games/${gameId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update game status");
    }
  }

  /**
   * Get game statistics
   */
  async getGameStats(gameId: string): Promise<GameStats> {
    const response = await this.fetchWithAuth(
      `${BASE_URL}/api/games/${gameId}/stats`,
      {}
    );

    if (!response.ok) {
      throw new Error("Failed to fetch game statistics");
    }

    const data = await response.json();

    if (!data.success || !data.stats) {
      throw new Error(data.message || "Failed to load game statistics");
    }

    return data.stats;
  }
}

/**
 * Factory function to create GameService instance
 */
export const createGameService = (
  fetchWithAuth: (url: string, options: RequestInit) => Promise<Response>
) => {
  return new GameService(fetchWithAuth);
};
