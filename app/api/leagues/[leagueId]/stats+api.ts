import { getGeneralLeagueStats } from '@/services/leagueStatsApiService';
import { checkLeagueAccess, extractLeagueId } from '@/utils/authorization';
import { withAuth } from '@/utils/middleware';
import {
   secureResponse,
   validateRequestSecurity,
   withRateLimit,
} from '@/utils/rateLimiting';
import { sanitizeString, validateDatabaseId } from '@/utils/validation';
import dayjs from 'dayjs';
import { and, avg, desc, eq, gte, lte, max, sql, sum } from 'drizzle-orm';
import {
   gamePlayers,
   games,
   getDb,
   leagueMembers,
   users,
} from '../../../../db';
// Types for different stat calculations
interface PlayerStat {
   userId: number;
   fullName: string;
   profileImageUrl: string | null;
   value: number;
   additionalData?: Record<string, any>;
}

// Available stat types
type StatType =
   | 'top-profit-player'
   | 'most-active-player'
   | 'highest-single-game-profit'
   | 'most-consistent-player'
   | 'biggest-loser';

export const GET = withAuth(
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

         // Extract and validate league ID from URL
         const { leagueId, error: idError } = extractLeagueId(request.url);
         if (idError || !leagueId) {
            return secureResponse(
               { error: idError || 'League ID is required' },
               { status: 400 }
            );
         }

         // Validate database ID format
         const validatedLeagueId = validateDatabaseId(leagueId);
         if (!validatedLeagueId) {
            return secureResponse(
               { error: 'Invalid league ID format' },
               { status: 400 }
            );
         }

         // Check league access authorization
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

         // Validate query parameters
         const url = new URL(request.url);
         const typeParam = url.searchParams.get('type');
         const yearParam = url.searchParams.get('year');

         // Manual validation to avoid Zod issues
         let statType: string | undefined = undefined;
         let year: number | undefined = undefined;

         // Validate type parameter
         if (typeParam) {
            const validTypes = [
               'top-profit-player',
               'most-active-player',
               'highest-single-game-profit',
               'most-consistent-player',
               'biggest-loser',
            ];
            if (!validTypes.includes(typeParam)) {
               return secureResponse(
                  {
                     error: 'Invalid stat type',
                     details: ['Type must be one of: ' + validTypes.join(', ')],
                  },
                  { status: 400 }
               );
            }
            statType = typeParam;
         }

         // Validate year parameter
         if (yearParam) {
            const parsedYear = parseInt(yearParam, 10);
            if (
               isNaN(parsedYear) ||
               parsedYear < 2000 ||
               parsedYear > new Date().getFullYear() + 1
            ) {
               return secureResponse(
                  {
                     error: 'Invalid year',
                     details: [
                        'Year must be between 2000 and ' +
                           (new Date().getFullYear() + 1),
                     ],
                  },
                  { status: 400 }
               );
            }
            year = parsedYear;
         }
         const targetYear = year || dayjs().year();

         // If no statType is provided, return general league stats
         if (!statType) {
            return getGeneralLeagueStats(
               validatedLeagueId.toString(),
               targetYear
            );
         }
         const yearStart = dayjs().year(targetYear).startOf('year').toDate(); // January 1st
         const yearEnd = dayjs().year(targetYear).endOf('year').toDate(); // December 31st

         const db = getDb();

         // First check if there are any completed games in this league for the target year
         const gamesCount = await db
            .select({
               count: sql<number>`count(*)`.as('count'),
            })
            .from(games)
            .where(
               and(
                  eq(games.leagueId, validatedLeagueId),
                  eq(games.status, 'completed'),
                  gte(games.endedAt, yearStart),
                  lte(games.endedAt, yearEnd)
               )
            );

         if (!gamesCount[0]?.count || gamesCount[0].count === 0) {
            return secureResponse({
               type: statType,
               year: targetYear,
               message: 'No completed games found for this year',
               data: null,
            });
         }

         // Calculate the requested stat
         const result = await calculateStat(
            db,
            validatedLeagueId.toString(),
            statType as StatType,
            yearStart,
            yearEnd,
            {
               gamePlayers,
               games,
               leagueMembers,
               users,
               and,
               desc,
               eq,
               gte,
               lte,
               sql,
               sum,
               avg,
               max,
            }
         );

         // Sanitize result data before returning
         const sanitizedResult = result
            ? {
                 ...result,
                 fullName: sanitizeString(result.fullName || ''),
                 profileImageUrl: result.profileImageUrl || null,
              }
            : null;

         return secureResponse({
            type: statType,
            year: targetYear,
            data: sanitizedResult,
         });
      } catch (error) {
         console.error('Error fetching league stats:', error);
         return secureResponse(
            { error: 'Failed to fetch league statistics' },
            { status: 500 }
         );
      }
   }, 'general')
);

// Generic stat calculation function
async function calculateStat(
   db: any,
   leagueId: string,
   statType: StatType,
   yearStart: Date,
   yearEnd: Date,
   modules: any
): Promise<PlayerStat | null> {
   const {
      gamePlayers,
      games,
      leagueMembers,
      users,
      and,
      desc,
      eq,
      gte,
      lte,
      sql,
      sum,
      avg,
      max,
   } = modules;

   const parsedLeagueId = parseInt(leagueId);
   if (isNaN(parsedLeagueId)) {
      throw new Error('Invalid league ID');
   }

   const baseWhere = and(
      eq(games.leagueId, parsedLeagueId),
      eq(games.status, 'completed'),
      gte(games.endedAt, yearStart),
      lte(games.endedAt, yearEnd),
      eq(leagueMembers.isActive, true)
   );

   switch (statType) {
      case 'top-profit-player': {
         const result = await db
            .select({
               userId: users.id,
               fullName: users.fullName,
               profileImageUrl: users.profileImageUrl,
               value: sum(gamePlayers.profit).as('total_profit'),
               gamesPlayed:
                  sql<number>`count(distinct ${gamePlayers.gameId})`.as(
                     'games_played'
                  ),
            })
            .from(gamePlayers)
            .innerJoin(games, eq(gamePlayers.gameId, games.id))
            .innerJoin(users, eq(gamePlayers.userId, users.id))
            .innerJoin(
               leagueMembers,
               and(
                  eq(leagueMembers.userId, users.id),
                  eq(leagueMembers.leagueId, parsedLeagueId)
               )
            )
            .where(baseWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`sum(${gamePlayers.profit}) IS NOT NULL`)
            .orderBy(desc(sum(gamePlayers.profit)))
            .limit(1);

         if (!result.length) return null;

         return {
            userId: result[0].userId,
            fullName: result[0].fullName,
            profileImageUrl: result[0].profileImageUrl,
            value: parseFloat(result[0].value || '0'),
            additionalData: {
               gamesPlayed: result[0].gamesPlayed,
               label: 'Total Profit',
            },
         };
      }

      case 'most-active-player': {
         const result = await db
            .select({
               userId: users.id,
               fullName: users.fullName,
               profileImageUrl: users.profileImageUrl,
               value: sql<number>`count(distinct ${gamePlayers.gameId})`.as(
                  'games_played'
               ),
               totalProfit: sum(gamePlayers.profit).as('total_profit'),
            })
            .from(gamePlayers)
            .innerJoin(games, eq(gamePlayers.gameId, games.id))
            .innerJoin(users, eq(gamePlayers.userId, users.id))
            .innerJoin(
               leagueMembers,
               and(
                  eq(leagueMembers.userId, users.id),
                  eq(leagueMembers.leagueId, parsedLeagueId)
               )
            )
            .where(baseWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .orderBy(desc(sql<number>`count(distinct ${gamePlayers.gameId})`))
            .limit(1);

         if (!result.length) return null;

         return {
            userId: result[0].userId,
            fullName: result[0].fullName,
            profileImageUrl: result[0].profileImageUrl,
            value: result[0].value,
            additionalData: {
               totalProfit: parseFloat(result[0].totalProfit || '0'),
               label: 'Games Played',
            },
         };
      }

      case 'highest-single-game-profit': {
         const result = await db
            .select({
               userId: users.id,
               fullName: users.fullName,
               profileImageUrl: users.profileImageUrl,
               value: max(gamePlayers.profit).as('highest_profit'),
               gamesPlayed:
                  sql<number>`count(distinct ${gamePlayers.gameId})`.as(
                     'games_played'
                  ),
            })
            .from(gamePlayers)
            .innerJoin(games, eq(gamePlayers.gameId, games.id))
            .innerJoin(users, eq(gamePlayers.userId, users.id))
            .innerJoin(
               leagueMembers,
               and(
                  eq(leagueMembers.userId, users.id),
                  eq(leagueMembers.leagueId, parsedLeagueId)
               )
            )
            .where(baseWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`max(${gamePlayers.profit}) IS NOT NULL`)
            .orderBy(desc(max(gamePlayers.profit)))
            .limit(1);

         if (!result.length) return null;

         return {
            userId: result[0].userId,
            fullName: result[0].fullName,
            profileImageUrl: result[0].profileImageUrl,
            value: parseFloat(result[0].value || '0'),
            additionalData: {
               gamesPlayed: result[0].gamesPlayed,
               label: 'Best Single Game',
            },
         };
      }

      case 'most-consistent-player': {
         // Calculate consistency as lowest standard deviation of profits
         const result = await db
            .select({
               userId: users.id,
               fullName: users.fullName,
               profileImageUrl: users.profileImageUrl,
               value: sql<number>`stddev(${gamePlayers.profit})`.as(
                  'consistency_score'
               ),
               avgProfit: avg(gamePlayers.profit).as('avg_profit'),
               gamesPlayed:
                  sql<number>`count(distinct ${gamePlayers.gameId})`.as(
                     'games_played'
                  ),
            })
            .from(gamePlayers)
            .innerJoin(games, eq(gamePlayers.gameId, games.id))
            .innerJoin(users, eq(gamePlayers.userId, users.id))
            .innerJoin(
               leagueMembers,
               and(
                  eq(leagueMembers.userId, users.id),
                  eq(leagueMembers.leagueId, parsedLeagueId)
               )
            )
            .where(baseWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`count(distinct ${gamePlayers.gameId}) >= 3`) // At least 3 games for consistency
            .orderBy(sql`stddev(${gamePlayers.profit}) ASC`) // Lower stddev = more consistent
            .limit(1);

         if (!result.length) return null;

         return {
            userId: result[0].userId,
            fullName: result[0].fullName,
            profileImageUrl: result[0].profileImageUrl,
            value: parseFloat(result[0].value || '0'),
            additionalData: {
               avgProfit: parseFloat(result[0].avgProfit || '0'),
               gamesPlayed: result[0].gamesPlayed,
               label: 'Consistency Score',
            },
         };
      }

      case 'biggest-loser': {
         const result = await db
            .select({
               userId: users.id,
               fullName: users.fullName,
               profileImageUrl: users.profileImageUrl,
               value: sum(gamePlayers.profit).as('total_loss'),
               gamesPlayed:
                  sql<number>`count(distinct ${gamePlayers.gameId})`.as(
                     'games_played'
                  ),
            })
            .from(gamePlayers)
            .innerJoin(games, eq(gamePlayers.gameId, games.id))
            .innerJoin(users, eq(gamePlayers.userId, users.id))
            .innerJoin(
               leagueMembers,
               and(
                  eq(leagueMembers.userId, users.id),
                  eq(leagueMembers.leagueId, parsedLeagueId)
               )
            )
            .where(baseWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`sum(${gamePlayers.profit}) IS NOT NULL`)
            .orderBy(sum(gamePlayers.profit)) // ASC for biggest loss (most negative)
            .limit(1);

         if (!result.length) return null;

         return {
            userId: result[0].userId,
            fullName: result[0].fullName,
            profileImageUrl: result[0].profileImageUrl,
            value: Math.abs(parseFloat(result[0].value || '0')), // Return absolute value
            additionalData: {
               gamesPlayed: result[0].gamesPlayed,
               actualLoss: parseFloat(result[0].value || '0'), // Keep the actual negative value
               label: 'Total Loss',
            },
         };
      }

      default:
         throw new Error(`Unsupported stat type: ${statType}`);
   }
}
