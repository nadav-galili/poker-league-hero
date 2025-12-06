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
import {
   and,
   avg,
   desc,
   eq,
   gte,
   isNotNull,
   lte,
   max,
   sql,
   sum,
} from 'drizzle-orm';
import {
   anonymousPlayers as anonymousPlayersTable,
   gamePlayers,
   games,
   getDb,
   leagueMembers,
   users,
} from '../../../../../db';

// Types for different stat calculations
interface PlayerStat {
   userId: number;
   fullName: string;
   profileImageUrl: string | null;
   value: number;
   rank?: number;
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
         // URL pattern: /api/leagues/[leagueId]/stats/rankings
         const urlParts = request.url.split('/');
         const statsIndex = urlParts.indexOf('stats');
         const leagueIdStr = statsIndex > 0 ? urlParts[statsIndex - 1] : null;

         if (!leagueIdStr) {
            return secureResponse(
               { error: 'League ID is required' },
               { status: 400 }
            );
         }

         // Validate database ID format
         const validatedLeagueId = validateDatabaseId(leagueIdStr);
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
         } else {
            return secureResponse(
               { error: 'Stat type is required' },
               { status: 400 }
            );
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
               data: [],
               topPlayer: null,
            });
         }

         // Calculate the requested stat rankings
         const rankings = await calculateRankings(
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
               anonymousPlayersTable,
               and,
               desc,
               eq,
               gte,
               lte,
               sql,
               sum,
               avg,
               max,
               isNotNull,
            }
         );

         // Sanitize result data before returning
         const sanitizedRankings = rankings.map((player) => ({
            ...player,
            fullName: sanitizeString(player.fullName || ''),
            profileImageUrl: player.profileImageUrl || null,
         }));

         // Extract top player
         const topPlayer =
            sanitizedRankings.length > 0 ? sanitizedRankings[0] : null;

         // Remove top player from the list if desired, or keep them.
         // For a leaderboard, usually we send the whole list and let FE handle display.
         // However, the plan says: "Hero section - Top player in larger, prominent card... FlashList - Remaining players"
         // I'll return the full list in `data` and also `topPlayer` separately for convenience.

         return secureResponse({
            type: statType,
            year: targetYear,
            data: sanitizedRankings,
            topPlayer: topPlayer,
         });
      } catch (error) {
         console.error('Error fetching league rankings:', error);
         return secureResponse(
            { error: 'Failed to fetch league rankings' },
            { status: 500 }
         );
      }
   }, 'rankings')
);

// Generic rankings calculation function
async function calculateRankings(
   db: any,
   leagueId: string,
   statType: StatType,
   yearStart: Date,
   yearEnd: Date,
   modules: any
): Promise<PlayerStat[]> {
   const {
      gamePlayers,
      games,
      leagueMembers,
      users,
      anonymousPlayersTable,
      and,
      desc,
      eq,
      gte,
      lte,
      sql,
      sum,
      avg,
      max,
      isNotNull,
   } = modules;

   const parsedLeagueId = parseInt(leagueId);
   if (isNaN(parsedLeagueId)) {
      throw new Error('Invalid league ID');
   }

   const gameConditions = and(
      eq(games.leagueId, parsedLeagueId),
      eq(games.status, 'completed'),
      gte(games.endedAt, yearStart),
      lte(games.endedAt, yearEnd)
   );

   const userWhere = and(gameConditions, eq(leagueMembers.isActive, true));

   switch (statType) {
      case 'top-profit-player': {
         // Regular User Query
         const userResults = await db
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
            .where(userWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`sum(${gamePlayers.profit}) IS NOT NULL`)
            .orderBy(desc(sum(gamePlayers.profit)));

         // Process results
         return userResults.map((player: any, index: number) => ({
            userId: player.userId,
            fullName: player.fullName,
            profileImageUrl: player.profileImageUrl,
            value: parseFloat(player.value || '0'),
            rank: index + 1,
            additionalData: {
               gamesPlayed: player.gamesPlayed,
               label: 'Total Profit',
            },
         }));
      }

      case 'most-active-player': {
         const userResults = await db
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
            .where(userWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .orderBy(desc(sql<number>`count(distinct ${gamePlayers.gameId})`));

         return userResults.map((player: any, index: number) => ({
            userId: player.userId,
            fullName: player.fullName,
            profileImageUrl: player.profileImageUrl,
            value: parseInt(player.value || '0', 10),
            rank: index + 1,
            additionalData: {
               totalProfit: parseFloat(player.totalProfit || '0'),
               label: 'Games Played',
            },
         }));
      }

      case 'highest-single-game-profit': {
         const userResults = await db
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
            .where(userWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`max(${gamePlayers.profit}) IS NOT NULL`)
            .orderBy(desc(max(gamePlayers.profit)));

         return userResults.map((player: any, index: number) => ({
            userId: player.userId,
            fullName: player.fullName,
            profileImageUrl: player.profileImageUrl,
            value: parseFloat(player.value || '0'),
            rank: index + 1,
            additionalData: {
               gamesPlayed: player.gamesPlayed,
               label: 'Best Single Game',
            },
         }));
      }

      case 'most-consistent-player': {
         // Calculate consistency as lowest standard deviation of profits
         const userResults = await db
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
            .where(userWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`count(distinct ${gamePlayers.gameId}) >= 3`) // At least 3 games for consistency
            .orderBy(sql`stddev(${gamePlayers.profit}) ASC`); // Lower stddev = more consistent

         return userResults.map((player: any, index: number) => ({
            userId: player.userId,
            fullName: player.fullName,
            profileImageUrl: player.profileImageUrl,
            value: parseFloat(player.value || '0'),
            rank: index + 1,
            additionalData: {
               avgProfit: parseFloat(player.avgProfit || '0'),
               gamesPlayed: player.gamesPlayed,
               label: 'Consistency Score',
            },
         }));
      }

      case 'biggest-loser': {
         const userResults = await db
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
            .where(userWhere)
            .groupBy(users.id, users.fullName, users.profileImageUrl)
            .having(sql`sum(${gamePlayers.profit}) IS NOT NULL`)
            .orderBy(sum(gamePlayers.profit)); // ASC for biggest loss (most negative)

         return userResults.map((player: any, index: number) => {
            const val = parseFloat(player.value || '0');
            return {
               userId: player.userId,
               fullName: player.fullName,
               profileImageUrl: player.profileImageUrl,
               value: Math.abs(val), // Return absolute value for display
               rank: index + 1,
               additionalData: {
                  gamesPlayed: player.gamesPlayed,
                  actualLoss: val, // Keep the actual negative value
                  label: 'Total Loss',
               },
            };
         });
      }

      default:
         throw new Error(`Unsupported stat type: ${statType}`);
   }
}
