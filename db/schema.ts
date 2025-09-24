import { relations } from 'drizzle-orm';
import {
   boolean,
   decimal,
   integer,
   pgEnum,
   pgTable,
   text,
   timestamp,
   varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const gameStatusEnum = pgEnum('game_status', ['active', 'completed']);

export const users = pgTable('users', {
   id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
   email: varchar('email', { length: 255 }).notNull().unique(),
   fullName: text('full_name').notNull(),
   firstName: varchar('first_name', { length: 100 }),
   lastName: varchar('last_name', { length: 100 }),
   profileImageUrl: text('profile_image_url'),
   googleId: varchar('google_id', { length: 50 }).unique(),
   provider: varchar('provider', { length: 20 }).notNull().default('google'),
   createdAt: timestamp('created_at').defaultNow().notNull(),
   updatedAt: timestamp('updated_at').defaultNow().notNull(),
   lastLoginAt: timestamp('last_login_at'),
});

export const leagues = pgTable('leagues', {
   id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
   name: varchar('name', { length: 100 }).notNull(),
   imageUrl: text('image_url'),
   inviteCode: varchar('invite_code', { length: 5 }).notNull().unique(), // 5-char unique invite code
   adminUserId: integer('admin_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
   isActive: boolean('is_active').notNull().default(true),
   createdAt: timestamp('created_at').defaultNow().notNull(),
   updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leagueMembers = pgTable('league_members', {
   id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
   leagueId: integer('league_id')
      .notNull()
      .references(() => leagues.id, { onDelete: 'cascade' }),
   userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
   role: varchar('role', { length: 20 }).notNull().default('member'), // "admin", "member", "moderator"
   joinedAt: timestamp('joined_at').defaultNow().notNull(),
   isActive: boolean('is_active').notNull().default(true),
});

// Games table - represents a poker game session
export const games = pgTable('games', {
   id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
   leagueId: integer('league_id')
      .notNull()
      .references(() => leagues.id, { onDelete: 'cascade' }),
   createdBy: integer('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
   buyIn: decimal('buy_in', { precision: 10, scale: 2 }).notNull(), // Buy-in amount
   status: gameStatusEnum('status').notNull().default('active'), // "active", "completed"
   startedAt: timestamp('started_at').defaultNow().notNull(),
   endedAt: timestamp('ended_at'),
   createdAt: timestamp('created_at').defaultNow().notNull(),
   updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Game Players table - tracks which players participate in each game
export const gamePlayers = pgTable('game_players', {
   id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
   gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
   userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
   finalAmount: decimal('final_amount', { precision: 10, scale: 2 }), // Final chip amount when game ends
   profit: decimal('profit', { precision: 10, scale: 2 }), // Total profit/loss (calculated: finalAmount - totalCashIns)
   isActive: boolean('is_active').notNull().default(true),
   joinedAt: timestamp('joined_at').defaultNow().notNull(),
   leftAt: timestamp('left_at'), // When player left the game (if applicable)
});

// Cash Ins table - tracks all buy-ins, rebuys, and add-ons
export const cashIns = pgTable('cash_ins', {
   id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
   gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
   userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
   gamePlayerId: integer('game_player_id')
      .notNull()
      .references(() => gamePlayers.id, { onDelete: 'cascade' }),
   amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // Cash-in amount
   type: varchar('type', { length: 20 }).notNull().default('buy_in'), // "buy_in", "rebuy", "add_on"
   chipCount: integer('chip_count'), // Number of chips received
   notes: text('notes'), // Optional notes about the cash-in
   createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
   leagues: many(leagueMembers),
   adminLeagues: many(leagues),
   createdGames: many(games),
   gamePlayers: many(gamePlayers),
   cashIns: many(cashIns),
}));

export const leaguesRelations = relations(leagues, ({ one, many }) => ({
   admin: one(users, {
      fields: [leagues.adminUserId],
      references: [users.id],
   }),
   members: many(leagueMembers),
   games: many(games),
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

export const gamesRelations = relations(games, ({ one, many }) => ({
   league: one(leagues, {
      fields: [games.leagueId],
      references: [leagues.id],
   }),
   creator: one(users, {
      fields: [games.createdBy],
      references: [users.id],
   }),
   players: many(gamePlayers),
   cashIns: many(cashIns),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;
export type LeagueMember = typeof leagueMembers.$inferSelect;
export type NewLeagueMember = typeof leagueMembers.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayers.$inferInsert;
export type CashIn = typeof cashIns.$inferSelect;
export type NewCashIn = typeof cashIns.$inferInsert;
