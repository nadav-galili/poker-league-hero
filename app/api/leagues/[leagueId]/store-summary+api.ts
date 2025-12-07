import { storeLeagueStatsSummary } from '@/services/llmService';
import { checkLeagueAccess, extractLeagueId } from '@/utils/authorization';
import { withAuth } from '@/utils/middleware';
import { secureResponse, validateRequestSecurity } from '@/utils/rateLimiting';
import { captureException } from '@/utils/sentry';
import { validateDatabaseId } from '@/utils/validation';

/**
 * Lightweight endpoint to store AI summary in DB.
 * Called separately from the main ai-summary endpoint to avoid
 * hitting Cloudflare Workers subrequest limits.
 */
export const POST = withAuth(async (request: Request, user) => {
   try {
      const securityCheck = validateRequestSecurity(request);
      if (!securityCheck.valid) {
         return secureResponse({ error: securityCheck.error }, { status: 400 });
      }

      if (!user.userId) {
         return secureResponse(
            { error: 'User authentication required' },
            { status: 401 }
         );
      }

      const { leagueId, error: idError } = extractLeagueId(request.url);
      if (idError || !leagueId) {
         return secureResponse(
            { error: idError || 'League ID is required' },
            { status: 400 }
         );
      }

      const validatedLeagueId = validateDatabaseId(leagueId);
      if (!validatedLeagueId) {
         return secureResponse(
            { error: 'Invalid league ID format' },
            { status: 400 }
         );
      }

      // Quick access check
      const authResult = await checkLeagueAccess({
         user,
         leagueId: validatedLeagueId,
         requiredRole: 'member',
      });

      if (!authResult.authorized) {
         return secureResponse(
            { error: authResult.error || 'Access denied' },
            { status: 403 }
         );
      }

      const body = await request.json();
      const { summary } = body;

      if (!summary) {
         return secureResponse(
            { error: 'Summary is required' },
            { status: 400 }
         );
      }

      // Store the summary - this endpoint does minimal work so should succeed
      await storeLeagueStatsSummary(validatedLeagueId.toString(), summary);
      console.log('✅ Successfully stored summary via store-summary endpoint');

      return Response.json({ success: true, stored: true });
   } catch (error) {
      console.error('❌ Failed to store summary:', error);
      captureException(new Error('Failed to store summary'), {
         function: 'store-summary',
         error: error instanceof Error ? error.message : 'Unknown error',
      });

      return secureResponse(
         {
            error: 'Failed to store summary',
            details: error instanceof Error ? error.message : 'Unknown error',
         },
         { status: 500 }
      );
   }
});
