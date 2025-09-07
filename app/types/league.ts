/**
 * League related types
 */

import { LeagueMember } from "./player";

export interface League {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  settings: LeagueSettings;
}

export interface LeagueData extends League {
  members: LeagueMember[];
  memberCount: number;
  activeGames: number;
  totalGames: number;
}

export interface LeagueSettings {
  defaultBuyIn: number;
  allowedBuyIns: number[];
  maxPlayers: number;
  minPlayers: number;
  isPrivate: boolean;
  requireApproval: boolean;
}

export interface LeagueStats {
  leagueId: string;
  totalGames: number;
  totalPlayers: number;
  totalBuyIns: number;
  totalPayouts: number;
  averageGameDuration: number;
  mostActivePlayer: string;
  biggestWin: number;
  biggestLoss: number;
}

export type LeagueStatus = "active" | "inactive" | "archived";
export type LeagueVisibility = "public" | "private" | "invite-only";
