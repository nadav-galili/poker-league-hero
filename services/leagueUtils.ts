import { and, count, eq, inArray } from 'drizzle-orm';
import { getDb, leagueMembers, leagues, users } from '../db';

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
 */
export async function generateUniqueInviteCode(): Promise<string> {
   let inviteCode: string;
   let attempts = 0;
   const maxAttempts = 10;

   do {
      inviteCode = generateInviteCode();
      attempts++;

      if (attempts > maxAttempts) {
         throw new Error(
            'Failed to generate unique invite code after multiple attempts'
         );
      }
   } while (!(await isInviteCodeAvailable(inviteCode)));

   return inviteCode;
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

   // Get user id from email
   const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.adminUserEmail));

   console.log('User lookup result:', user);

   if (!user || user.length === 0) {
      throw new Error('User not found');
   }
   const userId = user[0].id;
   let imageUrl = data.image;

   // Note: If imageUrl starts with 'file://', it means the client didn't upload the image first.
   // The client must upload via /api/upload/image before creating the league.
   if (imageUrl && imageUrl.startsWith('file://')) {
      throw new Error(
         'Image must be uploaded to R2 before league creation. Use /api/upload/image endpoint first.'
      );
   }

   if (!imageUrl) {
      imageUrl = 'https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/icon.png';
   }

   data.image = imageUrl;
   const inviteCode = await generateUniqueInviteCode();

   const leagueData = {
      ...data,
      adminUserId: userId,
      inviteCode,
      imageUrl: imageUrl || undefined, // Use the uploaded URL
   };

   const result = await db.insert(leagues).values(leagueData).returning();
   //add user to league_members
   await db
      .insert(leagueMembers)
      .values({
         leagueId: result[0].id,
         userId,
         role: 'admin',
         isActive: true,
         joinedAt: new Date(),
      })
      .returning();

   return result[0];
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
