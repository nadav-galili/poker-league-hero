import { cashIns, gamePlayers, games, getDb, leagueMembers } from '@/db';
import { aiSummarySchema } from '@/services/aiSummarySchema';
import {
   getLastGameDetails,
   getLeagueDetails,
   getLeaguePlayerStats,
} from '@/services/leagueUtils';
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
import { eq, sql } from 'drizzle-orm';

// Template for AI summary generation
const template = `You are an enthusiastic and friendly AI poker analyst analyzing a home poker league.

**IMPORTANT**: Poker is a zero-sum game. Money won by one player = money lost by others. Do NOT report "league profit" - instead focus on INDIVIDUAL player performances.

**Response Format**: Return ONLY valid JSON:
{
  "financialSnapshot": "string (max 50 words)",
  "lastGameHighlights": "string (max 50 words)",
  "stats": {
    "totalProfit": 0,
    "totalBuyIns": number,
    "totalGames": number,
    "highestSingleGameProfit": number,
    "highestSingleGamePlayer": "string"
  }
}

**Paragraph 1: Financial Snapshot (financialSnapshot)**
- Report: total games played, total buy-ins amount, number of active players
- Highlight the TOP WINNER (player with highest cumulative profit) and their profit amount
- Mention the biggest loser if relevant
- DO NOT say "the league profited" - individual players profit/lose, not the league

**Paragraph 2: Last Game Results (lastGameHighlights)**
- Who won the last game and how much they won
- Notable performances (big wins/losses)
- If no last game data, say "No recent game data available"

**Stats object**:
- totalProfit: ALWAYS set to 0 (poker is zero-sum)
- totalBuyIns: sum of all buy-ins
- totalGames: number of completed games
- highestSingleGameProfit: biggest single-game win
- highestSingleGamePlayer: name of that winner

**Data to analyze:**
{{leagues_stats}}

**Language**: {{language}}
**Word Limit**: 50 words per paragraph.
**Use player names for engagement.**`;

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
         const language = body.language || 'en'; // Default to English
         const isHebrew = language === 'he';
         const languageName = isHebrew ? 'Hebrew' : 'English';

         // Note: cachedSummary is now handled via separate /store-summary endpoint
         // to avoid hitting subrequest limits in this main endpoint

         if (body.createSummary) {
            await updateSummaryExpiresAt(validatedLeagueId);
         }
         const existingSummary = await getLeagueStatsSummary(validatedLeagueId);

         if (existingSummary) {
            return Response.json({ summary: existingSummary, cached: true });
         }

         // Fetch league statistics (overall & per-player); last game is fetched
         // separately so that a failure there doesn't kill the whole summary.
         // CONSOLIDATED QUERIES to reduce Cloudflare Workers subrequest count.
         let stats;
         try {
            const db = getDb();
            const yearStart = dayjs().year(targetYear).startOf('year').toDate();
            const yearEnd = dayjs().year(targetYear).endOf('year').toDate();

            // Consolidated stats query - combines all basic counts + profit in ONE query
            const overallStats = await db
               .select({
                  totalGames: sql<number>`count(distinct case when ${games.startedAt} >= ${yearStart} and ${games.startedAt} <= ${yearEnd} then ${games.id} end)`,
                  completedGames: sql<number>`count(distinct case when ${games.status} = 'completed' and ${games.startedAt} >= ${yearStart} and ${games.startedAt} <= ${yearEnd} then ${games.id} end)`,
                  totalPlayers: sql<number>`(select count(*) from ${leagueMembers} where ${leagueMembers.leagueId} = ${validatedLeagueId} and ${leagueMembers.isActive} = true)`,
                  totalBuyIns: sql<number>`coalesce(sum(case when ${games.status} = 'completed' and ${games.endedAt} >= ${yearStart} and ${games.endedAt} <= ${yearEnd} and ${cashIns.type} = 'buy_in' then ${cashIns.amount} else 0 end), 0)`,
                  totalBuyOuts: sql<number>`coalesce(sum(case when ${games.status} = 'completed' and ${games.endedAt} >= ${yearStart} and ${games.endedAt} <= ${yearEnd} and ${cashIns.type} = 'buy_out' then ${cashIns.amount} else 0 end), 0)`,
               })
               .from(games)
               .leftJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
               .leftJoin(cashIns, eq(cashIns.gamePlayerId, gamePlayers.id))
               .where(eq(games.leagueId, validatedLeagueId));

            const row = overallStats[0];
            const totalGames = Number(row?.totalGames || 0);
            const completedGames = Number(row?.completedGames || 0);
            const totalPlayers = Number(row?.totalPlayers || 0);
            const totalBuyIns = Number(row?.totalBuyIns || 0);
            const totalBuyOuts = Number(row?.totalBuyOuts || 0);
            const totalProfit = totalBuyOuts - totalBuyIns;

            // Per-player stats (still separate for now, but could be optimized further)
            const playerStats = await getLeaguePlayerStats(
               validatedLeagueId,
               targetYear
            );

            stats = {
               leagueOverall: {
                  totalGames,
                  completedGames,
                  totalPlayers,
                  totalProfit,
                  totalBuyIns,
                  totalBuyOuts,
               },
               playerStats,
               lastGame: null, // filled in best-effort below
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
                  cause: (error as any).cause
                     ? JSON.stringify((error as any).cause)
                     : undefined,
               },
               { status: 500 }
            );
         }

         // Best-effort: fetch last game, but don't fail the whole summary if this
         // specific query has issues on Neon.
         try {
            const lastGame = await getLastGameDetails(validatedLeagueId);
            if (stats) {
               stats = { ...stats, lastGame };
            }
         } catch (error) {
            console.error('❌ Error fetching last game for AI summary:', error);
            captureException(
               new Error('Failed to fetch last game for AI summary'),
               {
                  function: 'getLastGameDetails',
                  screen: 'AiSummary',
                  request: request,
                  user: user,
               }
            );
            // continue with stats.lastGame = null
         }

         if (!stats?.leagueOverall?.totalGames) {
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

         // Generate AI summary using OpenAI. If the LLM call fails (including
         // Workers/Neon “Too many subrequests” issues), fall back to a simple
         // server-generated summary so the endpoint still returns 200.
         let summary;
         try {
            const prompt = template
               .replace('{{leagues_stats}}', JSON.stringify(stats))
               .replaceAll('{{language}}', languageName);

            const result = await llmClient.generateText({
               model: 'gpt-4o-mini',
               prompt,
               temperature: 0.2,
               maxTokens: 400,
            });

            // Parse and validate response
            const parsed = JSON.parse(result.text);
            const validated = aiSummarySchema.parse(parsed);
            // Enforce totalProfit = 0 (poker is zero-sum)
            summary = {
               ...validated,
               stats: {
                  ...validated.stats,
                  totalProfit: 0,
               },
            };
         } catch (error) {
            console.error(
               '❌ Error generating AI summary, using fallback:',
               error
            );
            captureException(
               new Error(
                  `Failed to generate AI summary: ${
                     error instanceof Error ? error.message : String(error)
                  }`
               ),
               {
                  function: 'llmClient.generateText',
                  screen: 'AiSummary',
               }
            );

            // Fallback: build a short, localized summary from the stats we
            // already have, so the user still sees something useful.
            const totals = stats!.leagueOverall;
            const totalGames = Number(
               totals.completedGames || totals.totalGames || 0
            );
            const totalBuyIns = Number(totals.totalBuyIns || 0);
            const totalProfit = Number(totals.totalProfit || 0);
            const formatter = new Intl.NumberFormat(
               isHebrew ? 'he-IL' : 'en-US',
               { maximumFractionDigits: 2 }
            );

            const buyInsStr = formatter.format(totalBuyIns);
            const profitStr = formatter.format(totalProfit);

            const financialSnapshot = isHebrew
               ? `הליגה שיחקה ${totalGames} משחקים שהושלמו השנה, עם סך קניות של ${buyInsStr} ורווח כולל של ${profitStr}.`
               : `The league played ${totalGames} completed games this year with total buy-ins of ${buyInsStr} and overall profit of ${profitStr}.`;

            const lastGameHighlights = isHebrew
               ? 'ניתוח ה־AI אינו זמין כרגע בגלל מגבלות שרת.'
               : 'AI analysis is temporarily unavailable due to server limits.';

            summary = {
               financialSnapshot,
               lastGameHighlights,
               stats: {
                  totalProfit,
                  totalBuyIns,
                  totalGames,
                  highestSingleGameProfit: 0,
                  highestSingleGamePlayer: '',
               },
            } as any;
         }

         // Try to store in DB; if it fails (subrequest limit), tell client to cache locally
         let needsBackendCache = false;
         try {
            await storeLeagueStatsSummary(
               validatedLeagueId.toString(),
               summary as any
            );
            console.log('✅ Successfully stored AI summary in cache');
         } catch (error) {
            console.error(
               '⚠️ Failed to store AI summary (likely subrequest limit):',
               error
            );
            captureException(new Error('Failed to store summary'), {
               function: 'storeLeagueStatsSummary',
               screen: 'AiSummary',
               request: request,
               user: user,
               error: error instanceof Error ? error.message : 'Unknown error',
            });
            needsBackendCache = true; // Signal to client to cache locally
         }

         return Response.json({
            summary,
            cached: false,
            needsBackendCache,
         });
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
               cause: (error as any).cause
                  ? JSON.stringify((error as any).cause)
                  : undefined,
               timestamp: new Date().toISOString(),
            },
            { status: 500 }
         );
      }
   }, 'general')
);
