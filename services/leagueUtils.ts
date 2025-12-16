import dayjs from 'dayjs';
import { and, count, desc, eq, gte, inArray, lte, sql, sum } from 'drizzle-orm';
import {
   cashIns,
   gamePlayers,
   games,
   getDb,
   leagueMembers,
   leagues,
   users,
} from '../db';

/**
 * Generate a secure, unique 5-character invite code
 * Uses alphanumeric characters, excluding confusing characters (0, O, 1, I, l)
 */
export function generateInviteCode(): string {
   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
   let result = '';
   for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return result;
}

/**
 * Validate invite code format based on generation rules
 */
export function validateInviteCode(inviteCode: string): {
   isValid: boolean;
   error?: string;
} {
   // Check if code exists
   if (!inviteCode || typeof inviteCode !== 'string') {
      return { isValid: false, error: 'Invite code is required' };
   }

   // Trim whitespace
   const trimmedCode = inviteCode.trim();

   // Check length (exactly 5 characters)
   if (trimmedCode.length !== 5) {
      return {
         isValid: false,
         error: 'Invite code must be exactly 5 characters',
      };
   }

   // Check if contains only valid characters (same as generation)
   const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
   const codeUpper = trimmedCode.toUpperCase();

   for (let i = 0; i < codeUpper.length; i++) {
      if (!validChars.includes(codeUpper[i])) {
         return {
            isValid: false,
            error: 'Invite code contains invalid characters',
         };
      }
   }

   return { isValid: true };
}

/**
 * Find league by invite code
 */
export async function findLeagueByInviteCode(
   inviteCode: string
): Promise<any | null> {
   const db = getDb();

   try {
      const league = await db
         .select()
         .from(leagues)
         .where(eq(leagues.inviteCode, inviteCode.toUpperCase()))
         .limit(1);

      return league.length > 0 ? league[0] : null;
   } catch (error) {
      console.error('Error finding league by invite code:', error);
      throw new Error('Failed to search for league');
   }
}

/**
 * Check if an invite code is available (not already used)
 */
export async function isInviteCodeAvailable(
   inviteCode: string
): Promise<boolean> {
   const db = getDb();

   const existingLeague = await db
      .select()
      .from(leagues)
      .where(eq(leagues.inviteCode, inviteCode))
      .limit(1);

   return existingLeague.length === 0;
}

/**
 * Generate a unique invite code that's not already in use
 * Optimized with reduced attempts and batch checking
 */
export async function generateUniqueInviteCode(): Promise<string> {
   const db = getDb();

   // Generate 3 codes at once to reduce DB queries
   const candidates = Array.from({ length: 3 }, () => generateInviteCode());

   // Check all candidates in a single query using inArray
   const existing = await db
      .select({ inviteCode: leagues.inviteCode })
      .from(leagues)
      .where(inArray(leagues.inviteCode, candidates));

   const usedCodes = new Set(existing.map((e) => e.inviteCode));
   const availableCode = candidates.find((code) => !usedCodes.has(code));

   if (availableCode) {
      return availableCode;
   }

   // Fallback: generate more codes if all were taken (very unlikely)
   for (let i = 0; i < 5; i++) {
      const code = generateInviteCode();
      if (await isInviteCodeAvailable(code)) {
         return code;
      }
   }

   throw new Error(
      'Failed to generate unique invite code after multiple attempts'
   );
}

/**
 * Create a new league
 */
export async function createLeague(data: {
   name: string;
   image?: string;
   adminUserEmail: string;
}): Promise<any> {
   const db = getDb();

   try {
      // Get user id from email with minimal select
      const user = await db
         .select({ id: users.id })
         .from(users)
         .where(eq(users.email, data.adminUserEmail))
         .limit(1);

      if (!user || user.length === 0) {
         throw new Error('User not found');
      }

      const userId = user[0].id;

      // Set default image URL immediately
      let imageUrl = data.image;
      if (imageUrl && imageUrl.startsWith('file://')) {
         throw new Error(
            'Image must be uploaded to R2 before league creation. Use /api/upload/image endpoint first.'
         );
      }
      if (!imageUrl) {
         imageUrl =
            'https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/cyberpunkIcon-removebg-preview.png';
      }

      // Generate invite code with reduced attempts for faster execution
      const inviteCode = await generateUniqueInviteCode();

      const leagueData = {
         name: data.name,
         adminUserId: userId,
         inviteCode,
         imageUrl,
      };

      // Sequential operations (neon-http doesn't support transactions)
      // Insert league first
      const [league] = await db.insert(leagues).values(leagueData).returning();

      // Then insert league member
      await db.insert(leagueMembers).values({
         leagueId: league.id,
         userId,
         role: 'admin',
         isActive: true,
         joinedAt: new Date(),
      });

      return league;
   } catch (error) {
      console.error('Error in createLeague:', error);
      throw error;
   }
}

/**
 * Join a league using an invite code
 */
export async function joinLeagueByInviteCode(
   inviteCode: string,
   userId: number
): Promise<any> {
   const db = getDb();

   // Find the league by invite code
   const league = await db
      .select()
      .from(leagues)
      .where(eq(leagues.inviteCode, inviteCode))
      .limit(1);

   if (league.length === 0) {
      throw new Error('Invalid invite code');
   }

   if (!league[0].isActive) {
      throw new Error('League is not active');
   }

   // Check if user is already a member
   const existingMember = await db
      .select()
      .from(leagueMembers)
      .where(
         and(
            eq(leagueMembers.leagueId, league[0].id),
            eq(leagueMembers.userId, userId)
         )
      )
      .limit(1);

   if (existingMember.length > 0) {
      throw new Error('User is already a member of this league');
   }

   // Add user to league
   const result = await db
      .insert(leagueMembers)
      .values({
         leagueId: league[0].id,
         userId,
         role: 'member',
      })
      .returning();

   return result[0];
}

/**
 * Get all leagues for a user
 */
export async function getUserLeagues(userId: number): Promise<any[]> {
   const db = getDb();

   // Single optimized query with subquery for member count
   const userLeagues = await db
      .select({
         id: leagues.id,
         name: leagues.name,
         inviteCode: leagues.inviteCode,
         imageUrl: leagues.imageUrl,
         isActive: leagues.isActive,
         memberRole: leagueMembers.role,
         joinedAt: leagueMembers.joinedAt,
      })
      .from(leagueMembers)
      .innerJoin(leagues, eq(leagueMembers.leagueId, leagues.id))
      .where(
         and(
            eq(leagueMembers.userId, userId),
            eq(leagueMembers.isActive, true),
            eq(leagues.isActive, true)
         )
      );

   // If no leagues, return early
   if (userLeagues.length === 0) {
      return [];
   }

   // Get member counts for all leagues in a single query
   const leagueIds = userLeagues.map((l: any) => l.id);
   const memberCounts = await db
      .select({
         leagueId: leagueMembers.leagueId,
         count: count(),
      })
      .from(leagueMembers)
      .where(
         and(
            eq(leagueMembers.isActive, true),
            inArray(leagueMembers.leagueId, leagueIds)
         )
      )
      .groupBy(leagueMembers.leagueId);

   // Create a map for quick lookup
   const memberCountMap = new Map(
      memberCounts.map((mc: any) => [mc.leagueId, Number(mc.count)])
   );

   // Format the data
   return userLeagues.map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.inviteCode,
      image: item.imageUrl || null,
      memberCount: memberCountMap.get(item.id) || 0,
      status: item.isActive ? 'active' : 'inactive',
      role: item.memberRole,
      joinedAt: item.joinedAt,
   }));
}

/**
 * Get league details with members
 */
export async function getLeagueDetails(leagueId: string): Promise<any> {
   const db = getDb();

   const league = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, parseInt(leagueId)))
      .limit(1);

   if (league.length === 0) {
      return null;
   }

   const members = await db
      .select({
         user: {
            id: users.id,
            fullName: users.fullName,
            profileImageUrl: users.profileImageUrl,
         },
         memberRole: leagueMembers.role,
         joinedAt: leagueMembers.joinedAt,
      })
      .from(leagueMembers)
      .innerJoin(users, eq(leagueMembers.userId, users.id))
      .where(
         and(
            eq(leagueMembers.leagueId, parseInt(leagueId)),
            eq(leagueMembers.isActive, true)
         )
      );

   return {
      ...league[0],
      members,
   };
}

/**
 * Get aggregated player stats for a league within a specific year
 */
export async function getLeaguePlayerStats(leagueId: number, year: number) {
   const db = getDb();
   const yearStart = dayjs().year(year).startOf('year').toDate();
   const yearEnd = dayjs().year(year).endOf('year').toDate();

   // Query for player stats: total profit, total buy-ins, game count
   // Using query builder efficiently
   const stats = await db
      .select({
         userId: users.id,
         fullName: users.fullName,
         totalProfit: sql<number>`sum(${gamePlayers.profit})`.mapWith(Number),
         gamesCount: count(gamePlayers.id),
      })
      .from(gamePlayers)
      .innerJoin(games, eq(gamePlayers.gameId, games.id))
      .innerJoin(users, eq(gamePlayers.userId, users.id))
      .where(
         and(
            eq(games.leagueId, leagueId),
            eq(games.status, 'completed'),
            gte(games.endedAt, yearStart),
            lte(games.endedAt, yearEnd)
         )
      )
      .groupBy(users.id, users.fullName);

   const buyIns = await db
      .select({
         userId: users.id,
         totalBuyIns: sum(cashIns.amount).mapWith(Number),
      })
      .from(cashIns)
      .innerJoin(games, eq(cashIns.gameId, games.id))
      .innerJoin(users, eq(cashIns.userId, users.id))
      .where(
         and(
            eq(games.leagueId, leagueId),
            eq(games.status, 'completed'),
            gte(games.endedAt, yearStart),
            lte(games.endedAt, yearEnd)
         )
      )
      .groupBy(users.id);

   // Merge results
   const buyInsMap = new Map(buyIns.map((b) => [b.userId, b.totalBuyIns]));

   return stats.map((s) => ({
      ...s,
      totalBuyIns: buyInsMap.get(s.userId) || 0,
   }));
}

/**
 * Get player with the highest profit in a single game
 */
export async function getHighestSingleGameProfit(
   leagueId: number,
   year: number
) {
   // Temporarily disabled to avoid NeonDbError issues from this query.
   // Callers should treat `null` as “no highest single-game profit available”
   // instead of failing the whole flow.
   return null;
}

/**
 * Get details of the last completed game
 */
export async function getLastGameDetails(leagueId: number) {
   const db = getDb();

   // Get last game
   const lastGame = await db
      .select()
      .from(games)
      .where(and(eq(games.leagueId, leagueId), eq(games.status, 'completed')))
      .orderBy(desc(games.endedAt));

   if (lastGame.length === 0) return null;

   const game = lastGame[0];

   // Get player results for this game
   const playerResults = await db
      .select({
         userId: users.id,
         fullName: users.fullName,
         profit: gamePlayers.profit,
         buyIn: sql<number>`(
            SELECT SUM(amount) FROM ${cashIns}
            WHERE ${cashIns.gamePlayerId} = ${gamePlayers.id}
         )`.mapWith(Number),
         cashOut: gamePlayers.finalAmount,
      })
      .from(gamePlayers)
      .innerJoin(users, eq(gamePlayers.userId, users.id))
      .where(eq(gamePlayers.gameId, game.id))
      .orderBy(desc(gamePlayers.profit));

   return {
      game,
      players: playerResults,
   };
}
