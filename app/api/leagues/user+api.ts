import { getUserLeagues } from '../../../utils/leagueUtils';
import { withAuth } from '../../../utils/middleware';

export const GET = withAuth(async (request: Request, user) => {
   try {
      if (!user.userId) {
         return Response.json(
            { error: 'User ID not found in token' },
            { status: 400 }
         );
      }

      const userLeagues = await getUserLeagues(user.userId);

      return Response.json({
         leagues: userLeagues,
         count: userLeagues.length,
      });
   } catch (error) {
      console.error('Error fetching user leagues:', error);
      return Response.json(
         { error: 'Failed to fetch user leagues' },
         { status: 500 }
      );
   }
});
