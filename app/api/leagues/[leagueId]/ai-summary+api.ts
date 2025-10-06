import { getGeneralLeagueStats } from '@/services/leagueStatsApiService';
import { getLeagueDetails } from '@/services/leagueUtils';
import { llmClient } from '@/services/llmClient';
import {
   getLeagueStatsSummary,
   storeLeagueStatsSummary,
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
import { readFileSync } from 'fs';
import { join } from 'path';

const template = readFileSync(
   join(process.cwd(), 'app/api/llm/prompts/summarize-leagues.txt'),
   'utf-8'
);

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
         const existingSummary = await getLeagueStatsSummary(validatedLeagueId);

         if (existingSummary && !body.createSummary) {
            return Response.json({ summary: existingSummary });
         }

         const statsResponse = await getGeneralLeagueStats(
            validatedLeagueId.toString(),
            targetYear
         );
         const stats = await statsResponse.json();
         if (!stats?.stats?.totalGames) {
            return Response.json(
               { error: 'No games played in this year' },
               { status: 400 }
            );
         }

         const prompt = template.replace(
            '{{leagues_stats}}',
            JSON.stringify(stats)
         );

         const { text: summary } = await llmClient.generateText({
            model: 'gpt-4o-mini',
            prompt,
            temperature: 0.2,
            maxTokens: 500,
         });

         await storeLeagueStatsSummary(validatedLeagueId.toString(), summary);
         return Response.json({ summary: summary });
      } catch (error) {
         console.error('Error fetching league stats summary:', error);
         return secureResponse(
            { error: 'Failed to fetch league statistics summary' },
            { status: 400 }
         );
      }
   }, 'general')
);
