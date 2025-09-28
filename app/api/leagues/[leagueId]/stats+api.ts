import { withAuth } from '@/utils/middleware';
import dayjs from 'dayjs';
import { and, avg, desc, eq, gte, lte, max, sql, sum } from 'drizzle-orm';
import {
   cashIns,
   Game,
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

export const GET = withAuth(async (request: Request, user) => {
   const url = new URL(request.url);
   const leagueId = url.pathname.split('/')[3]; // Extract leagueId from path
   const statType = url.searchParams.get('type') as StatType;
   const year = url.searchParams.get('year');

   try {
      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!leagueId) {
         return Response.json(
            { error: 'League ID is required' },
            { status: 400 }
         );
      }

      // Get year boundaries (default to current year)
      const targetYear = year ? parseInt(year) : dayjs().year();

      // If no statType is provided, return general league stats
      if (!statType) {
         return getGeneralLeagueStats(leagueId, targetYear);
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
               eq(games.leagueId, parseInt(leagueId)),
               eq(games.status, 'completed'),
               gte(games.endedAt, yearStart),
               lte(games.endedAt, yearEnd)
            )
         );

      if (!gamesCount[0]?.count || gamesCount[0].count === 0) {
         return Response.json({
            type: statType,
            year: targetYear,
            message: 'No completed games found for this year',
            data: null,
         });
      }

      // Calculate the requested stat
      const result = await calculateStat(
         db,
         leagueId,
         statType,
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

      return Response.json({
         type: statType,
         year: targetYear,
         data: result,
      });
   } catch (error) {
      console.error(`Error fetching ${statType} stat:`, error);
      return Response.json(
         {
            error: `Failed to fetch ${statType} stat`,
            details: error instanceof Error ? error.message : 'Unknown error',
         },
         { status: 500 }
      );
   }
});

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

   const baseWhere = and(
      eq(games.leagueId, leagueId),
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
                  eq(leagueMembers.leagueId, leagueId)
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
                  eq(leagueMembers.leagueId, leagueId)
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
                  eq(leagueMembers.leagueId, leagueId)
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
                  eq(leagueMembers.leagueId, leagueId)
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

// Function to get general league statistics (when no statType is provided)
async function getGeneralLeagueStats(leagueId: string, year: number) {
   const db = getDb();

   // Get year boundaries
   const yearStart = dayjs().year(year).startOf('year').toDate(); // January 1st
   const yearEnd = dayjs().year(year).endOf('year').toDate(); // December 31st

   try {
      // Get total games for the year
      const totalGamesResult = await db
         .select({ count: sql<number>`count(*)` })
         .from(games)
         .where(
            and(
               eq(games.leagueId, parseInt(leagueId)),
               gte(games.startedAt, yearStart),
               lte(games.startedAt, yearEnd)
            )
         );

      // Get active games
      const activeGamesResult = await db
         .select({ count: sql<number>`count(*)` })
         .from(games)
         .where(
            and(
               eq(games.leagueId, parseInt(leagueId)),
               eq(games.status, 'active'),
               gte(games.startedAt, yearStart),
               lte(games.startedAt, yearEnd)
            )
         );

      // Get completed games
      const completedGamesResult = await db
         .select({ count: sql<number>`count(*)` })
         .from(games)
         .where(
            and(
               eq(games.leagueId, parseInt(leagueId)),
               eq(games.status, 'completed'),
               gte(games.startedAt, yearStart),
               lte(games.startedAt, yearEnd)
            )
         );

      // Get total players in the league
      const totalPlayersResult = await db
         .select({ count: sql<number>`count(*)` })
         .from(leagueMembers)
         .where(
            and(
               eq(leagueMembers.leagueId, parseInt(leagueId)),
               eq(leagueMembers.isActive, true)
            )
         );

      // Get total profit/loss from completed games
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
               eq(games.leagueId, parseInt(leagueId)),
               eq(games.status, 'completed'),
               gte(games.endedAt, yearStart),
               lte(games.endedAt, yearEnd)
            )
         );

      // Calculate average game duration for completed games
      let averageGameDuration = 0;
      if (completedGamesResult[0]?.count > 0) {
         // Get the completed games with their start and end times
         const completedGames = await db
            .select({
               id: games.id,
               startedAt: games.startedAt,
               endedAt: games.endedAt,
            })
            .from(games)
            .where(
               and(
                  eq(games.leagueId, parseInt(leagueId)),
                  eq(games.status, 'completed'),
                  gte(games.endedAt, yearStart),
                  lte(games.endedAt, yearEnd)
               )
            );

         if (completedGames.length > 0) {
            // Calculate duration in JavaScript for more control
            const durations = completedGames
               .filter((game: Game) => game.endedAt !== null) // Only games with end time
               .map((game: Game) => {
                  const startTime = new Date(game.startedAt).getTime();
                  const endTime = new Date(game.endedAt!).getTime();
                  const durationMs = endTime - startTime;
                  const durationMinutes = Math.round(durationMs / (1000 * 60));

                  // Ensure we don't have negative durations due to data issues
                  return Math.max(0, durationMinutes);
               });

            if (durations.length > 0) {
               averageGameDuration = Math.round(
                  durations.reduce(
                     (sum: number, duration: number) => sum + duration,
                     0
                  ) / durations.length
               );
            }
         }
      }

      const stats = {
         totalGames: totalGamesResult[0]?.count || 0,
         activeGames: activeGamesResult[0]?.count || 0,
         completedGames: completedGamesResult[0]?.count || 0,
         totalPlayers: totalPlayersResult[0]?.count || 0,
         totalProfit:
            (profitResult[0]?.totalBuyOuts || 0) -
            (profitResult[0]?.totalBuyIns || 0),
         totalBuyIns: profitResult[0]?.totalBuyIns || 0,
         totalBuyOuts: profitResult[0]?.totalBuyOuts || 0,
         averageGameDuration: averageGameDuration,
      };

      return Response.json({
         stats: stats,
         year: year,
      });
   } catch (error) {
      console.error('Error fetching general league stats:', error);
      return Response.json(
         {
            error: 'Failed to fetch league statistics',
            details: error instanceof Error ? error.message : 'Unknown error',
         },
         { status: 500 }
      );
   }
}
