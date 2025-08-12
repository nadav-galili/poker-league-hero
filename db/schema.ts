import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: text("full_name").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: text("profile_image_url"),
  googleId: varchar("google_id", { length: 50 }).unique(),
  provider: varchar("provider", { length: 20 }).notNull().default("google"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const leagues = pgTable("leagues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  inviteCode: varchar("invite_code", { length: 5 }).notNull().unique(), // 5-char unique invite code
  adminUserId: uuid("admin_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leagueMembers = pgTable("league_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  leagueId: uuid("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"), // "admin", "member", "moderator"
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leagues: many(leagueMembers),
  adminLeagues: many(leagues),
}));

export const leaguesRelations = relations(leagues, ({ one, many }) => ({
  admin: one(users, {
    fields: [leagues.adminUserId],
    references: [users.id],
  }),
  members: many(leagueMembers),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;
export type LeagueMember = typeof leagueMembers.$inferSelect;
export type NewLeagueMember = typeof leagueMembers.$inferInsert;
