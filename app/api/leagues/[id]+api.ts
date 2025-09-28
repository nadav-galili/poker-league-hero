import { getLeagueDetails } from '../../../services/leagueUtils';

export async function GET(request: Request) {
   try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop(); // Extract ID from path

      if (!id) {
         return Response.json(
            { success: false, message: 'League ID is required' },
            { status: 400 }
         );
      }

      const league = await getLeagueDetails(id);

      // Image URL is already in correct format from database
      const imageUrl = league.imageUrl;

      // Format members to flatten the structure
      const formattedMembers =
         league.members?.map((member: any) => ({
            id: member.user.id,
            fullName: member.user.fullName,
            profileImageUrl: member.user.profileImageUrl,
            role: member.memberRole,
            joinedAt: member.joinedAt,
         })) || [];

      const formattedLeague = {
         id: league.id,
         name: league.name,
         imageUrl,
         inviteCode: league.inviteCode,
         memberCount: formattedMembers.length,
         isActive: league.isActive,
         createdAt: league.createdAt,
         members: formattedMembers,
      };

      return Response.json({
         success: true,
         league: formattedLeague,
         message: 'League details retrieved successfully',
      });
   } catch (error) {
      console.error('Error fetching league details:', error);

      if (error instanceof Error && error.message === 'League not found') {
         return Response.json(
            { success: false, message: 'League not found' },
            { status: 404 }
         );
      }

      return Response.json(
         { success: false, message: 'Failed to fetch league details' },
         { status: 500 }
      );
   }
}
