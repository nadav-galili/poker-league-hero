import { withAuth } from '@/utils/middleware';
import { and, desc, eq } from 'drizzle-orm';

export const GET = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const leagueId = url.pathname.split('/').pop();
      if (!leagueId) {
         return Response.json(
            { success: false, message: 'League ID is required' },
            { status: 400 }
         );
      }

      if (!user.userId) {
         return Response.json(
            { success: false, message: 'User not authenticated' },
            { status: 401 }
         );
      }

      // Import database modules
      const { getDb, games, leagueMembers } = await import('../../../../db');
      const db = getDb();

      // Check if user is a member of the league
      const membership = await db
         .select()
         .from(leagueMembers)
         .where(
            and(
               eq(leagueMembers.leagueId, parseInt(leagueId)),
               eq(leagueMembers.userId, user.userId),
               eq(leagueMembers.isActive, true)
            )
         )
         .limit(1);

      if (membership.length === 0) {
         return Response.json(
            { success: false, message: 'User is not a member of this league' },
            { status: 403 }
         );
      }

      // Find active game for this league
      const activeGame = await db
         .select()
         .from(games)
         .where(
            and(
               eq(games.leagueId, parseInt(leagueId)),
               eq(games.status, 'active')
            )
         )
         .orderBy(desc(games.createdAt))
         .limit(1);

      if (activeGame.length === 0) {
         return Response.json({
            success: true,
            game: null,
            message: 'No active game found',
         });
      }

      return Response.json({
         success: true,
         game: activeGame[0],
         message: 'Active game found',
      });
   } catch (error) {
      console.error('Error checking for active game:', error);
      return Response.json(
         {
            success: false,
            message: 'Failed to check for active game',
         },
         { status: 500 }
      );
   }
});
