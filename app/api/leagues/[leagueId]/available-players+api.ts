import { withAuth } from '@/utils/middleware';

export const GET = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const leagueId = url.pathname.split('/')[3]; // Extract leagueId from /api/leagues/[leagueId]/available-players

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!leagueId) {
         return Response.json(
            { error: 'League ID is required' },
            { status: 400 }
         );
      }

      // Import database modules
      const { getDb, leagueMembers, users } = await import('../../../../db');
      const { eq, and } = await import('drizzle-orm');
      const db = getDb();

      // Fetch all active members of the league
      const members = await db
         .select({
            id: users.id,
            fullName: users.fullName,
            profileImageUrl: users.profileImageUrl,
            role: leagueMembers.role,
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

      return Response.json({
         success: true,
         members,
      });
   } catch (error) {
      console.error('Error fetching league members:', error);
      return Response.json(
         { error: 'Failed to fetch league members' },
         { status: 500 }
      );
   }
});
