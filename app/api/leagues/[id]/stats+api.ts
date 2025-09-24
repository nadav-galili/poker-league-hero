import { withAuth } from '@/utils/middleware';
import { type Game } from '../../../../db';

export const GET = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const leagueId = url.pathname.split('/')[3]; // Extract leagueId from /api/leagues/[id]/stats

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

      // Import database modules
      const { getDb, leagues, games, gamePlayers, cashIns, users } =
         await import('../../../../db');
      const { eq, count, desc, sql } = await import('drizzle-orm');
      const db = getDb();

      // Verify league exists
      const leagueResult = await db
         .select({ id: leagues.id })
         .from(leagues)
         .where(eq(leagues.id, parseInt(leagueId)))
         .limit(1);

      if (leagueResult.length === 0) {
         return Response.json({ error: 'League not found' }, { status: 404 });
      }

      // Get all games for this league
      const gamesResult = await db
         .select({
            id: games.id,
            status: games.status,
            startedAt: games.startedAt,
            endedAt: games.endedAt,
         })
         .from(games)
         .where(eq(games.leagueId, parseInt(leagueId)));
      console.log('🚀 ~ gamesResult:', gamesResult);

      // Calculate game statistics
      const totalGames = gamesResult.length;
      const activeGames = gamesResult.filter(
         (g: Game) => g.status === 'active'
      ).length;
      const completedGamesArray = gamesResult.filter(
         (g: Game) => g.status === 'completed'
      );
      const completedGames = completedGamesArray.length;

      // Calculate average game duration for completed games
      let averageGameDuration = 0;
      if (completedGames > 0) {
         const totalDuration = completedGamesArray.reduce(
            (sum: number, game: Game) => {
               if (game.startedAt && game.endedAt) {
                  const start = new Date(game.startedAt);
                  const end = new Date(game.endedAt);
                  return sum + (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
               }
               return sum;
            },
            0
         );
         averageGameDuration = Math.round(totalDuration / completedGames);
      }

      // Get all cash transactions for this league
      const cashTransactions = await db
         .select({
            amount: cashIns.amount,
            type: cashIns.type,
            gameId: cashIns.gameId,
         })
         .from(cashIns)
         .innerJoin(games, eq(cashIns.gameId, games.id))
         .where(eq(games.leagueId, parseInt(leagueId)));

      // Calculate financial statistics
      const totalBuyIns = cashTransactions
         .filter((t: any) => t.type === 'buy_in')
         .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const totalBuyOuts = cashTransactions
         .filter((t: any) => t.type === 'buy_out')
         .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const totalProfit = totalBuyOuts - totalBuyIns;

      // Get unique players count
      const uniquePlayers = await db
         .select({ userId: gamePlayers.userId })
         .from(gamePlayers)
         .innerJoin(games, eq(gamePlayers.gameId, games.id))
         .where(eq(games.leagueId, parseInt(leagueId)))
         .groupBy(gamePlayers.userId);

      const totalPlayers = uniquePlayers.length;

      // Find most profitable player
      const playerProfits = await db
         .select({
            userId: gamePlayers.userId,
            fullName: users.fullName,
            profit: sql<number>`COALESCE(SUM(CASE WHEN ${cashIns.type} = 'buy_out' THEN ${cashIns.amount}::numeric ELSE 0 END) - SUM(CASE WHEN ${cashIns.type} = 'buy_in' THEN ${cashIns.amount}::numeric ELSE 0 END), 0)`,
         })
         .from(gamePlayers)
         .innerJoin(games, eq(gamePlayers.gameId, games.id))
         .innerJoin(users, eq(gamePlayers.userId, users.id))
         .innerJoin(cashIns, eq(gamePlayers.id, cashIns.gamePlayerId))
         .where(eq(games.leagueId, parseInt(leagueId)))
         .groupBy(gamePlayers.userId, users.fullName)
         .orderBy(
            desc(
               sql<number>`COALESCE(SUM(CASE WHEN ${cashIns.type} = 'buy_out' THEN ${cashIns.amount}::numeric ELSE 0 END) - SUM(CASE WHEN ${cashIns.type} = 'buy_in' THEN ${cashIns.amount}::numeric ELSE 0 END), 0)`
            )
         )
         .limit(1);

      // Find most active player
      const playerActivity = await db
         .select({
            userId: gamePlayers.userId,
            fullName: users.fullName,
            gamesPlayed: count(),
         })
         .from(gamePlayers)
         .innerJoin(games, eq(gamePlayers.gameId, games.id))
         .innerJoin(users, eq(gamePlayers.userId, users.id))
         .where(eq(games.leagueId, parseInt(leagueId)))
         .groupBy(gamePlayers.userId, users.fullName)
         .orderBy(desc(count()))
         .limit(1);

      const stats = {
         totalGames: totalGames || 0,
         totalProfit: Number(totalProfit) || 0,
         totalBuyIns: Number(totalBuyIns) || 0,
         totalBuyOuts: Number(totalBuyOuts) || 0,
         activeGames: activeGames || 0,
         completedGames: completedGames || 0,
         totalPlayers: totalPlayers || 0,
         averageGameDuration: averageGameDuration || 0,
         mostProfitablePlayer: playerProfits[0]
            ? {
                 name: playerProfits[0].fullName,
                 profit: Number(playerProfits[0].profit) || 0,
              }
            : { name: 'N/A', profit: 0 },
         mostActivePlayer: playerActivity[0]
            ? {
                 name: playerActivity[0].fullName,
                 gamesPlayed: Number(playerActivity[0].gamesPlayed) || 0,
              }
            : { name: 'N/A', gamesPlayed: 0 },
      };
      console.log('🚀 ~ stats:', stats);

      return Response.json({
         success: true,
         stats,
      });
   } catch (error) {
      console.error('Error fetching league stats:', error);
      return Response.json(
         { error: 'Failed to fetch league stats' },
         { status: 500 }
      );
   }
});
