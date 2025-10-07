import { relations } from 'drizzle-orm/relations';
import {
   leagues,
   summaries,
   games,
   gamePlayers,
   users,
   leagueMembers,
   cashIns,
} from './schema';

export const summariesRelations = relations(summaries, ({ one }) => ({
   league: one(leagues, {
      fields: [summaries.leagueId],
      references: [leagues.id],
   }),
}));

export const leaguesRelations = relations(leagues, ({ one, many }) => ({
   summaries: many(summaries),
   leagueMembers: many(leagueMembers),
   games: many(games),
   user: one(users, {
      fields: [leagues.adminUserId],
      references: [users.id],
   }),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one, many }) => ({
   game: one(games, {
      fields: [gamePlayers.gameId],
      references: [games.id],
   }),
   user: one(users, {
      fields: [gamePlayers.userId],
      references: [users.id],
   }),
   cashIns: many(cashIns),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
   gamePlayers: many(gamePlayers),
   league: one(leagues, {
      fields: [games.leagueId],
      references: [leagues.id],
   }),
   user: one(users, {
      fields: [games.createdBy],
      references: [users.id],
   }),
   cashIns: many(cashIns),
}));

export const usersRelations = relations(users, ({ many }) => ({
   gamePlayers: many(gamePlayers),
   leagueMembers: many(leagueMembers),
   games: many(games),
   leagues: many(leagues),
   cashIns: many(cashIns),
}));

export const leagueMembersRelations = relations(leagueMembers, ({ one }) => ({
   league: one(leagues, {
      fields: [leagueMembers.leagueId],
      references: [leagues.id],
   }),
   user: one(users, {
      fields: [leagueMembers.userId],
      references: [users.id],
   }),
}));

export const cashInsRelations = relations(cashIns, ({ one }) => ({
   game: one(games, {
      fields: [cashIns.gameId],
      references: [games.id],
   }),
   user: one(users, {
      fields: [cashIns.userId],
      references: [users.id],
   }),
   gamePlayer: one(gamePlayers, {
      fields: [cashIns.gamePlayerId],
      references: [gamePlayers.id],
   }),
}));
