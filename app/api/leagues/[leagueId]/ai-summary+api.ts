import { cashIns, gamePlayers, games, getDb, leagueMembers } from '@/db';
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
import { captureException } from '@/utils/sentry';
import { validateDatabaseId } from '@/utils/validation';
import dayjs from 'dayjs';
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm';

// Template for AI summary generation
const template = `You are an enthusiastic and friendly AI poker analyst. Your goal is to analyze the provided home poker league statistics and generate a concise, engaging, two-paragraph summary.

**Paragraph 1: Financial Snapshot**
Summarize the league's overall financial health. Highlight the total number of games, the total money put in (Buy-Ins), and the total money taken out (Buy-Outs). State the **Total Profit/Loss** and comment on what it means for the league's pot or rake (e.g., "The league is down $X, which means the collective pot is X less than the buy-ins").

**Paragraph 2: Engagement and Activity**
Comment on the activity levels, noting the number of **total players** and **completed games**. Since 'averageGameDuration' is 0, mention that the duration data is not yet available and focus on the current player pool size.

**Data to analyze:**
{{leagues_stats}}`;

export const POST = withAuth(
   withRateLimit(async (request: Request, user) => {
      let validatedLeagueId: number | null | undefined;
      let targetYear: number | undefined;
      try {
         const securityCheck = validateRequestSecurity(request);
         if (!securityCheck.valid) {
            captureException(
               new Error(securityCheck.error ?? 'Invalid request'),
               {
                  function: 'validateRequestSecurity',
                  screen: 'AiSummary',
                  request: request,
                  user: user,
               }
            );
            return secureResponse(
               { error: securityCheck.error },
               { status: 400 }
            );
         }

         if (!user.userId) {
            captureException(new Error('User authentication required'), {
               function: 'checkUserAuthentication',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
            return secureResponse(
               { error: 'User authentication required' },
               { status: 401 }
            );
         }

         const { leagueId, error: idError } = extractLeagueId(request.url);
         if (idError || !leagueId) {
            captureException(new Error(idError || 'League ID is required'), {
               function: 'extractLeagueId',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
            return secureResponse(
               { error: idError || 'League ID is required' },
               { status: 400 }
            );
         }

         const getLeague = await getLeagueDetails(leagueId.toString());
         if (!getLeague) {
            captureException(new Error('League not found'), {
               function: 'getLeagueDetails',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
            return secureResponse(
               { error: 'League not found' },
               { status: 400 }
            );
         }

         validatedLeagueId = validateDatabaseId(leagueId);
         if (!validatedLeagueId) {
            captureException(new Error('Invalid league ID format'), {
               function: 'validateDatabaseId',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
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
            captureException(new Error(authResult.error || 'Access denied'), {
               function: 'checkLeagueAccess',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
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
         targetYear = year || dayjs().year();

         const body = await request?.json();
         if (body.createSummary) {
            await updateSummaryExpiresAt(validatedLeagueId);
         }
         const existingSummary = await getLeagueStatsSummary(validatedLeagueId);

         if (existingSummary) {
            return Response.json({ summary: existingSummary });
         }

         // Fetch league statistics directly from database (avoid HTTP subrequests)
         let stats;
         try {
            const db = getDb();
            const yearStart = dayjs().year(targetYear).startOf('year').toDate();
            const yearEnd = dayjs().year(targetYear).endOf('year').toDate();

            const totalGamesResult = await db
               .select({ count: sql<number>`count(*)` })
               .from(games)
               .where(
                  and(
                     eq(games.leagueId, validatedLeagueId),
                     gte(games.startedAt, yearStart),
                     lte(games.startedAt, yearEnd)
                  )
               );

            const completedGamesResult = await db
               .select({ count: sql<number>`count(*)` })
               .from(games)
               .where(
                  and(
                     eq(games.leagueId, validatedLeagueId),
                     eq(games.status, 'completed'),
                     gte(games.startedAt, yearStart),
                     lte(games.startedAt, yearEnd)
                  )
               );

            const totalPlayersResult = await db
               .select({ count: sql<number>`count(*)` })
               .from(leagueMembers)
               .where(
                  and(
                     eq(leagueMembers.leagueId, validatedLeagueId),
                     eq(leagueMembers.isActive, true)
                  )
               );

            const profitResult = await db
               .select({
                  totalBuyIns: sum(cashIns.amount).as('total_buy_ins'),
                  totalBuyOuts:
                     sql<number>`sum(case when ${cashIns.type} = 'buy_out' then ${cashIns.amount} else 0 end)`.as(
                        'total_buy_outs'
                     ),
               })
               .from(cashIns)
               .innerJoin(gamePlayers, eq(cashIns.gamePlayerId, gamePlayers.id))
               .innerJoin(games, eq(gamePlayers.gameId, games.id))
               .where(
                  and(
                     eq(games.leagueId, validatedLeagueId),
                     eq(games.status, 'completed'),
                     gte(games.endedAt, yearStart),
                     lte(games.endedAt, yearEnd)
                  )
               );

            stats = {
               stats: {
                  totalGames: totalGamesResult[0]?.count || 0,
                  completedGames: completedGamesResult[0]?.count || 0,
                  totalPlayers: totalPlayersResult[0]?.count || 0,
                  totalProfit:
                     (profitResult[0]?.totalBuyOuts || 0) -
                     (profitResult[0]?.totalBuyIns || 0),
                  totalBuyIns: profitResult[0]?.totalBuyIns || 0,
                  totalBuyOuts: profitResult[0]?.totalBuyOuts || 0,
               },
            };
         } catch (error) {
            console.error('❌ Error fetching league stats:', error);
            captureException(new Error('Failed to fetch league statistics'), {
               function: 'getLeagueStatsSummary',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
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
            captureException(new Error('No games played in this year'), {
               function: 'getLeagueStatsSummary',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
            return Response.json(
               { error: 'No games played in this year' },
               { status: 400 }
            );
         }

         // Generate AI summary using OpenAI (with direct database stats, no HTTP subrequests)
         let summary;
         try {
            const prompt = template.replace(
               '{{leagues_stats}}',
               JSON.stringify(stats)
            );

            const result = await llmClient.generateText({
               model: 'gpt-4o-mini',
               prompt,
               temperature: 0.2,
               maxTokens: 500,
            });
            summary = result.text;
         } catch (error) {
            captureException(new Error('Failed to generate AI summary'), {
               function: 'llmClient.generateText',
               screen: 'AiSummary',
               request: request,
               user: user,
            });
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
         } catch (error) {
            captureException(new Error('Failed to store summary'), {
               function: 'storeLeagueStatsSummary',
               screen: 'AiSummary',
               request: request,
               user: user,
               error: error instanceof Error ? error.message : 'Unknown error',
            });
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
