import { and, eq } from "drizzle-orm";
import { leagueMembers, users } from "../db";
/**
 * Generate a secure, unique 5-character invite code
 * Uses alphanumeric characters, excluding confusing characters (0, O, 1, I, l)
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if an invite code is available (not already used)
 */
export async function isInviteCodeAvailable(
  inviteCode: string
): Promise<boolean> {
  const { getDb, leagues } = await import("../db");
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
        "Failed to generate unique invite code after multiple attempts"
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
  const { getDb, leagues } = await import("../db");
  const db = getDb();
  ///gete user id from email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, data.adminUserEmail));
  if (!user) {
    throw new Error("User not found");
  }
  const userId = user[0].id;
  let imageUrl = data.image;
  if (imageUrl && imageUrl.startsWith("file://")) {
    // Upload to Cloudflare R2 first using server-side upload
    const { uploadImageToR2Server } = await import("./serverUpload");
    const uploadedUrl = await uploadImageToR2Server(imageUrl);
    imageUrl = uploadedUrl;
  } else if (!imageUrl) {
    imageUrl = "default-league.png";
  }
  data.image = imageUrl;
  const inviteCode = await generateUniqueInviteCode();

  const leagueData = {
    ...data,
    adminUserId: userId,
    inviteCode,
    imageUrl, // Use the uploaded URL
  };

  const result = await db.insert(leagues).values(leagueData).returning();
  //add user to league_members
  await db
    .insert(leagueMembers)
    .values({
      leagueId: result[0].id,
      userId,
      role: "admin",
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
  userId: string
): Promise<any> {
  const { getDb, leagues, leagueMembers } = await import("../db");
  const { eq, and } = await import("drizzle-orm");
  const db = getDb();

  // Find the league by invite code
  const league = await db
    .select()
    .from(leagues)
    .where(eq(leagues.inviteCode, inviteCode))
    .limit(1);

  if (league.length === 0) {
    throw new Error("Invalid invite code");
  }

  if (!league[0].isActive) {
    throw new Error("League is not active");
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
    throw new Error("User is already a member of this league");
  }

  // Add user to league
  const result = await db
    .insert(leagueMembers)
    .values({
      leagueId: league[0].id,
      userId,
      role: "member",
    })
    .returning();

  return result[0];
}

/**
 * Get all leagues for a user
 */
export async function getUserLeagues(userId: string): Promise<any[]> {
  const { getDb, leagueMembers, leagues } = await import("../db");
  const { eq, count } = await import("drizzle-orm");
  const db = getDb();

  const userLeagues = await db
    .select({
      league: leagues,
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

  // Get member count for each league and format the data
  const formattedLeagues = await Promise.all(
    userLeagues.map(async (item: any) => {
      // Get member count for this league
      const memberCountResult = await db
        .select({ count: count() })
        .from(leagueMembers)
        .where(
          and(
            eq(leagueMembers.leagueId, item.league.id),
            eq(leagueMembers.isActive, true)
          )
        );

      const memberCount = memberCountResult[0]?.count || 0;

      // Format the image URL
      let imageUrl = item.league.imageUrl;
      if (imageUrl && !imageUrl.startsWith("http")) {
        // If it's a relative path, construct the full R2 URL using actual domain
        if (imageUrl.includes("/")) {
          // Already has path structure (like "league-images/filename.jpg")
          imageUrl = `https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/poker-league-images/${imageUrl}`;
        } else {
          // Just filename, add the league-images path
          imageUrl = `https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/poker-league-images/league-images/${imageUrl}`;
        }
      } else if (imageUrl && imageUrl.includes("poker-league-images.r2.dev")) {
        // Fix old URLs that use the custom domain to use the actual R2 domain
        imageUrl = imageUrl.replace(
          "https://poker-league-images.r2.dev",
          "https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/poker-league-images"
        );
      } else if (
        imageUrl &&
        imageUrl.includes("pub-6908906fe4c24b7b82ff61e803190c28.r2.dev") &&
        !imageUrl.includes("poker-league-images")
      ) {
        // Fix URLs that are missing the poker-league-images prefix
        imageUrl = imageUrl.replace(
          "https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/",
          "https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/poker-league-images/"
        );
      }

      return {
        id: item.league.id,
        name: item.league.name,
        code: item.league.inviteCode,
        image: imageUrl,
        memberCount,
        status: item.league.isActive ? "active" : "inactive",
        role: item.memberRole,
        joinedAt: item.joinedAt,
      };
    })
  );

  return formattedLeagues;
}

/**
 * Get league details with members
 */
export async function getLeagueDetails(leagueId: string): Promise<any> {
  const { getDb, leagues, leagueMembers, users } = await import("../db");
  const { eq } = await import("drizzle-orm");
  const db = getDb();

  const league = await db
    .select()
    .from(leagues)
    .where(eq(leagues.id, leagueId))
    .limit(1);

  if (league.length === 0) {
    throw new Error("League not found");
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
        eq(leagueMembers.leagueId, leagueId),
        eq(leagueMembers.isActive, true)
      )
    );

  return {
    ...league[0],
    members,
  };
}
