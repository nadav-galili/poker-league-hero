/**
 * Player and League Member related types
 */

export interface Player {
  id: string;
  fullName: string;
  profileImageUrl?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeagueMember extends Player {
  role: "admin" | "member";
  joinedAt: string;
  leagueId: string;
}

export interface PlayerStats {
  playerId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalBuyIn: number;
  totalWinnings: number;
  netProfit: number;
  averageBuyIn: number;
  winRate: number;
}

export interface PlayerSelection {
  playerId: string;
  isSelected: boolean;
  selectedAt?: string;
}

export type PlayerRole = "admin" | "member";
export type PlayerStatus = "active" | "inactive" | "suspended";
