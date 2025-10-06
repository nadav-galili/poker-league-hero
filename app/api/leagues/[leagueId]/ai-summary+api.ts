import { getGeneralLeagueStats } from '@/services/leagueStatsApiService';
import { storeLeagueStatsSummary } from '@/services/llmService';
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
import { llmClient } from '../../llm/client';

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

         const statsResponse = await getGeneralLeagueStats(
            validatedLeagueId.toString(),
            targetYear
         );
         const stats = await statsResponse.json();

         const prompt = template.replace(
            '{{leagues_stats}}',
            JSON.stringify(stats)
         );
         console.log('🚀 ~ prompt:', prompt);

         const { text: summary } = await llmClient.generateText({
            model: 'gpt-4o-mini',
            prompt,
            temperature: 0.2,
            maxTokens: 500,
            apiKey: process.env.OPENAI_API_KEY!,
         });

         await storeLeagueStatsSummary(validatedLeagueId.toString(), summary);
         return Response.json({ summary: summary });
         //  const prompt = `Analyze the following home poker league stats into a short paragraph highlighting
         //  key insights:

         //  ${JSON.stringify(stats)}

         //  `;
         //  const response = await client.responses.create({
         //     model: 'gpt-4o-mini',
         //     input: prompt,
         //     temperature: 0.2,
         //     max_output_tokens: 500,
         //  });
         //  return Response.json({ summary: response.output_text });
      } catch (error) {
         console.error('Error fetching league stats summary:', error);
         return secureResponse(
            { error: 'Failed to fetch league statistics summary' },
            { status: 500 }
         );
      }
   }, 'general')
);
