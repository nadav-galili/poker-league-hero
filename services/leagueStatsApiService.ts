import {
   cashIns,
   Game,
   gamePlayers,
   games,
   getDb,
   leagueMembers,
   users,
} from '@/db';
import { secureResponse } from '@/utils/rateLimiting';
import dayjs from 'dayjs';
import { and, desc, eq, exists, gte, lte, sql, sum } from 'drizzle-orm';

type GeneralLeagueStats = {
   totalGames: number;
   activeGames: number;
   completedGames: number;
   totalPlayers: number;
   totalProfit: string;
   totalBuyIns: number;
   totalBuyOuts: number;
   totalGamesPlayed: number;
   gamesWon: number;
   gamesLost: number;
   gamesTied: number;
   totalCashInAmount: string;
   avgProfit: number;
   averageGameDuration: number;
};

export async function getGeneralLeagueStats(leagueId: string, year: number) {
   const db = getDb();
   const yearStart = dayjs().year(year).startOf('year').toDate();
   const yearEnd = dayjs().year(year).endOf('year').toDate();

   try {
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

      const totalPlayersResult = await db
         .select({ count: sql<number>`count(*)` })
         .from(leagueMembers)
         .where(
            and(
               eq(leagueMembers.leagueId, parseInt(leagueId)),
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
               eq(games.leagueId, parseInt(leagueId)),
               eq(games.status, 'completed'),
               gte(games.endedAt, yearStart),
               lte(games.endedAt, yearEnd)
            )
         );

      let averageGameDuration = 0;
      if (completedGamesResult[0]?.count > 0) {
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
            const durations = completedGames
               .filter((game: Game) => game.endedAt !== null)
               .map((game: Game) => {
                  const startTime = new Date(game.startedAt).getTime();
                  const endTime = new Date(game.endedAt!).getTime();
                  const durationMs = endTime - startTime;
                  const durationMinutes = Math.round(durationMs / (1000 * 60));
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

      const sanitizedStats = {
         totalGames: Math.max(0, stats.totalGames),
         activeGames: Math.max(0, stats.activeGames),
         completedGames: Math.max(0, stats.completedGames),
         totalPlayers: Math.max(0, stats.totalPlayers),
         totalProfit: stats.totalProfit,
         totalBuyIns: Math.max(0, stats.totalBuyIns),
         totalBuyOuts: Math.max(0, stats.totalBuyOuts),
         averageGameDuration: Math.max(0, stats.averageGameDuration),
      };

      return secureResponse({
         stats: sanitizedStats,
         year: year,
      });
   } catch (error) {
      console.error('Error fetching general league stats:', error);
      return secureResponse(
         { error: 'Failed to fetch league statistics' },
         { status: 500 }
      );
   }
}

export async function getLeagueStatsForAi(leagueId: string) {
   const db = getDb();

   // Get detailed stats for all league members
   const memberStats = await db
      .select({
         userId: users.id,
         fullName: users.fullName,
         email: users.email,
         profileImageUrl: users.profileImageUrl,
         // Game participation stats
         totalGamesPlayed: sql<number>`COUNT(DISTINCT ${gamePlayers.gameId})`,
         totalCashIns: sql<number>`COUNT(${cashIns.id})`,
         totalCashInAmount: sql<string>`COALESCE(SUM(${cashIns.amount}), 0)`,
         totalProfit: sql<string>`COALESCE(SUM(${gamePlayers.profit}), 0)`,
         avgProfit: sql<string>`COALESCE(AVG(${gamePlayers.profit}), 0)`,
         biggestWin: sql<string>`COALESCE(MAX(${gamePlayers.profit}), 0)`,
         biggestLoss: sql<string>`COALESCE(MIN(${gamePlayers.profit}), 0)`,
         // Cash-in breakdown
         buyInCount: sql<number>`COUNT(CASE WHEN ${cashIns.type} = 'buy_in' THEN 1 END)`,
         rebuyCount: sql<number>`COUNT(CASE WHEN ${cashIns.type} = 'rebuy' THEN 1 END)`,
         addOnCount: sql<number>`COUNT(CASE WHEN ${cashIns.type} = 'add_on' THEN 1 END)`,
         avgBuyIn: sql<string>`COALESCE(AVG(CASE WHEN ${cashIns.type} = 'buy_in' THEN ${cashIns.amount} END), 0)`,
         // Win rate
         gamesWon: sql<number>`COUNT(CASE WHEN ${gamePlayers.profit} > 0 THEN 1 END)`,
         gamesLost: sql<number>`COUNT(CASE WHEN ${gamePlayers.profit} < 0 THEN 1 END)`,
         gamesTied: sql<number>`COUNT(CASE WHEN ${gamePlayers.profit} = 0 THEN 1 END)`,
      })
      .from(leagueMembers)
      .innerJoin(users, eq(leagueMembers.userId, users.id))
      .leftJoin(
         gamePlayers,
         and(
            eq(gamePlayers.userId, users.id),
            exists(
               db
                  .select()
                  .from(games)
                  .where(
                     and(
                        eq(games.id, gamePlayers.gameId),
                        eq(games.leagueId, parseInt(leagueId))
                     )
                  )
            )
         )
      )
      .leftJoin(cashIns, eq(cashIns.gamePlayerId, gamePlayers.id))
      .where(
         and(
            eq(leagueMembers.leagueId, parseInt(leagueId)),
            eq(leagueMembers.isActive, true)
         )
      )
      .groupBy(users.id, users.fullName, users.email, users.profileImageUrl);

   // Get league overview stats
   const leagueOverview = await db
      .select({
         totalGames: sql<number>`COUNT(DISTINCT ${games.id})`,
         totalPlayers: sql<number>`COUNT(DISTINCT ${leagueMembers.userId})`,
         totalCashFlow: sql<string>`COALESCE(SUM(${cashIns.amount}), 0)`,
         avgGameBuyIn: sql<string>`COALESCE(AVG(${games.buyIn}), 0)`,
         activeGames: sql<number>`COUNT(CASE WHEN ${games.status} = 'active' THEN 1 END)`,
         completedGames: sql<number>`COUNT(CASE WHEN ${games.status} = 'completed' THEN 1 END)`,
      })
      .from(games)
      .leftJoin(cashIns, eq(cashIns.gameId, games.id))
      .leftJoin(leagueMembers, eq(leagueMembers.leagueId, games.leagueId))
      .where(eq(games.leagueId, parseInt(leagueId)));

   // Get recent games with player details
   const recentGames = await db
      .select({
         gameId: games.id,
         buyIn: games.buyIn,
         status: games.status,
         startedAt: games.startedAt,
         endedAt: games.endedAt,
         playerCount: sql<number>`COUNT(DISTINCT ${gamePlayers.userId})`,
         totalPot: sql<string>`COALESCE(SUM(${cashIns.amount}), 0)`,
         biggestWinner: sql<string>`MAX(${gamePlayers.profit})`,
         biggestLoser: sql<string>`MIN(${gamePlayers.profit})`,
      })
      .from(games)
      .leftJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
      .leftJoin(cashIns, eq(cashIns.gameId, games.id))
      .where(eq(games.leagueId, parseInt(leagueId)))
      .groupBy(
         games.id,
         games.buyIn,
         games.status,
         games.startedAt,
         games.endedAt
      )
      .orderBy(desc(games.startedAt))
      .limit(10);

   return {
      memberStats: memberStats.map((stat: GeneralLeagueStats) => ({
         ...stat,
         winRate:
            stat.totalGamesPlayed > 0
               ? ((stat.gamesWon / stat.totalGamesPlayed) * 100).toFixed(1)
               : '0.0',
         roi:
            parseFloat(stat.totalCashInAmount) > 0
               ? (
                    (parseFloat(stat.totalProfit) /
                       parseFloat(stat.totalCashInAmount)) *
                    100
                 ).toFixed(1)
               : '0.0',
      })),
      leagueOverview: leagueOverview[0] || {},
      recentGames,
   };
}
