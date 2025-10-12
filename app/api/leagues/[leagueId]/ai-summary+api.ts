import { getGeneralLeagueStats } from '@/services/leagueStatsApiService';
import { getLeagueDetails } from '@/services/leagueUtils';
import { llmClient } from '@/services/llmClient';
import {
   getLeagueStatsSummary,
   storeLeagueStatsSummary,
   updateSummaryExpiresAt,
} from '@/services/llmService';
import { checkLeagueAccess, extractLeagueId } from '@/utils/authorization';
import { withAuth } from '@/utils/middleware';
import {
   secureResponse,
   validateRequestSecurity,
   withRateLimit,
} from '@/utils/rateLimiting';
import { validateDatabaseId } from '@/utils/validation';
import dayjs from 'dayjs';

// Inline template for Cloudflare Workers compatibility (no filesystem access)
const template = `Analyze the following home poker league stats into a short paragraph highlighting
key insights:

{{leagues_stats}}`;

export const POST = withAuth(
   withRateLimit(async (request: Request, user) => {
      try {
         const securityCheck = validateRequestSecurity(request);
         if (!securityCheck.valid) {
            return secureResponse(
               { error: securityCheck.error },
               { status: 400 }
            );
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

         const getLeague = await getLeagueDetails(leagueId.toString());
         if (!getLeague) {
            return secureResponse(
               { error: 'League not found' },
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

         const url = new URL(request.url);
         const yearParam = url.searchParams.get('year');
         let year: number | undefined = undefined;

         if (yearParam) {
            const parsedYear = parseInt(yearParam, 10);
            if (
               !isNaN(parsedYear) &&
               parsedYear >= 2000 &&
               parsedYear <= new Date().getFullYear() + 1
            ) {
               year = parsedYear;
            }
         }
         const targetYear = year || dayjs().year();

         const body = await request?.json();
         if (body.createSummary) {
            await updateSummaryExpiresAt(validatedLeagueId);
         }
         const existingSummary = await getLeagueStatsSummary(validatedLeagueId);

         if (existingSummary) {
            return Response.json({ summary: existingSummary });
         }

         // Fetch league statistics
         let stats;
         try {
            const statsResponse = await getGeneralLeagueStats(
               validatedLeagueId.toString(),
               targetYear
            );
            stats = await statsResponse.json();
            console.log('📊 Stats fetched successfully:', {
               hasStats: !!stats,
               totalGames: stats?.stats?.totalGames,
            });
         } catch (error) {
            console.error('❌ Error fetching league stats:', error);
            return Response.json(
               {
                  error: 'Failed to fetch league statistics',
                  details:
                     error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
            );
         }

         if (!stats?.stats?.totalGames) {
            console.log(
               '⚠️ No games found for league:',
               validatedLeagueId,
               'year:',
               targetYear
            );
            return Response.json(
               { error: 'No games played in this year' },
               { status: 400 }
            );
         }

         // Generate AI summary
         let summary;
         try {
            const prompt = template.replace(
               '{{leagues_stats}}',
               JSON.stringify(stats)
            );

            console.log('🤖 Generating AI summary with OpenAI...');
            const result = await llmClient.generateText({
               model: 'gpt-4o-mini',
               prompt,
               temperature: 0.2,
               maxTokens: 500,
            });
            summary = result.text;
            console.log('✅ AI summary generated successfully:', {
               length: summary.length,
            });
         } catch (error) {
            console.error('❌ Error generating AI summary:', error);
            return Response.json(
               {
                  error: 'Failed to generate AI summary',
                  details:
                     error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
            );
         }

         // Store summary in database
         try {
            await storeLeagueStatsSummary(
               validatedLeagueId.toString(),
               summary
            );
            console.log('💾 Summary stored successfully');
         } catch (error) {
            console.error('❌ Error storing summary:', error);
            // Continue anyway - we can still return the summary even if storage fails
         }

         return Response.json({ summary: summary });
      } catch (error) {
         console.error('❌ Unexpected error in AI summary endpoint:', error);
         const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
         const errorStack = error instanceof Error ? error.stack : '';

         console.error('Error details:', {
            message: errorMessage,
            stack: errorStack,
            leagueId: validatedLeagueId,
            year: targetYear,
         });

         return secureResponse(
            {
               error: 'Failed to fetch league statistics summary',
               details: errorMessage,
               timestamp: new Date().toISOString(),
            },
            { status: 500 }
         );
      }
   }, 'general')
);
