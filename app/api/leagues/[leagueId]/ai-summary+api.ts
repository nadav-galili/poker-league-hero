import { getDb, games, leagueMembers, gamePlayers, cashIns } from '@/db';
import { and, eq, gte, lte, sql, sum } from 'drizzle-orm';
import { getLeagueDetails } from '@/services/leagueUtils';
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

export const POST = withAuth(
   withRateLimit(async (request: Request, user) => {
      let validatedLeagueId: number | null | undefined;
      let targetYear: number | undefined;
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

         validatedLeagueId = validateDatabaseId(leagueId);
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

            console.log('📊 Fetching league stats directly from database...');

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

         // Generate summary based on league statistics (no external AI calls)
         let summary;
         try {
            console.log('📝 Generating summary from league statistics...');

            const statsData = stats.stats;
            const insights = [];

            // Generate insights based on the data
            if (statsData.totalGames > 0) {
               insights.push(
                  `This league has hosted ${statsData.totalGames} games`
               );

               if (statsData.completedGames > 0) {
                  const completionRate = Math.round(
                     (statsData.completedGames / statsData.totalGames) * 100
                  );
                  insights.push(`with a ${completionRate}% completion rate`);
               }
            }

            if (statsData.totalPlayers > 0) {
               insights.push(
                  `featuring ${statsData.totalPlayers} active players`
               );
            }

            if (statsData.totalBuyIns > 0) {
               insights.push(
                  `Total buy-ins amount to ${statsData.totalBuyIns}`
               );

               if (statsData.totalProfit !== 0) {
                  const profitText =
                     statsData.totalProfit > 0
                        ? `with a net profit of ${statsData.totalProfit}`
                        : `with a net loss of ${Math.abs(statsData.totalProfit)}`;
                  insights.push(profitText);
               }
            }

            // Create a natural-sounding summary
            if (insights.length > 0) {
               summary = insights.join(', ') + '. ';

               // Add conclusion based on activity level
               if (statsData.totalGames >= 10) {
                  summary +=
                     'This shows strong league activity and player engagement.';
               } else if (statsData.totalGames >= 5) {
                  summary +=
                     'The league shows moderate activity with room for growth.';
               } else {
                  summary +=
                     'This is a newer league with growing participation.';
               }
            } else {
               summary =
                  'This league is just getting started with limited activity data available.';
            }

            console.log('✅ Summary generated successfully:', {
               length: summary.length,
            });
         } catch (error) {
            console.error('❌ Error generating summary:', error);
            return Response.json(
               {
                  error: 'Failed to generate league summary',
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
