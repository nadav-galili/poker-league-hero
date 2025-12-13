import { getDb, leagues } from '../../../db';
import { getLeagueDetails } from '../../../services/leagueUtils';
import {
   checkLeagueAccess,
   extractLeagueId,
} from '../../../utils/authorization';
import { withAuth } from '../../../utils/middleware';
import {
   secureResponse,
   validateRequestSecurity,
   withRateLimit,
} from '../../../utils/rateLimiting';
import { sanitizeString, validateDatabaseId } from '../../../utils/validation';
import { eq } from 'drizzle-orm';

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

export const PATCH = withAuth(
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

         // Check league access authorization - Allow any member to edit per requirement
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

         // Parse body
         const body = await request.json();
         const { name, imageUrl } = body;

         if (!name && imageUrl === undefined) {
            return secureResponse(
               { error: 'No fields to update provided' },
               { status: 400 }
            );
         }

         const updates: any = {
            updatedAt: new Date(),
         };

         if (name) {
            if (name.length < 3 || name.length > 50) {
               return secureResponse(
                  { error: 'Name must be between 3 and 50 characters' },
                  { status: 400 }
               );
            }
            updates.name = sanitizeString(name);
         }

         if (imageUrl !== undefined) {
            // If imageUrl is provided (including null), update it
            updates.imageUrl = imageUrl;
         }

         const db = getDb();

         const updatedLeague = await db
            .update(leagues)
            .set(updates)
            .where(eq(leagues.id, validatedId))
            .returning();

         if (!updatedLeague.length) {
            return secureResponse(
               { error: 'League not found or update failed' },
               { status: 404 }
            );
         }

         return secureResponse({
            success: true,
            league: updatedLeague[0],
            message: 'League updated successfully',
         });
      } catch (error) {
         console.error('Error updating league:', error);
         return secureResponse(
            { error: 'Failed to update league' },
            { status: 500 }
         );
      }
   }, 'general')
);
