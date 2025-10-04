import { getLeagueDetails } from '../../../services/leagueUtils';
import { withAuth } from '../../../utils/middleware';
import {
   withRateLimit,
   validateRequestSecurity,
   secureResponse,
} from '../../../utils/rateLimiting';
import { validateDatabaseId, sanitizeString } from '../../../utils/validation';
import {
   checkLeagueAccess,
   extractLeagueId,
} from '../../../utils/authorization';

export const GET = withAuth(
   withRateLimit(async (request: Request, user) => {
      try {
         // Validate request security
         const securityCheck = validateRequestSecurity(request);
         if (!securityCheck.valid) {
            return secureResponse(
               { error: securityCheck.error },
               { status: 400 }
            );
         }

         // Validate user authentication
         if (!user.userId) {
            return secureResponse(
               { error: 'User authentication required' },
               { status: 401 }
            );
         }

         // Extract and validate league ID
         const { leagueId, error: idError } = extractLeagueId(request.url);
         if (idError || !leagueId) {
            return secureResponse(
               { error: idError || 'League ID is required' },
               { status: 400 }
            );
         }

         // Validate database ID format
         const validatedId = validateDatabaseId(leagueId);
         if (!validatedId) {
            return secureResponse(
               { error: 'Invalid league ID format' },
               { status: 400 }
            );
         }

         // Check league access authorization
         const authResult = await checkLeagueAccess({
            user,
            leagueId: validatedId,
            requiredRole: 'member',
         });

         if (!authResult.authorized) {
            return secureResponse(
               { error: authResult.error || 'Access denied' },
               { status: 403 }
            );
         }

         // Get league details
         const league = await getLeagueDetails(validatedId.toString());

         // Sanitize and format league data
         const formattedMembers =
            league.members?.map((member: any) => ({
               id: member.user.id,
               fullName: sanitizeString(member.user.fullName || ''),
               profileImageUrl: member.user.profileImageUrl || null,
               role: member.memberRole,
               joinedAt: member.joinedAt,
            })) || [];

         const formattedLeague = {
            id: league.id,
            name: sanitizeString(league.name),
            imageUrl: league.imageUrl || null,
            inviteCode: league.inviteCode,
            memberCount: formattedMembers.length,
            isActive: league.isActive,
            createdAt: league.createdAt,
            members: formattedMembers,
         };

         return secureResponse({
            success: true,
            league: formattedLeague,
            message: 'League details retrieved successfully',
         });
      } catch (error) {
         console.error('Error fetching league details:', error);

         if (error instanceof Error && error.message === 'League not found') {
            return secureResponse(
               { error: 'League not found' },
               { status: 404 }
            );
         }

         return secureResponse(
            { error: 'Failed to fetch league details' },
            { status: 500 }
         );
      }
   }, 'general')
);
