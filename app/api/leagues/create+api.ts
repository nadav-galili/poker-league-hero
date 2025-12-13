import { createLeague } from '@/services/leagueUtils';
import { withAuth } from '@/utils/middleware';
import { secureResponse } from '@/utils/rateLimiting';
import { captureException } from '@/utils/sentry';

export const POST = withAuth(async (request: Request, user) => {
   try {
      // Fast input validation - minimal overhead
      let body;
      try {
         body = await request.json();
      } catch (error) {
         return secureResponse(
            { error: 'Invalid JSON payload' },
            { status: 400 }
         );
      }

      // Basic validation only - remove heavy schema validation
      if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
         return secureResponse(
            { error: 'League name is required' },
            { status: 400 }
         );
      }

      if (!body.adminUserEmail || !body.adminUserEmail.includes('@')) {
         return secureResponse(
            { error: 'Valid email is required' },
            { status: 400 }
         );
      }

      // Minimal sanitization
      const leagueData = {
         name: body.name.trim().slice(0, 50), // Basic length limit
         image: body.image || undefined,
         adminUserEmail: body.adminUserEmail.toLowerCase().trim(),
      };

      // Create league directly
      const league = await createLeague(leagueData);

      return secureResponse(
         {
            league: {
               id: league.id,
               name: league.name,
               inviteCode: league.inviteCode,
               imageUrl: league.imageUrl,
               createdAt: league.createdAt,
            },
            message: 'League created successfully',
         },
         { status: 201 }
      );
   } catch (error) {
      console.error('Error creating league:', error);

      // Minimal error handling - faster response
      const errorMessage =
         error instanceof Error && error.message.includes('User not found')
            ? 'Admin user not found'
            : 'Failed to create league';

      return secureResponse(
         { error: errorMessage },
         {
            status:
               error instanceof Error &&
               error.message.includes('User not found')
                  ? 404
                  : 500,
         }
      );
   }
});
