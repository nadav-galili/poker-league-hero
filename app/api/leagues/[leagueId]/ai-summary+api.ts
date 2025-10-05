import { getLeagueStatsForAi } from '@/services/leagueStatsApiService';
import { checkLeagueAccess, extractLeagueId } from '@/utils/authorization';
import { withAuth } from '@/utils/middleware';
import {
   secureResponse,
   validateRequestSecurity,
   withRateLimit,
} from '@/utils/rateLimiting';
import { validateDatabaseId } from '@/utils/validation';
import dayjs from 'dayjs';
import OpenAI from 'openai';

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

         const statsResponse = await getLeagueStatsForAi(
            validatedLeagueId.toString()
         );
         const stats = statsResponse;
         const prompt = `Analyze the following home poker league stats into a short paragraph highlighting
          key insights:

          ${JSON.stringify(stats)}

          `;
         const response = await client.responses.create({
            model: 'gpt-4o-mini',
            input: prompt,
            temperature: 0.2,
            max_output_tokens: 500,
         });
         return Response.json({ summary: response.output_text });
      } catch (error) {
         console.error('Error fetching league stats summary:', error);
         return secureResponse(
            { error: 'Failed to fetch league statistics summary' },
            { status: 500 }
         );
      }
   }, 'general')
);

const client = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});
