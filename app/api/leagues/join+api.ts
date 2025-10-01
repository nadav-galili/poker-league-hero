import {
   findLeagueByInviteCode,
   joinLeagueByInviteCode,
   validateInviteCode,
} from '../../../services/leagueUtils';
import { withAuth } from '../../../utils/middleware';
import {
   withRateLimit,
   validateRequestSecurity,
   secureResponse,
} from '../../../utils/rateLimiting';
import {
   validateRequest,
   joinLeagueSchema,
   sanitizeString,
} from '../../../utils/validation';
import { validateLeagueExists } from '../../../utils/authorization';

export const POST = withAuth(
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

         // Parse and validate request body
         let body;
         try {
            body = await request.json();
         } catch (parseError) {
            return secureResponse(
               { error: 'Invalid JSON payload' },
               { status: 400 }
            );
         }

         // Validate input schema
         const validation = validateRequest(joinLeagueSchema, body);
         if (!validation.success) {
            return secureResponse(
               {
                  error: 'Invalid input data',
                  details: validation.errors || ['Invalid input'],
               },
               { status: 400 }
            );
         }

         const { inviteCode } = validation.data as { inviteCode: string };

         // Additional invite code validation (legacy validation for compatibility)
         const legacyValidation = validateInviteCode(inviteCode);
         if (!legacyValidation.isValid) {
            return secureResponse(
               {
                  error: legacyValidation.error || 'Invalid invite code format',
               },
               { status: 400 }
            );
         }

         // Sanitize invite code
         const sanitizedInviteCode = sanitizeString(inviteCode).toUpperCase();
         if (!sanitizedInviteCode) {
            return secureResponse(
               { error: 'Invalid invite code' },
               { status: 400 }
            );
         }

         // Check if league exists with this invite code
         const league = await findLeagueByInviteCode(sanitizedInviteCode);
         if (!league) {
            return secureResponse(
               { error: 'League not found with this invite code' },
               { status: 404 }
            );
         }

         // Validate league exists and is active
         const leagueValidation = await validateLeagueExists(league.id);
         if (!leagueValidation.exists) {
            return secureResponse(
               { error: 'League not found' },
               { status: 404 }
            );
         }

         if (!leagueValidation.active) {
            return secureResponse(
               { error: 'This league is no longer active' },
               { status: 400 }
            );
         }

         // Attempt to join the league with proper error handling
         try {
            const membership = await joinLeagueByInviteCode(
               sanitizedInviteCode,
               user.userId
            );

            return secureResponse(
               {
                  success: true,
                  league: {
                     id: league.id,
                     name: sanitizeString(league.name),
                     inviteCode: league.inviteCode,
                  },
                  membership: {
                     id: membership.id,
                     role: membership.role,
                     joinedAt: membership.joinedAt,
                  },
                  message: 'Successfully joined the league',
               },
               { status: 201 }
            );
         } catch (joinError) {
            // Handle specific join errors with secure error messages
            const errorMessage =
               joinError instanceof Error
                  ? joinError.message
                  : 'Failed to join league';

            if (errorMessage.includes('already a member')) {
               return secureResponse(
                  { error: 'You are already a member of this league' },
                  { status: 409 }
               );
            }

            if (errorMessage.includes('League is not active')) {
               return secureResponse(
                  { error: 'This league is no longer active' },
                  { status: 400 }
               );
            }

            if (errorMessage.includes('Invalid invite code')) {
               return secureResponse(
                  { error: 'Invalid invite code' },
                  { status: 400 }
               );
            }

            // Log actual error but return generic message
            console.error('League join error:', errorMessage);
            return secureResponse(
               { error: 'Failed to join league' },
               { status: 400 }
            );
         }
      } catch (error) {
         console.error('Error joining league:', error);
         return secureResponse(
            { error: 'Failed to join league' },
            { status: 500 }
         );
      }
   }, 'joinLeague')
);
